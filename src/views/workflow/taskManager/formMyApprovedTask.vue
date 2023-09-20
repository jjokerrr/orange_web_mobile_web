<template>
  <!-- 已办任务 -->
  <div style="position: relative;">
    <el-form ref="formMyApprovedTask" :model="formFilter" label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <filter-box :item-width="350" @search="refreshFormMyApprovedTask(true)" @reset="onReset">
        <el-form-item label="流程名称" prop="processDefinitionName">
          <el-input class="filter-item"
            v-model="formFilter.processDefinitionName"
            :clearable="true" placeholder="流程名称"
          />
        </el-form-item>
        <el-form-item label="发起时间" prop="createDate">
          <date-range class="filter-item"
            v-model="formFilter.createDate"
            :clearable="true" :allowTypes="['day']" align="left"
            range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
            format="yyyy-MM-dd" value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box ref="teacher" :data="handlerTaskWidget.dataList" :size="defaultFormItemSize" @sort-change="handlerTaskWidget.onSortChange"
      @refresh="refreshFormMyApprovedTask(true)" :seq-config="{startIndex: ((handlerTaskWidget.currentPage - 1) * handlerTaskWidget.pageSize)}" :hasExtend="false">
      <vxe-column title="序号" type="seq" width="55px" :index="handlerTaskWidget.getTableIndex" />
      <vxe-column title="流程名称" field="processDefinitionName" />
      <vxe-column title="流程标识" field="processDefinitionKey" />
      <vxe-column title="任务名称" field="name" />
      <vxe-column title="执行操作">
        <template slot-scope="scope">
          <span>{{SysFlowTaskOperationType.getValue(scope.row.approvalType)}}</span>
        </template>
      </vxe-column>
      <vxe-column title="发起人登录名" field="startUser" />
      <vxe-column title="发起人昵称" field="showName" />
      <vxe-column title="任务发起时间" field="createTime" />
      <vxe-column title="操作" width="80px">
        <template slot-scope="scope">
          <el-button :size="defaultFormItemSize" type="text" @click="onTaskDetail(scope.row)">详情</el-button>
        </template>
      </vxe-column>
      <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
        <el-pagination
          :total="handlerTaskWidget.totalCount"
          :current-page="handlerTaskWidget.currentPage"
          :page-size="handlerTaskWidget.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="handlerTaskWidget.onCurrentPageChange"
          @size-change="handlerTaskWidget.onPageSizeChange">
        </el-pagination>
      </el-row>
    </table-box>
  </div>
</template>

<script>
import '@/staticDict/flowStaticDict.js';
/* eslint-disable-next-line */
import { TableWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin } from '@/core/mixins';
import { FlowOperationController } from '@/api/flowController.js';

export default {
  name: 'formMyApprovedTask',
  props: {
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin],
  data () {
    return {
      formFilter: {
        processDefinitionName: undefined,
        createDate: []
      },
      formFilterCopy: {
        processDefinitionName: undefined,
        createDate: []
      },
      handlerTaskWidget: new TableWidget(this.loadHandlerTaskData, this.loadHandlerTaskVerify, true, false),
      isInit: false
    }
  },
  methods: {
    onReset () {
      this.$refs.formMyApprovedTask.resetFields();
      this.refreshFormMyApprovedTask(true);
    },
    /**
     * 获取已办任务列表
     */
    loadHandlerTaskData (params) {
      if (params == null) params = {};
      params = {
        ...params,
        processDefinitionName: this.formFilterCopy.processDefinitionName,
        beginDate: this.formFilterCopy.createDate[0],
        endDate: this.formFilterCopy.createDate[1]
      }
      return new Promise((resolve, reject) => {
        FlowOperationController.listHistoricTask(this, params).then(res => {
          resolve({
            dataList: res.data.dataList.map(item => {
              let formInfo = JSON.parse(item.formKey);
              return {
                ...item,
                formInfo
              }
            }),
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 校验已办任务过滤参数
     */
    loadHandlerTaskVerify () {
      this.formFilterCopy.processDefinitionName = this.formFilter.processDefinitionName;
      this.formFilterCopy.createDate = Array.isArray(this.formFilter.createDate) ? [...this.formFilter.createDate] : [];
      return true;
    },
    /**
     * 刷新已办任务列表
     */
    refreshFormMyApprovedTask (reloadData = false) {
      if (reloadData) {
        this.handlerTaskWidget.refreshTable(true, 1);
      } else {
        this.handlerTaskWidget.refreshTable();
      }
    },
    /**
     * 详情
     */
    onTaskDetail (row) {
      let params = {
        taskId: row.id,
        processDefinitionId: row.processDefinitionId,
        processInstanceId: row.processInstanceId
      }

      FlowOperationController.viewHistoricTaskInfo(this, params).then(res => {
        this.$router.push({
          name: res.data.routerName || 'handlerFlowTask',
          query: {
            processDefinitionKey: row.processDefinitionKey,
            taskId: row.id,
            processInstanceId: row.processInstanceId,
            processDefinitionId: row.processDefinitionId,
            formId: (row.formInfo || {}).formId,
            routerName: row.routerName,
            readOnly: true,
            flowEntryName: row.processDefinitionName,
            processInstanceInitiator: row.showName,
            // 在已办理任务中仅显示加签、减签和撤销操作
            operationList: res.data.operationList.filter(item => {
              return item.type === this.SysFlowTaskOperationType.CO_SIGN || item.type === this.SysFlowTaskOperationType.REVOKE || item.type === this.SysFlowTaskOperationType.SIGN_REDUCTION;
            })
          }
        });
      }).then(res => {});
    },
    onResume () {
      this.refreshFormMyApprovedTask();
    },
    initFormData () {
    },
    formInit () {
      this.refreshFormMyApprovedTask();
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
