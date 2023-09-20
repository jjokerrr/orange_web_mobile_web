<template>
  <div class="tab-dialog-box" style="position: relative; margin-top: -15px;">
    <el-tabs v-model="activeFragmentId">
      <el-tab-pane label="权限资源" name="fragmentSysMenuPerm" style="width: 100%;">
        <el-form :label-width="defaultFormItemSize === 'small' ? '65px' : '75px'" :size="defaultFormItemSize" @submit.native.prevent label-position="left">
          <filter-box :item-width="350" @search="refreshfragmentSysMenuPerm(true)" :hasReset="false" style="padding: 0;margin: 0;">
            <el-form-item label="URL地址">
              <el-input class="filter-item" v-model="fragmentSysMenuPerm.formFilter.url" clearable
                placeholder="" />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table :data="fragmentSysMenuPerm.SysMenuPerm.impl.dataList" :size="defaultFormItemSize" :height="getTableHeight + 'px'"
              @sort-change="fragmentSysMenuPerm.SysMenuPerm.impl.onSortChange"
              header-cell-class-name="table-header-gray">
              <vxe-column title="序号" type="seq" width="55px"
                :index="fragmentSysMenuPerm.SysMenuPerm.impl.getTableIndex" />
              <vxe-column title="权限字名称" field="showName" width="150px">
              </vxe-column>
              <vxe-column title="权限字类型" width="100px">
                <template slot-scope="scope">
                  <el-tag :size="defaultFormItemSize" :type="getPermCodeType(scope.row.permCodeType)">
                    {{SysPermCodeType.getValue(scope.row.permCodeType)}}
                  </el-tag>
                </template>
              </vxe-column>
              <vxe-column title="权限字标识" field="permCode" width="300px" />
              <vxe-column title="权限名称" field="permName" width="150px" />
              <vxe-column title="关联URL" field="url" min-width="300px">
              </vxe-column>
              <template slot="empty">
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png">
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="用户查询" name="fragmentSysMenuUser" style="width: 100%;">
        <el-form :label-width="defaultFormItemSize === 'small' ? '65px' : '75px'" :size="defaultFormItemSize" @submit.native.prevent label-position="left">
          <filter-box :item-width="350" @search="refreshFragmentSysMenuUser(true)" :hasReset="false" style="padding: 0;margin: 0;">
            <el-form-item label="用户名称">
              <el-input class="filter-item" v-model="fragmentSysMenuUser.formFilter.loginName" clearable
                placeholder="" />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table :data="fragmentSysMenuUser.SysMenuUser.impl.dataList" :size="defaultFormItemSize" :height="getTableHeight + 'px'"
              @sort-change="fragmentSysMenuUser.SysMenuUser.impl.onSortChange"
              header-cell-class-name="table-header-gray">
              <vxe-column title="序号" header-align="center" align="center" type="index" width="55px"
                :index="fragmentSysMenuUser.SysMenuUser.impl.getTableIndex" />
              <vxe-column title="用户名" field="loginName" />
              <vxe-column title="用户昵称" field="showName" />
              <vxe-column title="用户角色" field="roleName" />
              <template slot="empty">
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png">
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
/* eslint-disable-next-line */
import { DropdownWidget, TableWidget, UploadWidget, ChartWidget } from '@/utils/widget.js';
import { SystemController } from '@/api';

export default {
  name: 'SysMenuPerm',
  props: {
    menuId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      activeFragmentId: 'fragmentSysMenuPerm',
      fragmentSysMenuPerm: {
        formFilter: {
          url: undefined
        },
        formFilterCopy: {
          url: undefined
        },
        SysMenuPerm: {
          impl: new TableWidget(this.loadSysMenuPermData, this.loadSysMenuPermVerify, false, false)
        }
      },
      fragmentSysMenuUser: {
        formFilter: {
          loginName: undefined
        },
        formFilterCopy: {
          loginName: undefined
        },
        SysMenuUser: {
          impl: new TableWidget(this.loadSysMenuUserData, this.loadSysMenuUserVerify, false, false)
        }
      }
    }
  },
  methods: {
    /**
     * 获取菜单权限资源函数，返回Promise
     */
    loadSysMenuPermData (params) {
      params.menuId = this.menuId;
      params.url = this.fragmentSysMenuPerm.formFilterCopy.url;
      return new Promise((resolve, reject) => {
        SystemController.listSysPermByMenuIdWithDetail(this, params).then(res => {
          resolve({
            dataList: res.data,
            totalCount: res.data.length
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 菜单权限资源获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadSysMenuPermVerify () {
      this.fragmentSysMenuPerm.formFilterCopy.url = this.fragmentSysMenuPerm.formFilter.url;
      return true;
    },
    getPermCodeType (permCodeType) {
      switch (permCodeType) {
        case this.SysPermCodeType.FORM: return 'primary';
        case this.SysPermCodeType.FRAGMENT: return 'warning';
        case this.SysPermCodeType.OPERATION: return 'success';
        default: return 'info';
      }
    },
    /**
     * 更新菜单权限资源
     */
    refreshfragmentSysMenuPerm (reloadData = false) {
      // 重新获取数据组件的数据
      if (reloadData) {
        this.fragmentSysMenuPerm.SysMenuPerm.impl.refreshTable(true, 1);
      } else {
        this.fragmentSysMenuPerm.SysMenuPerm.impl.refreshTable();
      }
    },
    /**
     * 获取菜单用户函数，返回Promise
     */
    loadSysMenuUserData (params) {
      params.menuId = this.menuId;
      params.loginName = this.fragmentSysMenuUser.formFilterCopy.loginName;
      return new Promise((resolve, reject) => {
        SystemController.listSysUserByMenuIdWithDetail(this, params).then(res => {
          resolve({
            dataList: res.data,
            totalCount: res.data.length
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 菜单用户获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadSysMenuUserVerify () {
      if (this.fragmentSysMenuUser.formFilter.loginName == null || this.fragmentSysMenuUser.formFilter.loginName === '') {
        this.$message.error('请输入用户名！');
        return false;
      }
      this.fragmentSysMenuUser.formFilterCopy.loginName = this.fragmentSysMenuUser.formFilter.loginName;
      return true;
    },
    /**
     * 更新菜单用户
     */
    refreshFragmentSysMenuUser (reloadData = false) {
      // 重新获取数据组件的数据
      if (reloadData) {
        this.fragmentSysMenuUser.SysMenuUser.impl.refreshTable(true, 1);
      } else {
        this.fragmentSysMenuUser.SysMenuUser.impl.refreshTable();
      }
    }
  },
  computed: {
    getTableHeight () {
      return (this.getMainContextHeight - 150);
    },
    ...mapGetters(['getMainContextHeight'])
  },
  mounted () {
  }
}
</script>

<style>
</style>
