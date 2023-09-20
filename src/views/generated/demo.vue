<template>
  <div class="page-box" style="position: relative;">
  </div>
</template>

<script>
/* eslint-disable-next-line */
import { findTreeNode, findTreeNodePath, findItemFromList } from '@/utils';
/* eslint-disable-next-line */
import rules from '@/utils/validate.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin, cachePageMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { SysUserController, DictionaryController } from '@/api';

export default {
  name: 'demo',
  props: {
  },
  mixins: [uploadMixin, statsDateRangeMixin, cachePageMixin],
  data () {
    return {
      demo: {
        isInit: false
      }
    }
  },
  methods: {
    /**
     * 更新demo
     */
    refreshDemo (reloadData = false) {
      if (!this.demo.isInit) {
        // 初始化下拉数据
      }
      this.demo.isInit = true;
    },
    onResume () {
      this.refreshDemo();
    },
    initFormData () {
    },
    formInit () {
      this.refreshDemo();
    }
  },
  mounted () {
    // 初始化页面数据
  },
  computed: {
  },
  watch: {
  }
}
</script>
