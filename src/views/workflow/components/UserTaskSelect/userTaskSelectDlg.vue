<template>
  <div class="process-viewer" style="height: 100%;">
    <div class="process-canvas" style="height: 100%;" ref="processCanvas" v-show="!isLoading && diagramType==DiagramType.ORDINARY" />
    <!-- 自定义箭头样式，用于已完成状态下流程连线箭头 -->
    <defs ref="customDefs">
      <marker id="sequenceflow-end-white-success" viewBox="0 0 20 20" refX="11" refY="10" markerWidth="10" markerHeight="10" orient="auto">
        <path class="success-arrow" d="M 1 5 L 11 10 L 1 15 Z" style="stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1;"></path>
      </marker>
      <marker id="conditional-flow-marker-white-success" viewBox="0 0 20 20" refX="-1" refY="10" markerWidth="10" markerHeight="10" orient="auto">
        <path class="success-conditional" d="M 0 10 L 8 6 L 16 10 L 8 14 Z" style="stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1;"></path>
      </marker>
    </defs>
    <div style="position: absolute; top: 0px; left: 0px; width: 100%;" v-show="diagramType==DiagramType.ORDINARY">
      <el-row type="flex" justify="end">
        <el-button-group key="scale-control" size="medium">
          <el-button size="medium" type="default" :plain="true" :disabled="defaultZoom <= 0.3" icon="el-icon-zoom-out" @click="processZoomOut()" />
          <el-button size="medium" type="default" style="width: 90px;">{{ Math.floor(this.defaultZoom * 10 * 10) + "%" }}</el-button>
          <el-button size="medium" type="default" :plain="true" :disabled="defaultZoom >= 3.9" icon="el-icon-zoom-in" @click="processZoomIn()" />
          <el-button size="medium" type="default" icon="el-icon-c-scale-to-original" @click="processReZoom()" />
          <slot />
        </el-button-group>
      </el-row>
    </div>
  </div>
</template>

<script>
import '../../package/theme/index.scss';
// import BpmnViewer from 'bpmn-js/lib/Viewer';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';

export default {
  name: 'userTaskSelectDlg',
  props: {
    xml: {
      type: String
    },
    finishedInfo: {
      type: Object
    }
  },
  mixins: [thirdPartyMixin],
  data () {
    return {
      defaultZoom: 1,
      // 是否正在加载流程图
      isLoading: true,
      bpmnViewer: undefined,
      selectTask: undefined,
      processNodeInfo: undefined,
      diagramType: this.DiagramType.ORDINARY
    }
  },
  methods: {
    onCancel (isSuccess = false) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, this.selectTask);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, undefined, this.selectTask);
      }
    },
    processReZoom () {
      this.defaultZoom = 1;
      this.bpmnViewer.get('canvas').zoom('fit-viewport', 'auto');
    },
    processZoomIn (zoomStep = 0.1) {
      let newZoom = Math.floor(this.defaultZoom * 100 + zoomStep * 100) / 100;
      if (newZoom > 4) {
        throw new Error('[Process Designer Warn ]: The zoom ratio cannot be greater than 4');
      }
      this.defaultZoom = newZoom;
      this.bpmnViewer.get('canvas').zoom(this.defaultZoom);
    },
    processZoomOut (zoomStep = 0.1) {
      let newZoom = Math.floor(this.defaultZoom * 100 - zoomStep * 100) / 100;
      if (newZoom < 0.2) {
        throw new Error('[Process Designer Warn ]: The zoom ratio cannot be less than 0.2');
      }
      this.defaultZoom = newZoom;
      this.bpmnViewer.get('canvas').zoom(this.defaultZoom);
    },
    // 流程图预览清空
    clearViewer () {
      if (this.$refs.processCanvas) this.$refs.processCanvas.innerHTML = '';
      if (this.bpmnViewer) this.bpmnViewer.destroy();
      this.bpmnViewer = null;
    },
    // 显示流程图
    async importXML (xml) {
      this.clearViewer();
      if (xml != null && xml !== '') {
        try {
          this.bpmnViewer = new BpmnModeler({
            container: this.$refs.processCanvas
          });
          // 任务节点悬浮事件
          this.bpmnViewer.on('element.click', ({ element }) => {
            this.onSelectElement(element);
          });

          this.isLoading = true;
          await this.bpmnViewer.importXML(xml);
        } catch (e) {
          console.error(e);
          this.clearViewer();
        } finally {
          this.isLoading = false;
          this.$nextTick(() => {
            this.setProcessStatus(this.dialogParams.finishedInfo)
          })
        }
      }
    },
    // 选中节点
    onSelectElement (element) {
      if (element == null || element.businessObject == null || element.type === 'bpmn:Process') return;
      if (element.type !== 'bpmn:UserTask') {
        this.$message.warning('请选择用户任务节点！');
        return;
      }
      this.selectTask = {
        taskId: element.businessObject.id,
        taskName: element.businessObject.name
      }
      this.onCancel(true)
    },
    // 添加自定义箭头
    addCustomDefs () {
      const canvas = this.bpmnViewer.get('canvas');
      const svg = canvas._svg;
      const customDefs = this.$refs.customDefs;
      svg.appendChild(customDefs);
    },
    // 设置流程图元素状态
    setProcessStatus (processNodeInfo) {
      this.processNodeInfo = processNodeInfo;
      if (this.processNodeInfo == null || this.bpmnViewer == null) return;
      this.addCustomDefs()
      let { finishedSequenceFlowSet, finishedTaskSet, unfinishedTaskSet } = this.processNodeInfo;
      const canvas = this.bpmnViewer.get('canvas');
      const elementRegistry = this.bpmnViewer.get('elementRegistry');
      if (Array.isArray(finishedSequenceFlowSet)) {
        finishedSequenceFlowSet.forEach(item => {
          if (item != null) {
            canvas.addMarker(item, 'success');
            let element = elementRegistry.get(item);
            const conditionExpression = element.businessObject.conditionExpression;
            if (conditionExpression) {
              canvas.addMarker(item, 'condition-expression');
            }
          }
        });
      }
      if (Array.isArray(finishedTaskSet)) {
        finishedTaskSet.forEach(item => {
          if (item != null) canvas.addMarker(item, 'success');
        });
      }
      if (Array.isArray(unfinishedTaskSet)) {
        unfinishedTaskSet.forEach(item => {
          if (item != null) canvas.addMarker(item, 'current');
        });
      }
    }
  },
  computed: {
    dialogParams () {
      return {
        xml: this.xml || this.thirdParams.xml,
        finishedInfo: this.finishedInfo || this.thirdParams.finishedInfo
      }
    }
  },
  destroyed () {
    this.clearViewer();
  },
  watch: {
    'dialogParams.xml': {
      handler (newXml) {
        setTimeout(() => {
          this.importXML(newXml).then(res => {
            this.processReZoom();
          }).catch(e => {
            console.log(e);
          });
        }, 30);
      },
      immediate: true
    }
  },
  mounted () {
  }
}
</script>
