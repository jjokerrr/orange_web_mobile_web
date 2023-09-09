<template>
  <div class="script-editor">
    <el-badge :is-dot="true" :type="(value == null || value === '') ? 'danger' : 'success'">
      <el-button v-if="textShowType === 'button'" @click="onEditScript">{{buttonText}}</el-button>
      <span v-else @click="onEditScript">{{buttonText}}</span>
    </el-badge>
    <el-dialog v-if="showEditor" class="script-editor-dialog" title="编辑脚本" :visible.sync="showEditor"
      width="80vw" top="60px" :fullscreen="false"
      :append-to-body="true"
    >
      <el-container>
        <el-aside width="300px">
          <el-card class="base-card" shadow="never"
            :body-style="{ padding: '0px' }"
            style="border: none"
          >
            <div slot="header" class="base-card-header">
              <span>参数列表</span>
            </div>
            <el-scrollbar style="height: 600px" class="custom-scroll">
              <el-collapse :accordion="false" style="border: none; height: 590px;">
                <el-collapse-item v-for="param in paramList" :key="param" :title="param">
                  <el-row slot="title">
                    <span style="padding: 0px 15px;">{{param}}</span>
                  </el-row>
                </el-collapse-item>
              </el-collapse>
            </el-scrollbar>
          </el-card>
        </el-aside>
        <el-main style="margin-left: 10px; background: white; height: 650px;">
          <el-card class="base-card" shadow="never"
            :body-style="{ padding: '0px' }"
            style="border: none"
          >
            <div slot="header" class="base-card-header">
              <span>{{title}}</span>
              <div class="base-card-operation">
                <el-button type="success" size="mini" @click="onValueChange">保存</el-button>
              </div>
            </div>
            <el-row style="width: 100%; height: 598px;">
              <el-col :span="24">
                <ScriptEditor v-model="scriptString" style="height: 598px; width: 100%;" />
              </el-col>
            </el-row>
          </el-card>
        </el-main>
      </el-container>
    </el-dialog>
  </div>
</template>

<script>
import ScriptEditor from '@/components/ScriptEditor';

export default {
  props: {
    value: {
      type: String
    },
    tableList: {
      type: Array,
      default: () => []
    },
    title: {
      type: String
    },
    desc: {
      type: String
    },
    paramList: {
      type: Array,
      default: () => []
    },
    textShowType: {
      type: String,
      default: 'button'
    },
    buttonText: {
      type: String,
      default: '编辑脚本'
    }
  },
  components: {
    ScriptEditor
  },
  data () {
    return {
      showEditor: false,
      scriptString: undefined
    }
  },
  methods: {
    onEditScript () {
      this.scriptString = this.value;
      this.showEditor = true;
    },
    onValueChange () {
      this.$emit('input', this.scriptString);
    }
  },
  mounted () {
  },
  watch: {
    value: {
      handler (newValue) {
        this.scriptString = newValue;
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
  .script-editor-dialog >>> .el-dialog__body {
    padding: 10px!important;
    background: #F9F9F9;
  }
</style>
