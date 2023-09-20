<template>
  <div class="flow-task" style="position: relative;background-color: white;padding: 16px 24px 16px">
    <div class="task-title">
      <div>
        <span class="text">{{flowInfo.flowEntryName}}</span>
        <el-tag v-if="flowInfo.taskName" effect="dark" :size="defaultFormItemSize" type="success">{{'当前节点：' + flowInfo.taskName}}</el-tag>
        <el-tag v-if="flowInfo.processInstanceInitiator" effect="dark" :size="defaultFormItemSize" type="info">{{'发起人：' + flowInfo.processInstanceInitiator}}</el-tag>
      </div>
    </div>
    <el-row type="flex" justify="space-between" style="margin-bottom: 24px;">
      <el-radio-group size="small" v-model="currentPage" style="min-width: 400px;">
        <el-radio-button label="formInfo">表单信息</el-radio-button>
        <el-radio-button v-if="processInstanceId == null || isRuntime || isRuntime === 'true' || isDraft || isDraft === 'true'" label="copyInfo">抄送设置</el-radio-button>
        <el-radio-button v-if="processInstanceId != null && !isDraft" label="flowProcess">流程图</el-radio-button>
        <el-radio-button v-if="processInstanceId != null && !isDraft" label="approveInfo">审批记录</el-radio-button>
        <el-radio-button v-if="taskId != null && !isDraft" label="assigneeList">审批人</el-radio-button>
      </el-radio-group>
      <el-row class="task-operation" type="flex" justify="end">
        <el-button v-if="canDraft" size="mini" type="success" :plain="true" @click="handlerDraft">保存草稿</el-button>
        <template v-if="$slots.operations">
          <slot name="operations" />
        </template>
        <template v-else>
          <el-button v-for="(operation, index) in flowOperationList" :key="index"
            size="small" :type="getButtonType(operation.type) || 'primary'" :plain="operation.plain || false"
            @click="handlerOperation(operation)">
            {{operation.label}}
          </el-button>
        </template>
      </el-row>
    </el-row>
    <el-scrollbar class="custom-scroll" :style="{height: (getMainContextHeight - 180) + 'px'}">
      <el-form ref="form" class="full-width-input" style="width: 100%;"
        label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
        <!-- 表单信息 -->
        <el-row v-show="currentPage === 'formInfo'" type="flex" :key="formKey">
          <slot />
        </el-row>
        <!-- 审批记录 -->
        <el-row v-show="currentPage === 'approveInfo'" :gutter="20">
          <el-col :span="24">
            <vxe-table :data="flowTaskCommentList" :size="defaultFormItemSize" header-cell-class-name="table-header-gray" :height="(getMainContextHeight - 150) + 'px'">
              <vxe-column title="序号" type="seq" width="100"/>
              <vxe-column title="流程环节" field="taskName"/>
              <vxe-column title="执行人" field="createUsername"/>
              <vxe-column title="操作" width="150px">
                <template slot-scope="scope">
                  <el-tag :size="defaultFormItemSize" :type="getOperationTagType(scope.row.approvalType)" effect="dark">{{SysFlowTaskOperationType.getValue(scope.row.approvalType)}}</el-tag>
                  <el-tag v-if="scope.row.delegateAssignee != null" :size="defaultFormItemSize" type="success" effect="plain" style="margin-left: 10px;">{{scope.row.delegateAssignee}}</el-tag>
                </template>
              </vxe-column>
              <vxe-column title="审批意见">
                <template slot-scope="scope">
                  <span>{{scope.row.taskComment ? scope.row.taskComment : ''}}</span>
                </template>
              </vxe-column>
              <vxe-column title="处理时间" field="createTime"/>
              <template slot="empty">
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png">
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-col>
        </el-row>
        <!-- 流程图 -->
        <el-row v-if="currentPage === 'flowProcess'">
          <ProcessViewer :style="{height: (getMainContextHeight - 148) + 'px'}"
            :xml="processXml"
            :finishedInfo="finishedInfo"
            :allCommentList="flowTaskCommentList"
          />
        </el-row>
        <!-- 抄送设置 -->
        <el-row v-show="currentPage === 'copyInfo'">
          <el-col :span="24" style="border-top: 1px solid #EBEEF5">
            <CopyForSelect v-model="copyItemList" />
          </el-col>
        </el-row>
        <!-- 审批人列表 -->
        <el-row v-show="currentPage === 'assigneeList'" :gutter="20">
          <el-col :span="24">
            <vxe-table :data="assigneeList" :size="defaultFormItemSize" header-cell-class-name="table-header-gray" :height="(getMainContextHeight - 150) + 'px'">
              <vxe-column title="序号" type="seq" width="100" />
              <vxe-column title="审批人" field="loginName" />
              <vxe-column title="昵称" field="showName" />
              <vxe-column title="处理时间" field="lastApprovalTime" />
              <template slot="empty">
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png">
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-col>
        </el-row>
      </el-form>
    </el-scrollbar>
    <label class="page-close-box" @click="onClose(true)">
      <img src="@/assets/img/back2.png" alt=""/>
    </label>
  </div>
