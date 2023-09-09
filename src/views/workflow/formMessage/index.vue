<template>
  <div class="tab-dialog-box" style="position: relative;">
    <el-tabs v-model="activeFragmentId">
      <el-tab-pane label="催办消息" name="remindingMessage" style="width: 100%;">
        <div class="tab-content-box" :style="'min-height:' + (getMainContextHeight - 76) + 'px'">
          <table-box ref="flowCategory" :data="remindingMessageWidget.dataList" :size="defaultFormItemSize" @sort-change="remindingMessageWidget.onSortChange"
            @refresh="refreshRemindingMessage(true)" :seq-config="{startIndex: ((remindingMessageWidget.currentPage - 1) * remindingMessageWidget.pageSize)}">
            <vxe-column title="序号" type="seq" width="55px" :index="remindingMessageWidget.getTableIndex" />
            <vxe-column title="流程名称" field="processDefinitionName" />
            <vxe-column title="任务名称" field="taskName" />
            <vxe-column title="催办人" field="createUsername" />
            <vxe-column title="任务创建时间" field="taskStartTime" />
            <vxe-column title="催办时间" field="createTime" />
            <vxe-column title="操作" width="100px">
              <template slot-scope="scope">
                <el-button type="text" :size="defaultFormItemSize" @click="onSubmit(scope.row)">办理</el-button>
              </template>
            </vxe-column>
            <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
              <el-pagination
                :total="remindingMessageWidget.totalCount"
                :current-page="remindingMessageWidget.currentPage"
                :page-size="remindingMessageWidget.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, prev, pager, next, sizes"
                @current-change="remindingMessageWidget.onCurrentPageChange"
                @size-change="remindingMessageWidget.onPageSizeChange">
              </el-pagination>
            </el-row>
          </table-box>
        </div>
      </el-tab-pane>
      <el-tab-pane label="抄送消息" name="copyMessage" style="width: 100%;">
        <div class="tab-content-box" :style="'min-height:' + (getMainContextHeight - 76) + 'px'">
          <table-box ref="flowCategory" :data="copyMessageWidget.dataList" :size="defaultFormItemSize" @sort-change="copyMessageWidget.onSortChange"
          @refresh="refreshCopyMessage(true)" :seq-config="{startIndex: ((copyMessageWidget.currentPage - 1) * copyMessageWidget.pageSize)}">
            <el-radio-group slot="operator" :size="defaultFormItemSize" v-model="messageStatus" @change="refreshCopyMessage(true)">
              <el-radio-button :label="1">已读消息</el-radio-button>
              <el-radio-button :label="0">未读消息</el-radio-button>
            </el-radio-group>
            <vxe-column title="序号" type="seq" width="55px" :index="copyMessageWidget.getndex" />
            <vxe-column title="流程名称" field="processDefinitionName" />
            <vxe-column title="任务名称" field="taskName" />
            <vxe-column title="抄送人" field="createUsername" />
            <vxe-column title="任务创建时间" field="taskStartTime" />
            <vxe-column title="抄送时间" field="createTime" />
            <vxe-column title="操作" width="100px">
              <template slot-scope="scope">
                <el-button type="text" :size="defaultFormItemSize" @click="onSubmit(scope.row, scope.row.messageId)">详情</el-button>
              </template>
            </vxe-column>
            <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
              <el-pagination
                :total="copyMessageWidget.totalCount"
                :current-page="copyMessageWidget.currentPage"
                :page-size="copyMessageWidget.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, prev, pager, next, sizes"
                @current-change="copyMessageWidget.onCurrentPageChange"
                @size-change="copyMessageWidget.onPageSizeChange">
              </el-pagination>
            </el-row>
          </table-box>
        </div>
      </el-tab-pane>
    </el-tabs>
    <label class="page-close-box" @click="onClose(true)">
      <img src="@/assets/img/back2.png" alt=""/>
    </label>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { uploadMixin, statsDateRangeMixin, cachePageMixin } from '@/core/mixins';
import { TableWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { FlowOperationController, FlowVariableDisplayController } from '@/api/flowController.js';

export default {
  name: 'formMessage',
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin],
  props: {
    type: {
      type: String,
      default: 'remindingMessage'
    }
  },
  data () {
    return {
      activeFragmentId: 'remindingMessage',
      messageStatus: 1,
      remindingMessageWidget: new TableWidget(this.loadRemindingMessageData, this.loadRemindingMessageVerify, true, false, 'createTime', 1),
      copyMessageWidget: new TableWidget(this.loadCopyMessageData, this.loadCopyMessageVerify, true, false, 'createTime', 1)
    }
  },
  methods: {
    onClose () {
      this.$router.go(-1);
    },
    loadRemindingMessageData (params) {
      if (params == null) params = {};
      return new Promise((resolve, reject) => {
        FlowOperationController.listRemindingTask(this, params).then(res => {
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    loadRemindingMessageVerify () {
      return true;
    },
    loadCopyMessageData (params) {
      if (params == null) params = {};
      params.read = this.messageStatus === 1;
      return new Promise((resolve, reject) => {
        FlowOperationController.listCopyMessage(this, params).then(res => {
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    loadCopyMessageVerify () {
      return true;
    },
    refreshRemindingMessage (reloadData = false) {
      if (reloadData) {
        this.remindingMessageWidget.refreshTable(true, 1);
      } else {
        this.remindingMessageWidget.refreshTable();
      }
    },
    refreshCopyMessage (reloadData = false) {
      if (reloadData) {
        this.copyMessageWidget.refreshTable(true, 1);
      } else {
        this.copyMessageWidget.refreshTable();
      }
    },
    refreshFormMessage (reloadData = false) {
      if (reloadData) {
        this.remindingMessageWidget.refreshTable(true, 1);
        this.copyMessageWidget.refreshTable(true, 1);
      } else {
        this.remindingMessageWidget.refreshTable();
        this.copyMessageWidget.refreshTable();
      }
    },
    // 增加接口
    onSubmit (row, messageId) {
      // 是否抄送消息
      let isCopy = messageId != null;
      let params = {
        processInstanceId: row.processInstanceId,
        processDefinitionId: row.processDefinitionId,
        taskId: row.taskId
      }
      let httpCall = isCopy ? FlowOperationController.viewInitialHistoricTaskInfo(this, params) : FlowOperationController.viewRuntimeTaskInfo(this, params);
      httpCall.then(res => {
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
                isRuntime: !isCopy,
                taskId: row.taskId,
                messageId: messageId,
                processDefinitionKey: row.processDefinitionKey,
                processInstanceId: row.processInstanceId,
                processDefinitionId: row.processDefinitionId,
                formId: res.data.formId,
                routerName: res.data.routerName,
                readOnly: isCopy ? true : res.data.readOnly,
                taskName: row.taskName,
                flowEntryName: row.processDefinitionName,
                processInstanceInitiator: row.processInstanceInitiator,
                // 过滤掉加签和撤销操作，加签只有在已完成任务里可以操作
                operationList: (res.data.operationList || []).filter(item => {
                  return item.type !== this.SysFlowTaskOperationType.CO_SIGN && item.type !== this.SysFlowTaskOperationType.REVOKE && item.type !== this.SysFlowTaskOperationType.SIGN_REDUCTION;
                }),
                variableList: res.data.variableList
              }
            });
          }).catch(e => {});
        }
      }).catch(e => {});
    },
    onResume () {
      this.refreshFormMessage();
    },
    initFormData () {
    },
    formInit () {
      this.refreshFormMessage();
    }
  },
  mounted () {
    // 初始化页面数据
    this.formInit();
  },
  computed: {
    ...mapGetters(['getMainContextHeight'])
  },
  watch: {
    type: {
      handler (val) {
        this.activeFragmentId = val;
        this.messageStatus = 0;
      },
      immediate: true
    }
  }
}
</script>
<style lang="scss" scoped>
.tab-dialog-box{
  padding: 0 !important;
  margin: 0 !important;
  background-color: #f6f6f6 !important;
  ::v-deep .el-tabs__header{
    margin-bottom: 0;
    background-color: white;
    border-top: 1px solid #E8E8E8;
  }
  ::v-deep .el-tabs__nav-wrap::after{
    display: none;
  }
  ::v-deep .el-tabs__item{
    height: 44px;
    line-height: 44px;
  }
  ::v-deep .el-tabs__nav-wrap{
    padding-left: 24px;
  }
  ::v-deep .el-tabs__content{
    overflow: hidden;
  }

  .tab-content-box{
    margin: 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .page-back-box{
    position: absolute;
    top: 0;
    right: 16px;
    height: 44px;
    display: flex;
    align-items: center;
    ::v-deep .el-button span{
      display: flex;
      align-items: center;
      img{
        margin-right: 4px;
      }
    }
  }
}
</style>
