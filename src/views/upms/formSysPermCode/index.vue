<template>
  <div>
    <el-form ref="formPermCode" :model="formPermCode" label-width="90px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <filter-box :item-width="350" @search="refreshFormPermCode(true)" @reset="onReset">
        <el-form-item label="权限字名称" prop="formFilter.showName">
          <el-input class="filter-item" v-model="formPermCode.formFilter.showName"
            :clearable="true" placeholder="权限字名称" />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box :data="getPermCodeList" :size="defaultFormItemSize" @sort-change="formPermCode.SysPermCode.impl.onSortChange" :tree-config="{rowField: 'permCodeId', parentField: 'parentId'}" @refresh="refreshFormPermCode(true)" class="border-bottom-0">
      <el-button slot="operator" type="primary" icon="el-icon-plus" :size="defaultFormItemSize" :disabled="!checkPermCodeExist('formSysPermCode:fragmentSysPermCode:add')"
        @click="onCreatePermCodeClick()">新建</el-button>
      <vxe-column title="权限字名称" field="showName" width="250px" tree-node>
      </vxe-column>
      <vxe-column title="权限字类型" field="permCodeType" width="150px">
        <template slot-scope="scope">
          <el-tag :size="defaultFormItemSize" :type="getPermCodeType(scope.row.permCodeType)">{{SysPermCodeType.getValue(scope.row.permCodeType)}}</el-tag>
        </template>
      </vxe-column>
      <vxe-column title="显示顺序" field="showOrder" width="100px">
      </vxe-column>
      <vxe-column title="权限字标识" field="permCode" min-width="200px">
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="200px">
        <template slot-scope="scope">
          <el-button @click="onEditPermCodeClick(scope.row)" type="text" :size="defaultFormItemSize"
            :disabled="!checkPermCodeExist('formSysPermCode:fragmentSysPermCode:update')">
            编辑
          </el-button>
          <el-button @click="onAddChildPermCodeClick(scope.row)" type="text" :size="defaultFormItemSize"
            :disabled="scope.row.permCodeType === 2 || !checkPermCodeExist('formSysPermCode:fragmentSysPermCode:add')">
            添加
          </el-button>
          <el-button @click="onDeleteClick(scope.row)" type="text" :size="defaultFormItemSize"
            :disabled="!checkPermCodeExist('formSysPermCode:fragmentSysPermCode:delete')">
            删除
          </el-button>
          <el-button class="btn-table-primary" type="text" :size="defaultFormItemSize"
            v-if="checkPermCodeExist('formSysPermCode:fragmentSysPermCode:listSysPermCodePermDetail')"
            @click="onSysPermCodeDetailClick(scope.row)">
            权限详情
          </el-button>
        </template>
      </vxe-column>
    </table-box>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { treeDataTranslate } from '@/utils';
