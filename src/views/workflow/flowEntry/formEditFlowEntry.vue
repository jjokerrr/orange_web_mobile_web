<template>
  <div class="edit-online-form">
    <el-container>
      <el-header class="step-header" style="height: 72px">
        <el-row type="flex" justify="space-between">
          <el-col class="title header" :span="6" style="height: auto; line-height: auto;">
            <i class="header-logo logo online-icon icon-orange-icon" style="font-size: 40px;color: #FDA834;" />
            <span style="font-size: 22px; color: #333333; font-weight: bold;">业务流程设计</span>
          </el-col>
          <div>
            <StepBar class="step" v-model="activeStep" style="margin-top: 14px">
              <StepBarItem icon="online-icon icon-basic-info" :name="SysFlowEntryStep.BASIC">基础信息</StepBarItem>
              <StepBarItem icon="online-icon icon-operator" :name="SysFlowEntryStep.PROCESS_VARIABLE">流程变量</StepBarItem>
              <StepBarItem icon="online-icon icon-flow-stauts" :name="SysFlowEntryStep.PROCESS_STATUS">流程状态</StepBarItem>
              <StepBarItem icon="online-icon icon-flow-design" :name="SysFlowEntryStep.PROCESS_DESIGN">流程设计</StepBarItem>
            </StepBar>
          </div>
          <el-col :span="6">
            <el-row type="flex" justify="end" align="middle" style="height: 72px;">
              <el-button v-if="activeStep !== SysFlowEntryStep.PROCESS_DESIGN" size="small" @click="onPrevClick"
                :disabled="activeStep === SysFlowEntryStep.BASIC"
              >
                上一步
              </el-button>
              <el-button type="primary" v-if="activeStep !== SysFlowEntryStep.PROCESS_DESIGN" size="small" @click="onNextClick" :disabled="activeStep === SysFlowEntryStep.PROCESS_DESIGN">下一步</el-button>
              <el-button v-if="activeStep !== SysFlowEntryStep.PROCESS_DESIGN" size="small" @click="onClose(false)">退出</el-button>
              <el-button v-if="activeStep === SysFlowEntryStep.PROCESS_DESIGN" size="small" type="primary" @click="onSave">保存</el-button>
              <el-button v-if="activeStep === SysFlowEntryStep.PROCESS_DESIGN" size="small" @click="onPrevClick">返回</el-button>
            </el-row>
          </el-col>
        </el-row>
      </el-header>
      <el-main style="background: #EBEEF5; padding: 10px;" :style="{height: getClientHeight - 72 + 'px'}">
        <el-row type="flex" justify="center" style="height: 100%;">
          <!-- 流程基础信息设置 -->
          <el-col v-if="activeStep === SysFlowEntryStep.BASIC" class="main-box" style="width: 600px;" :span="9">
            <el-form ref="entryBasicInfo" class="full-width-input" size="small" :model="formFlowEntryData" :rules="formRules"
              label-position="right" label-width="80px" @submit.native.prevent>
              <el-col :span="24">
                <el-form-item label="表单类型" prop="bindFormType">
                  <el-select v-model="formFlowEntryData.bindFormType" placeholder="" @change="onBindFormTypeChange" :disabled="isEdit">
                    <el-option :label="SysFlowEntryBindFormType.getValue(SysFlowEntryBindFormType.ROUTER_FORM)" :value="SysFlowEntryBindFormType.ROUTER_FORM" />
                    <el-option :label="SysFlowEntryBindFormType.getValue(SysFlowEntryBindFormType.ONLINE_FORM)" :value="SysFlowEntryBindFormType.ONLINE_FORM" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="流程名称" prop="processDefinitionName">
                  <el-input v-model="formFlowEntryData.processDefinitionName" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="流程标识" prop="processDefinitionKey">
                  <el-input v-model="formFlowEntryData.processDefinitionKey" :disabled="isEdit" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="流程分类" prop="categoryId">
                  <el-select v-model="formFlowEntryData.categoryId"
                    placeholder="" :loading="categoryIdWidget.loading"
                    @visible-change="categoryIdWidget.onVisibleChange">
                    <el-option v-for="item in categoryIdWidget.dropdownList"
                      :key="item.id" :value="item.id" :label="item.name" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="工单编码">
                  <el-row type="flex" align="middle">
                    <el-input v-model="formFlowEntryData.encodedRule.prefix" style="width: 150px;"
                      placeholder="前缀" :disabled="!formFlowEntryData.encodedRule.calculateWhenView"
                    >
                      <el-checkbox v-model="formFlowEntryData.encodedRule.calculateWhenView" slot="prepend" />
                    </el-input>
                    <el-select v-model="formFlowEntryData.encodedRule.precisionTo" style="width: 160px; margin-left: 5px;"
                      placeholder="日期精度" :disabled="!formFlowEntryData.encodedRule.calculateWhenView"
                    >
                      <el-option v-for="item in SysAutoCodeType.getList()" :key="item.id"
                        :label="item.name" :value="item.id"
                      />
                    </el-select>
                    <el-input v-model="formFlowEntryData.encodedRule.middle" style="width: 80px; margin-left: 5px;"
                      placeholder="后缀" :disabled="!formFlowEntryData.encodedRule.calculateWhenView"
                    />
                    <el-input-number v-model="formFlowEntryData.encodedRule.idWidth" style="width: 100px; margin-left: 5px;"
                      :controls="false" placeholder="序号宽度" :disabled="!formFlowEntryData.encodedRule.calculateWhenView"
                    />
                  </el-row>
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formFlowEntryData.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM">
                <el-form-item label="流程页面" prop="pageId">
                  <el-select v-model="formFlowEntryData.pageId"
                    :disabled="isEdit"
                    placeholder="" :loading="pageIdWidget.loading"
                    @visible-change="pageIdWidget.onVisibleChange"
                    @change="onEntryPageChange"
                  >
                    <el-option v-for="item in pageIdWidget.dropdownList"
                      :key="item.pageId" :value="item.pageId" :label="item.pageName" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formFlowEntryData.bindFormType === SysFlowEntryBindFormType.ONLINE_FORM">
                <el-form-item label="默认表单" prop="defaultFormId">
                  <el-select v-model="formFlowEntryData.defaultFormId"
                    placeholder="" :loading="defaultFormIdWidget.loading"
                    @visible-change="defaultFormIdWidget.onVisibleChange"
                  >
                    <el-option v-for="item in defaultFormIdWidget.dropdownList"
                      :key="item.formId" :value="item.formId" :label="item.formName" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formFlowEntryData.bindFormType === SysFlowEntryBindFormType.ROUTER_FORM">
                <el-form-item label="默认表单" prop="defaultRouterName">
                  <el-input v-model="formFlowEntryData.defaultRouterName" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="通知类型">
                  <el-select v-model="formFlowEntryData.notifyTypes" placeholder="" clearable multiple>
                    <el-option label="邮件" value="email" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="级联删除业务数据" label-width="160px">
                  <el-switch v-model="formFlowEntryData.cascadeDeleteBusinessData" />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="isEdit">
                <el-form-item label="工单分享">
                  <el-row type="flex">
                    <el-button v-for="form in (defaultFormIdWidget.dropdownList || []).filter(item => item.formType === SysOnlineFormType.WORK_ORDER)"
                      :key="form.formId" :class="form.formCode" :data-clipboard-text="getFormShareInfo(form)"
                      title="生成分享链接"
                      @click="handleShare(form.formCode)"
                    >
                      {{form.formName}}
                    </el-button>
                  </el-row>
                </el-form-item>
              </el-col>
            </el-form>
          </el-col>
          <!-- 流程变量设置 -->
          <el-col v-if="activeStep === SysFlowEntryStep.PROCESS_VARIABLE" class="main-box" :span="16">
            <vxe-table :data="processVariableList" header-cell-class-name="table-header-gray" key="processVariableList" :size="defaultFormItemSize">
              <vxe-column title="序号" type="seq" width="55px" />
              <vxe-column title="变量名称" field="showName" />
              <vxe-column title="变量标识" field="variableName" />
              <vxe-column title="变量类型">
                <template slot-scope="scope">
                  <el-tag :size="defaultFormItemSize" effect="dark"
                    :type="scope.row.variableType === SysFlowVariableType.TASK ? 'primary' : 'success'">
                    {{SysFlowVariableType.getValue(scope.row.variableType)}}
                  </el-tag>
                </template>
              </vxe-column>
              <vxe-column title="内置变量">
                <template slot-scope="scope">
                  <el-tag :size="defaultFormItemSize" effect="dark" :type="scope.row.builtIn ? 'success' : 'danger'">
                    {{scope.row.builtIn ? '是' : '否'}}
                  </el-tag>
                </template>
              </vxe-column>
              <vxe-column title="操作" width="100px">
                <template slot-scope="scope">
                  <el-button :size="defaultFormItemSize" type="text" :disabled="scope.row.builtin" @click="editEntryVariable(scope.row)" style="padding:0">编辑</el-button>
                  <el-button :size="defaultFormItemSize" type="text" :disabled="scope.row.builtin" @click="deleteEntryVariable(scope.row)" style="padding:0">删除</el-button>
                </template>
              </vxe-column>
              <template slot="empty">
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png">
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
            <el-button class="btn-add" icon="el-icon-plus" @click="addEntryVariable" :size="defaultFormItemSize">添加变量</el-button>
          </el-col>
          <!-- 流程状态设置 -->
          <el-col v-if="activeStep === SysFlowEntryStep.PROCESS_STATUS" class="main-box" :span="16">
            <vxe-table :data="formFlowEntryData.extensionData.approvalStatusDict" header-cell-class-name="table-header-gray" key="processStatusList" :size="defaultFormItemSize">
              <vxe-column title="序号" type="seq" width="55px" />
              <vxe-column title="状态显示名" field="name" />
              <vxe-column title="状态标识" field="id" />
              <vxe-column title="操作" width="100px">
                <template slot-scope="scope">
                  <el-button :size="defaultFormItemSize" type="text" :disabled="scope.row.builtin" @click="editEntryStatus(scope.row)" style="padding:0">编辑</el-button>
                  <el-button :size="defaultFormItemSize" type="text" :disabled="scope.row.builtin" @click="deleteEntryStatus(scope.row)" style="padding:0">删除</el-button>
                </template>
              </vxe-column>
              <template slot="empty">
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png">
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
            <el-button class="btn-add" icon="el-icon-plus" :size="defaultFormItemSize" @click="editEntryStatus(null)">新建状态</el-button>
          </el-col>
          <!-- 流程设计 -->
          <el-col v-if="activeStep === SysFlowEntryStep.PROCESS_DESIGN" class="main-box" :span="24" style="min-width: 1100px; padding: 0px">
            <ProcessDesigner ref="ProcessDesigner" :useVariableMap="useVariableMap" :entryId="flowEntry.entryId" :flowEntryInfo="formFlowEntryData" @save="onSaveFlowEntry" />
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Clipboard from 'clipboard';
import { mapGetters } from 'vuex';
/* eslint-disable-next-line */
import rules from '@/utils/validate.js';
/* eslint-disable-next-line */
import { DropdownWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin } from '@/core/mixins';
import ProcessDesigner from '../components/ProcessDesigner.vue';
/* eslint-disable-next-line */
import { FlowEntryController, FlowEntryVariableController, FlowDictionaryController, FlowVariableDisplayController } from '@/api/flowController.js';
import {
  OnlinePageController,
  OnlineFormController,
  OnlineColumnController,
  OnlineDatasourceRelationController,
  OnlineVirtualColumnController
} from '@/api/onlineController.js';
import EditFlowEntryVariable from './formEditFlowEntryVariable.vue';
import EditFlowEntryStatus from './formEditFlowEntryStatus.vue';
import StepBar from '@/components/StepBar/index.vue';
import StepBarItem from '@/components/StepBar/stepItem.vue';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

