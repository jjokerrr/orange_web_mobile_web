<template>
  <div>
    <div v-if="tabType==='baseInfo'">
      <el-form ref="form" :size="defaultFormItemSize" :model="formData" :rules="rules" @submit.native.prevent>
        <el-form-item label="表单路由" prop="routerName"
          v-if="flowEntry().bindFormType === SysFlowEntryBindFormType.ROUTER_FORM">
          <el-input v-model="formData.routerName" clearable @change="updateElementFormKey" />
        </el-form-item>
        <el-form-item label="在线表单" prop="formId"
          v-if="flowEntry().bindFormType === SysFlowEntryBindFormType.ONLINE_FORM">
          <el-select v-model="formData.formId" clearable placeholder="" @change="updateElementFormKey">
            <el-option v-for="item in formList().filter(item => item.formType === SysOnlineFormType.FLOW)" :key="item.formId" :label="item.formName" :value="item.formId" />
          </el-select>
        </el-form-item>
        <el-form-item label="允许编辑" style="margin-bottom: 4px">
          <el-switch v-model="formData.editable" @change="updateElementFormKey" style="margin-left: 18px"/>
        </el-form-item>
      </el-form>
    </div>
    <div v-else-if="tabType==='attributeSet'">
      <el-row style="padding-top: 3px">
        <el-col :span="24">
          <vxe-table :data="formAttributeList" header-cell-class-name="table-header-gray">
            <vxe-column title="序号" width="50px" type="seq" />
            <vxe-column title="变量名称" width="100px">
              <template slot-scope="scope">
                <span style="font-size: 12px">{{scope.row.label}}</span>
              </template>
            </vxe-column>
            <vxe-column title="变量权限" min-width="120px">
              <template slot-scope="scope">
                <el-radio-group size="medium" v-model="scope.row.variableAuthority" @input="onChangeAuthority(scope.row)" style="display: flex;">
                  <el-radio label="1" style="margin: 3px;">只读</el-radio>
                  <el-radio label="2" style="margin: 3px;">可编辑</el-radio>
                  <el-radio label="3" style="margin: 3px;">隐藏</el-radio>
                </el-radio-group>
              </template>
            </vxe-column>
            <vxe-column title="操作" width="50px">
              <template slot-scope="scope">
                <el-button :size="defaultFormItemSize" type="text" @click="onDeleteOperationAuthority(scope.row)" style="padding: 0">删除</el-button>
              </template>
            </vxe-column>
            <template slot="empty">
              <div class="table-empty unified-font">
                <img src="@/assets/img/empty.png">
                <span>暂无数据</span>
              </div>
            </template>
          </vxe-table>
          <!-- <el-button class="full-line-btn" icon="el-icon-plus" @click="onEditOperation(null)">添加按钮</el-button> -->
        </el-col>
      </el-row>
    </div>
    <div v-else-if="tabType==='button'">
      <el-row style="padding-top: 3px">
        <!-- <el-col :span="24">
          <el-divider>按钮设置</el-divider>
        </el-col> -->
        <el-col :span="24">
          <vxe-table :data="formOperationList" header-cell-class-name="table-header-gray">
            <vxe-column title="序号" width="50px" type="seq" />
            <vxe-column title="按钮名称" min-width="100px">
              <template slot-scope="scope">
                <span style="font-size: 12px">{{scope.row.label}}</span>
              </template>
            </vxe-column>
            <vxe-column title="按钮类型" min-width="100px">
              <template slot-scope="scope">
                <el-tag :size="defaultFormItemSize" effect="dark">{{SysFlowTaskOperationType.getValue(scope.row.type)}}</el-tag>
              </template>
            </vxe-column>
            <!-- <vxe-column title="显示顺序" min-width="100px" prop="showOrder"></vxe-column> -->
            <vxe-column title="操作" width="90px">
              <template slot-scope="scope">
                <el-button :size="defaultFormItemSize" type="text" @click="onEditOperation(scope.row)" style="padding: 0">编辑</el-button>
                <el-button :size="defaultFormItemSize" type="text" @click="onDeleteOperation(scope.row)" style="padding: 0">删除</el-button>
              </template>
            </vxe-column>
            <template slot="empty">
              <div class="table-empty unified-font">
                <img src="@/assets/img/empty.png">
                <span>暂无数据</span>
              </div>
            </template>
          </vxe-table>
          <!-- <el-button class="full-line-btn" icon="el-icon-plus" @click="onEditOperation(null)">添加按钮</el-button> -->
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import EditOperation from './formEditOperation.vue';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'flowFormConfig',
  mixins: [refreshDataMixins],
  props: {
    id: String,
    type: String,
    tabType: String,
    useVariableMap: {
      type: Map,
    },
    entryId: {
      type: String,
      defalut: ''
    }
  },
  inject: ['flowEntry', 'formList', 'prefix', 'onUpdateVariableList'],
  data () {
    return {
      formData: {
        formId: this.flowEntry().defaultFormId,
        routerName: this.flowEntry().defaultRouterName,
        editable: false
      },
      operationList: undefined,
      formAttributeList: [],
      formOperationList: [],
      rules: {
        formId: [
          {required: true, message: '请选择在线表单！', trigger: 'blur'}
        ],
        routerName: [
          {required: true, message: '表单路由不能为空！', trigger: 'blur'}
        ]
      }
    }
  },
  mounted () {
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdEditOperation' && data.isSuccess) {
        this.updateEditOperation(data.data)
      }
    },
    resetFormList () {
      this.bpmnELement = window.bpmnInstances.bpmnElement;
      let formData = this.bpmnELement.businessObject.formKey;
      let formObj = formData ? JSON.parse(formData) : undefined;
      if (formObj) {
        this.formData = {
          formId: formObj.formId,
          routerName: formObj.routerName,
          editable: !formObj.readOnly,
          groupType: formObj.groupType || 'ASSIGNEE'
        }
      }
      let elExtensionElements = this.bpmnELement.businessObject.get("extensionElements") || window.bpmnInstances.moddle.create("bpmn:ExtensionElements", { values: [] });
      this.operationList = elExtensionElements.values.filter(ex => ex.$type === `${this.prefix}:OperationList`)?.[0] ||
        window.bpmnInstances.moddle.create(`${this.prefix}:OperationList`, { operationList: [] });
      this.formOperationList = JSON.parse(JSON.stringify(this.operationList.operationList || []));
      this.formOperationList.forEach(item => {
        item.showOrder = Number.parseInt(item.showOrder);
      });
      // 更新元素扩展属性，避免后续报错
      this.updateElementFormKey();
      this.updateElementExtensions();
    },
    updateElementFormKey () {
      this.$refs.form?.validate(valid => {
        if (!valid) return;
        let formKeyString = JSON.stringify({
          formId: this.flowEntry().bindFormType === this.SysFlowEntryBindFormType.ONLINE_FORM ? this.formData.formId : undefined,
          routerName: this.flowEntry().bindFormType === this.SysFlowEntryBindFormType.ONLINE_FORM ? undefined : this.formData.routerName,
          readOnly: !this.formData.editable,
          groupType: this.formData.groupType || 'ASSIGNEE'
        });
        window.bpmnInstances.modeling.updateProperties(this.bpmnELement, { formKey: formKeyString });
      });
    },
    updateElementExtensions () {
      // 更新回扩展元素
      let elExtensionElements = this.bpmnELement.businessObject.get("extensionElements")  || window.bpmnInstances.moddle.create("bpmn:ExtensionElements", { values: [] });
      let otherExtensions = elExtensionElements.values.filter(ex => ex.$type !== `${this.prefix}:OperationList`);
      const newElExtensionElements = window.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
        values: otherExtensions.concat(this.operationList)
      });
      this.operationList.operationList = this.formOperationList.map(item => {
        return window.bpmnInstances.moddle.create(`${this.prefix}:FormOperation`, {
          id: item.id,
          label: item.label,
          type: item.type,
          showOrder: item.showOrder,
          latestApprovalStatus: item.latestApprovalStatus,
          multiSignAssignee: item.multiSignAssignee
        });
      });

      // 更新到元素上
      window.bpmnInstances.modeling.updateProperties(this.bpmnELement, {
        extensionElements: newElExtensionElements
      });
    },
    onEditOperation (operation) {
      let attributeList = [];
      this.$dialog.show(this.tabType === 'button'? (operation ? '编辑按钮' : '添加按钮'): '添加变量' , EditOperation, {
        area: '500px'
      }, {
        tabType: this.tabType,
        rowData: operation,
        validStatusLiist: this.getFlowEntryValidStatus,
        entryId: this.entryId,
        path: 'thirdEditOperation'
      }, {
        width: '1000px',
        height: '450px',
        pathName: '/thirdParty/thirdEditOperation'
      }).then(res => {
        if(this.tabType === 'attributeSet'){
          this.updateAttributeEditOperation(res);
        }
        else{
          this.updateEditOperation(res)
        }
      });
    },
    updateEditOperation (res) {
      if (res.id == null) {
        res.id = new Date().getTime();
        this.formOperationList.push(res);
      } else {
        this.formOperationList.forEach(item => {
          if (item.id === res.id) {
            item.label = res.label;
            item.type = res.type;
            item.showOrder = res.showOrder;
            item.multiSignAssignee = res.multiSignAssignee;
            item.latestApprovalStatus = res.latestApprovalStatus;
          }
        });
      }
      this.formOperationList.sort((value1, value2) => {
        return value1.showOrder - value2.showOrder;
      });
      this.updateElementExtensions();
    },
    onDeleteOperation (operation) {
      this.$confirm('是否删除此按钮？').then(res => {
        this.formOperationList = this.formOperationList.filter(item => {
          return item.id !== operation.id;
        });
        this.updateElementExtensions();
      }).catch(e => {});
    },
    // 修改地点
    onChangeAuthority(record) {
      const descInfo = {
        operationType: 'update',
        elementId: this.id,
        id: record.id
      }
      this.onUpdateVariableList(descInfo, record);
    },
    updateAttributeEditOperation(res){
      let sign = false;
      this.formAttributeList.forEach(item => {
        if(item.id === res.id){
          item.variableAuthority = res.authority?.toString();
          sign = true;
        }
      })
      if(sign) return;
      const descInfo = {
        operationType: 'add',
        elementId: this.id,
        id: res.id
      }
      this.onUpdateVariableList(descInfo, res);
      sign = true;
      this.formAttributeList.forEach((item) => {
        if(item.id === res.id){
          sign = false;
        }
      });
      if(sign){
        this.formAttributeList.push({
          id: res.id,
          label: res.label,
          variableAuthority: res.authority?.toString()
        });
      }
    },
    onDeleteOperationAuthority(operation) {
      this.$confirm('是否删除此按钮？').then(res => {
        this.formAttributeList = this.formAttributeList.filter(item => {
          return item.id !== operation.id;
        });
        const descInfo = {
          operationType: 'delete',
          elementId: this.id,
          id: operation.id
        }
        this.onUpdateVariableList(descInfo, operation);
      }).catch(e => {});
    }
  },
  computed: {
    getFlowEntryValidStatus () {
      if (this.flowEntry().extensionData != null && Array.isArray(this.flowEntry().extensionData.approvalStatusDict)) {
        return this.flowEntry().extensionData.approvalStatusDict;
      } else {
        return [];
      }
    }
  },
  watch: {
    id: {
      immediate: true,
      handler (val) {
        if(this.tabType === 'attributeSet'){
          if(this.useVariableMap.has(this.id)){
            this.formAttributeList = this.useVariableMap.get(this.id);
          }
          else{
            this.formAttributeList = [];
          }
        }
        if (val && val.length) {
          this.$nextTick(() => {
            this.resetFormList();
          });
        }
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .full-line-btn {
    width: 100%;
    margin-top: 10px;
    border: 1px dashed #EBEEF5;
  }
  .el-tag{
    background: #FFF8E5;
    border-color: #FFF8E5;
    color: #FFB800;
  }
  ::v-deep .table-btn {
    color: #999999;
  }
</style>