</template>

<script>
import '../package/theme/index.scss';
import { mapGetters } from 'vuex';
/* eslint-disable-next-line */
import { cachedPageChildMixin } from '@/core/mixins';
import { FlowOperationController } from '@/api/flowController.js';
import ProcessViewer from '@/views/workflow/components/ProcessViewer.vue';
import CopyForSelect from '@/views/workflow/components/CopyForSelect/index.vue';

export default {
  name: 'handlerFowTask',
  props: {
    // 流程实例id
    processInstanceId: {
      type: String
    },
    // 流程定义id
    processDefinitionId: {
      type: String
    },
    isRuntime: {
      type: [Boolean, String]
    },
    isDraft: {
      type: [Boolean, String],
      default: false
    },
    // 流程名称
    flowEntryName: {
      type: String
    },
    // 发起人
    processInstanceInitiator: {
      type: String
    },
    // 当前任务ID
    taskId: {
      type: String
    },
    // 当前任务节点名称
    taskName: {
      type: String
    },
    // 当前任务节点操作列表
    operationList: {
      type: Array
    }
  },
  components: {
    ProcessViewer,
    CopyForSelect
  },
  mixins: [cachedPageChildMixin],
  data () {
    return {
      formKey: new Date().getTime(),
      currentPage: 'formInfo',
      processXml: undefined,
      finishedInfo: undefined,
      flowInfo: {
        taskName: this.taskName,
        flowEntryName: this.flowEntryName,
        processInstanceInitiator: this.processInstanceInitiator
      },
      flowTaskCommentList: [],
      copyItemList: [],
      assigneeList: []
    }
  },
  methods: {
    onClose () {
      this.$emit('close');
    },
    getButtonType (type) {
      switch (type) {
        case this.SysFlowTaskOperationType.AGREE:
        case this.SysFlowTaskOperationType.TRANSFER:
        case this.SysFlowTaskOperationType.CO_SIGN:
        case this.SysFlowTaskOperationType.SIGN_REDUCTION:
        case this.SysFlowTaskOperationType.MULTI_AGREE:
        case this.SysFlowTaskOperationType.MULTI_SIGN:
        case this.SysFlowTaskOperationType.SET_ASSIGNEE:
          return 'primary';
        case this.SysFlowTaskOperationType.SAVE:
          return 'success';
        case this.SysFlowTaskOperationType.REFUSE:
        case this.SysFlowTaskOperationType.PARALLEL_REFUSE:
        case this.SysFlowTaskOperationType.MULTI_REFUSE:
          return 'default';
        case this.SysFlowTaskOperationType.REJECT:
        case this.SysFlowTaskOperationType.REJECT_TO_START:
        case this.SysFlowTaskOperationType.REJECT_TO_TASK:
        case this.SysFlowTaskOperationType.REVOKE:
          return 'danger';
        default: return 'default';
      }
    },
    getOperationTagType (type) {
      switch (type) {
        case this.SysFlowTaskOperationType.AGREE:
        case this.SysFlowTaskOperationType.MULTI_AGREE:
        case this.SysFlowTaskOperationType.SET_ASSIGNEE:
          return 'success';
        case this.SysFlowTaskOperationType.REFUSE:
        case this.SysFlowTaskOperationType.PARALLEL_REFUSE:
        case this.SysFlowTaskOperationType.MULTI_REFUSE:
          return 'warning';
        case this.SysFlowTaskOperationType.STOP:
        case this.SysFlowTaskOperationType.REJECT:
        case this.SysFlowTaskOperationType.REJECT_TO_START:
        case this.SysFlowTaskOperationType.REJECT_TO_TASK:
        case this.SysFlowTaskOperationType.REVOKE:
          return 'danger';
        default:
          return 'primary';
      }
    },
    handlerOperation (operation) {
      if (this.processInstanceId == null && this.taskId == null) {
        this.$emit('start', operation, this.copyItemList, this.processXml);
      } else {
        this.$emit('submit', operation, this.copyItemList, this.processXml);
      }
    },
    // 保存草稿
    handlerDraft () {
      this.$emit('draft');
    },
    getTaskHighlightData () {
      if (this.processInstanceId == null || this.processInstanceId === '') {
        return;
      }
      let params = {
        processInstanceId: this.processInstanceId
      }

      FlowOperationController.viewHighlightFlowData(this, params).then(res => {
        // 已完成节点
        this.finishedInfo = res.data;
      }).catch(e => {});
    },
    getTaskProcessXml () {
      if (this.processDefinitionId == null || this.processDefinitionId === '') {
        return;
      }
      let params = {
        processDefinitionId: this.processDefinitionId
      }
      FlowOperationController.viewProcessBpmn(this, params).then(res => {
        // 当前流程实例xml
        this.processXml = res.data;
      }).catch(e => {});
    },
    loadProcessCommentList () {
      this.flowTaskCommentList = [];
      if (this.processInstanceId == null || this.processInstanceId === '') {
        return;
      }
      FlowOperationController.listFlowTaskComment(this, {
        processInstanceId: this.processInstanceId
      }).then(res => {
        this.flowTaskCommentList = res.data;
      }).catch(e => {});
    },
    loadAssigneeList () {
      if (this.taskId == null) return;
      let params = {
        processDefinitionId: this.processDefinitionId,
        processInstanceId: this.processInstanceId,
        taskId: this.taskId,
        historic: !(this.isRuntime || this.isRuntime === 'true')
      }

      FlowOperationController.viewTaskUserInfo(this, params).then(res => {
        this.assigneeList = res.data;
      }).catch(e => {});
    }
  },
  computed: {
    isReadOnly () {
      return typeof this.readOnly === 'string' ? this.readOnly === 'true' : this.readOnly;
    },
    flowOperationList () {
      if (Array.isArray(this.operationList)) {
        return this.operationList.map(item => {
          if (item.type === this.SysFlowTaskOperationType.MULTI_SIGN && item.multiSignAssignee != null) {
            let multiSignAssignee = {
              ...item.multiSignAssignee
            }
            multiSignAssignee.assigneeList = item.multiSignAssignee.assigneeList ? multiSignAssignee.assigneeList.split(',') : undefined;
            return {
              ...item,
              multiSignAssignee
            }
          } else {
            return {
              ...item
            }
          }
        });
      } else {
        return [];
      }
    },
    canDraft () {
      // 启动或者草稿状态
      return this.processInstanceId == null || this.isDraft || this.isDraft === 'true';
    },
    ...mapGetters(['getMainContextHeight'])
  },
  mounted () {
    this.getTaskHighlightData();
    this.getTaskProcessXml();
    this.loadProcessCommentList();
    this.loadAssigneeList();
  }
}
</script>

<style lang="scss" scoped>
  .task-title {
    display: flex;
    justify-content: space-between;
    padding-bottom: 6px;
    margin-bottom: 16px;
    border-bottom: 2px solid #E8E8E8;
  }
  .task-title .text {
    height: 28px;
    line-height: 28px;
    font-weight: 600;
    font-size: 16px;
    color: #383838;
  }

  .task-title .el-tag {
    margin-left: 10px;
  }
  .third-party .flow-task{
    overflow: hidden;
  }
  .page-back-box{
    position: absolute;
    top: 12px;
    right: 24px;
    ::v-deep .el-button span{
      display: flex;
      align-items: center;
      img{
        margin-right: 4px;
      }
    }
  }
  .el-tag{
    border: 0;
    &.el-tag--dark{
      background-color: rgba(64,142,241,0.1);
      color: #408EF1;
    }
    &.el-tag--success{
      background-color: #F0F9EC;
      color: #00AE1C;
    }
    &.el-tag--danger{
      background-color: rgba(239,80,47,0.1);
      color: #EF502F;
    }
    &.el-tag--warning{
      background-color: rgba(255,184,0,0.1);
      color: #FFB800;
    }
  }
</style>
