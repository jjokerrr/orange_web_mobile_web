<template>
  <el-tabs class="properties-panel" v-model="activeName" :style="{ width: `430px` }">
    <el-tab-pane label="基础设置" name="baseInfo">
      <div class="panel-label" slot="label">基础设置</div>
      <div class="process-panel__container">
        <div>
          <!-- <div class="panel-title">任务设置</div> -->
          <element-base-info :id-edit-disabled="idEditDisabled" :business-object="elementBusinessObject" :type="elementType" />

          <element-form :id="elementId" :type="elementType" :tabType="activeName" v-if="formVisible && activeName === 'baseInfo'" key="form"/>

          <form-variable :id="elementId" :type="elementType" v-if="formVisible" key="variable"/>

          <element-multi-instance @isCountersignChange="isCountersignChange" :business-object="elementBusinessObject" :type="elementType" :key="elementBusinessObject.id" v-if="elementType && (elementType.indexOf('Task') !== -1 || elementType === 'SubProcess')"/>
        </div>

        <div v-if="formVisible" key="goback">
          <GoBack :id="elementId" :isCountersign="isCountersign"/>
        </div>

        <div v-if="conditionFormVisible" key="condition">
          <flow-condition :business-object="elementBusinessObject" :type="elementType" />
        </div>

        <div v-if="conditionFormVisible" key="status">
          <div class="panel-title">更新工单状态</div>
          <SetApproveStatus :id="elementId" :type="elementType" />
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="按钮设置" name="button" v-if="formVisible">
      <div class="panel-label" slot="label">按钮设置</div>
      <div class="process-panel__container">
        <div v-if="formVisible" key="form">
          <div class="panel-title">
            按钮
            <right-add-btn @click.prevent.stop="$refs.elementForm.onEditOperation()">添加</right-add-btn>
          </div>
          <element-form v-if="activeName === 'button'" :id="elementId" :type="elementType" :tabType="activeName" ref="elementForm"/>
        </div>

        <div v-if="formVisible">
          <AutoAgree :id="elementId" :isCountersign="isCountersign"/>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="任务处理人" name="taskHandler" v-if="formVisible">
      <div class="panel-label" slot="label">任务处理人</div>
      <div class="process-panel__container">
        <div v-if="elementType && (elementType.indexOf('Task') !== -1 || elementType === 'SubProcess')" key="task">
          <element-task :id="elementId" :type="elementType" :isCountersign="isCountersign"/>
        </div>
        <div v-if="formVisible" key="copyFor">
          <div class="panel-title">
            抄送设置
          </div>
          <CopyForSelect :id="elementId" :type="elementType" ref="copyForSelect"/>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="其他设置" name="other">
      <div class="panel-label" slot="label">其他设置</div>
      <div class="process-panel__container">
        <div key="message" v-if="elementType === 'Process'">
          <signal-and-massage />
        </div>

        <div key="listeners" v-if="elementType" style="margin-bottom: 10px">
          <div class="panel-title">
            执行监听器
            <right-add-btn @click.prevent.stop="$refs.listeners.openListenerForm()">添加</right-add-btn>
          </div>
          <element-listeners ref="listeners" :id="elementId" :type="elementType" />
        </div>

        <div key="taskListeners" v-if="elementType === 'UserTask'" style="margin-bottom: 10px">
          <div class="panel-title">
            任务监听器
            <right-add-btn @click.prevent.stop="$refs.useTaskListeners.openListenerForm()">添加</right-add-btn>
          </div>
          <user-task-listeners :id="elementId" :type="elementType" ref="useTaskListeners"/>
        </div>

        <div key="extensions"  v-if="elementType && !conditionFormVisible">
          <div class="panel-title">
            扩展属性
            <right-add-btn @click.prevent.stop="$refs.properties.openAttributesForm(null, -1)">添加</right-add-btn>
          </div>
          <element-properties :id="elementId" :type="elementType" ref="properties"/>
        </div>

        <!-- <div key="other" v-if="elementType">
          <div class="panel-title">其他</div>
          <element-other-config :id="elementId" />
        </div> -->
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import ElementBaseInfo from "./base/ElementBaseInfo";
import ElementOtherConfig from "./other/ElementOtherConfig";
import ElementTask from "./task/ElementTask";
import ElementMultiInstance from "./multi-instance/ElementMultiInstance";
import FlowCondition from "./flow-condition/FlowCondition";
import SignalAndMassage from "./signal-message/SignalAndMessage";
import ElementListeners from "./listeners/ElementListeners";
import ElementProperties from "./properties/ElementProperties";
import SetApproveStatus from "./properties/SetApproveStatus";
// import ElementForm from "./form/ElementForm";
import ElementForm from "./form/flowFormConfig";
import FormVariable from "./form-variable/index.vue";
import CopyForSelect from "./copy-for/index.vue";
import UserTaskListeners from "./listeners/UserTaskListeners";
import AutoAgree from "./autoAgree/index";
import GoBack from "./goBack/index";
// import ElementMultiInstanceAssignee from './multi-instance/ElementMultiInstanceAssignee.vue';

/**
 * 侧边栏
 * @Author MiyueFE
 * @Home https://github.com/miyuesc
 * @Date 2021年3月31日18:57:51
 */
