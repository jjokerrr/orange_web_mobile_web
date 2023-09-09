<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <el-form ref="form" :model="formData" class="full-width-input form-box" style="width: 100%;"
      label-width="150px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
        <el-form-item label="抄送类型" prop="type">
          <el-select class="input-item" v-model="formData.type"
            placeholder="抄送类型" @change="onCopyForTypeChange">
            <el-option v-for="item in SysFlowCopyForType.getList()"
              :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.type === SysFlowCopyForType.USER" label="抄送人" prop="id">
          <TagSelect v-model="userName">
            <el-button slot="append" class="append-add" type="default" icon="el-icon-plus" @click="onSelectUser" />
          </TagSelect>
        </el-form-item>
        <el-form-item v-if="formData.type === SysFlowCopyForType.ROLE" label="抄送角色" prop="id">
          <el-select v-model="formData.id" placeholder="" :multiple="true">
            <el-option v-for="role in dialogParams.roleList" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.type === SysFlowCopyForType.DEPT" label="抄送部门" prop="id">
          <TagSelect v-model="selectDeptList">
            <el-button slot="append" class="append-add" type="default" icon="el-icon-plus" @click="onSelectDept" />
          </TagSelect>
        </el-form-item>
    </el-form>
    <el-row type="flex" justify="end" class="no-scroll menu-box">
      <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
        取消
      </el-button>
      <el-button type="primary" :size="defaultFormItemSize" @click="onSubmit()">
        保存
      </el-button>
    </el-row>
  </div>
</template>

<script>
import { findItemFromList } from '@/utils';
import TagSelect from '@/views/workflow/components/TagSelect.vue';
import TaskUserSelect from '@/views/workflow/components/TaskUserSelect.vue';
import TaskGroupSelect from '@/views/workflow/components/TaskGroupSelect.vue';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  mixins: [thirdPartyMixin, refreshDataMixins],
  props: {
    deptList: {
      type: Array
    },
    roleList: {
      type: Array
    }
  },
  components: {
    TagSelect
  },
  data () {
    return {
      selectDeptList: [],
      formData: {
        type: this.SysFlowCopyForType.USER,
        id: undefined
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
    onCancel (isSuccess, data) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, data);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, undefined, data);
      }
    },
    onSubmit () {
      if ((this.formData.id == null || this.formData.id === '') &&
        this.formData.type !== this.SysFlowCopyForType.SELF_DEPT_LEADER &&
        this.formData.type !== this.SysFlowCopyForType.UP_DEPT_LEADER) {
        this.$message.warning('请选择' + this.SysFlowCopyForType.getValue(this.formData.type));
        return;
      }
      let tempId = null;
      switch (this.formData.type) {
        case this.SysFlowCopyForType.ROLE:
          tempId = this.formData.id.join(',');
          break;
        case this.SysFlowCopyForType.USER:
        case this.SysFlowCopyForType.DEPT:
          tempId = this.formData.id;
          break;
        default:
          tempId = '';
          break;
      }
      this.onCancel(true, {
        type: this.formData.type,
        id: tempId,
        userName: this.userName
      });
    },
    onDeptChange (val) {
      this.formData.id = undefined;
    },
    onCopyForTypeChange (val) {
      this.formData.id = undefined;
      this.userName = [];
      this.usedUserIdList = [];
      this.selectDeptList = [];
    },
    onSelectUser () {
      let usedUserIdList = (this.formData.id == null || this.formData.id === '') ? [] : this.formData.id.split(',');
      this.$dialog.show('添加抄送人', TaskUserSelect, {
        area: ['1000px', '650px']
      }, {
        multiple: true,
        props: {
          label: 'showName',
          value: 'userId'
        },
        usedUserIdList: usedUserIdList,
        path: 'thirdTaskUserSelect'
      }, {
        width: '1000px',
        height: '690px',
        pathName: '/thirdParty/thirdTaskUserSelect'
      }).then(res => {
        this.updateSelectUser(res)
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
      } else {
        this.userName = res ? [
          {
            id: res.loginName,
            name: res.showName || res.loginName
          }
        ] : [];
      }
    },
    onSelectDept () {
      let usedIdList = (this.formData.id == null || this.formData.id === '') ? [] : this.formData.id.split(',');
      this.$dialog.show('选择部门', TaskGroupSelect, {
        area: ['600px', '600px']
      }, {
        allGroupList: this.dialogParams.deptList,
        usedIdList: usedIdList,
        path: 'thirdTaskGroupSelect'
      }, {
        width: '600px',
        height: '630px',
        pathName: '/thirdParty/thirdTaskGroupSelect'
      }).then(res => {
        this.updateSelectDept(res)
      }).catch(e => {});
    },
    updateSelectDept (res) {
      if (Array.isArray(res)) {
        if (!Array.isArray(this.selectDeptList)) this.selectDeptList = [];
        res.forEach(item => {
          if (findItemFromList(this.selectDeptList, item.id, 'id') == null) {
            this.selectDeptList.push(item);
          }
        });
      }
      this.formData.id = Array.isArray(this.selectDeptList) ? this.selectDeptList.map(item => item.id).join(',') : '';
    }
  },
  computed: {
    dialogParams () {
      return {
        deptList: this.deptList || this.thirdParams.deptList,
        postList: this.postList || this.thirdParams.postList,
        deptPostList: this.deptPostList || this.thirdParams.deptPostList,
        roleList: this.roleList || this.thirdParams.roleList
      }
    }
  },
  watch: {
    userName: {
      deep: true,
      handler (userName) {
        let usedUserIdList = userName.map(item => item.id);
        this.formData.id = usedUserIdList.join(',');
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
