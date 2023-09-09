<template>
  <div class="panel-tab__content" style="padding-top: 3px">
    <ConyForSelect v-model="copyForItemList" />
  </div>
</template>

<script>
import ConyForSelect from '@/views/workflow/components/CopyForSelect/copyForSetting.vue';
import { SysCommonBizController } from '@/api';
export default {
  props: {
    id: String,
    type: String
  },
  components: {
    ConyForSelect
  },
  inject: ['prefix'],
  data () {
    return {
      copyForItemList: [],
      copyItemElementList: undefined
    }
  },
  methods: {
    async resetFormVariable () {
      this.bpmnELement = window.bpmnInstances.bpmnElement;
      let elExtensionElements = this.bpmnELement.businessObject.get("extensionElements") || window.bpmnInstances.moddle.create("bpmn:ExtensionElements", { values: [] });
      this.copyItemElementList = elExtensionElements.values.filter(ex => ex.$type === `${this.prefix}:CopyItemList`)?.[0] ||
        window.bpmnInstances.moddle.create(`${this.prefix}:CopyItemList`, { copyItemList: [] });
      let copyForItemList = []
      if(this.copyItemElementList.copyItemList){
        for (let i = 0; i < this.copyItemElementList.copyItemList.length; i++) {
          const item = this.copyItemElementList.copyItemList[i];
          if(item.type === this.SysFlowCopyForType.USER){
            let params = {
              widgetType: 'upms_user',
              fieldName: 'loginName',
              fieldValues: item.id
            }
            let userNames = item.id.split(',')

            params.fieldValues = params.fieldValues.split(',').filter(row => {
              return ['${startUserName}', '${appointedAssignee}'].indexOf(row) === -1;
            }).join(',')

            let loginNames = item.id.split(',')
            if(params.fieldValues) {
              const res = await SysCommonBizController.viewByIds(this, params);
              // eslint-disable-next-line no-case-declarations
              res.data.forEach(item => {
                userNames[loginNames.indexOf(item.loginName)] = item.showName;
              })
            }

            copyForItemList.push({
              ...item,
              userName: loginNames.map((row, i) => {
                return {
                  id: row,
                  name: userNames[i]
                }
              })
            })
          }else{
            copyForItemList.push(item)
          }
        }
      }
      this.copyForItemList = copyForItemList;
      this.updateElementExtensions();
    },
    updateElementExtensions () {
      // 更新回扩展元素
      let elExtensionElements = this.bpmnELement.businessObject.get("extensionElements")  || window.bpmnInstances.moddle.create("bpmn:ExtensionElements", { values: [] });
      let otherExtensions = elExtensionElements.values.filter(ex => ex.$type !== `${this.prefix}:CopyItemList`);
      this.copyItemElementList.copyItemList = (this.copyForItemList || []).map(item => {
        return window.bpmnInstances.moddle.create(`${this.prefix}:CopyItem`, {
          id: item.id,
          type: item.type
        });
      });
      const newElExtensionElements = window.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
        values: otherExtensions.concat(this.copyItemElementList)
      });
      // 更新到元素上
      window.bpmnInstances.modeling.updateProperties(this.bpmnELement, {
        extensionElements: newElExtensionElements
      });
    }
  },
  watch: {
    'copyForItemList': {
      handler (newValue) {
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
    }
  }
}
</script>

<style>
</style>
