import { OnlineFormEventType } from '@/staticDict/index.js';
import { findItemFromList } from '@/utils';

const OnlineFormEventList = [
  {
    id: OnlineFormEventType.CHANGE,
    name: '组件数据改变',
    functionName: 'onChange',
    paramList: ['val'],
    comment:
`
/**
 * 组件数据改变时触发
 * @params val 组件当前值
 * @params this 表单组件
 */
`
  },
  {
    id: OnlineFormEventType.DISABLE,
    name: '是否禁用',
    functionName: 'disabled',
    paramList: [],
    comment:
`
/**
 * 组件是否禁用
 * @params this
 */
return false;
`
  },
  {
    id: OnlineFormEventType.VISIBLE,
    name: '是否可见',
    functionName: 'visible',
    paramList: [],
    comment:
`
/**
 * 组件是否可见
 * @params this
 */
return true;
`
  },
  {
    id: OnlineFormEventType.DROPDOWN_CHANGE,
    name: '组件下拉数据改变',
    functionName: 'onDropdownChange',
    paramList: ['dataList'],
    comment:
`
/**
 * 组件下拉数据改变时触发
 * @params dataList 下拉数据
 * @params this 表单组件
 */
return dataList;
`
  },
  {
    id: OnlineFormEventType.DISABLED_DATE,
    name: '日期组件设置日期是否禁用函数',
    functionName: 'disabledDate',
    paramList: ['date'],
    comment:
`
/**
 * 日期组件设置日期是否禁用函数，返回Boolean
 * @params date 当前日期
 */
return false;
`
  },
  {
    id: OnlineFormEventType.AFTER_LOAD_TABLE_DATA,
    name: '表格读取数据后回调',
    functionName: 'afterLoadTableData',
    paramList: ['dataList'],
    comment:
`
/**
 * 读取列表数据后触发
 * @params dataList
 * @params this 表单组件
 */
return dataList;
`
  },
  {
    id: OnlineFormEventType.BEFORE_LOAD_TABLE_DATA,
    name: '表格读取数据前回调',
    functionName: 'beforeLoadTableData',
    paramList: ['params'],
    comment:
`
/**
 * 读取表格数据前触发
 * @params params 请求参数
 * @params this 表单组件
 */
 return params;
`
  },
  {
    id: OnlineFormEventType.AFTER_LOAD_FORM_DATA,
    name: '表单页面加载数据后回调',
    functionName: 'afterLoadFormData',
    paramList: [],
    comment:
`
/**
 * 表单页面加载数据后触发
 * @params this 表单组件
 */
`
  },
  {
    id: OnlineFormEventType.BEFORE_COMMIT_FORM_DATA,
    name: '表单页面提交数据前回调',
    functionName: 'beforeCommitFormData',
    paramList: ['params'],
    comment:
`
/**
 * 表单页面提交数据前触发
 * @params params 请求参数
 * @params this 表单组件
 */
return params;
`
  },
  {
    id: OnlineFormEventType.AFTER_CREATE_FORM,
    name: '表单页面创建完毕',
    functionName: 'formCreated',
    paramList: [],
    comment:
`
/**
 * 表单页面创建完毕，可用于初始化表单数据
 * @params this 表单组件
 */
`
  },
  {
    id: OnlineFormEventType.OPERATION_VISIBLE,
    name: '操作是否可见',
    functionName: 'operationVisible',
    paramList: ['rowData'],
    comment:
`
/**
 * 操作是否可见
 * @params rowData 表格行内操作当前行数据
 * @params this 表单组件
 */
return true;
`
  },
  {
    id: OnlineFormEventType.OPERATION_DISABLED,
    name: '操作是否禁用',
    functionName: 'operationDisabled',
    paramList: ['rowData'],
    comment:
`
/**
 * 操作是否禁用
 * @params rowData 表格行内操作当前行数据
 * @params this 表单组件
 */
return false;
`
  },
  {
    id: OnlineFormEventType.LINK_HERF,
    name: '超链接地址',
    functionName: 'linkHerf',
    paramList: ['herf'],
    comment:
`
/**
 * 计算超链接地址
 * @params herf 参数中设置的herf
 * @params this 表单组件
 * @return 返回新的地址
 */
return herf;
`
  }
];

export function eventFunction (event) {
  if (event == null || event === '') return null;
  let eventInfo = findItemFromList(OnlineFormEventList, event.eventType, 'id');
  let scriptBodyString = event.scriptString ? event.scriptString : '';
  let params = '(' + (eventInfo.paramList || []).join(',') + ')';
  let script = `
    function fun ${params} {
      ${scriptBodyString}
    }

    fun
  `;
  // eslint-disable-next-line
  let fun = eval(script);
  return fun;
}

export default OnlineFormEventList;
