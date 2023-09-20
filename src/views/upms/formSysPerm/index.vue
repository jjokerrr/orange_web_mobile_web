<template>
  <el-container class="advance-query-form advance-box">
    <el-aside width="300px" style="background-color: white;">
      <el-card class="base-card" shadow="never" style="border: none;">
        <div slot="header" class="base-card-header">
          <span style="color: #333333;font-weight: bold;" class="header-title">权限模块</span>
          <div class="base-card-operation">
            <el-button class="advance-icon-btn" @click="refreshFormPerm()" style="width: 40px;height: 32px;padding: 0;">
              <img src="@/assets/img/refresh2.png" alt=""  style="vertical-align: middle;"/>
            </el-button>
            <el-button class="advance-icon-btn" :size="defaultFormItemSize" :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:addPermModule')" @click="onCreatePermModuleClick()" style="width: 40px;height: 32px;padding: 0;">
              <img src="@/assets/img/add.png" alt="" style="vertical-align: middle;">
            </el-button>
          </div>
        </div>
        <el-scrollbar :style="{height: (getMainContextHeight - 130) + 'px'}">
          <el-tree ref="moduleTree" :data="getModuleTreeData" :props="{label: 'moduleName'}"
            node-key="moduleId" @node-click="onModuleNodeClick" :default-expanded-keys="formPerm.expandedModule"
            :highlight-current="true" @node-expand="onModuleNodeExpand" @node-collapse="onModuleNodeCollapse">
            <div class="module-node-item" slot-scope="{ data }">
              <div class="module-node-menu" :class="{group: data.moduleType === SysPermModuleType.GROUP}" v-if="!data.isAll">
                <el-button type="text" :size="defaultFormItemSize" v-show="data.moduleType === SysPermModuleType.GROUP"
                  :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:addPermModule')"
                  @click.stop="onAddChildPermModuleClick(data)" icon="el-icon-circle-plus-outline"></el-button>
                <el-button type="text" :size="defaultFormItemSize" @click.stop="onEditpermModuleClick(data)"
                  :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:updatePermModule')" icon="el-icon-edit-outline"></el-button>
                <el-button type="text" :size="defaultFormItemSize" @click.stop="onDeleteModuleClick(data)"
                  :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:deletePermModule')" icon="el-icon-delete"></el-button>
              </div>
              <div class="module-node-text" :class="{group: data.moduleType === SysPermModuleType.GROUP}">
                <div class="text">{{ data.moduleName }}</div>
              </div>
            </div>
          </el-tree>
        </el-scrollbar>
      </el-card>
    </el-aside>
    <el-main style="margin-left: 15px;overflow: inherit;">
      <el-form ref="formPerm" :model="formPerm" label-width="75px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
        <filter-box :item-width="350" @search="refreshFormPerm(true)" @reset="onReset">
          <el-form-item label="关联URL" prop="formFilter.url">
            <el-input class="filter-item" placeholder="URL模糊搜索" v-model="formPerm.formFilter.url"
              :size="defaultFormItemSize" clearable />
          </el-form-item>
        </filter-box>
      </el-form>
      <table-box :data="formPerm.SysPerm.impl.dataList" :size="defaultFormItemSize" @sort-change="formPerm.SysPerm.impl.onSortChange" @refresh="refreshFormPerm(true)" :seq-config="{startIndex: ((formPerm.SysPerm.impl.currentPage - 1) * formPerm.SysPerm.impl.pageSize)}">
        <el-button slot="operator" type="primary" icon="el-icon-plus" :size="defaultFormItemSize" :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:addPerm')"
          @click="onCreatePermClick()">
          新建
        </el-button>
        <vxe-column title="序号" type="seq" width="50px" :index="formPerm.SysPerm.impl.getTableIndex" />
        <vxe-column title="权限名称" field="permName" width="150px">
        </vxe-column>
        <vxe-column title="权限模块" field="moduleIdDictMap.name" width="150px">
        </vxe-column>
        <vxe-column title="关联URL" field="url" min-width="250px">
        </vxe-column>
        <vxe-column title="操作" fixed="right" width="160px">
          <template slot-scope="scope">
            <el-button @click="onEditPermModuleClick(scope.row)" type="text" :size="defaultFormItemSize"
              :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:updatePerm')">
              编辑
            </el-button>
            <el-button @click="onDeleteClick(scope.row)" type="text" :size="defaultFormItemSize"
              :disabled="!checkPermCodeExist('formSysPerm:fragmentSysPerm:deletePerm')">
              删除
            </el-button>
            <el-button class="btn-table-primary" type="text" :size="defaultFormItemSize"
              v-if="checkPermCodeExist('formSysPerm:fragmentSysPerm:listSysPermPermDetail')"
              @click="onSysPermDetailClick(scope.row)">
              权限详情
            </el-button>
          </template>
        </vxe-column>
        <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
          <el-pagination
            :total="formPerm.SysPerm.impl.totalCount"
            :current-page="formPerm.SysPerm.impl.currentPage"
            :page-size="formPerm.SysPerm.impl.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes"
            @current-change="formPerm.SysPerm.impl.onCurrentPageChange"
            @size-change="formPerm.SysPerm.impl.onPageSizeChange">
          </el-pagination>
        </el-row>
      </table-box>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex';
