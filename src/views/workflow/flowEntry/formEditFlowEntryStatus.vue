<template>
  <div class="form-single-fragment" style="position: relative;">
    <el-form ref="form" :model="formData" class="full-width-input" :rules="rules" style="width: 100%;"
      label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="状态显示名" prop="name">
            <el-input class="input-item" v-model="formData.name"
              :clearable="true" placeholder="状态显示名" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="状态标识" prop="id">
            <el-input-number class="input-item" v-model="formData.id"
              clearable :controls="false" :step-strictly="true" placeholder="状态标识" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-row class="no-scroll flex-box" type="flex" justify="end">
            <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
              取消
            </el-button>
            <el-button type="primary" :size="defaultFormItemSize"
              @click="onSubmit()">
              保存
            </el-button>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { FlowEntryController } from '@/api/flowController.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
export default {
  name: 'formEditFlowEntryStatus',
  mixins: [thirdPartyMixin],
  props: {
    rowData: {
      type: Object
    },
    flowEntry: {
      type: Object,
      required: true
    },
    usedVariableList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      bindColumnPath: [],
      formData: {
        name: undefined,
        id: undefined
      },
      rules: {
        id: [
          {required: true, message: '状态标识不能为空！', trigger: 'blur'}
        ],
        name: [
          {required: true, message: '状态显示名不能为空！', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    onCancel (isSuccess, approvalStatusDict) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, approvalStatusDict);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, undefined, approvalStatusDict);
      }
    },
    onSubmit () {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        if (this.dialogParams.usedVariableList.indexOf(this.formData.id) !== -1) {
          this.$message.error('状态标识已存在！');
          return;
        }

        // 合并状态
        let approvalStatusDict = [];
        if (this.isEdit) {
          approvalStatusDict = this.dialogParams.flowEntry.extensionData.approvalStatusDict.map(item => {
            return item.name === this.rowData.name ? this.formData : item;
          });
        } else {
          approvalStatusDict = [...this.dialogParams.flowEntry.extensionData.approvalStatusDict];
          approvalStatusDict.push(this.formData);
        }
        let params = {
          flowEntryDto: {
            ...this.dialogParams.flowEntry,
            extensionData: JSON.stringify({
              approvalStatusDict,
              notifyTypes: this.dialogParams.flowEntry.notifyTypes
            })
          }
        }
        
        FlowEntryController.update(this, params).then(res => {
          this.$message.success('保存成功！');
          this.onCancel(true, approvalStatusDict);
        }).catch(e => {
          console.log(e);
        });
      });
    }
  },
  computed: {
    dialogParams () {
      return {
        flowEntry: this.flowEntry || this.thirdParams.flowEntry,
        usedVariableList: this.usedVariableList || this.thirdParams.usedVariableList,
        rowData: this.rowData || this.thirdParams.rowData
      }
    },
    isEdit () {
      return this.rowData != null;
    },
    approvalStatusDict () {
      return this.dialogParams.flowEntry.extensionData.approvalStatusDict.map(item => item.id);
    }
  },
  mounted () {
    if (this.dialogParams.rowData != null) {
      this.formData = {
        ...this.formData,
        ...this.dialogParams.rowData
      }
    }
  }
}
</script>

<style>
</style>
