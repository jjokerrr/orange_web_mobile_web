import { SysCustomWidgetType } from '@/staticDict/index.js';
import bindDataConfig from './widgetBindData.js';
import labelConfig from '@/online/config/label.js';
import inputConfig from '@/online/config/input.js';
import numberInputConfig from '@/online/config/numberInput.js';
import numberRangeConfig from '@/online/config/numberRange.js';
import switchConfig from '@/online/config/switch.js';
import radioConfig from '@/online/config/radio.js';
import checkboxConfig from '@/online/config/checkbox.js';
import selectConfig from '@/online/config/select.js';
import cascaderConfig from '@/online/config/cascader.js';
import dateConfig from '@/online/config/date.js';
import dateRangeConfig from '@/online/config/dateRange.js';
import uploadConfig from '@/online/config/upload.js';
import richEditorConfig from '@/online/config/richEditor.js';
import tableConfig from '@/online/config/table.js';
import blockConfig from '@/online/config/customBlock.js';
import linkConfig from '@/online/config/link.js';
import userSelectConfig from '@/online/config/userSelect.js';
import addressLocatorConfig from '@/online/config/addressLocator.js'
import citySelectConfig from '@/online/config/citySelect.js'
import phoneNumberConfig from '@/online/config/phoneNumber.js'
import emailNumberConfig from '@/online/config/emailNumber.js'
import deptSelectConfig from '@/online/config/deptSelect.js';
import dataSelectConfig from '@/online/config/dataSelect.js';
import tableContainerConfig from '@/online/config/tableContainer.js';
import baseCardConfig from '@/online/config/baseCard.js';
import tabsConfig from '@/online/config/tabs.js';
import treeConfig from '@/online/config/tree.js';
import textConfig from '@/online/config/text.js';
import imageConfig from '@/online/config/image.js';
import imageCardConfig from '@/online/config/imageCard.js';
import queryListConfig from '@/online/config/queryList.js';
import baseListConfig from '@/online/config/baseList.js';
import rateConfig from '@/online/config/rate.js';
import stepperConfig from '@/online/config/stepper.js';
import calendarConfig from '@/online/config/calendar.js';
import groupConfig from '@/online/config/cellGroup.js';
// 移动端过滤
import mobileRadioFilterConfig from '@/online/config/mobileRadioFilter.js';
import mobileCheckboxFilterConfig from '@/online/config/mobileCheckboxFilter.js';
import mobileInputFilterConfig from '@/online/config/mobileInputFilter.js';
import mobileSwitchFilterConfig from '@/online/config/mobileSwitchFilter.js';
import mobileDateRangeFilterConfig from '@/online/config/mobileDateRangeFilter.js';
import mobileNumberRangeFilterConfig from '@/online/config/mobileNumberRangeFilter.js';

const widgetGroupList = [
  {
    id: 'layout',
    groupName: '布局组件',
    widgetList: [
      blockConfig,
      baseCardConfig,
      tabsConfig,
      tableContainerConfig,
      textConfig,
      imageConfig
    ]
  },
  {
    id: 'basicWidget',
    groupName: '基础组件',
    widgetList: [
      labelConfig,
      inputConfig,
      numberInputConfig,
      numberRangeConfig,
      phoneNumberConfig,
      emailNumberConfig,
      switchConfig,
      radioConfig,
      checkboxConfig,
      selectConfig,
      cascaderConfig,
      dateConfig,
      dateRangeConfig,
      uploadConfig,
      richEditorConfig,
      tableConfig,
      linkConfig,
      citySelectConfig,
      addressLocatorConfig
    ]
  },
  {
    id: 'advanceWidget',
    groupName: '高级组件',
    widgetList: [
      userSelectConfig,
      deptSelectConfig,
      dataSelectConfig
    ]
  }
];

const formWidgetGroupList = {
  pc: [
    {
      id: 'layout',
      groupName: '布局组件',
      widgetList: [
        blockConfig,
        baseCardConfig,
        tabsConfig,
        tableContainerConfig,
        textConfig,
        imageConfig
      ]
    },
    {
      id: 'filter',
      groupName: '过滤组件',
      widgetList: [
        labelConfig,
        inputConfig,
        numberInputConfig,
        numberRangeConfig,
        switchConfig,
        radioConfig,
        checkboxConfig,
        selectConfig,
        cascaderConfig,
        dateConfig,
        dateRangeConfig,
        userSelectConfig,
        deptSelectConfig,
        dataSelectConfig
      ]
    },
    {
      id: 'base',
      groupName: '基础组件',
      widgetList: [
        labelConfig,
        inputConfig,
        numberInputConfig,
        numberRangeConfig,
        phoneNumberConfig,
        emailNumberConfig,
        switchConfig,
        radioConfig,
        checkboxConfig,
        selectConfig,
        cascaderConfig,
        dateConfig,
        dateRangeConfig,
        uploadConfig,
        richEditorConfig,
        tableConfig,
        linkConfig,
        citySelectConfig,
        addressLocatorConfig
      ]
    },
    {
      id: 'advance',
      groupName: '高级组件',
      widgetList: [
        userSelectConfig,
        deptSelectConfig,
        dataSelectConfig
      ]
    }
  ],
  mobile: [
    {
      id: 'layout',
      groupName: '布局组件',
      widgetList: [
        groupConfig,
        tabsConfig,
        textConfig,
        imageConfig
      ]
    },
    {
      id: 'filter',
      groupName: '过滤组件',
      widgetList: [
        mobileInputFilterConfig,
        mobileRadioFilterConfig,
        mobileCheckboxFilterConfig,
        mobileSwitchFilterConfig,
        mobileDateRangeFilterConfig,
        mobileNumberRangeFilterConfig
      ]
    },
    {
      id: 'base',
      groupName: '基础组件',
      widgetList: [
        inputConfig,
        switchConfig,
        radioConfig,
        checkboxConfig,
        selectConfig,
        cascaderConfig,
        rateConfig,
        stepperConfig,
        calendarConfig,
        uploadConfig,
        baseListConfig
      ]
    },
    {
      id: 'advance',
      groupName: '高级组件',
      widgetList: [
        userSelectConfig,
        deptSelectConfig,
        dataSelectConfig
      ]
    }
  ]
}

