<template>
  <div class="dept-select">
    <el-select :value="value"
      style="width: 100%;"
      :multiple="multiple"
      :disabled="disabled"
      :size="size"
      :clearable="clearable"
      :collapse-tags="collapseTags"
      :placeholder="placeholder"
      :popper-append-to-body="false"
      popper-class="dept-select-popper"
      @visible-change="onVisibleChange"
      @remove-tag="onRemoveTag"
      @clear="onClear"
    >
      <el-option v-for="item in selectedItems" :key="item[props.value]"
        :label="item[props.label]"
        :value="item[props.value]"
      />
    </el-select>
  </div>
</template>

<script>
import { getUUID } from '@/utils';
import { SysCommonBizController } from '@/api';
import DeptSelectDlg from './deptSelectDlg.vue';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'deptSelect',
  props: {
    value: {
      type: [String, Number, Array]
    },
    props: {
      type: Object,
      default: () => {
        return {
          label: 'deptName',
          value: 'deptId'
        }
      }
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String
    },
    clearable: {
      type: Boolean,
      default: false
    },
    collapseTags: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String
    }
  },
  mixins: [refreshDataMixins],
  data () {
    return {
      widgetId: getUUID(),
      selectedItems: []
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdSelectDept/' + this.widgetId && data.isSuccess) {
        this.handlerEditOperate(data.data);
      }
    },
    handlerEditOperate (selectItems) {
      this.selectedItems = [];
      if (this.multiple) {
        if (Array.isArray(selectItems)) this.selectedItems = selectItems;
      } else {
        if (selectItems != null) this.selectedItems.push(selectItems);
      }
      if (!this.checkSelectChange()) return;
      this.emitChange();
    },
    onVisibleChange (visible) {
      if (visible) {
        this.$dialog.show('部门选择', DeptSelectDlg, {
          area: ['900px', '650px'],
          offset: '100px'
        }, {
          value: this.selectedItems,
          props: this.props,
          path: 'thirdSelectDept/' + this.widgetId,
          multiple: this.multiple
        }, {
          width: '900px',
          height: '650px',
          pathName: '/thirdParty/thirdSelectDept'
        }).then(res => {
          this.handlerEditOperate(res);
        });
      }
    },
    onRemoveTag (val) {
      this.selectedItems = this.selectedItems.filter(item => {
        return item[this.props.value] !== val;
      });
      this.emitChange();
    },
    onClear () {
      this.selectedItems = [];
      this.emitChange();
    },
    emitChange () {
      let tempValue;
      if (this.multiple) {
        tempValue = this.selectedItems.map(item => {
          return item[this.props.value];
        });
      } else {
        tempValue = (this.selectedItems[0] || {})[this.props.value];
      }
      this.$emit('input', tempValue);
      this.$emit('change', tempValue);
    },
    checkSelectChange () {
      let valueIdString = this.multiple ? (this.value || []).sort((val1, val2) => {
        if (val1 === val2) return 0;
        return val1 < val2 ? -1 : 1;
      }).join(',') : (this.value || '');
      let selectedItemsString = this.selectedItems.sort((item1, item2) => {
        if (item1[this.props.value] === item2[this.props.value]) return 0;
        return item1[this.props.value] < item2[this.props.value] ? -1 : 1;
      }).map(item => item[this.props.value]).join(',');
      return valueIdString !== selectedItemsString;
    },
    getSelectDeptList () {
      let params = {
        widgetType: 'upms_dept'
      };
      if (this.value == null || this.value === '' || this.value.length <= 0) this.selectedItems = [];
      if (this.multiple) {
        params.fieldValues = Array.isArray(this.value) ? this.value : []
      } else {
        params.fieldValues = Array.isArray(this.value) ? this.value[0] : this.value;
        params.fieldValues = params.fieldValues == null ? [] : [params.fieldValues];
      }
      if (Array.isArray(params.fieldValues) && params.fieldValues.length > 0) {
        params.fieldValues = params.fieldValues.join(',');
        SysCommonBizController.viewByIds(this, params, null, {
          showMask: false
        }).then(res => {
          if (Array.isArray(res.data)) {
            this.selectedItems = res.data;
          }
        }).catch(e => {});
      }
    }
  },
  watch: {
    value: {
      handler () {
        this.getSelectDeptList();
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
  .dept-select >>> .dept-select-popper {
    display: none;
  }

  .dept-select >>> .el-dialog__header {
    height: 42px;
    line-height: 42px;
    padding: 0px 20px;
    background-color: #F8F8F8;
  }
  .dept-select >>> .el-dialog__title {
    color: #333;
    font-size: 14px;
  }
  .dept-select >>> .el-dialog__headerbtn {
    top: 12px;
  }
  .dept-select >>> .el-dialog__body {
    padding: 25px;
  }
</style>
