<template>
  <div class="form-single-fragment" style="position: relative;">
    <el-form ref="formEditSysDept" :model="formData" :rules="rules" style="width: 100%;"
      label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="部门名称" prop="SysDept.deptName">
            <el-input class="input-item" v-model="formData.SysDept.deptName"
              :clearable="true" placeholder="部门名称" maxlength="30" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="显示顺序" prop="SysDept.showOrder">
            <el-input-number class="input-item" v-model="formData.SysDept.showOrder"
              :clearable="true" controls-position="right" placeholder="显示顺序" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-row type="flex" justify="end">
            <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
              取消
            </el-button>
            <el-button type="primary" :size="defaultFormItemSize" @click="onUpdateClick()"
              :disabled="!(checkPermCodeExist('formSysDept:fragmentSysDept:update') || checkPermCodeExist('formSysDept:fragmentSysDept:add'))">
              保存
            </el-button>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
/* eslint-disable-next-line */
import { DropdownWidget, TableWidget, UploadWidget, ChartWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachedPageChildMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { SysDeptController, DictionaryController } from '@/api';

export default {
  name: 'formEditSysDept',
  props: {
    deptId: {
      default: undefined
    }
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachedPageChildMixin],
  data () {
    return {
      formData: {
        SysDept: {
          deptId: undefined,
          deptName: undefined,
          showOrder: undefined,
          deletedFlag: undefined
        }
      },
      rules: {
        'SysDept.deptName': [
          {required: true, message: '请输入部门名称', trigger: 'blur'}
        ],
        'SysDept.showOrder': [
          {required: true, message: '请输入显示顺序', trigger: 'blur'}
        ]
      },
      formEditSysDept: {
        formFilter: {
        },
        formFilterCopy: {
        },
        isInit: false
      }
    }
  },
  methods: {
    onCancel (isSuccess) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess);
      }
    },
    /**
     * 编辑
     */
    onUpdateClick () {
      this.$refs.formEditSysDept.validate((valid) => {
        if (!valid) return;
        let params = {
          sysDeptDto: {
            deptName: this.formData.SysDept.deptName,
            showOrder: this.formData.SysDept.showOrder,
            deptId: this.deptId
          }
        };
        if (this.isEdit) {
          SysDeptController.update(this, params).then(res => {
            this.$message.success('编辑成功');
            this.onCancel(true);
          }).catch(e => {});
        } else {
          SysDeptController.add(this, params).then(res => {
            this.$message.success('新建成功');
            this.onCancel(true);
          }).catch(e => {});
        }
      });
    },
    /**
     * 获取部门管理详细信息
     */
    loadSysDeptData () {
      if (!this.isEdit) return;
      let params = {
        deptId: this.deptId
      };

      return new Promise((resolve, reject) => {
        SysDeptController.view(this, params).then(res => {
          this.formData.SysDept = {...res.data};
          resolve();
        }).catch(e => {
          reject();
        });
      });
    },
    initFormData () {
    },
    formInit () {
      let loadAllDatasource = [
        this.loadSysDeptData()
      ];
      Promise.all(loadAllDatasource).then(res => {
        this.initFormData();
      }).catch(e => {});
    }
  },
  computed: {
    isEdit () {
      return this.deptId != null;
    }
  },
  created () {
    this.formInit();
  }
}
</script>
