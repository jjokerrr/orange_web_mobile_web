import { SysCustomWidgetType, SysOnlineFormType, OnlineFormEventType } from '@/staticDict/index.js';

const dataSelect = {
  span: {
    name: '组件宽度',
    widgetType: SysCustomWidgetType.Slider,
    value: 12,
    visible: function (formConfig) {
      return formConfig && formConfig.form.formType !== SysOnlineFormType.QUERY;
    },
    min: 1,
    max: 24
  },
  placeholder: {
    name: '占位文本',
    widgetType: SysCustomWidgetType.Input,
    value: ''
  },
  required: {
    name: '是否必填',
    value: false,
    widgetType: SysCustomWidgetType.Switch,
    dropdownList: [
      {
        id: true,
        name: '必填'
      },
      {
        id: false,
        name: '非必填'
      }
    ]
  },
  disabled: {
    name: '是否禁用',
    value: false,
    visible: function (formConfig) {
      return formConfig && formConfig.form.formType !== SysOnlineFormType.QUERY;
    },
    widgetType: SysCustomWidgetType.Switch,
    dropdownList: [
      {
        id: false,
        name: '启用'
      },
      {
        id: true,
        name: '禁用'
      }
    ]
  },
  relativeTable: {
    name: '弹窗表单配置',
    showLabel: false,
    value: {},
    customComponent: {
      component: 'customWidgetRelativeTableSetting'
    }
  }
}

const dataSelectConfig = {
  widgetType: SysCustomWidgetType.DataSelect,
  icon: 'online-icon icon-data-select',
  attribute: dataSelect,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE
  ],
  supportBindTable: true,
  supportBindColumn: true
}

export default dataSelectConfig;