/* eslint-disable-next-line */
import { DropdownWidget, TableWidget, UploadWidget, ChartWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin, cachedPageChildMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { SystemController, DictionaryController } from '@/api';
import formEditSysPermCode from '@/views/upms/formEditSysPermCode';
import FormSysPermCodeDetail from '@/views/upms/formSysPermCode/formSysPermCodeDetail.vue';

export default {
  name: 'formSysPermCode',
  props: {
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin],
  data () {
    return {
      formPermCode: {
        formFilter: {
          showName: undefined
        },
        formFilterCopy: {
          showName: undefined
        },
        SysPermCode: {
          impl: new TableWidget(this.loadSysPermCodeData, this.loadSysPermCodeVerify, false, false, 'showOrder', 1),
          totalCount: 0,
          sortInfo: {
            orderField: 'showOrder',
            asc: 1
          }
        },
        isInit: false
      }
    }
  },
  methods: {
    onReset () {
      this.$refs.formPermCode.resetFields();
      this.refreshFormPermCode(true);
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
     * 权限资源数据获取函数，返回Primise
     */
    loadSysPermCodeData (params) {
      return new Promise((resolve, reject) => {
        SystemController.getPermCodeList(this, params).then(res => {
          resolve({
            dataList: treeDataTranslate(res.data, 'permCodeId'),
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 权限资源数据获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadSysPermCodeVerify () {
      this.formPermCode.formFilterCopy.showName = this.formPermCode.formFilter.showName;
      return true;
    },
    /**
     * 权限资源当前页变化函数
     */
    onSysPermCodeCurrentPageChange (newPage) {
      this.formPermCode.SysPermCode.impl.onCurrentPageChange(newPage);
    },
    /**
     * 权限资源每页显示数量变化函数（跳转回第一页）
     */
    onSysPermCodePageSizeChange (newPage) {
      this.formPermCode.SysPermCode.impl.onPageSizeChange(newPage);
    },
    /**
     * 权限资源列排序变化函数
     */
    onSysPermCodeSortChange ({ column, prop, order }) {
      this.formPermCode.SysPermCode.sortInfo.orderField = prop;
      this.formPermCode.SysPermCode.sortInfo.asc = (order === 'ascending');
      this.formPermCode.SysPermCode.impl.refreshTable();
    },
    onSysPermCodeDetailClick (row) {
      this.$dialog.show('权限详情', FormSysPermCodeDetail, {
        area: '1200px',
        offset: '30px'
      }, {
        permCodeId: row.permCodeId
      }).then(res => {}).catch(e => {});
    },
    /**
     * 更新权限资源管理
     */
    refreshFormPermCode (reloadData = false) {
      // 重新获取数据组件的数据
      if (reloadData) {
        this.formPermCode.SysPermCode.impl.refreshTable(true, 1);
      } else {
        this.formPermCode.SysPermCode.impl.refreshTable();
      }
      this.formPermCode.isInit = true;
    },
    /**
     * 添加
     */
    onCreatePermCodeClick () {
      let params = {
        permCodeTree: this.formPermCode.SysPermCode.impl.dataList
      };

      this.$dialog.show('添加', formEditSysPermCode, {
        area: ['800px', 'auto']
      }, params).then(res => {
        this.refreshFormPermCode();
      }).catch(e => {});
    },
    /**
     * 编辑
     */
    onEditPermCodeClick (row) {
      SystemController.viewPermCode(this, {
        permCodeId: row.permCodeId
      }).then(res => {
        let params = {
          permCodeTree: this.formPermCode.SysPermCode.impl.dataList,
          permCodeType: row.permCodeType,
          rowData: res.data
        };
        return this.$dialog.show('编辑', formEditSysPermCode, {
          area: ['800px', 'auto']
        }, params).then(res => {
          this.formPermCode.SysPermCode.impl.refreshTable();
        }).catch(e => {});
      }).then(res => {
        this.loadPermCodeData().catch(e => {});
      }).catch(e => {
        //
      });
    },
    /**
     * 添加权限字
     */
    onAddChildPermCodeClick (row) {
      let params = {
        permCodeTree: this.formPermCode.SysPermCode.impl.dataList,
        permCodeType: row.permCodeType + 1,
        rowData: {
          parentId: row.permCodeId
        }
      };

      this.$dialog.show('添加权限字', formEditSysPermCode, {
        area: ['800px', '600px']
      }, params).then(res => {
        this.formPermCode.SysPermCode.impl.refreshTable();
      }).catch(e => {});
    },
    /**
     * 删除
     */
    onDeleteClick (row) {
      let params = {
        permCodeId: row.permCodeId
      };

      this.$confirm('是否删除此权限字？').then(res => {
        SystemController.deletePermCode(this, params).then(res => {
          this.$message.success('删除成功');
          this.formPermCode.SysPermCode.impl.refreshTable();
        }).catch(e => {});
      }).catch(e => {});
    },
    onResume () {
      this.refreshFormPermCode();
    },
    initFormData () {
    },
    formInit () {
      this.initFormData();
      this.refreshFormPermCode();
    }
  },
  computed: {
    getPermCodeList () {
      try {
        if (Array.isArray(this.formPermCode.SysPermCode.impl.dataList)) {
          let temp = this.formPermCode.SysPermCode.impl.dataList.filter((item) => {
            if (this.formPermCode.formFilterCopy.showName == null || this.formPermCode.formFilterCopy.showName === '') return true;
            return (item.showName.indexOf(this.formPermCode.formFilterCopy.showName) !== -1);
          });
          return temp;
        }
      } catch (e) {
        console.log(e);
      }
      return [];
    },
    ...mapGetters(['getMainContextHeight'])
  },
  created () {
    this.formInit();
  }
}
</script>
