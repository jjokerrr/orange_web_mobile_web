<template>
  <div class="panel-tab__content"  style="padding-top: 3px">
    <vxe-table :data="elementListenersList" :size="defaultFormItemSize" header-cell-class-name="table-header-gray">
      <vxe-column title="序号" width="50px" type="seq" />
      <vxe-column title="事件类型" min-width="80px" show-overflow-tooltip>
        <template slot-scope="scope">
            {{ listenerEventTypeObject[scope.row.event] }}
          </template>
        </vxe-column>
      <vxe-column title="监听器ID" min-width="80px" field="id" show-overflow-tooltip />
      <vxe-column title="监听器类型" min-width="80px" show-overflow-tooltip>
        <template slot-scope="scope">
            {{ listenerTypeObject[scope.row.listenerType] }}
          </template>
        </vxe-column>
      <vxe-column title="操作" width="90px">
        <template slot-scope="{ row, $index }">
          <el-button :size="defaultFormItemSize" type="text" @click="openListenerForm(row, $index)">编辑</el-button>
          <!-- <el-divider direction="vertical" /> -->
          <el-button :size="defaultFormItemSize" type="text" @click="removeListener(row, $index)">删除</el-button>
        </template>
      </vxe-column>
      <template slot="empty">
        <div class="table-empty unified-font">
          <img src="@/assets/img/empty.png">
          <span>暂无数据</span>
        </div>
      </template>
    </vxe-table>
    <!-- <div class="element-drawer__button">
      <el-button :size="defaultFormItemSize" type="primary" icon="el-icon-plus" @click="openListenerForm(null)">添加监听器</el-button>
    </div> -->

    <!-- 监听器 编辑/创建 部分 -->
    <el-drawer :visible.sync="listenerFormModelVisible" title="任务监听器" :size="`${width}px`" custom-class="process-drawer" append-to-body destroy-on-close>
      <el-form :size="defaultFormItemSize" :model="listenerForm" label-width="96px" ref="listenerFormRef" @submit.native.prevent>
        <el-form-item label="事件类型" prop="event" :rules="{ required: true, message: '请选择事件类型', trigger: ['blur', 'change'] }">
          <el-select v-model="listenerForm.event">
            <el-option v-for="i in Object.keys(listenerEventTypeObject)" :key="i" :label="listenerEventTypeObject[i]" :value="i" />
          </el-select>
        </el-form-item>
        <el-form-item label="监听器ID" prop="id" :rules="{ required: true, message: '请填写监听器ID', trigger: ['blur', 'change'] }">
          <el-input v-model="listenerForm.id" clearable />
        </el-form-item>
        <el-form-item label="监听器类型" prop="listenerType" :rules="{ required: true, message: '请选择监听器类型', trigger: ['blur', 'change'] }">
          <el-select v-model="listenerForm.listenerType">
            <el-option v-for="i in Object.keys(listenerTypeObject)" :key="i" :label="listenerTypeObject[i]" :value="i" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="listenerForm.listenerType === 'classListener'"
          label="Java类"
          prop="class"
          key="listener-class"
          :rules="{ required: true, message: '请填写Java类', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.class" clearable />
        </el-form-item>
        <el-form-item
          v-if="listenerForm.listenerType === 'expressionListener'"
          label="表达式"
          prop="expression"
          key="listener-expression"
          :rules="{ required: true, message: '请填写表达式', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.expression" clearable />
        </el-form-item>
        <el-form-item
          v-if="listenerForm.listenerType === 'delegateExpressionListener'"
          label="代理表达式"
          prop="delegateExpression"
          key="listener-delegate"
          :rules="{ required: true, message: '请填写代理表达式', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.delegateExpression" clearable />
        </el-form-item>
        <template v-if="listenerForm.listenerType === 'scriptListener'">
          <el-form-item
            label="脚本格式"
            prop="scriptFormat"
            key="listener-script-format"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本格式' }"
          >
            <el-input v-model="listenerForm.scriptFormat" clearable />
          </el-form-item>
          <el-form-item
            label="脚本类型"
            prop="scriptType"
            key="listener-script-type"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请选择脚本类型' }"
          >
            <el-select v-model="listenerForm.scriptType">
              <el-option label="内联脚本" value="inlineScript" />
              <el-option label="外部脚本" value="externalScript" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="listenerForm.scriptType === 'inlineScript'"
            label="脚本内容"
            prop="value"
            key="listener-script"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本内容' }"
          >
            <el-input v-model="listenerForm.value" clearable />
          </el-form-item>
          <el-form-item
            v-if="listenerForm.scriptType === 'externalScript'"
            label="资源地址"
            prop="resource"
            key="listener-resource"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写资源地址' }"
          >
            <el-input v-model="listenerForm.resource" clearable />
          </el-form-item>
        </template>

        <template v-if="listenerForm.event === 'timeout'">
          <el-form-item label="定时器类型" prop="eventDefinitionType" key="eventDefinitionType">
            <el-select v-model="listenerForm.eventDefinitionType">
              <el-option label="日期" value="date" />
              <el-option label="持续时长" value="duration" />
              <el-option label="循环" value="cycle" />
              <el-option label="无" value="null" />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="!!listenerForm.eventDefinitionType && listenerForm.eventDefinitionType !== 'null'"
            label="定时器"
            prop="eventTimeDefinitions"
            key="eventTimeDefinitions"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写定时器配置' }"
          >
            <el-input v-model="listenerForm.eventTimeDefinitions" clearable />
          </el-form-item>
        </template>
      </el-form>

      <el-divider />
      <p class="listener-filed__title">
        <span><i class="el-icon-menu"></i>注入字段：</span>
        <el-button :size="defaultFormItemSize" type="primary" @click="openListenerFieldForm(null)">添加字段</el-button>
      </p>
      <vxe-table :data="fieldsListOfListener" :size="defaultFormItemSize" max-height="240" border fit style="flex: none" header-cell-class-name="table-header-gray">
        <vxe-column title="序号" width="50px" type="seq" />
        <vxe-column title="字段名称" min-width="100px" field="name" />
        <vxe-column title="字段类型" min-width="80px" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ fieldTypeObject[scope.row.fieldType] }}
          </template>
        </vxe-column>
        <vxe-column title="字段值/表达式" min-width="100px" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.string || scope.row.expression }}
          </template>
        </vxe-column>
        <vxe-column title="操作" width="100px">
          <template slot-scope="{ row, $index }">
            <el-button :size="defaultFormItemSize" type="text" @click="openListenerFieldForm(row, $index)">编辑</el-button>
            <!-- <el-divider direction="vertical" /> -->
            <el-button :size="defaultFormItemSize" type="text" @click="removeListenerField(row, $index)">删除</el-button>
          </template>
        </vxe-column>
        <template slot="empty">
          <div class="table-empty unified-font">
            <img src="@/assets/img/empty.png">
            <span>暂无数据</span>
          </div>
        </template>
      </vxe-table>

      <div class="element-drawer__button" style="margin-top: 8px;">
        <el-button :size="defaultFormItemSize" @click="listenerFormModelVisible = false">取 消</el-button>
        <el-button :size="defaultFormItemSize" type="primary" @click="saveListenerConfig">保 存</el-button>
      </div>
    </el-drawer>

    <!-- 注入西段 编辑/创建 部分 -->
    <el-dialog title="字段配置" :visible.sync="listenerFieldFormModelVisible" width="600px" append-to-body destroy-on-close>
      <el-form :model="listenerFieldForm" :size="defaultFormItemSize" label-width="96px" ref="listenerFieldFormRef" @submit.native.prevent>
        <el-form-item label="字段名称：" prop="name" :rules="{ required: true, message: '请填写字段名称', trigger: ['blur', 'change'] }">
          <el-input v-model="listenerFieldForm.name" clearable />
        </el-form-item>
        <el-form-item label="字段类型：" prop="fieldType" :rules="{ required: true, message: '请选择字段类型', trigger: ['blur', 'change'] }">
          <el-select v-model="listenerFieldForm.fieldType">
            <el-option v-for="i in Object.keys(fieldTypeObject)" :key="i" :label="fieldTypeObject[i]" :value="i" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="listenerFieldForm.fieldType === 'string'"
          label="字段值："
          prop="string"
          key="field-string"
          :rules="{ required: true, message: '请填写字段值', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.string" clearable />
        </el-form-item>
        <el-form-item
          v-if="listenerFieldForm.fieldType === 'expression'"
          label="表达式："
          prop="expression"
          key="field-expression"
          :rules="{ required: true, message: '请填写表达式', trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerFieldForm.expression" clearable type="textarea" />
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button :size="defaultFormItemSize" @click="listenerFieldFormModelVisible = false">取 消</el-button>
        <el-button :size="defaultFormItemSize" type="primary" @click="saveListenerFiled">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { createListenerObject, updateElementExtensions } from "../../utils";
