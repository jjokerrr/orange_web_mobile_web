<template>
  <div class="form-design">
    <!-- 左侧菜单 -->
    <div class="left-menu">
      <div class="left-menu-item" :class="{active: activeLeftMenu === 'form'}"
        @click="activeLeftMenu = 'form'"
      >
        <div class="img-box">
          <img v-if="activeLeftMenu === 'form'" src="@/assets/img/document-active.png" alt="" style="width: 20px">
          <img v-else src="@/assets/img/document.png" alt="" style="width: 20px">
        </div>
        <span style="margin-top: 4px;">表单</span>
      </div>
      <div class="left-menu-item" :class="{active: activeLeftMenu === 'data'}"
        style="margin-top: 40px;"
        @click="activeLeftMenu = 'data'"
      >
        <div class="img-box">
          <img v-if="activeLeftMenu === 'data'" src="@/assets/img/datasource-active.png" alt="" style="width: 20px">
          <img v-else src="@/assets/img/datasource.png" alt="" style="width: 20px">
        </div>
        <span style="margin-top: 4px;">数据</span>
      </div>
    </div>
    <div class="left-panel">
      <template v-if="activeLeftMenu === 'form'">
        <!-- 表单管理 -->
        <el-card class="form-card base-card" shadow="never"
          :body-style="{ padding: '0px' }"
          style="border: none;"
        >
          <div slot="header" class="base-card-header">
            <i class="online-icon">
              <span>表单</span>
            </i>
            <div class="base-card-operation">
              <el-input class="round-search" prefix-icon="el-icon-search" size="small"
                v-model="filter.formName" clearable placeholder="表单名称查询"
                style="width: 140px; margin-right: 10px; border-radius: 16px;"
              />
              <el-button type="text" icon="el-icon-plus" size="small"
                style="font-size: 18px; color: #999999;"
                @click.stop="onCreateNewForm"
              />
            </div>
          </div>
          <el-row style="height: calc(100% - 65px);">
            <el-scrollbar style="height: 100%;">
              <el-col :span="24" style="padding: 0px 16px;">
                <el-row v-for="form in validFormList" :key="form.formId" :class="{active: form.formId === currentFormId}"
                  class="form-item" type="flex" align="middle" justify="space-between"
                >
                  <el-row class="form-item-title" type="flex" align="middle"
                    @click.native.stop="currentFormId = form.formId"
                  >
                    <span>{{form.formName}}</span>
                    <div class="tag">{{SysOnlineFormType.getValue(form.formType)}}</div>
                  </el-row>
                  <el-dropdown @command="(cmd) => handleFormCommand(form, cmd)">
                    <el-button class="font-item-menu" type="text" size="small" style="padding: 0;"
                    ><img class="font-item-menu" src="@/assets/img/more.png" alt="" style="width: 16px;height: 16px;vertical-align: middle;"></el-button>

                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="copy">复制</el-dropdown-item>
                      <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </el-row>
              </el-col>
            </el-scrollbar>
          </el-row>
        </el-card>
        <!-- 组件拖拽区域 -->
        <el-card class="base-card" shadow="never"
          :body-style="{ padding: '0px' }"
          style="border: none; margin-top: 10px; flex-grow: 1;"
        >
          <div slot="header" class="base-card-header">
            <i class="online-icon">
              <span>组件</span>
            </i>
            <div class="base-card-operation">
              <el-input class="round-search" prefix-icon="el-icon-search"
                v-model="filter.widgetName" clearable placeholder="组件名称查询"
                size="small" style="width: 140px;"
              />
            </div>
          </div>
          <el-row style="height: calc(100% - 65px);">
            <el-scrollbar style="height: 100%;">
              <el-col :span="24" style="padding: 0px 16px">
                <el-row class="widget-group" v-for="group in formValidWidgetGroup" :key="group.id">
                  <div class="group-title">{{group.groupName}}</div>
                  <Draggable class="group-widget-list" draggable=".group-widget-item" :list="group.widgetList"
                    :group="{ name: 'componentsGroup', pull: 'clone', put: false }"
                    :clone="cloneWidget"
                    :sort="false"
                  >
                    <div class="group-widget-item" v-for="widget in group.widgetList" :key="widget.id" @click="onAddWidget(widget)">
                      <div class="icon" :title="SysCustomWidgetType.getValue(widget.widgetType)">
                        <i class="" :class="widget.icon || ''" />
                      </div>
                      <div class="name">{{SysCustomWidgetType.getValue(widget.widgetType)}}</div>
                    </div>
                    <div style="width: 64px;"/>
                  </Draggable>
                </el-row>
              </el-col>
            </el-scrollbar>
          </el-row>
        </el-card>
      </template>
      <template v-else>
        <!-- 数据模型 -->
        <el-card class="data-card base-card" shadow="never"
          :body-style="{ padding: '0px' }"
          style="border: none; flex-grow: 1;"
        >
          <div slot="header" class="base-card-header">
            <i class="online-icon">
              <span>数据</span>
            </i>
            <div class="base-card-operation">
              <el-input class="round-search" prefix-icon="el-icon-search"
                v-model="filter.fieldName" clearable placeholder="字段名称查询"
                size="small" style="width: 140px;"
              />
            </div>
          </div>
          <el-row style="height: calc(100% - 65px);">
            <el-scrollbar style="height: 100%;">
              <el-collapse v-model="activeDataTable" :accordion="true">
                <el-collapse-item v-for="table in validTableList" :key="table.id"
                  :title="table.tableName" :name="table.id"
                >
                  <el-row slot="title" class="data-column-title" type="flex" align="middle">
                    <span>{{table.tableName}}</span>
                    <el-tag :type="getRelationType(table.relationType)" size="small" style="margin-top: 5px">
                      {{SysOnlineRelationType.getValue(table.relationType) || '数据主表'}}
                    </el-tag>
                  </el-row>
                  <el-row class="table-column-item" v-for="column in table.columnList" :key="column.columnId"
                    type="flex" justify="space-between" align="middle"
                  >
                    <el-link :disabled="column.aggregationColumn" style="max-width: 130px;"
                      @click="onEditTableColumn(table, column)"
                    >
                      {{column.columnName}}
                    </el-link>
                    <div>
                      <i class="flag online-icon icon-filter"
                        :class="{active: column.filterType !== SysOnlineColumnFilterType.NONE}"
                        :title="SysOnlineColumnFilterType.getValue(column.filterType)"
                      />
                      <i class="flag online-icon icon-relation" style="margin-left: 5px;"
                        :class="{active: column.dictId != null}"
                        :title="getDictName(column.dictId)"
                      />
                    </div>
                  </el-row>
                </el-collapse-item>
              </el-collapse>
            </el-scrollbar>
          </el-row>
        </el-card>
      </template>
    </div>
    <div class="design-panel">
      <el-row type="flex" justify="space-between" align="middle" style="height: 48px">
        <div style="font-size: 18px;">
          <i class="device-item online-icon icon-phone" :class="{active: activeMode === 'mobile', disabled: ((currentForm || {}).formType === SysOnlineFormType.ADVANCE_QUERY)}" title="手机端" @click="onActiveModeChange('mobile')" />
          <i class="device-item online-icon icon-pc" :class="{active: activeMode === 'pc'}" title="PC 端" @click="onActiveModeChange('pc')" />
        </div>
        <el-button type="text" size="small" icon="el-icon-refresh"
          style="font-size: 12px; color: #999999;font-weight: normal;"
          @click="onClearWidget"
        >重置表单</el-button>
      </el-row>
      <div class="design-box" :key="currentFormId">
        <div style="max-width: 100%;"
          :style="getDesignBoxStyle"
          @click="onFormClick"
        >
          <!-- 基础查询页面 -->
          <OnlineQueryForm v-if="(currentForm || {}).formType === SysOnlineFormType.QUERY && activeMode === 'pc'"
            height="100%" :isEdit="true" :mode="activeMode"
            :formConfig="currentForm[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
            @widgetClick="onWidgetClick"
          />
          <OnlineMobileQueryForm v-if="(currentForm || {}).formType === SysOnlineFormType.QUERY && activeMode === 'mobile'"
            height="100%" :isEdit="true" :mode="activeMode"
            :formConfig="currentForm[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
            @widgetClick="onWidgetClick"
          />
          <!-- 左树右表页面 -->
          <OnlineAdvanceQueryForm v-if="(currentForm || {}).formType === SysOnlineFormType.ADVANCE_QUERY"
            height="100%" :isEdit="true" :mode="activeMode"
            :formConfig="currentForm[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
            @widgetClick="onWidgetClick"
          />
          <!-- 一对一查询页面 -->
          <OnlineOneToOneQueryForm v-if="(currentForm || {}).formType === SysOnlineFormType.ONE_TO_ONE_QUERY && activeMode === 'pc'"
            height="100%" :isEdit="true" :mode="activeMode"
            :formConfig="currentForm[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
            @widgetClick="onWidgetClick"
          />
          <OnlineMobileQueryForm v-if="(currentForm || {}).formType === SysOnlineFormType.ONE_TO_ONE_QUERY && activeMode === 'mobile'"
            height="100%" :isEdit="true" :mode="activeMode"
            :formConfig="currentForm[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
            @widgetClick="onWidgetClick"
          />
          <!-- 编辑表单 -->
          <OnlineEditForm v-if="(currentForm || {}).formType === SysOnlineFormType.FORM"
            :height="(getClientHeight - 235) + 'px'" :isEdit="true" :mode="activeMode"
            :formConfig="currentForm[activeMode]"
            :currentWidget="currentWidget"
            @widgetClick="onWidgetClick"
          />
          <!-- 流程表单 -->
          <OnlineWorkFlowForm v-if="(currentForm || {}).formType === SysOnlineFormType.FLOW"
            :height="(getClientHeight - 235) + 'px'" :isEdit="true" :mode="activeMode"
            :formConfig="currentForm[activeMode]"
            :currentWidget="currentWidget"
            @widgetClick="onWidgetClick"
          />
          <!-- 工单列表页面 -->
          <OnlineWorkOrderForm v-if="(currentForm || {}).formType === SysOnlineFormType.WORK_ORDER && activeMode === 'pc'"
            height="100%" :isEdit="true" :mode="activeMode"
            :formConfig="currentForm[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
          />
          <OnlineMobileWorkOrderForm v-if="(currentForm || {}).formType === SysOnlineFormType.WORK_ORDER && activeMode === 'mobile'"
            height="100%" :isEdit="true" :mode="activeMode"
            :formConfig="currentForm[activeMode]"
            :currentWidget="currentWidget"
            @tableClick="onWidgetClick"
            @widgetClick="onWidgetClick"
          />
        </div>
      </div>
    </div>
    <div class="attribute-panel">
      <el-tabs v-model="rightActive">
        <el-tab-pane label="属性" name="props">
          <span slot="label">属性</span>
          <el-scrollbar :style="{height: (getClientHeight - 138) + 'px'}">
            <el-row style="padding: 10px 16px;">
              <template v-if="currentWidget != null">
                <CustomWidgetBindData v-model="currentWidget" />
                <CustomWidgetAttributeSetting class="attribute-setting" v-model="currentWidget.props"
                  :widget="currentWidget" :allFormList="allFormList" />
              </template>
              <CustomFormSetting v-else-if="currentForm != null && currentForm[activeMode]" />
            </el-row>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="操作" name="operate"
          v-if="showOperationTab"
        >
          <span slot="label">操作</span>
          <el-scrollbar :style="{height: (getClientHeight - 138) + 'px'}">
            <!-- 组件操作 -->
            <CustomFormOperateSetting v-if="currentWidget != null && currentForm.formType !== SysOnlineFormType.QUERY && currentForm.formType !== SysOnlineFormType.ADVANCE_QUERY"
              style="padding: 10px 16px"
              :formList="allFormList"
              :tableList="getValidTableList"
              v-model="currentWidget.operationList"
            />
            <!-- 表单操作 -->
            <CustomFormOperateSetting
              v-if="
                currentForm != null &&
                (
                  currentWidget == null ||
                  currentForm.formType === SysOnlineFormType.QUERY ||
                  currentForm.formType === SysOnlineFormType.ADVANCE_QUERY
                )
              "
              style="padding: 10px 16px"
              :formList="allFormList"
              :tableList="getValidTableList"
              v-model="currentForm[activeMode].operationList"
            />
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="脚本" name="script">
          <span slot="label">脚本</span>
          <el-scrollbar :style="{height: (getClientHeight - 138) + 'px'}">
            <el-row style="padding: 10px 16px;">
              <CustomEventSetting v-if="currentWidget != null"
                v-model="currentWidget.eventList"
                :allowEventList="widgetAllowEventList"
                :formConfig="buildFormConfig"
              />
              <CustomEventSetting v-else-if="currentForm != null"
                v-model="currentForm[activeMode].formEventList"
                :allowEventList="formAllowEventList"
                :formConfig="buildFormConfig"
              />
            </el-row>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { findItemFromList } from '@/utils';
