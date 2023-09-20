<template>
  <div>
    <el-form label-width="75px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <filter-box :item-width="350" @search="refreshFormMenuPerm(true)" :hasReset="false">
        <el-form-item label="关联URL">
          <el-input class="filter-item" v-model="formMenuPerm.formFilter.url"
            :clearable="true" placeholder="权限字名称" />
        </el-form-item>
      </filter-box>
    </el-form>
    <el-row>
      <el-col :span="24">
        <vxe-table :data="getPermList" :size="defaultFormItemSize" height="459px"
          @sort-change="formMenuPerm.SysPerm.impl.onSortChange"
          header-cell-class-name="table-header-gray">
          <vxe-column title="序号" type="seq" width="50px" :index="formMenuPerm.SysPerm.impl.getTableIndex" />
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
  </div>
</template>

<script>
/* eslint-disable-next-line */
import { DropdownWidget, TableWidget, UploadWidget, ChartWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin, cachedPageChildMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { SystemController, DictionaryController } from '@/api';

export default {
  name: 'formMenuPerm',
  props: {
    menuId: {
      type: String,
      required: true
    }
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin],
  data () {
    return {
      formMenuPerm: {
        formFilter: {
          menuId: this.menuId,
          url: undefined
        },
        formFilterCopy: {
          menuId: this.menuId,
          url: undefined
        },
        SysPerm: {
          impl: new TableWidget(this.loadSysPermData, this.loadSysPermVerify, false)
        },
        isInit: false
      }
    }
  },
  methods: {
    getPermCodeType (permCodeType) {
      switch (permCodeType) {
        case this.SysPermCodeType.FORM: return 'primary';
        case this.SysPermCodeType.FRAGMENT: return 'warning';
        case this.SysPermCodeType.OPERATION: return 'success';
        default: return 'info';
      }
    },
    /**
     * 权限数据获取函数，返回Primise
     */
    loadSysPermData (params) {
      params = {
        ...params,
        menuId: this.formMenuPerm.formFilterCopy.menuId
      }
      return new Promise((resolve, reject) => {
        SystemController.listMenuPerm(this, params).then(res => {
          resolve({
            dataList: res.data
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
      this.formMenuPerm.formFilterCopy.url = this.formMenuPerm.formFilter.url;
      this.formMenuPerm.formFilterCopy.menuId = this.formMenuPerm.formFilter.menuId;
      if (this.formMenuPerm.formFilterCopy.menuId == null || this.formMenuPerm.formFilterCopy.menuId === '') {
        this.$message.error('所属菜单不能为空！');
        return false;
      }
      return true;
    },
    /**
     * 更新权限管理
     */
    refreshFormMenuPerm (reloadData = false) {
      // 重新获取数据组件的数据
      if (reloadData) {
        this.formMenuPerm.SysPerm.impl.refreshTable(true, 1);
      } else {
        this.formMenuPerm.SysPerm.impl.refreshTable();
      }
      this.formMenuPerm.isInit = true;
    },
    onResume () {
      this.refreshFormMenuPerm();
    },
    initFormData () {
    },
    formInit () {
      this.initFormData();
      this.refreshFormMenuPerm();
    }
  },
  computed: {
    getPermList () {
      return this.formMenuPerm.SysPerm.impl.dataList.filter((item) => {
        return (this.formMenuPerm.formFilterCopy.url == null || this.formMenuPerm.formFilterCopy.url === '') ||
          (item.url.indexOf(this.formMenuPerm.formFilterCopy.url) !== -1);
      });
    }
  },
  created () {
    this.formInit();
  }
}
</script>

<style>
</style>
