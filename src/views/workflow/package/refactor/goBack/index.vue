<template>
  <el-form class="panel-go-back" :size="defaultFormItemSize" @submit.native.prevent>
    <el-form-item label="退回设置">
      <el-radio-group v-model="rejectType" :disabled="isCountersign">
        <el-radio label="0">重新审批</el-radio>
        <el-radio label="1">从当前节点审批
          <el-tooltip class="item" effect="dark" content="若流程为A->B->C,C退回至A，则C->A->C" placement="top">
            <i class="el-icon-warning-outline"></i>
          </el-tooltip>
        </el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "GoBack",
  props: {
    id: String,
    isCountersign: Boolean
  },
  data(){
    return {
      rejectType: '0'
    }
  },
  methods: {
    resetFormVariable () {
      let businessObject = (window.bpmnInstances.bpmnElement || {}).businessObject
      this.rejectType = this.isCountersign ? '' : (businessObject.rejectType || '0');
    },
    updateElementExtensions () {
      let taskAttr = Object.create(null);
      taskAttr.rejectType = this.rejectType;
      window.bpmnInstances.modeling.updateProperties(window.bpmnInstances.bpmnElement, taskAttr);
    }
  },
  watch: {
    rejectType: {
      handler () {
        this.updateElementExtensions();
      }
    },
    id: {
      immediate: true,
      handler (val) {
        if (val && val.length) {
          this.$nextTick(() => {
            this.resetFormVariable();
          });
        }
      }
    },
    isCountersign: {
      deep: true,
      handler() {
        this.rejectType = this.isCountersign ? '' : '0'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/element-variables.scss';
.panel-go-back{
  margin-top: 8px;
  padding-bottom: 20px;
}
.el-radio-group{
  display: inline-block;
  width: 100%;
  padding-top: 4px;
  ::v-deep .el-radio{
    width: 120px;
    margin-bottom: 8px;
    .el-radio__label{
      vertical-align: middle;
    }
  }
}
</style>
