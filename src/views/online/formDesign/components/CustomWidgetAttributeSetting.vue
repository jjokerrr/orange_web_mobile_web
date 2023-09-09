<template>
  <el-form class="custom-widget-attribute" label-position="left" size="small" @submit.native.prevent>
    <EditWidgetAttribute v-for="attributeItem in attributeList" :key="attributeItem.attributeKey"
      v-model="value[attributeItem.attributeKey]" :attributeItem="attributeItem" :allFormList="allFormList"
    />
  </el-form>
</template>

<script>
// import { getWidgetAttributeConfig } from '../widget.js';
// import widgetData from '../../OnlinePageRender/components/config/index.js';
import EditWidgetAttribute from './EditWidgetAttribute.vue';

export default {
  props: {
    widget: {
      type: Object,
      required: true
    },
    value: {
      type: Object
    },
    // 所有表单
    allFormList: {
      type: Array,
      default: () => []
    }
  },
  components: {
    EditWidgetAttribute
  },
  inject: ['formConfig'],
  data () {
    return {
      attributeList: []
    }
  },
  methods: {
    onChange (attributeKey, val) {
      let attributeData = {
        ...this.value
      };
      attributeData[attributeKey] = val;
      this.$emit('input', attributeData);
    },
    getAttributeItemValue (attributeItem) {
      if (typeof attributeItem === 'function') {
        return attributeItem(this.formConfig());
      } else {
        return attributeItem;
      }
    },
    buildAttributeList () {
      this.attributeList = [];
      if (this.getWidgetAttributeConfig != null) {
        Object.keys(this.getWidgetAttributeConfig).forEach(attributeKey => {
          let attributeItem = this.getWidgetAttributeConfig[attributeKey];
          if (attributeItem != null) {
            let temp = Object.keys(attributeItem).reduce((retObj, subKey) => {
              retObj[subKey] = this.getAttributeItemValue(attributeItem[subKey]);
              return retObj;
            }, {
              attributeKey: attributeKey
            });
            if (temp.visible == null || temp.visible) this.attributeList.push(temp);
          }
        });
      }
    }
  },
  computed: {
    currentForm () {
      return this.formConfig().form;
    },
    currentWidget () {
      return this.formConfig().currentWidget;
    },
    getWidgetAttributeConfig () {
      // return (widgetData.getWidgetAttribute(this.widget.widgetType) || {}).attribute;
      return (this.formConfig().getWidgetAttribute(this.widget.widgetType) || {}).attribute;
    }
  },
  watch: {
    currentWidget: {
      handler () {
        this.buildAttributeList();
      },
      immediate: true
    }
  }
}
</script>

<style>
</style>
