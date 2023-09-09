<template>
    <div>
      <el-input v-model="phoneNumber"
                :placeholder="placeholder"
                :disabled=" disabled"
                :size="size"></el-input>
      <span v-if="!validatePhoneNumber" style="color: red;">请输入正确的手机号</span>
    </div>
  </template>
  
<script>
export default {
  name: 'phoneNumber',
  props: {
    value: {
      type: String
    },
    placeholder: {
      type: String,
      default: '请输入手机号'
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
      phoneNumber: this.value
    };
  },
  computed: {
    validatePhoneNumber () {
      const reg = /^1[3456789]\d{9}$/;
      return reg.test(this.phoneNumber);
    }
  },
  watch: {
    phoneNumber (val) {
      this.$emit('input', val);
      this.$emit('change', val);
    },
    value (val) {
      this.phoneNumber = val;
    }
  }
};
</script>
