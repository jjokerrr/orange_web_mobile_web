<template>
  <div class="user-task-select">
    <el-select :value="value" ref="select"
      style="width: 100%;"
      :disabled="disabled"
      :size="size"
      :clearable="clearable"
      :placeholder="placeholder"
      :popper-append-to-body="false"
      popper-class="user-task-select-popper"
      @visible-change="onVisibleChange"
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
import UserTaskSelectDlg from './userTaskSelectDlg.vue';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'userTaskSelect',
  props: {
    value: {
      type: String
    },
    props: {
      type: Object,
      default: () => {
        return {
          label: 'taskName',
          value: 'taskId'
        }
      }
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
    placeholder: {
      type: String
    },
    xml: {
      type: String
    },
    finishedInfo: {
      type: Object
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
      if (data.path === 'thirdSelectUserTask/' + this.widgetId && data.isSuccess) {
        this.handlerEditOperate(data.data);
      }
    },
    handlerEditOperate (selectItems) {
      this.selectedItems = [];
      if (selectItems != null) this.selectedItems.push(selectItems);
      if (this.value === (this.selectedItems[0] || {})[this.props.value]) return;
      this.emitChange();
    },
    onVisibleChange (visible) {
      if (visible) {
        this.$dialog.show('任务选择', UserTaskSelectDlg, {
          area: ['80vw', '90vh'],
          offset: '50px'
        }, {
          xml: this.xml,
          path: 'thirdSelectUserTask/' + this.widgetId,
          finishedInfo: this.finishedInfo
        }, {
          width: '1200px',
          height: '600px',
          pathName: '/thirdParty/thirdSelectUserTask'
        }).then(res => {
          this.$refs.select.blur();
          this.handlerEditOperate(res);
        });
      }
    },
    onClear () {
      this.selectedItems = [];
      this.emitChange();
    },
    emitChange () {
      let tempValue = (this.selectedItems[0] || {})[this.props.value];
      this.$emit('input', tempValue);
      this.$emit('change', tempValue);
    }
  }
}
</script>

<style scoped>
  .user-task-select >>> .user-task-select-popper {
    display: none;
  }

  .user-task-select >>> .el-dialog__header {
    height: 42px;
    line-height: 42px;
    padding: 0px 20px;
    background-color: #F8F8F8;
  }
  .user-task-select >>> .el-dialog__title {
    color: #333;
    font-size: 14px;
  }
  .user-task-select >>> .el-dialog__headerbtn {
    top: 12px;
  }
  .user-task-select >>> .el-dialog__body {
    padding: 25px;
  }
</style>