import Draggable from 'vuedraggable';
import { mapGetters } from 'vuex';
import { getFormConfig } from '../OnlineFormConfig/index.js';
import CustomFormSetting from './components/CustomFormSetting.vue';
import CustomWidgetBindData from './components/CustomWidgetBindData.vue';
import CustomWidgetAttributeSetting from './components/CustomWidgetAttributeSetting.vue';
import CustomFormOperateSetting from './components/CustomFormOperateSetting.vue';
import CustomEventSetting from '@/online/components/CustomEventSetting/index.vue';
import widgetData from '../OnlinePageRender/components/config/index.js';
import OnlineQueryForm from '../OnlinePageRender/OnlineQueryForm/index.vue';
import OnlineMobileQueryForm from '../OnlinePageRender/OnlineMobileQueryForm/index.vue';
import OnlineMobileWorkOrderForm from '../OnlinePageRender/OnlineMobileWorkOrderForm/index.vue';
import OnlineOneToOneQueryForm from '../OnlinePageRender/OnlineOneToOneForm/index.vue';
import OnlineAdvanceQueryForm from '../OnlinePageRender/OnlineAdvanceQueryForm/index.vue';
import OnlineWorkOrderForm from '../OnlinePageRender/OnlineWorkOrderForm/index.vue';
import OnlineWorkFlowForm from '../OnlinePageRender/OnlineWorkFlowForm/index.vue';
import OnlineEditForm from '../OnlinePageRender/OnlineEditForm/index.vue';
import EditTableColumn from './editTableColumn.vue';
import { OnlineColumnController, OnlineVirtualColumnController } from '@/api/onlineController.js';

