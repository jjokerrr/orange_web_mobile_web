<template>
  <!-- 历史任务 -->
  <div style="position: relative;">
    <el-form ref="formMyHistoryTask" :model="formFilter" label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <filter-box :item-width="350" @search="refreshFormMyHistoryTask(true)" @reset="onReset">
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
    <table-box ref="teacher" :data="formMyHistoryTaskWidget.dataList" :size="defaultFormItemSize" @sort-change="formMyHistoryTaskWidget.onSortChange"
      @refresh="refreshFormMyHistoryTask(true)" :seq-config="{startIndex: ((formMyHistoryTaskWidget.currentPage - 1) * formMyHistoryTaskWidget.pageSize)}" :hasExtend="false">
      <vxe-column title="序号" type="seq" width="55px" :index="formMyHistoryTaskWidget.getTableIndex" />
      <vxe-column title="流程名称" field="processDefinitionName" />
      <vxe-column title="流程标识" field="processDefinitionKey" />
      <vxe-column title="发起人登录名" field="startUserId" />
      <vxe-column title="发起人昵称" field="showName" />
      <vxe-column title="任务发起时间" field="startTime" />
      <vxe-column title="任务结束时间" field="endTime" />
      <vxe-column title="操作" width="80px">
        <template slot-scope="scope">
          <el-button :size="defaultFormItemSize" type="text" @click="onFlowDetail(scope.row)">详情</el-button>
        </template>
      </vxe-column>
      <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
        <el-pagination
          :total="formMyHistoryTaskWidget.totalCount"
          :current-page="formMyHistoryTaskWidget.currentPage"
          :page-size="formMyHistoryTaskWidget.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="formMyHistoryTaskWidget.onCurrentPageChange"
          @size-change="formMyHistoryTaskWidget.onPageSizeChange">
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
  name: 'formMyHistoryTask',
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
      formMyHistoryTaskWidget: new TableWidget(this.loadMyHistoryTaskData, this.loadMyHistoryTaskVerify, true, false),
      isInit: false
    }
  },
  methods: {
    onReset () {
      this.$refs.formMyHistoryTask.resetFields();
      this.refreshFormMyHistoryTask(true);
    },
    /**
     * 获取所有流程实例
     */
    loadMyHistoryTaskData (params) {
      if (params == null) params = {};
      params = {
        ...params,
        processDefinitionName: this.formFilterCopy.processDefinitionName,
        beginDate: this.formFilterCopy.createDate[0],
        endDate: this.formFilterCopy.createDate[1]
      }

      return new Promise((resolve, reject) => {
        FlowOperationController.listHistoricProcessInstance(this, params).then(res => {
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    loadMyHistoryTaskVerify () {
      this.formFilterCopy.processDefinitionName = this.formFilter.processDefinitionName;
      this.formFilterCopy.createDate = Array.isArray(this.formFilter.createDate) ? [...this.formFilter.createDate] : [];
      return true;
    },
    refreshFormMyHistoryTask (reloadData = false) {
      if (reloadData) {
        this.formMyHistoryTaskWidget.refreshTable(true, 1);
      } else {
        this.formMyHistoryTaskWidget.refreshTable();
      }
      if (!this.isInit) {
        // 初始化下拉数据
      }
      this.isInit = true;
    },
    onFlowDetail (row) {
      let params = {
        processInstanceId: row.processInstanceId
      }

      FlowOperationController.viewInitialHistoricTaskInfo(this, params).then(res => {
        if (res.data) {
          this.$router.push({
            name: res.data.routerName || 'handlerFlowTask',
            query: {
              processDefinitionKey: row.processDefinitionKey,
              taskId: null,
              processInstanceId: row.processInstanceId,
              processDefinitionId: row.processDefinitionId,
              formId: res.data.formId,
              routerName: res.data.routerName,
              readOnly: true,
              flowEntryName: row.processDefinitionName,
              processInstanceInitiator: row.showName
            }
          });
        }
      }).catch(e => {});
    },
    onResume () {
      this.refreshFormMyHistoryTask();
    },
    initFormData () {
    },
    formInit () {
      this.refreshFormMyHistoryTask();
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
