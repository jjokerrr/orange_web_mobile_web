<template>
  <div class="panel-tab__content">
    <el-select class="input-item" v-model="latestApprovalStatus" @change="onLatestApprovalStatusChange"
    >
      <el-option label="不更新" :value="undefined" />
      <el-option v-for="item in validStatusLiist" :key="item.id"
        :label="item.name" :value="item.id"
      />
    </el-select>
  </div>
</template>

<script>
export default {
  props: {
    id: String,
    type: String
  },
  inject: ['flowEntry', 'formList', 'prefix'],
  data() {
    return {
      latestApprovalStatus: undefined,
      elementPropertyList: [],
      propertyForm: {},
      editingPropertyIndex: -1,
      propertyFormModelVisible: false
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.resetAttributesList();
      }
    }
  },
  methods: {
    onLatestApprovalStatusChange (val) {
      if (val == null || val === '') {
        this.updateElementExtensions([]);
      } else {
        const newPropertyObject = window.bpmnInstances.moddle.create(`${this.prefix}:Property`, {
          name: 'latestApprovalStatus',
          value: val
        });
        const propertiesObject = window.bpmnInstances.moddle.create(`${this.prefix}:Properties`, {
          values: [newPropertyObject]
        });
        this.updateElementExtensions([propertiesObject]);
        this.resetAttributesList();
      }
    },
    resetAttributesList() {
      this.latestApprovalStatus = undefined;
      this.bpmnElement = window.bpmnInstances.bpmnElement;
      this.bpmnElementProperties =
        this.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => {
          return ex.$type === `${this.prefix}:Properties`;
        }) ?? [];

      // 保存所有的 扩展属性字段
      this.bpmnElementPropertyList = this.bpmnElementProperties.reduce((pre, current) => pre.concat(current.values), []);
      // 复制 显示
      this.elementPropertyList = JSON.parse(JSON.stringify(this.bpmnElementPropertyList ?? []));
      this.elementPropertyList.forEach(item => {
        if (item.name === 'latestApprovalStatus') this.latestApprovalStatus = Number.parseInt(item.value);
      });
    },
    updateElementExtensions(properties) {
      this.otherExtensionList = this.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => {
        return ex.$type !== `${this.prefix}:Properties`;
      }) ?? [];
      const extensions = window.bpmnInstances.moddle.create("bpmn:ExtensionElements", {
        values: this.otherExtensionList.concat(properties)
      });
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        extensionElements: extensions
      });
    }
  },
  computed: {
    validStatusLiist () {
      if (this.flowEntry().extensionData != null && Array.isArray(this.flowEntry().extensionData.approvalStatusDict)) {
        return this.flowEntry().extensionData.approvalStatusDict;
      } else {
        return [];
      }
    }
  }
}
</script>

<style>

</style>