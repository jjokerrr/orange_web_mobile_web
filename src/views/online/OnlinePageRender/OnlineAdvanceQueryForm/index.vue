<template>
  <div class="online-advance-query-form" v-show="isReady">
    <template v-if="dialogParams.fullscreen && !dialogParams.isEdit">
      <el-container>
        <el-header style="background: white; height: 72px;">
          <el-row type="flex" align="middle" style="height: 100%; width: 100%; justify-content: space-between;">
            <div style="height: 40px; line-height: 40px; display: flex">
              <i class="header-logo online-icon icon-orange-icon" style="font-size: 40px; color: #FDA834; background: rgba(255,119,0,0.1);" />
              <span style="font-size: 22px; color: #333333; font-weight: bold;">数据建模</span>
              <el-divider direction="vertical" style="height: 26px; margin: 7px 8px;" />
              <span style="font-weight: bold; color: #333333; font-size: 18px;">{{form.formName}}</span>
            </div>
            <el-button type="text" size="small"
              icon="el-icon-close"
              style="font-size: 24px; color: #909399;"
              @click="onCancel(false)"
            />
          </el-row>
        </el-header>
        <el-main style="width: 100%; padding: 25px; background: #F9f9f9;">
          <el-container style="height: calc(100vh - 122px); background: white; padding: 25px;">
            <el-aside width="265px" class="left-panel" v-if="leftWidget != null"
              @click.stop.native="onLeftWidgetClick"
            >
              <div class="title">
                <el-row type="flex" align="middle">
                  <span class="name">{{leftWidget.showName}}</span>
                  <el-input class="search round-search" prefix-icon="el-icon-search"
                    v-model="leftFilter" clearable
                    :size="defaultFormItemSize" style="border-radius: 16px;"
                    :placeholder="'输入' + leftWidget.showName"
                  />
                </el-row>
              </div>
              <el-scrollbar class="custom-scroll tree" style="flex-grow: 1;">
                <div class="widget-item"
                  :class="{active: dialogParams.isEdit && currentWidget === leftWidget}"
                >
                  <OnlineCustomWidget
                    :widget="leftWidget"
                    :ref="leftWidget.variableName"
                    :value="getWidgetValue(leftWidget)"
                    @input="(val) => onValueChange(leftWidget, val)"
                    @change="onLeftWidgetChange"
                  />
                </div>
              </el-scrollbar>
            </el-aside>
            <el-main class="table-panel" style="margin-left: 15px">
              <el-row class="query-filter-box" type="flex" justify="end" style="margin-bottom: 20px;">
                <el-button v-if="operationVisible(SysCustomWidgetOperationType.BATCH_DELETE)" :size="defaultFormItemSize"
                  :type="getOperation(SysCustomWidgetOperationType.BATCH_DELETE).btnType"
                  :plain="getOperation(SysCustomWidgetOperationType.BATCH_DELETE).plain"
                  :disabled="operationDisabled(SysCustomWidgetOperationType.BATCH_DELETE)"
                  @click="onOperationClick(getOperation(SysCustomWidgetOperationType.BATCH_DELETE))"
                  icon="el-icon-delete"
                >{{getOperation(SysCustomWidgetOperationType.BATCH_DELETE).name || '批量删除'}}</el-button>
                <el-button v-if="operationVisible(SysCustomWidgetOperationType.EXPORT)" :size="defaultFormItemSize"
                  :type="getOperation(SysCustomWidgetOperationType.EXPORT).btnType"
                  :plain="getOperation(SysCustomWidgetOperationType.EXPORT).plain"
                  :disabled="operationDisabled(SysCustomWidgetOperationType.EXPORT)"
                  @click="onOperationClick(getOperation(SysCustomWidgetOperationType.EXPORT))"
                  icon="el-icon-download"
                >{{getOperation(SysCustomWidgetOperationType.EXPORT).name || '导出'}}</el-button>
                <el-button v-if="operationVisible(SysCustomWidgetOperationType.PRINT)" :size="defaultFormItemSize"
                  :type="getOperation(SysCustomWidgetOperationType.PRINT).btnType"
                  :plain="getOperation(SysCustomWidgetOperationType.PRINT).plain"
                  :disabled="operationDisabled(SysCustomWidgetOperationType.PRINT)"
                  @click="onOperationClick(getOperation(SysCustomWidgetOperationType.PRINT))"
                >{{getOperation(SysCustomWidgetOperationType.PRINT).name || '打印'}}</el-button>
                <el-button v-if="operationVisible(SysCustomWidgetOperationType.ADD)" :size="defaultFormItemSize"
                  :type="getOperation(SysCustomWidgetOperationType.ADD).btnType"
                  :plain="getOperation(SysCustomWidgetOperationType.ADD).plain"
                  :disabled="operationDisabled(SysCustomWidgetOperationType.ADD)"
                  @click="onOperationClick(getOperation(SysCustomWidgetOperationType.ADD))"
                  icon="el-icon-plus"
                >{{getOperation(SysCustomWidgetOperationType.ADD).name || '新建'}}</el-button>
              </el-row>
              <div class="query-filter-box" style="margin-bottom: 10px;" v-if="activeWidgetList.length > 0 || isEdit"
                :style="{background: dialogParams.isEdit ? undefined : '#F6F7F9', border: dialogParams.isEdit ? '1px solid #e8eaec' : 'none'}"
              >
                <OnlineFilterBox :isEdit="dialogParams.isEdit" ref="filterBox"
                  :isAdvance="true"
                  :itemWidth="form.filterItemWidth || 350"
                  :widgetList="activeWidgetList"
                  :formData="formData"
                  :operationList="activeOperationList"
                  @widgetClick="onWidgetClick"
                  @search="refreshTable(true)"
                  @reset="onReset"
                  @copy="onCopyWidget"
                  @delete="onDeleteWidget"
                  @operationClick="onOperationClick"
                />
              </div>
              <div class="table-wrap">
                <div class="query-table-box widget-item"
                  :class="{active: dialogParams.isEdit && currentWidget === queryTable}"
                  style="margin-top: 8px;" :style="{padding: '16px 24px', backgroundColor: 'white'}"
                  @click.stop="onTableClick"
                >
                  <OnlineCustomTable :dataList="queryTableWidget.dataList"
                    :isEdit="dialogParams.isEdit" :widget="queryTable"
                    :multiSelect="batchDelete"
                    :operationList="activeOperationList"
                    :getTableIndex="queryTableWidget.getTableIndex"
                    :sortChange="queryTableWidget.onSortChange"
                    :onSelectChange="onSelectRowChange"
                    @operationClick="onOperationClick"
                  >
                    <el-row slot="pagination" type="flex" justify="end" style="margin-top: 10px;" v-if="queryTable && queryTable.props.paged">
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
            </el-main>
          </el-container>
        </el-main>
      </el-container>
    </template>
    <template v-else>
      <el-container :style="{height: height ? height : '100%'}">
        <el-aside width="265px" class="left-panel" v-if="leftWidget != null"
          @click.stop.native="onLeftWidgetClick"
        >
          <div class="title">
            <el-row type="flex" align="middle">
              <span class="name">{{leftWidget.showName}}</span>
              <el-input class="search round-search" prefix-icon="el-icon-search"
                v-model="leftFilter" clearable
                :size="defaultFormItemSize" style="border-radius: 16px;"
                :placeholder="'输入' + leftWidget.showName"
              />
            </el-row>
          </div>
          <el-scrollbar class="custom-scroll tree" style="flex-grow: 1;">
            <div class="widget-item"
              :class="{active: dialogParams.isEdit && currentWidget === leftWidget}"
            >
              <OnlineCustomWidget
                :widget="leftWidget"
                :ref="leftWidget.variableName"
                :value="getWidgetValue(leftWidget)"
                @input="(val) => onValueChange(leftWidget, val)"
                @change="onLeftWidgetChange"
              />
            </div>
          </el-scrollbar>
        </el-aside>
        <el-main class="table-panel" style="margin-left: 15px; overflow: hidden;">
          <div class="query-filter-box" v-if="activeWidgetList.length > 0 || isEdit"
            :style="{background: dialogParams.isEdit ? undefined : '#F6F7F9', border: dialogParams.isEdit ? '1px solid #e8eaec' : 'none'}"
          >
            <OnlineFilterBox :isEdit="dialogParams.isEdit" ref="filterBox"
              :isAdvance="true" style="margin-bottom: 16px;"
              :itemWidth="form.filterItemWidth || 350"
              :widgetList="activeWidgetList"
              :formData="formData"
              :operationList="activeOperationList"
              @widgetClick="onWidgetClick"
              @search="refreshTable(true)"
              @reset="onReset"
              @copy="onCopyWidget"
              @delete="onDeleteWidget"
              @operationClick="onOperationClick"
            />
          </div>
          <div class="query-table-box widget-item"
            :class="{active: dialogParams.isEdit && currentWidget === queryTable}"
            @click.stop="onTableClick"
          >
            <OnlineCustomTable :dataList="queryTableWidget.dataList"
              :isEdit="dialogParams.isEdit" :widget="queryTable"
              :multiSelect="batchDelete"
              :operationList="activeOperationList"
              :getTableIndex="queryTableWidget.getTableIndex"
              :sortChange="queryTableWidget.onSortChange"
              :onSelectChange="onSelectRowChange"
              @operationClick="onOperationClick"
              @refresh="refreshTable(false)"
            >
              <el-row slot="pagination" type="flex" justify="end" style="margin-top: 10px;" v-if="queryTable && queryTable.props.paged">
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
        </el-main>
      </el-container>
    </template>
  </div>