export default {
  name: 'formDesign',
  props: {
    height: {
      type: Number
    },
    pageType: {
      type: Number
    },
    // 表单可用数据表
    tableList: {
      type: Array,
      default: () => []
    },
    // 表单可用组件
    widgetGroup: {
      type: Object,
      default: () => {}
    },
    // 表单组件树
    formWidgetList: {
      type: Array,
      default: () => []
    },
    // 所有表单
    allFormList: {
      type: Array,
      default: () => []
    },
    dictList: {
      type: Array,
      default: () => []
    }
  },
  components: {
    Draggable,
    CustomFormSetting,
    CustomWidgetBindData,
    CustomWidgetAttributeSetting,
    CustomFormOperateSetting,
    CustomEventSetting,
    OnlineQueryForm,
    OnlineAdvanceQueryForm,
    OnlineOneToOneQueryForm,
    OnlineWorkFlowForm,
    OnlineWorkOrderForm,
    // 移动端表单
    OnlineMobileQueryForm,
    OnlineMobileWorkOrderForm,
    OnlineEditForm
  },
  provide () {
    return {
      formConfig: () => {
        return this.formConfig
      }
    }
  },
  data () {
    return {
      filter: {
        formName: undefined,
        widgetName: undefined,
        fieldName: undefined
      },
      activeLeftMenu: 'form',
      rightActive: 'props',
      activeDataTable: undefined,
      activeMode: 'pc',
      currentFormId: undefined,
      currentWidget: undefined
    }
  },
  methods: {
    onActiveModeChange (mode) {
      if (mode !== 'pc' && (this.currentForm || {}).formType === this.SysOnlineFormType.ADVANCE_QUERY) {
        // 移动端不支持左树右表类型页面
        return;
      }
      this.activeMode = mode;
      this.refreshFormInfo();
    },
    saveForm () {
      this.$emit('updateForm', this.currentForm);
    },
    onCreateNewForm () {
      this.$emit('createForm');
    },
    handleFormCommand (form, cmd) {
      if (cmd === 'copy') {
        this.$emit('cloneForm', form);
      } else if (cmd === 'delete') {
        this.$emit('deleteForm', form);
      }
    },
    onClearWidget () {
      this.$confirm('是否重置表单？').then(res => {
        if (this.currentForm && this.currentForm[this.activeMode]) this.currentForm[this.activeMode].widgetList = [];
      }).catch(e => {});
    },
    onWidgetClick (widget) {
      this.rightActive = 'props';
      this.currentWidget = widget;
    },
    onQueryTableClick (widget) {
      this.rightActive = 'props';
      this.currentWidget = widget;
    },
    onFormClick () {
      this.rightActive = 'props';
      this.currentWidget = null;
    },
    cloneWidget (widget) {
      let temp = widgetData.getWidgetObject(widget);
      if (this.activeMode === 'mobile') {
        temp.props.span = 24;
      }
      this.$set(temp, 'relation', undefined);
      this.$set(temp, 'datasource', undefined);
      this.$set(temp, 'column', undefined);
      return temp;
    },
    onAddWidget (widget) {
      if (this.currentWidget != null && (this.currentWidget.widgetType === this.SysCustomWidgetType.Block || this.currentWidget.widgetType === this.SysCustomWidgetType.Card)) {
        this.currentWidget.childWidgetList.push(this.cloneWidget(widget));
      } else {
        if (this.currentForm && this.currentForm[this.activeMode]) {
          this.currentForm[this.activeMode].widgetList.push(this.cloneWidget(widget));
        }
      }
    },
    getRelationType (relationType) {
      switch (relationType) {
        case this.SysOnlineRelationType.ONE_TO_ONE: return 'primary';
        case this.SysOnlineRelationType.ONE_TO_MANY: return 'warning';
        default: return 'success';
      }
    },
    getDictInfo (dictId) {
      return findItemFromList(this.dictList, dictId, 'dictId');
    },
    getDictName (dictId) {
      let dictInfo = this.getDictInfo(dictId);
      return dictInfo ? dictInfo.dictName : '未绑定字典';
    },
    formatColumnRelationFlag (table) {
      // 所有关联从表
      let relationTableList = this.getAllTableList.filter(table => {
        return table.relationType != null;
      });

      if (Array.isArray(table.columnList)) {
        table.columnList.forEach(column => {
          column.oneToOnyRelationColumn = false;
          column.oneToManyRelationColumn = false;
          // 主表字段判断这个字段是否和从表关联
          if (table.relationType == null) {
            relationTableList.forEach(relationTable => {
              let relation = relationTable.tag;
              if (relation && relation.masterColumnId === column.columnId) {
                column.oneToOnyRelationColumn = column.oneToOnyRelationColumn || relation.relationType === this.SysOnlineRelationType.ONE_TO_ONE;
                column.oneToManyRelationColumn = column.oneToManyRelationColumn || relation.relationType === this.SysOnlineRelationType.ONE_TO_MANY;
              }
            });
          }
        });
      }
    },
    refreshColumn (table, column) {
      let params = {
        onlineColumnDtoFilter: {
          tableId: column.tableId
        }
      };
      OnlineColumnController.list(this, params).then(res => {
        let columnList = res.data.dataList.map(item => {
          return {
            ...item,
            required: !item.nullable,
            uploadFileSystemType: item.uploadFileSystemType || 0
          }
        });
        let temp = findItemFromList(this.getAllTableList, table.id, 'id');
        if (temp) {
          temp.columnList = columnList;
          this.formatColumnRelationFlag(temp);
        }
      }).catch(e => {});
    },
    onEditTableColumn (table, column) {
      this.$dialog.show('编辑字段', EditTableColumn, {
        area: ['650px']
      }, {
        rowData: column,
        dictList: this.dictList,
        isMasterTable: this.getMasterTable.relation == null,
        path: 'thirdEditTableColumn'
      }, {
        width: '650px',
        height: '600px',
        pathName: '/thirdParty/thirdEditTableColumn'
      }).then(res => {
        this.refreshColumn(table, column);
      }).catch(e => {
        console.log(e);
      });
    },
    formatWidget (widget) {
      this.$set(widget, 'datasource', undefined);
      this.$set(widget, 'relation', undefined);
      this.$set(widget, 'column', undefined);
      if (widget.bindData && widget.bindData.tableId != null) {
        widget.bindData.table = findItemFromList(this.getAllTableList, widget.bindData.tableId, 'tableId');
        if (widget.bindData.table) {
          if (widget.bindData.table.relationType == null) {
            widget.datasource = widget.bindData.table.tag;
          } else {
            widget.relation = widget.bindData.table.tag;
            widget.datasource = findItemFromList(this.getAllTableList, widget.relation.datasourceId, 'id');
          }
        }
        if (widget.bindData.table && widget.bindData.columnId) {
          widget.bindData.column = findItemFromList(widget.bindData.table.columnList, widget.bindData.columnId, 'columnId');
          widget.column = widget.bindData.column;
        }
      }
      if (widget.props && widget.props.dictInfo && widget.props.dictInfo.dictId) {
        widget.props.dictInfo.dict = findItemFromList(this.dictList, widget.props.dictInfo.dictId, 'dictId');
      }
      if (widget.props && Array.isArray(widget.props.tableColumnList)) {
        widget.props.tableColumnList.forEach(tableColumn => {
          tableColumn.table = findItemFromList(this.getAllTableList, tableColumn.tableId, 'tableId');
          if (tableColumn.table && Array.isArray(tableColumn.table.columnList)) tableColumn.column = findItemFromList(tableColumn.table.columnList, tableColumn.columnId, 'columnId');
        });
      }
      if (Array.isArray(widget.childWidgetList)) {
        widget.childWidgetList.forEach(subWidget => {
          this.formatWidget(subWidget);
        })
      }
    },
    loadVirtualColumnList () {
      let params = {
        onlineVirtualColumnDtoFilter: {
          datasourceId: this.currentDatasource.id
        }
      }

      OnlineVirtualColumnController.list(this, params).then(res => {
        this.currentDatasource.columnList = this.currentDatasource.columnList.filter(item => !item.aggregationColumn);
        this.currentDatasource.columnList.push(...res.data.dataList.map(item => {
          return {
            aggregationColumn: true,
            autoIncrement: false,
            columnComment: item.columnPrompt,
            columnId: item.virtualColumnId,
            virtualColumnId: item.virtualColumnId,
            columnName: item.objectFieldName,
            columnType: item.objectFieldType,
            deptFilter: false,
            userFilter: false,
            filterType: 0,
            fullColumnType: item.objectFieldType,
            nullable: true,
            numericPrecision: 19,
            objectFieldName: item.objectFieldName,
            objectFieldType: item.objectFieldType,
            parentKey: false,
            primaryKey: false,
            tableId: this.currentDatasource.tableId,
            tag: item
          }
        }));
      }).catch(e => {});
    },
    refreshFormInfo () {
      this.currentWidget = undefined;
      if (this.currentForm != null) {
        if (this.currentForm.formType === this.SysOnlineFormType.ADVANCE_QUERY) this.activeMode = 'pc';
        if (Array.isArray(this.currentForm[this.activeMode].widgetList)) {
          if (this.currentForm[this.activeMode].tableWidget) {
            this.formatWidget(this.currentForm[this.activeMode].tableWidget);
            this.$set(this.currentForm[this.activeMode].tableWidget, 'supportOperation', true);
          }
          if (this.currentForm[this.activeMode].leftWidget) this.formatWidget(this.currentForm[this.activeMode].leftWidget);
          this.currentForm[this.activeMode].widgetList.forEach(widget => {
            this.formatWidget(widget);
          });
        }
      }
    }
  },
  computed: {
    formConfig () {
      return {
        form: this.currentForm[this.activeMode],
        activeMode: this.activeMode,
        currentWidget: this.currentWidget,
        getMasterTable: this.getMasterTable,
        getAllTableList: this.getAllTableList,
        getValidTableList: this.getValidTableList,
        getTableWidgetTableList: this.getTableWidgetTableList,
        getWidgetAttribute: widgetData.getWidgetAttribute,
        getWidgetObject: widgetData.getWidgetObject,
        dictList: this.dictList
      }
    },
    buildFormConfig () {
      let formConfig = this.formConfig;
      return {
        form: {
          formType: formConfig.form.formType,
          customFieldList: formConfig.form.customFieldList
        },
        getMasterTable: {
          relationType: formConfig.getMasterTable.relationType,
          tag: {
            datasourceName: formConfig.getMasterTable.tag.datasourceName,
            relationName: formConfig.getMasterTable.tag.relationName,
            variableName: formConfig.getMasterTable.tag.variableName
          },
          columnList: formConfig.getMasterTable.columnList.map(column => {
            return {
              filterType: column.filterType,
              columnComment: column.columnComment,
              columnName: column.columnName,
              columnId: column.columnId
            }
          })
        },
        getAllTableList: formConfig.getAllTableList.map(table => {
          return {
            relationType: table.relationType,
            tag: {
              datasourceName: table.tag.datasourceName,
              relationName: table.tag.relationName,
              variableName: table.tag.variableName
            },
            columnList: table.columnList.map(column => {
              return {
                filterType: column.filterType,
                columnComment: column.columnComment,
                columnName: column.columnName,
                columnId: column.columnId
              }
            })
          }
        })
      }
    },
    validFormList () {
      return this.allFormList.filter(form => {
        return this.filter.formName == null || this.filter.formName === '' || form.formName.indexOf(this.filter.formName) !== -1;
      });
    },
    validTableList () {
      return this.getAllTableList.map(table => {
        return {
          ...table,
          columnList: table.columnList.filter(column => {
            return this.filter.fieldName == null || this.filter.fieldName === '' || column.columnName.indexOf(this.filter.fieldName) !== -1;
          })
        }
      });
    },
    currentDatasource () {
      for (let i = 0; i < this.getAllTableList.length; i++) {
        if (this.getAllTableList[i].relationType == null) {
          return this.getAllTableList[i];
        }
      }
      return null;
    },
    currentForm () {
      return findItemFromList(this.allFormList, this.currentFormId, 'formId');
    },
    getMasterTable () {
      if (this.currentForm != null) {
        return findItemFromList(this.getAllTableList, this.currentForm.masterTableId, 'tableId');
      } else {
        return null;
      }
    },
    getAllTableList () {
      return (this.tableList || []).map(item => {
        return {
          ...item,
          showName: item.tag.variableName,
          isTable: true,
          children: item.columnList.map(column => {
            return {
              ...column,
              id: column.columnId,
              showName: column.objectFieldName
            }
          })
        }
      });
    },
    getValidTableList () {
      if (this.getMasterTable == null) return [];
      if (this.getMasterTable.relationType == null) {
        // 返回主表以及一对一从表
        return this.getAllTableList.filter(table => {
          return table.relationType == null || table.relationType === this.SysOnlineRelationType.ONE_TO_ONE;
        });
      } else {
        // 仅返回从表
        return this.getAllTableList.filter(table => {
          return table.tableId === this.getMasterTable.tableId;
        });
      }
    },
    getTableWidgetTableList () {
      if (this.getMasterTable == null) return [];
      if (this.getMasterTable.relationType == null) {
        return this.getAllTableList.filter(table => {
          if (this.currentForm.formType === this.SysOnlineFormType.QUERY || this.currentForm.formType === this.SysOnlineFormType.ADVANCE_QUERY) {
            // 主表查询页面返回，主表以及一对一从表
            return table.relationType == null || table.relationType === this.SysOnlineRelationType.ONE_TO_ONE;
          } else if (this.currentForm.formType === this.SysOnlineFormType.WORK_ORDER) {
            // 工单列表页面返回主表
            return table.relationType == null;
          } else {
            // 返回一对多从表
            return table.relationType === this.SysOnlineRelationType.ONE_TO_MANY;
          }
        });
      } else if (this.currentForm.formType === this.SysOnlineFormType.QUERY || this.currentForm.formType === this.SysOnlineFormType.ONE_TO_ONE_QUERY || this.currentForm.formType === this.SysOnlineFormType.ADVANCE_QUERY) {
        return this.getAllTableList.filter(table => {
          return table.id === this.getMasterTable.id;
        });
      }
      return [];
    },
    formValidWidgetGroup () {
      let tempGroupList = JSON.parse(JSON.stringify(this.widgetGroup[this.activeMode] || []));
      let tempList = (tempGroupList || []).filter(group => {
        if (this.currentForm == null) return true;
        if (this.currentForm.formType === this.SysOnlineFormType.QUERY || this.currentForm.formType === this.SysOnlineFormType.ADVANCE_QUERY) {
          if (group.id === 'base') {
            // 查询页面过滤掉列表组件
            group.widgetList = group.widgetList.filter(widget => {
              return widget.widgetType !== this.SysCustomWidgetType.List;
            })
          }
          return group.id === 'filter' || this.activeMode === 'mobile';
        } else {
          return group.id !== 'filter';
        }
      });

      return tempList.map(item => {
        return {
          ...item,
          widgetList: item.widgetList.filter(widget => {
            if (this.currentForm == null) return true;
            // 查询过滤
            let isMatch = true;
            if (this.filter.widgetName != null && this.filter.widgetName !== '') {
              isMatch = this.SysCustomWidgetType.getValue(widget.widgetType).indexOf(this.filter.widgetName) !== -1;
            }
            return isMatch;
          })
        }
      });
    },
    widgetAllowEventList () {
      if (this.currentWidget == null) return [];
      return (widgetData.getWidgetAttribute(this.currentWidget.widgetType, this.activeMode) || {}).allowEventList || [];
    },
    formAllowEventList () {
      if (this.currentForm == null) return [];
      let temp = (getFormConfig(this.currentForm.formType, this.pageType) || {})[this.activeMode];
      return temp ? temp.allowEventList : [];
    },
    showOperationTab () {
      if (this.currentWidget != null) {
        return this.currentWidget.widgetType === this.SysCustomWidgetType.Table
          ? this.currentForm.formType !== this.SysOnlineFormType.ONE_TO_ONE_QUERY : this.currentWidget.supportOperation;
      } else {
        if (this.currentForm && this.currentForm[this.activeMode]) {
          return this.currentForm[this.activeMode].supportOperation;
        }
      }
      return false;
    },
    currentOperationList () {
      if (this.currentWidget != null) {
        if (this.currentWidget.operationList == null) this.$set(this.currentWidget, 'operationList', []);
        return this.currentWidget.operationList;
      } else {
        if (this.currentForm != null) {
          if (this.currentForm[this.activeMode] == null) this.$set(this.currentForm[this.activeMode], 'operationList', []);
          return this.currentForm[this.activeMode].operationList;
        }
      }
      return null;
    },
    getDesignBoxStyle () {
      let width, padding, background;
      let formInfo = (this.currentForm || {})[this.activeMode] || {};
      if (this.activeMode === 'pc') {
        width = (this.currentForm == null || formInfo.fullscreen) ? '100%' : ((formInfo.width || 600) + 'px');
        padding = [this.SysOnlineFormType.ADVANCE_QUERY, this.SysOnlineFormType.QUERY, this.SysOnlineFormType.ONE_TO_ONE_QUERY, this.SysOnlineFormType.WORK_ORDER].indexOf((this.currentForm || {}).formType) !== -1 ? '0px' : '25px';
        background = [this.SysOnlineFormType.ADVANCE_QUERY, this.SysOnlineFormType.QUERY, this.SysOnlineFormType.ONE_TO_ONE_QUERY, this.SysOnlineFormType.WORK_ORDER].indexOf((this.currentForm || {}).formType) !== -1 ? undefined : 'white';
      } else {
        width = '375px';
        padding = '0px';
        background = undefined;
      }
      return {
        width,
        padding,
        background,
        border: this.activeMode === 'pc' ? undefined : '1px solid #E8E8E8'
      }
    },
    ...mapGetters(['getClientHeight'])
  },
  watch: {
    currentForm: {
      handler () {
        this.refreshFormInfo();
      }
    },
    allFormList: {
      handler () {
        if (Array.isArray(this.allFormList) && this.allFormList.length > 0 && this.currentForm == null) {
          this.currentFormId = this.allFormList[0].formId;
        }
      },
      immediate: true
    },
    getAllTableList: {
      handler () {
        if (Array.isArray(this.getAllTableList) && this.getAllTableList.length > 0) {
          this.getAllTableList.forEach(table => {
            this.formatColumnRelationFlag(table);
          })
          let current = findItemFromList(this.getAllTableList, this.activeDataTable, 'id');
          if (current == null) this.activeDataTable = this.getAllTableList[0].id;
        } else {
          this.activeDataTable = undefined;
        }
      },
      immediate: true
    }
  },
  mounted () {
    this.loadVirtualColumnList();
  }
}
</script>

