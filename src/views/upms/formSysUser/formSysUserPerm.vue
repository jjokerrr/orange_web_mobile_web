<template>
  <div class="tab-dialog-box" style="position: relative; margin-top: -15px;">
    <el-tabs v-model="activeFragmentId">
      <el-tab-pane label="权限资源" name="fragmentSysUserPerm" style="width: 100%;">
        <el-form :label-width="defaultFormItemSize === 'small' ? '65px' : '75px'" :size="defaultFormItemSize" @submit.native.prevent label-position="left">
          <filter-box :item-width="350" @search="refreshFragmentSysUserPerm(true)" :hasReset="false" style="padding: 0;margin: 0;">
            <el-form-item label="URL地址">
              <el-input class="filter-item" v-model="fragmentSysUserPerm.formFilter.url" clearable
                placeholder="" />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table :data="fragmentSysUserPerm.SysUserPerm.impl.dataList" :size="defaultFormItemSize" :height="getTableHeight + 'px'"
              @sort-change="fragmentSysUserPerm.SysUserPerm.impl.onSortChange"
              header-cell-class-name="table-header-gray">
              <vxe-column title="序号" type="seq" width="55px"
                :index="fragmentSysUserPerm.SysUserPerm.impl.getTableIndex" />
              <vxe-column title="所属角色" field="roleName" width="150px" />
              <vxe-column title="菜单">
                <template slot-scope="scope">
                  <span>{{getMenuPathString(getMenuPathById(scope.row.menuId)) || scope.row.menuName}}</span>
                </template>
              </vxe-column>
              <vxe-column title="所属权限字" field="permCode" />
              <vxe-column title="URL" field="url" />
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
      <el-tab-pane label="权限字名" name="fragmentSysUserPermCode" style="width: 100%;">
        <el-form :label-width="defaultFormItemSize === 'small' ? '65px' : '75px'" :size="defaultFormItemSize" @submit.native.prevent label-position="left">
          <filter-box :item-width="350" @search="refreshFragmentSysUserPermCode(true)" :hasReset="false" style="padding: 0;margin: 0;">
            <el-form-item label="权限字名">
              <el-input class="filter-item" v-model="fragmentSysUserPermCode.formFilter.permCode" clearable
                placeholder="" />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table :data="fragmentSysUserPermCode.SysUserPermCode.impl.dataList" :size="defaultFormItemSize" :height="getTableHeight + 'px'"
              @sort-change="fragmentSysUserPermCode.SysUserPermCode.impl.onSortChange"
              header-cell-class-name="table-header-gray">
              <vxe-column title="序号" type="seq" width="55px"
                :index="fragmentSysUserPermCode.SysUserPermCode.impl.getTableIndex" />
              <vxe-column title="所属角色" field="roleName" width="150px" />
              <vxe-column title="菜单">
                <template slot-scope="scope">
                  <span>{{getMenuPathString(getMenuPathById(scope.row.menuId)) || scope.row.menuName}}</span>
                </template>
              </vxe-column>
              <vxe-column title="权限字" field="permCode" />
              <vxe-column title="权限字类型" field="permCodeType">
                <template slot-scope="scope">
                  <el-tag :size="defaultFormItemSize" :type="getPermCodeType(scope.row.permCodeType)">{{SysPermCodeType.getValue(scope.row.permCodeType)}}</el-tag>
                </template>
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
      <el-tab-pane label="菜单权限" name="fragmentSysUserMenu" style="width: 100%;">
        <el-form :label-width="defaultFormItemSize === 'small' ? '65px' : '75px'" :size="defaultFormItemSize" @submit.native.prevent label-position="left">
          <filter-box :item-width="350" @search="refreshFragmentSysUserMenu(true)" :hasReset="false" style="padding: 0;margin: 0;">
            <el-form-item label="菜单名称">
              <el-input class="filter-item" v-model="fragmentSysUserMenu.formFilter.menuName" clearable
                placeholder="" />
            </el-form-item>
          </filter-box>
        </el-form>
        <el-row>
          <el-col :span="24">
            <vxe-table :data="fragmentSysUserMenu.SysUserMenu.impl.dataList" :size="defaultFormItemSize" :height="getTableHeight + 'px'"
              @sort-change="fragmentSysUserMenu.SysUserMenu.impl.onSortChange"
              header-cell-class-name="table-header-gray">
              <vxe-column title="序号" type="seq" width="55px"
                :index="fragmentSysUserPermCode.SysUserPermCode.impl.getTableIndex" />
              <vxe-column title="所属角色" field="roleName" width="150px" />
              <vxe-column title="菜单">
                <template slot-scope="scope">
                  <span>{{getMenuPathString(getMenuPathById(scope.row.menuId)) || scope.row.menuName}}</span>
                </template>
              </vxe-column>
              <vxe-column title="菜单类型" field="menuType">
                <template slot-scope="scope">
                  <el-tag :size="defaultFormItemSize" :type="getMenuType(scope.row)">{{SysMenuType.getValue(scope.row.menuType)}}</el-tag>
                </template>
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
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
/* eslint-disable-next-line */
import { DropdownWidget, TableWidget, UploadWidget, ChartWidget } from '@/utils/widget.js';
import { SystemController } from '@/api';