</template>

<script>
import { findItemFromList } from '@/utils';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import widgetData from '../components/config/index.js';
import { buildFormConfig } from '../utils.js';
import { OnlineFormMixins } from '../onlineFormMixins.js';
import { TableWidget } from '@/utils/widget.js';
import OnlineFilterBox from '../OnlineQueryForm/OnlineFilterBox.vue';
import OnlineCustomWidget from '@/online/components/OnlineCustomWidget.vue';
import OnlineCustomTable from '@/online/components/OnlineCustomTable.vue';
import OnlineQueryForm from '../OnlineQueryForm/index.vue';
import OnlineEditForm from '../OnlineEditForm/index.vue';

export default {
  name: 'OnlieAdvanceQueryForm',
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
    }
  },
  components: {
    OnlineFilterBox,
    // OnlineCustomTree,
    OnlineCustomWidget,
    OnlineCustomTable
  },
  mixins: [OnlineFormMixins, thirdPartyMixin],
  provide () {
    return {
      form: () => {
        return {
          ...this.form,
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
          handlerOperation: this.handlerOperation,
          getDictDataList: this.getDictDataList,
          loadOnlineFormConfig: this.loadOnlineFormConfig,
          isActive: (widget) => {
            return this.currentWidget === widget;
          },
          getWidgetObject: widgetData.getWidgetObject,
          filter: {
            name: this.leftFilter
          }
        }
      }
    }
  },
  data () {
    return {
      isReady: false,
      batchDelete: false,
      selectRows: [],
      leftFilter: undefined,
      queryTableWidget: new TableWidget(this.loadTableData, this.loadTableDataVerify, (this.formConfig || this.dialogParams.formConfig).tableWidget.props.paged, false)
    }
  },
  methods: {
    onCancel (isSuccess = false) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess);
      } else {
        this.onCloseThirdDialog();
      }
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
    onLeftWidgetClick () {
      this.$emit('widgetClick', this.form.leftWidget);
    },
    onWidgetClick (widget) {
      this.$emit('widgetClick', widget);
    },
    onSelectRowChange (rows) {
      this.selectRows = rows;
    },
    getQueryParamItem (widget) {
      if (widget == null) return;
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
    },
    getQueryParams () {
      let queryParams = [];
      if (Array.isArray(this.activeWidgetList)) {
        queryParams = this.activeWidgetList.map(widget => {
          return this.getQueryParamItem(widget);
        }).filter(item => item != null);
      }

      if (this.leftWidget != null) {
        let temp = this.getQueryParamItem(this.leftWidget);
        if (temp) queryParams.push(temp);
      }

      return queryParams;
    },
    loadTableData (params) {
      return new Promise((resolve, reject) => {
        let table = this.form.tableMap.get(this.queryTable.bindData.tableId);
        let httpCall = null;
        params.datasourceId = table.datasource.datasourceId;
        params.filterDtoList = this.getQueryParams();

        if (this.queryTable.relation != null) {
          params.relationId = table.relation.relationId;
          params.filterDtoList.push({
            tableName: this.queryTable.table.tableName,
            columnName: this.queryTable.relation.slaveColumn.columnName,
            filterType: this.SysOnlineColumnFilterType.EQUAL_FILTER,
            columnValue: (this.dialogParams.masterTableData || {})[this.queryTable.relation.masterColumn.columnName]
          });
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
    },
    hasOperator (type) {
      let temp = this.getOperation(type);
      return temp && temp.enabled;
    },
    getOperation (type) {
      return findItemFromList(this.form.operationList, type, 'type');
    },
    operationVisible (type) {
      let operation = this.getOperation(type);
      return !this.form.readOnly && this.hasOperator(type) && this.checkOperationVisible(operation);
    },
    operationDisabled (type) {
      let operation = this.getOperation(type);
      return this.checkOperationDisabled(operation) || !this.checkOperationPermCode(operation);
    },
    onLeftWidgetChange (val, dictData) {
      this.onWidgetValueChange(this.leftWidget, val, dictData);
      this.refreshTable(true);
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
      let temp = buildFormConfig(this.dialogParams.formConfig);
      return temp;
    },
    leftWidget () {
      return this.form.leftWidget;
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
  .round-search >>> .el-input__inner {
    border-radius: 16px;
  }

  .left-panel {
    display: flex;
    flex-direction: column;
    background: white;
    border-right: 2px solid #E8E8E8;
  }
  .left-panel .title {
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 16px;
    color: #333333;
    font-weight: 400;
    padding: 20px;
    border-bottom: 2px solid #E8E8E8;
  }

  .left-panel .title .name {
    flex-grow: 0;
    flex-shrink: 0;
  }
  .left-panel .title .search {
    margin-left: 10px;
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 50px;
  }
  .online-advance-query-form {
    height: 100%;
  }
  .online-advance-query-form .table-panel {
    display: flex;
    flex-direction: column;
  }
  .online-advance-query-form .query-filter-box {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .online-advance-query-form .query-table-box {
    height: 200px;
    flex-grow: 1;
    flex-shrink: 1;
  }
  .table-wrap{
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: white;
    padding-bottom: 16px;
  }
</style>
