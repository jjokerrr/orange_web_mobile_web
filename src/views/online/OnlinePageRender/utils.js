export function buildFormConfig (formData) {
  if (formData == null) return;
  let formConfig = formData;
  formConfig.datasourceMap = new Map();
  formConfig.relationMap = new Map();
  formConfig.tableMap = new Map();
  formConfig.columnMap = new Map();
  formConfig.dictMap = new Map();
  formConfig.linkageMap = new Map();
  let rawData = formData.rawData;
  if (rawData == null) return formConfig;
  // 字典
  if (Array.isArray(rawData.onlineDictList)) {
    rawData.onlineDictList.forEach(dict => {
      formConfig.dictMap.set(dict.dictId, dict);
    });
  }
  rawData.onlineDictList = null;
  // 数据表
  if (Array.isArray(rawData.onlineTableList)) {
    rawData.onlineTableList.forEach(table => {
      formConfig.tableMap.set(table.tableId, table);
    });
  }
  rawData.onlineTableList = null;
  // 字段
  if (Array.isArray(rawData.onlineColumnList)) {
    rawData.onlineColumnList.forEach(column => {
      if (column.dictId != null) {
        column.dictInfo = formConfig.dictMap.get(column.dictId);
      }
      if (column.encodedRule != null && column.encodedRule !== null) {
        column.encodedRule = JSON.parse(column.encodedRule);
      }
      // 脱敏设置
      if (Array.isArray(formConfig.maskFieldList) && formConfig.maskFieldList.length > 0) {
        formConfig.maskFieldList.forEach(item => {
          if (Array.isArray(item) && item.length === 2) {
            if (item[0] === column.tableId && item[1] === column.columnId) {
              column.supportMaskField = true;
            }
          }
        });
      }
      let table = formConfig.tableMap.get(column.tableId);
      if (table) {
        if (!Array.isArray(table.columnList)) table.columnList = [];
        table.columnList.push(column);
      }
      formConfig.columnMap.set(column.columnId, column);
    });
  }
  rawData.onlineColumnList = null;
  // 虚拟字段
  if (Array.isArray(rawData.onlineVirtualColumnList)) {
    rawData.onlineVirtualColumnList.forEach(column => {
      column.columnId = column.virtualColumnId;
      column.columnComment = column.columnPrompt;
      column.columnName = column.objectFieldName;
      column.primaryKey = false;
      column.isVirtualColumn = true;
      formConfig.columnMap.set(column.columnId, column);
    });
  }
  rawData.onlineVirtualColumnList = null;
  // 数据源
  if (Array.isArray(rawData.onlineDatasourceList)) {
    rawData.onlineDatasourceList.forEach(datasource => {
      datasource.masterTable = formConfig.tableMap.get(datasource.masterTableId);
      if (datasource.masterTable) datasource.masterTable.datasource = datasource;
      formConfig.datasourceMap.set(datasource.datasourceId, datasource);
    });
  }
  rawData.onlineDatasourceList = null;
  // 关联
  if (Array.isArray(rawData.onlineDatasourceRelationList)) {
    rawData.onlineDatasourceRelationList.forEach(relation => {
      let datasource = formConfig.datasourceMap.get(relation.datasourceId);
      if (datasource) {
        if (!Array.isArray(datasource.relationList)) datasource.relationList = [];
        datasource.relationList.push(relation);
      }
      relation.masterColumn = formConfig.columnMap.get(relation.masterColumnId);
      relation.slaveTable = formConfig.tableMap.get(relation.slaveTableId);
      if (relation.slaveTable) {
        relation.slaveTable.relation = relation;
        relation.slaveTable.datasource = datasource;
      }
      relation.slaveColumn = formConfig.columnMap.get(relation.slaveColumnId);
      formConfig.relationMap.set(relation.relationId, relation);
    });
  }
  rawData.onlineDatasourceRelationList = null;
  // 校验规则
  if (Array.isArray(rawData.onlineColumnRuleList)) {
    rawData.onlineColumnRuleList.forEach(rule => {
      let column = formConfig.columnMap.get(rule.columnId);
      if (column) {
        if (!Array.isArray(column.ruleList)) column.ruleList = [];
        column.ruleList.push(rule);
      }
    });
  }
  rawData.onlineColumnRuleList = null;

  return formConfig;
}
