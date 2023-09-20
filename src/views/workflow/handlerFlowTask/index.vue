<template>
  <HandlerFlowTask
    ref="HandlerFlowTask"
    :processInstanceId="dialogParams.processInstanceId"
    :processDefinitionId="dialogParams.processDefinitionId"
    :flowEntryName="dialogParams.flowEntryName"
    :processInstanceInitiator="dialogParams.processInstanceInitiator"
    :taskId="dialogParams.taskId"
    :taskName="dialogParams.taskName"
    :operationList="dialogParams.operationList"
    :isRuntime="dialogParams.isRuntime"
    :isDraft="dialogParams.isDraft"
    @close="handlerClose(false)"
    @start="handlerStart"
    @submit="handlerOperation"
    @draft="handlerDraft"
  >
    <!-- 在线表单页面 -->
    <WorkflowForm v-if="dialogParams.formId != null" ref="workflowForm"
      style="width: 100%;" :style="{height: (getMainContextHeight - 188) + 'px'}"
      :formId="dialogParams.formId"
      :readOnly="isReadOnly"
      :flowInfo="getFlowInfo"
    />
    <!-- 路由页面 -->
    <router-view ref="routerFlowForm" style="width: 100%;"
      :isRuntimeTask="dialogParams.isRuntime"
      :isDraft="dialogParams.isDraft"
      :readOnly="dialogParams.readOnly"
      :processInstanceId="dialogParams.processInstanceId"
      :taskId="dialogParams.taskId"
      :taskVariableList="dialogParams.variableList"
    />
  </HandlerFlowTask>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import flowMixins from '../mixins/flowMixins.js';
