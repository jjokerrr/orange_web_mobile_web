import { SysCustomWidgetType, OnlineFormEventType } from '@/staticDict/index.js';
const numberRangeFilter = {
  'start-placeholder': {
    name: '最小值提示',
    widgetType: SysCustomWidgetType.Input,
    value: ''
  },
  'end-placeholder': {
    name: '最大值提示',
    widgetType: SysCustomWidgetType.Input,
    value: ''
  },
  'quickSelect': {
    name: '快捷选项',
    value: [],
    customComponent: {
      component: 'OnlineMobieNumberRangeQuickSelectSetting'
    }
  }
}

const numberRangeFilterConfig = {
  widgetType: SysCustomWidgetType.MobileNumberRangeFilter,
  icon: 'online-icon icon-number-range',
  attribute: numberRangeFilter,
  allowEventList: [
    OnlineFormEventType.CHANGE,
    OnlineFormEventType.DISABLE,
    OnlineFormEventType.VISIBLE
  ],
  supportBindTable: true,
  supportBindColumn: true
}

export default numberRangeFilterConfig;
