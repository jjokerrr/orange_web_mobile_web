<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <el-form ref="formInterposeInstance" :model="formData" class="full-width-input form-box" style="width: 100%;"
      label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent
      :rules="rules"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="跳转节点：" prop="targetTaskKey">
            <UserTaskSelect v-model="formData.targetTaskKey" :xml="taskProcessXml" placeholder="请选择跳转任务节点" :disabled="taskProcessXml == null" :finishedInfo="finishedInfo"/>
            <!--
            <el-select v-model="formData.targetTaskKey"
              :loading="taskWidget.loading"
              @visible-change="taskWidget.onVisibleChange"
            >
              <el-option v-for="item in taskWidget.dropdownList" :key="item.taskKey" :value="item.taskKey" :label="item.showName" />
            </el-select>
            -->
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="处理用户：" prop="delegateAssignee">
            <TagSelect v-model="userName">
              <el-button slot="append" class="append-add" type="default" icon="el-icon-plus" @click="onSelectAssignee" />
            </TagSelect>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="干预原因：" prop="taskComment">
            <el-input v-model="formData.taskComment" clearable placeholder="请输入干预原因" />
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
// import { DropdownWidget } from '@/utils/widget.js';
import { FlowOperationController } from '@/api/flowController.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js'
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'formInterposeInstance',
  mixins: [thirdPartyMixin, refreshDataMixins],
  props: {
    processInstanceId: {
      type: String
    },
    processDefinitionId: {
      type: String
    },
    taskId: {
      type: String
    }
  },
  components: {
    TagSelect,
    UserTaskSelect
  },
  computed: {
    dialogParams () {
      return {
        taskId: this.taskId || this.thirdParams.processDefinitionId,
        processDefinitionId: this.processDefinitionId || this.thirdParams.processDefinitionId,
        processInstanceId: this.processInstanceId || this.thirdParams.processInstanceId
      }
    }
  },
  data () {
    return {
      formData: {
        taskComment: undefined,
        delegateAssignee: undefined,
        targetTaskKey: undefined
      },
      rules: {
        taskComment: [
          {required: true, message: '请输入干预原因', trigger: 'blur'}
        ]
      },
      // taskWidget: new DropdownWidget(this.loadTaskWidgetDropdownData),
      taskProcessXml: undefined,
      userName: [],
      finishedInfo: undefined
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdTaskUserSelect' && data.isSuccess) {
        this.updateSelectAssignee(data.data)
      }
    },
    onCancel (isSuccess) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess)
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path)
      }
    },
    onSubmitClick () {
      let params = {
        processInstanceId: this.dialogParams.processInstanceId,
        taskId: this.dialogParams.taskId,
        delegateAssignee: this.formData.delegateAssignee,
        targetTaskKey: this.formData.targetTaskKey,
        taskComment: this.formData.taskComment
      }

      FlowOperationController.interveneRuntimeTask(this, params).then(res => {
        this.onCancel(true);
      }).catch(e => {});
    },
    onSelectAssignee () {
      let usedUserIdList = (this.formData.delegateAssignee == null || this.formData.delegateAssignee === '') ? [] : this.formData.delegateAssignee.split(',');
      this.$dialog.show('选择用户', TaskUserSelect, {
        area: ['1000px', '600px']
      }, {
        showAssignee: false,
        showStartUser: false,
        multiple: true,
        usedUserIdList: usedUserIdList,
        path: 'thirdTaskUserSelect'
      }, {
        width: '1000px',
        height: '640px',
        pathName: '/thirdParty/thirdTaskUserSelect'
      }).then(res => {
        this.updateSelectAssignee(res);
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
    getTaskProcessXml () {
      let params = {
        processDefinitionId: this.dialogParams.processDefinitionId
      }
      FlowOperationController.viewProcessBpmn(this, params).then(res => {
        // 当前流程实例xml
        this.taskProcessXml = res.data;
      }).catch(e => {});
    },
    getTaskHighlightData () {
      if (this.dialogParams.processInstanceId == null || this.dialogParams.processInstanceId === '') {
        return;
      }
      let params = {
        processInstanceId: this.dialogParams.processInstanceId
      }

      FlowOperationController.viewHighlightFlowData(this, params).then(res => {
        // 已完成节点
        this.finishedInfo = res.data;
      }).catch(e => {});
    }
  },
  mounted () {
    this.getTaskProcessXml();
    this.getTaskHighlightData();
  },
  watch: {
    userName: {
      deep: true,
      handler (userName) {
        let usedUserIdList = userName.map(item => item.id);
        this.formData.delegateAssignee = usedUserIdList.join(',');
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