import { FlowOperationController } from '@/api/flowController.js';
import WorkflowForm from '@/views/online/OnlinePageRender/index.vue';
import HandlerFlowTask from '@/views/workflow/components/HandlerFlowTask';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'handlerFowTask',
  props: {
    isRuntime: {
      type: [Boolean, String]
    },
    isDraft: {
      type: [Boolean, String]
    },
    isPreview: {
      type: [Boolean, String]
    },
    // 流程标识
    processDefinitionKey: {
      type: String
    },
    // 在线表单formId
    formId: {
      type: String
    },
    // 路由名称
    routerName: {
      type: String
    },
    // 只读页面
    readOnly: {
      type: [String, Boolean]
    },
    // 消息id，用于抄送消息回显
    messageId: {
      type: String
    },
    // 流程实例id
    processInstanceId: {
      type: String
    },
    // 流程定义id
    processDefinitionId: {
      type: String
    },
    // 当前任务节点id
    taskId: {
      type: String
    },
    // 流程名称
    flowEntryName: {
      type: String
    },
    // 发起人
    processInstanceInitiator: {
      type: String
    },
    // 当前任务节点名称
    taskName: {
      type: String
    },
    // 当前任务节点操作列表
    operationList: {
      type: Array
    },
    // 当前任务节点变量列表
    variableList: {
      type: Array
    }
  },
  components: {
    WorkflowForm,
    HandlerFlowTask
  },
  mixins: [flowMixins, thirdPartyMixin, refreshDataMixins],
  data () {
    return {
      isStart: false,
      // 保存草稿后流程taskId
      draftTaskId: undefined,
      // 保存草稿后流程实例ID
      draftProcessInstanceId: undefined,
      // 在线表单是否渲染完毕
      isFormReady: false,
      // 在线表单页面数据
      formData: undefined,
      // 在线表单页面一对多数据
      oneToManyRelationData: undefined
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdTaskCommit' && data.isSuccess) {
        this.preHandlerOperationThen(data.rowData.operation, data.rowData.copyItemList, data.data)
      }
    },
    /**
     * 获得路由组件下的函数
     * @param {string} functionName 函数名称
     * @returns {function}
     */
    getRouterCompomentFunction (functionName) {
      return (this.$refs.routerFlowForm && typeof this.$refs.routerFlowForm[functionName] === 'function') ? this.$refs.routerFlowForm[functionName] : undefined;
    },
    /**
     * 获取表单数据
     */
    getMasterData (operationType, assignee) {
      return new Promise((resolve, reject) => {
        if (this.isOnlineForm) {
          this.$refs.workflowForm.getFormData(false, this.dialogParams.variableList).then(formData => {
            if (formData == null) {
              reject();
              return;
            }
            assignee = (assignee && assignee !== '') ? assignee.split(',') : undefined;
            if (operationType === this.SysFlowTaskOperationType.MULTI_SIGN) {
              // 会签操作设置多实例处理人集合
              if (formData.taskVariableData == null) formData.taskVariableData = {};
              formData.taskVariableData.assigneeList = assignee;
            } else if (operationType === this.SysFlowTaskOperationType.SET_ASSIGNEE) {
              // 设置下一个任务节点处理人
              if (formData.taskVariableData == null) formData.taskVariableData = {};
              formData.taskVariableData.appointedAssignee = Array.isArray(assignee) ? assignee.join(',') : undefined;
            }
            resolve(formData);
          }).catch(e => {
            reject(e);
          });
        } else {
          // 获得静态表单页面的getMasterData函数
          let funGetMasterData = this.getRouterCompomentFunction('getMasterData');
          return funGetMasterData ? funGetMasterData(this.dialogParams.variableList) : reject();
        }
      });
    },
    /**
     * 获得草稿数据
     */
    getDraftData () {
      return new Promise((resolve, reject) => {
        this.$refs.workflowForm.getFormData(true).then(res => {
          resolve(res);
        }).catch(e => {
          reject(e);
        })
      });
    },
    /**
     * 启动流程
     */
    handlerStart (operation, copyItemList, xml) {
      // 启动并保存草稿后再次提交
      if (this.draftProcessInstanceId != null && this.draftTaskId != null) {
        this.handlerOperation(operation, copyItemList, xml);
        return;
      }
      if (!this.isOnlineForm) {
        let funHandlerStart = this.getRouterCompomentFunction('handlerStart');
        if (funHandlerStart != null) {
          funHandlerStart(operation, copyItemList, xml).then(res => {
            this.handlerClose();
          }).catch(e => {});
        } else {
          this.$message.error('当前流程并未实现启动功能，请联系管理员！');
        }
      } else {
        this.preHandlerOperation(operation, true, xml).then(res => {
          this.getMasterData(operation.type, (res || {}).assignee).then(formData => {
            FlowOperationController.startAndTakeUserTask(this, {
              processDefinitionKey: this.dialogParams.processDefinitionKey,
              masterData: formData.masterData || {},
              slaveData: formData.slaveData,
              taskVariableData: {
                ...formData.taskVariableData,
                latestApprovalStatus: operation.latestApprovalStatus
              },
              flowTaskCommentDto: {
                approvalType: operation.type
              },
              copyData: (copyItemList || []).reduce((retObj, item) => {
                retObj[item.type] = item.id;
                return retObj;
              }, {})
            }, {
              // 判断是否是从流程设计里启动
              processDefinitionKey: (this.dialogParams.isPreview || this.dialogParams.isPreview === 'true') ? undefined : this.dialogParams.processDefinitionKey
            }).then(res => {
              this.handlerClose();
              this.$message.success('启动成功！');
            }).catch(e => {});
          });
        }).catch(e => {});
      }
    },
    /**
     * 流程操作
     * @param {Object} operation 流程操作
     */
    handlerOperation (operation, copyItemList, xml) {
      if (this.isOnlineForm) {
        this.preHandlerOperation(operation, this.isStart || this.dialogParams.isDraft || this.dialogParams.isDraft === 'true', xml, copyItemList).then(res => {
          this.preHandlerOperationThen(operation, copyItemList, res)
        }).catch(e => {});
      } else {
        let funHandlerOperation = this.getRouterCompomentFunction('handlerOperation');
        if (funHandlerOperation) {
          funHandlerOperation(operation, copyItemList, xml).then(res => {
            this.handlerClose();
          }).catch(e => {});
        } else {
          this.$message.error('当前流程并未实现处理功能，请联系管理员！');
        }
      }
    },
    preHandlerOperationThen (operation, copyItemList, res) {
      // 加签、减签操作
      if (operation.type === this.SysFlowTaskOperationType.CO_SIGN || operation.type === this.SysFlowTaskOperationType.SIGN_REDUCTION) {
        this.submitConsign((res || {}).assignee, operation.type === this.SysFlowTaskOperationType.CO_SIGN).then(res => {
          this.handlerClose();
        }).catch(e => {});
        return;
      }
      // 自由跳
      if (operation.type === this.SysFlowTaskOperationType.FREE_JUMP) {
        FlowOperationController.freeJump(this, {
          processInstanceId: this.dialogParams.processInstanceId,
          sourceTaskId: this.dialogParams.taskId,
          targetTaskKey: (res || {}).targetTaskKey,
          delegateAssignee: (res || {}).assignee,
          taskComment: (res || {}).message,
          taskVariableData: {
            latestApprovalStatus: operation.latestApprovalStatus
          }
        }).then(res => {
          this.handlerClose();
        }).catch(e => {});
        return;
      }
      // 驳回操作
      if (operation.type === this.SysFlowTaskOperationType.REJECT || operation.type === this.SysFlowTaskOperationType.REJECT_TO_TASK) {
        FlowOperationController.rejectRuntimeTask(this, {
          processInstanceId: this.dialogParams.processInstanceId,
          taskId: this.dialogParams.taskId,
          targetTaskKey: (res || {}).targetTaskKey,
          taskComment: (res || {}).message,
          taskVariableData: {
            latestApprovalStatus: operation.latestApprovalStatus
          }
        }).then(res => {
          this.handlerClose();
        }).catch(e => {});
        return;
      }
      // 驳回到起点
      if (operation.type === this.SysFlowTaskOperationType.REJECT_TO_START) {
        FlowOperationController.rejectToStartUserTask(this, {
          processInstanceId: this.dialogParams.processInstanceId,
          taskId: this.dialogParams.taskId,
          taskComment: (res || {}).message,
          taskVariableData: {
            latestApprovalStatus: operation.latestApprovalStatus
          }
        }).then(res => {
          this.handlerClose();
        }).catch(e => {});
        return;
      }
      // 撤销操作
      if (operation.type === this.SysFlowTaskOperationType.REVOKE) {
        this.$confirm('是否撤销此任务？').then(res => {
          FlowOperationController.revokeHistoricTask(this, {
            processInstanceId: this.dialogParams.processInstanceId,
            taskId: this.dialogParams.taskId,
            taskComment: '任务处理人撤销任务',
            taskVariableData: {
              latestApprovalStatus: operation.latestApprovalStatus
            }
          }).then(res => {
            this.handlerClose();
          }).catch(e => {});
        }).catch(e => {});
        return;
      }
      this.getMasterData(operation.type, (res || {}).assignee).then(formData => {
        let params = {
          taskId: this.dialogParams.taskId || this.draftTaskId,
          processInstanceId: this.dialogParams.processInstanceId || this.draftProcessInstanceId,
          masterData: formData.masterData,
          slaveData: formData.slaveData,
          flowTaskCommentDto: {
            taskComment: (res || {}).message,
            approvalType: operation.type,
            delegateAssignee: operation.type === this.SysFlowTaskOperationType.TRANSFER ? (res || {}).assignee : undefined
          },
          taskVariableData: {
            ...formData.taskVariableData,
            latestApprovalStatus: operation.latestApprovalStatus
          },
          copyData: (copyItemList || []).reduce((retObj, item) => {
            retObj[item.type] = item.id;
            return retObj;
          }, {})
        }

        FlowOperationController.submitUserTask(this, params).then(res => {
          this.handlerClose();
          this.reloadMessage(this);
          this.$message.success('提交成功！');
        }).catch(e => {});
      });
    },
    /**
     * 保存草稿
     */
    handlerDraft () {
      if (this.isOnlineForm) {
        this.getDraftData().then(formData => {
          if (formData == null) {
            return;
          }
          let params = {
            processDefinitionKey: this.dialogParams.processDefinitionKey,
            processInstanceId: this.dialogParams.processInstanceId || this.draftProcessInstanceId,
            masterData: formData.masterData,
            slaveData: formData.slaveData
          }
          FlowOperationController.startAndSaveDraft(this, params, {
            processDefinitionKey: this.dialogParams.processDefinitionKey
          }).then(res => {
            this.$message.success('草稿保存成功！');
            this.draftProcessInstanceId = res.data.processInstanceId;
            this.draftTaskId = res.data.taskId;
          }).catch(e => {});
        }).catch(e => {});
      } else {
        let funHandlerOperation = this.getRouterCompomentFunction('handlerDraft');
        if (funHandlerOperation) {
          funHandlerOperation().then(res => {
          }).catch(e => {});
        } else {
          this.$message.error('当前流程并未实现保存草稿，请联系管理员！');
        }
      }
    },
    /**
     * 初始化流程表单数据
     */
    initFormData () {
      if (this.dialogParams.processInstanceId == null || this.dialogParams.processInstanceId === '' || this.dialogParams.formId == null) {
        return;
      }

      if (this.isOnlineForm) {
        let params = {
          processInstanceId: this.dialogParams.processInstanceId,
          taskId: this.dialogParams.taskId
        }
        // 判断是展示历史流程的数据还是待办流程的数据
        let httpCall = null;
        if (this.dialogParams.isDraft || this.dialogParams.isDraft === 'true') {
          // 草稿数据
          httpCall = FlowOperationController.viewOnlineDraftData(this, {
            processDefinitionKey: this.dialogParams.processDefinitionKey,
            processInstanceId: this.dialogParams.processInstanceId
          });
        } else if (this.dialogParams.messageId != null) {
          // 抄送消息
          httpCall = FlowOperationController.viewOnlineCopyBusinessData(this, {
            messageId: this.dialogParams.messageId
          });
        } else {
          httpCall = (this.dialogParams.taskId != null && this.dialogParams.isRuntime) ? FlowOperationController.viewUserTask(this, params) : FlowOperationController.viewHistoricProcessInstance(this, params);
        }
        httpCall.then(res => {
          this.isStart = (res.data == null);
          // 一对多数据
          this.oneToManyRelationData = (res.data || {}).oneToMany;
          // 草稿一对多数据，添加唯一主键
          if (this.dialogParams.isDraft || this.dialogParams.isDraft === 'true') {
            if (this.oneToManyRelationData != null) {
              let tempTime = new Date().getTime();
              Object.keys(this.oneToManyRelationData).forEach(key => {
                if (Array.isArray(this.oneToManyRelationData[key])) {
                  this.oneToManyRelationData[key].forEach(item => {
                    item.__cascade_add_id__ = tempTime++;
                  });
                }
              });
            }
          }
          // 主表数据以及一对一关联数据
          if ((res.data || {}).masterAndOneToOne != null) {
            this.formData = {
              ...res.data.masterAndOneToOne
            };
          }
        }).catch(e => {
        });
      } else {
        let funInitFormData = this.getRouterCompomentFunction('initFormData');
        funInitFormData ? funInitFormData() : this.$message.error('当前流程并未实现页面初始化功能，请联系管理员！');
      }
    },
    ...mapActions(['reloadMessage'])
  },
  computed: {
    dialogParams () {
      return {
        isRuntime: this.isRuntime || this.thirdParams.isRuntime || false,
        isDraft: this.isDraft || this.thirdParams.isDraft || false,
        isPreview: this.isPreview || this.thirdParams.isPreview || false,
        processDefinitionKey: this.processDefinitionKey || this.thirdParams.processDefinitionKey,
        formId: this.formId || this.thirdParams.formId,
        routerName: this.routerName || this.thirdParams.routerName,
        readOnly: this.readOnly || this.thirdParams.readOnly,
        messageId: this.messageId || this.thirdParams.messageId,
        processInstanceId: this.processInstanceId || this.thirdParams.processInstanceId,
        processDefinitionId: this.processDefinitionId || this.thirdParams.processDefinitionId,
        taskId: this.taskId || this.thirdParams.taskId,
        flowEntryName: this.flowEntryName || this.thirdParams.flowEntryName,
        processInstanceInitiator: this.processInstanceInitiator || this.thirdParams.processInstanceInitiator,
        taskName: this.taskName || this.thirdParams.taskName,
        operationList: this.operationList || this.thirdParams.operationList,
        variableList: this.variableList || this.thirdParams.variableList
      }
    },
    isReadOnly () {
      return typeof this.dialogParams.readOnly === 'string' ? this.dialogParams.readOnly === 'true' : this.dialogParams.readOnly;
    },
    isOnlineForm () {
      return this.dialogParams.formId != null;
    },
    getFlowInfo () {
      return {
        processInstanceId: this.dialogParams.processInstanceId,
        taskId: this.dialogParams.taskId,
        processDefinitionKey: this.dialogParams.processDefinitionKey,
        processInstanceInitiator: this.dialogParams.processInstanceInitiator,
        messageId: this.dialogParams.messageId,
        isRuntime: this.dialogParams.isRuntime,
        isDraft: this.dialogParams.isDraft
      }
    },
    ...mapGetters(['getMainContextHeight'])
  },
  mounted () {
    this.initFormData();
  }
}
</script>

<style scoped>
  .task-title {
    display: flex;
    justify-content: space-between;
    padding-bottom: 5px;
    margin-bottom: 10px;
    border-bottom: 3px solid #409EFF;
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
</style>
