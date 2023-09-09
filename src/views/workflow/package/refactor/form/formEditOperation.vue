<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <div v-if="tabType==='button'">
      <el-form ref="form" :model="formData" class="full-width-input form-box" :rules="rules" style="width: 100%;overflow-y: auto;overflow-x: hidden;"
        label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="按钮类型" prop="type">
              <el-select class="input-item" v-model="formData.type"
                :clearable="true" placeholder="按钮类型" @change="onOperationTypeChange">
                <el-option v-for="item in SysFlowTaskOperationType.getList().filter(item => item.id !== SysFlowTaskOperationType.INTERVENE)"
                  :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="按钮名称" prop="label">
              <el-input class="input-item" v-model="formData.label"
                :clearable="true" placeholder="按钮名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="更新工单状态">
              <el-select class="input-item" v-model="formData.latestApprovalStatus"
              >
                <el-option label="不更新" :value="undefined" />
                <el-option v-for="item in dialogParams.validStatusLiist" :key="item.id"
                  :label="item.name" :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.type === SysFlowTaskOperationType.MULTI_SIGN || formData.type === SysFlowTaskOperationType.SET_ASSIGNEE">
            <el-form-item :label="(formData.type === SysFlowTaskOperationType.MULTI_SIGN ? '会签' : '审批') + '用户类型'">
              <el-select v-model="multiSignAssignee.assigneeType" placeholder="" @change="typeChange">
                <el-option label="用户" value="USER_GROUP" />
                <el-option label="角色" value="ROLE_GROUP" />
                <el-option label="部门" value="DEPT_GROUP" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.type === SysFlowTaskOperationType.MULTI_SIGN || formData.type === SysFlowTaskOperationType.SET_ASSIGNEE">
            <el-form-item :label="(formData.type === SysFlowTaskOperationType.MULTI_SIGN ? '会签' : '审批') + '用户选择'">
              <TagSelect v-if="multiSignAssignee.assigneeType === 'USER_GROUP'" v-model="userName">
                <el-button slot="append" class="append-add" type="default" icon="el-icon-plus" @click="onSelectUser" />
              </TagSelect>
              <el-select class="assignee-select"
                v-if="multiSignAssignee.assigneeType === 'ROLE_GROUP'"
                v-model="multiSignAssignee.assigneeList" placeholder="" :multiple="true">
                <el-option v-for="item in multiSignGroupList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
              <TagSelect v-if="multiSignAssignee.assigneeType === 'DEPT_GROUP' " v-model="deptItems">
                <el-button slot="append" class="append-add" type="default" icon="el-icon-plus" @click="onSelectDept" />
              </TagSelect>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="显示顺序">
              <el-input-number class="input-item number-center" v-model="formData.showOrder"
                :clearable="true" placeholder="显示顺序" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-row class="no-scroll flex-box menu-box" type="flex" justify="end" style="padding-top:10px">
        <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
          取消
        </el-button>
        <el-button type="primary" :size="defaultFormItemSize"
          @click="onSubmit()">
          保存
        </el-button>
      </el-row>
    </div>
    <div v-else-if="tabType==='attributeSet'">
      <el-form ref="formAuthority" :model="formDataAuthority" class="full-width-input form-box" :rules="rules" style="width: 100%;overflow-y: auto;overflow-x: hidden;"
        label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="变量名称" prop="label">
              <el-select class="input-item" v-model="formDataAuthority.label"
                :clearable="true" placeholder="变量名称" @change="onOperationTypeChange">
                <el-option v-for="item in SysFlowTaskNameList"
                  :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="变量权限" prop="variableAuthority">
              <el-select class="input-item" v-model="formDataAuthority.authority"
                :clearable="true" placeholder="变量权限" @change="onOperationTypeChange">
                <el-option v-for="item in SysFlowTaskAuthorityList"
                  :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-row class="no-scroll flex-box menu-box" type="flex" justify="end" style="padding-top:10px">
        <el-button :size="defaultFormItemSize" :plain="true" @click="onCancelAuthority(false)">
          取消
        </el-button>
        <el-button type="primary" :size="defaultFormItemSize"
          @click="onSubmitAuthority()">
          保存
        </el-button>
      </el-row>
    </div>
  </div>
