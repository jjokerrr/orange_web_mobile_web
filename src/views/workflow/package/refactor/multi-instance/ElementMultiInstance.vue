<template>
  <div class="panel-tab__content" style="padding-top: 0px">
    <el-form :size="defaultFormItemSize" @submit.native.prevent>
      <el-form-item label="是否会签" style="margin-bottom: 4px">
        <el-switch v-model="isCountersign" style="margin-left: 18px" @change="isCountersignChange"/>
      </el-form-item>
      <div v-if="isCountersign">
        <el-form-item label="内置变量" style="margin-bottom: 5px">
          <el-button class="variables-btn" type="primary" @click="showVariableDlg = true" size="mini" plain>查看</el-button>
        </el-form-item>
        <!-- <el-form-item label="回路特性">
          <el-select v-model="loopCharacteristics" @change="changeLoopCharacteristicsType" disabled>
            bpmn:MultiInstanceLoopCharacteristics
            <el-option label="并行多重事件" value="ParallelMultiInstance" />
            <el-option label="时序多重事件" value="SequentialMultiInstance" />
            bpmn:StandardLoopCharacteristics
            <el-option label="循环事件" value="StandardLoop" />
            <el-option label="无" value="Null" />
          </el-select>
        </el-form-item> -->
        <template v-if="loopCharacteristics === 'ParallelMultiInstance' || loopCharacteristics === 'SequentialMultiInstance'">
          <!--
          <el-form-item label="循环基数" key="loopCardinality">
            <el-input v-model="loopInstanceForm.loopCardinality" clearable @change="updateLoopCardinality" />
          </el-form-item>
          -->
          <!-- <el-form-item label="集合" key="collection">
            <el-input v-model="loopInstanceForm.collection" clearable @change="updateLoopBase" />
          </el-form-item>
          <el-form-item label="元素变量" key="elementVariable">
            <el-input v-model="loopInstanceForm.elementVariable" clearable @change="updateLoopBase" />
          </el-form-item> -->
          <el-form-item label="完成条件" key="completionCondition">
            <el-input v-model="loopInstanceForm.completionCondition" clearable @change="updateLoopCondition" />
          </el-form-item>
          <!-- <el-form-item label="异步状态" key="async">
            <el-checkbox v-model="loopInstanceForm.asyncBefore" label="异步前" @change="updateLoopAsync('asyncBefore')" />
            <el-checkbox v-model="loopInstanceForm.asyncAfter" label="异步后" @change="updateLoopAsync('asyncAfter')" />
            <el-checkbox
              v-model="loopInstanceForm.exclusive"
              v-if="loopInstanceForm.asyncAfter || loopInstanceForm.asyncBefore"
              label="排除"
              @change="updateLoopAsync('exclusive')"
            />
          </el-form-item> -->
          <el-form-item label="重试周期" prop="timeCycle" v-if="loopInstanceForm.asyncAfter || loopInstanceForm.asyncBefore" key="timeCycle">
            <el-input v-model="loopInstanceForm.timeCycle" clearable @change="updateLoopTimeCycle" />
          </el-form-item>
        </template>
      </div>
      <el-form-item label="任务通知">
      <el-select v-model="sendMessageType" multiple clearable @change="updateElementTask('sendMessageType')" placeholder="">
          <el-option label="邮件" value="email" />
        </el-select>
      </el-form-item>
      <!--
      <el-col :span="24">
        <el-divider>内置变量</el-divider>
      </el-col>
      <el-col :span="24" style="border-top: 1px solid #EBEEF5;">
        <el-table :data="variableList" :show-header="false">
          <el-table-column label="变量名称" prop="name" width="180px" />
          <el-table-column label="描述" prop="desc" />
        </el-table>
      </el-col>
      -->
    </el-form>
    <el-dialog title="内置变量" :visible.sync="showVariableDlg" width="800px" append-to-body destroy-on-close custom-class="panel-dialog">
      <div style="padding: 16px 20px">
        <vxe-table :data="variableList" :size="defaultFormItemSize">
          <vxe-column title="变量名称" field="name" width="180px" />
          <vxe-column title="描述" field="desc" />
          <template slot="empty">
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png">
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ElementMultiInstance",
  props: {
    businessObject: Object,
    type: String
  },
  inject: {
    prefix: "prefix"
  },
  data() {
    return {
      isCountersign: true,
      showVariableDlg: false,
      loopCharacteristics: "ParallelMultiInstance",
      sendMessageType: [],
      //默认配置，用来覆盖原始不存在的选项，避免报错
      defaultLoopInstanceForm: {
        completionCondition: "",
        loopCardinality: "",
        extensionElements: [],
        asyncAfter: false,
        asyncBefore: false,
        exclusive: false
      },
      loopInstanceForm: {
        collection: 'assigneeList',
        elementVariable: 'assignee'
      },
      variableList: [
        {
          name: 'assigneeList',
          desc: '多实例用户集合变量'
        },
        {
          name: 'nrOfInstances',
          desc: '实例总数'
        },
        {
          name: 'nrOfActiveInstances',
          desc: '当前活动的（即未完成的），实例数量。对于顺序多实例，这个值总为1'
        },
        {
          name: 'nrOfCompletedInstances',
          desc: '已完成的实例数量'
        },
        {
          name: 'multiNumOfInstances',
          desc: '实例总数（多实例节点后使用这个变量判断）'
        },
        {
          name: 'multiAgreeCount',
          desc: '同意实例数量'
        },
        {
          name: 'multiRefuseCount',
          desc: '拒绝实例数量'
        },
        {
          name: 'multiAbstainCount',
          desc: '弃权实例数量'
        }
      ]
    };
  },
  watch: {
    id: {
      handler() {
        if(this.businessObject){
          this.getElementLoop(this.businessObject);
        }
      }
    },
    businessObject: {
      immediate: true,
      handler(val) {
        this.bpmnElement = window.bpmnInstances.bpmnElement;
        this.getElementLoop(val);
      }
    },
    isCountersign: {
      handler(bol) {
        this.$emit('isCountersignChange', bol)
      }
    }
  },
  methods: {
    getElementLoop(businessObject) {
      let value = (window.bpmnInstances.bpmnElement || {}).businessObject.sendMessageType
      this.sendMessageType = (value != null && value !== '') ? value.split(',') : [];

      this.$emit('isCountersignChange', !!businessObject.loopCharacteristics)

      if (!businessObject.loopCharacteristics) {
        this.loopCharacteristics = "Null";
        this.loopInstanceForm = {};
        this.isCountersign = false;
        return;
      }
      if (businessObject.loopCharacteristics.$type === "bpmn:StandardLoopCharacteristics") {
        this.loopCharacteristics = "StandardLoop";
        this.loopInstanceForm = {};
        return;
      }
      if (businessObject.loopCharacteristics.isSequential) {
        this.loopCharacteristics = "SequentialMultiInstance";
      } else {
        this.loopCharacteristics = "ParallelMultiInstance";
      }
      // 合并配置
      this.loopInstanceForm = {
        ...this.defaultLoopInstanceForm,
        ...businessObject.loopCharacteristics,
        completionCondition: businessObject.loopCharacteristics?.completionCondition?.body ?? "",
        loopCardinality: businessObject.loopCharacteristics?.loopCardinality?.body ?? ""
      };
      // 保留当前元素 businessObject 上的 loopCharacteristics 实例
      this.multiLoopInstance = window.bpmnInstances.bpmnElement.businessObject.loopCharacteristics;
      // 更新表单
      if (
        businessObject.loopCharacteristics.extensionElements &&
        businessObject.loopCharacteristics.extensionElements.values &&
        businessObject.loopCharacteristics.extensionElements.values.length
      ) {
        this.$set(this.loopInstanceForm, "timeCycle", businessObject.loopCharacteristics.extensionElements.values[0].body);
      }
    },
    changeLoopCharacteristicsType(type) {
      // this.loopInstanceForm = { ...this.defaultLoopInstanceForm }; // 切换类型取消原表单配置
      // 取消多实例配置
      if (type === "Null") {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, { loopCharacteristics: null });
        return;
      }
      // 配置循环
      if (type === "StandardLoop") {
        const loopCharacteristicsObject = window.bpmnInstances.moddle.create("bpmn:StandardLoopCharacteristics");
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          loopCharacteristics: loopCharacteristicsObject
        });
        this.multiLoopInstance = null;
        return;
      }
      // 时序
      if (type === "SequentialMultiInstance") {
        this.multiLoopInstance = window.bpmnInstances.moddle.create("bpmn:MultiInstanceLoopCharacteristics", { isSequential: true });
      } else {
        this.multiLoopInstance = window.bpmnInstances.moddle.create("bpmn:MultiInstanceLoopCharacteristics");
      }

      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        loopCharacteristics: this.multiLoopInstance
      });

      this.updateLoopBase();
    },
    // 循环基数
    updateLoopCardinality(cardinality) {
      let loopCardinality = null;
      if (cardinality && cardinality.length) {
        loopCardinality = window.bpmnInstances.moddle.create("bpmn:FormalExpression", { body: cardinality });
      }
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, { loopCardinality });
    },
    // 完成条件
    updateLoopCondition(condition) {
      let completionCondition = null;
      if (condition && condition.length) {
        completionCondition = window.bpmnInstances.moddle.create("bpmn:FormalExpression", { body: condition });
      }
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, { completionCondition });
    },
    // 重试周期
    updateLoopTimeCycle(timeCycle) {
      const extensionElements = window.bpmnInstances.moddle.create("bpmn:ExtensionElements", {
        values: [
          window.bpmnInstances.moddle.create(`${this.prefix}:FailedJobRetryTimeCycle`, {
            body: timeCycle
          })
        ]
      });
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, { extensionElements });
    },
    // 直接更新的基础信息
    updateLoopBase() {
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, {
        collection: this.loopInstanceForm.collection || null,
        elementVariable: this.loopInstanceForm.elementVariable || null
      });
    },
    // 各异步状态
    updateLoopAsync(key) {
      const { asyncBefore, asyncAfter } = this.loopInstanceForm;
      let asyncAttr = Object.create(null);
      if (!asyncBefore && !asyncAfter) {
        this.$set(this.loopInstanceForm, "exclusive", false);
        asyncAttr = { asyncBefore: false, asyncAfter: false, exclusive: false, extensionElements: null };
      } else {
        asyncAttr[key] = this.loopInstanceForm[key];
      }
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.multiLoopInstance, asyncAttr);
    },
    isCountersignChange(bol){
      if(!bol){
        this.loopCharacteristics = "Null";
        this.loopInstanceForm = {};
        this.changeLoopCharacteristicsType("Null");
        window.bpmnInstances.modeling.updateProperties(window.bpmnInstances.bpmnElement, {
          assignee: undefined
        });
      } else {
        this.loopCharacteristics = "ParallelMultiInstance";
        this.loopInstanceForm = {
          collection: 'assigneeList',
          elementVariable: 'assignee'
        };
        this.changeLoopCharacteristicsType("ParallelMultiInstance");
      }
    },
    updateElementTask() {
      let taskAttr = Object.create(null);
      taskAttr.sendMessageType = this.sendMessageType.join(',');
      window.bpmnInstances.modeling.updateProperties(window.bpmnInstances.bpmnElement, taskAttr);
    },
  },
  beforeDestroy() {
    this.multiLoopInstance = null;
    this.bpmnElement = null;
  }
};
</script>

<style lang="scss">
  @import '@/assets/style/element-variables.scss';
  .panel-dialog .el-dialog__body {
    overflow: hidden;
    padding: 0px 1px;
  }
  .variables-btn{
    /* float: right; */
    background-color: #ffffff !important;
    border-color: $--color-primary !important;
    color: $--color-primary !important;
    width: 64px;
    height: 24px;
    line-height: 24px !important;
    padding: 0 !important;
    font-size: 12px !important;
    margin-left: 18px !important;
  }
  .variables-btn:hover{
    color: $--color-primary !important;
    opacity: 0.8;
  }
</style>