export default {
  name: "MyPropertiesPanel",
  components: {
    UserTaskListeners,
    ElementForm,
    FormVariable,
    ElementProperties,
    ElementListeners,
    SignalAndMassage,
    FlowCondition,
    ElementMultiInstance,
    ElementTask,
    ElementOtherConfig,
    ElementBaseInfo,
    SetApproveStatus,
    CopyForSelect,
    AutoAgree,
    GoBack
    // ElementMultiInstanceAssignee
  },
  componentName: "MyPropertiesPanel",
  props: {
    bpmnModeler: Object,
    prefix: {
      type: String,
      default: "camunda"
    },
    width: {
      type: Number,
      default: 480
    },
    idEditDisabled: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      prefix: this.prefix,
      width: this.width
    };
  },
  data() {
    return {
      activeName: 'baseInfo',
      activeTab: ['base','form'],
      elementId: "",
      elementType: "",
      elementBusinessObject: {}, // 元素 businessObject 镜像，提供给需要做判断的组件使用
      conditionFormVisible: false, // 流转条件设置
      formVisible: false, // 表单配置
      isCountersign: false
    };
  },
  watch: {
    elementId: {
      handler() {
        this.activeTab = ['base','form'];
      }
    },
    formVisible: {
      deep: true,
      handler(val) {
        if(!val && ['baseInfo', 'other'].indexOf(this.activeName) === -1) {
          this.activeName = 'baseInfo'
        }
      }
    }
  },
  created() {
    this.initModels();
  },
  methods: {
    initModels() {
      // 初始化 modeler 以及其他 moddle
      if (!this.bpmnModeler) {
        // 避免加载时 流程图 并未加载完成
        this.timer = setTimeout(() => this.initModels(), 10);
        return;
      }
      if (this.timer) clearTimeout(this.timer);
      window.bpmnInstances = {
        modeler: this.bpmnModeler,
        modeling: this.bpmnModeler.get("modeling"),
        moddle: this.bpmnModeler.get("moddle"),
        eventBus: this.bpmnModeler.get("eventBus"),
        bpmnFactory: this.bpmnModeler.get("bpmnFactory"),
        elementRegistry: this.bpmnModeler.get("elementRegistry"),
        replace: this.bpmnModeler.get("replace"),
        selection: this.bpmnModeler.get("selection")
      };
      this.getActiveElement();
    },
    getActiveElement() {
      // 初始第一个选中元素 bpmn:Process
      this.initFormOnChanged(null);
      this.bpmnModeler.on("import.done", e => {
        this.initFormOnChanged(null);
      });
      // 监听选择事件，修改当前激活的元素以及表单
      this.bpmnModeler.on("selection.changed", ({ newSelection }) => {
        this.initFormOnChanged(newSelection[0] || null);
      });
      this.bpmnModeler.on("element.changed", ({ element }) => {
        // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
        if (element && element.id === this.elementId) {
          this.initFormOnChanged(element);
        }
      });
    },
    // 初始化数据
    initFormOnChanged(element) {
      let activatedElement = element;
      if (!activatedElement) {
        activatedElement =
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Process") ??
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Collaboration");
      }
      if (!activatedElement) return;

      window.bpmnInstances.bpmnElement = activatedElement;
      this.bpmnElement = activatedElement;
      this.elementId = activatedElement.id;
      this.elementType = activatedElement.type.split(":")[1];
      this.elementBusinessObject = JSON.parse(JSON.stringify(activatedElement.businessObject));
      this.conditionFormVisible = !!(
        this.elementType === "SequenceFlow" &&
        activatedElement.source &&
        activatedElement.source.type.indexOf("StartEvent") === -1
      );
      this.formVisible = this.elementType === "UserTask";
    },
    isCountersignChange(bol){
      this.isCountersign = bol;
    }
  },
  beforeDestroy() {
    window.bpmnInstances = null;
  }
};
</script>

<style lang="scss">
@import '@/assets/style/element-variables.scss';
.properties-panel.el-tabs{
  border-left: 1px solid #E8E8E8;
  .el-tabs__nav-wrap::after{
    height: 1px !important;
  }
  .el-tabs__item{
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: #333333;
    padding: 0 18px !important;
    &.is-top:nth-child(2){
      padding-left: 16px !important;
    }
  }
  .el-tabs__header{
    margin-bottom: 10px !important;
  }
  .el-tabs__content{
    width: 430px;
    height: calc(100% - 60px);
    overflow: auto;
  }
  .el-tab-pane,.process-panel__container{
    width: 100%;
    box-sizing: border-box;
    box-shadow: none;
    min-height: 100%;
    border-left: 0;
    .el-form-item{
      margin-bottom: 10px;
    }
  }
  .process-panel__container{
    padding: 0 18px;
  }
  .panel-tab__content{
    border-top: 0;
    padding: 10px 0 0;
  }
  .is-active{
    font-weight: bold;
    color: $--color-primary;
  }


  .el-form-item__label{
    color: #333333;
    font-size: 12px;
  }

  .el-button{
    font-weight: normal;
  }
}
.panel-title{
  font-size: 12px;
  color: #333333;
  line-height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-label{
  padding: 0px 2px;
  font-size: 14px;
}
.process-panel__container div:first-child .panel-title{margin-top: 0;}
.el-table th{
  background-color: #F6F7F9 !important;
  color: #666666 !important;
  font-size: 12px;
  font-weight: normal;
}
</style>
