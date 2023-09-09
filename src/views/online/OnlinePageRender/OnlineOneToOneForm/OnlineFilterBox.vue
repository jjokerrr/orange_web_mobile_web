<template>
  <el-form ref="filterBox" :size="defaultFormItemSize"
    :model="formData"
    :label-width="(form().labelWidth || 100) + 'px'"
    :label-position="form().labelPosition"
    @submit.native.prevent
  >
    <Draggable class="online-filter-box custom-widget-item"
      draggable=".custom-widget-item"
      :list="widgetList"
      group="componentsGroup"
      style="width: 100%; position: relative;"
      :style="{border: (isEdit && !isAdvance) ? '1px solid #e8eaec' : 'none', 'min-height': (isEdit && widgetList.length <= 0) ? '70px' : '0px'}"
      :disabled="!isEdit"
    >
      <template v-if="Array.isArray(widgetList) && widgetList.length > 0">
        <el-form-item v-for="(widget, index) in widgetList" :key="widget.variableName"
          v-show="form().getWidgetVisible(widget)"
          :prop="widget.propString" class="custom-widget-item widget-item"
          :class="{active: isEdit && form().isActive(widget)}"
          style="display: inline-block;" :style="getItemStyle(index, widget)"
          @click.native.stop="onWidgetClick(widget)"
        >
          <div slot="label">
            <span>{{widget.showName}}</span>
            <ActiveWidgetMenu v-if="isEdit && form().isActive(widget)"
              :widget="widget"
              @copy="onCopyWidget"
              @delete="onDeleteWidget(widget)"
            />
          </div>
          <OnlineCustomWidget :widget="widget" style="width: 100%;" :ref="widget.variableName"
            :value="getWidgetValue(widget)"
            @input="(val) => onValueChange(widget, val)"
            @change="(val, dictData) => onWidgetValueChange(widget, val, dictData)"
          />
        </el-form-item>
        <div style="padding-left:16px; margin-bottom: 16px">
          <el-button class="search-btn" :size="defaultFormItemSize" @click="onSearch" icon="el-icon-search">查询</el-button>
          <el-button :size="defaultFormItemSize" v-show="Array.isArray(widgetList) && widgetList.length > 0" @click="onReset" style="width: 72px">重置</el-button>
          <slot name="operator" />
        </div>
      </template>
      <el-row v-else type="flex" justify="end" style="width: 100%;">
        <slot name="operator" />
      </el-row>
      <div v-if="isEdit && widgetList.length <= 0" class="info" :style="{height: isAdvance ? '40px' : '60px'}">
        <div>
          <i class="el-icon-upload" />
        </div>
        <span>请拖入组件进行编辑</span>
      </div>
    </Draggable>
  </el-form>
</template>

<script>
// import { mapGetters } from 'vuex';
import { findItemFromList } from '@/utils';
import Draggable from 'vuedraggable';
import OnlineCustomWidget from '@/online/components/OnlineCustomWidget.vue';
import ActiveWidgetMenu from '@/online/components/ActiveWidgetMenu.vue';

