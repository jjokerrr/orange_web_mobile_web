<template>
  <div>
    <el-form-item label="候选类型">
    <el-radio-group v-model="formData.groupType" @change="onGroupTypeChange" :disabled="isCountersign">
        <el-radio label="ASSIGNEE">处理用户</el-radio>
        <el-radio label="USERS">候选用户组</el-radio>
        <el-radio label="ROLE">角色</el-radio>
        <el-radio label="DEPT">部门</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="" v-if="formData.groupType === 'ASSIGNEE'">
      <TaskMultipleSelect v-model="userName" style="width: 100%;" :isCountersign="isCountersign">
        <el-button icon="el-icon-plus" :size="defaultFormItemSize" @click="onSelectAssignee(false)" :disabled="isCountersign">添加处理用户</el-button>
      </TaskMultipleSelect>
    </el-form-item>
    <el-form-item label="" v-if="formData.groupType === 'USERS'">
      <TaskMultipleSelect v-model="userName" style="width: 100%;">
        <el-button icon="el-icon-plus" :size="defaultFormItemSize" @click="onSelectCandidateUsers(true)" >添加候选用户</el-button>
      </TaskMultipleSelect>
    </el-form-item>
    <el-form-item v-if="formData.groupType === 'ROLE'" label="候选角色">
      <el-select v-model="candidateGroupIds" placeholder="" :multiple="true" @change="onSelectRoleChange">
        <el-option v-for="role in roleList" :key="role.id" :label="role.name" :value="role.id" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="formData.groupType == 'DEPT' || formData.groupType == 'POST'"
      label=""
    >
      <TaskMultipleSelect v-model="candidateGroupIds" style="width: 100%;">
        <el-button icon="el-icon-plus" :size="defaultFormItemSize" @click="onSelectCandidatGroups(true)" >添加{{formData.groupType === 'DEPT' ? '候选部门' : '候选岗位'}}</el-button>
      </TaskMultipleSelect>
    </el-form-item>
    <!-- <el-form-item label="到期时间">
      <el-input v-model="userTaskForm.dueDate" clearable @change="updateElementTask('dueDate')" />
    </el-form-item>
    <el-form-item label="跟踪时间">
      <el-input v-model="userTaskForm.followUpDate" clearable @change="updateElementTask('followUpDate')" />
    </el-form-item>
    <el-form-item label="优先级">
      <el-input v-model="userTaskForm.priority" clearable @change="updateElementTask('priority')" />
      <div class="number-box">
        <el-input-number v-model="userTaskForm.priority" :controls="false" @change="updateElementTask('priority')" :min="1" :max="999" style="width: 105px">
        </el-input-number>
        <div class="icon icon-plus-wrap" @click="userTaskForm.priority = userTaskForm.priority*1+1">
          <i class="el-icon-plus"></i>
        </div>
        <div class="icon icon-minus-wrap" @click="userTaskForm.priority = userTaskForm.priority*1-1">
          <i class="el-icon-minus"></i>
        </div>
      </div>
    </el-form-item> -->
  </div>
</template>

