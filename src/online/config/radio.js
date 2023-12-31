import { SysCustomWidgetType, SysOnlineFormType, OnlineFormEventType } from '@/staticDict/index.js';
const radio = {
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
  dictInfo: {
    name: '下拉字典',
    value: {},
    customComponent: {
      component: 'CustomWidgetDictSetting'
    }
  },
  direction: {
    name: '选项排列方式',
    widgetType: SysCustomWidgetType.Radio,
    value: 'horizontal',
    visible: function (formConfig) {
      return formConfig && formConfig.activeMode === 'mobile';
    },
    dropdownList: [
      {
        id: 'horizontal',
        name: '横向排列'
      },
      {
        id: 'vertical',
        name: '纵向排列'
      }
    ]
  },
  'icon-size': {
    name: '图标大小',
    visible: function (formConfig) {
      return formConfig && formConfig.activeMode === 'mobile';
    },
    widgetType: SysCustomWidgetType.Input,
    value: '20px'
  },
  supportAll: {
    name: '全部选项',
    widgetType: SysCustomWidgetType.Switch,
    dropdownList: [
      {
        id: true,
        name: '显示'
      },
      {
        id: false,
        name: '隐藏'
      }
    ]
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

const radioConfig = {
  widgetType: SysCustomWidgetType.Radio,
  icon: 'online-icon icon-radio',
  attribute: radio,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE
  ],
  supportBindTable: true,
  supportBindColumn: true
}

export default radioConfig;
