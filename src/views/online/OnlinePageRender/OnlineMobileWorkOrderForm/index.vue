<template>
  <div class="online-query-form" :style="{height: height ? height : '100%'}" v-show="isReady">
    <van-form ref="form" class="full-width-input"
      style="width: 100%; height: 100%;"
      :label-width="(form.labelWidth || 100) + 'px'"
      @submit.native.prevent
    >
      <OnlineMobileWorkOrderList :widget="queryTable" :isEdit="isEdit"
        @widgetClick="onWidgetClick"
      />
    </van-form>
  </div>
</template>

<script>
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import { OnlineFormMixins } from '../onlineFormMixins.js';
import widgetData from '../components/config/index.js';
import { buildFormConfig } from '../utils.js';
import OnlineMobileWorkOrderList from '@/online/components/OnlineMobileWorkOrderList.vue';

export default {
  name: 'onlineMobieQueryForm',
  props: {
    formConfig: {
      type: Object
    },
    height: {
      type: String
    },
    // 是否表单编辑模式
    isEdit: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    // 当前选中组件
    currentWidget: {
      type: Object
    },
    // 是否全屏弹窗
    fullscreen: {
      type: Boolean
    }
  },
  components: {
    OnlineMobileWorkOrderList
  },
  mixins: [OnlineFormMixins, thirdPartyMixin, refreshDataMixins],
  provide () {
    return {
      form: () => {
        return {
          ...this.form,
          mode: 'mobile',
          isEdit: this.dialogParams.isEdit,
          readOnly: this.dialogParams.readOnly,
          getWidgetValue: this.getWidgetValue,
          getWidgetProp: this.getWidgetProp,
          getWidgetVisible: this.getWidgetVisible,
          onValueChange: this.onValueChange,
          onWidgetValueChange: this.onWidgetValueChange,
          getDropdownParams: this.getDropdownParams,
          checkOperationPermCode: this.checkOperationPermCode,
          checkOperationDisabled: this.checkOperationDisabled,
          checkOperationVisible: this.checkOperationVisible,
          cloneWidget: this.cloneWidget,
          handlerOperation: this.handlerOperation,
          getDictDataList: this.getDictDataList,
          loadOnlineFormConfig: this.loadOnlineFormConfig,
          isActive: (widget) => {
            return this.currentWidget === widget;
          },
          getWidgetObject: widgetData.getWidgetObject
        }
      }
    }
  },
  data () {
    return {
      isReady: false,
      batchDelete: false
    }
  },
  methods: {
    onListClick () {
      this.$emit('listClick', this.queryTable);
    },
    onWidgetClick (widget) {
      this.$emit('widgetClick', widget);
    }
  },
  computed: {
    dialogParams () {
      return {
        formConfig: this.formConfig || (this.thirdParams || {}).formConfig,
        isEdit: this.isEdit || (this.thirdParams || {}).isEdit || false,
        readOnly: this.readOnly || (this.thirdParams || {}).readOnly || false
      }
    },
    form () {
      return buildFormConfig(this.dialogParams.formConfig);
    },
    queryTable () {
      return this.form.tableWidget;
    }
  },
  created () {
    this.isReady = false;
    if (!this.dialogParams.isEdit) {
      this.initPage();
      this.initFormWidgetList();
      if (!this.dialogParams.isEdit && typeof this.form.eventInfo[this.OnlineFormEventType.AFTER_CREATE_FORM] === 'function') {
        this.form.eventInfo[this.OnlineFormEventType.AFTER_CREATE_FORM]();
      }
      this.initFormData();
      this.initWidgetLinkage(this.form.formType);
    }
    this.isReady = true;
  }
}
</script>

<style>
</style>
