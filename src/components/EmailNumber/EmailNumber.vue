<template>
    <div>
      <el-input v-model="emailNumber"
                :placeholder="placeholder"
                :disabled=" disabled"
                :size="size"></el-input>
      <span v-if="!validateEmailNumber" style="color: red;">请输入正确的邮箱号</span>
    </div>
  </template>
  
<script>
export default {
  name: 'emailNumber',
  props: {
    value: {
      type: String
    },
    placeholder: {
      type: String,
      default: '请输入邮箱号'
    },
    disabled: {
      type: Boolean,
      default: false
  
    },
    size: {
      type: String
    }
  },
  data () {
    return {
      emailNumber: this.value
    };
  },
  computed: {
    validateEmailNumber () {
      const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/;
      return reg.test(this.emailNumber);
    }
  },
  watch: {
    emailNumber (val) {
      this.$emit('input', val);
      this.$emit('change', val);
    },
    value (val) {
      this.emailNumber = val;
    }
  }
};
</script>
