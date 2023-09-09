<template>
    <div class="cityselector">
      <el-cascader style="width: 100%;"
                   :options="options"
                    v-model="cityvalue"
                   :disabled="disabled"
                   :size="size"
                   :placeholder="placeholder"
                   :clearable="clearable"
                   :props="{ checkStrictly: true }"
                   >
      </el-cascader>
    </div>
  </template>
<script>
import {cityjson} from '@/staticDict/CityInfo.js';
  
export default {
  name: 'cityselector',
  props: {
    value: {
      type:
        String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String
    },
    size: {
      type: String
    },
    clearable: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String
    }
  },
  data () {
    return {
      options: cityjson,
      cityvalue: this.value
    };
  },
  watch: {
    cityvalue (val) {
      if (Array.isArray(val)) {
        val = val[val.length - 1];
      }
      this.$emit('input', val);
      this.$emit('change', val);
    },
    value (val) {
      console.log(val);
      this.cityvalue = val;
    }
  
  }
};
</script>