/* eslint-disable-next-line */
import { DropdownWidget, TableWidget, UploadWidget, ChartWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin, cachedPageChildMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { SystemController, DictionaryController } from '@/api';
import formEditSysPerm from '../formEditSysPerm';
import formEditSysPermModule from '../formEditSysPermModule';
import FormSysPermDetail from './formSysPermDetail.vue';

export default {
  name: 'formSysPerm',
  props: {
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin],
  data () {
    return {
      formPerm: {
        formFilter: {
          permModuleId: undefined,
          url: undefined
        },
        formFilterCopy: {
          permModuleId: undefined,
          url: undefined
        },
        permModuleId: {
          impl: new DropdownWidget(this.loadPermModuleIdDropdownList, true, 'moduleId', 'parentId')
        },
        SysPerm: {
          impl: new TableWidget(this.loadSysPermData, this.loadSysPermVerify, true)
        },
        permModuleList: [],
        expandedModule: [],
        isInit: false
      }
    }
  },
  methods: {
    onReset () {
      this.$refs.formPerm.resetFields();
      this.refreshFormPerm(true);
    },
    /**
     * 权限数据获取函数，返回Primise
     */
    loadSysPermData (params) {
      params.sysPermDtoFilter = {
        url: this.formPerm.formFilterCopy.url === '' ? undefined : this.formPerm.formFilterCopy.url,
        moduleId: this.formPerm.formFilterCopy.permModuleId === '' ? undefined : this.formPerm.formFilterCopy.permModuleId
      }
      return new Promise((resolve, reject) => {
        SystemController.getPermList(this, params).then(res => {
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
     * 权限数据获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadSysPermVerify () {
      this.formPerm.formFilterCopy.url = this.formPerm.formFilter.url;
      this.formPerm.formFilterCopy.permModuleId = this.formPerm.formFilter.permModuleId;
      return true;
    },
    /**
     * 所属权限模块下拉数据获取函数
     */
    loadPermModuleIdDropdownList () {
      return new Promise((resolve, reject) => {
        let params = {};
        SystemController.getPermGroupList(this, params).then(res => {
          this.formPerm.permModuleList = res.data;
          resolve(res.data);
        }).catch(e => {
          reject();
        });
      });
    },
    /**
     * 所属权限模块下拉框显隐
     */
    onPermModuleIdVisibleChange (show) {
      this.formPerm.permModuleId.impl.onVisibleChange(show).catch(e => {});
    },
    /**
     * 所属权限模块选中值改变
     */
    onPermModuleIdValueChange (value) {
    },
    onSysPermDetailClick (row) {
      this.$dialog.show('权限详情', FormSysPermDetail, {
        area: '1200px',
        offset: '30px'
      }, {
        permId: row.permId
      }).then(res => {}).catch(e => {});
    },
    /**
     * 更新权限管理
     */
    refreshFormPerm (reloadData = false) {
      // 重新获取数据组件的数据
      if (reloadData) {
        this.formPerm.SysPerm.impl.refreshTable(true, 1);
      } else {
        this.formPerm.SysPerm.impl.refreshTable();
      }
      this.formPerm.permModuleId.impl.onVisibleChange(true).catch(e => {});
      this.formPerm.isInit = true;
    },
    /**
     * 新建
     */
    onCreatePermClick () {
      let params = {
        currentPermGroupId: this.formPerm.formFilterCopy.permModuleId,
        permModuleList: this.formPerm.permModuleId.impl.dropdownList
      };

      this.$dialog.show('新建', formEditSysPerm, {
        area: ['600px']
      }, params).then(res => {
        this.refreshFormPerm();
      }).catch(e => {});
    },
    /**
     * 编辑
     */
    onEditPermModuleClick (row) {
      let params = {
        moduleId: row.moduleId,
        permId: row.permId,
        rowData: row,
        permModuleList: this.formPerm.permModuleId.impl.dropdownList
      };

      this.$dialog.show('编辑', formEditSysPerm, {
        area: ['600px']
      }, params).then(res => {
        this.formPerm.SysPerm.impl.refreshTable();
      }).catch(e => {});
    },
    /**
     * 删除
     */
    onDeleteClick (row) {
      let params = {
        permId: row.permId
      };

      this.$confirm('是否删除此权限？').then(res => {
        SystemController.deletePerm(this, params).then(res => {
          this.$message.success('删除成功');
          this.formPerm.SysPerm.impl.refreshTable();
        }).catch(e => {});
      }).catch(e => {});
    },
    onResume () {
      this.refreshFormPerm();
    },
    initFormData () {
    },
    formInit () {
      this.initFormData();
      this.refreshFormPerm();
    },
    onModuleNodeClick (data) {
      if (data.moduleType === this.SysPermModuleType.CONTROLLER) {
        this.formPerm.formFilter.permModuleId = data.moduleId;
        this.refreshFormPerm(true);
      }
    },
    /**
     * 新建模块
     */
    onCreatePermModuleClick () {
      let params = {
        moduleType: this.SysPermModuleType.GROUP,
        moduleList: this.formPerm.permModuleList
      };

      this.$dialog.show('新建模块', formEditSysPermModule, {
        area: ['600px']
      }, params).then(res => {
        this.formPerm.permModuleId.impl.reloadDropdownData().catch(e => {});
      }).catch(e => {});
    },
    /**
     * 编辑模块
     */
    onEditpermModuleClick (row) {
      let params = {
        moduleId: row.moduleId,
        moduleType: row.moduleType,
        rowData: row,
        moduleList: this.formPerm.permModuleList
      };

      this.$dialog.show('编辑模块', formEditSysPermModule, {
        area: ['600px']
      }, params).then(res => {
        this.formPerm.permModuleId.impl.reloadDropdownData().catch(e => {});
      }).catch(e => {});
    },
    /**
     * 删除
     */
    onDeleteModuleClick (row) {
      let params = {
        moduleId: row.moduleId
      };

      this.$confirm('是否删除此模块？').then(res => {
        SystemController.deletePermGroup(this, params).then(res => {
          this.$message.success('删除成功');
          this.formPerm.permModuleId.impl.reloadDropdownData(true).catch(e => {});
        }).catch(e => {});
      }).catch(e => {});
    },
    onAddChildPermModuleClick (row) {
      let params = {
        parentId: row.moduleId,
        moduleType: this.SysPermModuleType.CONTROLLER,
        moduleList: this.formPerm.permModuleList
      };

      this.$dialog.show('添加子模块', formEditSysPermModule, {
        area: ['600px']
      }, params).then(res => {
        this.formPerm.permModuleId.impl.reloadDropdownData(true).catch(e => {});
      }).catch(e => {});
    },
    onModuleNodeCollapse (data, node) {
      let pos = this.formPerm.expandedModule.indexOf(data.moduleId);
      if (pos !== -1) {
        this.formPerm.expandedModule.splice(pos, 1);
      }
    },
    onModuleNodeExpand (data, node) {
      let pos = this.formPerm.expandedModule.indexOf(data.moduleId);
      if (pos === -1) {
        this.formPerm.expandedModule.push(data.moduleId);
      }
    }
  },
  computed: {
    getModuleTreeData () {
      let tempList = [{
        moduleId: undefined,
        moduleName: '全部',
        moduleType: this.SysPermModuleType.CONTROLLER,
        isAll: true
      }];
      return tempList.concat(this.formPerm.permModuleId.impl.dropdownList);
    },
    ...mapGetters(['getMainContextHeight'])
  },
  created () {
    this.formInit();
  }
}
</script>

<style scoped>
  .el-main{
    display: flex;
    flex-direction: column;
  }
  >>> .el-tree-node__content {
    height: 35px;
  }

  >>> .el-tree-node__content .is-leaf {
    display: none;
  }

  .module-node-item {
    width: 100%;
    height: 35px;
    line-height: 35px;
  }

  .module-node-menu {
    float: right;
    width: 84px;
    text-align: right;
    padding-right: 9px;
  }

  .module-node-menu.group {
    width: 84px;
    text-align: right;
    padding-right: 9px;
  }

  .module-node-text {
    width: 100%;
    margin-right: 56px;
  }

  .module-node-text.group {
    margin-right: 84px;
  }

  .el-tree-node__content .is-leaf + .module-node-item .module-node-text {
    padding-left: 24px;
  }

  .module-node-text .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

</style>