<script>
import { findItemFromList, treeDataTranslate } from '@/utils';
import { SysPostController, DictionaryController, SysCommonBizController } from '@/api';
// import TagSelect from '@/views/workflow/components/TagSelect.vue';
import TaskMultipleSelect from '@/views/workflow/components/TaskMultipleSelect.vue';
import TaskUserSelect from '@/views/workflow/components/TaskUserSelect.vue';
import TaskGroupSelect from '@/views/workflow/components/TaskGroupSelect.vue';
import { mapGetters, mapMutations } from 'vuex';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: "UserTask",
  props: {
    id: String,
    type: String,
    isCountersign: Boolean
  },
  components: {
    TaskMultipleSelect
  },
  mixins: [refreshDataMixins],
  inject: ['flowEntry', 'prefix'],
  data() {
    return {
      candidateGroupIds: [],
      sendMessageType: [],
      defaultTaskForm: {
        assignee: "",
        candidateUsers: "",
        candidateGroups: "",
        dueDate: "",
        followUpDate: "",
        priority: "",
        sendMessageType: ""
      },
      formData: {
        groupType: 'ASSIGNEE'
      },
      roleList: undefined,
      groupList: undefined,
      groupMap: new Map(),
      postList: [],
      deptPostList: [],
      postMap: new Map(),
      deptPostMap: new Map(),
      userTaskForm: {
        assignee: "",
        candidateUsers: "",
        candidateGroups: "",
        dueDate: "",
        followUpDate: "",
        priority: "",
        sendMessageType: ""
      },
      userName: [],
      isThird: true
    };
  },
  computed: {
    ...mapGetters(['getUserShowNameData'])
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdTaskUserSelect' && data.isSuccess) {
        this.updateAssignee(data.data)
      } else if (data.path === 'thirdTaskUserSelectCandidateUsers' && data.isSuccess) {
        this.updateCandidateUsers(data.data)
      } else if (data.path === 'thirdTaskGroupSelect' && data.isSuccess) {
        this.updateDept(data.data)
      } else if (data.path === 'thirdTaskPostSelect' && data.isSuccess) {
        this.updatePost(data.data)
      }
    },
    calcUserName (userInfo) {
      if (userInfo == null || userInfo.loginName == null) return;
      if (userInfo.loginName === '${startUserName}') userInfo.showName = '流程发起人';
      if (userInfo.loginName === '${appointedAssignee}') userInfo.showName = '指定审批人';
      if (userInfo.loginName === '${assignee}') userInfo.showName = '会签人';
    },
    onSelectAssignee () {
      this.$dialog.show('选择用户', TaskUserSelect, {
        area: ['1000px', '650px']
      }, {
        multiple: false,
        path: 'thirdTaskUserSelect'
      }, {
        width: '1000px',
        height: '650px',
        pathName: '/thirdParty/thirdTaskUserSelect'
      }).then(res => {
        this.updateAssignee(res);
      }).catch(e => {
        console.error(e)
      });
    },
    updateAssignee (res) {
      this.calcUserName(res);
      this.userName = res ? [
        {
          id: res.loginName,
          name: res.showName || res.loginName
        }
      ] : [];
    },
    onSelectCandidateUsers () {
      let usedUserIdList = (this.userTaskForm.candidateUsers == null || this.userTaskForm.candidateUsers === '') ? [] : this.userTaskForm.candidateUsers.split(',');
      this.$dialog.show('选择候选用户', TaskUserSelect, {
        area: ['1000px', '650px']
      }, {
        multiple: true,
        usedUserIdList: usedUserIdList,
        path: 'thirdTaskUserSelectCandidateUsers'
      }, {
        width: '1000px',
        height: '650px',
        pathName: '/thirdParty/thirdTaskUserSelect'
      }).then(res => {
        this.updateCandidateUsers(res)
      }).catch(e => {});
    },
    updateCandidateUsers (res) {
      let tempList = res;
      if (res && !Array.isArray(res)) {
        tempList = [res];
      }
      if (Array.isArray(tempList)) {
        let oldUserList = this.userName.map(item => item.id);
        tempList.forEach(item => {
          this.calcUserName(item);
          if (oldUserList.indexOf(item.loginName) === -1) {
            this.userName.push({
              id: item.loginName,
              name: item.showName || item.loginName
            });
          }
        });
      }
    },
    loadSysRoleList () {
      return new Promise((resolve, reject) => {
        if(this.isThird) {
          let params = {
            widgetType: 'upms_role',
            filter: {}
          };
          SysCommonBizController.list(this, params, null, {
            showMask: false
          }).then(res => {
            this.roleList = res.data.dataList.map(item => {
              return {
                id: String(item.roleId),
                name: item.roleName,
                ...item
              }
            });
            resolve();
          }).catch(e => {
            reject(e);
          });
        } else {
          DictionaryController.dictSysRole(this, {}).then(res => {
            this.roleList = res.getList();
            resolve();
          }).catch(e => {
            reject(e);
          });
        }
      });
    },
    loadDeptWidgetDropdownList () {
      return new Promise((resolve, reject) => {
        if (this.isThird) {
          let params = {
            widgetType: 'upms_dept',
            filter: {}
          };
          SysCommonBizController.list(this, params, null, {
            showMask: false
          }).then(res => {
            let groupList = [];
            res.data.dataList.forEach(item => {
              const obj = {
                id: String(item.deptId),
                name: item.deptName,
                parentId: String(item.parentId),
                ...item
              };
              this.groupMap.set(obj.id + '', obj);
              groupList.push(obj)
            })
            this.groupList = treeDataTranslate(groupList);
            resolve();
          }).catch(e => {
            reject(e);
          });
        } else {
          DictionaryController.dictSysDept(this, {}).then(res => {
            res.getList().forEach(item => {
              this.groupMap.set(item.id + '', item);
            });
            this.groupList = treeDataTranslate(res.getList());
            resolve();
          }).catch(e => {
            reject(e);
          });
        }
      });
    },
    handlerDeptChange (usedIdList) {
      this.$dialog.show('选择部门', TaskGroupSelect, {
        area: ['600px', '600px']
      }, {
        allGroupList: this.groupList,
        usedIdList: usedIdList,
        path: 'thirdTaskGroupSelect'
      }, {
        width: '600px',
        height: '630px',
        pathName: '/thirdParty/thirdTaskGroupSelect'
      }).then(res => {
        this.updateDept(res);
      }).catch(e => {});
    },
    updateDept (res) {
      if (Array.isArray(res)) {
        if (!Array.isArray(this.candidateGroupIds)) this.candidateGroupIds = [];
        res.forEach(item => {
          if (findItemFromList(this.candidateGroupIds, item.id, 'id') == null) {
            this.candidateGroupIds.push(item);
          }
        });
      } else {
        this.candidateGroupIds.push({
          id: res.deptId,
          name: res.deptName
        });
      }
      this.userTaskForm.candidateGroups = Array.isArray(this.candidateGroupIds) ? this.candidateGroupIds.map(item => item.id).join(',') : '';
    },
    onSelectCandidatGroups () {
      let usedIdList = this.userTaskForm.candidateGroups ? this.userTaskForm.candidateGroups.split(',') : [];
      this.handlerDeptChange(usedIdList);
    },
    onSelectRoleChange (value) {
      this.$nextTick(() => {
        this.userTaskForm.candidateGroups = Array.isArray(value) ? value.join(',') : '';
      });
    },
    // 获取审批人信息
    loadUserInfo (params) {
      return new Promise((resolve, reject) => {
        if (params == null || params.fieldValues === '') {
          resolve([]);
        } else {
          SysCommonBizController.viewByIds(this, params).then(res => {
            resolve(res.data || []);
          }).catch(e => {
            reject(e);
          });
        }
      });
    },
    resetTaskForm () {
      this.userTaskForm = {
        assignee: "",
        candidateUsers: "",
        candidateGroups: "",
        dueDate: "",
        followUpDate: "",
        priority: "",
        sendMessageType: ""
      }
      this.candidateGroupIds = [];
      this.sendMessageType = [];
      let formData = (window.bpmnInstances.bpmnElement && window.bpmnInstances.bpmnElement.businessObject) ? window.bpmnInstances.bpmnElement.businessObject.formKey : '';
      let formObj = formData ? JSON.parse(formData) : {};
      if (formObj) {
        this.formData = {
          formId: formObj.formId,
          routerName: formObj.routerName,
          editable: !formObj.readOnly,
          groupType: formObj.groupType || 'ASSIGNEE'
        }
      } else {
        this.formData = {
          groupType: 'ASSIGNEE'
        }
      }
      for (let key in this.defaultTaskForm) {
        let value;
        if (key === 'sendMessageType') {
          value = (window.bpmnInstances.bpmnElement || {}).businessObject[key] || this.defaultTaskForm[key];
          this.sendMessageType = (value != null && value !== '') ? value.split(',') : [];
        }
        if (key === "candidateUsers" || key === "candidateGroups") {
          value = (window.bpmnInstances.bpmnElement || {}).businessObject[key] || this.defaultTaskForm[key];
          if (key === "candidateGroups" && value) {
            this.candidateGroupIds = value.split(',');
            if (Array.isArray(this.candidateGroupIds) && this.formData.groupType === 'DEPT') {
              this.candidateGroupIds = this.candidateGroupIds.map(item => {
                return this.groupMap.get(item);
              }).filter(item => item != null);
            }
          }
        } else {
          value = (window.bpmnInstances.bpmnElement || {}).businessObject[key] || this.defaultTaskForm[key];
        }
        this.$set(this.userTaskForm, key, value);
      }

      let params = {
        widgetType: 'upms_user',
        fieldName: 'loginName',
        fieldValues: ''
      };

      if(this.formData.groupType === 'ASSIGNEE') {
        params.fieldValues = this.userTaskForm.assignee
      } else if(this.formData.groupType === 'USERS') {
        params.fieldValues = this.userTaskForm.candidateUsers;
      }
      let oldUser = params.fieldValues.split(',');
      // 去掉流程启动人和指定审批人
      params.fieldValues = params.fieldValues.split(',').filter(row => {
        return ['${startUserName}', '${appointedAssignee}', '${assignee}'].indexOf(row) === -1;
      }).join(',');
      // 获取处理人用户信息
      this.loadUserInfo(params).then(dataList => {
        this.userName = oldUser.map(item => {
          let tempData = null;
          if (item === '${startUserName}' || item === '${appointedAssignee}' || item === '${assignee}') {
            tempData = {
              loginName: item
            }
          } else {
            tempData = findItemFromList(dataList, item, 'loginName');
          }
          if (tempData != null) {
            this.calcUserName(tempData);
            return {
              id: tempData.loginName,
              name: tempData.showName
            }
          } else {
            if (item != null && item !== '') {
              return {
                id: item,
                name: item
              };
            } else {
              return null;
            }
          }
        }).filter(item => item != null);
      }).catch(e => {
        console.log(e);
      });
    },
    updateFormKey () {
      if (this.formData == null) return;
      let formKeyString = JSON.stringify({
        formId: this.flowEntry().bindFormType === this.SysFlowEntryBindFormType.ONLINE_FORM ? this.formData.formId : undefined,
        routerName: this.flowEntry().bindFormType === this.SysFlowEntryBindFormType.ONLINE_FORM ? undefined : this.formData.routerName,
        readOnly: !this.formData.editable,
        groupType: this.formData.groupType || 'ASSIGNEE'
      });
      window.bpmnInstances.modeling.updateProperties(window.bpmnInstances.bpmnElement, { formKey: formKeyString });
    },
    onGroupTypeChange () {
      this.userName = [];
      this.usedUserIdList = [];
      this.userTaskForm.assignee = undefined;
      this.userTaskForm.candidateUsers = undefined;
      this.candidateGroupIds = [];
      this.userTaskForm.candidateGroups = '';
      this.updateFormKey();
    },
    updateElementTask(key) {
      let taskAttr = Object.create(null);
      if (key === "candidateUsers" || key === "candidateGroups") {
        taskAttr[key] = this.userTaskForm[key] || null;
        let type = key === "candidateUsers" ? "USERS" : this.formData.groupType;
        this.updateUserCandidateGroups(type, taskAttr[key]);
      } else if (key === 'sendMessageType') {
        taskAttr[key] = this.sendMessageType.join(',');
      } else {
        taskAttr[key] = this.userTaskForm[key] || null;
      }
      window.bpmnInstances.modeling.updateProperties(window.bpmnInstances.bpmnElement, taskAttr);
    },
    updateUserCandidateGroups (type, value) {
      let elExtensionElements = window.bpmnInstances.bpmnElement.businessObject.get("extensionElements") || window.bpmnInstances.moddle.create("bpmn:ExtensionElements", { values: [] });
      let otherExtensions = elExtensionElements.values.filter(ex => ex.$type !== `${this.prefix}:UserCandidateGroups`);
      let userCandidateGroupsElement = window.bpmnInstances.moddle.create(`${this.prefix}:UserCandidateGroups`, {
        type: type,
        value: value
      });
      if (type !== 'POST' && value != null && value !== '') otherExtensions.push(userCandidateGroupsElement)
      const newElExtensionElements = window.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
        values: otherExtensions
      });
      // 更新到元素上
      window.bpmnInstances.modeling.updateProperties(window.bpmnInstances.bpmnElement, {
        extensionElements: newElExtensionElements
      });
    },
    ...mapMutations(['setUserShowNameData'])
  },
  watch: {
    id: {
      immediate: true,
      handler(newValue) {
        if (this.roleList == null) {
          this.loadSysRoleList().then(res => {
            let httpCall = [
              this.loadDeptWidgetDropdownList()
            ];
            return Promise.all(httpCall);
          }).then(res => {
            this.bpmnElement = window.bpmnInstances.bpmnElement;
            this.$nextTick(() => this.resetTaskForm());
          }).catch(e => {
            this.roleList = undefined;
          });
        } else {
          this.bpmnElement = window.bpmnInstances.bpmnElement;
          this.$nextTick(() => this.resetTaskForm());
        }
      }
    },
    'userTaskForm.assignee': {
      handler () {
        this.updateElementTask('assignee');
      }
    },
    'userTaskForm.candidateUsers': {
      handler () {
        this.updateElementTask('candidateUsers');
      }
    },
    'candidateGroupIds': {
      handler () {
        if (this.formData.groupType === 'ROLE') {
          this.userTaskForm.candidateGroups = Array.isArray(this.candidateGroupIds) ? this.candidateGroupIds.join(',') : '';
        } else {
          this.userTaskForm.candidateGroups = Array.isArray(this.candidateGroupIds) ? this.candidateGroupIds.map(item => item.id).join(',') : '';
        }
      }
    },
    'userTaskForm.candidateGroups': {
      handler () {
        this.updateElementTask('candidateGroups');
      }
    },
    isCountersign: {
      handler(isCountersign) {
        if(isCountersign) {
          this.formData.groupType = 'ASSIGNEE';
          this.userName = [
            {
              id: '${assignee}',
              name: '会签人'
            }
          ];
        } else {
          // this.userTaskForm.assignee = '';
        }
      }
    },
    userName: {
      deep: true,
      handler(userName) {
        let usedUserIdList = (this.userName || []).map(item => item.id);
        let userShowNameData = {...this.getUserShowNameData};
        this.setUserShowNameData(userShowNameData);
        if(this.formData.groupType === 'ASSIGNEE'){
          this.userTaskForm.assignee = usedUserIdList.join(',');
        }else if(this.formData.groupType === 'USERS'){
          this.userTaskForm.candidateUsers = usedUserIdList.join(',');
        }
      }
    }
  },
  beforeDestroy() {
    this.bpmnElement = null;
    this.groupMap = null;
    this.postMap = null;
    this.deptPostMap = null;
  }
};
</script>