function getDefaultVariableName (widgetType) {
  let tempTime = new Date().getTime();
  switch (widgetType) {
    case SysCustomWidgetType.Label: return 'label' + tempTime;
    case SysCustomWidgetType.Input: return 'input' + tempTime;
    case SysCustomWidgetType.NumberInput: return 'numberInput' + tempTime;
    case SysCustomWidgetType.NumberRange: return 'numberRange' + tempTime;
    case SysCustomWidgetType.Switch: return 'switch' + tempTime;
    case SysCustomWidgetType.Slider: return 'slider' + tempTime;
    case SysCustomWidgetType.Radio: return 'radio' + tempTime;
    case SysCustomWidgetType.CheckBox: return 'checkBox' + tempTime;
    case SysCustomWidgetType.Select: return 'select' + tempTime;
    case SysCustomWidgetType.Cascader: return 'cascader' + tempTime;
    case SysCustomWidgetType.Date: return 'date' + tempTime;
    case SysCustomWidgetType.DateRange: return 'dateRange' + tempTime;
    case SysCustomWidgetType.Upload: return 'upload' + tempTime;
    case SysCustomWidgetType.RichEditor: return 'richEditor' + tempTime;
    case SysCustomWidgetType.Divider: return 'divider' + tempTime;
    case SysCustomWidgetType.Text: return 'text' + tempTime;
    case SysCustomWidgetType.Image: return 'image' + tempTime;
    case SysCustomWidgetType.ImageCard: return 'imageCard' + tempTime;
    case SysCustomWidgetType.Table: return 'table' + tempTime;
    case SysCustomWidgetType.PivotTable: return 'pivotTable' + tempTime;
    case SysCustomWidgetType.LineChart: return 'lineChart' + tempTime;
    case SysCustomWidgetType.BarChart: return 'barChart' + tempTime;
    case SysCustomWidgetType.PieChart: return 'pieChart' + tempTime;
    case SysCustomWidgetType.ScatterChart: return 'scatterChart' + tempTime;
    case SysCustomWidgetType.Block: return 'block' + tempTime;
    case SysCustomWidgetType.Link: return 'link' + tempTime;
    case SysCustomWidgetType.UserSelect: return 'userSelect' + tempTime;
    case SysCustomWidgetType.DeptSelect: return 'deptSelect' + tempTime;
    case SysCustomWidgetType.DataSelect: return 'dataSelect' + tempTime;
    case SysCustomWidgetType.Card: return 'baseCard' + tempTime;
    case SysCustomWidgetType.Tabs: return 'tabs' + tempTime;
    case SysCustomWidgetType.Tree: return 'tree' + tempTime;
    case SysCustomWidgetType.TableContainer: return 'tableContainer' + tempTime;
    case SysCustomWidgetType.List: return 'baseList' + tempTime;
    case SysCustomWidgetType.Rate: return 'rate' + tempTime;
    case SysCustomWidgetType.Stepper: return 'stepper' + tempTime;
    case SysCustomWidgetType.Calendar: return 'calendar' + tempTime;
    case SysCustomWidgetType.CellGroup: return 'group' + tempTime;
    case SysCustomWidgetType.MobileRadioFilter: return 'mbileRadioFilter' + tempTime;
    case SysCustomWidgetType.MobileCheckBoxFilter: return 'mobileCheckBoxFilter' + tempTime;
    case SysCustomWidgetType.MobileInputFilter: return 'mobileInputFilter' + tempTime;
    case SysCustomWidgetType.MobileSwitchFilter: return 'mobileSwitchFilter' + tempTime;
    case SysCustomWidgetType.MobileDateRangeFilter: return 'mobileDateRangeFilter' + tempTime;
    case SysCustomWidgetType.MobileNumberRangeFilter: return 'mobileNumberRangeFilter' + tempTime;
    case SysCustomWidgetType.citySelect:
      return 'citySelect' + tempTime;
    case SysCustomWidgetType.AddressLocator:
      return 'addressLocator' + tempTime;
  }
}

