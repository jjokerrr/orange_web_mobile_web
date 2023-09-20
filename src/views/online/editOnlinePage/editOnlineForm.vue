<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <el-form ref="form" :model="formData" class="full-width-input form-box" :rules="rules" style="width: 100%;"
      label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="表单编码" prop="formCode">
            <el-input class="input-item" v-model="formData.formCode"
              :clearable="true" placeholder="表单编码" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="表单名称" prop="formName">
            <el-input class="input-item" v-model="formData.formName"
              :clearable="true" placeholder="表单名称" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="表单类型" prop="formType">
            <el-select class="input-item" v-model="formData.formType"
              placeholder="表单类型" :disabled="isEdit"
              @change="onFormTypeChange"
            >
              <el-option v-for="item in getValidFormType" :key="item.id" :value="item.id" :label="item.name" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="表单数据" prop="masterTableId">
            <el-select class="input-item" v-model="formData.masterTableId" :clearable="true"
              placeholder="表单数据" :disabled="isEdit">
              <el-option v-for="item in getValidTableList" :key="item.tableId" :value="item.tableId" :label="item.tableName">
                <el-row type="flex" justify="space-between" align="middle">
                  <span>{{item.tableName}}</span>
                  <el-tag :size="defaultFormItemSize" :type="getDatasourceTableTagType(item.relationType)" effect="dark"
                    style="margin-left: 30px;"
                  >
                    {{getDatasourceTableTagName(item.relationType)}}
                  </el-tag>
                </el-row>
              </el-option>
            </el-select>
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
import { OnlineFormController } from '@/api/onlineController.js';
import { getFormConfig } from '../OnlineFormConfig/index.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';

export default {
  props: {
    pageId: {
      type: String
    },
    pageType: {
      type: Number
    },
    datasourceTableList: {
      type: Array
    },
    datasourceId: {
      type: String
    },
    form: {
      type: Object
    }
  },
  mixins: [thirdPartyMixin],
  data () {
    return {
      formData: {
        formId: undefined,
        formCode: undefined,
        formName: undefined,
        formKind: this.SysOnlineFormKind.PAGE,
        formType: undefined,
        masterTableId: undefined
      },
      rules: {
        formCode: [
          {required: true, message: '表单编码不能为空', trigger: true},
          {type: 'string', pattern: /^[A-Za-z0-9]+$/, message: '表单编码只允许输入字母和数字', trigger: 'blur'}
        ],
        formName: [
          {required: true, message: '表单名称不能为空', trigger: true}
        ],
        masterTableId: [
          {required: true, message: '请选择表单数据', trigger: true}
        ]
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
      let params = {
        onlineFormDto: {
          ...this.formData,
          pageId: this.dialogParams.pageId,
          widgetJson: this.isEdit ? this.formData.widgetJson : JSON.stringify(getFormConfig(this.formData.formType, this.pageType)),
          paramsJson: this.isEdit ? this.formData.paramsJson : JSON.stringify([]),
          datasourceIdList: [this.dialogParams.datasourceId]
        }
      }

      let httpCall = this.isEdit ? OnlineFormController.update(this, params) : OnlineFormController.add(this, params);
      httpCall.then(res => {
        this.$message.success('保存成功');
        this.onCancel(true);
      }).catch(e => {});
    },
    getDatasourceTableTagType (relationType) {
      if (relationType == null) return 'success';
      switch (relationType) {
        case this.SysOnlineRelationType.ONE_TO_ONE: return 'primary';
        case this.SysOnlineRelationType.ONE_TO_MANY: return 'warning';
        default:
          return 'info';
      }
    },
    getDatasourceTableTagName (relationType) {
      if (relationType == null) return '数据主表';
      return this.SysOnlineRelationType.getValue(relationType) || '未知类型';
    },
    onFormTypeChange (val) {
      if (this.dialogParams.pageType === this.SysOnlinePageType.FLOW) {
        this.formData.formKind = val === this.SysOnlineFormType.FORM ? this.SysOnlineFormKind.DIALOG : this.SysOnlineFormKind.PAGE;
      }
    }
  },
  computed: {
    dialogParams () {
      return {
        pageId: this.pageId || this.thirdParams.pageId,
        pageType: this.pageType || this.thirdParams.pageType,
        datasourceTableList: this.datasourceTableList || this.thirdParams.datasourceTableList,
        datasourceId: this.datasourceId || this.thirdParams.datasourceId,
        form: this.form || this.thirdParams.form
      }
    },
    isEdit () {
      return this.dialogParams.form != null;
    },
    getValidFormType () {
      return this.SysOnlineFormType.getList().filter(item => {
        if (item.id === this.SysOnlineFormType.FLOW) {
          return this.dialogParams.pageType === this.SysOnlinePageType.FLOW;
        } else if (item.id === this.SysOnlineFormType.QUERY || item.id === this.SysOnlineFormType.ADVANCE_QUERY) {
          return this.dialogParams.pageType !== this.SysOnlinePageType.FLOW;
        } else if (item.id === this.SysOnlineFormType.WORK_ORDER) {
          return this.dialogParams.pageType === this.SysOnlinePageType.FLOW;
        } else if (item.id === this.SysOnlineFormType.REPORT) {
          return false;
        } else {
          return true;
        }
      });
    },
    getValidTableList () {
      return this.dialogParams.datasourceTableList.filter(item => {
        switch (this.formData.formType) {
          // 工单列表页面和工作流流程页面，只能选择主表
          case this.SysOnlineFormType.FLOW:
          case this.SysOnlineFormType.WORK_ORDER:
            return item.relationType == null;
          // 流程编辑页面只支持一对多从表，普通编辑页面只支持主表和一对多从表
          case this.SysOnlineFormType.FORM:
            return this.dialogParams.pageType === this.SysOnlinePageType.FLOW ? item.relationType === this.SysOnlineRelationType.ONE_TO_MANY : (item.relationType == null || item.relationType === this.SysOnlineRelationType.ONE_TO_MANY);
          // 查询页面可以选择主表或者一对多从表
          case this.SysOnlineFormType.QUERY:
          case this.SysOnlineFormType.ADVANCE_QUERY:
            return item.relationType == null || item.relationType === this.SysOnlineRelationType.ONE_TO_MANY;
          case this.SysOnlineFormType.ONE_TO_ONE_QUERY:
            return item.relationType === this.SysOnlineRelationType.ONE_TO_ONE;
        }
      });
    }
  },
  mounted () {
    if (this.isEdit) {
      this.formData = {
        ...this.dialogParams.form
      }
    } else {
      this.formData.formType = this.dialogParams.pageType === this.SysOnlinePageType.FLOW ? this.SysOnlineFormType.FLOW : this.SysOnlineFormType.QUERY;
    }
  }
}
</script>

<style>
</style>
