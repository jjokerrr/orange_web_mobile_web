<template>
  <div class="online-edit-form" style="position: relative; min-height: 200px; height: 100%;">
    <template v-if="dialogParams.fullscreen && !dialogParams.isEdit">
      <el-container>
        <el-header style="background: white; height: 72px;">
          <el-row type="flex" align="middle" style="height: 100%; width: 100%; justify-content: space-between;">
            <div style="height: 40px; line-height: 40px; display: flex">
              <i class="header-logo online-icon icon-orange-icon" style="font-size: 40px; color: #FDA834; background: rgba(255,119,0,0.1);" />
              <span style="font-size: 22px; color: #333333; font-weight: bold;">橙单</span>
              <el-divider direction="vertical" style="height: 26px; margin: 7px 8px;" />
              <span style="font-weight: bold; color: #333333; font-size: 18px;">{{form.formName}}</span>
            </div>
            <el-button type="text" size="small"
              icon="el-icon-close"
              style="font-size: 24px; color: #909399;"
              @click="onCancel(false)"
            />
          </el-row>
        </el-header>
        <el-main style="width: 100%; padding: 25px; background: #F9f9f9;">
          <el-row type="flex" justify="center" :style="{height: 'calc(100vh - ' + ((dialogParams.readOnly && (form.operationList || []).length <= 0) ? 122 : 192) + 'px)'}">
            <div style="background: white; width: 8000px; height: 100%; padding: 15px; max-width: 90vw;">
              <el-scrollbar style="height: 100%;" class="custom-scroll">
                <el-form ref="form" :model="formData" class="full-width-input"
                  :rules="rules" style="width: 100%;"
                  :label-width="(form.labelWidth || 100) + 'px'"
                  :label-position="form.labelPosition || 'right'"
                  :size="defaultFormItemSize"
                  @submit.native.prevent
                >
                  <OnlineCustomBlock v-show="isReady" ref="root" v-model="form.widgetList" height="100%" :isEdit="dialogParams.isEdit" :showBorder="false" @widgetClick="onWidgetClick" />
                </el-form>
              </el-scrollbar>
            </div>
          </el-row>
        </el-main>
        <el-footer v-if="!dialogParams.readOnly || (form.operationList || []).length > 0" style="background: white;" height="70px;">
          <el-row type="flex" justify="center" align="middle" style="height: 70px;">
            <el-button v-for="operation in form.operationList" :key="operation.id"
              size="small" style="margin-right: 16px;"
              :type="operation.btnType"
              :plain="operation.plain"
              @click="onOperationClick(operation)"
            >
              {{operation.name || SysCustomWidgetOperationType.getValue(operation.type)}}
            </el-button>
            <el-button v-if="!dialogParams.readOnly" type="primary" size="small" style="margin-right: 16px;"
              @click="onSubmit()">
              保存
            </el-button>
            <el-button size="small" :plain="true"
              @click="onCancel(false)">
              返回
            </el-button>
          </el-row>
        </el-footer>
      </el-container>
    </template>
    <template v-else>
      <div class="form-box"
        :style="{'min-height': dialogParams.isEdit ? height : '0px'}"
      >
        <el-scrollbar style="height: 100%;" class="custom-scroll">
          <el-form ref="form" :model="formData" class="full-width-input"
            :rules="rules" style="width: 100%;"
            :label-width="(form.labelWidth || 100) + 'px'"
            :label-position="form.labelPosition || 'right'"
            :size="defaultFormItemSize"
            @submit.native.prevent
          >
            <OnlineCustomBlock v-show="isReady" ref="root" :value="form.widgetList" @input="onInput" :height="height" :isEdit="dialogParams.isEdit" :showBorder="false" @widgetClick="onWidgetClick" />
          </el-form>
        </el-scrollbar>
      </div>
      <el-row v-if="!dialogParams.isEdit" class="menu-box" type="flex" justify="end">
        <el-button v-for="operation in form.operationList" :key="operation.id" :size="defaultFormItemSize"
          :type="operation.btnType"
          :plain="operation.plain"
          @click="onOperationClick(operation)"
        >
          {{operation.name || SysCustomWidgetOperationType.getValue(operation.type)}}
        </el-button>
        <el-button v-if="!dialogParams.readOnly" :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
          取消
        </el-button>
        <el-button v-if="!dialogParams.readOnly" type="primary" :size="defaultFormItemSize"
          @click="onSubmit()">
          保存
        </el-button>
      </el-row>
    </template>
  </div>
