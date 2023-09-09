<template>
  <el-form class="auto-agree" :size="defaultFormItemSize" @submit.native.prevent>
    <el-form-item label="自动同意" style="margin-bottom: 0 !important;">
      <el-select v-model="autoAgreeItemList" :size="defaultFormItemSize" multiple placeholder="请选择" :disabled="isCountersign">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "AutoAgree",
  props: {
    id: String,
    isCountersign: Boolean
  },
  data(){
    return {
      options: [
        { label: '审批人为发起人', value: '0' },
        { label: '审批人与上一审批节点处理人相同', value: '1' },
        { label: '审批人审批过', value: '2' }
      ],
      autoAgreeItemList: [],
      autoAgreeItemElementList: undefined,
      ruleVlaue: undefined,

    }
  },
  methods: {
    resetFormVariable () {
      let businessObject = (window.bpmnInstances.bpmnElement || {}).businessObject
      this.autoAgreeItemList = (businessObject.autoSkipType || '').split(',').filter(row => row);
    },
    updateElementExtensions () {
      let taskAttr = {
        autoSkipType: this.autoAgreeItemList && this.autoAgreeItemList.length ? this.autoAgreeItemList.join(',') : undefined
      }
      window.bpmnInstances.modeling.updateProperties(window.bpmnInstances.bpmnElement, taskAttr);
    }
  },
  watch: {
    autoAgreeItemList: {
      deep: true,
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
      immediate: true,
      handler (bol) {
        if(bol){
          this.autoAgreeItemList = []
        }
      }
    }
  }
  //
}
</script>

<style lang="scss" scoped>
.auto-agree{
  margin-top: 10px;
}

</style>
