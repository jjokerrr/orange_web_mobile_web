import { SysCustomWidgetType, SysOnlineFormType, OnlineFormEventType } from '@/staticDict/index.js';

const switchAttribute = {
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
  size: {
    name: '开关尺寸',
    widgetType: SysCustomWidgetType.Input,
    visible: function (formConfig) {
      return formConfig && formConfig.activeMode === 'mobile';
    },
    value: '24px'
  },
  'active-color': {
    name: '打开背景色',
    widgetType: SysCustomWidgetType.ColorPicker,
    value: '#1989fa'
  },
  'inactive-color': {
    name: '关闭背景色',
    widgetType: SysCustomWidgetType.ColorPicker,
    value: '#E8E8E8'
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
  }
}

const switchConfig = {
  widgetType: SysCustomWidgetType.Switch,
  icon: 'online-icon icon-switch',
  attribute: switchAttribute,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE
  ],
  supportBindTable: true,
  supportBindColumn: true
}

export default switchConfig;
