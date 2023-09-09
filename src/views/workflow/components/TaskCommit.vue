<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <el-form ref="formTaskCommit" :model="formData" class="full-width-input form-box" :rules="rules" style="width: 100%;"
      label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="24" v-if="dialogParams.operation.type === SysFlowTaskOperationType.FREE_JUMP">
          <el-form-item label="任务节点：" prop="targetTaskKey">
            <UserTaskSelect v-model="formData.targetTaskKey" :xml="dialogParams.xml" :finishedInfo="dialogParams.finishedInfo" placeholder="请选择跳转任务节点" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="showAssignSelect || dialogParams.operation.type === SysFlowTaskOperationType.FREE_JUMP">
          <el-form-item label="指派用户：" :prop="dialogParams.operation.type === SysFlowTaskOperationType.FREE_JUMP ? undefined : 'assignee'">
            <TagSelect v-model="userName">
              <el-button slot="append" class="append-add" type="default" icon="el-icon-plus" @click="onSelectAssignee" />
            </TagSelect>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="dialogParams.operation.type === SysFlowTaskOperationType.SIGN_REDUCTION">
          <el-form-item label="减签用户：" prop="assignee">
            <el-select v-model="formData.assignee" placeholder=""
              clearable multiple collapse-tags
              :loading="multiSignAssignees.loading"
              @visible-change="multiSignAssignees.onVisibleChange"
            >
              <el-option v-for="item in multiSignAssignees.dropdownList" :key="item.assignee"
                :value="item.assignee" :label="item.showName"
                :disabled="item.approved"
              >
                <el-row type="flex" justify="space-between" align="middle">
                  <span>{{item.showName}}</span>
                  <el-tag v-if="item.approved" size="mini" type="info" style="margin-right: 10px;">已处理</el-tag>
                </el-row>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="dialogParams.processInstanceId != null && dialogParams.taskId != null && dialogParams.operation.type === SysFlowTaskOperationType.REJECT_TO_TASK">
          <el-form-item label="驳回节点：" prop="targetTaskKey">
            <el-select v-model="formData.targetTaskKey"
              :loading="taskWidget.loading"
              @visible-change="taskWidget.onVisibleChange"
            >
              <el-option v-for="item in taskWidget.dropdownList" :key="item.taskKey" :value="item.taskKey" :label="item.showName" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24"
          v-if="
            dialogParams.operation.type !== SysFlowTaskOperationType.CO_SIGN &&
            dialogParams.operation.type !== SysFlowTaskOperationType.SIGN_REDUCTION &&
            dialogParams.operation.type !== SysFlowTaskOperationType.MULTI_SIGN
          "
        >
          <el-form-item label="审批意见：" prop="message">
            <el-input v-model="formData.message" clearable placeholder="请输入审批意见" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="no-scroll flex-box menu-box" type="flex" justify="end">
      <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
        取消
      </el-button>
      <el-button type="primary" :size="defaultFormItemSize" @click="onSubmitClick()">
        提交
      </el-button>
    </el-row>
  </div>
</template>

