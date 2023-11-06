<template>
  <div class="online-query-form" :style="{height: height ? height : '100%'}" v-show="isReady">
      <OnlineFilterBox class="query-filter-box" :isEdit="dialogParams.isEdit" ref="filterBox"
        :itemWidth="form.filterItemWidth || 350" style="margin-bottom: 16px;"
        :widgetList="activeWidgetList"
        :formData="formData"
        :operationList="activeOperationList"
        @widgetClick="onWidgetClick"
        @search="refreshTable(true)"
        @reset="onReset"
        @copy="onCopyWidget"
        @delete="onDeleteWidget"
        @operationClick="onOperationClick"
      >
        <el-button slot="operator" type="primary" :size="defaultFormItemSize" @click="onSubmit()">
          确定
        </el-button>
      </OnlineFilterBox>
      <div class="query-table-box custom-widget-item widget-item"
        :class="{active: dialogParams.isEdit && currentWidget === queryTable}"
        @click.stop="onTableClick"
      >
        <OnlineCustomTable ref="dataTable"
          style="padding-top: 0px!important"
          :dataList="queryTableWidget.dataList"
          :isEdit="dialogParams.isEdit" :widget="queryTable"
          :singleSelect="true"
          :operationList="activeOperationList"
          :getTableIndex="queryTableWidget.getTableIndex"
          :sortChange="queryTableWidget.onSortChange"
          :onRadioChange="onRadioChange"
          @operationClick="onOperationClick"
          @refresh="refreshTable(false)"
        >
          <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;" v-if="queryTable && queryTable.props.paged">
            <el-pagination
              :total="queryTableWidget.totalCount"
              :current-page="queryTableWidget.currentPage"
              :page-size="queryTableWidget.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, prev, pager, next, sizes"
              @current-change="queryTableWidget.onCurrentPageChange"
              @size-change="queryTableWidget.onPageSizeChange"
            />
          </el-row>
        </OnlineCustomTable>
      </div>
  </div>
</template>

<script>
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import widgetData from '../components/config/index.js';
import { buildFormConfig } from '../utils.js';
import { OnlineFormMixins } from '../onlineFormMixins.js';
import { TableWidget } from '@/utils/widget.js';
import OnlineFilterBox from './OnlineFilterBox.vue';
import OnlineCustomTable from '@/online/components/OnlineCustomTable.vue';
import OnlineQueryForm from './index.vue';
import OnlineEditForm from '../OnlineEditForm/index.vue';