function getWidgetAttribute (widgetType, mode = 'pc') {
  switch (widgetType) {
    case SysCustomWidgetType.Label: return labelConfig;
    case SysCustomWidgetType.Text: return textConfig;
    case SysCustomWidgetType.Image: return imageConfig;
    case SysCustomWidgetType.ImageCard: return imageCardConfig;
    case SysCustomWidgetType.Input: return inputConfig;
    case SysCustomWidgetType.NumberInput: return numberInputConfig;
    case SysCustomWidgetType.NumberRange: return numberRangeConfig;
    case SysCustomWidgetType.Switch: return switchConfig;
    case SysCustomWidgetType.Radio: return radioConfig;
    case SysCustomWidgetType.CheckBox: return checkboxConfig;
    case SysCustomWidgetType.Select: return selectConfig;
    case SysCustomWidgetType.Cascader: return cascaderConfig;
    case SysCustomWidgetType.Date: return dateConfig;
    case SysCustomWidgetType.DateRange: return dateRangeConfig;
    case SysCustomWidgetType.Upload: return uploadConfig;
    case SysCustomWidgetType.RichEditor: return richEditorConfig;
    case SysCustomWidgetType.Table: return tableConfig;
    case SysCustomWidgetType.Block: return blockConfig;
    case SysCustomWidgetType.Link: return linkConfig;
    case SysCustomWidgetType.UserSelect: return userSelectConfig;
    case SysCustomWidgetType.DeptSelect: return deptSelectConfig;
    case SysCustomWidgetType.DataSelect: return dataSelectConfig;
    case SysCustomWidgetType.Card: return baseCardConfig;
    case SysCustomWidgetType.Tabs: return tabsConfig;
    case SysCustomWidgetType.Tree: return treeConfig;
    case SysCustomWidgetType.TableContainer: return tableContainerConfig;
    case SysCustomWidgetType.QueryList: return queryListConfig;
    case SysCustomWidgetType.List: return baseListConfig;
    case SysCustomWidgetType.Rate: return rateConfig;
    case SysCustomWidgetType.Stepper: return stepperConfig;
    case SysCustomWidgetType.Calendar: return calendarConfig;
    case SysCustomWidgetType.CellGroup: return groupConfig;
    case SysCustomWidgetType.MobileRadioFilter: return mobileRadioFilterConfig;
    case SysCustomWidgetType.MobileCheckBoxFilter: return mobileCheckboxFilterConfig;
    case SysCustomWidgetType.MobileInputFilter: return mobileInputFilterConfig;
    case SysCustomWidgetType.MobileSwitchFilter: return mobileSwitchFilterConfig;
    case SysCustomWidgetType.MobileDateRangeFilter: return mobileDateRangeFilterConfig;
    case SysCustomWidgetType.MobileNumberRangeFilter: return mobileNumberRangeFilterConfig;
    case SysCustomWidgetType.AddressLocator:
      return addressLocatorConfig;
    case SysCustomWidgetType.CitySelect:
      return citySelectConfig;
    case SysCustomWidgetType.PhoneNumber:
      return phoneNumberConfig;
    case SysCustomWidgetType.EmailNumber:
      return emailNumberConfig;
    default: return null;
  }
}

function getWidgetObject (widget) {
  let temp = {
    // ...widget,
    widgetType: widget.widgetType,
    bindData: {
      ...bindDataConfig,
      defaultValue: {
        ...bindDataConfig.defaultValue
      }
    },
    display: true,
    operationList: widget.operationList ? JSON.parse(JSON.stringify(widget.operationList)) : undefined,
    showName: SysCustomWidgetType.getValue(widget.widgetType),
    variableName: getDefaultVariableName(widget.widgetType),
    props: Object.keys(widget.attribute).reduce((retObj, key) => {
      let tempValue;
      if (typeof widget.attribute[key].value === 'function') {
        tempValue = widget.attribute[key].value();
      } else {
        tempValue = widget.attribute[key].value;
      }
      if (Array.isArray(tempValue) || tempValue instanceof Object) {
        retObj[key] = JSON.parse(JSON.stringify(tempValue));
      } else {
        retObj[key] = tempValue;
      }
      return retObj;
    }, {}),
    eventList: [],
    childWidgetList: [],
    style: {},
    supportOperation: (widget.supportOperation == null ? false : widget.supportOperation)
  }
  return temp;
}

function supportBindTable (widget, mode = 'pc') {
  let widgetInfo = getWidgetAttribute(widget.widgetType, mode);
  return widgetInfo ? widgetInfo.supportBindTable : false;
}

function supportBindColumn (widget, mode = 'pc') {
  let widgetInfo = getWidgetAttribute(widget.widgetType, mode);
  return widgetInfo ? widgetInfo.supportBindColumn : false;
}

export default {
  widgetGroupList,
  formWidgetGroupList,
  getDefaultVariableName,
  getWidgetObject,
  getWidgetAttribute,
  supportBindTable,
  supportBindColumn
}
