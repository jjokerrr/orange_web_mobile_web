<template>
  <el-row>
    <el-form label-position="left" label-width="115px" size="small" @submit.native.prevent>
      <el-col :span="24">
        <el-form-item label="弹窗表单选择">
          <el-select v-model="relativeFormId" clearable placeholder="" @change="onTableSelectChanged" @clear="onTableSelectClear" style="width:100%">
            <el-option v-for="item in selectableForms" :key="item.formId" :label="item.formName" :value="item.formId" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示字段选择" style="margin-top:20px">
          <el-select v-model="displayField" clearable placeholder="" @change="onPropertyChanged" style="width:100%">
            <el-option v-for="(item,index) in selectableFields" :key="index" :label="item.columnComment" :value="item.columnName" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-form>
  </el-row>
</template>

<script>
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'customWidgetRelativeTableSetting',
  props: {
    value: {
      type: Object,
      default: () => { }
    },
    formSelect: {
      type: String,
      default: ''
    },
    datasource: {
      type: String,
      default: ''
    },
    // 所有表单
    allFormList: {
      type: Array,
      default: () => []
    }
  },
  inject: ['formConfig'],
  mixins: [refreshDataMixins],
  data () {
    return {
      relativeFormId: '',
      relativeColumn: '',
      relativeTableName: '', //  选择的弹窗表单
      displayField: '', //  选择的显示字段
      relationId: '',
      datasourceId: '',
      variableName: '',
      
      selectableForms: [], // 待选择的弹窗表单列表
      selectableFields: [] // 表单可选字段列表
    }
  },
  watch: {
    value: function () {
    }
  },
  created () {
    if (this.value) {
      this.relativeFormId = this.value.relativeFormId;
      this.relativeColumn = this.value.relativeColumn;
      this.relativeTableName = this.value.relativeTableName;
      this.relationId = this.value.relationId;
      this.datasourceId = this.value.datasourceId;
      this.variableName = this.value.variableName;
      this.displayField = this.value.displayField;

      this.loadDisplayFields();
    }
    // 读取配置了一对一查询表单的数据表
    this.selectableForms = this.allFormList.filter(x => x.formType === this.SysOnlineFormType.ONE_TO_ONE_QUERY).map(x => {
      return {
        formName: x.formName,
        tableName: x.onlineTable.tableName,
        formId: x.formId
      }
    });
  },
  methods: {
    loadDisplayFields () {
      if (this.relativeFormId === '' || this.relativeFormId == null) return;
      // 选中的表单
      let formInfo = this.allFormList.find(x => x.formId === this.relativeFormId);
      if (formInfo) {
        // 根据选中表单绑定的数据找到 一对一的数据表
        let relativeTable = this.formConfig().getAllTableList.find(x => x.tableId === formInfo.onlineTable.tableId);

        this.relativeFormId = formInfo.formId;
        this.relativeColumn = relativeTable.slaveColumnName;
        this.relativeTableName = relativeTable.tableName;
        this.relationId = relativeTable.tag.relationId;
        this.datasourceId = relativeTable.tag.datasourceId;
        this.variableName = this.formConfig().currentWidget.datasource.variableName;
        this.selectableFields = relativeTable.columnList;
      }
    },
    onTableSelectChanged () {
      this.loadDisplayFields();
      this.onPropertyChanged();
    },
    onTableSelectClear () {
      this.relativeFormId = '';
      this.relativeColumn = '';
      this.relativeTableName = '';
      this.displayField = '';
      this.relationId = '';
      this.datasourceId = '';
      this.variableName = '';
      this.onPropertyChanged();
    },
    onPropertyChanged () {
      this.$emit('input', {
        relativeFormId: this.relativeFormId,
        relativeTableName: this.relativeTableName,
        relativeColumn: this.relativeColumn,
        relationId: this.relationId,
        datasourceId: this.datasourceId,
        variableName: this.variableName,
        displayField: this.displayField
      })
    }
  }
}
</script>

<style>
</style>
