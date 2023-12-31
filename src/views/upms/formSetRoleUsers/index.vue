<template>
  <div style="height: 490px">
    <el-form ref="formSetRoleUsers" :model="formSysUser" label-width="75px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent style="overflow: hidden;">
      <filter-box :item-width="325" @search="refreshFormSysUser(true)" @reset="onReset" style="padding: 0;margin: 0;float: left;">
        <el-form-item label="用户状态" prop="formFilter.sysUserStatus">
          <el-select class="filter-item" v-model="formSysUser.formFilter.sysUserStatus" :clearable="true"
            placeholder="用户状态" :loading="formSysUser.sysUserStatus.impl.loading"
            @visible-change="onSysUserStatusVisibleChange">
            <el-option v-for="item in formSysUser.sysUserStatus.impl.dropdownList" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="formFilter.sysUserLoginName">
          <el-input class="filter-item" v-model="formSysUser.formFilter.sysUserLoginName"
            :clearable="true" placeholder="用户名" />
        </el-form-item>
      </filter-box>
      <el-button style="float: right" :size="defaultFormItemSize" type="primary" :plain="false" @click="onSetUser" :disabled="selectUsers == null || selectUsers.length <= 0">授权人员</el-button>
    </el-form>
    <el-row>
      <el-col :span="24">
        <vxe-table :data="formSysUser.SysUser.impl.dataList"
          header-cell-class-name="table-header-gray" height="400px"
          :size="defaultFormItemSize" ref="userTable"
          :seq-config="{startIndex: ((formSysUser.SysUser.impl.currentPage - 1) * formSysUser.SysUser.impl.pageSize)}"
          @checkbox-change="onTableSelectionChange"
          @checkbox-all="onTableSelectionChange"
        >
          <vxe-column header-align="center" align="center" type="checkbox" width="50px" :reserve-selection="true" />
          <vxe-column title="序号" type="seq" width="50px"/>
          <vxe-column title="用户名" field="loginName">
          </vxe-column>
          <vxe-column title="昵称" field="showName">
          </vxe-column>
          <vxe-column title="账号类型">
            <template slot-scope="scope">
              <span>{{SysUserType.getValue(scope.row.userType)}}</span>
            </template>
          </vxe-column>
          <vxe-column title="状态">
            <template slot-scope="scope">
              <el-tag :type="getUserStatusType(scope.row.userStatus)" :size="defaultFormItemSize">{{SysUserStatus.getValue(scope.row.userStatus)}}</el-tag>
            </template>
          </vxe-column>
          <template slot="empty">
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png">
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
        <el-col :span="24">
          <el-row type="flex" justify="end" style="margin-top: 16px;">
            <el-pagination
              :total="formSysUser.SysUser.impl.totalCount"
              :current-page="formSysUser.SysUser.impl.currentPage"
              :page-size="formSysUser.SysUser.impl.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, prev, pager, next, sizes"
              @current-change="formSysUser.SysUser.impl.onCurrentPageChange"
              @size-change="formSysUser.SysUser.impl.onPageSizeChange">
            </el-pagination>
          </el-row>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
/* eslint-disable-next-line */
import { DropdownWidget, TableWidget, UploadWidget, ChartWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin, cachedPageChildMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { SystemController, DictionaryController } from '@/api';

export default {
  props: {
    roleId: {
      type: [String, Number],
      required: true
    }
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin],
  data () {
    return {
      formSysUser: {
        formFilter: {
          sysUserStatus: undefined,
          sysUserLoginName: undefined
        },
        formFilterCopy: {
          sysUserStatus: undefined,
          sysUserLoginName: undefined
        },
        sysUserStatus: {
          impl: new DropdownWidget(this.loadSysUserStatusDropdownList)
        },
        SysUser: {
          impl: new TableWidget(this.loadSysUserData, this.loadSysUserVerify, true, false)
        },
        isInit: false
      },
      selectUsers: []
    }
  },
  methods: {
    /**
     * 用户状态下拉数据获取函数
     */
    loadSysUserStatusDropdownList () {
      return new Promise((resolve, reject) => {
        let params = {};
        DictionaryController.dictSysUserStatus(this, params).then(res => {
          resolve(res.getList());
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 用户状态下拉框显隐
     */
    onSysUserStatusVisibleChange (show) {
      this.formSysUser.sysUserStatus.impl.onVisibleChange(show).catch(e => {});
    },
    getUserStatusType (status) {
      if (status === this.SysUserStatus.NORMAL) {
        return 'success';
      } else if (status === this.SysUserStatus.LOCKED) {
        return 'danger';
      } else {
        return 'info';
      }
    },
    onTableSelectionChange (values) {
      this.selectUsers = values.records;
    },
    onSetUser () {
      let params = {
        roleId: this.roleId,
        userIdListString: this.selectUsers.map((item) => {
          return item.userId
        }).join(',')
      }

      SystemController.addRoleUser(this, params).then(res => {
        this.$message.success('授权成功');
        this.refreshFormSysUser(true);
        this.$refs.userTable.clearCheckboxRow();
        this.selectUsers = [];
      }).catch(e => {});
    },
    onCancel () {
      this.$router.go(-1);
    },
    onReset () {
      this.$refs.formSetRoleUsers.resetFields();
      this.refreshFormSysUser(true);
    },
    loadSysUserData (params) {
      params.roleId = this.roleId;
      params.sysUserDtoFilter = {
        loginName: this.formSysUser.formFilterCopy.sysUserLoginName,
        userStatus: this.formSysUser.formFilterCopy.sysUserStatus
      }
      this.$refs.userTable.clearCheckboxRow();
      return new Promise((resolve, reject) => {
        SystemController.listNotInUserRole(this, params).then(res => {
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadSysUserVerify () {
      this.formSysUser.formFilterCopy.sysUserLoginName = this.formSysUser.formFilter.sysUserLoginName;
      this.formSysUser.formFilterCopy.sysUserStatus = this.formSysUser.formFilter.sysUserStatus;
      return true;
    },
    refreshFormSysUser (reloadData = false) {
      // 重新获取数据组件的数据
      if (reloadData) {
        this.formSysUser.SysUser.impl.refreshTable(true, 1);
      } else {
        this.formSysUser.SysUser.impl.refreshTable();
      }
      this.formSysUser.sysUserStatus.impl.onVisibleChange(true).catch(e => {});
      this.formSysUser.isInit = true;
    },
    initData () {
      this.refreshFormSysUser();
    }
  },
  mounted () {
    this.initData();
  },
  computed: {
    getContextHeightStyle () {
      return [
        {'height': (this.getClientHeight - 142) + 'px'}
      ]
    },
    ...mapGetters(['getClientHeight'])
  },
  watch: {
    currentPage: function (value, oldValue) {
      this.loadDatasource(false).catch(e => {
        this.currentPage = oldValue;
      })
    }
  }
}
</script>

<style>
</style>
