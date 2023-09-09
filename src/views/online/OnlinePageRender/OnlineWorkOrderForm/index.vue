<template>
  <div class="online-workflow-order-form" :style="{height: height ? height : '100%'}" v-show="isReady">
    <el-form class="query-filter-box" ref="onlineWorkOrder"
      :model="formFilter" label-width="80px"
      :size="defaultFormItemSize"
      label-position="right"
      @submit.native.prevent
    >
      <filter-box :item-width="330" @search="onSearch()" @reset="onReset">
        <el-form-item label="工单状态" prop="flowStatus">
          <el-select class="filter-item" v-model="formFilter.flowStatus" :clearable="true"
            placeholder="工单状态">
            <el-option v-for="item in SysFlowWorkOrderStatus.getList()" :key="item.id"
              :label="item.name" :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建日期" prop="createTime">
          <date-range class="filter-item" v-model="formFilter.createTime" :clearable="true" :allowTypes="['day']" align="left"
            range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
            format="yyyy-MM-dd" value-format="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
        <el-form-item label="工单编号" prop="workOrderCode">
          <el-input class="filter-item" v-model="formFilter.workOrderCode"
            :clearable="true" placeholder="工单编号"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <el-row type="flex" justify="space-between" style="background-color: white;padding: 16px 24px 0">
      <el-button type="primary" icon="el-icon-plus" :size="defaultFormItemSize"
        :disabled="processDefinitionKey == null"
        @click="onStartFlow()">
        新建
      </el-button>
    </el-row>
    <div class="online-query-form">
      <div class="query-table-box custom-widget-item widget-item"
        :class="{active: isEdit && currentWidget === queryTable}"
        :style="{padding: (isEdit && currentWidget === queryTable) ? '2px' : '0px'}"
        @click.stop="onTableClick"
      >
        <OnlineCustomWorkFlowTable v-if="isReady"
          :dataList="queryTableWidget.dataList"
          :isEdit="isEdit" :widget="queryTable"
          :getTableIndex="queryTableWidget.getTableIndex"
          :sortChange="queryTableWidget.onSortChange"
          @viewWorkOrder="onView"
          @handlerWorkOrder="onSubmit"
          @cancelWorkOrder="onCancelWorkOrder"
          @handlerRemind="onRemindClick"
        />
      </div>
      <el-row type="flex" justify="end" style="margin-top: 16px;" v-if="queryTable && queryTable.props.paged">
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
    </div>
  </div>
</template>

<script>
import widgetData from '../components/config/index.js';
import { buildFormConfig } from '../utils.js';
import { OnlineFormMixins } from '../onlineFormMixins.js';
import { TableWidget } from '@/utils/widget.js';
import OnlineCustomWorkFlowTable from '@/online/components/OnlineCustomWorkFlowTable.vue';
import { FlowOperationController, FlowEntryController, FlowVariableDisplayController } from '@/api/flowController.js';

