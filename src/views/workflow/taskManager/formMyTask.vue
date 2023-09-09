<template>
  <!-- 待办任务 -->
  <div style="position: relative;">
    <el-form ref="formMyTask" :model="formMyTask" label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <filter-box :item-width="350" @search="refreshMyTask(true)" @reset="onReset">
        <el-form-item label="流程名称" prop="formFilter.processDefinitionName">
          <el-input class="filter-item" v-model="formMyTask.formFilter.processDefinitionName"
            :clearable="true" placeholder="流程名称" />
        </el-form-item>
        <el-form-item label="流程标识" prop="formFilter.processDefinitionKey">
          <el-input class="filter-item" v-model="formMyTask.formFilter.processDefinitionKey"
            :clearable="true" placeholder="流程标识" />
        </el-form-item>
        <el-form-item label="任务名称" prop="formFilter.taskName">
          <el-input class="filter-item" v-model="formMyTask.formFilter.taskName"
            :clearable="true" placeholder="任务名称" />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box ref="flowEntry" :data="formMyTask.taskWidget.dataList" :size="defaultFormItemSize" @sort-change="formMyTask.taskWidget.onSortChange"
      @refresh="refreshMyTask(true)" :seq-config="{startIndex: ((formMyTask.taskWidget.currentPage - 1) * formMyTask.taskWidget.pageSize)}" :hasExtend="false">
      <vxe-column title="序号" type="seq" width="55px" :index="formMyTask.taskWidget.getTableIndex" />
      <vxe-column title="流程名称" field="processDefinitionName" />
      <vxe-column title="当前任务" field="taskName" />
      <vxe-column title="发起人登录名" field="processInstanceInitiator" />
      <vxe-column title="发起人昵称" field="showName" />
      <vxe-column title="任务发起时间" field="processInstanceStartTime" />
      <vxe-column title="操作" width="80px">
        <template slot-scope="scope">
          <el-button :size="defaultFormItemSize" type="text" @click="onSubmit(scope.row)">办理</el-button>
        </template>
      </vxe-column>
      <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
        <el-pagination
          :total="formMyTask.taskWidget.totalCount"
          :current-page="formMyTask.taskWidget.currentPage"
          :page-size="formMyTask.taskWidget.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="formMyTask.taskWidget.onCurrentPageChange"
          @size-change="formMyTask.taskWidget.onPageSizeChange">
        </el-pagination>
      </el-row>
    </table-box>
  </div>
</template>

<script>
import '@/staticDict/flowStaticDict.js';
/* eslint-disable-next-line */
import { DropdownWidget, TableWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { FlowVariableDisplayController, FlowOperationController } from '@/api/flowController.js';

export default {
  name: 'formMyTask',
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin],
  data () {
    return {
      formMyTask: {
        formFilter: {
          processDefinitionName: undefined,
          processDefinitionKey: undefined,
          taskName: undefined
        },
        formFilterCopy: {
          processDefinitionName: undefined,
          processDefinitionKey: undefined,
          taskName: undefined
        },
        taskWidget: new TableWidget(this.loadTaskData, this.loadTaskDataVerify, true, false, 'entryId', 1),
        isInit: false
      }
    }
  },
  methods: {
    onReset () {
      this.$refs.formMyTask.resetFields();
      this.refreshMyTask(true);
    },
    loadTaskData (params) {
      if (params == null) params = {};
      params = {
        processDefinitionName: this.formMyTask.formFilterCopy.processDefinitionName,
        processDefinitionKey: this.formMyTask.formFilterCopy.processDefinitionKey,
        taskName: this.formMyTask.formFilterCopy.taskName,
        ...params
      }
      return new Promise((resolve, reject) => {
        FlowOperationController.listRuntimeTask(this, params).then(res => {
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    loadTaskDataVerify () {
      this.formMyTask.formFilterCopy.processDefinitionName = this.formMyTask.formFilter.processDefinitionName;
      this.formMyTask.formFilterCopy.processDefinitionKey = this.formMyTask.formFilter.processDefinitionKey;
      this.formMyTask.formFilterCopy.taskName = this.formMyTask.formFilter.taskName;
      return true;
    },
    // 增加接口
    onSubmit (row) {
      let params = {
        processInstanceId: row.processInstanceId,
        processDefinitionId: row.processDefinitionId,
        taskId: row.taskId
      }

      FlowOperationController.viewRuntimeTaskInfo(this, params).then(res => {
        if (res.data) {
          // console.log('案例关键值：', res.data.taskKey);
          const VariableParams = {
            taskKey: res.data.taskKey
          }
          FlowVariableDisplayController.list(this, VariableParams).then(resVariable => {
            console.log(resVariable);
            this.$router.push({
              name: res.data.routerName || 'handlerFlowTask',
              query: {
                variableDisplay: resVariable.data.dataList,
                isRuntime: true,
                isDraft: row.isDraft,
                taskId: row.taskId,
                processDefinitionKey: row.processDefinitionKey,
                processInstanceId: row.processInstanceId,
                processDefinitionId: row.processDefinitionId,
                formId: res.data.formId,
                routerName: res.data.routerName,
                readOnly: res.data.readOnly,
                taskName: row.taskName,
                flowEntryName: row.processDefinitionName,
                processInstanceInitiator: row.showName,
                // 过滤掉加签、减签操作，加签、减签只有在已完成任务里可以操作
                operationList: (res.data.operationList || []).filter(item => {
                  return item.type !== this.SysFlowTaskOperationType.CO_SIGN && item.type !== this.SysFlowTaskOperationType.REVOKE && item.type !== this.SysFlowTaskOperationType.SIGN_REDUCTION
                }),
                variableList: res.data.variableList
              }
            });
          }).catch(e => {});
        }
      }).catch(e => {});
    },
    refreshMyTask (reloadData = false) {
      if (reloadData) {
        this.formMyTask.taskWidget.refreshTable(true, 1);
      } else {
        this.formMyTask.taskWidget.refreshTable();
      }
    },
    onResume () {
      this.refreshMyTask();
    },
    formInit () {
      this.refreshMyTask();
    }
  },
  mounted () {
    // 初始化页面数据
    this.formInit();
  }
}
</script>

<style>
</style>