<script>
import TagSelect from '@/views/workflow/components/TagSelect.vue';
import TaskUserSelect from '@/views/workflow/components/TaskUserSelect.vue';
import UserTaskSelect from '@/views/workflow/components/UserTaskSelect/index.vue'
import { DropdownWidget } from '@/utils/widget.js';
import { FlowOperationController } from '@/api/flowController.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'formTaskCommit',
  mixins: [thirdPartyMixin, refreshDataMixins],
  props: {
    operation: {
      type: Object
      // required: true
    },
    processInstanceId: {
      type: String
    },
    taskId: {
      type: String
    },
    xml: {
      type: String
    },
    finishedInfo: {
      type: Object
    }
  },
  components: {
    TagSelect,
    UserTaskSelect
  },
  data () {
    return {
      formData: {
        message: undefined,
        assignee: undefined,
        targetTaskKey: undefined
      },
      multiSignAssignees: new DropdownWidget(this.listMultiSignAssigneesDropdownData),
      taskWidget: new DropdownWidget(this.loadTaskWidgetDropdownData),
      rules: {
        message: [{required: true, message: '审批意见不能为空', trigger: 'blur'}],
        assignee: [{required: true, message: '指派用户不能为空', trigger: 'blur'}],
        targetTaskKey: [{required: true, message: '任务节点不能为空', trigger: 'blur'}]
      },
      userName: [],
      otherFilterObject: undefined
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdTaskUserSelect' && data.isSuccess) {
        this.updateSelectAssignee(data.data)
      }
    },
    onCancel (isSuccess, data) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, data);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, this.thirdParams.rowData, data);
      }
    },
    onSubmitClick () {
      this.$refs.formTaskCommit.validate(valid => {
        if (!valid) return;
        this.onCancel(true, this.formData);
      });
    },
    onSelectAssignee () {
      let usedUserIdList = (this.formData.assignee == null || this.formData.assignee === '') ? [] : this.formData.assignee.split(',');
      this.$dialog.show('选择用户', TaskUserSelect, {
        area: ['1000px', '650px']
      }, {
        showAssignee: false,
        showStartUser: (this.dialogParams.operation.type !== this.SysFlowTaskOperationType.CO_SIGN && this.dialogParams.operation.type !== this.SysFlowTaskOperationType.SIGN_REDUCTION),
        multiple: this.multiSelect,
        usedUserIdList,
        filterObject: this.otherFilterObject,
        path: 'thirdTaskUserSelect'
      }, {
        width: '1000px',
        height: '690px',
        pathName: '/thirdParty/thirdTaskUserSelect'
      }).then(res => {
        this.updateSelectAssignee(res)
      }).catch(e => {});
    },
    updateSelectAssignee (res) {
      if (Array.isArray(res)) {
        let oldUserList = this.userName.map(item => item.id);
        res.forEach(item => {
          if (oldUserList.indexOf(item.loginName) === -1) {
            this.userName.push({
              id: item.loginName,
              name: item.showName || item.loginName
            })
          }
        })
      } else {
        this.userName = res ? [
          {
            id: res.loginName,
            name: res.showName || res.loginName
          }
        ] : [];
      }
    },
    loadTaskWidgetDropdownData () {
      return new Promise((resolve, reject) => {
        FlowOperationController.listRejectCandidateUserTask(this, {
          processInstanceId: this.dialogParams.processInstanceId,
          taskId: this.dialogParams.taskId
        }).then(res => {
          resolve(res.data);
        }).catch(e => {
          reject(e);
        });
      });
    },
    listMultiSignAssigneesDropdownData () {
      return new Promise((resolve, reject) => {
        FlowOperationController.listMultiSignAssignees(this, {
          processInstanceId: this.dialogParams.processInstanceId,
          taskId: this.dialogParams.taskId
        }).then(res => {
          // 将已经处理过会签任务的处理人放到列表最后
          resolve(res.data.sort((val1, val2) => {
            return val1.approved === val2.approved ? 0 : (val1.approved ? 1 : -1);
          }));
        }).catch(e => {
          reject(e);
        });
      });
    }
  },
  computed: {
    dialogParams () {
      return {
        operation: this.operation || this.thirdParams.operation || {},
        processInstanceId: this.processInstanceId || this.thirdParams.processInstanceId,
        taskId: this.taskId || this.thirdParams.taskId,
        xml: this.xml || this.thirdParams.xml,
        finishedInfo: this.finishedInfo || this.thirdParams.finishedInfo
      }
    },
    showAssignSelect () {
      let showAssignSelect = false;
      // 如果是会签操作，判断是否在流程内设置了会签人
      if (this.dialogParams.operation.type === this.SysFlowTaskOperationType.MULTI_SIGN) {
        showAssignSelect = !this.dialogParams.operation.multiSignAssignee ||
          !Array.isArray(this.dialogParams.operation.multiSignAssignee.assigneeList) ||
          this.dialogParams.operation.multiSignAssignee.assigneeList.length <= 0;
      }
      return [
        this.SysFlowTaskOperationType.TRANSFER,
        this.SysFlowTaskOperationType.CO_SIGN,
        this.SysFlowTaskOperationType.SET_ASSIGNEE
      ].indexOf(this.dialogParams.operation.type) !== -1 || showAssignSelect;
    },
    multiSelect () {
      // 转办、加签、会签允许多选
      return [
        this.SysFlowTaskOperationType.CO_SIGN,
        this.SysFlowTaskOperationType.MULTI_SIGN,
        this.SysFlowTaskOperationType.TRANSFER,
        this.SysFlowTaskOperationType.SET_ASSIGNEE
      ].indexOf(this.dialogParams.operation.type) !== -1;
    }
  },
  watch: {
    userName: {
      deep: true,
      handler (userName) {
        let usedUserIdList = userName.map(item => item.id);
        this.formData.assignee = usedUserIdList.join(',');
      }
    }
  },
  mounted () {
    if (this.operation && this.operation.type === this.SysFlowTaskOperationType.SET_ASSIGNEE && this.operation.multiSignAssignee) {
      if (this.operation.multiSignAssignee.assigneeType && this.operation.multiSignAssignee.assigneeList) {
        this.otherFilterObject = {
          USER_FILTER_GROUP: JSON.stringify({
            type: this.operation.multiSignAssignee.assigneeType,
            values: this.operation.multiSignAssignee.assigneeList
          })
        };
      }
    }
  }
}
</script>

<style scoped>
  .append-add {
    border: none;
    border-left: 1px solid #DCDFE6;
    border-radius: 0px;
    background: #F5F7FA;
  }
</style>
