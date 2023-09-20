<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <div class="form-box">
      <el-form ref="form" :model="formData" class="full-width-input" :rules="rules" style="width: 100%;"
        label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
        <el-row>
          <el-col :span="24">
            <el-form-item label="操作类型" prop="type">
              <el-select v-model="formData.type" :disabled="formData.builtin || isEdit" @change="onFormTypeChange">
                <el-option v-for="item in getValidOperationType" :key="item.id"
                  :label="item.name" :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作名称" prop="name">
              <el-input class="input-item" v-model="formData.name"
                :clearable="true" placeholder="操作按钮名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.type === SysCustomWidgetOperationType.PRINT">
            <el-form-item label="表格行操作" prop="rowOperation">
              <el-switch v-model="formData.rowOperation"
                :disabled="dialogParams.formConfig.form.formType === this.SysOnlineFormType.FORM || dialogParams.formConfig.form.formType === this.SysOnlineFormType.WORK_ORDER"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用">
              <el-switch class="input-item" v-model="formData.enabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="!formData.rowOperation">
            <el-form-item label="按钮类型" prop="btnType">
              <el-select v-model="formData.btnType">
                <el-option label="primary" value="primary" />
                <el-option label="success" value="success" />
                <el-option label="warning" value="warning" />
                <el-option label="danger" value="danger" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="!formData.rowOperation">
            <el-form-item label="镂空模式" prop="btnType">
              <el-switch v-model="formData.plain" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.rowOperation">
            <el-form-item label="操作按钮类名">
              <el-input class="input-item" v-model="formData.btnClass"
                :clearable="true" placeholder="操作按钮类名" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="按钮显示顺序">
              <el-input-number class="input-item" v-model="formData.showOrder"
                controls-position="right" placeholder="按钮显示顺序" />
            </el-form-item>
          </el-col>
          <el-col :span="formData.type === SysCustomWidgetOperationType.FORM ? 16 : 24"
            v-if="
              formData.type === SysCustomWidgetOperationType.ADD ||
              formData.type === SysCustomWidgetOperationType.EDIT ||
              formData.type === SysCustomWidgetOperationType.FORM ||
              formData.type === SysCustomWidgetOperationType.COPY
            "
          >
            <el-form-item label="操作表单" prop="formId">
              <el-select class="input-item" v-model="formData.formId" placeholder="选择操作按钮触发表单" clearable>
                <el-option v-for="form in getFormList" :key="form.formId"
                  :label="form.formName" :value="form.formId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="formData.type === SysCustomWidgetOperationType.FORM">
            <el-form-item label="只读表单">
              <el-switch v-model="formData.readOnly" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.type === SysCustomWidgetOperationType.PRINT">
            <el-form-item label="打印模板分组" placeholder="请选择打印模板分组">
              <el-select v-model="printGroupId" placeholder="" clearable
                @change="formData.printTemplateId = undefined"
              >
                <el-option v-for="item in printGroupList" :key="item.id"
                  :label="item.name" :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="formData.type === SysCustomWidgetOperationType.PRINT">
            <el-form-item label="打印模板" prop="printTemplateId" placeholder="请选择打印模板">
              <el-select v-model="formData.printTemplateId" placeholder="" clearable
                @change="onPrintTemplateChange"
              >
                <el-option v-for="item in validPrintTemplageList" :key="item.id"
                  :label="item.name" :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <CustomEventSetting v-if="allowEventList.length > 0"
        label="操作脚本"
        v-model="formData.eventList"
        :formConfig="dialogParams.formConfig"
        labelPosition="right"
        labelWidth="100px"
        :allowEventList="allowEventList"
      />
      <!-- 导出配置 -->
      <el-col :span="24" v-show="formData.type === SysCustomWidgetOperationType.EXPORT" style="margin-bottom: 20px;">
        <vxe-table :data="tableColumnTree" ref="expoerColumnTable"
          border
          show-overflow="title"
          show-header-overflow="title"
          :row-config="{height: 35}"
          :tree-config="{transform: false, rowField: 'id', parentField: 'parentId', expandAll: true}"
          :checkbox-config="{checkMethod: enableChecked}"
          height="350px"
          @checkbox-all="onExportColumnChange"
          @checkbox-change="onExportColumnChange"
        >
          <vxe-column type="checkbox" width="60" />
          <vxe-column title="导出字段" field="variableName" tree-node>
            <template #default="{ row }">
              <span>{{row.variableName}}</span>
              <el-tag style="margin-left: 10px;" size="mini" type="danger" v-if="row.aggregationColumnId">聚合字段</el-tag>
              <el-tag style="margin-left: 10px;" size="mini" type="success" v-if="row.isTable && row.relationType != null">一对一关联</el-tag>
            </template>
          </vxe-column>
          <vxe-column title="显示名称" field="showName">
            <template #default="{ row }">
              <el-input v-if="row.isColumn" size="mini" :disabled="!exportColumnIsSelected(row)" v-model="row.showName" />
            </template>
          </vxe-column>
          <vxe-column title="显示顺序" field="showOrder">
            <template #default="{ row }">
              <el-input-number v-if="row.isColumn" size="mini" :disabled="!exportColumnIsSelected(row)" v-model="row.showOrder" controls-position="right" />
            </template>
          </vxe-column>
          <template slot="empty">
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png">
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
      </el-col>
      <!-- 打印参数配置 -->
      <el-col :span="24" v-show="formData.type === SysCustomWidgetOperationType.PRINT" style="margin-bottom: 20px;">
        <vxe-table :data="formData.printParamList"
          border
          show-overflow="title"
          show-header-overflow="title"
          :row-config="{height: 35}"
          height="250px"
        >
          <vxe-column type="seq" title="序号" :width="60" />
          <vxe-column title="参数名称" field="paramName" />
          <vxe-column title="参数值">
            <template #default="{ row }">
              <el-select v-model="row.paramValue" clearable placeholder="请选择参数值" size="mini">
                <el-option v-for="item in validPrintParamValueList" :key="item.id"
                  :label="item.name" :value="item.id"
                />
              </el-select>
            </template>
          </vxe-column>
          <template slot="empty">
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png">
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
      </el-col>
    </div>
    <el-col class="menu-box" :span="24">
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
  </div>