export default {
  name: 'OnlineOneToOneForm',
  props: {
    formConfig: {
      type: Object
    },
    height: {
      type: String
    },
    masterTableData: {
      type: Object
    },
    // 是否表单编辑模式
    isEdit: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    // 当前选中组件
    currentWidget: {
      type: Object
    },
    // 是否全屏弹窗
    fullscreen: {
      type: Boolean
    },
    selectedColumn: {
      type: String
    },
    selectedValue: {
      type: String
    }
  },
  components: {
    OnlineFilterBox,
    OnlineCustomTable
  },
  mixins: [OnlineFormMixins, thirdPartyMixin, refreshDataMixins],
  provide () {
    return {
      form: () => {
        return {
          ...this.form,
          mode: this.mode,
          isEdit: this.dialogParams.isEdit,
          readOnly: this.dialogParams.readOnly,
          getWidgetValue: this.getWidgetValue,
          getWidgetProp: this.getWidgetProp,
          getWidgetVisible: this.getWidgetVisible,
          onValueChange: this.onValueChange,
          onWidgetValueChange: this.onWidgetValueChange,
          getDropdownParams: this.getDropdownParams,
          checkOperationPermCode: this.checkOperationPermCode,
          checkOperationDisabled: this.checkOperationDisabled,
          checkOperationVisible: this.checkOperationVisible,
          cloneWidget: this.cloneWidget,
          handlerOperation: this.handlerOperation,
          getDictDataList: this.getDictDataList,
          loadOnlineFormConfig: this.loadOnlineFormConfig,
          isActive: (widget) => {
            return this.currentWidget === widget;
          },
          getWidgetObject: widgetData.getWidgetObject
        }
      }
    }
  },
  data () {
    return {
      isReady: false,
      batchDelete: false,
      selectRows: [],
      queryTableWidget: new TableWidget(this.loadTableData, this.loadTableDataVerify, (this.formConfig || this.dialogParams.formConfig).tableWidget.props.paged, false)
      // 回显值字段
      // selectedColumn: '',
      // 回显的选中值
      // selectedValue: ''
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdOnlineEditForm' && data.isSuccess) {
        this.refreshTable();
      }
    },
    onSubmit () {
      this.$emit('submit');
    },
    onCopyWidget (widget) {
      this.activeWidgetList.push(widget);
    },
    onDeleteWidget (widget) {
      this.$confirm('是否删除此组件？').then(res => {
        this.form.widgetList = this.form.widgetList.filter(item => item !== widget);
        this.onWidgetClick(null);
      }).catch(e => {});
    },
    onTableClick () {
      this.$emit('tableClick', this.queryTable);
    },
    onWidgetClick (widget) {
      this.$emit('widgetClick', widget);
    },
    onRadioChange (rows) {
      this.selectRows = rows;
      this.$emit('radioSelectChanged', this.selectRows);
    },
    // 设置回显
    setSelectedRow (selectedColumn, selectedValue) {
      this.selectedColumn = selectedColumn;
      this.selectedValue = selectedValue;
    },
    getQueryParams () {
      if (Array.isArray(this.activeWidgetList)) {
        return this.activeWidgetList.map(widget => {
          if (widget.bindData.dataType !== this.SysCustomWidgetBindDataType.Column || widget.column == null) return;
          let column = widget.column;
          let paramValue = this.getWidgetValue(widget);
          if (paramValue == null || paramValue === '' || (Array.isArray(paramValue) && paramValue.length === 0)) return;
          let temp = {
            tableName: widget.table.tableName,
            columnName: widget.column.columnName,
            filterType: widget.column.filterType,
            columnValue: widget.column.filterType !== this.SysOnlineColumnFilterType.RANFGE_FILTER ? paramValue : undefined
          }

          if (column.filterType === this.SysOnlineColumnFilterType.RANFGE_FILTER) {
            temp.columnValueStart = paramValue[0];
            temp.columnValueEnd = paramValue[1];
          }

          return temp;
        }).filter(item => item != null);
      }
      return [];
    },
    loadTableData (params) {
      return new Promise((resolve, reject) => {
        let table = this.form.tableMap.get(this.queryTable.bindData.tableId);
        let httpCall = null;
        params.datasourceId = table.datasource.datasourceId;
        params.filterDtoList = this.getQueryParams();

        if (this.queryTable.relation != null) {
          params.relationId = table.relation.relationId;
        }
        // 脱敏设置
        params.ignoreMaskFields = this.getIgnoreMaskFields(this.queryTable);
        if (!this.dialogParams.isEdit && typeof this.queryTable.eventInfo[this.OnlineFormEventType.BEFORE_LOAD_TABLE_DATA] === 'function') {
          params = this.queryTable.eventInfo[this.OnlineFormEventType.BEFORE_LOAD_TABLE_DATA](params);
        }
        if (params == null) {
          reject();
          return;
        }

        if (table.relation != null) {
          httpCall = this.doUrl('/admin/online/onlineOperation/listByOneToManyRelationId/' + table.datasource.variableName, 'post', params);
        } else {
          httpCall = this.doUrl('/admin/online/onlineOperation/listByDatasourceId/' + table.datasource.variableName, 'post', params);
        }

        httpCall.then(res => {
          if (!this.dialogParams.isEdit && typeof this.queryTable.eventInfo[this.OnlineFormEventType.AFTER_LOAD_TABLE_DATA] === 'function') {
            res.data.dataList = this.queryTable.eventInfo[this.OnlineFormEventType.AFTER_LOAD_TABLE_DATA](res.data.dataList);
          }
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
          let selectedRowNum = res.data.dataList.findIndex(x => x[this.selectedColumn] === this.selectedValue);
          if (selectedRowNum >= 0) {
            this.$forceUpdate();
            this.$nextTick(() => {
              this.$refs.dataTable.setSelectedRow(selectedRowNum);
            })
          }
        }).catch(e => {
          reject(e);
        });
      });
    },
    loadTableDataVerify () {
      return true;
    },
    onOperationClick (operation, row) {
      if (operation.type === this.SysCustomWidgetOperationType.BATCH_DELETE) {
        this.onBatchDelete(operation);
      } else if (operation.type === this.SysCustomWidgetOperationType.DELETE) {
        this.onDeleteRow(row);
      } else if (operation.type === this.SysCustomWidgetOperationType.EXPORT) {
        this.onExport(operation);
      } else if (operation.type === this.SysCustomWidgetOperationType.PRINT) {
        this.onPrint(operation, row, this.queryTable.showName + '.pdf');
      } else {
        this.handlerOperation(operation, {
          isEdit: this.dialogParams.isEdit,
          rowData: row,
          masterTableData: this.dialogParams.masterTableData || row,
          callback: () => {
            this.refreshTable();
          }
        });
      }
    },
    onBatchDelete (operation) {
      if (this.selectRows.length <= 0) {
        this.$message.error('请选择要批量删除的数据！');
        return;
      }
      this.$confirm('是否删除选中数据？').then(res => {
        let table = this.form.tableMap.get(this.queryTable.bindData.tableId);
        let params = {
          datasourceId: table.datasource.datasourceId,
          relationId: (table.relation || {}).relationId,
          dataIdList: this.selectRows.map(item => {
            return item[this.primaryColumnName];
          })
        }

        let httpCall;
        if (params.relationId) {
          httpCall = this.doUrl('/admin/online/onlineOperation/deleteBatchOneToManyRelation/' + table.datasource.variableName, 'post', params);
        } else {
          httpCall = this.doUrl('/admin/online/onlineOperation/deleteBatchDatasource/' + table.datasource.variableName, 'post', params);
        }
        httpCall.then(res => {
          this.$message.success('删除成功！');
          this.refreshTable(true);
        }).catch(e => {
        });
      });
    },
    onDeleteRow (row) {
      this.$confirm('是否删除当前数据？').then(res => {
        let table = this.form.tableMap.get(this.queryTable.bindData.tableId);
        let params = {
          datasourceId: table.datasource.datasourceId,
          relationId: (table.relation || {}).relationId,
          dataId: row[this.primaryColumnName]
        }
        let httpCall = null;
        if (params.relationId) {
          httpCall = this.doUrl('/admin/online/onlineOperation/deleteOneToManyRelation/' + table.datasource.variableName, 'post', params);
        } else {
          httpCall = this.doUrl('/admin/online/onlineOperation/deleteDatasource/' + table.datasource.variableName, 'post', params);
        }

        httpCall.then(res => {
          this.$message.success('删除成功！');
          this.refreshTable(true);
        }).catch(e => {
        });
      }).catch(e => {});
    },
    onExport (operation) {
      this.$confirm('是否导出表格数据？').then(res => {
        let table = this.form.tableMap.get(this.queryTable.bindData.tableId);
        let params = {
          datasourceId: table.datasource.datasourceId,
          relationId: (table.relation || {}).relationId,
          filterDtoList: this.getQueryParams(),
          exportInfoList: (operation.exportColumnList || []).sort((val1, val2) => {
            return val1.showOrder - val2.showOrder;
          })
        }

        if (this.queryTable.relation != null) {
          params.filterDtoList.push({
            tableName: this.queryTable.table.tableName,
            columnName: this.queryTable.relation.slaveColumn.columnName,
            filterType: this.SysOnlineColumnFilterType.EQUAL_FILTER,
            columnValue: (this.dialogParams.masterTableData || {})[this.queryTable.relation.masterColumn.columnName]
          });
        }

        let httpCall;
        if (params.relationId) {
          httpCall = this.download('/admin/online/onlineOperation/exportByOneToManyRelationId/' + table.datasource.variableName, params, this.queryTable.showName + '.xlsx');
        } else {
          httpCall = this.download('/admin/online/onlineOperation/exportByDatasourceId/' + table.datasource.variableName, params, this.queryTable.showName + '.xlsx');
        }
        httpCall.then(res => {
          this.$message.success('导出成功！');
        }).catch(e => {
          this.$message.error(e);
        });
      }).catch(e => {});
    },
    refreshTable (reloadData) {
      if (this.dialogParams.isEdit) return;
      if (reloadData) {
        this.queryTableWidget.refreshTable(true, 1);
      } else {
        this.queryTableWidget.refreshTable();
      }
    },
    getCompoment (formConfig) {
      return formConfig.formType === this.SysOnlineFormType.QUERY ? OnlineQueryForm : OnlineEditForm
    },
    onReset () {
      this.refreshTable(true);
    },
    initFormData () {
      this.refreshTable(true);
    },
    resetWidget (widget) {
      if (this.$refs.filterBox) this.$refs.filterBox.resetWidget(widget);
    }
  },
  computed: {
    dialogParams () {
      return {
        formConfig: this.formConfig || (this.thirdParams || {}).formConfig,
        rowData: this.rowData || (this.thirdParams || {}).rowData,
        masterTableData: this.masterTableData || (this.thirdParams || {}).masterTableData,
        isEdit: this.isEdit || (this.thirdParams || {}).isEdit || false,
        readOnly: this.readOnly || (this.thirdParams || {}).readOnly || false,
        fullscreen: this.fullscreen || (this.thirdParams || {}).fullscreen || false
      }
    },
    form () {
      return buildFormConfig(this.dialogParams.formConfig);
    },
    queryTable () {
      return this.form.tableWidget;
    },
    activeWidgetList () {
      return this.form.widgetList;
    },
    activeOperationList () {
      return this.form.operationList;
    },
    getTableStyle () {
      return {
        padding: (this.dialogParams.isEdit && this.currentWidget === this.queryTable) ? '5px' : undefined,
        background: (this.dialogParams.isEdit && this.currentWidget === this.queryTable) ? 'rgba(64, 158, 255, 0.2)' : undefined
      }
    },
    primaryColumnName () {
      let table = this.form.tableMap.get(this.queryTable.bindData.tableId);
      if (table && Array.isArray(table.columnList)) {
        for (let i = 0; i < table.columnList.length; i++) {
          let column = table.columnList[i];
          if (column.primaryKey) {
            return column.columnName;
          }
        }
      }
      return null;
    }
  },
  created () {
    this.isReady = false;
    if (!this.dialogParams.isEdit) {
      this.initPage();
      this.initFormWidgetList();
      if (!this.dialogParams.isEdit && typeof this.form.eventInfo[this.OnlineFormEventType.AFTER_CREATE_FORM] === 'function') {
        this.form.eventInfo[this.OnlineFormEventType.AFTER_CREATE_FORM]();
      }
      this.initFormData();
      this.initWidgetLinkage(this.form.formType);
    }
    this.isReady = true;
  }
}
</script>

<style scoped>
  .header-logo {
    border-radius: 8px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    width: 40px;
    background: rgba(255,119,0,0.1);
    margin-right: 8px;
    color: #FDA834;
    display: inline-block;
  }
  .el-divider--vertical {
    height: 26px;
    margin: 7px 15px;
  }
  .online-query-form {
    display: flex;
    flex-direction: column;
  }

  .table-wrap{
    display: flex;
    flex-direction: column;
    padding: 16px 24px;
    background-color: white;
    flex: 1;
  }
  .online-query-form .query-filter-box {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .online-query-form .query-table-box {
    height: 200px;
    flex-grow: 1;
    flex-shrink: 1;
  }
</style>
