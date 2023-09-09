<template>
  <div class="tag-select">
    <div class="tag-box">
      <el-tag v-for="item in selectValues" :key="item.id" effect="dark"
        style="margin-right: 5px;" type="primary" :size="defaultFormItemSize" closable
        @close="onDeleteTag(item)"
      >
        {{item.name}}
      </el-tag>
    </div>
    <slot name="append" />
  </div>
</template>

<script>
export default {
  name: 'TagSelect',
  props: {
    value: {
      type: [String, Array]
    }
  },
  data () {
    return {
      selectValues: [],
      calcUserName: {
        // eslint-disable-next-line no-template-curly-in-string
        '${startUserName}': '流程发起人',
        // eslint-disable-next-line no-template-curly-in-string
        '${appointedAssignee}': '指定审批人 '
      }
    }
  },
  methods: {
    onDeleteTag (tag) {
      let temp = this.selectValues.filter(item => {
        return item !== tag;
      });
      if (Array.isArray(this.value)) {
        this.$emit('input', temp);
      } else {
        this.$emit('input', temp.map(item => item.id).join(','));
      }
    }
  },
  watch: {
    value: {
      handler (newValue) {
        if (newValue == null || newValue === '') {
          this.selectValues = [];
        } else {
          if (Array.isArray(newValue)) {
            this.selectValues = [...newValue].map(row => {
              return { id: row.id, name: this.calcUserName[row.id] ? this.calcUserName[row.id] : (row.name || row.id)}
            });
          } else {
            this.selectValues = newValue.split(',').map(item => {
              return {
                id: item,
                /* eslint-disable-next-line */
                name: this.calcUserName[item] ? this.calcUserName[item] : item
              }
            });
          }
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
  .tag-select {
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    display: flex;
  }
  .tag-box {
    flex-grow: 1;
    padding: 0px 5px;
  }
</style>
