<template>
  <div style="position: relative;">
    <el-form ref="formFlowCategory" :model="formFlowCategory" label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <filter-box :item-width="350" @search="refreshFormFlowCategory(true)" @reset="onReset">
        <el-form-item label="分类名称" prop="formFilter.name">
          <el-input class="filter-item" v-model="formFlowCategory.formFilter.name" :clearable="true" placeholder="流程分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="formFilter.code">
          <el-input class="filter-item" v-model="formFlowCategory.formFilter.code" :clearable="true" placeholder="分类编码" />
        </el-form-item>
      </filter-box>
    </el-form>
    <table-box ref="flowCategory" :data="flowCategoryWidget.dataList" :size="defaultFormItemSize"
      @sort-change="flowCategoryWidget.onSortChange"
      @refresh="refreshFormFlowCategory(true)"
      :seq-config="{startIndex: ((flowCategoryWidget.currentPage - 1) * flowCategoryWidget.pageSize)}"
    >
      <el-button slot="operator" type="primary" icon="el-icon-plus" :size="defaultFormItemSize"
        :disabled="!checkPermCodeExist('formFlowCategory:formFlowCategory:add')"
        @click="onAddFlowCategoryClick()"
      >新建</el-button>
      <vxe-column title="序号" type="seq" width="55px" :index="flowCategoryWidget.getTableIndex" />
      <vxe-column title="流程分类名称" field="name">
      </vxe-column>
      <vxe-column title="分类编码" field="code">
      </vxe-column>
      <vxe-column title="显示顺序" field="showOrder" sortable>
      </vxe-column>
      <vxe-column title="创建时间" field="createTime" sortable>
        <template slot-scope="scope">
          <span>{{formatDateByStatsType(scope.row.createTime, 'day')}}</span>
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" width="100px">
        <template slot-scope="scope">
          <el-button type="text" :size="defaultFormItemSize"
            :disabled="!checkPermCodeExist('formFlowCategory:formFlowCategory:update')"
            @click.stop="onEditFlowCategoryClick(scope.row)"
          >
            编辑
          </el-button>
          <el-button type="text" :size="defaultFormItemSize"
            :disabled="!checkPermCodeExist('formFlowCategory:formFlowCategory:delete')"
            @click.stop="onDeleteFlowCategoryClick(scope.row)"
          >
            删除
          </el-button>
        </template>
      </vxe-column>
      <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
        <el-pagination
          :total="flowCategoryWidget.totalCount"
          :current-page="flowCategoryWidget.currentPage"
          :page-size="flowCategoryWidget.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="flowCategoryWidget.onCurrentPageChange"
          @size-change="flowCategoryWidget.onPageSizeChange">
        </el-pagination>
      </el-row>
    </table-box>
  </div>
</template>

<script>
import { TableWidget } from '@/utils/widget.js';
import { uploadMixin, statsDateRangeMixin, cachePageMixin } from '@/core/mixins';
import { FlowCategoryController } from '@/api/flowController.js';
import formEditFlowCategory from '@/views/workflow/flowCategory/formEditFlowCategory.vue';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'formFlowCategory',
  props: {
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin, refreshDataMixins],
  data () {
    return {
      formFlowCategory: {
        formFilter: {
          name: undefined,
          code: undefined
        },
        formFilterCopy: {
          name: undefined,
          code: undefined
        },
        isInit: false
      },
      flowCategoryWidget: new TableWidget(this.loadFlowCategoryWidgetData, this.loadFlowCategoryVerify, true, false, 'showOrder', 1)
    }
  },
  methods: {
    refreshData () {
      this.refreshFormFlowCategory()
    },
    onReset () {
      this.$refs.formFlowCategory.resetFields();
      this.refreshFormFlowCategory(true);
    },
    /**
     * FlowCategory数据获取函数，返回Promise
     */
    loadFlowCategoryWidgetData (params) {
      if (params == null) params = {};
      params = {
        ...params,
        flowCategoryDtoFilter: {
          name: this.formFlowCategory.formFilterCopy.name,
          code: this.formFlowCategory.formFilterCopy.code
        }
      }
      return new Promise((resolve, reject) => {
        FlowCategoryController.list(this, params).then(res => {
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
     * FlowCategory数据获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadFlowCategoryVerify () {
      this.formFlowCategory.formFilterCopy.name = this.formFlowCategory.formFilter.name;
      this.formFlowCategory.formFilterCopy.code = this.formFlowCategory.formFilter.code;
      return true;
    },
    /**
     * 更新流程分类管理
     */
    refreshFormFlowCategory (reloadData = false) {
      if (reloadData) {
        this.flowCategoryWidget.refreshTable(true, 1);
      } else {
        this.flowCategoryWidget.refreshTable();
      }
      if (!this.formFlowCategory.isInit) {
        // 初始化下拉数据
      }
      this.formFlowCategory.isInit = true;
    },
    /**
     * 新建
     */
    onAddFlowCategoryClick () {
      this.$dialog.show('新建', formEditFlowCategory, {
        area: '500px'
      }, {
        path: 'thirdAddFormFlowCategory'
      }, {
        width: '500px',
        height: '300px',
        pathName: '/thirdParty/thirdAddFormFlowCategory'
      }).then(res => {
        this.refreshFormFlowCategory()
      }).catch(e => {
        console.log(e);
      });
    },
    /**
     * 编辑
     */
    onEditFlowCategoryClick (row) {
      this.$dialog.show('编辑', formEditFlowCategory, {
        area: '500px'
      }, {
        categoryId: row.categoryId,
        path: 'thirdAddFormFlowCategory'
      }, {
        width: '500px',
        height: '280px',
        pathName: '/thirdParty/thirdAddFormFlowCategory'
      }).then(() => {
        this.flowCategoryWidget.refreshTable()
      }).catch(e => {
        console.log(e);
      });
    },
    /**
     * 删除
     */
    onDeleteFlowCategoryClick (row) {
      if (row.categoryId == null) {
        this.$message.error('请求失败，发现必填参数为空！')
        return
      }
      let params = {
        categoryId: row.categoryId
      };

      this.$confirm('是否删除此流程分类？').then(res => {
        FlowCategoryController.delete(this, params).then(res => {
          this.$message.success('删除成功');
          this.flowCategoryWidget.refreshTable();
        }).catch(e => {});
      }).catch(e => {});
    },
    onResume () {
      this.refreshFormFlowCategory();
    },
    initFormData () {
      //
    },
    formInit () {
      this.refreshFormFlowCategory();
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
