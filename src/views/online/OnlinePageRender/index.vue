<template>
  <div :class="{advance: (formConfig && formConfig.formType === SysOnlineFormType.ADVANCE_QUERY)}" style="position: relative; width: 100; padding: 0px!important;">
    <OnlineQueryForm v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.QUERY"
      :key="formKey" :height="(getMainContextHeight - 32) + 'px'" :formConfig="formConfig"
    />
    <OnlineAdvanceQueryForm v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.ADVANCE_QUERY"
      :key="formKey" :height="(getMainContextHeight - 32) + 'px'" :formConfig="formConfig"
    />
    <OnlineOneToOneForm v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.ONE_TO_ONE_QUERY"
      :key="formKey" :height="(getMainContextHeight - 32) + 'px'" :formConfig="formConfig"
    />
    <OnlineEditForm v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.FORM"
      :key="formKey" :formConfig="formConfig" :readOnly="readOnly"
    />
    <OnlineWorkFlowForm ref="workflow" v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.FLOW"
      :key="formKey" :formConfig="formConfig" :flowInfo="flowInfo" :readOnly="readOnly" :variableDisplay="variableDisplay"
    />
    <OnlineWorkOrderForm v-if="isReady && formConfig && formConfig.formType === SysOnlineFormType.WORK_ORDER"
      :key="formKey" :height="(getMainContextHeight - 32) + 'px'" :formConfig="formConfig" :entryId="entryId"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import OnlineQueryForm from './OnlineQueryForm/index.vue';
import OnlineAdvanceQueryForm from './OnlineAdvanceQueryForm/index.vue';
import OnlineOneToOneForm from './OnlineOneToOneForm/index.vue';
import OnlineEditForm from './OnlineEditForm/index.vue';
import OnlineWorkFlowForm from './OnlineWorkFlowForm/index.vue';
import OnlineWorkOrderForm from './OnlineWorkOrderForm/index.vue';

import {
  OnlineFormController
} from '@/api/onlineController.js';

export default {
  name: 'onlinePageRender',
  props: {
    // 增加接口
    variableDisplay: {
      type: Array,
      default: () => []
    },
    formId: {
      type: String,
      required: true
    },
    entryId: {
      type: String
    },
    flowInfo: {
      type: Object
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  components: {
    OnlineQueryForm,
    OnlineAdvanceQueryForm,
    OnlineOneToOneForm,
    OnlineEditForm,
    OnlineWorkFlowForm,
    OnlineWorkOrderForm
  },
  data () {
    return {
      formConfig: undefined,
      isReady: false,
      formKey: 0
    }
  },
  // eslint-disable-next-line space-before-function-paren
  mounted() {
  },
  methods: {
    clear () {
      if (this.formConfig) {
        this.formConfig.datasourceMap = null;
        this.formConfig.relationMap = null;
        this.formConfig.tableMap = null;
        this.formConfig.columnMap = null;
        this.formConfig.dictMap = null;
        this.formConfig.linkageMap = null;
      }
      this.formConfig = null;
    },
    loadOnlineFormConfig () {
      this.isReady = false;
      this.clear();
      OnlineFormController.render(this, {
        formId: this.formId
      }).then(res => {
        // 获取后端信息
        let onlineForm = res.data.onlineForm;
        let formConfigData = JSON.parse(onlineForm.widgetJson);
        formConfigData = formConfigData.pc;
        this.formConfig = {
          rawData: res.data,
          readOnly: this.readOnly,
          formName: onlineForm.formName,
          formType: onlineForm.formType,
          formKind: onlineForm.formKind,
          masterTableId: onlineForm.masterTableId,
          labelWidth: formConfigData.labelWidth,
          labelPosition: formConfigData.labelPosition,
          filterItemWidth: formConfigData.filterItemWidth,
          gutter: formConfigData.gutter,
          height: formConfigData.height,
          width: formConfigData.width,
          widgetList: formConfigData.widgetList,
          operationList: (formConfigData.operationList || []).sort((value1, value2) => {
            return (value1.showOrder || 0) - (value2.showOrder || 0)
          }),
          tableWidget: formConfigData.tableWidget,
          leftWidget: formConfigData.leftWidget,
          customFieldList: formConfigData.customFieldList,
          formEventList: formConfigData.formEventList,
          maskFieldList: formConfigData.maskFieldList
        }
        this.isReady = true;
      }).catch(e => {
        console.log(e);
      });
    },
    getFormData (isDraft, variableList) {
      return this.$refs.workflow ? this.$refs.workflow.getFormData(isDraft, variableList) : Promise.reject();
    }
  },
  computed: {
    ...mapGetters(['getMainContextHeight'])
  },
  watch: {
    formId: {
      handler () {
        this.loadOnlineFormConfig();
        this.formKey++;
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
  .advance {
    padding: 0px!important;
  }
</style>
