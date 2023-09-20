<template>
  <div class="panel-tab__content" style="padding-top: 0">
    <div class="panel-tab__content--title" style="padding-bottom: 3px;height: 32px;box-sizing: content-box;">
      <span class="panel-title">消息列表</span>
      <right-add-btn :size="defaultFormItemSize" type="text" icon="el-icon-circle-plus" @click.prevent.stop="openModel('message')">添加</right-add-btn>
    </div>
    <vxe-table :data="messageList" :size="defaultFormItemSize" header-cell-class-name="table-header-gray">
      <vxe-column type="seq" title="序号" width="60px" />
      <vxe-column title="消息ID" field="id" max-width="300px" show-overflow-tooltip />
      <vxe-column title="消息名称" field="name" max-width="300px" show-overflow-tooltip />
      <template slot="empty">
          <div class="table-empty unified-font">
            <img src="@/assets/img/empty.png">
            <span>暂无数据</span>
          </div>
        </template>
    </vxe-table>
    <div class="panel-tab__content--title" style="padding-top: 10px;padding-bottom: 3px">
      <span class="panel-title">信号列表</span>
      <right-add-btn :size="defaultFormItemSize" type="text" icon="el-icon-circle-plus" @click.prevent.stop="openModel('signal')">添加</right-add-btn>
    </div>
    <vxe-table :data="signalList" :size="defaultFormItemSize" style="margin-bottom: 10px" header-cell-class-name="table-header-gray">
      <vxe-column type="seq" title="序号" width="60px" />
      <vxe-column title="信号ID" field="id" max-width="300px" show-overflow-tooltip />
      <vxe-column title="信号名称" field="name" max-width="300px" show-overflow-tooltip />
      <template slot="empty">
          <div class="table-empty unified-font">
            <img src="@/assets/img/empty.png">
            <span>暂无数据</span>
          </div>
        </template>
    </vxe-table>

    <el-dialog :visible.sync="modelVisible" :title="modelConfig.title" :close-on-click-modal="false" width="400px" append-to-body destroy-on-close>
      <el-form :model="modelObjectForm" :size="defaultFormItemSize" label-width="90px" @submit.native.prevent>
        <el-form-item :label="modelConfig.idLabel">
          <el-input v-model="modelObjectForm.id" clearable />
        </el-form-item>
        <el-form-item :label="modelConfig.nameLabel">
          <el-input v-model="modelObjectForm.name" clearable />
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button :size="defaultFormItemSize" @click="modelVisible = false">取 消</el-button>
        <el-button :size="defaultFormItemSize" type="primary" @click="addNewObject">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "SignalAndMassage",
  data() {
    return {
      signalList: [],
      messageList: [],
      modelVisible: false,
      modelType: "",
      modelObjectForm: {}
    };
  },
  computed: {
    modelConfig() {
      if (this.modelType === "message") {
        return { title: "创建消息", idLabel: "消息ID", nameLabel: "消息名称" };
      } else {
        return { title: "创建信号", idLabel: "信号ID", nameLabel: "信号名称" };
      }
    }
  },
  mounted() {
    this.initDataList();
  },
  methods: {
    initDataList() {
      this.rootElements = window.bpmnInstances.modeler.getDefinitions().rootElements;
      this.messageIdMap = {};
      this.signalIdMap = {};
      this.messageList = [];
      this.signalList = [];
      this.rootElements.forEach(el => {
        if (el.$type === "bpmn:Message") {
          this.messageIdMap[el.id] = true;
          this.messageList.push({ ...el });
        }
        if (el.$type === "bpmn:Signal") {
          this.signalIdMap[el.id] = true;
          this.signalList.push({ ...el });
        }
      });
    },
    openModel(type) {
      this.modelType = type;
      this.modelObjectForm = {};
      this.modelVisible = true;
    },
    addNewObject() {
      if (this.modelType === "message") {
        if (this.messageIdMap[this.modelObjectForm.id]) {
          return this.$message.error("该消息已存在，请修改id后重新保存");
        }
        const messageRef = window.bpmnInstances.moddle.create("bpmn:Message", this.modelObjectForm);
        this.rootElements.push(messageRef);
      } else {
        if (this.signalIdMap[this.modelObjectForm.id]) {
          return this.$message.error("该信号已存在，请修改id后重新保存");
        }
        const signalRef = window.bpmnInstances.moddle.create("bpmn:Signal", this.modelObjectForm);
        this.rootElements.push(signalRef);
      }
      this.modelVisible = false;
      this.initDataList();
    }
  }
};
</script>
<style lang="scss" scoped>
.panel-tab__content--title{
  align-items: center;
  padding-bottom: 0;
  .el-button{
    display: flex;
    align-items: center;
    ::v-deep .el-icon-circle-plus{
      font-size: 16px;
    }
    ::v-deep span{
      margin-left: 2px !important;
    }
  }
}
</style>
