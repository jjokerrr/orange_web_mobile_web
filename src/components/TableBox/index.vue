<template>
  <div class="table-box">
    <el-row type="flex" justify="space-between" align="middle" class="operator-box" v-if="hasExtend || $slots.operator">
      <div>
        <slot name="operator" />
      </div>
      <div class="extend-box" v-if="hasExtend">
        <i class="online-icon icon-custom-refresh"
          style="font-size: 20px;color: #333333; cursor: pointer; margin-right: 4px;"
          @click="refresh"
        />
        <i class="online-icon icon-table-row-height"
          style="font-size: 20px;color: #333333; cursor: pointer;"
          @click="onRowHeightToogle"
        />
      </div>
    </el-row>
    <div class="vxe-table-box">
      <vxe-table ref="table"
        :class="rowHeightClass"
        :height="height"
        :size="defaultFormItemSize"
        :key="tableKey"
        header-cell-class-name="table-header-gray"
        v-bind="$attrs"
        v-on="$listeners"
        @toggle-tree-expand="onTreeExpandChange"
        @checkbox-change="onCheckBoxChange"
        @checkbox-all="onCheckAllChange"
        @radio-change="onRadioSelectChange"
      >
        <slot></slot>
        <template slot="empty">
          <div class="table-empty unified-font">
            <img src="@/assets/img/empty.png">
            <span>暂无数据</span>
          </div>
        </template>
      </vxe-table>
    </div>
    <slot class="pagination-box" name="pagination"></slot>
  </div>
</template>

<script>
import { traverseTree } from '@/utils';

export default {
  name: 'table-box',
  props: {
    value: {
      type: [Object, Array]
    },
    hasExtend: {
      type: Boolean,
      default: true
    },
    height: {
      type: [String, Number],
      default: 'auto'
    },
    hasImageColumn: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      tableKey: new Date().getTime(),
      rowHeightStatus: 'default',
      expandRows: []
    }
  },
  methods: {
    onSelectChange (rows, multi) {
      this.$emit('input', rows);
      this.$emit('change', rows, multi);
    },
    onCheckBoxChange (data) {
      let selectRows = [];
      if (this.$refs.table) {
        selectRows = this.$refs.table.getCheckboxRecords(true);
        selectRows = selectRows.concat(this.$refs.table.getCheckboxIndeterminateRecords(true));
      }
      this.onSelectChange(selectRows, true);
      this.$emit('checkbox-select-change', selectRows);
    },
    onCheckAllChange (data) {
      let selectRows = [];
      if (this.$refs.table) {
        selectRows = this.$refs.table.getCheckboxRecords(true);
        selectRows = selectRows.concat(this.$refs.table.getCheckboxIndeterminateRecords(true));
      }
      this.onSelectChange(selectRows, true);
      this.$emit('checkbox-select-change', selectRows);
    },
    onRadioSelectChange (data) {
      let selectRow;
      if (this.$refs.table) {
        selectRow = this.$refs.table.getRadioRecord();
        this.onSelectChange(selectRow, false);
      }
      this.$emit('radio-select-change', selectRow);
    },
    setTableSelectRow () {
      if (this.$refs.table) {
        this.$nextTick(() => {
          this.$refs.table.clearRadioRow();
          this.$refs.table.clearCheckboxRow();
          if (this.value == null) return;
          if (Array.isArray(this.value)) {
            // 多选
            this.$refs.table.setCheckboxRow(this.value);
          } else {
            // 单选
            this.$refs.table.setRadioRow(this.valye);
          }
        });
      }
    },
    refresh () {
      this.$emit('refresh')
    },
    getTableImpl () {
      return this.$refs.table;
    },
    onRowHeightToogle () {
      if (this.rowHeightStatus === 'default') {
        this.rowHeightStatus = 'mini';
      } else {
        this.rowHeightStatus = 'default'
      }
    },
    onTreeExpandChange ({expanded, row}) {
      if (this.treeRowKey != null) {
        let id = row[this.treeRowKey];
        if (id == null) return;
        if (expanded) {
          if (this.expandRows.indexOf(id) === -1) this.expandRows.push(id);
        } else {
          this.expandRows = this.expandRows.filter(item => item !== id);
        }
      }
    }
  },
  computed: {
    rowHeightClass () {
      return 'row-height-' + this.rowHeightStatus + (this.hasImageColumn ? ' row-height-image' : '');
    },
    treeRowKey () {
      return this.$attrs['tree-config'] ? this.$attrs['tree-config'].rowField : undefined;
    }
  },
  watch: {
    value: {
      handler () {
        this.setTableSelectRow();
      },
      immediate: true
    },
    '$attrs.data': {
      handler (newValue, oldValue) {
        if (newValue === oldValue) return;
        if (this.treeRowKey != null) {
          let nodeList = [];
          traverseTree(this.$attrs.data, (node) => nodeList.push(node), 'children');
          let defaultExpandRows = nodeList.filter(row => {
            return this.expandRows.indexOf(row[this.treeRowKey]) !== -1;
          });
          this.expandRows = defaultExpandRows.map(item => item[this.treeRowKey]);
          if (this.$refs.table) {
            this.$nextTick(() => {
              this.$refs.table.setTreeExpand(defaultExpandRows, true);
            });
          }
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.table-box{
  padding: 16px 24px 16px;
  background-color: white;
  display: flex;
  flex-direction: column;
  flex: 1;
  .vxe-table-box{
    height: 200px;
    flex-grow: 1;
    flex-shrink: 1;
  }
  .operator-box{
    margin-bottom: 16px;
    flex-grow: 0;
  }
  .extend-box{
    display: flex;
    justify-content: flex-end;
  }
  .pagination-box {
    flex-grow: 0;
  }
}
</style>

<style scoped>
  .table-box >>> .vxe-body--column {
    padding: 0px!important;
  }
  .row-height-mini.row-height-image >>> .vxe-body--column {
    height: 70px!important;
  }
  .row-height-default.row-height-image >>> .vxe-body--column {
    height: 80px!important;
  }
  .row-height-mini >>> .vxe-body--column {
    height: 35px!important;
  }
  .row-height-default >>> .vxe-body--column {
    height: 50px!important;
  }
</style>
