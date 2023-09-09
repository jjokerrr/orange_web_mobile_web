<template>
  <div style="position: relative;">
    <el-form ref="formOnlinePage" :model="formOnlinePage" label-width="75px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <filter-box :item-width="350" @search="refreshOnlinePage(true)" @reset="onReset">
        <el-form-item label="表单类型" prop="formFilter.pageType">
          <el-select class="filter-item" v-model="formOnlinePage.formFilter.pageType"
            placeholder="表单类型" :clearable="true">
            <el-option v-for="item in SysOnlinePageType.getList()"
              :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="表单名称" prop="formFilter.pageName">
          <el-input class="filter-item" v-model="formOnlinePage.formFilter.pageName"
            :clearable="true" placeholder="表单名称" />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box ref="class" :hasExtend="false"
      :data="pageListWidget.dataList" :size="defaultFormItemSize"
      @sort-change="pageListWidget.onSortChange"
      @refresh="refreshOnlinePage(true)" :seq-config="{startIndex: ((pageListWidget.currentPage - 1) * pageListWidget.pageSize)}"
    >
      <el-button slot="operator" type="primary" icon="el-icon-plus" :size="defaultFormItemSize"
        @click="onCreateOnlinePage()">新建</el-button>
      <vxe-column title="序号" type="seq" width="55px" :index="pageListWidget.getTableIndex" />
      <vxe-column title="页面名称" field="pageName" />
      <vxe-column title="页面代码" field="pageCode" />
      <vxe-column title="页面类型">
        <template slot-scope="scope">
          <el-tag :size="defaultFormItemSize" :type="scope.row.pageType === SysOnlinePageType.BIZ ? 'success' : 'primary'">
            {{SysOnlinePageType.getValue(scope.row.pageType)}}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="页面状态" field="statusDictMap.name">
        <template slot-scope="scope">
          <el-tag :size="defaultFormItemSize" :type="getPageStatusTagType(scope.row.status)">
            {{SysOnlinePageStatus.getValue(scope.row.status)}}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column title="发布状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.published" @change="onUpdatePagePublished(scope.row)" />
        </template>
      </vxe-column>
      <vxe-column title="创建时间" field="createTime" />
      <vxe-column title="操作" width="100px" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" :size="defaultFormItemSize" @click="onEditOnlinePage(scope.row)">编辑</el-button>
          <el-button type="text" :size="defaultFormItemSize" @click="onDeleteOnlinePage(scope.row)">删除</el-button>
        </template>
      </vxe-column>
      <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
        <el-pagination
          :total="pageListWidget.totalCount"
          :current-page="pageListWidget.currentPage"
          :page-size="pageListWidget.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="pageListWidget.onCurrentPageChange"
          @size-change="pageListWidget.onPageSizeChange">
        </el-pagination>
      </el-row>
    </table-box>
  </div>
</template>

<script>
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import '@/staticDict/onlineStaticDict.js';
import { mapGetters } from 'vuex';
/* eslint-disable-next-line */
import { TableWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { OnlinePageController } from '@/api/onlineController.js';
import EditOnlinePage from './editOnlinePage/index.vue';

export default {
  name: 'formOnlinePage',
  props: {
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin, refreshDataMixins],
  data () {
    return {
      showPageSetting: false,
      currentPage: undefined,
      formOnlinePage: {
        formFilter: {
          pageType: undefined,
          pageName: undefined
        },
        formFilterCopy: {
          pageType: undefined,
          pageName: undefined
        },
        isInit: false
      },
      pageListWidget: new TableWidget(this.loadOnlinePageData, this.loadOnlinePageVerify, true, false)
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdEditOnlinePage') {
        this.pageListWidget.refreshTable();
      }
    },
    onReset () {
      this.$refs.formOnlinePage.resetFields();
      this.refreshOnlinePage(true);
    },
    getPageStatusTagType (status) {
      switch (status) {
        case this.SysOnlinePageStatus.BASIC: return 'warning';
        case this.SysOnlinePageStatus.DATASOURCE: return 'primary';
        case this.SysOnlinePageStatus.DESIGNING: return 'success';
      }
    },
    /**
     * 获取在线页面列表
     */
    loadOnlinePageData (params) {
      if (params == null) params = {};
      params = {
        ...params,
        onlinePageDtoFilter: {
          pageType: this.formOnlinePage.formFilterCopy.pageType,
          pageName: this.formOnlinePage.formFilterCopy.pageName
        }
      }
      return new Promise((resolve, reject) => {
        OnlinePageController.list(this, params).then(res => {
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    loadOnlinePageVerify () {
      this.formOnlinePage.formFilterCopy.pageType = this.formOnlinePage.formFilter.pageType;
      this.formOnlinePage.formFilterCopy.pageName = this.formOnlinePage.formFilter.pageName;
      return true;
    },
    onCreateOnlinePage () {
      this.currentPage = null;
      this.$dialog.show('新建页面', EditOnlinePage, {
        area: ['100vw', '100vh'],
        skin: 'fullscreen-dialog'
      }, {
        path: 'thirdEditOnlinePage'
      }, {
        fullscreen: true,
        pathName: '/thirdParty/thirdEditOnlinePage'
      }).then(res => {
        this.pageListWidget.refreshTable();
      }).catch(e => {
        console.log(e);
      });
      // this.currentPage = null;
      // this.showPageSetting = true;
    },
    onEditOnlinePage (row) {
      this.currentPage = row;
      this.$dialog.show('编辑页面', EditOnlinePage, {
        area: ['100vw', '100vh'],
        skin: 'fullscreen-dialog'
      }, {
        pageId: row.pageId,
        path: 'thirdEditOnlinePage'
      }, {
        fullscreen: true,
        pathName: '/thirdParty/thirdEditOnlinePage'
      }).then(res => {
        this.pageListWidget.refreshTable();
      }).catch(e => {});
      // this.showPageSetting = true;
    },
    onDeleteOnlinePage (row) {
      this.$confirm('是否删除此页面？').then(res => {
        let params = {
          pageId: row.pageId
        }

        return OnlinePageController.delete(this, params);
      }).then(res => {
        this.$message.success('删除成功！');
        this.pageListWidget.refreshTable();
      }).catch(e => {});
    },
    onUpdatePagePublished (row) {
      let params = {
        pageId: row.pageId,
        published: row.published
      }

      OnlinePageController.updatePublished(this, params).catch(e => {
        // 恢复发布状态为更改之前
        row.published = !row.published;
      });
    },
    onCloseSetting () {
      this.currentPage = null;
      this.showPageSetting = false;
      this.pageListWidget.refreshTable();
    },
    refreshOnlinePage (reloadData) {
      if (reloadData) {
        this.pageListWidget.refreshTable(true, 1);
      } else {
        this.pageListWidget.refreshTable();
      }
      if (!this.formOnlinePage.isInit) {
        // 初始化下拉数据
      }
      this.formOnlinePage.isInit = true;
    },
    onResume () {
      this.refreshOnlinePage();
    },
    initFormData () {
    },
    formInit () {
      this.refreshOnlinePage();
    }
  },
  computed: {
    ...mapGetters(['getClientHeight'])
  },
  mounted () {
    // 初始化页面数据
    this.formInit();
  }
}
</script>

<style>
</style>
