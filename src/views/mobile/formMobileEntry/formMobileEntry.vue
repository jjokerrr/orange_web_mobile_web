<template>
  <div class="page-box" style="position: relative;">
    <table-box ref="mobileEntry"
      :data="formMobileEntry.MobileEntry.impl.dataList" :size="defaultFormItemSize"
      :row-config="{isCurrent: false, isHover: true}"
      :seq-config="{startIndex: ((formMobileEntry.MobileEntry.impl.currentPage - 1) * formMobileEntry.MobileEntry.impl.pageSize)}"
      :sort-config="{remote: true}" :hasExtend="true"
      :tree-config="{rowField: 'entryId', parentField: 'parentId'}"
      @sort-change="formMobileEntry.MobileEntry.impl.onSortChange"
      @refresh="refreshFormMobileEntry(true)"
    >
      <!-- 表格操作 -->
      <el-button slot="operator" type="primary" :size="defaultFormItemSize"
        @click="onFormAddMobileEntryClick()">
        {{ entryType === MobileEntryType.SUDOKU ? '新建分组' : '新建轮播图' }}
      </el-button>
      <!-- 表格列 -->
      <vxe-column v-if="entryType !== MobileEntryType.SUDOKU"
        title="序号" type="seq" width="50px"
        :index="formMobileEntry.MobileEntry.impl.getTableIndex"
      />
      <vxe-column title="显示名称" field="entryName" :tree-node="entryType === MobileEntryType.SUDOKU" />
      <vxe-column title="绑定类型" field="">
        <template slot-scope="scope">
          <span>{{ SysMenuBindType.getValue(scope.row.bindType) }}</span>
        </template>
      </vxe-column>
      <vxe-column title="显示顺序" field="showOrder" />
      <vxe-column title="显示图片">
        <template slot-scope="scope">
          <el-image v-if="scope.row.entryType !== MobileEntryType.GROUP"
            style="width: 44px; height: 44px; padding: 10px 0px; box-sizing: content-box;"
            :src="getImageData(scope.row)"
          />
        </template>
      </vxe-column>
      <vxe-column title="操作" fixed="right" :width="entryType === MobileEntryType.SUDOKU ? '180px' : '100px'">
        <template slot-scope="scope">
          <el-button v-if="entryType === MobileEntryType.SUDOKU"
            type="text" :size="defaultFormItemSize"
            :disabled="scope.row.entryType !== MobileEntryType.GROUP"
            @click.stop="onFormEditMobileEntryClick(null, scope.row.entryId)">
            新建九宫格
          </el-button>
          <el-button @click.stop="onFormEditMobileEntryClick(scope.row)" type="text" :size="defaultFormItemSize">
            编辑
          </el-button>
          <el-button @click.stop="onDeleteClick(scope.row)" type="text" :size="defaultFormItemSize">
            删除
          </el-button>
        </template>
      </vxe-column>
      <template slot="empty">
        <div class="table-empty unified-font">
          <img src="@/assets/img/empty.png">
          <span>暂无数据</span>
        </div>
      </template>
      <!-- 分页 -->
      <el-row slot="pagination" type="flex" justify="end" style="margin-top: 10px;">
        <el-pagination
          :total="formMobileEntry.MobileEntry.impl.totalCount"
          :current-page="formMobileEntry.MobileEntry.impl.currentPage"
          :page-size="formMobileEntry.MobileEntry.impl.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="formMobileEntry.MobileEntry.impl.onCurrentPageChange"
          @size-change="formMobileEntry.MobileEntry.impl.onPageSizeChange">
        </el-pagination>
      </el-row>
    </table-box>
  </div>
</template>

