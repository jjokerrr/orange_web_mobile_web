<template>
  <AdvanceQuery class="form-online-dblink advance-box"
    :height="getMainContextHeight"
    :treePanel="dblinkGroupConfig"
    :tablePanel="dblinkConfig"
    @refreshTable="onRefresDblink"
    @addTableItem="onEditOnlineDblink(null)"
  >
    <table-box slot="table" :data="onlineDblinkWidget.dataList" :size="defaultFormItemSize"
      header-cell-class-name="table-header-gray"
      height="auto"
      :hasExtend="false"
      :seq-config="{startIndex: ((onlineDblinkWidget.currentPage - 1) * onlineDblinkWidget.pageSize)}"
      style="padding:0 16px 16px"
    >
      <vxe-column title="序号" type="seq"
        width="50px"
        :index="onlineDblinkWidget.getTableIndex"
      />
      <vxe-column title="链接名称" field="dblinkName" />
      <vxe-column title="链接类型" field="dblinkTypeDictMap.name" />
      <vxe-column title="操作" width="100px">
        <template slot-scope="scope">
          <el-button type="text" :size="defaultFormItemSize"
            @click="onEditOnlineDblink(scope.row)"
          >
            编辑
          </el-button>
          <el-button type="text" :size="defaultFormItemSize"
            @click="onDeleteDblink(scope.row)"
          >
            删除
          </el-button>
        </template>
      </vxe-column>
      <el-row slot="pagination" type="flex" justify="end" style="margin-top: 16px;">
        <el-pagination
          :total="onlineDblinkWidget.totalCount"
          :current-page="onlineDblinkWidget.currentPage"
          :page-size="onlineDblinkWidget.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes"
          @current-change="onlineDblinkWidget.onCurrentPageChange"
          @size-change="onlineDblinkWidget.onPageSizeChange">
        </el-pagination>
      </el-row>
    </table-box>
  </AdvanceQuery>
</template>

<script>
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import { mapGetters } from 'vuex';
import { TableWidget } from '@/utils/widget.js';
import AdvanceQuery from '@/components/AdvanceQuery';
import EditOnlineDblink from './editOnlineDblink.vue';
import { OnlineDblinkController } from '@/api/onlineController.js';

export default {
  name: 'formOnlineDblink',
  components: {
    AdvanceQuery
  },
  mixins: [thirdPartyMixin, refreshDataMixins],
  data () {
    return {
      dblinkGroupConfig: {
        title: '数据库链接类型',
        supportAdd: false,
        supportEdit: false,
        supportDelete: false,
        keyColumnName: 'id',
        nameColumnName: 'name',
        loadFunction: this.loadDblinkGroupData
      },
      dblinkConfig: {
        title: '数据库链接',
        supportAdd: true,
        addText: '新建链接'
      },
      currentDblink: undefined,
      currentDblinkType: this.DblinkType.MYSQL,
      onlineDblinkWidget: new TableWidget(this.loadDblinkData, this.loadDblinkDataVerify, true, false)
    }
  },
  methods: {
    refreshData (data) {
      this.refresDblink(true);
    },
    loadDblinkGroupData () {
      return Promise.resolve(this.DblinkType.getList().filter(item => item.id !== this.DblinkType.CLICK_HOUSE));
    },
    loadDblinkData (params) {
      return new Promise((resolve, reject) => {
        params.onlineDblinkDtoFilter = {
          dblinkType: this.currentDblinkType
        }
        OnlineDblinkController.list(this, params).then(res => {
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          console.log(e);
          reject(e);
        });
      });
    },
    loadDblinkDataVerify () {
      return true;
    },
    onRefresDblink (dblinkType) {
      this.currentDblinkType = dblinkType.id;
      this.refresDblink(true);
    },
    refresDblink (reload = false) {
      if (reload) {
        this.onlineDblinkWidget.refreshTable(true, 1);
      } else {
        this.onlineDblinkWidget.refreshTable();
      }
    },
    onEditOnlineDblink (row) {
      this.currentDblink = row;
      this.showEditDblink = true;
      this.$dialog.show('编辑数据库链接', EditOnlineDblink, {
        area: ['100vw', '100vh'],
        skin: 'fullscreen-dialog'
      }, {
        dblink: row,
        path: 'thirdEditOnlineDblink'
      }, {
        fullscreen: true,
        pathName: '/thirdParty/thirdEditOnlineDblink'
      }).then(res => {
        this.refresDblink(true);
      }).catch(e => {});
    },
    onDeleteDblink (row) {
      this.$confirm('是否删除此数据链接？').then(res => {
        return OnlineDblinkController.delete(this, {
          dblinkId: row.dblinkId
        });
      }).then(res => {
        this.$message.success('删除成功');
        this.refresDblink(true);
      }).catch(e => {});
    }
  },
  computed: {
    ...mapGetters(['getMainContextHeight', 'getClientHeight'])
  }
}
</script>

<style>
</style>
