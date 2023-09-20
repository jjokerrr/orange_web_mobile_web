<template>
  <el-container class="edit-online-page">
    <el-header class="step-header" style="overflow: hidden; background: white; height: 72px; border-bottom: 1px solid #EBEEF5;">
      <el-row type="flex" justify="space-between" align="middle" style="height: 100%">
        <div class="title" style="width: 200px; height: 40px; line-height: 40px; display: flex">
          <i class="header-logo logo online-icon icon-orange-icon" style="font-size: 40px;" />
          <span style="font-size: 22px; color: #333333; font-weight: bold;">橙单在线表单</span>
        </div>
        <StepBar class="step" v-model="activeStep">
          <StepBarItem icon="online-icon icon-basic-info" :name="SysOnlinePageSettingStep.BASIC">基础信息</StepBarItem>
          <StepBarItem icon="online-icon icon-data" :name="SysOnlinePageSettingStep.DATASOURCE">数据模型</StepBarItem>
          <StepBarItem icon="online-icon icon-form-design" :name="SysOnlinePageSettingStep.FORM_DESIGN">表单设计</StepBarItem>
        </StepBar>
        <el-row class="operation" type="flex" justify="end" style="width: 200px;">
          <el-button v-if="!showSaveButton"
            size="small"
            :disabled="activeStep === SysOnlinePageSettingStep.BASIC"
            @click="onPrevClick"
          >
            上一步
          </el-button>
          <el-button v-if="!showSaveButton"
            :disabled="activeStep === SysOnlinePageSettingStep.FORM_DESIGN"
            size="small" type="primary"
            @click="onNextClick"
          >
            下一步
          </el-button>
          <el-button
            v-if="showSaveButton"
            size="small"
            type="primary"
            @click="onSaveClick"
          >
            保存
          </el-button>
          <el-button @click="onClose" size="small">{{showSaveButton ? '返回' : '退出'}}</el-button>
        </el-row>
      </el-row>
    </el-header>
    <el-main :style="{padding: activeStep === SysOnlinePageSettingStep.FORM_DESIGN ? '0px' : '15px'}">
      <el-row type="flex" justify="center" style="height: 100%">
        <!-- 基础信息 -->
        <el-col v-if="activeStep === SysOnlinePageSettingStep.BASIC" class="main-box" style="width: 600px;">
          <el-form ref="pageBasicInfo" class="full-width-input" size="small"
            :model="formPageData" :rules="formRules"
            label-position="right" label-width="80px" @submit.native.prevent
          >
            <el-col :span="24">
              <el-form-item label="页面类型">
                <el-select v-model="formPageData.pageType" :disabled="isEdit">
                  <el-option :value="SysOnlinePageType.BIZ" :label="SysOnlinePageType.getValue(SysOnlinePageType.BIZ)" />
                  <el-option :value="SysOnlinePageType.FLOW" :label="SysOnlinePageType.getValue(SysOnlinePageType.FLOW)" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="页面编码" prop="pageCode">
                <el-input v-model="formPageData.pageCode" :disabled="isEdit" @change="dirty = true" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="页面名称" prop="pageName">
                <el-input v-model="formPageData.pageName" @change="dirty = true" />
              </el-form-item>
            </el-col>
          </el-form>
        </el-col>
        <!-- 在线表单数据模型配置 -->
        <el-col v-if="activeStep === SysOnlinePageSettingStep.DATASOURCE && currentTable == null && virtualColumnTable == null"
          class="main-box" :span="24" style="min-width: 1100px;"
        >
          <vxe-table :data="getPageDatasourceTableList" :size="defaultFormItemSize" header-cell-class-name="table-header-gray">
            <vxe-column title="序号" type="seq" width="55px" />
            <vxe-column title="数据表名" field="tableName" />
            <vxe-column title="关联类型" field="relationType">
              <template slot-scope="scope">
                <el-tag :size="defaultFormItemSize" :type="getDatasourceTableTagType(scope.row.relationType)" effect="dark">
                  {{getDatasourceTableTagName(scope.row.relationType)}}
                </el-tag>
              </template>
            </vxe-column>
            <vxe-column title="主表关联字段" field="masterColumnName" />
            <vxe-column title="从表关联字段" field="slaveColumnName" />
            <vxe-column title="级联删除" field="cascadeDelete">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.relationType != null" :size="defaultFormItemSize"
                  :type="scope.row.cascadeDelete ? 'success' : 'danger'" effect="dark">
                  {{scope.row.cascadeDelete ? '是' : '否'}}
                </el-tag>
              </template>
            </vxe-column>
            <vxe-column title="是否左连接" field="leftJoin">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.relationType != null" :size="defaultFormItemSize"
                  :type="scope.row.leftJoin ? 'success' : 'danger'" effect="dark">
                  {{scope.row.leftJoin ? '是' : '否'}}
                </el-tag>
              </template>
            </vxe-column>
            <vxe-column title="操作" width="250px" fixed="right">
              <template slot-scope="scope">
                <!-- 数据源主表只有当没有任何关联的时候才可以编辑 -->
                <el-button :size="defaultFormItemSize" type="text"
                  @click="onEditDatasourceTable(scope.row)"
                  :disabled="scope.row.relationType == null && Array.isArray(scope.row.relationList) && scope.row.relationList.length > 0"
                >
                  编辑
                </el-button>
                <el-button :size="defaultFormItemSize" type="text"
                  @click="onEditTableColumn(scope.row)">
                  字段管理
                </el-button>
                <el-button :size="defaultFormItemSize" type="text"
                  :disabled="scope.row.relationType != null"
                  @click="onEditVirtualColumn(scope.row)">
                  聚合计算
                </el-button>
                <el-button :size="defaultFormItemSize" type="text"
                  :disabled="scope.row.relationType == null && (!Array.isArray(scope.row.relationList) || scope.row.relationList.length <= 0)"
                  @click="onDeleteDatasourceTable(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </vxe-column>
            <template slot="empty">
              <div class="table-empty unified-font">
                <img src="@/assets/img/empty.png">
                <span>暂无数据</span>
              </div>
            </template>
          </vxe-table>
          <el-button style="width: 100%; margin-top: 10px; border: 1px dashed #EBEEF5;" :size="defaultFormItemSize"
            icon="el-icon-plus" @click="onAddDatasourceClick"
          >新增数据表</el-button>
        </el-col>
        <!-- 编辑数据表字段验证规则 -->
        <el-col v-if="activeStep === SysOnlinePageSettingStep.DATASOURCE && currentTable != null" :span="24">
          <OnlinePageTableColumnRule ref="editTableColumn"
            :isMasterTable="currentTable.relationType == null"
            :tableId="currentTable.tableId"
            :dblinkId="getPageDatasource.dblinkId"
            :tableName="currentTable.tableName"
            :dictList="dictList"
            :height="getClientHeight - 80"
            @close="onRuleClose"
          />
        </el-col>
        <!-- 数据源虚拟字段设置 -->
        <el-col v-if="activeStep === SysOnlinePageSettingStep.DATASOURCE && virtualColumnTable != null" :span="24">
          <OnlinePageVirtualColumn ref="editVirtualColumn"
            :datasource="virtualColumnTable.tag"
            :relationList="virtualColumnTable.tag.relationList"
            :height="getClientHeight - 80"
            @close="onVirtualColumnClose"
          />
        </el-col>
        <!-- 表单设计 -->
        <el-col v-if="activeStep === SysOnlinePageSettingStep.FORM_DESIGN" class="design-box" style="width: 100%; height: 100%;">
          <FormDesign ref="formDesign"
            :pageType="formPageData.pageType"
            :height="getClientHeight - 90"
            :tableList="getPageDatasourceTableList"
            :widgetGroup="widgetGroup"
            :allFormList="formList"
            :dictList="dictList"
            @createForm="onCreateNewForm"
            @updateForm="updateFormInfo"
            @cloneForm="onCloneForm"
            @deleteForm="onDeleteForm"
            @refreshTable="onRefreshDatasource"
          />
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import StepBar from '@/components/StepBar/index.vue';
import StepBarItem from '@/components/StepBar/stepItem.vue';
import { findItemFromList } from '@/utils';
import { mapGetters } from 'vuex';
import widgetData from '../OnlinePageRender/components/config/index.js';
import OnlinePageTableColumnRule from './onlinePageTableColumnRule.vue';
import OnlinePageVirtualColumn from './onlinePageVirtualColumn.vue';
import EditOnlinePageDatasource from './editOnlinePageDatasource.vue';
import EditOnlinePageDatasourceRelation from './editOnlinePageDatasourceRelation.vue';
import FormDesign from '../formDesign/index.vue';
import EditOnlineForm from './editOnlineForm.vue';
import { getFormConfig } from '../OnlineFormConfig/index.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';

