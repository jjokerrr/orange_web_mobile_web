import { SysCustomWidgetBindValueType } from '@/staticDict/onlineStaticDict.js';
import { SysCustomWidgetBindDataType } from '@/staticDict/index.js';

const defalutWidgetBindData = {
  // 默认值
  defaultValue: {
    valueType: SysCustomWidgetBindValueType.INPUT_DATA,
    // 默认值是字典，字典ID
    dictId: undefined,
    value: undefined,
    // 内置系统变量
    systemVariable: undefined
  },
  // 组件绑定数据类型（自定义、系统变量、数据源字段）
  dataType: SysCustomWidgetBindDataType.Column,
  // 脚本
  scriptString: undefined,
  // 数据源表标识
  tableId: undefined,
  // 数据源字段名
  columnId: undefined,
  // 表单自定义字段
  formFieldName: undefined,
  // 系统内置变量
  systemVariableType: undefined
}

export default defalutWidgetBindData;