<script>
import { treeDataTranslate } from '@/utils';
import { TableWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { MobileEntryController } from '@/api';
import formEditMobileEntry from './formEditMobileEntry.vue';

export default {
  name: 'formMobileEntry',
  props: {
    entryType: {
      type: Number,
      default: 1
    }
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin],
  data () {
    return {
      groupList: [],
      formMobileEntry: {
        MobileEntry: {
          impl: new TableWidget(this.loadMobileEntryWidgetData, this.loadMobileEntryVerify, true, false, 'showOrder', 1)
        },
        isInit: false
      }
    }
  },
  methods: {
    getImageData (row) {
      if (row == null) return null;
      let imageData = null;
      try {
        imageData = JSON.parse(row.imageData);
      } catch (e) {
        console.log(e);
        imageData = null;
      }
      console.log(row, imageData);
      return imageData ? this.getUploadFileUrl(imageData, { filename: imageData.filename }) : undefined;
    },
    onResetFormMobileEntry () {
      this.$refs.formMobileEntryFilter.resetFields();
      this.refreshFormMobileEntry(true);
    },
    loadMobileEntryData (params, entryType) {
      if (params == null) params = {};
      params = {
        mobileEntryDtoFilter: {
          entryType: entryType
        },
        ...params
      }
      return MobileEntryController.list(this, params);
    },
    // 读取轮播图列表
    loadBannerData (params) {
      return new Promise((resolve, reject) => {
        if (params == null) params = {};
        params = {
          mobileEntryDtoFilter: {
            entryType: this.MobileEntryType.BANNER
          },
          ...params
        }
        this.loadMobileEntryData(params, this.MobileEntryType.BANNER).then(res => {
          this.groupList = [];
          let dataList = res.data.dataList.map(item => {
            let extraData;
            if (item.extraData != null && item.extraData !== '') {
              extraData = JSON.parse(item.extraData);
            }
            return {
              ...item,
              ...extraData
            }
          });
          resolve({
            dataList: dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    // 读取九宫格数据
    loadSudokuData (params) {
      return new Promise((resolve, reject) => {
        // 去掉分页
        if (params.pageParam) params.pageParam = undefined;
        let htppCallList = [
          this.loadMobileEntryData(params, this.MobileEntryType.GROUP),
          this.loadMobileEntryData(params, this.MobileEntryType.SUDOKU)
        ];
        Promise.all(htppCallList).then(res => {
          let groupList = res[0].data.dataList || [];
          let sudokuList = res[1].data.dataList || [];
          let allDataList = [
            ...groupList,
            ...sudokuList
          ];
          this.groupList = groupList.map(item => {
            return {
              id: item.entryId,
              name: item.entryName
            }
          });
          allDataList = allDataList.map(item => {
            let extraData;
            if (item.extraData != null && item.extraData !== '') {
              extraData = JSON.parse(item.extraData);
            }
            return {
              ...item,
              ...extraData
            }
          });
          console.log(this.groupList, allDataList);
          // 九宫格转换成树
          let dataList = treeDataTranslate(allDataList, 'entryId', 'parentId');
          resolve({
            dataList: dataList,
            totalCount: dataList.length
          });
        }).catch(e => {
          reject(e);
        })
      });
    },
    /**
     * 移动端首页显示管理数据获取函数，返回Promise
     */
    loadMobileEntryWidgetData (params) {
      return this.entryType === this.MobileEntryType.BANNER ? this.loadBannerData(params) : this.loadSudokuData(params);
    },
    /**
     * 移动端首页显示管理数据获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadMobileEntryVerify () {
      return true;
    },
    /**
     * 更新首页配置
     */
    refreshFormMobileEntry (reloadData = false) {
      if (reloadData) {
        this.formMobileEntry.MobileEntry.impl.refreshTable(true, 1);
      } else {
        this.formMobileEntry.MobileEntry.impl.refreshTable();
      }
      if (!this.formMobileEntry.isInit) {
        // 初始化下拉数据
      }
      this.formMobileEntry.isInit = true;
    },
    /**
     * 新建
     */
    onFormAddMobileEntryClick () {
      let params = {
        // 九宫格只能新建分组类型
        entryType: this.entryType === this.MobileEntryType.SUDOKU ? this.MobileEntryType.GROUP : this.entryType,
        groupList: this.groupList
      };

      this.$dialog.show('新建', formEditMobileEntry, {
        area: '500px'
      }, params).then(res => {
        this.refreshFormMobileEntry();
      }).catch(e => {});
    },
    /**
     * 编辑
     */
    onFormEditMobileEntryClick (row, parentId) {
      // 判断是否新建九宫格
      let entryType = row != null ? row.entryType : this.MobileEntryType.SUDOKU;
      let params = {
        entryId: (row || {}).entryId,
        entryType: entryType,
        parentId: parentId,
        rowData: row,
        groupList: this.groupList
      };

      this.$dialog.show('编辑', formEditMobileEntry, {
        area: '500px'
      }, params).then(res => {
        this.formMobileEntry.MobileEntry.impl.refreshTable();
      }).catch(e => {});
    },
    /**
     * 删除
     */
    onDeleteClick (row) {
      let params = {
        entryId: row.entryId
      };

      this.$confirm('是否删除？').then(res => {
        MobileEntryController.delete(this, params).then(res => {
          this.$message.success('删除成功');
          this.formMobileEntry.MobileEntry.impl.refreshTable();
        }).catch(e => {});
      }).catch(e => {});
    },
    onResume () {
      this.refreshFormMobileEntry();
    },
    initFormData () {
    },
    formInit () {
      this.refreshFormMobileEntry();
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
