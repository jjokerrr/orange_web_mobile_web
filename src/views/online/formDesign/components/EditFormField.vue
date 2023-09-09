<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <el-form ref="form" :model="formData" class="full-width-input form-box" :rules="rules" style="width: 100%;"
      label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent
    >
      <el-row>
        <el-col :span="24">
          <el-form-item label="字段名称" prop="fieldName">
            <el-input class="input-item" v-model="formData.fieldName"
              :clearable="true" placeholder="表单自定义字段名称" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="no-scroll flex-box menu-box" type="flex" justify="end">
      <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
        取消
      </el-button>
      <el-button type="primary" :size="defaultFormItemSize"
        @click="onSubmit()">
        保存
      </el-button>
    </el-row>
  </div>
</template>

<script>
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';

export default {
  name: 'editFormField',
  props: {
    rowData: {
      type: Object
    }
  },
  data () {
    return {
      formData: {
        fieldName: undefined
      },
      rules: {
        fieldName: [
          {
            required: true,
            message: '字段名称不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mixins: [thirdPartyMixin],
  methods: {
    onCancel (isSuccess = false) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, this.formData.fieldName);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, this.dialogParams.rowData, this.formData.fieldName);
      }
    },
    onSubmit () {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        this.onCancel(true);
      });
    }
  },
  computed: {
    dialogParams () {
      return {
        rowData: this.rowData || this.thirdParams.rowData
      }
    }
  },
  mounted () {
    if (this.dialogParams.rowData) {
      this.formData = {
        ...this.dialogParams.rowData
      }
    }
  }
}
</script>

<style>
</style>
