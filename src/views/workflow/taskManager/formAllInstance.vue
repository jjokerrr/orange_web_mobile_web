<template>
  <!-- 流程实例 -->
  <div style="position: relative;">
    <el-form ref="formAllInstance" :model="formFilter" label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <filter-box :item-width="350" @search="refreshFormAllInstance(true)" @reset="onReset">
        <el-form-item label="流程名称" prop="processDefinitionName">
          <el-input class="filter-item"
            v-model="formFilter.processDefinitionName"
            :clearable="true" placeholder="流程名称"
          />
        </el-form-item>
        <el-form-item label="发起人" prop="startUser">
          <el-input class="filter-item"
            v-model="formFilter.startUser"
            :clearable="true" placeholder="发起人"
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
    <table-box :data="formAllInstanceWidget.dataList"
      :size="defaultFormItemSize"
      @sort-change="formAllInstanceWidget.onSortChange"
      @refresh="refreshFormAllInstance(true)"
      :seq-config="{startIndex: ((formAllInstanceWidget.currentPage - 1) * formAllInstanceWidget.pageSize)}"
      :hasExtend="false"
    >
      <vxe-column title="序号" type="seq" width="55px" :index="formAllInstanceWidget.getTableIndex" />
      <vxe-column title="流程名称" field="processDefinitionName" />
      <vxe-column title="流程标识" field="processDefinitionKey" />
      <vxe-column title="任务发起人" field="startUserId" />
      <vxe-column title="任务发起时间" field="startTime" />
      <vxe-column title="任务结束时间" field="endTime" />
      <vxe-column title="操作" width="265px">
        <template slot-scope="scope">
          <el-button :size="defaultFormItemSize" type="text" @click="onShowProcessViewer(scope.row)">流程图</el-button>
          <el-button :size="defaultFormItemSize" type="text"
            :disabled="scope.row.processInstanceId == null || scope.row.taskId == null || !checkPermCodeExist('formAllInstance:formAllInstance:stop')"
            @click="onInterpose(scope.row)"
          >
            干预
          </el-button>
          <el-button :size="defaultFormItemSize" type="text"
            :disabled="!Array.isArray(scope.row.flowTransList) || scope.row.flowTransList.length === 0 || !checkPermCodeExist('formAllInstance:formAllInstance:fixBusinessData')"
            @click="onCompensation(scope.row)"
          >
            数据补偿
          </el-button>
          <el-button :size="defaultFormItemSize" type="text"
            :disabled="scope.row.endTime != null || !checkPermCodeExist('formAllInstance:formAllInstance:stop')"
            @click="onStopTask(scope.row)">
            终止
          </el-button>
          <el-button :size="defaultFormItemSize" type="text"
            :disabled="scope.row.endTime == null || !checkPermCodeExist('formAllInstance:formAllInstance:delete')"
            @click="onDeleteTask(scope.row)">
            删除
          </el-button>
        </template>
      </vxe-column>
      <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
        <el-pagination
          :total="formAllInstanceWidget.totalCount"
          :current-page="formAllInstanceWidget.currentPage"
          :page-size="formAllInstanceWidget.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="formAllInstanceWidget.onCurrentPageChange"
          @size-change="formAllInstanceWidget.onPageSizeChange">
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
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import { FlowOperationController } from '@/api/flowController.js';
import FormTaskProcessViewer from './formTaskProcessViewer.vue';
import StopTask from './stopTask.vue';
import FormInterposeInstance from './formInterposeInstance.vue';
import ProcessDataCompensation from './processCompensation.vue';

