import { SysOnlineFormType, SysCustomWidgetOperationType, OnlineFormEventType } from '@/staticDict/index.js';
import { SysOnlinePageType } from '@/staticDict/onlineStaticDict.js';
import OnlineWidgetConfig from '../OnlinePageRender/components/config/index.js';
import tableConfig from '@/online/config/table.js';
import treeConfig from '@/online/config/tree.js';

const baseQueryForm = {
  filterItemWidth: 350,
  gutter: 20,
  labelWidth: 100,
  labelPosition: 'right',
  tableWidget: {
    ...OnlineWidgetConfig.getWidgetObject(tableConfig)
  },
  leftWidget: {
    ...OnlineWidgetConfig.getWidgetObject(treeConfig)
  },
  operationList: [
    {
      id: 0,
      type: SysCustomWidgetOperationType.EXPORT,
      name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.EXPORT),
      enabled: false,
      builtin: true,
      rowOperation: false,
      btnType: 'primary',
      plain: true,
      formId: undefined,
      paramList: [],
      eventList: [],
      readOnly: false,
      showOrder: 0
    },
    {
      id: 1,
      type: SysCustomWidgetOperationType.BATCH_DELETE,
      name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.BATCH_DELETE),
      enabled: false,
      builtin: true,
      rowOperation: false,
      btnType: 'danger',
      plain: true,
      formId: undefined,
      eventList: [],
      readOnly: false,
      showOrder: 1
    },
    {
      id: 2,
      type: SysCustomWidgetOperationType.ADD,
      name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.ADD),
      enabled: false,
      builtin: true,
      rowOperation: false,
      btnType: 'primary',
      plain: false,
      formId: undefined,
      eventList: [],
      readOnly: false,
      showOrder: 2
    },
    {
      id: 3,
      type: SysCustomWidgetOperationType.EDIT,
      name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.EDIT),
      enabled: false,
      builtin: true,
      rowOperation: true,
      btnClass: 'table-btn success',
      formId: undefined,
      eventList: [],
      readOnly: false,
      showOrder: 10
    },
    {
      id: 4,
      type: SysCustomWidgetOperationType.DELETE,
      name: SysCustomWidgetOperationType.getValue(SysCustomWidgetOperationType.DELETE),
      enabled: false,
      builtin: true,
      rowOperation: true,
      btnClass: 'table-btn delete',
      formId: undefined,
      eventList: [],
      readOnly: false,
      showOrder: 15
    }
  ],
  customFieldList: [],
  widgetList: [],
  formEventList: [],
  maskFieldList: [],
  allowEventList: [
    OnlineFormEventType.AFTER_CREATE_FORM
  ],
  fullscreen: true,
  advanceQuery: false,
  supportOperation: true,
  width: 800
}

const baseEditForm = {
  gutter: 20,
  labelWidth: 100,
  labelPosition: 'right',
  operationList: [],
  customFieldList: [],
  widgetList: [],
  formEventList: [],
  maskFieldList: [],
  allowEventList: [
    OnlineFormEventType.AFTER_CREATE_FORM,
    OnlineFormEventType.AFTER_LOAD_FORM_DATA,
    OnlineFormEventType.BEFORE_COMMIT_FORM_DATA
  ],
  fullscreen: false,
  supportOperation: true,
  width: 800
}

const baseFlowForm = {
  gutter: 20,
  labelWidth: 100,
  labelPosition: 'right',
  customFieldList: [],
  widgetList: [],
  formEventList: [],
  maskFieldList: [],
  allowEventList: [
    OnlineFormEventType.AFTER_CREATE_FORM,
    OnlineFormEventType.AFTER_LOAD_FORM_DATA,
    OnlineFormEventType.BEFORE_COMMIT_FORM_DATA
  ],
  fullscreen: true,
  supportOperation: false,
  width: 800
}

const baseWorkflowForm = {
  gutter: 20,
  labelWidth: 100,
  labelPosition: 'right',
  tableWidget: {
    ...OnlineWidgetConfig.getWidgetObject(tableConfig)
  },
  operationList: [],
  customFieldList: [],
  widgetList: [],
  formEventList: [],
  maskFieldList: [],
  allowEventList: [
    OnlineFormEventType.AFTER_CREATE_FORM
  ],
  fullscreen: true,
  supportOperation: true,
  width: 800
}

function getFormConfig (formType, pageType) {
  switch (formType) {
    case SysOnlineFormType.QUERY:
    case SysOnlineFormType.ADVANCE_QUERY:
    case SysOnlineFormType.ONE_TO_ONE_QUERY:
      return JSON.parse(JSON.stringify({
        pc: {
          ...baseQueryForm,
          advanceQuery: formType === SysOnlineFormType.ADVANCE_QUERY,
          supportOperation: formType !== SysOnlineFormType.ONE_TO_ONE_QUERY
        }
      }));
    case SysOnlineFormType.FORM:
      return JSON.parse(JSON.stringify({
        pc: {
          ...baseEditForm,
          supportOperation: pageType === SysOnlinePageType.BIZ
        }
      }));
    case SysOnlineFormType.FLOW:
      return JSON.parse(JSON.stringify({
        pc: baseFlowForm
      }));
    case SysOnlineFormType.WORK_ORDER:
      return JSON.parse(JSON.stringify({
        pc: baseWorkflowForm
      }));
    default: return null;
  }
}

export {
  getFormConfig
}
