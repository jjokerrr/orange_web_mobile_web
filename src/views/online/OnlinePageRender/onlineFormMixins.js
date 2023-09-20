
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import { mapGetters } from 'vuex';
import * as StaticDict from '@/staticDict';
import { formatDate } from '@/utils';
import rules from '@/utils/validate.js';
import widgetData from './components/config/index.js';
import { getDictDataList } from '../utils';
import { eventFunction } from '@/online/event/index.js';
import {
  OnlineFormController
} from '@/api/onlineController.js';
import ajax from '@/core/http/index.js';

export const OnlineFormMixins = {
  props: {
    mode: {
      type: String,
      default: 'pc'
    }
  },
  mixins: [refreshDataMixins],
  data () {
    return {
      isReady: false,
      errorMessage: [],
      tableWidgetList: [],
      dropdownWidgetList: [],
      richEditWidgetList: [],
      formData: {
        // 数据字段会根据render信息去初始化

        // 自定义字段
        customField: {}
      },
      rules: {},
      getDictDataList: getDictDataList,
      operationCallback: null
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdOnlineEditForm' && data.isSuccess) {
        if (this.operationCallback && typeof this.operationCallback === 'function') {
          this.operationCallback(data.data);
        }
      }
    },
    getCompoment (formConfig, widget) {
      return null;
    },
    loadOnlineFormConfig (formId) {
      return new Promise((resolve, reject) => {
        OnlineFormController.render(this, {
          formId: formId
        }).then(res => {
          let onlineForm = res.data.onlineForm;
          let formConfigData = JSON.parse(onlineForm.widgetJson);
          formConfigData = formConfigData.pc;
          let formConfig = {
            rawData: res.data,
            formName: onlineForm.formName,
            formType: onlineForm.formType,
            formKind: onlineForm.formKind,
            masterTableId: onlineForm.masterTableId,
            labelWidth: formConfigData.labelWidth,
            labelPosition: formConfigData.labelPosition,
            filterItemWidth: formConfigData.filterItemWidth,
            gutter: formConfigData.gutter,
            height: formConfigData.height,
            width: formConfigData.width,
            fullscreen: formConfigData.fullscreen,
            advanceQuery: formConfigData.advanceQuery,
            widgetList: formConfigData.widgetList,
            operationList: (formConfigData.operationList || []).sort((value1, value2) => {
              return (value1.showOrder || 0) - (value2.showOrder || 0)
            }),
            tableWidget: formConfigData.tableWidget,
            leftWidget: formConfigData.leftWidget,
            customFieldList: formConfigData.customFieldList,
            formEventList: formConfigData.formEventList,
            maskFieldList: formConfigData.maskFieldList
          }
          resolve(formConfig);
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 执行操作
     * @param {*} operation 操作
     * @param {*} options 配置项
     * @param {*} options.isEdit 是否编辑
     * @param {*} options.saveData 是否把数据保存到数据库
     * @param {*} options.widget 触发组件
     * @param {*} options.rowData 行数据
     * @param {*} options.masterTableData 主表数据
     * @param {*} options.callback 回调
     */
    handlerOperation (operation, operationParams) {
      let { isEdit, saveData, widget, rowData, masterTableData, callback } = operationParams;
      this.loadOnlineFormConfig(operation.formId).then(formConfig => {
        let dlgOptions;
        if (formConfig.fullscreen) {
          dlgOptions = {
            area: ['100vw', '100vh'],
            skin: 'fullscreen-dialog'
          };
        } else {
          dlgOptions = {
            area: [(formConfig.width ? formConfig.width : 600) + 'px', (formConfig.height ? formConfig.height : 500) + 'px']
          }
        }
        let dlgComponent = this.getCompoment(formConfig, widget);
        if (dlgComponent == null) {
          return Promise.reject(new Error('错误的操作组件！！！'));
        } else {
          let thirdPath = 'thirdOnlineEditForm';
          this.operationCallback = callback;
          return this.$dialog.show(formConfig.formName, dlgComponent, dlgOptions, {
            formConfig: formConfig,
            rowData: rowData,
            masterTableData: masterTableData,
            isEdit: isEdit,
            isCopy: operation.type === this.SysCustomWidgetOperationType.COPY,
            readOnly: operation.readOnly,
            fullscreen: formConfig.fullscreen,
            saveData: saveData,
            path: thirdPath
          }, {
            fullscreen: formConfig.fullscreen,
            width: dlgOptions.area[0],
            height: dlgOptions.area[1],
            pathName: '/thirdParty/thirdOnlineEditForm'
          });
        }
      }).then(res => {
        if (callback && typeof callback === 'function') {
          callback(res);
        }
        this.operationCallback = null;
      }).catch(e => {
        console.log(e);
      });
    },
    initPage () {
      this.form.tableMap.forEach((table) => {
        if (table.relation == null) {
          // 主表
          let tempObj = Array.isArray(table.columnList) ? table.columnList.reduce((retObj, column) => {
            retObj[column.columnName] = undefined;
            return retObj;
          }, {}) : {};
          this.$set(this.formData, table.datasource.variableName, tempObj);
        } else {
          if (table.relation.relationType === this.SysOnlineRelationType.ONE_TO_ONE) {
            // 一对一关联从表
            let tempObj = Array.isArray(table.columnList) ? table.columnList.reduce((retObj, column) => {
              retObj[column.columnName] = undefined;
              return retObj;
            }, {}) : {};
            this.$set(this.formData, table.relation.variableName, tempObj);
          } else if (table.relation.relationType === this.SysOnlineRelationType.ONE_TO_MANY) {
            // 一对多关联从表
            if (this.masterTable.relation != null && this.masterTable.relation.relationId === table.relation.relationId) {
              // 表单主表是当前一对多从表
              let tempObj = Array.isArray(table.columnList) ? table.columnList.reduce((retObj, column) => {
                retObj[column.columnName] = undefined;
                return retObj;
              }, {}) : {};
              this.$set(this.formData, table.relation.variableName, tempObj);
            } else {
              this.$set(this.formData, table.relation.variableName, []);
            }
          }
        }
      });
      // 初始化自定义字段
      if (Array.isArray(this.form.customFieldList)) {
        this.form.customFieldList.forEach(field => {
          this.$set(this.formData.customField, field.fieldName, undefined);
        });
      }
    },
    getSystemVariableValue (systemVariableType) {
      switch (systemVariableType) {
        case this.OnlineSystemVariableType.CURRENT_USER: return this.getUserInfo.showName;
        case this.OnlineSystemVariableType.CURRENT_DEPT: return this.getUserInfo.deptName;
        case this.OnlineSystemVariableType.CURRENT_DATE: return formatDate(new Date(), 'YYYY-MM-DD');
        case this.OnlineSystemVariableType.CURRENT_TIME: return formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
        case this.OnlineSystemVariableType.FLOW_CREATE_USER: return (this.flowInfo || {}).processInstanceInitiator || this.getUserInfo.showName;
      }
      return undefined;
    },
    getWidgetValueByColumn (column) {
      if (column == null) return undefined;
      let table = column ? this.form.tableMap.get(column.tableId) : undefined;
      if (table == null || table.datasource == null) return undefined;
      return table.relation == null ? this.formData[table.datasource.variableName][column.columnName] : this.formData[table.relation.variableName][column.columnName];
    },
    getWidgetValue (widget) {
      if (this.isEdit && widget.bindData.dataType !== this.SysCustomWidgetBindDataType.SYSTEM_VARIABLE) return;
      if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Column && widget.column) {
        // 绑定从表字段
        if (widget.relation && this.formData[widget.relation.variableName]) {
          if (this.formReadOnly || widget.widgetType === this.SysCustomWidgetType.Label) {
            let dictObj = this.formData[widget.relation.variableName][widget.column.columnName + 'DictMap'];
            if (dictObj != null && dictObj.name) return dictObj.name;
            let dictArray = this.formData[widget.relation.variableName][widget.column.columnName + 'DictMapList'];
            if (Array.isArray(dictArray) && dictArray.length > 0) return dictArray.map(item => item.name).join(',');
          }
          return this.formData[widget.relation.variableName][widget.column.columnName];
        }
        // 绑定主表字段
        if (widget.datasource && this.formData[widget.datasource.variableName]) {
          if (this.formReadOnly || widget.widgetType === this.SysCustomWidgetType.Label) {
            let dictObj = this.formData[widget.datasource.variableName][widget.column.columnName + 'DictMap'];
            if (dictObj != null && dictObj.name) return dictObj.name;
            let dictArray = this.formData[widget.datasource.variableName][widget.column.columnName + 'DictMapList'];
            if (Array.isArray(dictArray) && dictArray.length > 0) {
              let temp = dictArray.map(item => item.name).join(',');
              return temp;
            }
          }
          return this.formData[widget.datasource.variableName][widget.column.columnName];
        }
      } else if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Custom && widget.bindData.formFieldName) {
        return this.formData.customField[widget.bindData.formFieldName];
      } else if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.SYSTEM_VARIABLE && widget.bindData.systemVariableType != null) {
        // 系统内置变量
        return this.getSystemVariableValue(widget.bindData.systemVariableType);
      }
    },
    getWidgetProp (widget) {
      if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Column && widget.column) {
        if (widget.relation && this.formData[widget.relation.variableName]) {
          return widget.relation.variableName + '.' + widget.column.columnName;
        } else if (widget.datasource && this.formData[widget.datasource.variableName]) {
          return widget.datasource.variableName + '.' + widget.column.columnName;
        }
      } else if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Custom && widget.bindData.formFieldName) {
        return 'customField.' + widget.bindData.formFieldName;
      }
    },
    onValueChange (widget, value) {
      if (this.isEdit || !this.isReady) return;
      if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Column && widget.column) {
        // 绑定从表字段
        if (widget.relation) {
          this.formData[widget.relation.variableName][widget.column.columnName] = value;
          return;
        }
        // 绑定主表字段
        if (widget.datasource) {
          this.formData[widget.datasource.variableName][widget.column.columnName] = value;
        }
      } else if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Custom && widget.bindData.formFieldName) {
        this.formData.customField[widget.bindData.formFieldName] = value;
      }
    },
    getWidgetVisible (widget) {
      if (this.isEdit) return true;
      if (typeof widget.eventInfo[this.OnlineFormEventType.VISIBLE] === 'function') {
        return widget.eventInfo[this.OnlineFormEventType.VISIBLE]();
      } else {
        return true;
      }
    },
    getOperationPermCode (operation) {
      let temp = 'view';
      switch (operation.type) {
        case this.SysCustomWidgetOperationType.ADD:
        case this.SysCustomWidgetOperationType.EDIT:
        case this.SysCustomWidgetOperationType.DELETE:
        case this.SysCustomWidgetOperationType.BATCH_DELETE:
          temp = 'edit';
          break;
        default:
          temp = 'view';
      }
      if (this.masterTable && this.masterTable.datasource) {
        return 'online:' + this.masterTable.datasource.variableName + ':' + temp;
      } else {
        return '';
      }
    },
    getScriptFunction (eventInfo, eventType) {
      if (eventInfo && typeof eventInfo[eventType] === 'function') {
        return eventInfo[eventType];
      } else {
        return null;
      }
    },
    checkOperationPermCode (operation) {
      if (this.form.formType !== this.SysOnlineFormType.QUERY || this.isEdit) return true;
      return this.checkPermCodeExist(this.getOperationPermCode(operation));
    },
    checkOperationDisabled (operation, rowData) {
      if (this.isEdit) return false;
      if (operation == null) return true;
      let fun = this.getScriptFunction(operation.eventInfo, this.OnlineFormEventType.OPERATION_DISABLED);
      return fun ? fun(rowData) : false;
    },
    checkOperationVisible (operation, rowData) {
      if (this.isEdit) return true;
      if (operation == null) return false;
      let fun = this.getScriptFunction(operation.eventInfo, this.OnlineFormEventType.OPERATION_VISIBLE);
      return fun ? fun(rowData) : true;
    },
    onWidgetValueChange (widget, value, detail) {
      if (this.isEdit || !this.isReady) return;
      let dictData = (detail || {}).dictData;
      // 更新字典数据
      if (dictData != null) {
        if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Column && widget.column) {
          // 绑定从表字段
          if (widget.relation) {
            if (Array.isArray(dictData)) {
              this.formData[widget.relation.variableName][widget.column.columnName + 'DictMapList'] = dictData;
            } else {
              this.formData[widget.relation.variableName][widget.column.columnName + 'DictMap'] = dictData;
            }
            let fun = this.getScriptFunction(widget.eventInfo, this.OnlineFormEventType.CHANGE);
            fun && fun(value, detail);
            return;
          }
          // 绑定主表字段
          if (widget.datasource) {
            if (Array.isArray(dictData)) {
              this.formData[widget.datasource.variableName][widget.column.columnName + 'DictMapList'] = dictData;
            } else {
              this.formData[widget.datasource.variableName][widget.column.columnName + 'DictMap'] = dictData;
            }
          }
        } else if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Custom && widget.bindData.formFieldName) {
          if (Array.isArray(dictData)) {
            this.formData.customField[widget.bindData.formFieldName + 'DictMapList'] = dictData;
          } else {
            this.formData.customField[widget.bindData.formFieldName + 'DictMap'] = dictData;
          }
        }
      }
      // 一对一关联选择组件
      if (widget.widgetType === this.SysCustomWidgetType.DataSelect &&
        (this.form.formType === this.SysOnlineFormType.FORM || this.form.formType === this.SysOnlineFormType.FLOW)) {
        let selectRow = (detail || {}).selectRow;
        let relationId = (widget.props.relativeTable || {}).relationId;
        let relation = this.form.relationMap.get(relationId);
        if (relation != null) {
          this.formData[relation.variableName] = selectRow || {};
        }
      }
      let fun = this.getScriptFunction(widget.eventInfo, this.OnlineFormEventType.CHANGE);
      fun && fun(value, detail);
    },
    getPrimaryData (widget) {
      let primaryKey;
      if (widget && widget.table && Array.isArray(widget.table.columnList)) {
        widget.table.columnList.forEach(column => {
          if (column.primaryKey) primaryKey = column.columnName;
        });
      }
      if (primaryKey != null) {
        if (widget.relation != null) {
          return this.formData[widget.relation.variableName][primaryKey];
        } else if (widget.datasource != null) {
          return this.formData[widget.datasource.variableName][primaryKey];
        }
      }
      return undefined;
    },
    initFormWidgetList () {
      if (Array.isArray(this.form.operationList)) {
        this.form.operationList.forEach(operation => {
          operation.eventInfo = (operation.eventList || []).reduce((retObj, event) => {
            let fun = eventFunction(event);
            if (fun) retObj[event.eventType] = fun.bind(this);
            return retObj;
          }, {});
        });
      }
      if (Array.isArray(this.form.formEventList)) {
        this.form.eventInfo = this.form.formEventList.reduce((retObj, event) => {
          let fun = eventFunction(event);
          if (fun) retObj[event.eventType] = fun.bind(this);
          return retObj;
        }, {});
      } else {
        this.form.eventInfo = {};
      }
      this.errorMessage = [];
      if (Array.isArray(this.form.widgetList)) {
        this.form.widgetList.forEach(widget => {
          this.initWidget(widget);
        });
      }
      if (this.form.tableWidget) this.initWidget(this.form.tableWidget);
      if (this.form.leftWidget) this.initWidget(this.form.leftWidget);
      if (this.errorMessage.length > 0) {
        console.error(this.errorMessage);
      }
    },
    initWidget (widget) {
      if (widget != null) {
        if (widget.bindData.tableId) widget.table = this.form.tableMap.get(widget.bindData.tableId);
        if (widget.bindData.columnId) widget.column = this.form.columnMap.get(widget.bindData.columnId);
        if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Custom) {
          if (widget.props.dictId != null) {
            widget.dictInfo = this.form.dictMap.get(widget.props.dictId);
          }
        } else if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Custom) {
          widget.dictInfo = (widget.column || {}).dictInfo;
        }
        if (widget.table) {
          if (widget.table.datasource) widget.datasource = widget.table.datasource;
          if (widget.table.relation) widget.relation = widget.table.relation;
        }
        if (widget.widgetType === this.SysCustomWidgetType.RichEditor) {
          this.richEditWidgetList.push(widget);
        }
        widget.propString = this.getWidgetProp(widget);

        // 初始化组件下拉字典参数
        if (widget.props.dictInfo && Array.isArray(widget.props.dictInfo.paramList)) {
          widget.props.dictInfo.paramList.forEach(param => {
            if (param.dictValueType === this.SysOnlineParamValueType.STATIC_DICT) {
              let errorItem = null;
              if (Array.isArray(param.dictValue) && param.dictValue.length === 2) {
                let staticDict = StaticDict[param.dictValue[0]];
                if (staticDict == null) {
                  errorItem = {
                    widget: widget,
                    message: '组件字典参数' + param.dictParamName + '绑定的静态字典 [' + param.dictValue[0] + '] 并不存在！'
                  }
                } else {
                  if (staticDict.getValue(param.dictValue[1]) == null) {
                    errorItem = {
                      widget: widget,
                      message: '组件字典参数' + param.dictParamName + '绑定的静态字典值并不属于静态字段 [' + param.dictValue[0] + '] ！'
                    }
                  }
                }
              } else {
                errorItem = {
                  widget: widget,
                  message: '组件字典参数' + param.dictParamName + '绑定的静态字典错误！'
                }
              }
              if (errorItem != null) this.errorMessage.push(errorItem);
            }
          });
        }
        if (widget.props.dictInfo && widget.props.dictInfo.dictId) {
          widget.props.dictInfo.dict = this.form.dictMap.get(widget.props.dictInfo.dictId);
        }
        if (widget.column && widget.column.dictInfo != null) {
          this.dropdownWidgetList.push(widget);
        }
        // 初始化表格列
        if (widget.widgetType === this.SysCustomWidgetType.Table) {
          // 寻找表格主键
          widget.primaryColumnName = undefined;
          if (widget.table && Array.isArray(widget.table.columnList)) {
            for (let i = 0; i < widget.table.columnList.length; i++) {
              if (widget.table.columnList[i].primaryKey) {
                widget.primaryColumnName = widget.table.columnList[i].columnName;
                break;
              }
            }
          }
          if (Array.isArray(widget.props.tableColumnList)) {
            widget.props.tableColumnList.forEach(tableColumn => {
              tableColumn.table = this.form.tableMap.get(tableColumn.tableId);
              tableColumn.column = this.form.columnMap.get(tableColumn.columnId);
              tableColumn.relation = this.form.relationMap.get(tableColumn.relationId);
              if (tableColumn.table == null || tableColumn.column == null) {
                this.errorMessage.push({
                  widget: widget,
                  message: '表格列 [' + tableColumn.showName + '] 绑定的字段不存在！'
                });
              }
            });
          }
          // 操作排序
          if (Array.isArray(widget.operationList)) {
            widget.operationList = (widget.operationList || []).sort((value1, value2) => {
              return (value1.showOrder || 0) - (value2.showOrder || 0)
            });
            widget.operationList.forEach(operation => {
              operation.eventInfo = (operation.eventList || []).reduce((retObj, event) => {
                let fun = eventFunction(event);
                if (fun) retObj[event.eventType] = fun.bind(this);
                return retObj;
              }, {});
            });
          }
          this.tableWidgetList.push(widget);
        }

        if (Array.isArray(widget.childWidgetList)) {
          widget.childWidgetList.forEach(subWidget => {
            this.initWidget(subWidget);
          })
        }

        if (widget.props && widget.props.dictInfo) {
          if (Array.isArray(widget.props.dictInfo.paramList)) {
            widget.props.dictInfo.paramList.forEach(dictParam => {
              if (dictParam.dictValueType === this.SysOnlineParamValueType.TABLE_COLUMN) {
                let linkageItem = this.form.linkageMap.get(dictParam.dictValue);
                if (linkageItem == null) {
                  linkageItem = [];
                  this.form.linkageMap.set(dictParam.dictValue, linkageItem);
                }
                linkageItem.push(widget);
              }
            });
          }
        }

        if (Array.isArray(widget.eventList)) {
          widget.eventInfo = widget.eventList.reduce((retObj, event) => {
            let fun = eventFunction(event);
            if (fun) retObj[event.eventType] = fun.bind(this);
            return retObj;
          }, {});
        } else {
          widget.eventInfo = {};
        }
      }
    },
    buildRuleItem (column, rule, trigger = 'blur') {
      if (rule.propDataJson) rule.data = JSON.parse(rule.propDataJson);
      if (column != null && rule != null) {
        switch (rule.onlineRule.ruleType) {
          case this.SysOnlineRuleType.INTEGER_ONLY:
            return { type: 'integer', message: rule.data.message, trigger: trigger, transform: (value) => Number(value) };
          case this.SysOnlineRuleType.DIGITAL_ONLY:
            return { type: 'number', message: rule.data.message, trigger: trigger, transform: (value) => Number(value) };
          case this.SysOnlineRuleType.LETTER_ONLY:
            return { type: 'string', pattern: rules.pattern.english, message: rule.data.message, trigger: trigger };
          case this.SysOnlineRuleType.EMAIL:
            return { type: 'email', message: rule.data.message, trigger: trigger };
          case this.SysOnlineRuleType.MOBILE:
            return { type: 'string', pattern: rules.pattern.mobie, message: rule.data.message, trigger: trigger };
          case this.SysOnlineRuleType.RANGE:
            if (column) {
              let isNumber = ['Boolean', 'Date', 'String'].indexOf(column.objectFieldType) === -1;
              return { type: isNumber ? 'number' : 'string', min: rule.data.min, max: rule.data.max, message: rule.data.message, trigger: trigger };
            }
            break;
          case this.SysOnlineRuleType.CUSTOM:
            return { type: 'string', pattern: new RegExp(rule.onlineRule.pattern), message: rule.data.message, trigger: trigger };
        }
      }
    },
    buildWidgetRule (widget, rules) {
      if (widget != null) {
        let widgetRuleKey;
        if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Custom) {
          // 自定义字段
          widgetRuleKey = 'customField.' + widget.bindData.formFieldName;
        } else if (widget.bindData.dataType === this.SysCustomWidgetBindDataType.Column && widget.column) {
          // 绑定字段
          widgetRuleKey = (widget.relation ? widget.relation.variableName : widget.datasource.variableName) + '.' + widget.column.columnName;
        }
        // 必填字段以及设置了验证规则的字段
        if (widgetRuleKey && (widget.props.required || (widget.column && Array.isArray(widget.column.ruleList)))) {
          rules[widgetRuleKey] = [];
          // 必填验证
          if (widget.props.required) {
            rules[widgetRuleKey].push(
              { required: true, message: widget.showName + '不能为空！', trigger: 'change' }
            )
          }
          // 其他验证
          if (widget.column && Array.isArray(widget.column.ruleList)) {
            widget.column.ruleList.forEach(rule => {
              let ruleItem = this.buildRuleItem(widget.column, rule, 'change');
              if (ruleItem) rules[widgetRuleKey].push(ruleItem);
            });
          }
        }
        if (Array.isArray(widget.childWidgetList)) {
          widget.childWidgetList.forEach(subWidget => {
            this.buildWidgetRule(subWidget, rules);
          });
        }
      }
    },
    initWidgetRule () {
      let rules = {};
      this.form.widgetList.forEach(widget => {
        this.buildWidgetRule(widget, rules);
      });
      this.$set(this, 'rules', rules);
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
      });
    },
    resetWidget (widget) {
      if (widget && widget.widgetImpl && typeof widget.widgetImpl.reset === 'function') {
        widget.widgetImpl.reset();
      }
    },
    initWidgetLinkage () {
      this.form.linkageMap.forEach((widgetList, key) => {
        let column = this.form.columnMap.get(key);
        let table = column ? this.form.tableMap.get(column.tableId) : undefined;
        let watchKey = 'formData.' + (table.relation == null ? table.datasource.variableName : table.relation.variableName) + '.';
        watchKey += column.columnName;
        this.$watch(watchKey, (newValue) => {
          if (Array.isArray(widgetList)) {
            widgetList.forEach(widget => {
              this.resetWidget(widget);
            });
          }
        });
      });
    },
    getParamValue (valueType, valueData) {
      switch (valueType) {
        case this.SysOnlineParamValueType.TABLE_COLUMN:
        {
          let column = this.form.columnMap ? this.form.columnMap.get(valueData) : null;
          return column ? this.getWidgetValueByColumn(column) : undefined;
        }
        case this.SysOnlineParamValueType.STATIC_DICT:
          return Array.isArray(valueData) ? valueData[1] : undefined;
        case this.SysOnlineParamValueType.INPUT_VALUE:
          return valueData;
      }
    },
    getDropdownParams (widget) {
      if (Array.isArray(widget.props.dictInfo.paramList)) {
        let params = {};
        for (let i = 0; i < widget.props.dictInfo.paramList.length; i++) {
          let dictParam = widget.props.dictInfo.paramList[i];
          if (dictParam.dictValue == null || dictParam.dictValueType == null) continue;
          params[dictParam.dictParamName] = this.getParamValue(dictParam.dictValueType, dictParam.dictValue);
        }

        return params;
      } else {
        return {};
      }
    },
    cloneWidget (widget) {
      let temp = widgetData.getWidgetObject(widgetData.getWidgetAttribute(widget.widgetType, this.mode));
      temp.showName = widget.showName;
      temp.props = {
        ...widget.props
      }
      return temp;
    },
    // 获取表忽略脱敏字段列表
    getTableIgnoreFieldList (table, ignoreList = []) {
      if (table == null) return;
      if (Array.isArray(table.columnList) && table.columnList.length > 0) {
        table.columnList.forEach(column => {
          if (!column.supportMaskField && column.fieldKind === this.SysOnlineFieldKind.FIELD_MASK) {
            ignoreList.push(table.tableName + '.' + column.columnName);
          }
        });
      }
    },
    getIgnoreMaskFields (widget) {
      let tempList = [];
      if (widget == null) {
        // 返回所有忽略字段
        this.form.tableMap.forEach(table => {
          this.getTableIgnoreFieldList(table, tempList);
        });
      } else {
        if (widget.relation == null) {
          // 组件绑定的主表，返回主表以及一对一从表忽略字段
          this.getTableIgnoreFieldList(widget.datasource.masterTable, tempList);
          if (widget.datasource && Array.isArray(widget.datasource.relationList)) {
            widget.datasource.relationList.forEach(relation => {
              if (relation.relationType === this.SysOnlineRelationType.ONE_TO_ONE) {
                this.getTableIgnoreFieldList(relation.slaveTable, tempList);
              }
            });
          }
        } else {
          // 组件绑定的从表，仅返回从表的忽略字段
          this.getTableIgnoreFieldList(widget.relation.slaveTable, tempList);
        }
      }
      return tempList.length > 0 ? tempList.join(',') : undefined;
    },
    getPrintParamItem (row, printParamList) {
      let param;
      if (Array.isArray(printParamList)) {
        param = printParamList.map(item => {
          let columnId = item.paramValue;
          if (columnId != null) {
            let column = this.form.columnMap.get(columnId);
            let value = row ? (row || {})[column.columnName] : this.getWidgetValueByColumn(column);
            if (item.paramName != null && value != null) {
              return {
                paramName: item.paramName,
                paramValue: value
              }
            }
          }
          return null;
        }).filter(item => item != null);
      }

      return param;
    },
    onPrint (operation, row, fileName) {
      if (operation == null) return;
      let printParam;
      if (row != null) {
        let temp = this.getPrintParamItem(row, operation.printParamList);
        printParam = temp ? [temp] : [];
      } else {
        if (this.selectRows.length <= 0) {
          this.$message.error('请选择要打印的数据！');
          return;
        }
        printParam = this.selectRows.map(row => {
          return this.getPrintParamItem(row, operation.printParamList);
        }).filter(item => item != null);
      }
      let params = {
        datasourceId: this.masterTable.datasource.datasourceId,
        printId: operation.printTemplateId,
        printParams: printParam
      }
      this.doUrl('/admin/online/onlineOperation/print/' + this.masterTable.datasource.variableName, 'post', params).then(res => {
        let downloadUrl = res.data;
        ajax.fetchDownloadBlob(downloadUrl, {}, fileName, 'get'
        ).then(blobData => {
          let pdfUrl = window.URL.createObjectURL(blobData);
          window.open('./lib/pdfjs/web/viewer.html?file=' + pdfUrl);
        }).catch(e => {
          console.log(e);
          this.$message.error(e);
        });
      }).catch(e => {});
    }
  },
  computed: {
    masterTable () {
      return this.form.tableMap.get(this.form.masterTableId);
    },
    isRelation () {
      return this.masterTable.relation != null;
    },
    formReadOnly () {
      if (this.dialogParams == null || this.dialogParams.readOnly == null) return (this.readOnly || false);
      return this.dialogParams.readOnly;
    },
    ...mapGetters(['getUserInfo'])
  }
}