</template>

<script>
import { findTreeNodePath, treeDataTranslate, findItemFromList } from '@/utils';
import { SysCommonBizController } from '@/api';
import { FlowEntryVariableController } from '@/api/flowController.js';
import TaskUserSelect from '@/views/workflow/components/TaskUserSelect.vue';
import TaskGroupSelect from '@/views/workflow/components/TaskGroupSelect.vue';
import TagSelect from '@/views/workflow/components/TagSelect.vue';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  mixins: [thirdPartyMixin, refreshDataMixins],
  props: {
    entryId: {
      type: String,
      default: ''
    },
    tabType: {
      type: String
    },
    rowData: {
      type: Object
    },
    validStatusLiist: {
      type: Array,
      default: () => []
    }
  },
  components: {
    TagSelect
  },
  data () {
    return {
      formData: {
        id: undefined,
        type: undefined,
        label: undefined,
        latestApprovalStatus: undefined,
        showOrder: 0
      },
      formDataAuthority: {
        id: undefined,
        label: undefined,
        authority: undefined
      },
      userList: undefined,
      roleList: undefined,
      deptList: undefined,
      deptItems: [],
      deptData: [],
      SysFlowTaskNameList:[],
      SysFlowTaskAuthorityList:[{
        id: 1,
        name: '可读'
      },{
        id: 2,
        name: '可编辑'
      },{
        id: 3,
        name: '隐藏'
      }],
      multiSignAssignee: {
        assigneeType: 'USER_GROUP',
        value: [],
        assigneeList: []
      },
      rules: {
        type: [{ required: true, message: '请选择按钮类型', trigger: 'blur' }],
        label: [{ required: true, message: '请输入按钮名称', trigger: 'blur' }]
      },
      userName: []
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdTaskUserSelect' && data.isSuccess) {
        this.updateSelectUser(data.data)
      } else if (data.path === 'thirdTaskGroupSelect' && data.isSuccess) {
        this.updateSelectDept(data.data)
      }
    },
    onCancel (isSuccess) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, this.formData);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, undefined, this.formData);
      }
    },
    onCancelAuthority(isSuccess) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, this.formDataAuthority);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, undefined, this.formDataAuthority);
      }
    },
    onSubmit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if ((this.formData.type === this.SysFlowTaskOperationType.MULTI_SIGN || this.formData.type === this.SysFlowTaskOperationType.SET_ASSIGNEE) &&
            Array.isArray(this.multiSignAssignee.assigneeList) && this.multiSignAssignee.assigneeList.length > 0) {
            let tempValue;
            if (this.multiSignAssignee.assigneeType === 'USER_GROUP' || this.multiSignAssignee.assigneeType === 'ROLE_GROUP') {
              tempValue = this.multiSignAssignee.assigneeList.join(',');
            } else if (this.multiSignAssignee.assigneeType === 'DEPT_GROUP') {
              tempValue = this.multiSignAssignee.assigneeList.map(item => {
                return item[item.length - 1];
              }).join(',');
            }
            this.formData.multiSignAssignee = JSON.stringify({
              assigneeType: this.multiSignAssignee.assigneeType,
              assigneeList: tempValue
            });
          } else {
            this.formData.multiSignAssignee = undefined;
          }
          this.onCancel(true);
        }
      });
    },
    onSubmitAuthority() {
      this.$refs.formAuthority.validate(valid => {
        if (valid) {
          this.formDataAuthority.id = this.formDataAuthority.label,
          this.formDataAuthority.label = this.SysFlowTaskNameList.filter((item => item.id === this.formDataAuthority.label))[0].name,
          this.onCancelAuthority(true);
        }
      });
    },
    onOperationTypeChange (type) {
      this.typeChange();
      if (type == null || type === '') {
        this.formData.label = undefined;
      } else {
        this.formData.label = this.SysFlowTaskOperationType.getValue(type);
      }
    },
    loadGroupList (type) {
      return new Promise((resolve, reject) => {
        if (type === 'USER_GROUP') {
          // let params = {}
          // params.widgetType = 'upms_user';
          // SysCommonBizController.list(this, params).then(res => {
          //   this.userList = res.data.dataList.map(item => {
          //     return {
          //       id: item.loginName,
          //       name: item.showName
          //     }
          //   })
          resolve();
          // }).catch(e => {
          //   reject(e);
          // });
        } else if (type === 'ROLE_GROUP') {
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
        } else if (type === 'DEPT_GROUP') {
          let params = {
            widgetType: 'upms_dept',
            filter: {}
          };
          SysCommonBizController.list(this, params, null, {
            showMask: false
          }).then(res => {
            let deptList = [];
            res.data.dataList.forEach(item => {
              const obj = {
                id: String(item.deptId),
                name: item.deptName,
                parentId: String(item.parentId),
                ...item
              };
              deptList.push(obj)
            })
            this.deptData = JSON.parse(JSON.stringify(deptList));
            this.deptList = treeDataTranslate(deptList);
            resolve();
          }).catch(e => {
            reject(e);
          });
        }
      });
    },
    onSelectUser () {
      let usedUserIdList = this.multiSignAssignee.assigneeList;
      this.$dialog.show('添加抄送人', TaskUserSelect, {
        area: ['1000px', '650px']
      }, {
        multiple: true,
        showAssignee: false,
        showStartUser: false,
        usedUserIdList: usedUserIdList,
        path: 'thirdTaskUserSelect'
      }, {
        width: '1000px',
        height: '690px',
        pathName: '/thirdParty/thirdTaskUserSelect'
      }).then(res => {
        this.updateSelectUser(res);
      }).catch(e => {});
    },
    updateSelectUser (res) {
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
    onSelectDept () {
      let usedIdList = this.deptItems.map(row => row.id);
      this.$dialog.show('选择部门', TaskGroupSelect, {
        area: ['600px', '600px']
      }, {
        allGroupList: this.multiSignGroupList,
        usedIdList: usedIdList,
        path: 'thirdTaskGroupSelect'
      }, {
        width: '600px',
        height: '630px',
        pathName: '/thirdParty/thirdTaskGroupSelect',
      }).then(res => {
        this.updateSelectDept(res);
      }).catch(e => {
        console.error(e)
      });
    },
    updateSelectDept (res) {
      if (Array.isArray(res)) {
        if (!Array.isArray(this.deptItems)) this.deptItems = [];
        res.forEach(item => {
          if (findItemFromList(this.deptItems, item.id, 'id') == null) {
            this.deptItems.push(item);
          }
        });
      } else {
        this.deptItems.push({
          id: res.deptId,
          name: res.deptName
        });
        this.multiSignAssignee.assigneeList.push([res.deptId]);
      }
    },
    typeChange() {
      this.multiSignAssignee.assigneeList = []
      this.userName = []
      this.usedUserIdList = []
    },
    getDeptIds(deptIds, parentId, deptData){
      for (let i = 0; i < deptData.length; i++) {
        const item = deptData[i];
        if(item.deptId === parentId){
          deptIds.unshift(parentId)
          item.parentId && this.getDeptIds(deptIds, item.parentId, deptData);
          break;
        }
      }
    }
  },
  computed: {
    dialogParams () {
      return {
        rowData: this.rowData || this.thirdParams.rowData,
        validStatusLiist: this.validStatusLiist || this.thirdParams.validStatusLiist
      }
    },
    multiSignGroupList () {
      let tempList;
      switch (this.multiSignAssignee.assigneeType) {
        case 'USER_GROUP': return this.userList;
        case 'ROLE_GROUP': return this.roleList;
        case 'DEPT_GROUP': return this.deptList;
        default:
          return [];
      }
    }
  },
  watch: {
    multiSignGroupList: {
      handler (newValue) {
        if (newValue == null) this.loadGroupList(this.multiSignAssignee.assigneeType).catch(e => {});
      },
      deep: true,
      immediate: true
    },
    userName: {
      deep: true,
      handler (userName) {
        let usedUserIdList = userName.map(item => item.id);
        this.multiSignAssignee.assigneeList = usedUserIdList;
      }

    },
    deptItems: {
      deep: true,
      handler (deptItems) {
        let assigneeList = [];
        if (deptItems) {
          deptItems.forEach(item => {
            let deptIds = [item.deptId];
            this.getDeptIds(deptIds, item.parentId, this.deptData);
            assigneeList.push(deptIds);
          })
        }
        this.multiSignAssignee.assigneeList = assigneeList;
      }
    }
  },
  mounted () {
    if(this.tabType === 'attributeSet'){
      const mid = new Promise((resolve, reject) => {
        let params = {
          flowEntryVariableDtoFilter: {
            entryId: this.entryId
          }
        }
        FlowEntryVariableController.list(this, params).then(res => {
          this.SysFlowTaskNameList = res.data.dataList.map(item => {
            return {
              id: item.variableId,
              name: item.showName
            }
          });
          resolve();
        }).catch(e => {
          console.log(e);
          reject(e);
        });
      });
    }
    if (this.dialogParams.rowData) {
      this.formData = {
        ...this.dialogParams.rowData,
        latestApprovalStatus: this.dialogParams.rowData.latestApprovalStatus ? Number.parseInt(this.dialogParams.rowData.latestApprovalStatus) : undefined
      }
      if (this.dialogParams.rowData.multiSignAssignee) {
        this.multiSignAssignee = JSON.parse(this.dialogParams.rowData.multiSignAssignee);
        let assigneeValue = this.multiSignAssignee.assigneeList;
        this.multiSignAssignee.assigneeList = undefined;

        let params = {
          widgetType: 'upms_user',
          fieldName: 'loginName',
          fieldValues: assigneeValue
        }

        params.fieldValues = params.fieldValues.split(',').filter(row => {
          return ['${startUserName}', '${appointedAssignee}'].indexOf(row) === -1;
        }).join(',')

        if (params.fieldValues) {
          SysCommonBizController.viewByIds(this, params).then(res => {
            let loginNames = assigneeValue.split(',');
            let userNames = assigneeValue.split(',');
            res.data.forEach(item => {
              userNames[loginNames.indexOf(item.loginName)] = item.showName;
            })
            this.userName = loginNames.map((row, i) => {
              return {
                id: row,
                name: userNames[i]
              }
            })
          })
        } else {
          this.userName = assigneeValue.map((row) => {
            return {
              id: row,
              name: row
            }
          });
        }

        this.loadGroupList(this.multiSignAssignee.assigneeType).then(res => {
          if (this.multiSignAssignee.assigneeType === 'USER_GROUP' || this.multiSignAssignee.assigneeType === 'ROLE_GROUP') {
            this.multiSignAssignee.assigneeList = assigneeValue.split(',');
          } else if (this.multiSignAssignee.assigneeType === 'DEPT_GROUP') {
            this.multiSignAssignee.assigneeList = assigneeValue.split(',').map(item => {
              for (let i = 0; i < this.deptData.length; i++) {
                const row = this.deptData[i];
                if(row.deptId === item){
                  this.deptItems.push(row);
                  break;
                }
              }
              let nodePath = findTreeNodePath(this.multiSignGroupList, item);
              return nodePath;
            });
          }
        }).catch(e => {});
      }
    }
  }
}
</script>

<style scoped>
  .assignee-select >>> .el-input__inner {
    min-height: 28px!important;
  }
  .append-add {
    border: none;
    border-left: 1px solid #DCDFE6;
    border-radius: 0px;
    background: #F5F7FA;
  }
</style>