<style lang="scss" scoped>
  @import '@/assets/style/element-variables.scss';
  .append-add {
    border: none;
    border-left: 1px solid #DCDFE6;
    border-radius: 0px;
    background: #F5F7FA;
  }
  .el-radio-group {
    padding-top: 4px;
    ::v-deep .el-radio {
    width: 90px;
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
    .el-radio__inner {
      width: 16px;
      height: 16px;
    }
    .el-radio__label {
      font-size: 12px;
      color: #333333;
      padding-left: 4px;
      font-weight: normal;
    }
    &.is-checked .el-radio__label {
      color: $--color-primary;
    }
    .el-radio__inner::after {
      width: 8px;
      height: 8px;
    }
   }
  }
  ::v-deep .el-input-number input {
    padding-right: 32px !important;
  }
  .number-box{
    display: inline-block;
    position: relative;
    float: right;
    i {
      font-size: 12px;
      transform: scale(0.8);
    }
    &>.icon {
      cursor: pointer;
      position: absolute;
      box-sizing: border-box;
      border-left: 1px solid #D4D6D9;
      width: 16px;
      height: 16px;
      right: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:active {
        background-color: rgba(0,0,0,0.1);
      }
    }
    .icon-plus-wrap {
      top: 1px;
    }
    .icon-minus-wrap {
      bottom: 0;
      border-top: 1px solid #D4D6D9;
    }
  }
</style>