</template>

<script>
import { findItemFromList } from '@/utils';
import CustomEventSetting from '@/online/components/CustomEventSetting/index.vue';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import { OnlineOperation } from '@/api/onlineController.js';

export default {
  props: {
    rowData: {
      type: Object
    },
    formList: {
      type: Array
    },
    tableList: {
      type: Array
    },
    formConfig: {
      type: Object
    }
  },
  components: {
    CustomEventSetting
  },
  mixins: [thirdPartyMixin],
  data () {
    return {
      formData: {
        type: this.SysCustomWidgetOperationType.FORM,
        name: undefined,
        btnType: undefined,
        plain: false,
        enabled: true,
        builtin: false,
        rowOperation: true,
        readOnly: false,
        btnClass: 'table-btn primary',
        showOrder: 0,
        formId: undefined,
        exportColumnList: [],
        printTemplateId: undefined,
        printParamList: [],
        eventList: []
      },
      tableColumnTree: [],
      exportColumn: [],
      printGroupId: undefined,
      printGroupList: [],
      printTemplateList: [],
      rules: {
        name: [
          { required: true, message: '操作按钮名称不能为空', trigger: 'blur' }
        ],
        formId: [
          { required: true, message: '请选择按钮触发表单', trigger: 'blur' }
        ],
        printTemplateId: [
          { required: true, message: '请选择打印模板', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    onCancel (isSuccess) {
      if (this.formData.type === this.SysCustomWidgetOperationType.EXPORT) {
        this.formData.exportColumnList = (this.exportColumn || []).map(column => {
          return (column && column.isColumn) ? {
            tableId: column.table.tableId,
            columnId: column.aggregationColumn ? undefined : column.columnId,
            virtualColumnId: column.aggregationColumnId,
            showName: column.showName,
            showOrder: column.showOrder
          } : undefined;
        }).filter(item => item != null);
      } else {
        this.formData.exportColumnList = [];
      }
      if (this.observer != null) {
        this.observer.cancel(isSuccess, this.formData);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, this.dialogParams.rowData, this.formData);
      }
    },
    onSubmit () {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        this.onCancel(true);
      });
    },
    onFormTypeChange () {
      this.formData.rowOperation = true;
      this.formData.readOnly = false;
      this.formData.formId = undefined;
      this.formData.printTemplateId = undefined;
    },
    onExportColumnChange ({ $table }) {
      this.exportColumn = $table.getCheckboxRecords();
    },
    exportColumnIsSelected (row) {
      if (Array.isArray(this.exportColumn)) {
        return this.exportColumn.indexOf(row) !== -1;
      } else {
        return false;
      }
    },
    enableChecked ({ row }) {
      return row.isColumn;
    },
    getTableColumnTree () {
      this.tableColumnTree = [];
      let selectedRows = [];
      if (Array.isArray(this.dialogParams.tableList)) {
        this.tableColumnTree = this.dialogParams.tableList.map(item => {
          return {
            variableName: item.tableName,
            id: item.tableId,
            isTable: true,
            relationType: item.relationType,
            children: (item.columnList || []).map(column => {
              let columnInfo = findItemFromList(this.formData.exportColumnList, column.aggregationColumnId, 'virtualColumnId');
              if (columnInfo == null) columnInfo = findItemFromList(this.formData.exportColumnList, column.columnId, 'columnId');
              let temp = {
                ...column,
                id: column.aggregationColumnId || column.columnId,
                table: item,
                variableName: column.columnName,
                showName: (columnInfo || {}).showName || column.columnComment,
                showOrder: (columnInfo || {}).showOrder || 0,
                isColumn: true
              };
              if (columnInfo != null) selectedRows.push(temp);
              return temp;
            })
          }
        });
      }
      return selectedRows;
    },
    loadPrintTemplate () {
      OnlineOperation.getPrintTemplate(this).then(res => {
        this.printGroupList = res.data.allPrintGroupList.map(item => {
          return {
            id: item.groupId,
            name: item.groupName
          }
        });
        this.printTemplateList = res.data.allPrintList.map(item => {
          return {
            id: item.printId,
            groupId: item.groupId,
            name: item.printName,
            paramList: item.paramJson ? JSON.parse(item.paramJson) : []
          }
        });
        this.printGroupId = (this.printTemplate || {}).groupId;
      }).catch(e => {});
    },
    onPrintTemplateChange () {
      this.formData.printParamList = [];
      if (this.printTemplate != null && Array.isArray(this.printTemplate.paramList)) {
        this.formData.printParamList = this.printTemplate.paramList.map(item => {
          return {
            paramName: item.variableName,
            paramValue: undefined
          }
        });
      }
    }
  },
  computed: {
    isEdit () {
      return this.dialogParams.rowData != null;
    },
    dialogParams () {
      return {
        rowData: this.rowData || this.thirdParams.rowData,
        formList: this.formList || this.thirdParams.formList,
        tableList: this.tableList || this.thirdParams.tableList,
        formConfig: this.formConfig || this.thirdParams.formConfig
      }
    },
    allowEventList () {
      if (this.dialogParams.formConfig.form.formType === this.SysOnlineFormType.WORK_ORDER) {
        return [];
      } else {
        return [
          this.OnlineFormEventType.OPERATION_VISIBLE,
          this.OnlineFormEventType.OPERATION_DISABLED
        ];
      }
    },
    getFormList () {
      return this.dialogParams.formList.filter(item => {
        if (this.formData.type === this.SysCustomWidgetOperationType.FORM) {
          return true;
        } else {
          return item.formType === this.SysOnlineFormType.FORM;
        }
      });
    },
    getValidOperationType () {
      return this.SysCustomWidgetOperationType.getList().filter(item => {
        if (this.isEdit) return true;
        if (this.dialogParams.formConfig.form.formType === this.SysOnlineFormType.FORM) {
          return (
            item.id === this.SysCustomWidgetOperationType.PRINT ||
            item.id === this.SysCustomWidgetOperationType.FORM
          );
        } else {
          return [this.SysCustomWidgetOperationType.FORM, this.SysCustomWidgetOperationType.PRINT, this.SysCustomWidgetOperationType.COPY].indexOf(item.id) !== -1;
        }
      });
    },
    validPrintParamValueList () {
      let temp = this.dialogParams.formConfig.getMasterTable == null ? [] : (this.dialogParams.formConfig.getMasterTable.columnList || []).map(item => {
        return {
          id: item.columnId,
          name: item.columnName
        }
      });
      if (this.dialogParams.formConfig.form.formType === this.SysOnlineFormType.WORK_ORDER) {
        temp.unshift({
          id: 'workOrderId',
          name: 'workOrderId'
        });
      }
      return temp;
    },
    printTemplate () {
      return findItemFromList(this.printTemplateList, this.formData.printTemplateId, 'id');
    },
    validPrintTemplageList () {
      return this.printTemplateList.filter(item => {
        return item.groupId === this.printGroupId;
      });
    }
  },
  mounted () {
    this.exportColumn = [];
    if (this.dialogParams.rowData != null) {
      this.formData = {
        ...this.formData,
        ...this.dialogParams.rowData
      }
      if (this.formData.type === this.SysCustomWidgetOperationType.EXPORT) {
        this.exportColumn = this.getTableColumnTree();
        this.$refs.expoerColumnTable.setCheckboxRow(this.exportColumn, true);
      }
    } else {
      switch (this.dialogParams.formConfig.form.formType) {
        case this.SysOnlineFormType.FORM:
        case this.SysOnlineFormType.WORK_ORDER:
          this.formData.type = this.SysCustomWidgetOperationType.PRINT;
          this.formData.rowOperation = this.dialogParams.formConfig.form.formType === this.SysOnlineFormType.WORK_ORDER;
          break;
        default:
          this.formData.type = this.SysCustomWidgetOperationType.FORM;
          break;
      }
    }
  }
}
</script>

<style>
</style>