export default {
  name: 'onlineFilterBox',
  props: {
    formData: {
      type: Object,
      required: true
    },
    // 是否表单编辑模式
    isEdit: {
      type: Boolean,
      default: false
    },
    // 是否左树右表查询
    isAdvance: {
      type: Boolean,
      default: false
    },
    // 是否选中
    isActive: {
      type: Boolean,
      default: false
    },
    itemWidth: {
      type: Number,
      default: 350
    },
    widgetList: {
      type: Array,
      default: () => []
    },
    operationList: {
      type: Array,
      default: () => []
    }
  },
  components: {
    Draggable,
    OnlineCustomWidget,
    ActiveWidgetMenu
  },
  inject: ['form'],
  data () {
    return {
      // 操作栏宽度
      operatorWidth: 0,
      // 总宽度
      totalWidth: 0,
      placeholderNumber: 0
    }
  },
  methods: {
    onCopyWidget (widget) {
      this.$emit('copy', widget);
    },
    onDeleteWidget (widget) {
      this.$emit('delete', widget);
    },
    getWidgetValue (widget) {
      if (this.isEdit) return;
      return this.form().getWidgetValue(widget);
    },
    onValueChange (widget, value) {
      if (this.isEdit) return;
      return this.form().onValueChange(widget, value);
    },
    onWidgetValueChange (widget, value, dictData) {
      if (this.isEdit) return;
      return this.form().onWidgetValueChange(widget, value, dictData);
    },
    onWidgetClick (widget) {
      this.$emit('widgetClick', widget);
    },
    getItemStyle (index, widget) {
      return {
        width: this.itemWidth + 'px'
      }
    },
    hasOperator (type) {
      let temp = this.getOperation(type);
      return temp && temp.enabled;
    },
    getOperation (type) {
      return findItemFromList(this.form().operationList, type, 'type');
    },
    operationVisible (type) {
      if (this.isAdvance) return false;
      let operation = this.getOperation(type);
      return !this.form().readOnly && this.hasOperator(type) && this.form().checkOperationVisible(operation);
    },
    operationDisabled (type) {
      let operation = this.getOperation(type);
      return this.form().checkOperationDisabled(operation) || !this.form().checkOperationPermCode(operation);
    },
    onSearch () {
      this.$emit('search');
    },
    onReset () {
      this.$refs.filterBox.resetFields();
      this.$emit('reset');
    },
    onOperationClick (operation) {
      this.$emit('operationClick', operation);
    },
    resetWidget (widget) {
      if (Array.isArray(this.$refs[widget.variableName])) {
        this.$refs[widget.variableName].forEach(ref => {
          ref.reset();
        });
      } else {
        this.$refs[widget.variableName].reset();
      }
    }
  },
  computed: {
    // 每行过滤组件数量
    lineCount () {
      let tempCount = Math.floor(this.totalWidth / this.itemWidth);
      return Math.min(this.widgetCount, tempCount);
    },
    showInOneLine () {
      return this.totalWidth >= this.widgetCount * this.itemWidth + this.operatorWidth;
    },
    offsetWidth () {
      // 判断是否一行显示
      if (this.showInOneLine) {
        return this.totalWidth - (this.widgetCount * this.itemWidth + this.operatorWidth);
      } else {
        return this.totalWidth - (this.itemWidth * this.lineCount);
      }
    },
    // 过滤组件间隔
    itemGutter () {
      let count = 0;
      if (this.showInOneLine) {
        count = this.widgetCount + (this.operatorWidth > 0 ? 1 : 0) - 1;
      } else {
        count = this.lineCount - 1;
      }
      if (count > 0) {
        return this.offsetWidth / count;
      } else {
        return 0;
      }
    },
    validWidgetList () {
      return Array.isArray(this.widgetList) ? this.widgetList.filter(widget => {
        return this.form().getWidgetVisible(widget);
      }) : [];
    },
    // 过滤组件数量
    widgetCount () {
      return this.validWidgetList.length;
    },
    // 最后一行过滤组件数量
    offsetCount () {
      if (this.showInOneLine) {
        return this.widgetCount;
      } else {
        return this.widgetCount % this.lineCount;
      }
    },
    // 操作栏间隔
    operatorGutter () {
      if (this.offsetCount <= 0) return this.totalWidth - this.operatorWidth;
      let tempWidth = this.totalWidth - this.itemWidth * this.offsetCount - this.itemGutter * (this.offsetCount - 1);
      return tempWidth >= this.operatorWidth ? (tempWidth - this.operatorWidth) : (this.totalWidth - this.operatorWidth);
    }
  },
  watch: {
    widgetList: {
      handler () {
        this.$nextTick(() => {
          this.operatorWidth = this.$refs.optionBox ? this.$refs.optionBox.$el.offsetWidth : 0;
        });
      },
      immediate: true
    }
  },
  mounted () {
    // 监听组件大小变化
    const resizeObserver = new ResizeObserver(() => {
      if (this.$refs.filterBox) this.totalWidth = this.$refs.filterBox.$el.offsetWidth - (this.isEdit ? 14 : 2);
      this.operatorWidth = this.$refs.optionBox ? this.$refs.optionBox.$el.offsetWidth : 0;
    });
    resizeObserver.observe(this.$el);
    setTimeout(() => {
      if (this.$refs.optionBox) resizeObserver.observe(this.$refs.optionBox.$el);
    }, 30);
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/style/element-variables.scss';
  .online-filter-box {
    display: flex;
    flex-wrap: wrap;
    vertical-align: middle;
    background-color: white;
    padding: 16px 24px 0px;
    .placeholder{
      flex: 1 0 330px;
    }
    .option-box{
      flex: 1 0 100%;
    }
  }
  .el-form-item {
    margin-bottom: 16px !important;
  }
  .online-filter-box >>> .el-form-item--mini.el-form-item {
    margin-bottom: 10px!important;
  }

  .info {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 60px;
    text-align: center;
    vertical-align: middle;
    color: #D9DBDD;
  }

  .info div {
    width: 40px;
    height: 40px;
    border: 1px dashed #D9DBDD;
    line-height: 40px;
    text-align: center;
    border-radius: 6px;
    font-size: 24px;
  }
  .info span {
    margin-left: 10px;
    font-size: 16px;
  }

  .search-btn{
    color: $--color-primary;
    border-color: $--color-primary;
    &:hover{
      background-color: $--color-primary-light-9;
    }
  }

  .filter-line{
    width: 150%;
    height: 16px;
    margin: 0px -24px 0;
    background-color: rgb(245, 248, 249);
  }
  .option-box{
    img{
      cursor: pointer;
      margin-left: 8px;
    }
  }
</style>