import {
  OnlineDblinkController,
  OnlineDictController,
  OnlinePageController,
  OnlineDatasourceRelationController,
  OnlineColumnController,
  OnlineFormController,
  OnlineDatasourceController
} from '@/api/onlineController.js';

export default {
  name: 'editOnlinePage',
  props: {
    pageId: {
      type: String
    }
  },
  components: {
    OnlinePageTableColumnRule,
    OnlinePageVirtualColumn,
    FormDesign,
    StepBar,
    StepBarItem
  },
  mixins: [thirdPartyMixin, refreshDataMixins],
  data () {
    return {
      dirty: false,
      activeStep: this.SysOnlinePageSettingStep.BASIC,
      formPageData: {
        pageId: undefined,
        pageCode: undefined,
        pageName: undefined,
        published: false
      },
      formRules: {
        pageCode: [
          {required: true, message: '页面编码不能为空！', trigger: 'blur'},
          {type: 'string', pattern: /^[A-Za-z0-9]+$/, message: '页面编码只允许输入字母和数字', trigger: 'blur'}
        ],
        pageName: [
          {required: true, message: '页面名称不能为空！', trigger: 'blur'}
        ]
      },
      dictList: [],
      pageDatasourceList: [],
      // 数据库信息
      dblinkInfo: {},
      formList: [],
      currentTable: undefined,
      virtualColumnTable: undefined
    }
  },
  methods: {
    refreshData (data) {
      if (data == null || !data.isSuccess) return;
      if (data.path === 'thirdEditOnlineForm') {
        this.initPageFormList(this.formPageData.pageId);
      } else if (data.path === 'thirdEditPageDatasource') {
        this.initPageDatasourceInfo(this.formPageData.pageId);
      } else if (data.path === 'thirdEditPageRelation') {
        this.initPageDatasourceInfo(this.formPageData.pageId);
      }
    },
    /**
     * 新建表单
     */
    onCreateNewForm () {
      this.$dialog.show('新建表单', EditOnlineForm, {
        area: ['600px']
      }, {
        pageId: this.formPageData.pageId,
        pageType: this.formPageData.pageType,
        datasourceId: this.getPageDatasource.datasourceId,
        datasourceTableList: this.getPageDatasourceTableList,
        path: 'thirdEditOnlineForm'
      }, {
        width: '600px',
        height: '400px',
        pathName: '/thirdParty/thirdEditOnlineForm'
      }).then(res => {
        this.initPageFormList(this.formPageData.pageId);
      }).catch(e => {});
    },
    /**
     * 复制表单
     */
    onCloneForm (row) {
      this.$confirm('是否复制此表单？').then(res => {
        let params = {
          formId: row.formId
        }

        return OnlineFormController.clone(this, params);
      }).then(res => {
        this.$message.success('复制成功！');
        this.initPageFormList(this.formPageData.pageId);
      }).catch(e => {});
    },
    onDeleteForm (row) {
      this.$confirm('是否删除此表单？').then(res => {
        let params = {
          formId: row.formId
        }

        return OnlineFormController.delete(this, params);
      }).then(res => {
        this.$message.success('删除成功！');
        this.initPageFormList(this.formPageData.pageId);
      }).catch(e => {});
    },
    onRefreshDatasource () {
      this.initPageDatasourceInfo(this.formPageData.pageId);
    },
    buildSaveWidget (widget) {
      if (widget == null) return widget;
      let oldWidgetImpl = widget.widgetImpl;
      let childWidgetList = widget.childWidgetList;
      widget.widgetImpl = undefined;
      widget.childWidgetList = [];
      let actions = widget.props.actions;
      widget.props.actions = {};
      let temp = JSON.parse(JSON.stringify(widget));
      widget.widgetImpl = oldWidgetImpl;
      widget.childWidgetList = childWidgetList;
      widget.props.actions = actions;
      temp.column = undefined;
      temp.datasource = undefined;
      temp.relation = undefined;
      temp.bindData.column = undefined;
      temp.bindData.table = undefined;
      temp.widgetImpl = undefined;
      if (temp.props && temp.props.dictInfo) temp.props.dictInfo.dict = undefined;
      if (temp.props && Array.isArray(temp.props.tableColumnList)) {
        temp.props.tableColumnList.forEach(tableColumn => {
          tableColumn.table = undefined;
          tableColumn.column = undefined;
        });
      }
      if (Array.isArray(widget.childWidgetList)) {
        temp.childWidgetList = widget.childWidgetList.map(item => {
          return this.buildSaveWidget(item);
        });
      }
      return temp;
    },
    updateFormInfo (currentForm) {
      debugger
      let formConfig = {
        pc: {
          gutter: currentForm.pc.gutter,
          filterItemWidth: currentForm.pc.filterItemWidth,
          labelWidth: currentForm.pc.labelWidth,
          labelPosition: currentForm.pc.labelPosition,
          tableWidget: this.buildSaveWidget(currentForm.pc.tableWidget),
          leftWidget: this.buildSaveWidget(currentForm.pc.leftWidget),
          operationList: currentForm.pc.operationList,
          customFieldList: currentForm.pc.customFieldList,
          widgetList: currentForm.pc.widgetList.map(widget => {
            return this.buildSaveWidget(widget);
          }),
          formEventList: currentForm.pc.formEventList,
          maskFieldList: currentForm.pc.maskFieldList,
          width: currentForm.pc.width,
          height: currentForm.pc.height,
          fullscreen: currentForm.pc.fullscreen,
          advanceQuery: currentForm.pc.advanceQuery
        }
      }
      console.log('formConfig')
      console.log(formConfig)
      let params = {
        onlineFormDto: {
          pageId: currentForm.pageId,
          formId: currentForm.formId,
          formCode: currentForm.pc.formCode,
          formName: currentForm.pc.formName,
          formKind: this.SysOnlineFormKind.PAGE,
          formType: currentForm.formType,
          masterTableId: currentForm.masterTableId,
          widgetJson: JSON.stringify(formConfig),
          datasourceIdList: [this.getPageDatasource.datasourceId]
        }
      }
      debugger
      // 获取表单组件绑定的全部数据表column，检查组件是否绑定的重复元素
      let widgetColumn = formConfig.pc.widgetList.map((widget) => widget.bindData.columnId);
      console.log(widgetColumn)
      const hasDuplicates = widgetColumn.some((value, index) => {
        return widgetColumn.indexOf(value) !== index;
      });
      if (hasDuplicates) {
        this.$message.error('保存失败，存在重复字段')
        return; // 停止执行后续代码
      }
      let httpCall = OnlineFormController.update(this, params);
      httpCall.then(res => {
        this.$message.success('保存成功');
        this.initPageFormList(this.formPageData.pageId).catch(e => {});
      }).catch(e => {});
      // 调用表单字段存储接口
    },
    onClose () {
      if (this.showSaveButton) {
        this.activeStep = this.SysOnlinePageSettingStep.DATASOURCE;
        this.currentTable = undefined;
        this.virtualColumnTable = undefined;
      } else {
        if (this.observer != null) {
          this.observer.cancel(true);
        } else {
          this.onCloseThirdDialog(true, this.thirdParams.path);
        }
      }
    },
    onSaveClick () {
      debugger
      if (this.activeStep === this.SysOnlinePageSettingStep.FORM_DESIGN) {
        if (this.$refs.formDesign) this.$refs.formDesign.saveForm();
      } else if (this.activeStep === this.SysOnlinePageSettingStep.DATASOURCE) {
        if (this.currentTable != null && this.$refs.editTableColumn) this.$refs.editTableColumn.onSaveColumn();
        if (this.virtualColumnTable != null && this.$refs.editVirtualColumn) this.$refs.editVirtualColumn.onSaveColumn();
      }
    },
    /**
     * 点击上一步
     */
    onPrevClick () {
      switch (this.activeStep) {
        case this.SysOnlinePageSettingStep.DATASOURCE:
          this.activeStep = this.SysOnlinePageSettingStep.BASIC;
          break;
        case this.SysOnlinePageSettingStep.FORM_DESIGN:
          this.dirty = false;
          this.activeStep = this.SysOnlinePageSettingStep.DATASOURCE;
          break;
      }
    },
    /**
     * 点击下一步
     */
    onNextClick () {
      switch (this.activeStep) {
        case this.SysOnlinePageSettingStep.BASIC:
          this.onSavePageBasicInfo().then(res => {
            return this.initPageDatasourceInfo(this.formPageData.pageId);
          }).then(res => {
            this.activeStep = this.SysOnlinePageSettingStep.DATASOURCE;
          }).catch(e => {});
          break;
        case this.SysOnlinePageSettingStep.DATASOURCE:
          this.onSavePageDatasourceInfo(false).then(res => {
            // Step 1 获取数据源所有用到的数据表的字段列表
            let httpCalls = [];
            this.getPageDatasourceTableList.forEach(item => {
              httpCalls.push(this.loadOnlineTableColumns(item.tableId))
            });
            return Promise.all(httpCalls)
          }).then(res => {
            res.forEach((item, index) => {
              this.getPageDatasourceTableList[index].columnList = item;
              return this.getPageDatasourceTableList[index];
            });
            // Step 2 获取表单列表
            return this.initPageFormList(this.formPageData.pageId);
          }).then(res => {
            // Step 3 进入表单设计页面
            this.activeStep = this.SysOnlinePageSettingStep.FORM_DESIGN;
          }).catch(e => {});
      }
    },
    loadOnlineTableColumns (tableId) {
      if (tableId == null || tableId === '') return Promise.reject();

      return new Promise((resolve, reject) => {
        let params = {
          onlineColumnDtoFilter: {
            tableId
          }
        }

        OnlineColumnController.list(this, params).then(res => {
          resolve(res.data.dataList);
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 合并数组，如果目标数组里的数据在原数组不存在，则加入到原数组，否则使用原数组数据
     */
    mergeArray (source, target, keyName) {
      let tempList = [];
      if (Array.isArray(target)) {
        target.forEach(item => {
          let temp = findItemFromList(source, item[keyName], keyName);
          tempList.push({
            ...item,
            ...temp
          });
        });
      }
      if (Array.isArray(source)) {
        source.forEach(item => {
          let temp = findItemFromList(tempList, item[keyName], keyName);
          if (temp == null) {
            tempList.push(item);
          }
        });
      }
      return tempList;
    },
    /**
     * 合并组件操作和属性
     */
    mergeWidget (widget, mode) {
      if (widget == null) return;
      let widgetConfig = widgetData.getWidgetAttribute(widget.widgetType, mode);
      if (widgetConfig != null) {
        // 合并组件操作
        widget.supportOperation = widgetConfig.supportOperation;
        if (widget.supportOperation) {
          widget.operationList = this.mergeArray(widget.operationList, widgetConfig.operationList, 'id');
        }
        // 合并组件属性
        widget.props = {
          ...widgetConfig.props,
          ...widget.props
        }
      }
    },
    /**
     * 获取页面子表单列表
     */
    initPageFormList (pageId) {
      return new Promise((resolve, reject) => {
        OnlineFormController.list(this, {
          onlineFormDtoFilter: {
            pageId: pageId
          },
          orderParam: [
            {
              fieldName: 'createTime',
              asc: true
            }
          ]
        }).then(res => {
          this.formList = (res.data.dataList || []).map(item => {
            let config = item.widgetJson ? JSON.parse(item.widgetJson) : {};
            let paramList = item.paramsJson ? JSON.parse(item.paramsJson) : [];
            let formConfig = getFormConfig(item.formType, this.formPageData.pageType);
            Object.keys(config).forEach(key => {
              config[key] = {
                ...formConfig[key],
                ...config[key]
              }
              config[key].formId = item.formId;
              config[key].formCode = item.formCode;
              config[key].formName = item.formName;
              config[key].formKind = item.formKind;
              config[key].formType = item.formType;
              config[key].formTypeDictMap = item.formTypeDictMap;
              config[key].masterTableId = item.masterTableId;
              // 合并表单操作
              config[key].operationList = this.mergeArray(config[key].operationList, formConfig[key].operationList, 'id');
              // 合并组件操作
              if (Array.isArray(config[key].widgetList)) {
                config[key].widgetList.forEach(widget => {
                  this.mergeWidget(widget, key);
                });
              }
              this.mergeWidget(config[key].tableWidget, key);
              this.mergeWidget(config[key].leftWidget, key);
            });
            return {
              ...item,
              ...config,
              paramList
            }
          });
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 保存页面数据模型信息
     */
    onSavePageDatasourceInfo (isPrev = false) {
      // 如果是上一步，直接返回上一步
      if (isPrev) return Promise.resolve();
      // 下一步需判断是否添加了数据源
      if (this.getPageDatasource == null) {
        this.$message.error('请设置页面数据模型！');
        if (this.formPageData.status !== this.SysOnlinePageStatus.DATASOURCE) {
          this.savePageInfo(this.SysOnlinePageStatus.DATASOURCE).catch(e => {});
        }
        return Promise.reject();
      } else {
        if (this.formPageData.status === this.SysOnlinePageStatus.DESIGNING) {
          return Promise.resolve();
        } else {
          return this.savePageInfo(this.SysOnlinePageStatus.DESIGNING);
        }
      }
    },
    /**
     * 保存页面基础信息
     */
    savePageInfo (status) {
      let params = {
        onlinePageDto: {
          ...this.formPageData,
          status: status,
          published: false
        }
      }
      return this.isEdit ? OnlinePageController.update(this, params) : OnlinePageController.add(this, params);
    },
    /**
     * 保存页面基础信息
     */
    onSavePageBasicInfo () {
      return new Promise((resolve, reject) => {
        this.$refs.pageBasicInfo.validate(valid => {
          if (!valid || !this.dirty) {
            valid ? resolve() : reject();
            return;
          }
          this.savePageInfo(this.SysOnlinePageStatus.DATASOURCE).then(res => {
            this.$message.success('保存页面基础信息成功！');
            if (!this.isEdit) this.formPageData.pageId = res.data;
            this.dirty = false;
            resolve();
          }).catch(e => {
            reject(e);
          });
        });
      });
    },
    getDatasourceTableTagType (relationType) {
      if (relationType == null) return 'success';
      switch (relationType) {
        case this.SysOnlineRelationType.ONE_TO_ONE: return 'primary';
        case this.SysOnlineRelationType.ONE_TO_MANY: return 'warning';
        default:
          return 'info';
      }
    },
    getDatasourceTableTagName (relationType) {
      if (relationType == null) return '数据主表';
      return this.SysOnlineRelationType.getValue(relationType) || '未知类型';
    },
    /**
     * 获得数据源所有可用的数据表列表，包含已经导入的数据表和未导入的数据表
     */
    loadDatasourceValidTableList (datasource) {
      if (datasource == null) return Promise.reject();
      if (Array.isArray(datasource.validTableList) && datasource.validTableList.length > 0) {
        return Promise.resolve();
      }
      let httpCalls = [
        this.loadDatasourceTableList(datasource.datasourceId),
        this.loadDblinkTableList(datasource.dblinkId)
      ];

      return new Promise((resolve, reject) => {
        Promise.all(httpCalls).then(res => {
          let datasourceTableList = res[0];
          let dblinkTableList = res[1];
          // 合并两个数据表
          let tableNameSet = new Set();
          datasource.validTableList = dblinkTableList.map(table => {
            tableNameSet.add(table.tableName);
            let temp = findItemFromList(datasourceTableList, table.tableName, 'tableName');
            tableNameSet.add(table.tableName);
            return {
              id: temp ? temp.tableId : table.tableName,
              name: table.tableName,
              desc: temp ? temp.tableComment : table.tableComment,
              status: temp ? this.SysOnlinePageDatasourceFieldStatus.USED : this.SysOnlinePageDatasourceFieldStatus.UNUSED,
              dblinkTable: temp == null,
              tag: temp || table
            }
          });
          // 添加被使用但是已经从数据库中删除的数据表
          datasourceTableList.forEach(table => {
            if (!tableNameSet.has(table.tableName)) {
              datasource.validTableList.push({
                id: table.tableId,
                name: table.tableName,
                desc: table.tableComment,
                status: this.SysOnlinePageDatasourceFieldStatus.DELETED,
                dblinkTable: false,
                tag: table
              });
            }
          });
          tableNameSet = null;
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 新增数据模型表
     */
    onAddDatasourceClick () {
      if (this.getPageDatasource == null) {
        // 新增数据模型
        this.$dialog.show('新建数据源', EditOnlinePageDatasource, {
          area: '500px'
        }, {
          pageId: this.formPageData.pageId,
          dblinkInfo: this.dblinkInfo,
          path: 'thirdEditPageDatasource'
        }, {
          width: '500px',
          height: '500px',
          pathName: '/thirdParty/thirdEditPageDatasource'
        }).then(res => {
          return this.initPageDatasourceInfo(this.formPageData.pageId);
        }).catch(e => {});
      } else {
        // 新增数据模型关联
        this.loadDatasourceValidTableList(this.getPageDatasource).then(res => {
          this.$dialog.show('添加关联', EditOnlinePageDatasourceRelation, {
            area: '600px'
          }, {
            datasource: this.getPageDatasource,
            dblinkInfo: this.dblinkInfo[this.getPageDatasource.dblinkId],
            usedTableNameList: this.getPageDatasourceTableList.map(item => item.tableName),
            path: 'thirdEditPageRelation'
          }, {
            width: '600px',
            pathName: '/thirdParty/thirdEditPageRelation'
          }).then(res => {
            return this.initPageDatasourceInfo(this.formPageData.pageId);
          }).catch(e => {
            console.log(e);
          });
        }).catch(e => {
          console.log(e);
        });
      }
    },
    /**
     * 编辑数据模型表
     */
    onEditDatasourceTable (row) {
      this.loadDatasourceValidTableList(this.getPageDatasource).then(res => {
        if (row.relationType == null) {
          // 编辑数据模型
          this.$dialog.show('编辑数据源', EditOnlinePageDatasource, {
            area: '500px'
          }, {
            pageId: this.formPageData.pageId,
            dblinkInfo: this.dblinkInfo,
            datasourceId: row.tag.datasourceId,
            path: 'thirdEditPageDatasource'
          }, {
            width: '500px',
            height: '500px',
            pathName: '/thirdParty/thirdEditPageDatasource'
          }).then(res => {
            return this.initPageDatasourceInfo(this.formPageData.pageId);
          }).catch(e => {});
        } else {
          // 编辑关联
          this.$dialog.show('编辑关联', EditOnlinePageDatasourceRelation, {
            area: '600px'
          }, {
            relationId: row.id,
            datasource: this.getPageDatasource,
            dblinkInfo: this.dblinkInfo[this.getPageDatasource.dblinkId],
            usedTableNameList: this.getPageDatasourceTableList.map(item => item.tableName),
            path: 'thirdEditPageRelation'
          }, {
            width: '600px',
            pathName: '/thirdParty/thirdEditPageRelation'
          }).then(res => {
            return this.initPageDatasourceInfo(this.formPageData.pageId);
          }).catch(e => {
            console.log(e);
          });
        }
      }).catch(e => {});
    },
    /**
     * 删除数据模型表
     */
    onDeleteDatasourceTable (row) {
      if (row.relationType == null) {
        // 删除数据模型
        let warningMsg = '是否删除此数据模型？'
        if (Array.isArray(row.relationList) && row.relationList.length > 0) {
          warningMsg = '此数据模型下还存在关联，如果删除关联数据也将同时删除，是否继续？'
        }
        this.$confirm(warningMsg).then(res => {
          let params = {
            datasourceId: row.id
          }
          return OnlineDatasourceController.delete(this, params);
        }).then(res => {
          return this.initPageDatasourceInfo(this.formPageData.pageId);
        }).catch(e => {});
      } else {
        // 删除关联数据
        this.$confirm('是否删除此关联数据？').then(res => {
          let params = {
            relationId: row.id
          }

          return OnlineDatasourceRelationController.delete(this, params);
        }).then(res => {
          return this.initPageDatasourceInfo(this.formPageData.pageId);
        }).catch(e => {});
      }
    },
    /**
     * 关闭字段规则编辑
     */
    onRuleClose () {
      this.currentTable = undefined;
    },
    /**
     * 编辑数据模型表字段规则信息
     */
    onEditTableColumn (row) {
      this.currentTable = row;
    },
    /**
     * 关闭聚合计算管理
     */
    onVirtualColumnClose () {
      this.virtualColumnTable = undefined;
    },
    /**
     * 编辑数据源虚拟字段
     */
    onEditVirtualColumn (row) {
      this.virtualColumnTable = row;
    },
    /**
     * 获取数据库下数据表列表
     */
    loadDblinkTableList (dblinkId) {
      return new Promise((resolve, reject) => {
        // 如果此数据库下数据表已经获取过，直接返回数据表列表
        if (Array.isArray(this.dblinkInfo[dblinkId].tableList) && this.dblinkInfo[dblinkId].tableList.length > 0) {
          resolve(this.dblinkInfo[dblinkId].tableList);
          return;
        }
        // 获取数据库下数据表列表
        OnlineDblinkController.listDblinkTables(this, {
          dblinkId: dblinkId
        }).then(res => {
          this.dblinkInfo[dblinkId].tableList = res.data.dataList;
          resolve(res.data);
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 获取本数据源下所有导入的表
     */
    loadDatasourceTableList (datasourceId) {
      return new Promise((resolve, reject) => {
        let params = {
          datasourceId: datasourceId
        }
        OnlineDatasourceController.view(this, params).then(res => {
          this.datasourceTableList = res.data.tableList || [];
          resolve(this.datasourceTableList);
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 获取所有在线表单字典信息
     */
    loadOnlineDictList () {
      return new Promise((resolve, reject) => {
        OnlineDictController.list(this, {}).then(res => {
          res.data.dataList.forEach(item => {
            item.id = item.dictId;
            item.name = item.dictName;
            item.dictData = item.dictDataJson ? JSON.parse(item.dictDataJson) : undefined;
          });
          this.dictList = res.data.dataList;
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 获取数据模型关联信息
     */
    loadDatasourceRelation () {
      if (this.getPageDatasource == null) return Promise.resolve();

      return OnlineDatasourceRelationController.list(this, {
        onlineDatasourceRelationDtoFilter: {
          datasourceId: this.getPageDatasource.datasourceId
        }
      });
    },
    /**
     * 初始化页面数据模型信息
     */
    initPageDatasourceInfo (pageId) {
      return new Promise((resolve, reject) => {
        OnlinePageController.listOnlinePageDatasource(this, {
          pageId: pageId
        }).then(res => {
          this.pageDatasourceList = res.data.dataList;
          return this.loadDatasourceRelation();
        }).then(res => {
          this.pageDatasourceList = this.pageDatasourceList.map(item => {
            if (item.datasourceId === this.getPageDatasource.datasourceId) {
              item.relationList = res.data.dataList || [];
            }
            return item;
          });
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 获取数据库信息
     */
    loadDblinkList () {
      return new Promise((resolve, reject) => {
        this.dblinkInfo = {};
        OnlineDblinkController.list(this, {}).then(res => {
          res.data.dataList.forEach(item => {
            this.dblinkInfo[item.dblinkId] = {
              ...item,
              tableList: undefined
            }
          });
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 初始化页面基础信息
     */
    initPageInfo () {
      this.formPageData = {
        pageId: undefined,
        pageCode: undefined,
        pageName: undefined,
        pageType: this.SysOnlinePageType.BIZ,
        status: this.SysOnlinePageStatus.BASIC
      };
      this.activeStep = this.SysOnlinePageSettingStep.BASIC;
      let pageId = this.pageId || this.thirdParams.pageId;
      if (pageId != null || this.formPageData.pageId != null) {
        let params = {
          pageId: pageId || this.formPageData.pageId
        }
        return OnlinePageController.view(this, params);
      } else {
        return Promise.resolve();
      }
    }
  },
  computed: {
    isEdit () {
      return this.formPageData.pageId != null && this.formPageData.pageId !== '';
    },
    widgetGroup () {
      return widgetData.widgetGroupList;
    },
    getPageDatasource () {
      return this.pageDatasourceList[0];
    },
    getPageDatasourceTableList () {
      if (this.getPageDatasource == null) return [];

      let tableList = [];
      // 添加主表信息
      tableList.push({
        id: this.getPageDatasource.datasourceId,
        tableName: this.getPageDatasource.masterTableIdDictMap.name,
        tableId: this.getPageDatasource.masterTableId,
        relationType: undefined,
        masterColumnName: undefined,
        slaveColumnName: undefined,
        cascadeDelete: false,
        leftJoin: false,
        showName: this.getPageDatasource.datasourceName,
        tag: this.getPageDatasource
      });
      // 添加关联从表信息
      if (Array.isArray(this.getPageDatasource.relationList)) {
        this.getPageDatasource.relationList.forEach(relation => {
          tableList.push({
            id: relation.relationId,
            tableName: relation.slaveTable.tableName,
            tableId: relation.slaveTableId,
            relationType: relation.relationType,
            masterColumnName: (relation.masterColumn || {}).columnName || '未知字段',
            slaveColumnName: (relation.slaveColumn || {}).columnName || '未知字段',
            cascadeDelete: relation.cascadeDelete,
            leftJoin: relation.leftJoin,
            showName: relation.relationName,
            tag: relation
          });
        });
      }
      return tableList;
    },
    showSaveButton () {
      return (
        this.activeStep === this.SysOnlinePageSettingStep.FORM_DESIGN ||
        (this.activeStep === this.SysOnlinePageSettingStep.DATASOURCE && (this.currentTable != null || this.virtualColumnTable != null))
      );
    },
    ...mapGetters(['getClientHeight'])
  },
  mounted () {
    this.loadOnlineDictList().catch(e => {});
    this.loadDblinkList().then(res => {
      return this.initPageInfo();
    }).then(res => {
      this.formPageData = {
        pageId: res.data.pageId,
        pageCode: res.data.pageCode,
        pageName: res.data.pageName,
        published: res.data.published,
        pageType: res.data.pageType,
        status: res.data.status
      }
      this.activeStep = this.SysOnlinePageSettingStep.BASIC;
    }).catch(e => {
      console.log(e);
    });
  }
}
</script>

<style scoped>
  .edit-online-page {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    background: #F6F6f6!important;
  }

  .main-box {
    padding: 20px;
    background: white;
    height: 100%;
  }

  .design-box {
    padding: 0px;
    height: 100%;
    border-radius: 3px;
  }
</style>
