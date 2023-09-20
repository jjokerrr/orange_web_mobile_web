import { cachedPageChildMixin } from '@/core/mixins';
import TaskCommit from '@/views/workflow/components/TaskCommit.vue';
import { FlowOperationController } from '@/api/flowController.js';

export default {
  props: {
    processInstanceId: {
      type: String
    }
  },
  mixins: [cachedPageChildMixin],
  methods: {
    // 加签
    submitConsign (assignee, isAdd = true) {
      return new Promise((resolve, reject) => {
        let params = {
          taskId: (this.dialogParams || {}).taskId || this.taskId,
          processInstanceId: (this.dialogParams || {}).processInstanceId || this.processInstanceId,
          newAssignees: Array.isArray(assignee) ? assignee : assignee.split(','),
          isAdd
        }

        FlowOperationController.submitConsign(this, params).then(res => {
          this.$message.success(isAdd ? '加签成功！' : '减签成功！');
          resolve();
        }).catch(e => {
          reject();
        });
      });
    },
    // 关闭流程处理
    handlerClose (isDialog = false) {
      if (isDialog) {
        if (this.observer != null) {
          this.observer.cancel(true);
        }
      } else {
        this.refreshParentCachedPage = true;
        this.$router.go(-1);
      }
    },
    // 获取表单数据
    async getMasterData () {
      return Promise.resolve();
    },
    // 初始化表单数据
    initFormData () {
      return new Promise((resolve, reject) => {
        this.$message.error('初始化流程表单数据接口并未实现，请联系管理员！');
      });
    },
    // 预处理工作流操作
    preHandlerOperation (operation, isStart, xml, copyItemList) {
      return new Promise((resolve, reject) => {
        if (operation == null) {
          isStart ? resolve() : reject();
          return;
        }
        // 撤销操作不弹出选择窗口
        let showCommitDig = (!isStart && operation.type !== this.SysFlowTaskOperationType.REVOKE) || operation.type === this.SysFlowTaskOperationType.SET_ASSIGNEE;
        if (operation.type === this.SysFlowTaskOperationType.MULTI_SIGN) {
          showCommitDig = !operation.multiSignAssignee || !Array.isArray(operation.multiSignAssignee.assigneeList) || operation.multiSignAssignee.assigneeList.length <= 0;
        }
        if (showCommitDig) {
          let title = '提交';
          if (!isStart) {
            switch (operation.type) {
              case this.SysFlowTaskOperationType.CO_SIGN:
              case this.SysFlowTaskOperationType.SIGN_REDUCTION:
                title = this.SysFlowTaskOperationType.getValue(operation.type);
                break;
              default:
                title = '审批';
                break;
            }
          }
          this.$dialog.show(title, TaskCommit, {
            area: '500px'
          }, {
            operation,
            rowData: {
              copyItemList,
              operation
            },
            copyItemList,
            processInstanceId: (this.dialogParams || {}).processInstanceId || this.processInstanceId,
            taskId: (this.dialogParams || {}).taskId || this.taskId,
            xml: xml,
            finishedInfo: (this.$refs.HandlerFlowTask || {}).finishedInfo,
            path: 'thirdTaskCommit'
          }, {
            width: '500px',
            height: '380px',
            pathName: '/thirdParty/thirdTaskCommit'
          }).then(res => {
            resolve(res);
          }).catch(e => {
            reject(e);
          });
        } else {
          resolve();
        }
      });
    },
    // 启动流程
    handlerStart (operation) {
      this.$message.error('当前流程并未实现启动功能，请联系管理员！');
    },
    // 流程处理操作
    handlerOperation (operation) {
      this.$message.error('当前流程并未实现处理功能，请联系管理员！');
    },
    // 保存草稿
    handlerDraft () {
      this.$message.error('当前流程并未实现保存草稿功能，请联系管理员！');
    }
  }
}