import { initListenerForm, initListenerType, eventType, listenerType, fieldType } from "./utilSelf";

export default {
  name: "UserTaskListeners",
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: "prefix",
    width: "width"
  },
  data() {
    return {
      elementListenersList: [],
      listenerEventTypeObject: eventType,
      listenerTypeObject: listenerType,
      listenerFormModelVisible: false,
      listenerForm: {},
      fieldTypeObject: fieldType,
      fieldsListOfListener: [],
      listenerFieldFormModelVisible: false, // 监听器 注入字段表单弹窗 显示状态
      editingListenerIndex: -1, // 监听器所在下标，-1 为新增
      editingListenerFieldIndex: -1, // 字段所在下标，-1 为新增
      listenerFieldForm: {} // 监听器 注入字段 详情表单
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.$nextTick(() => this.resetListenersList());
      }
    }
  },
  methods: {
    getOtherExtensionList () {
      this.otherExtensionList = [];
      let temp = this.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => {
          if (ex.$type !== `${this.prefix}:TaskListener`) {
            this.otherExtensionList.push(ex);
          }
          return ex.$type === `${this.prefix}:TaskListener`;
        }) ?? [];
      return temp;
    },
    resetListenersList() {
      this.bpmnElement = window.bpmnInstances.bpmnElement;
      this.bpmnElementListeners = this.getOtherExtensionList();
      this.elementListenersList = this.bpmnElementListeners.map(listener => initListenerType(listener));
    },
    openListenerForm(listener, index) {
      if (listener) {
        this.listenerForm = initListenerForm(listener);
        this.editingListenerIndex = index;
      } else {
        this.listenerForm = {};
        this.editingListenerIndex = -1; // 标记为新增
      }
      if (listener && listener.fields) {
        this.fieldsListOfListener = listener.fields.map(field => ({ ...field, fieldType: field.string ? "string" : "expression" }));
      } else {
        this.fieldsListOfListener = [];
        this.$set(this.listenerForm, "fields", []);
      }
      // 打开侧边栏并清楚验证状态
      this.listenerFormModelVisible = true;
      this.$nextTick(() => {
        if (this.$refs["listenerFormRef"]) this.$refs["listenerFormRef"].clearValidate();
      });
    },
    // 移除监听器
    removeListener(listener, index) {
      this.$confirm("确认移除该监听器吗？", "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      })
        .then(() => {
          this.getOtherExtensionList();
          this.bpmnElementListeners.splice(index, 1);
          this.elementListenersList.splice(index, 1);
          updateElementExtensions(this.bpmnElement, this.otherExtensionList.concat(this.bpmnElementListeners));
        })
        .catch(() => console.info("操作取消"));
    },
    // 保存监听器
    async saveListenerConfig() {
      let validateStatus = await this.$refs["listenerFormRef"].validate();
      if (!validateStatus) return; // 验证不通过直接返回
      const listenerObject = createListenerObject(this.listenerForm, true, this.prefix);
      if (this.editingListenerIndex === -1) {
        this.bpmnElementListeners.push(listenerObject);
        this.elementListenersList.push(this.listenerForm);
      } else {
        this.bpmnElementListeners.splice(this.editingListenerIndex, 1, listenerObject);
        this.elementListenersList.splice(this.editingListenerIndex, 1, this.listenerForm);
      }
      this.getOtherExtensionList();
      updateElementExtensions(this.bpmnElement, this.otherExtensionList.concat(this.bpmnElementListeners));
      // 4. 隐藏侧边栏
      this.listenerFormModelVisible = false;
      this.listenerForm = {};
    },
    // 打开监听器字段编辑弹窗
    openListenerFieldForm(field, index) {
      this.listenerFieldForm = field ? JSON.parse(JSON.stringify(field)) : {};
      this.editingListenerFieldIndex = field ? index : -1;
      this.listenerFieldFormModelVisible = true;
      this.$nextTick(() => {
        if (this.$refs["listenerFieldFormRef"]) this.$refs["listenerFieldFormRef"].clearValidate();
      });
    },
    // 保存监听器注入字段
    async saveListenerFiled() {
      let validateStatus = await this.$refs["listenerFieldFormRef"].validate();
      if (!validateStatus) return; // 验证不通过直接返回
      if (this.editingListenerFieldIndex === -1) {
        this.fieldsListOfListener.push(this.listenerFieldForm);
        this.listenerForm.fields.push(this.listenerFieldForm);
      } else {
        this.fieldsListOfListener.splice(this.editingListenerFieldIndex, 1, this.listenerFieldForm);
        this.listenerForm.fields.splice(this.editingListenerFieldIndex, 1, this.listenerFieldForm);
      }
      this.listenerFieldFormModelVisible = false;
      this.$nextTick(() => (this.listenerFieldForm = {}));
    },
    // 移除监听器字段
    removeListenerField(field, index) {
      this.$confirm("确认移除该字段吗？", "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      })
        .then(() => {
          this.fieldsListOfListener.splice(index, 1);
          this.listenerForm.fields.splice(index, 1);
        })
        .catch(() => console.info("操作取消"));
    }
  }
};
</script>
