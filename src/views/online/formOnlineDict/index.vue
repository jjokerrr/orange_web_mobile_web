<template>
  <div style="position: relative;">
    <el-form ref="formOnlineDict" :model="formOnlineDict" label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <filter-box :item-width="350" @search="refreshOnlineDict(true)" @reset="onReset">
        <el-form-item label="字典名称" prop="formFilter.dictName">
          <el-input class="filter-item" v-model="formOnlineDict.formFilter.dictName"
            :clearable="true" placeholder="字典名称" />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box ref="class" :data="formOnlineDict.dict.impl.dataList" @sort-change="formOnlineDict.dict.impl.onSortChange" @refresh="refreshOnlineDict(true)" :seq-config="{startIndex: ((formOnlineDict.dict.impl.currentPage - 1) * formOnlineDict.dict.impl.pageSize)}">
      <el-button slot="operator" type="primary" icon="el-icon-plus" :size="defaultFormItemSize"
        @click="onFormEditDictClick()">新建</el-button>
      <vxe-column title="序号" type="seq" width="55px" :index="formOnlineDict.dict.impl.getTableIndex" />
      <vxe-column title="字典名称" field="dictName" />
      <vxe-column title="字典类型" field="dictTypeDictMap.name">
        <template slot-scope="scope">
          <el-tag :size="defaultFormItemSize" :type="getDictTypeTagType(scope.row.dictType)">
            {{scope.row.dictTypeDictMap.name}}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="是否树字典">
        <template slot-scope="scope">
          <el-tag :size="defaultFormItemSize" :type="scope.row.treeFlag ? 'success' : 'danger'">
            {{scope.row.treeFlag ? '是' : '否'}}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="100px">
        <template slot-scope="scope">
          <el-button @click.stop="onFormEditDictClick(scope.row)" type="text" :size="defaultFormItemSize">
            编辑
          </el-button>
          <el-button @click.stop="onFormDeleteDictClick(scope.row)" type="text" :size="defaultFormItemSize">
            删除
          </el-button>
        </template>
      </vxe-column>
      <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
        <el-pagination
          :total="formOnlineDict.dict.impl.totalCount"
          :current-page="formOnlineDict.dict.impl.currentPage"
          :page-size="formOnlineDict.dict.impl.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="formOnlineDict.dict.impl.onCurrentPageChange"
          @size-change="formOnlineDict.dict.impl.onPageSizeChange">
        </el-pagination>
      </el-row>
    </table-box>
  </div>
</template>

<script>
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import '@/staticDict/onlineStaticDict.js';
/* eslint-disable-next-line */
import { TableWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { OnlineDictController } from '@/api/onlineController.js';
import EditOnlineDict from './editOnlineDict.vue';

export default {
  name: 'formOnlineDict',
  props: {
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin, thirdPartyMixin, refreshDataMixins],
  data () {
    return {
      formOnlineDict: {
        formFilter: {
          dictName: undefined
        },
        formFilterCopy: {
          dictName: undefined
        },
        dict: {
          impl: new TableWidget(this.loadDynamicDictData, this.loadDynamicDictVerify, true, false)
        },
        isInit: false
      }
    }
  },
  methods: {
    // 第三方接入刷新数据
    refreshData () {
      this.refreshOnlineDict();
    },
    onReset () {
      this.$refs.formOnlineDict.resetFields();
      this.refreshOnlineDict(true);
    },
    getDictTypeTagType (type) {
      switch (type) {
        case this.SysOnlineDictType.TABLE: return 'success';
        case this.SysOnlineDictType.URL: return 'primary';
        case this.SysOnlineDictType.STATIC: return 'warning';
        case this.SysOnlineDictType.CUSTOM: return 'danger';
        default:
          return 'info';
      }
    },
    /**
     * 获取动态表单字典列表
     */
    loadDynamicDictData (params) {
      params = {
        ...params,
        onlineDictDtoFilter: {
          dictName: this.formOnlineDict.formFilterCopy.dictName
        }
      }
      return new Promise((resolve, reject) => {
        OnlineDictController.list(this, params).then(res => {
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    loadDynamicDictVerify () {
      this.formOnlineDict.formFilterCopy.dictName = this.formOnlineDict.formFilter.dictName;
      return true;
    },
    refreshOnlineDict (reloadData) {
      if (reloadData) {
        this.formOnlineDict.dict.impl.refreshTable(true, 1);
      } else {
        this.formOnlineDict.dict.impl.refreshTable();
      }
      if (!this.formOnlineDict.isInit) {
        // 初始化下拉数据
      }
      this.formOnlineDict.isInit = true;
    },
    onFormCreateDictClick () {
      this.$dialog.show('新建字典', EditOnlineDict, {
        area: '600px',
        offset: '100px'
      }, {
        path: 'thirdEditOnlineDict'
      }, {
        pathName: '/thirdParty/thirdEditOnlineDict'
      }).then(res => {
        this.formOnlineDict.dict.impl.refreshTable();
      }).catch(e => {
        console.log(e);
      });
    },
    onFormEditDictClick (row) {
      this.$dialog.show(row ? '编辑字典' : '新建字典', EditOnlineDict, {
        area: '600px',
        offset: '100px'
      }, {
        dictId: (row || {}).dictId,
        path: 'thirdEditOnlineDict'
      }, {
        pathName: '/thirdParty/thirdEditOnlineDict'
      }).then(res => {
        this.formOnlineDict.dict.impl.refreshTable();
      }).catch(e => {
      });
    },
    onFormDeleteDictClick (row) {
      this.$confirm('是否删除此字典？').then(res => {
        let params = {
          dictId: row.dictId
        }

        return OnlineDictController.delete(this, params);
      }).then(res => {
        this.$message.success('删除成功！');
        this.formOnlineDict.dict.impl.refreshTable();
      }).catch(e => {});
    },
    onResume () {
      this.refreshOnlineDict();
    },
    initFormData () {
    },
    formInit () {
      this.refreshOnlineDict();
    }
  },
  mounted () {
    // 初始化页面数据
    this.formInit();
  },
  watch: {
  }
}
</script>

<style>
</style>