export default {
  name: 'SysUserPerm',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      activeFragmentId: 'fragmentSysUserPerm',
      menuMap: new Map(),
      fragmentSysUserPerm: {
        formFilter: {
          url: undefined
        },
        formFilterCopy: {
          url: undefined
        },
        SysUserPerm: {
          impl: new TableWidget(this.loadSysUserPermData, this.loadSysUserPermVerify, false, false)
        },
        isInit: false
      },
      fragmentSysUserPermCode: {
        formFilter: {
          permCode: undefined
        },
        formFilterCopy: {
          permCode: undefined
        },
        SysUserPermCode: {
          impl: new TableWidget(this.loadSysUserPermCodeData, this.loadSysUserPermCodeVerify, false, false)
        }
      },
      fragmentSysUserMenu: {
        formFilter: {
          menuName: undefined
        },
        formFilterCopy: {
          menuName: undefined
        },
        SysUserMenu: {
          impl: new TableWidget(this.loadSysUserMenuData, this.loadSysUserMenuVerify, false, false)
        }
      }
    }
  },
  methods: {
    getMenuType (row) {
      if (row.menuType === 0) {
        return 'primary'
      } else if (row.menuType === 1) {
        return 'success';
      } else if (row.menuType === 2) {
        return 'danger';
      } else if (row.menuType === 3) {
        return 'warning';
      }
    },
    /**
     * 获取所有菜单项
     */
    loadSysMenuData () {
      return new Promise((resolve, reject) => {
        SystemController.getMenuPermList(this, {}).then(res => {
          res.data.forEach(item => {
            this.menuMap.set(item.menuId, item);
          });
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    getMenuPathById (menuId) {
      if (menuId == null || menuId === '') return null;
      let menuPath = [];
      do {
        let menuItem = this.menuMap.get(menuId);
        if (menuItem != null) {
          menuPath.unshift(menuItem);
          menuId = menuItem.parentId;
        } else {
          menuId = null;
        }
      } while (menuId != null);

      return menuPath;
    },
    getMenuPathString (menuPath) {
      if (Array.isArray(menuPath) && menuPath.length > 0) {
        return menuPath.map(item => item.menuName).join(' / ');
      } else {
        return null;
      }
    },
    /**
     * 获取用户权限资源列表函数，返回Promise
     */
    loadSysUserPermData (params) {
      params.userId = this.userId;
      params.url = this.fragmentSysUserPerm.formFilterCopy.url;
      return new Promise((resolve, reject) => {
        SystemController.listSysPermWithDetail(this, params).then(res => {
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
     * 用户权限资源获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadSysUserPermVerify () {
      this.fragmentSysUserPerm.formFilterCopy.url = this.fragmentSysUserPerm.formFilter.url;
      return true;
    },
    /**
     * 更新用户权限资源
     */
    refreshFragmentSysUserPerm (reloadData = false) {
      // 重新获取数据组件的数据
      if (reloadData) {
        this.fragmentSysUserPerm.SysUserPerm.impl.refreshTable(true, 1);
      } else {
        this.fragmentSysUserPerm.SysUserPerm.impl.refreshTable();
      }
      this.fragmentSysUserPerm.isInit = true;
    },
    /**
     * 获取用户权限字列表函数，返回Promise
     */
    loadSysUserPermCodeData (params) {
      params.userId = this.userId;
      params.permCode = this.fragmentSysUserPermCode.formFilterCopy.permCode;
      return new Promise((resolve, reject) => {
        SystemController.listSysPermCodeWithDetail(this, params).then(res => {
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
     * 用户权限资源获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadSysUserPermCodeVerify () {
      this.fragmentSysUserPermCode.formFilterCopy.permCode = this.fragmentSysUserPermCode.formFilter.permCode;
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
     * 更新用户权限资源
     */
    refreshFragmentSysUserPermCode (reloadData = false) {
      // 重新获取数据组件的数据
      if (reloadData) {
        this.fragmentSysUserPermCode.SysUserPermCode.impl.refreshTable(true, 1);
      } else {
        this.fragmentSysUserPermCode.SysUserPermCode.impl.refreshTable();
      }
      this.fragmentSysUserPermCode.isInit = true;
    },
    /**
     * 获取用户权限资源列表函数，返回Promise
     */
    loadSysUserMenuData (params) {
      params.userId = this.userId;
      params.menuName = this.fragmentSysUserMenu.formFilterCopy.menuName;
      return new Promise((resolve, reject) => {
        SystemController.listSysMenuWithDetail(this, params).then(res => {
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
     * 用户权限资源获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadSysUserMenuVerify () {
      this.fragmentSysUserMenu.formFilterCopy.menuName = this.fragmentSysUserMenu.formFilter.menuName;
      return true;
    },
    /**
     * 更新用户权限资源
     */
    refreshFragmentSysUserMenu (reloadData = false) {
      // 重新获取数据组件的数据
      if (reloadData) {
        this.fragmentSysUserMenu.SysUserMenu.impl.refreshTable(true, 1);
      } else {
        this.fragmentSysUserMenu.SysUserMenu.impl.refreshTable();
      }
      this.fragmentSysUserMenu.isInit = true;
    }
  },
  computed: {
    getTableHeight () {
      return (this.getMainContextHeight - 150);
    },
    ...mapGetters(['getMainContextHeight'])
  },
  mounted () {
    this.loadSysMenuData().catch(e => {});
  }
}
</script>

<style>
</style>
