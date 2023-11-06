<template>
  <div class="online-work-flow-form" style="position: relative; min-height: 200px; height: 100%;">
    <div class="form-box"
      :style="{'min-height': isEdit ? height : '0px'}"
    >
      <el-scrollbar style="height: 100%;" class="custom-scroll">
        <component :is="mode === 'pc' ? 'el-form' : 'van-form'"
          ref="form" :model="formData" class="full-width-input"
          :rules="rules" style="width: 100%;"
          :label-width="(form.labelWidth || 100) + 'px'"
          :label-position="form.labelPosition || 'right'"
          :size="defaultFormItemSize"
          @submit.native.prevent
        >
          <OnlineCustomBlock v-show="isReady" ref="root" v-model="form.widgetList" :variableDisplay="variableDisplay" :height="height" :isEdit="isEdit" :showBorder="false" @widgetClick="onWidgetClick" />
        </component>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import widgetData from '../components/config/index.js';
import { buildFormConfig } from '../utils.js';
import { OnlineFormMixins } from '../onlineFormMixins.js';
import { FlowOperationController } from '@/api/flowController.js';
import OnlineQueryForm from '../OnlineQueryForm/index.vue';
import OnlineEditForm from '../OnlineEditForm/index.vue';

export default {
  name: 'onlineWorkFlowForm',
  props: {
    // 增加接口
    variableDisplay: {
      type: Array,
      default: () => []
    },
    formConfig: {
      type: Object,
      required: true
    },
    height: {
      type: String
    },
    flowInfo: {
      type: Object
    },
    // 是否表单编辑模式
    isEdit: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    // 当前选中组件
    currentWidget: {
      type: Object
    },
    // 是否全屏弹窗
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  mixins: [OnlineFormMixins],
  provide () {
    return {
      form: () => {
        return {
          ...this.form,
          mode: this.mode,
          isEdit: this.isEdit,
          readOnly: this.readOnly,
          getWidgetValue: this.getWidgetValue,
          getWidgetVisible: this.getWidgetVisible,
          onValueChange: this.onValueChange,
          onWidgetValueChange: this.onWidgetValueChange,
          getTableData: this.getTableData,
          setTableData: this.setTableData,
          getPrimaryData: this.getPrimaryData,
          getDropdownParams: this.getDropdownParams,
          checkOperationPermCode: this.checkOperationPermCode,
          checkOperationDisabled: this.checkOperationDisabled,
          checkOperationVisible: this.checkOperationVisible,
          cloneWidget: this.cloneWidget,
          handlerOperation: this.handlerOperation,
          getDictDataList: this.getDictDataList,
          loadOnlineFormConfig: this.loadOnlineFormConfig,
          flowData: this.flowInfo,
          isActive: (widget) => {
            return this.currentWidget === widget;
          },
          getWidgetObject: widgetData.getWidgetObject
        }
      }
    }
  },
  data () {
    return {
      isReady: false,
      isStart: false,
      // 保存草稿后流程taskId
      draftTaskId: undefined,
      // 保存草稿后流程实例ID
      draftProcessInstanceId: undefined
    }
  },
  mounted () {
  },
  methods: {
    getTableData (widget) {
      return widget.relation ? this.formData[widget.relation.variableName] : [];
    },
    setTableData (widget, dataList) {
      if (widget == null) return;
      if (widget.relation) {
        this.formData[widget.relation.variableName] = dataList;
      }
    },
    onWidgetClick (widget) {
      this.$emit('widgetClick', widget);
    },
    getCompoment (formConfig, widget) {
      if (widget != null && widget.widgetType === this.SysCustomWidgetType.Table) return OnlineEditForm;
      
      return formConfig.formType === this.SysOnlineFormType.QUERY ? OnlineQueryForm : OnlineEditForm
    },
    initFormData () {
      if (this.flowInfo == null || this.flowInfo.processInstanceId == null) return Promise.resolve();
      return new Promise((resolve, reject) => {
        let params = {
          processInstanceId: this.flowInfo.processInstanceId,
          taskId: this.flowInfo.taskId
        }
        // 判断是展示历史流程的数据还是待办流程的数据
        let httpCall = null;
        if (this.isDraft) {
          // 草稿数据
          httpCall = FlowOperationController.viewOnlineDraftData(this, {
            processDefinitionKey: this.flowInfo.processDefinitionKey,
            processInstanceId: this.flowInfo.processInstanceId
          });
        } else if (this.flowInfo.messageId != null) {
          // 抄送消息
          httpCall = FlowOperationController.viewOnlineCopyBusinessData(this, {
            messageId: this.flowInfo.messageId
          });
        } else {
          // 脱敏设置，审批暂时不支持脱敏
          // params.ignoreMaskFields = this.getIgnoreMaskFields();
          httpCall = (this.flowInfo.taskId != null && this.flowInfo.isRuntime) ? FlowOperationController.viewUserTask(this, params) : FlowOperationController.viewHistoricProcessInstance(this, params);
        }
        httpCall.then(res => {
          this.isStart = (res.data == null);
          // 流程数据
          let masterData = (res.data || {})[this.masterTable.datasource.variableName] || {};
          // 初始化表单字段
          let relationNameList = new Map();
          let datasourceName;
          this.form.tableMap.forEach(table => {
            if (table.relation) {
              if (table.relation.relationType === this.SysOnlineRelationType.ONE_TO_ONE || this.isDraft) {
                relationNameList.set(table.relation.variableName, table.relation);
              } else {
                relationNameList.set(table.relation.variableName + 'List', table.relation);
              }
              this.formData[table.relation.variableName] = table.columnList.reduce((retObj, column) => {
                retObj[column.columnName] = undefined;
                return retObj;
              }, {});
            } else if (table.relation == null) {
              datasourceName = table.datasource.variableName;
            }
          });
          Object.keys(masterData).forEach(key => {
            let relation = relationNameList.get(key);
            let relationVariableName = (relation || {}).variableName;
            if (relationVariableName == null) {
              // 主表字段
              this.formData[datasourceName][key] = masterData[key];
            } else {
              // 从表字段
              if (relation.relationType === this.SysOnlineRelationType.ONE_TO_MANY && masterData[key]) {
                // 如果是一对多关联字段，判断表单上使用这个字段的table组件是否支持数据加载数据后脚本
                if (Array.isArray(this.tableWidgetList)) {
                  this.tableWidgetList.forEach(tableWidget => {
                    if (tableWidget.relation && tableWidget.relation.relationId === relation.relationId) {
                      if (typeof tableWidget.eventInfo[this.OnlineFormEventType.AFTER_LOAD_TABLE_DATA] === 'function') {
                        masterData[key] = tableWidget.eventInfo[this.OnlineFormEventType.AFTER_LOAD_TABLE_DATA](masterData[key]);
                      }
                    }
                  });
                }
              }
              if (masterData[key]) {
                if (!Array.isArray(masterData[key])) {
                  this.formData[relationVariableName] = {
                    ...this.formData[relationVariableName],
                    ...masterData[key]
                  };
                }
              }
            }
          });
          relationNameList = null;
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    getFormDataImpl (variableList) {
      let tempObj = {};
      // 获取表单数据
      this.form.tableMap.forEach(table => {
        if (table.relation) {
          if (tempObj.slaveData == null) tempObj.slaveData = {};
          tempObj.slaveData[table.relation.variableName] = this.formData[table.relation.variableName];
        } else if (table.relation == null) {
          tempObj.masterData = this.formData[table.datasource.variableName];
        }
      });
      // 获取流程变量
      if (Array.isArray(variableList)) {
        variableList.forEach(variable => {
          if (!variable.builtin) {
            let column = this.form.columnMap.get(variable.bindColumnId);
            let relation = this.form.relationMap.get(variable.bindRelationId);
            if (column != null) {
              if (tempObj.taskVariableData == null) tempObj.taskVariableData = {};
              if (relation == null) {
                tempObj.taskVariableData[variable.variableName] = this.formData[this.masterTable.datasource.variableName][column.columnName] || '';
              } else {
                tempObj.taskVariableData[variable.variableName] = this.formData[relation.variableName][column.columnName] || '';
              }
            }
          }
        });
      }

      // 执行提交数据前脚本
      if (!this.isEdit && typeof this.form.eventInfo[this.OnlineFormEventType.BEFORE_COMMIT_FORM_DATA] === 'function') {
        tempObj = this.form.eventInfo[this.OnlineFormEventType.BEFORE_COMMIT_FORM_DATA](tempObj);
      }
      if (tempObj == null) return null;
      // 把slaveData里的relationVariableName替换成relationId
      if (tempObj.slaveData) {
        let slaveDataKeyList = Object.keys(tempObj.slaveData);
        if (slaveDataKeyList.length > 0) {
          let relationVariableNameMap = new Map();
          this.form.tableMap.forEach(table => {
            if (table.relation != null) {
              relationVariableNameMap.set(table.relation.variableName, table.relation.relationId);
            }
          });
          slaveDataKeyList.forEach(key => {
            let relationId = relationVariableNameMap.get(key);
            if (relationId != null) {
              tempObj.slaveData[relationId] = tempObj.slaveData[key];
            }
            tempObj.slaveData[key] = undefined;
          });
        }
      }

      return tempObj;
    },
    getFormData (isDraft, variableList) {
      // 获取富文本内容
      if (Array.isArray(this.richEditWidgetList) && !this.readOnly) {
        this.richEditWidgetList.forEach(richWidget => {
          if (richWidget && richWidget.widgetImpl) {
            this.onValueChange(richWidget, richWidget.widgetImpl.getHtml());
          }
        });
      }
      return new Promise((resolve, reject) => {
        if (isDraft) {
          resolve(this.getFormDataImpl());
        } else {
          this.$nextTick(() => {
            this.$refs.form.validate(valid => {
              if (!valid) return reject();
              resolve(this.getFormDataImpl(variableList));
            });
          });
        }
      });
    }
  },
  computed: {
    form () {
      let temp = buildFormConfig(this.formConfig);
      return temp;
    },
    isDraft () {
      return this.flowInfo ? (this.flowInfo.isDraft || this.flowInfo.isDraft === 'true') : false
    },
    rootWidget () {
      return {
        childWidgetList: this.form.widgetList
      }
    }
  },
  created () {
    this.isReady = false;
    if (!this.isEdit) {
      this.initPage();
      this.initFormWidgetList();
      if (!this.isEdit && typeof this.form.eventInfo[this.OnlineFormEventType.AFTER_CREATE_FORM] === 'function') {
        this.form.eventInfo[this.OnlineFormEventType.AFTER_CREATE_FORM]();
      }
      this.initWidgetRule();
      this.initFormData().then(() => {
        if (!this.isEdit && typeof this.form.eventInfo[this.OnlineFormEventType.AFTER_LOAD_FORM_DATA] === 'function') {
          this.form.eventInfo[this.OnlineFormEventType.AFTER_LOAD_FORM_DATA]();
        }
        this.initWidgetLinkage();
      }).catch(e => {
        console.log(e);
      });
    }
    this.isReady = true;
  }
}
</script>

<style scoped>
  .online-work-flow-form {
    display: flex;
    flex-direction: column;
  }
  .online-work-flow-form .info {
    position: absolute;
    width: 100%;
    text-align: center;
    vertical-align: middle;
    top: 30%;
  }
  .form-box {
    flex-grow: 1;
    flex-shrink: 1;
    height: 300px;
  }
  .menu-box {
    flex-grow: 0;
    flex-shrink: 0;
  }
</style>
