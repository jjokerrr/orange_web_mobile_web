<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <el-form ref="formEditOnlinePageDatasource" :model="formData" class="full-width-input form-box" :rules="rules" style="width: 100%;"
      label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="数据源名称" prop="datasourceName">
            <el-input class="input-item" v-model="formData.datasourceName"
              :clearable="true" placeholder="数据源名称" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="数据源标识" prop="variableName">
            <el-input class="input-item" v-model="formData.variableName"
              :clearable="true" placeholder="数据源标识" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="!isEdit">
          <el-form-item label="数据源主表" prop="masterTableId">
            <el-cascader v-model="masterTablePath"
              filterable
              :disabled="isEdit"
              :props="masterTableProps"
              @change="onMasterTableChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-else>
          <el-form-item label="数据源主表">
            <el-input class="input-item" v-model="(masterTableIdDictMap || {}).name" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="menu-box">
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
  </div>
</template>

<script>
import { OnlineDatasourceController, OnlineDblinkController } from '@/api/onlineController.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';

export default {
  name: 'formEditOnlinePageDatasource',
  props: {
    pageId: {
      type: String
    },
    datasourceId: {
      type: String,
      default: undefined
    },
    dblinkInfo: {
      type: Object
    }
  },
  mixins: [thirdPartyMixin],
  data () {
    return {
      masterTableIdDictMap: {},
      formData: {
        datasourceId: undefined,
        datasourceName: undefined,
        variableName: undefined,
        dblinkId: undefined,
        masterTableId: undefined
      },
      masterTablePath: [],
      rules: {
        datasourceName: [
          {required: true, message: '数据源名称不能为空！', trigger: 'blur'}
        ],
        variableName: [
          {required: true, message: '数据源标识不能为空！', trigger: 'blur'},
          {type: 'string', pattern: /^[a-z][a-zA-Z]+$/, message: '数据源标识必须是小驼峰命名', trigger: 'blur'}
        ],
        masterTableId: [
          {required: true, message: '数据源主表不能为空！', trigger: 'blur'}
        ]
      },
      masterTableProps: {
        lazy: true,
        lazyLoad: this.loadMasterTableData
      }
    }
  },
  methods: {
    onCancel (isSuccess) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path);
      }
    },
    onSubmit () {
      this.$refs.formEditOnlinePageDatasource.validate((valid) => {
        if (!valid) return;

        let params = {
          pageId: this.dialogParams.pageId,
          onlineDatasourceDto: {
            datasourceId: this.formData.datasourceId,
            datasourceName: this.formData.datasourceName,
            variableName: this.formData.variableName,
            dblinkId: this.formData.dblinkId,
            masterTableName: this.formData.masterTableId,
            masterTableId: this.isEdit ? this.formData.masterTableId : undefined
          }
        }

        let httpCall = this.isEdit ? OnlineDatasourceController.update(this, params) : OnlineDatasourceController.add(this, params);
        httpCall.then(res => {
          this.$message.success('保存成功');
          this.onCancel(true);
        }).catch(e => {});
      });
    },
    onMasterTableChange (values) {
      this.formData.dblinkId = values[0];
      this.formData.masterTableId = values[1];
    },
    /**
     * 获取字典表级联数据
     */
    loadMasterTableData (node, resolve) {
      if (node.level === 0) {
        // 获取dblink信息
        if (this.thirdParams.dblinkInfo == null) {
          OnlineDblinkController.list(this, {}).then(res => {
            resolve(res.data.dataList.map(item => {
              return {
                value: item.dblinkId,
                label: item.dblinkName,
                leaf: false
              }
            }));
          }).catch(e => {
            node.loaded = false;
            node.loading = false;
          });
        } else {
          resolve(Object.keys(this.thirdParams.dblinkInfo).map(key => {
            let dblinkItem = this.thirdParams.dblinkInfo[key];
            return {
              value: dblinkItem.dblinkId,
              label: dblinkItem.dblinkName,
              leaf: false
            }
          }));
        }
      } else if (node.level === 1) {
        OnlineDblinkController.listDblinkTables(this, {
          dblinkId: node.data.value
        }).then(res => {
          resolve(res.data.map(item => {
            return {
              value: item.tableName,
              label: item.tableName,
              leaf: true
            }
          }));
        }).catch(e => {
          node.loaded = false;
          node.loading = false;
        });
      }
    }
  },
  computed: {
    dialogParams () {
      return {
        pageId: this.pageId || this.thirdParams.pageId,
        datasourceId: this.datasourceId || this.thirdParams.datasourceId,
        dblinkInfo: this.dblinkInfo || this.thirdParams.dblinkInfo
      }
    },
    isEdit () {
      return this.dialogParams.datasourceId != null && this.dialogParams.datasourceId !== '';
    }
  },
  mounted () {
    if (this.dialogParams.datasourceId != null) {
      OnlineDatasourceController.view(this, {
        datasourceId: this.dialogParams.datasourceId
      }).then(res => {
        this.formData.datasourceId = res.data.datasourceId;
        this.formData.datasourceName = res.data.datasourceName;
        this.formData.dblinkId = res.data.dblinkId;
        this.formData.masterTableId = res.data.masterTableId;
        this.formData.variableName = res.data.variableName;
        this.masterTablePath = [this.formData.dblinkId, this.formData.masterTableId];
        this.masterTableIdDictMap = res.data.masterTableIdDictMap;
      }).catch(e => {});
    }
  }
}
</script>

<style>
</style>