</template>

<script>
import { buildFormConfig } from '../utils.js';
import { OnlineFormMixins } from '../onlineFormMixins.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import widgetData from '../components/config/index.js';
import OnlineQueryForm from '../OnlineQueryForm/index.vue';
import OnlineEditForm from '../OnlineEditForm/index.vue';

export default {
  name: 'onlineEditForm',
  props: {
    formConfig: {
      type: Object
    },
    height: {
      type: String
    },
    // 主表数据
    masterTableData: {
      type: Object
    },
    // 是否表单编辑模式
    isEdit: {
      type: Boolean
    },
    // 是否复制
    isCopy: {
      type: Boolean
    },
    readOnly: {
      type: Boolean
    },
    // 当前选中组件
    currentWidget: {
      type: Object
    },
    // 需要编辑数据，如果是null则是新增
    rowData: {
      type: Object
    },
    // 是否全屏弹窗
    fullscreen: {
      type: Boolean
    },
    // 是否保存到数据库
    saveData: {
      type: Boolean,
      default: true
    }
  },
  mixins: [OnlineFormMixins, thirdPartyMixin],
  provide () {
    return {
      form: () => {
        return {
          ...this.form,
          isEdit: this.dialogParams.isEdit,
          readOnly: this.dialogParams.readOnly,
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
      isReady: false
    }
  },
  methods: {
    onInput (widgetList) {
      this.form.widgetList = widgetList;
    },
    onCancel (isSuccess = false, data) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, data);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, this.dialogParams.rowData, data);
      }
    },
    // 提交表单数据
    onSaveFormData () {
      debugger
      if (this.masterTable == null || this.masterTable.datasource == null) {
        this.$message.error('表单使用主数据源或主表不存在！');
        return;
      }
      let params = {
        datasourceId: this.masterTable.datasource.datasourceId,
        relationId: (this.masterTable.relation || {}).relationId,
        masterData: this.isRelation ? undefined : this.formData[this.masterTable.datasource.variableName]
      }
      if (this.isRelation) {
        // 从表数据添加或更新
        params.slaveData = {
          ...this.formData[this.masterTable.relation.variableName]
        }
        // 设置关联字段的值
        let slaveColumnValue = (this.dialogParams.masterTableData || {})[this.masterTable.relation.masterColumn.columnName];
        if (slaveColumnValue != null) {
          params.slaveData[this.masterTable.relation.slaveColumn.columnName] = slaveColumnValue;
        }
      } else {
        // 设置一对多从表数据
        params.slaveData = this.tableWidgetList.reduce((retObj, widget) => {
          if (widget.relation != null) {
            retObj[widget.relation.variableName] = this.formData[widget.relation.variableName];
          }
          return retObj;
        }, {});
      }

      // 执行提交数据前脚本
      if (!this.dialogParams.isEdit && typeof this.form.eventInfo[this.OnlineFormEventType.BEFORE_COMMIT_FORM_DATA] === 'function') {
        params = this.form.eventInfo[this.OnlineFormEventType.BEFORE_COMMIT_FORM_DATA](params);
      }

      // 把slaveData里的relationVariableName替换成relationId
      if (!this.isRelation && params.slaveData) {
        let slaveDataKeyList = Object.keys(params.slaveData);
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
              params.slaveData[relationId] = params.slaveData[key];
            }
            params.slaveData[key] = undefined;
          });
        }
      }

      let commitUrl;
      if (this.isRelation) {
        // 从表提交数据
        commitUrl = (this.dialogParams.rowData == null || this.dialogParams.isCopy) ? '/admin/online/onlineOperation/addOneToManyRelation/' : '/admin/online/onlineOperation/updateOneToManyRelation/';
      } else {
        // 主表提交数据
        commitUrl = (this.dialogParams.rowData == null || this.dialogParams.isCopy) ? '/admin/online/onlineOperation/addDatasource/' : '/admin/online/onlineOperation/updateDatasource/';
      }
      commitUrl += this.masterTable.datasource.variableName;
      this.doUrl(commitUrl, 'post', params).then(res => {
        this.$message.success('保存成功！');
        this.onCancel(true);
      }).catch(e => {});
    },
    // 提交
    onSubmit () {
      if (this.dialogParams.isEdit) return;
      if (Array.isArray(this.richEditWidgetList)) {
        this.richEditWidgetList.forEach(richWidget => {
          if (richWidget && richWidget.widgetImpl) {
            this.onValueChange(richWidget, richWidget.widgetImpl.getHtml());
          }
        });
      }
      this.$refs.form.validate(valid => {
        if (!valid) return;
        if (this.dialogParams.saveData) {
          // 非级联保存数据
          this.onSaveFormData();
        } else {
          // 级联添加返回表单数据到父表单
          if (!this.dialogParams.isEdit && typeof this.form.eventInfo[this.OnlineFormEventType.BEFORE_COMMIT_FORM_DATA] === 'function') {
            this.form.eventInfo[this.OnlineFormEventType.BEFORE_COMMIT_FORM_DATA](null);
          }
          this.onCancel(true, this.formData);
        }
      });
    },
    getCompoment (formConfig, widget) {
      if (widget != null && widget.widgetType === this.SysCustomWidgetType.Table) return OnlineEditForm;

      return formConfig.formType === this.SysOnlineFormType.QUERY ? OnlineQueryForm : OnlineEditForm
    },
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
    onOperationClick (operation) {
      let keyName;
      if (this.masterTable.relation == null) {
        keyName = this.masterTable.datasource.variableName;
      } else {
        keyName = this.masterTable.relation.variableName;
      }
      this.onPrint(operation, this.formData[keyName], this.form.formName + '.pdf');
    },
    loadRelationTableData (widget) {
      if (widget == null || widget.datasource == null || widget.relation == null) return Promise.reject();
      return new Promise((resolve, reject) => {
        let params = {
          datasourceId: widget.datasource.datasourceId,
          relationId: widget.relation.relationId,
          filterDtoList: [
            {
              tableName: widget.table.tableName,
              columnName: widget.relation.slaveColumn.columnName,
              filterType: this.SysOnlineColumnFilterType.EQUAL_FILTER,
              columnValue: (this.formData[widget.datasource.variableName] || {})[widget.relation.masterColumn.columnName]
            }
          ]
        }
        // 脱敏设置
        params.ignoreMaskFields = this.getIgnoreMaskFields(widget);
        if (!this.dialogParams.isEdit && typeof widget.eventInfo[this.OnlineFormEventType.BEFORE_LOAD_TABLE_DATA] === 'function') {
          params = widget.eventInfo[this.OnlineFormEventType.BEFORE_LOAD_TABLE_DATA](params);
        }
        if (params == null) {
          reject();
          return;
        }
        let httpCall = this.doUrl('/admin/online/onlineOperation/listByOneToManyRelationId/' + widget.datasource.variableName, 'post', params);
        httpCall.then(res => {
          if (!this.dialogParams.isEdit && typeof widget.eventInfo[this.OnlineFormEventType.AFTER_LOAD_TABLE_DATA] === 'function') {
            res.data.dataList = widget.eventInfo[this.OnlineFormEventType.AFTER_LOAD_TABLE_DATA](res.data.dataList);
          }
          // 复制数据，清空主键id以及自动编码字段
          if (this.dialogParams.isCopy) {
            let temp = new Date().getTime();
            let autoCodeColumnName = [];
            if (widget.table && Array.isArray(widget.table.columnList)) {
              widget.table.columnList.forEach(column => {
                if (column.fieldKind === this.SysOnlineFieldKind.AUTO_CODE) {
                  autoCodeColumnName.push(column.columnName);
                }
              });
            }
            res.data.dataList.forEach(item => {
              if (widget.primaryColumnName) item[widget.primaryColumnName] = undefined;
              item.__cascade_add_id__ = temp++;
              autoCodeColumnName.forEach(columnName => {
                item[columnName] = undefined;
              });
            });
          }
          this.formData[widget.relation.variableName] = res.data.dataList;
          resolve();
        }).catch(e => {
          reject(e);
        })
      });
    },
    clearFormData (data, columnList) {
      if (data == null || !Array.isArray(columnList)) return;
      columnList.forEach(columnName => {
        data[columnName] = undefined;
      });
    },
    initFormData () {
      if (this.dialogParams.rowData != null) {
        return new Promise((resolve, reject) => {
          // 如果是复制，清空主键以及自动编码字段
          let clearColumnList = [];
          if (this.dialogParams.isCopy && this.masterTable && Array.isArray(this.masterTable.columnList)) {
            this.masterTable.columnList.forEach(column => {
              if (column.primaryKey || column.fieldKind === this.SysOnlineFieldKind.AUTO_CODE) {
                clearColumnList.push(column.columnName);
              }
            });
          }
          if (this.isRelation) {
            this.formData[this.masterTable.relation.variableName] = {
              ...this.dialogParams.rowData
            }
            this.clearFormData(this.formData[this.masterTable.relation.variableName], clearColumnList);
            resolve();
          } else {
            // 初始化主表以及一对一字段数据
            let relationNameList = [];
            let datasourceName;
            this.form.tableMap.forEach(table => {
              if (table.relation && table.relation.relationType === this.SysOnlineRelationType.ONE_TO_ONE) {
                relationNameList.push(table.relation.variableName);
              } else if (table.relation == null) {
                datasourceName = table.datasource.variableName;
              }
            });
            Object.keys(this.dialogParams.rowData).forEach(key => {
              if (relationNameList.indexOf(key) === -1) {
                // 主表字段
                this.formData[datasourceName][key] = this.dialogParams.rowData[key];
              } else {
                // 从表字段
                if (this.dialogParams.rowData[key]) this.formData[key] = this.dialogParams.rowData[key];
              }
            });
            // 初始化一对多数据
            if (Array.isArray(this.tableWidgetList) && this.tableWidgetList.length > 0) {
              try {
                let httpCallList = this.tableWidgetList.map(widget => {
                  if (widget.relation && widget.relation.relationType === this.SysOnlineRelationType.ONE_TO_MANY) {
                    return this.loadRelationTableData(widget);
                  }
                  return null;
                }).filter(item => item != null);
                Promise.all(httpCallList).then(res => {
                  this.clearFormData(this.formData[datasourceName], clearColumnList);
                  resolve();
                }).catch(e => {
                  console.log(e);
                  this.clearFormData(this.formData[datasourceName], clearColumnList);
                  reject(e);
                });
              } catch (e) {
                console.log(e);
              }
            } else {
              this.clearFormData(this.formData[datasourceName], clearColumnList);
              resolve();
            }
          }
        });
      } else {
        return Promise.resolve();
      }
    }
  },
  computed: {
    dialogParams () {
      return {
        formConfig: this.formConfig || (this.thirdParams || {}).formConfig,
        rowData: this.rowData || (this.thirdParams || {}).rowData,
        masterTableData: this.masterTableData || (this.thirdParams || {}).masterTableData,
        isEdit: this.isEdit || (this.thirdParams || {}).isEdit || false,
        isCopy: this.isCopy || (this.thirdParams || {}).isCopy || false,
        readOnly: this.readOnly || (this.thirdParams || {}).readOnly || false,
        fullscreen: this.fullscreen || (this.thirdParams || {}).fullscreen || false,
        saveData: (this.thirdParams || {}).saveData == null ? this.saveData : (this.thirdParams || {}).saveData
      }
    },
    form () {
      let temp = buildFormConfig(this.dialogParams.formConfig);
      return temp;
    },
    rootWidget () {
      return {
        childWidgetList: this.form.widgetList
      }
    }
  },
  created () {
    this.isReady = false;
    if (!this.dialogParams.isEdit) {
      this.initPage();
      this.initFormWidgetList();
      this.initWidgetRule();
      if (!this.dialogParams.isEdit && typeof this.form.eventInfo[this.OnlineFormEventType.AFTER_CREATE_FORM] === 'function') {
        this.form.eventInfo[this.OnlineFormEventType.AFTER_CREATE_FORM]();
      }
      this.initFormData().then(() => {
        if (!this.dialogParams.isEdit && typeof this.form.eventInfo[this.OnlineFormEventType.AFTER_LOAD_FORM_DATA] === 'function') {
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
  .header-logo {
    border-radius: 8px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    width: 40px;
    background: rgba(255,119,0,0.1);
    margin-right: 8px;
    color: #FDA834;
    display: inline-block;
  }
  .el-divider--vertical {
    height: 26px;
    margin: 7px 15px;
  }
  .online-edit-form {
    display: flex;
    flex-direction: column;
  }
  .online-edit-form .info {
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
