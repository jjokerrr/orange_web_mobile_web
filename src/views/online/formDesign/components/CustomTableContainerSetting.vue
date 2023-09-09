<template>
  <el-form class="custom-widget-attribute custom-table-container-setting" label-position="top" label-width="115px" size="default" @submit.native.prevent>
    <el-form-item label="列管理" style="width: 100%;">
      <el-row slot="label" type="flex" justify="space-between" align="middle" style="width: 100%;">
        <span>列管理</span>
        <i class="el-icon-circle-plus-outline" style="cursor: pointer; font-size: 14px;" @click="insertColumns" />
      </el-row>
      <div class="col-list">
        <div class="col-item" v-for="column in colList" :key="column.colIndex">
          <el-row type="flex" justify="space-between" align="middle" style="width: 100%; height: 40px; line-height: 40px; font-size: 14px;">
            <i :class="expandStatus[column.colIndex] ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" @click="onExpandChange(column)" style="cursor: pointer;">
              <span style="font-size: 12px; margin-left: 5px;">{{column.colName}}</span>
            </i>
            <i class="el-icon-remove-outline" style="cursor: pointer" @click="deleteColumn(column)" />
          </el-row>
          <div class="col-attribute" style="background: #FAFBFC; padding: 20px;" v-show="expandStatus[column.colIndex]">
            <el-row class="col-attribute-item" type="flex" justify="space-between" align="middle">
              <span class="label">列宽设置</span>
              <el-input size="small" :value="column.width" style="width: 130px;" @input="(val) => onColumnWidthChange(column, val)" />
            </el-row>
            <el-row class="col-attribute-item" type="flex" justify="space-between" align="middle" style="margin-top: 10px;">
              <span class="label">对齐方式</span>
              <div>
                <i class="online-icon icon-align-top align-item" :class="{active: column.valign === 'top'}" @click="onColumnAlignChange(column, 'top')" />
                <i class="online-icon icon-align-middle align-item" :class="{active: column.valign === 'middle'}" @click="onColumnAlignChange(column, 'middle')" />
                <i class="online-icon icon-align-bottom align-item" :class="{active: column.valign === 'bottom'}" @click="onColumnAlignChange(column, 'bottom')" />
              </div>
            </el-row>
          </div>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>
<script>
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'onlineTableColumnSetting',
  props: {
    value: {
      type: Object
    }
  },
  inject: ['formConfig'],
  mixins: [refreshDataMixins],
  data () {
    return {
      expandStatus: []
    };
  },
  mounted () {
  },
  computed: {
    currentWidgetActions: {
      get: function () {
        return this.formConfig().currentWidget.props.actions;
      },
      cache: false,
      immediate: true
    },
    indexData () {
      return Array.isArray(this.currentWidgetActions.indexData) ? this.currentWidgetActions.indexData : [];
    },
    colList () {
      if (!Array.isArray(this.indexData) || this.indexData.length === 0) return [];
      let row = this.indexData[0];
      return row.map((column, colIndex) => {
        this.expandStatus[colIndex] = this.expandStatus[colIndex] == null ? true : this.expandStatus[colIndex];
        return {
          colIndex: colIndex,
          width: column.width,
          valign: column.valign,
          colName: `第 ${colIndex + 1} 列`
        }
      });
    }
  },
  methods: {
    exec (action, params) {
      if (this.currentWidgetActions[action]) {
        this.currentWidgetActions[action](params);
      }
    },
    insertColumns () {
      this.exec('setSource', {
        rowIndex: 0,
        colIndex: this.indexData[0].length - 1
      });
      this.exec('insertColumns');
    },
    deleteColumn (column) {
      this.$confirm(`是否删除 ${column.colName} ?`).then(res => {
        this.expandStatus.splice(column.colIndex, 1);
        this.exec('deleteColumns', column.colIndex);
      }).catch(e => {});
    },
    onColumnWidthChange (column, val) {
      column.width = val;
      this.updateColumn(column);
    },
    onColumnAlignChange (column, val) {
      column.valign = val;
      this.updateColumn(column);
    },
    updateColumn (column) {
      this.currentWidgetActions.setColumn(column.colIndex, {
        ...column
      });
    },
    onExpandChange (column) {
      this.expandStatus[column.colIndex] = !this.expandStatus[column.colIndex];
      this.expandStatus = [
        ...this.expandStatus
      ];
    }
  }
};
</script>

<style scoped>
  .custom-table-container-setting.el-form--label-top >>> .el-form-item__label {
    line-height: 25px;
    padding-bottom: 5px!important;
    width: 100%;
  }

  .col-attribute-item .label {
    font-size: 12px;
  }
</style>

<style lang="scss" scoped>
  @import '@/assets/style/element-variables.scss';
  .align-item {
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 20px;
    color: #454545;
    cursor: pointer;
  }

  .align-item + .align-item {
    margin-left: 10px;
  }

  .align-item.active {
    color: $--color-primary;
  }
</style>
