<template>
  <div>
    <el-input :value="value" @input="onValueChange" :size="size" :disabled="disabled">
      <el-button slot="append" icon="el-icon-upload2" @click="onSelect" :disabled="disabled">
      </el-button>
    </el-input>
    <input type="file" ref="fileSelect" v-show="false" accept="image/*" @change="onSelectImageChange" />
  </div>
</template>

<script>
import { fileToBase64 } from '@/utils';

export default {
  props: {
    value: {
      type: String
    },
    size: {
      type: String,
      default: 'small'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onSelect () {
      this.$refs.fileSelect.click();
    },
    onSelectImageChange (e) {
      let file = e.target.files[0];
      if (file != null) {
        fileToBase64(file).then(res => {
          this.onValueChange(res);
        }).catch(e => {
          console.log(e);
        });
      }
    },
    onValueChange (val) {
      this.$emit('input', val);
    }
  }
}
</script>

<style>
</style>
