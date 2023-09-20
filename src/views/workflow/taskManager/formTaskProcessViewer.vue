<template>
  <!-- 流程图 -->
  <div class="form-single-fragment" style="position: relative;">
    <el-row>
      <ProcessViewer :xml="taskProcessXml" :finishedInfo="finishedInfo" :allCommentList="flowTaskCommentList" style="height: 655px" />
    </el-row>
  </div>
</template>

<script>
import '@/staticDict/flowStaticDict.js';
import { FlowOperationController } from '@/api/flowController.js';
import ProcessViewer from '@/views/workflow/components/ProcessViewer.vue';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js'
export default {
  name: 'formTaskProcessViewer',
  mixins: [thirdPartyMixin],
  props: {
    processDefinitionId: {
      type: String
      // required: true
    },
    processInstanceId: {
      type: String
    }
  },
  components: {
    ProcessViewer
  },
  data () {
    return {
      finishedInfo: undefined,
      taskProcessXml: undefined,
      flowTaskCommentList: []
    }
  },
  methods: {
    loadProcessCommentList () {
      this.flowTaskCommentList = [];
      if (this.dialogParams.processInstanceId == null || this.dialogParams.processInstanceId === '') {
        return;
      }
      FlowOperationController.listFlowTaskComment(this, {
        processInstanceId: this.dialogParams.processInstanceId
      }).then(res => {
        this.flowTaskCommentList = res.data;
      }).catch(e => {});
    },
    getTaskHighlightData () {
      if (this.dialogParams.processInstanceId == null || this.dialogParams.processInstanceId === '') {
        return;
      }
      let params = {
        processInstanceId: this.dialogParams.processInstanceId
      }
      FlowOperationController.viewHighlightFlowData(this, params).then(res => {
        // 已完成节点
        this.finishedInfo = res.data;
      }).catch(e => {});
    },
    getTaskProcessXml () {
      let params = {
        processDefinitionId: this.dialogParams.processDefinitionId
      }
      FlowOperationController.viewProcessBpmn(this, params).then(res => {
        // 当前流程实例xml
        this.taskProcessXml = res.data;
      }).catch(e => {});
    }
  },
  computed: {
    dialogParams () {
      return {
        processDefinitionId: this.processDefinitionId || this.thirdParams.processDefinitionId,
        processInstanceId: this.processInstanceId || this.thirdParams.processInstanceId
      }
    }
  },
  mounted () {
    this.getTaskHighlightData();
    this.getTaskProcessXml();
    this.loadProcessCommentList();
  }
}
</script>

<style>
</style>