<style lang="scss" scoped>
  @import '@/assets/style/element-variables.scss';

  .form-design {
    display: flex;
    height: 100%;
  }

  .form-design .attribute-panel ::v-deep .el-form-item{
    margin-bottom: 12px;
  }
  .form-design .left-menu {
    width: 48px;
    height: 100%;
    padding: 23px 0px;
    background: #2D3039;
  }

  .form-design .left-menu .left-menu-item {
    display: flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    color: white;
    font-size: 14px;
    font-weight: 400;
    text-align: center;
    cursor: pointer;
    color: #A4A5A7;
  }

  .form-design .left-menu .left-menu-item.active {
    color: $--color-primary;
  }

  .form-design .left-panel {
    display: flex;
    flex-direction: column;
    width: 240px;
    height: 100%;

    .form-card {
      flex-grow: 0;
      flex-shrink: 0;
      height: 280px;
    }

    .base-card-header {
      height: 56px;
      line-height: 56px;

      i {
        font-size: 14px;
        color: #999999;

        span {
          color: #333333;
          font-size: 14px;
          font-weight: bold;
        }
      }
    }
  }

  .form-item {
    height: 44px;
    .form-item-title {
      span {
        font-size: 12px;
        color: #333333;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100px;
        cursor: pointer;
      }
      .tag {
        font-size: 12px;
        padding: 3px 8px;
        background: #F6F7F9;
        color: #999999;
        margin-left: 8px;
        border-radius: 4px;
      }
    }
    .font-item-menu {
      font-size: 18px;
      color: #999999;
    }
  }
  .form-item.active {
    .form-item-title {
      span {
        color: $--color-primary;
      }
      .tag {
        background: #FFF8E5;
        color: #FFB800;
      }
    }
  }
  .widget-group {
    .group-title {
      font-weight: bold;
      color: #333333;
      height: 44px;
      line-height: 44px;
    }
    .group-widget-list {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;

      .group-widget-item {
        margin-bottom: 10px;
        .icon {
          font-size: 26px;
          text-align: center;
          width: 64px;
          height: 64px;
          color: #666666;
          cursor: pointer;
          line-height: 64px;
          border-radius: 4px;
          border: 1px solid #E8E8E8;
        }

        .icon:hover {
          background: #F6F7F9;
        }

        .name {
          width: 64px;
          height: 26px;
          line-height: 26px;
          text-align: center;
          font-size: 12px;
          font-weight: 400;
          color: #666666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .design-panel {
    flex-grow: 1;
    width: 200px;
    padding: 0px 24px 24px;

    .design-box {
      display: flex;
      justify-content: center;
      // background: white;
      width: 100%;
      height: calc(100% - 48px);
      // border: 1px solid #E8E8E8;
      // padding: 25px;
    }
  }

  .attribute-panel {
    width: 288px;
    flex-grow: 0;
    flex-shrink: 0;
    background: white;
  }

  .data-card .data-column-title {
    color: black;
    font-size: 14px;
    font-weight: 400;
    padding-left: 16px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 185px;
      font-weight: normal;
    }
  }
  ::v-deep .el-collapse-item__header{
    height: auto !important;
    line-height: 20px !important;
    padding: 8px 0 !important;
  }
  .data-card .table-column-item {
    height: 44px;
    padding: 0px 16px;
    font-size: 14px;
    color: #666666;
    .online-icon{
      color: #333333;
    }
    .online-icon.flag {
      font-size: 16px;
      width: 18px;
      height: 18px;
      line-height: 18px;
      text-align: center;
      background: #F1F2F3;
      color: #999999;
    }

    .online-icon.flag.active {
      background: #FFF8E5;
      color: #FFB800;
    }
  }
  .device-item {
    display: inline-block;
    height: 32px;
    width: 32px;
    line-height: 32px;
    color: #666666;
    text-align: center;
    font-size: 24px;
    cursor: pointer;
  }
  .device-item.active {
    cursor: pointer;
    background: #FFF1E5;
    color: $--color-primary;
  }
  .device-item.disabled {
    cursor: not-allowed!important;
  }
  .active{
    .img-box{
      background-color: $--color-primary;
    }
  }
  .img-box{
    padding: 5px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    img{
      vertical-align: middle;
    }
  }
</style>

<style scoped>
  .round-search >>> .el-input__inner {
    border-radius: 16px;
  }

  .base-card >>> .el-card__body {
    height: 100%;
  }
  .attribute-panel >>> .el-tabs__item {
    height: 57px;
    font-size: 14px;
    padding-top: 10px;
  }
  .attribute-panel >>> .el-tabs__nav-wrap {
    background: #FCFCFC;
  }
  .attribute-panel >>> .el-tabs__header {
    margin: 0px;
  }
  .attribute-panel >>> .el-tabs__nav {
    margin-left: 16px;
  }
  .attribute-panel >>> .el-form-item__label {
    font-size: 12px;
    color: #666666;
    padding-right: 0;
  }
  .attribute-panel >>> .el-tabs__nav-wrap::after {
    height: 1px;
  }
  .attribute-panel >>> .el-radio__label {
    padding-left: 8px;
  }
  .attribute-panel >>> .el-radio {
    margin-right: 24px;
  }
  .attribute-panel >>> .el-radio:last-child {
    margin-right: 0px;
  }
  .data-card >>> .el-collapse-item__content {
    background: #FAFBFC;
    padding-bottom: 0px;
  }
  .data-card >>> .el-collapse-item__header {
    height: 50px;
    line-height: 50px;
  }
  .data-card >>> .el-collapse-item__arrow {
    margin-right: 24px;
  }
  .data-card .table-column-item >>> .el-link--inner {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 240px;
  }
  .data-card >>> .el-tag.el-tag--success {
    background-color: #E5F7E7;
    border-color: #E5F7E7;
    color: #00AE1C;
  }
  .data-card >>> .el-tag.el-tag--warning {
    background-color: #FFF1E5;
    border-color: #FFF1E5;
    color: $--color-primary;
  }
  .data-card >>> .el-tag.el-tag--primary {
    background-color: #FFF8E5;
    border-color: #FFF8E5;
    color: #FFB800;
  }
</style>