export default {
  name: 'formAllInstance',
  props: {
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin, refreshDataMixins],
  data () {
    return {
      formFilter: {
        processDefinitionName: undefined,
        startUser: undefined,
        createDate: []
      },
      formFilterCopy: {
        processDefinitionName: undefined,
        startUser: undefined,
        createDate: []
      },
      formAllInstanceWidget: new TableWidget(this.loadAllTaskData, this.loadAllTaskVerify, true, false),
      isInit: false
    }
  },
  methods: {
    refreshData () {
      this.refreshFormAllInstance()
    },
    onReset () {
      this.$refs.formAllInstance.resetFields();
      this.refreshFormAllInstance(true);
    },
    /**
     * 获取所有流程实例
     */
    loadAllTaskData (params) {
      if (params == null) params = {};
      params = {
        ...params,
        processDefinitionName: this.formFilterCopy.processDefinitionName,
        startUser: this.formFilterCopy.startUser,
        beginDate: this.formFilterCopy.createDate[0],
        endDate: this.formFilterCopy.createDate[1]
      }

      return new Promise((resolve, reject) => {
        FlowOperationController.listAllHistoricProcessInstance(this, params).then(res => {
          res.data.dataList.forEach(item => {
            item.taskId = (Array.isArray(item.runtimeTaskInfoList) && item.runtimeTaskInfoList.length > 0) ? item.runtimeTaskInfoList[0].taskId : undefined;
          });
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    loadAllTaskVerify () {
      this.formFilterCopy.processDefinitionName = this.formFilter.processDefinitionName;
      this.formFilterCopy.startUser = this.formFilter.startUser;
      this.formFilterCopy.createDate = Array.isArray(this.formFilter.createDate) ? [...this.formFilter.createDate] : [];
      return true;
    },
    refreshFormAllInstance (reloadData = false) {
      if (reloadData) {
        this.formAllInstanceWidget.refreshTable(true, 1);
      } else {
        this.formAllInstanceWidget.refreshTable();
      }
      if (!this.isInit) {
        // 初始化下拉数据
      }
      this.isInit = true;
    },
    onShowProcessViewer (row) {
      this.$dialog.show('流程图', FormTaskProcessViewer, {
        area: ['1200px', '750px']
      }, {
        processDefinitionId: row.processDefinitionId,
        processInstanceId: row.processInstanceId
      }, {
        width: '1200px',
        height: '750px',
        pathName: '/thirdParty/thirdFormTaskProcessViewer'
      }).catch(e => {});
    },
    onStopTask (row) {
      this.$dialog.show('终止任务', StopTask, {
        area: '500px'
      }, {
        processInstanceId: row.processInstanceId,
        taskId: row.taskId
      }, {
        width: '500px',
        height: '200px',
        pathName: '/thirdParty/thirdFormStopTaskInstance'
      }).then(res => {
        this.formAllInstanceWidget.refreshTable();
      }).catch(e => {});
    },
    onDeleteTask (row) {
      this.$confirm('是否删除此流程实例？').then(res => {
        return FlowOperationController.deleteProcessInstance(this, {
          processInstanceId: row.processInstanceId
        });
      }).then(res => {
        this.$message.success('删除成功');
        this.formAllInstanceWidget.refreshTable();
      }).catch(e => {});
    },
    onInterpose (row) {
      this.$dialog.show('流程干预', FormInterposeInstance, {
        area: '500px'
      }, {
        processDefinitionId: row.processDefinitionId,
        processInstanceId: row.processInstanceId,
        taskId: row.taskId
      }, {
        width: '500px',
        height: '280px',
        pathName: '/thirdParty/thirdFormInterposeInstance'
      }).then(res => {
        this.refreshFormAllInstance();
      }).catch(e => {});
    },
    onCompensation (row) {
      this.$dialog.show('数据补偿', ProcessDataCompensation, {
        area: '1100px',
        offset: '60px'
      }, {
        dataList: row.flowTransList
      }, {
        width: '800px',
        height: '600px',
        pathName: '/thirdParty/thirdFormCompensationInstance'
      }).then(res => {
        this.refreshFormAllInstance();
      }).catch(e => {});
    },
    onResume () {
      this.refreshFormAllInstance();
    },
    initFormData () {
    },
    formInit () {
      this.refreshFormAllInstance();
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
