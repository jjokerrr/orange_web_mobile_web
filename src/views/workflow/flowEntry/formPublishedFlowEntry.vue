<template>
  <!-- 流程版本管理 -->
  <div class="form-single-fragment" style="position: relative;">
    <el-row>
      <el-col :span="24" v-if="entryXml == null">
        <vxe-table ref="flowEntry" :data="publishedFlowEntryWidget.dataList" :size="defaultFormItemSize" height="655px"
          @sort-change="publishedFlowEntryWidget.onSortChange"
          header-cell-class-name="table-header-gray">
          <vxe-column title="序号" type="seq" width="55px" :index="publishedFlowEntryWidget.getTableIndex" />
          <vxe-column title="流程名称" field="processDefinitionName">
            <template>
              <span>{{dialogParams.flowEntry.processDefinitionName}}</span>
            </template>
          </vxe-column>
          <vxe-column title="流程分类">
            <template>
              <span>{{dialogParams.flowEntry.flowCategory.name}}</span>
            </template>
          </vxe-column>
          <vxe-column title="流程版本" field="publishVersion">
            <template slot-scope="scope">
              <el-tag :size="defaultFormItemSize" type="primary" effect="dark">{{'V:' + scope.row.publishVersion}}</el-tag>
            </template>
          </vxe-column>
          <vxe-column title="激活状态" field="activeStatus">
            <template slot-scope="scope">
              <el-tag :size="defaultFormItemSize" effect="dark" :type="scope.row.activeStatus ? 'success' : 'danger'">
                {{scope.row.activeStatus ? '激活' : '挂起'}}
              </el-tag>
            </template>
          </vxe-column>
          <vxe-column title="主版本" field="mainVersion">
            <template slot-scope="scope">
              <el-tag :size="defaultFormItemSize" effect="dark" :type="scope.row.mainVersion ? 'success' : 'danger'">
                {{scope.row.mainVersion ? '是' : '否'}}
              </el-tag>
            </template>
          </vxe-column>
          <vxe-column title="发布时间" field="publishTime" min-width="150px" />
          <vxe-column title="操作" fixed="right" width="200px">
            <template slot-scope="scope">
              <el-button
                @click.stop="onSetActiveStatus(scope.row)" type="text" :size="defaultFormItemSize">
                {{scope.row.activeStatus ? '挂起' : '激活'}}
              </el-button>
              <el-button type="text" :size="defaultFormItemSize" @click="getTaskProcessXml(scope.row)">
                流程图
              </el-button>
              <el-button :disabled="scope.row.mainVersion"
                @click.stop="onSetMainVersion(scope.row)" type="text" :size="defaultFormItemSize">
                设置为主版本
              </el-button>
            </template>
          </vxe-column>
          <template slot="empty">
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png">
              <span>暂无数据</span>
            </div>
          </template>
        </vxe-table>
      </el-col>
      <el-col :span="24" v-show="entryXml != null">
        <ProcessViewer :xml="entryXml" style="height: 653px">
          <el-button type="default" size="medium" icon="el-icon-circle-close" @click.stop="entryXml = undefined" />
        </ProcessViewer>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { TableWidget } from '@/utils/widget.js';
import { FlowEntryController, FlowOperationController } from '@/api/flowController.js';
import ProcessViewer from '@/views/workflow/components/ProcessViewer.vue';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js'

export default {
  name: 'formPublishedFlowEntry',
  mixins: [thirdPartyMixin],
  props: {
    flowEntry: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    ProcessViewer
  },
  data () {
    return {
      entryXml: undefined,
      publishedFlowEntryWidget: new TableWidget(this.loadFlowEntryWidgetData, this.loadFlowEntryVerify, false, false)
    }
  },
  computed: {
    dialogParams () {
      return {
        flowEntry: this.flowEntry || this.thirdParams.flowEntry
      }
    }
  },
  methods: {
    /**
     * 工作流发布版本数据获取函数，返回Promise
     */
    loadFlowEntryWidgetData (params) {
      if (params == null) params = {};
      params = {
        ...params,
        entryId: this.dialogParams.flowEntry.entryId
      }
      return new Promise((resolve, reject) => {
        FlowEntryController.listFlowEntryPublish(this, params).then(res => {
          resolve({
            dataList: res.data,
            totalCount: Array.isArray(res.data) ? res.data.length : 0
          });
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 工作流发布版本数据获取检测函数，返回true正常获取数据，返回false停止获取数据
     */
    loadFlowEntryVerify () {
      return true;
    },
    /**
     * 设置主版本
     */
    onSetMainVersion (row) {
      this.$confirm('是否将当前版本设置为主版本？').then(res => {
        let params = {
          entryId: this.dialogParams.flowEntry.entryId,
          newEntryPublishId: row.entryPublishId
        }
        return FlowEntryController.updateMainVersion(this, params);
      }).then(res => {
        this.refreshFormFlowEntry();
      }).catch(e => {});
    },
    /**
     * 激活 / 挂起
     */
    onSetActiveStatus (row) {
      let params = {
        entryPublishId: row.entryPublishId
      }

      let httpCall = row.activeStatus ? FlowEntryController.suspendFlowEntryPublish(this, params) : FlowEntryController.activateFlowEntryPublish(this, params);
      httpCall.then(res => {
        this.$message.success(`${row.activeStatus ? '挂起成功！' : '激活成功！'}`);
        this.refreshFormFlowEntry();
      }).catch(e => {});
    },
    refreshFormFlowEntry (reloadData = false) {
      if (reloadData) {
        this.publishedFlowEntryWidget.refreshTable(true, 1);
      } else {
        this.publishedFlowEntryWidget.refreshTable();
      }
    },
    /**
     * 获取流程图xml
     */
    getTaskProcessXml (row) {
      if (row.processDefinitionId == null || row.processDefinitionId === '') {
        this.entryXml = undefined;
        return;
      }
      let params = {
        processDefinitionId: row.processDefinitionId
      }
      FlowOperationController.viewProcessBpmn(this, params).then(res => {
        // 当前流程实例xml
        this.entryXml = res.data;
      }).catch(e => {});
    }
  },
  mounted () {
    // 初始化页面数据
    this.refreshFormFlowEntry();
  }
}
</script>

<style>
</style>