const defaultApprovalStatus = [
  {
    id: 1,
    name: '同意'
  },
  {
    id: 2,
    name: '拒绝'
  },
  {
    id: 3,
    name: '驳回'
  },
  {
    id: 4,
    name: '会签同意'
  },
  {
    id: 5,
    name: '会签拒绝'
  }
];

export default {
  name: 'formEditFlowEntry',
  props: {
    flowEntry: {
      type: Object,
      defalut: () => {}
    }
  },
  components: {
    ProcessDesigner,
    StepBar,
    StepBarItem
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin, thirdPartyMixin, refreshDataMixins],
  provide () {
    return {
      flowEntry: () => this.formFlowEntryData,
      formList: () => this.defaultFormIdWidget ? this.defaultFormIdWidget.dropdownList : [],
      allVariableList: () => this.processVariableList,
      onUpdateVariableList: this.updateVariableList
    }
  },
  data () {
    return {
      useVariableMap: new Map(),
      entryDatasource: undefined,
      activeStep: this.SysFlowEntryStep.BASIC,
      formFlowEntryData: {
        entryId: undefined,
        processDefinitionName: undefined,
        processDefinitionKey: undefined,
        categoryId: undefined,
        bindFormType: this.SysFlowEntryBindFormType.ROUTER_FORM,
        pageId: undefined,
        defaultFormId: undefined,
        defaultRouterName: undefined,
        bpmnXml: undefined,
        diagramType: this.DiagramType.ORDINARY,
        encodedRule: {
          calculateWhenView: false,
          prefix: undefined,
          precisionTo: this.SysAutoCodeType.DAYS,
          middle: undefined,
          idWidth: undefined
        },
        extensionData: {},
        notifyTypes: undefined,
        cascadeDeleteBusinessData: false
      },
      categoryIdWidget: new DropdownWidget(this.loadCategoryIdDropdownList),
      pageIdWidget: new DropdownWidget(this.loadPageIdDropdownList),
      defaultFormIdWidget: new DropdownWidget(this.loadDefaultFormIdDropdownList),
      processVariableList: [],
      formRules: {
        processDefinitionKey: [
          {required: true, message: '流程标识不能为空！', trigger: 'blur'},
          {type: 'string', pattern: /^[A-Za-z0-9]+$/, message: '流程标识只允许输入字母和数字', trigger: 'blur'},
          {type: 'string', pattern: /^[A-Za-z][A-Za-z0-9]+$/, message: '流程标识不能以数字开头', trigger: 'blur'}
        ],
        processDefinitionName: [
          {required: true, message: '流程名称不能为空！', trigger: 'blur'}
        ],
        categoryId: [
          {required: true, message: '流程分类不能为空！', trigger: 'blur'}
        ],
        pageId: [
          {required: true, message: '流程页面不能为空！', trigger: 'blur'}
        ],
        defaultFormId: [
          {required: true, message: '默认在线表单不能为空！', trigger: 'blur'}
        ],
        defaultRouterName: [
          {required: true, message: '默认路由表单不能为空！', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    getVariableDisplayInfo () {
      // 查询接口
      return new Promise((resolve, reject) => {
        FlowVariableDisplayController.listByEntry(this, {entryId: this.flowEntry.entryId}).then(res => {
          const nowVariableMap = new Map();
          res.data.dataList.forEach(item => {
            if (nowVariableMap.has(item.taskKey)) {
              nowVariableMap.set(item.taskKey, [...nowVariableMap.get(item.taskKey), {
                id: item.variableId,
                label: item.variableLabel,
                variableAuthority: item.variableAuthority
              }])
            } else {
              nowVariableMap.set(item.taskKey, [{
                id: item.variableId,
                label: item.variableLabel,
                variableAuthority: item.variableAuthority
              }]);
            }
          });
          this.useVariableMap = nowVariableMap;
        }).catch(e => {
          reject(e);
        });
      });
    },
    refreshData (data) {
      if (data.path === 'thirdFormEditFlowEntryVariable' && data.isSuccess) {
        this.loadEntryVariableList()
      } else if (data.path === 'thirdFormEditFlowEntryStatus' && data.isSuccess) {
        this.formFlowEntryData.extensionData.approvalStatusDict = [...data.data];
      }
    },
    getFormShareInfo (form) {
      let shareInfo = {
        url: window.location.origin + '/#/thirdParty/thirdOnlineForm?formId=' + form.formId + '&entryId=' + this.formFlowEntryData.entryId,
        processDefinitionKey: this.formFlowEntryData.processDefinitionKey
      }

      return JSON.stringify(shareInfo);
    },
    handleShare (formId) {
      try {
        let clipboard = new Clipboard('.' + formId);
        clipboard.on('success', e => {
          this.$message.success('接入信息复制成功！');
          clipboard.destroy();
        });
        clipboard.on('error', e => {
          this.$message.error('浏览器不支持复制，请手动复制接入信息：' + this.shareUrl);
          clipboard.destroy();
        });
      } catch (e) {
        console.log(e);
      }
    },
    onSave () {
      this.$refs.ProcessDesigner.$refs.processDesigner.onSave()
    },
    onClose () {
      // this.$emit('close');
      if (this.observer != null) {
        this.observer.cancel(true);
      } else {
        this.onCloseThirdDialog(true, this.thirdParams.path);
      }
    },
    // 流程绑定表单类型改变
    onBindFormTypeChange () {
      this.formFlowEntryData.pageId = undefined;
      this.formFlowEntryData.defaultFormId = undefined;
      this.formFlowEntryData.defaultRouterName = undefined;
      this.entryDatasource = undefined;
    },
    // 流程绑定表单页面改变
    onEntryPageChange () {
      this.formFlowEntryData.defaultFormId = undefined;
      this.defaultFormIdWidget.dirty = true;
      this.entryDatasource = null;
    },
    // 获取流程分类
    loadCategoryIdDropdownList () {
      return new Promise((resolve, reject) => {
        FlowDictionaryController.dictFlowCategory(this, {}).then(res => {
          resolve(res.getList());
        }).catch(e => {
          reject(e);
        });
      });
    },
    // 获取在线表单列表
    loadPageIdDropdownList () {
      return new Promise((resolve, reject) => {
        OnlinePageController.list(this, {
          onlinePageDtoFilter: {
            pageType: this.SysOnlinePageType.FLOW
          }
        }).then(res => {
          resolve(res.data.dataList.filter(item => item.published));
        }).catch(e => {
          reject(e);
        });
      });
    },
    // 获取默认表单页面列表
    loadDefaultFormIdDropdownList () {
      return new Promise((resolve, reject) => {
        if (this.formFlowEntryData.pageId == null || this.formFlowEntryData.pageId === '') {
          resolve([]);
          return;
        }
        OnlineFormController.list(this, {
          onlineFormDtoFilter: {
            pageId: this.formFlowEntryData.pageId
          },
          orderParam: [
            {
              fieldName: 'createTime',
              asc: true
            }
          ]
        }).then(res => {
          resolve(res.data.dataList);
        }).catch(e => {
          reject(e);
        });
      });
    },
    onPrevClick () {
      switch (this.activeStep) {
        case this.SysFlowEntryStep.PROCESS_VARIABLE:
          this.activeStep = this.SysFlowEntryStep.BASIC;
          break;
        case this.SysFlowEntryStep.PROCESS_STATUS:
          this.activeStep = this.SysFlowEntryStep.PROCESS_VARIABLE;
          break;
        case this.SysFlowEntryStep.PROCESS_DESIGN:
          this.activeStep = this.SysFlowEntryStep.PROCESS_STATUS;
          break;
      }
    },
    onNextClick () {
      switch (this.activeStep) {
        case this.SysFlowEntryStep.BASIC:
          this.$refs.entryBasicInfo.validate(valid => {
            if (!valid) return;
            if (this.formFlowEntryData.encodedRule.calculateWhenView) {
              /*
              if (this.formFlowEntryData.encodedRule.prefix == null || this.formFlowEntryData.encodedRule.prefix === '') {
                this.$message.error('工单编码前缀不能为空！');
                return;
              }
              */
              if (this.formFlowEntryData.encodedRule.precisionTo == null || this.formFlowEntryData.encodedRule.precisionTo === '') {
                this.$message.error('工单编码精度类型！');
                return;
              }
              if (this.formFlowEntryData.encodedRule.idWidth == null || this.formFlowEntryData.encodedRule.idWidth <= 0) {
                this.$message.error('工单编码编号长度不能小于1！');
                return;
              }
            }
            // 保存流程基本信息
            this.onSaveFlowEntryBasicInfo().then(res => {
              if (!this.isEdit) this.formFlowEntryData.entryId = res.data;
              this.$message.success('保存成功');
              // 获取流程页面数据源信息
              this.initFlowDatasourceInfo().then(res => {
                // 获取流程变量
                return this.loadEntryVariableList();
              }).then(res => {
                this.activeStep = this.SysFlowEntryStep.PROCESS_VARIABLE;
              }).catch(e => {
                console.log(e);
              });
            }).catch(e => {
              console.log(e);
            });
          });
          break;
        case this.SysFlowEntryStep.PROCESS_VARIABLE:
          this.activeStep = this.SysFlowEntryStep.PROCESS_STATUS;
          break;
        case this.SysFlowEntryStep.PROCESS_STATUS:
          // 保存状态信息
          this.onSaveFlowEntryBasicInfo().then(res => {
            this.$message.success('保存成功');
            this.activeStep = this.SysFlowEntryStep.PROCESS_DESIGN;
          }).catch(e => {
            console.log(e);
          });
          break;
      }
    },
    // 初始化流程基础信息
    initFlowEntryInfo () {
      this.formFlowEntryData = {
        processDefinitionName: undefined,
        processDefinitionKey: undefined,
        categoryId: undefined,
        bindFormType: this.SysFlowEntryBindFormType.ONLINE_FORM,
        pageId: undefined,
        defaultFormId: undefined,
        defaultRouterName: undefined,
        bpmnXml: undefined,
        diagramType: this.DiagramType.ORDINARY,
        encodedRule: {
          calculateWhenView: false,
          prefix: undefined,
          precisionTo: this.SysAutoCodeType.DAYS,
          middle: undefined,
          idWidth: undefined
        },
        extensionData: {},
        notifyTypes: undefined,
        cascadeDeleteBusinessData: false
      }
      this.activeStep = this.SysFlowEntryStep.BASIC;

      FlowEntryController.view(this, {
        entryId: this.dialogParams.flowEntry.entryId
      }).then(res => {
        this.formFlowEntryData = {
          ...this.formFlowEntryData,
          ...res.data,
          encodedRule: res.data.encodedRule != null ? JSON.parse(res.data.encodedRule) : {
            calculateWhenView: false,
            prefix: undefined,
            precisionTo: this.SysAutoCodeType.DAYS,
            middle: undefined,
            idWidth: undefined
          },
          extensionData: res.data.extensionData != null ? JSON.parse(res.data.extensionData) : {}
        }
        this.formFlowEntryData.notifyTypes = this.formFlowEntryData.extensionData.notifyTypes || [];
        this.formFlowEntryData.cascadeDeleteBusinessData = this.formFlowEntryData.extensionData.cascadeDeleteBusinessData || false;
        if (this.formFlowEntryData.bindFormType === this.SysFlowEntryBindFormType.ONLINE_FORM) {
          this.defaultFormIdWidget.onVisibleChange(true);
        }
      }).catch(e => {});
    },
    // 保存流程基础信息
    // 修改接口
    saveFlowEntryInfo () {
      const variableDisplay = [];
      console.log('当前变量map: ', this.useVariableMap);
      this.useVariableMap.forEach((value, key) => {
        value.forEach((item) => {
          variableDisplay.push({
            entryId: this.flowEntry.entryId,
            taskKey: key,
            variableId: item.id,
            variableLabel: item.label,
            variableAuthority: item.variableAuthority
          });
        })
      });
      this.$set(this.formFlowEntryData, 'ifVariableDisplay', this.activeStep === this.SysFlowEntryStep.PROCESS_DESIGN)
      this.$set(this.formFlowEntryData, 'variableDisplay', [...variableDisplay]);
      if (this.formFlowEntryData.extensionData == null) {
        this.formFlowEntryData.extensionData = {};
      }
      if (!Array.isArray(this.formFlowEntryData.extensionData.approvalStatusDict)) {
        this.$set(this.formFlowEntryData.extensionData, 'approvalStatusDict', [...defaultApprovalStatus]);
      }
      this.$set(this.formFlowEntryData.extensionData, 'notifyTypes', this.formFlowEntryData.notifyTypes);
      this.$set(this.formFlowEntryData.extensionData, 'cascadeDeleteBusinessData', this.formFlowEntryData.cascadeDeleteBusinessData);
      let params = {
        flowEntryDto: {
          ...this.formFlowEntryData,
          diagramType: this.$refs?.ProcessDesigner?.$refs?.processDesigner?.diagramType || this.formFlowEntryData.diagramType,
          extensionData: JSON.stringify(this.formFlowEntryData.extensionData)
        }
      }
      return this.isEdit ? FlowEntryController.update(this, params) : FlowEntryController.add(this, params);
    },
    onSaveFlowEntry (xml) {
      this.formFlowEntryData.bpmnXml = xml;
      this.onSaveFlowEntryBasicInfo().then(res => {
        this.$message.success('保存成功');
      }).catch(e => {});
    },
    updateVariableList (descInfo, variableValue) {
      if (this.useVariableMap.has(descInfo.elementId)) {
        let variableList = this.useVariableMap.get(descInfo.elementId);
        if (descInfo.operationType === 'delete') {
          variableList = variableList.filter(item => {
            return item.id !== descInfo.id;
          });
        } else if (descInfo.operationType === 'add') {
          variableList.push({
            id: variableValue.id,
            label: variableValue.label,
            variableAuthority: variableValue.authority?.toString()
          });
        } else {
          for (let i = 0; i < variableList.length; i++) {
            if (variableList[i].id === descInfo.id) {
              variableList[i].variableAuthority = variableValue.variableAuthority;
            }
          }
        }
        this.useVariableMap.set(descInfo.elementId, [...variableList]);
      } else {
        const variableList = [];
        if (descInfo.operationType === 'add') {
          variableList.push({
            id: variableValue.id,
            label: variableValue.label,
            variableAuthority: variableValue.authority?.toString()
          });
        } else {
          console.error('操作错误');
        }
        this.useVariableMap.set(descInfo.elementId, [...variableList]);
      }
    },
    onSaveFlowEntryBasicInfo () {
      return this.saveFlowEntryInfo();
    },
    // 获取流程绑定页面数据源信息
    initFlowEntryDatasourceInfo (entryId) {
      return FlowEntryController.viewDatasource(this, {
        entryId
      });
    },
    /**
     * 获取数据模型关联信息
     */
    loadDatasourceRelation () {
      if (this.entryDatasource == null) return Promise.resolve();
      return OnlineDatasourceRelationController.list(this, {
        onlineDatasourceRelationDtoFilter: {
          datasourceId: this.entryDatasource.datasourceId
        }
      });
    },
    // 获取在线表单数据表字段列表
    loadOnlineTableColumns (tableId, owner) {
      if (tableId == null || tableId === '') return Promise.reject();

      return new Promise((resolve, reject) => {
        let params = {
          onlineColumnDtoFilter: {
            tableId
          }
        }

        OnlineColumnController.list(this, params).then(res => {
          owner.columnList = res.data.dataList;
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 获取数据源下所有表字段
     */
    loadDatasourceAllColumnList () {
      if (this.entryDatasource == null) return Promise.resolve();
      let allHttpCalls = [
        this.loadOnlineTableColumns(this.entryDatasource.masterTableId, this.entryDatasource)
      ];
      this.entryDatasource.relationList.forEach(relation => {
        if (relation.relationType === this.SysOnlineRelationType.ONE_TO_ONE) {
          allHttpCalls.push(this.loadOnlineTableColumns(relation.slaveTableId, relation));
        }
      });

      return Promise.all(allHttpCalls);
    },
    // 获取流程绑定页面数据源信息
    initFlowDatasourceInfo () {
      return new Promise((resolve, reject) => {
        if (this.entryDatasource != null) return resolve();
        if (this.formFlowEntryData.bindFormType === this.SysFlowEntryBindFormType.ONLINE_FORM) {
          OnlinePageController.listOnlinePageDatasource(this, {
            pageId: this.formFlowEntryData.pageId
          }).then(res => {
            this.entryDatasource = res.data.dataList[0];
            return this.loadDatasourceRelation();
          }).then(res => {
            this.entryDatasource.relationList = res.data.dataList || [];
            return this.loadDatasourceAllColumnList();
          }).then(res => {
            return OnlineVirtualColumnController.list(this, {
              onlineVirtualColumnDtoFilter: {
                datasourceId: this.entryDatasource.datasourceId
              }
            });
          }).then(res => {
            let virtualColumnList = res.data.dataList;
            if (Array.isArray(virtualColumnList)) {
              if (!Array.isArray(this.entryDatasource.columnList)) this.entryDatasource.columnList = [];
              this.entryDatasource.columnList.push(...virtualColumnList.map(item => {
                return {
                  ...item,
                  columnId: item.virtualColumnId,
                  columnName: item.objectFieldName,
                  columnComment: item.columnPrompt
                }
              }));
            }
            resolve();
          }).catch(e => {
            reject(e);
          });
        } else {
          this.entryDatasource = null;
          resolve();
        }
      });
    },
    // 获取流程变量列表
    loadEntryVariableList () {
      return new Promise((resolve, reject) => {
        let params = {
          flowEntryVariableDtoFilter: {
            entryId: this.formFlowEntryData.entryId || this.dialogParams.flowEntry.entryId
          }
        }

        FlowEntryVariableController.list(this, params).then(res => {
          this.processVariableList = res.data.dataList;
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    addEntryVariable () {
      this.$dialog.show('添加变量', EditFlowEntryVariable, {
        area: '500px'
      }, {
        entryId: this.formFlowEntryData.entryId || this.dialogParams.flowEntry.entryId,
        datasource: this.entryDatasource,
        path: 'thirdFormEditFlowEntryVariable'
      }, {
        width: '500px',
        height: '260px',
        pathName: '/thirdParty/thirdFormEditFlowEntryVariable'
      }).then(res => {
        this.loadEntryVariableList();
      }).catch(e => {});
    },
    editEntryVariable (row) {
      this.$dialog.show('编辑变量', EditFlowEntryVariable, {
        area: '500px'
      }, {
        entryId: this.formFlowEntryData.entryId || this.dialogParams.flowEntry.entryId,
        datasource: this.entryDatasource,
        rowData: row,
        path: 'thirdFormEditFlowEntryVariable'
      }, {
        width: '500px',
        height: '260px',
        pathName: '/thirdParty/thirdFormEditFlowEntryVariable'
      }).then(res => {
        this.loadEntryVariableList();
      }).catch(e => {});
    },
    deleteEntryVariable (row) {
      this.$confirm('是否删除此流程变量？').then(res => {
        let params = {
          variableId: row.variableId
        }

        return FlowEntryVariableController.delete(this, params);
      }).then(res => {
        this.$message.success('删除成功！');
        this.loadEntryVariableList();
      }).catch(e => {});
    },
    editEntryStatus (row) {
      this.$dialog.show(row ? '编辑状态' : '添加状态', EditFlowEntryStatus, {
        area: '500px'
      }, {
        rowData: row,
        flowEntry: this.formFlowEntryData,
        path: 'thirdFormEditFlowEntryStatus'
      }, {
        width: '500px',
        height: '220px',
        pathName: '/thirdParty/thirdFormEditFlowEntryStatus'
      }).then(approvalStatusDict => {
        this.formFlowEntryData.extensionData.approvalStatusDict = [...approvalStatusDict];
      }).catch(e => {});
    },
    deleteEntryStatus (row) {
      this.$confirm('是否删除此流程状态？').then(res => {
        let approvalStatusDict = this.formFlowEntryData.extensionData.approvalStatusDict.filter(item => {
          return item.id !== row.id;
        });

        let params = {
          flowEntryDto: {
            ...this.formFlowEntryData,
            extensionData: JSON.stringify({
              approvalStatusDict
            })
          }
        }
        FlowEntryController.update(this, params).then(res => {
          this.$message.success('删除成功！');
          this.formFlowEntryData.extensionData.approvalStatusDict = approvalStatusDict;
        }).catch(e => {});
      }).catch(e => {});
    }
  },
  computed: {
    dialogParams () {
      return {
        flowEntry: this.flowEntry || this.thirdParams.flowEntry
      }
    },
    isEdit () {
      return this.dialogParams.flowEntry != null || this.formFlowEntryData.entryId != null;
    },
    ...mapGetters(['getClientHeight'])
  },
  mounted () {
    // 初始化页面数据
    this.categoryIdWidget.onVisibleChange(true);
    this.pageIdWidget.onVisibleChange(true);
    if (this.isEdit) {
      this.initFlowEntryInfo();
    }
    this.getVariableDisplayInfo();
  },
  watch: {
  }
}
</script>

<style scoped>
  .edit-online-form {
    position: fixed;
    width: 100vw;
    height: 100vh;
    background: white;
    top: 0px;
    left: 0px;
    z-index: 100
  }
  .edit-online-form >>> .el-steps--simple {
    background: white!important;
    padding: 13px 0px;
    width: 800px;
  }
  .edit-online-form >>> .vxe th,.edit-online-form  >>> .vxe td {
    padding: 6px 0px;
  }
  .edit-online-form >>> .el-scrollbar__bar {
    display: none;
  }
  .edit-online-form .header {
    height: 72px;
    line-height: 72px;
  }
  .edit-online-form .title {
    font-size: 24px;
    flex-grow: 0 !important;
  }

  .edit-online-form .title > i {
    color: #FDA834;
    margin-right: 10px;
  }

  .edit-online-form .main-box {
    padding: 20px;
    background: white;
    height: 100%;
  }

  .edit-online-form .btn-add {
    width: 100%;
    margin-top: 10px;
    border: 1px dashed #EBEEF5;
  }

  .edit-online-form >>> .vxe td{
    font-size: 12px;
    color: #666666;
  }
</style>