export default {
  name: 'OnlineWorkOrderForm',
  props: {
    entryId: {
      type: String
    },
    formConfig: {
      type: Object,
      required: true
    },
    height: {
      type: String
    },
    // 是否表单编辑模式
    isEdit: {
      type: Boolean,
      default: false
    },
    // 当前选中组件
    currentWidget: {
      type: Object
    }
  },
  components: {
    OnlineCustomWorkFlowTable
  },
  mixins: [OnlineFormMixins],
  provide () {
    return {
      form: () => {
        return {
          ...this.form,
          mode: this.mode,
          isEdit: this.isEdit,
          checkOperationPermCode: this.checkOperationPermCode,
          checkOperationDisabled: this.checkOperationDisabled,
          checkOperationVisible: this.checkOperationVisible,
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
      processDefinitionKey: undefined,
      processDefinitionName: undefined,
      formFilter: {
        createTime: [],
        workOrderCode: undefined,
        flowStatus: undefined
      },
      queryTableWidget: new TableWidget(this.loadTableData, this.loadTableDataVerify, this.formConfig.tableWidget.props.paged, false)
    }
  },
  methods: {
    onTableClick () {
      this.$emit('tableClick', this.queryTable);
    },
    loadTableData (params) {
      return new Promise((resolve, reject) => {
        params = {
          ...params,
          flowWorkOrderDtoFilter: {
            flowStatus: this.formFilter.flowStatus,
            workOrderCode: this.formFilter.workOrderCode,
            createTimeStart: Array.isArray(this.formFilter.createTime) ? this.formFilter.createTime[0] : undefined,
            createTimeEnd: Array.isArray(this.formFilter.createTime) ? this.formFilter.createTime[1] : undefined
          }
        }
        // 脱敏设置
        params.ignoreMaskFields = this.getIgnoreMaskFields();
        if (!this.isEdit && typeof this.queryTable.eventInfo[this.OnlineFormEventType.BEFORE_LOAD_TABLE_DATA] === 'function') {
          params = this.queryTable.eventInfo[this.OnlineFormEventType.BEFORE_LOAD_TABLE_DATA](params);
        }
        if (params == null) {
          reject();
          return;
        }
        FlowOperationController.listWorkOrder(this, params, {
          processDefinitionKey: this.processDefinitionKey
        }).then(res => {
          res.data.dataList = res.data.dataList.map(item => {
            let initTaskInfo = item.initTaskInfo == null ? {} : JSON.parse(item.initTaskInfo);
            let runtimeTaskInfo = (Array.isArray(item.runtimeTaskInfoList) && item.runtimeTaskInfoList.length > 0) ? item.runtimeTaskInfoList[0] : {};
            return {
              ...item,
              flowStatusShowName: this.SysFlowWorkOrderStatus.getValue(item.flowStatus),
              initTaskInfo,
              runtimeTaskInfo
            }
          });
          if (!this.isEdit && typeof this.queryTable.eventInfo[this.OnlineFormEventType.AFTER_LOAD_TABLE_DATA] === 'function') {
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
    onSearch () {
      this.refreshTable(true);
    },
    refreshTable (reloadData) {
      if (this.isEdit) return;
      if (reloadData) {
        this.queryTableWidget.refreshTable(true, 1);
      } else {
        this.queryTableWidget.refreshTable();
      }
    },
    onReset () {
      this.formFilter.createTime = [];
      this.formFilter.workOrderCode = undefined;
      this.formFilter.flowStatus = undefined;
      this.refreshTable(true);
    },
    onResume () {

    },
    // 增加接口
    onStartFlow () {
      if (this.isEdit || this.processDefinitionKey == null) return;
      let params = {
        processDefinitionKey: this.processDefinitionKey
      }
      FlowOperationController.viewInitialTaskInfo(this, params).then(res => {
        if (res.data.taskKey) {
          const VariableParams = {
            taskKey: res.data.taskKey
          }
          FlowVariableDisplayController.list(this, VariableParams).then(resVariable => {
            if (res.data.taskType === this.SysFlowTaskType.USER_TASK && res.data.assignedMe) {
              this.$router.push({
                name: res.data.routerName || 'handlerFlowTask',
                query: {
                  variableDisplay: resVariable.data.dataList,
                  processDefinitionKey: this.processDefinitionKey,
                  formId: res.data.formId,
                  routerName: res.data.routerName,
                  readOnly: res.data.readOnly,
                  taskName: '启动流程',
                  isDraft: true,
                  flowEntryName: this.processDefinitionName,
                  operationList: (res.data.operationList || []).filter(item => {
                    return item.type !== this.SysFlowTaskOperationType.CO_SIGN && item.type !== this.SysFlowTaskOperationType.REVOKE && item.type !== this.SysFlowTaskOperationType.SIGN_REDUCTION;
                  }),
                  variableList: res.data.variableList
                }
              });
            } else {
              FlowOperationController.startOnly(this, {
                processDefinitionKey: this.processDefinitionKey
              }).then(res => {
                this.$message.success('启动成功！');
              }).catch(e => {});
            }
          }).catch(e => {});
        }
      }).catch(e => {});
    },
    onSubmit (row) {
      if (this.isEdit || this.processDefinitionKey == null) return;
      let taskId = (Array.isArray(row.runtimeTaskInfoList) && row.runtimeTaskInfoList.length > 0) ? row.runtimeTaskInfoList[0].taskId : undefined;
      let params = {
        processInstanceId: row.processInstanceId,
        processDefinitionId: row.processDefinitionId,
        taskId: taskId
      }

      FlowOperationController.viewRuntimeTaskInfo(this, params).then(res => {
        if (res.data) {
          this.$router.push({
            name: res.data.routerName || 'handlerFlowTask',
            query: {
              isRuntime: true,
              isDraft: row.flowStatus === this.SysFlowWorkOrderStatus.DRAFT,
              taskId: taskId,
              processDefinitionKey: row.processDefinitionKey,
              processInstanceId: row.processInstanceId,
              processDefinitionId: row.processDefinitionId,
              formId: res.data.formId,
              routerName: res.data.routerName,
              readOnly: res.data.readOnly,
              taskName: (row.runtimeInitialTask || {}).taskName,
              flowEntryName: row.processDefinitionName,
              processInstanceInitiator: row.processInstanceInitiator,
              operationList: (res.data.operationList || []).filter(item => item.type !== this.SysFlowTaskOperationType.CO_SIGN),
              variableList: res.data.variableList
            }
          });
        }
      }).catch(e => {});
    },
    onView (row) {
      if (this.isEdit || this.processDefinitionKey == null) return;
      let params = {
        processInstanceId: row.processInstanceId
      }
      FlowOperationController.viewInitialHistoricTaskInfo(this, params).then(res => {
        if (res.data) {
          this.$router.push({
            name: res.data.routerName || 'handlerFlowTask',
            query: {
              isRuntime: false,
              processDefinitionKey: row.processDefinitionKey,
              processInstanceId: row.processInstanceId,
              processDefinitionId: row.processDefinitionId,
              formId: res.data.formId,
              routerName: res.data.routerName,
              readOnly: true,
              taskId: row.runtimeTaskInfo.taskId,
              flowEntryName: row.processDefinitionName,
              processInstanceInitiator: row.processInstanceInitiator
            }
          });
        }
      }).catch(e => {});
    },
    onRemindClick (row) {
      FlowOperationController.remindRuntimeTask(this, {
        workOrderId: row.workOrderId
      }).then(res => {
        this.$message.success('催办成功');
      }).catch(e => {});
    },
    onCancelWorkOrder (row) {
      this.$confirm('是否撤销此工单？').then(res => {
        let params = {
          workOrderId: row.workOrderId,
          cancelReason: '主动撤销'
        }

        FlowOperationController.cancelWorkOrder(this, params).then(res => {
          this.$message.success('撤销成功！');
          this.onSearch();
        }).catch(e => {});
      }).catch(e => {});
    }
  },
  computed: {
    form () {
      let temp = buildFormConfig(this.formConfig);
      return temp;
    },
    queryTable () {
      return this.form.tableWidget;
    }
  },
  mounted () {
    this.isReady = false;
    if (!this.isEdit) {
      this.initPage();
      this.initFormWidgetList();
      if (this.entryId) {
        FlowEntryController.viewDict(this, {
          entryId: this.entryId
        }).then(res => {
          this.processDefinitionKey = res.data.processDefinitionKey;
          this.processDefinitionName = res.data.processDefinitionName;
          this.refreshTable(true);
        }).catch(e => {
          console.log(e);
        });
      }
    }
    this.isReady = true;
  }
}
</script>

<style scoped>
  .online-workflow-order-form {
    display: flex;
    flex-direction: column;
  }

  .online-workflow-order-form .query-filter-box {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .online-query-form{
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: 16px 24px 16px;
    flex: 1;
  }
  .online-workflow-order-form .query-table-box {
    height: 200px;
    flex-grow: 1;
    flex-shrink: 1;
  }
</style>
