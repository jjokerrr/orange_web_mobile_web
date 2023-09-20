<template>
  <div class="task-multiple-select">
    <slot/>
    <div class="tag-box" v-if="selectValues.length">
      <el-tag :size="defaultFormItemSize" effect="dark"
        v-for="item in selectValues" :key="item.id"
        :closable="!isCountersign" @close="onDeleteTag(item)"
      >
        {{item.name}}
      </el-tag>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskMultipleSelect',
  props: {
    value: {
      type: [String, Array]
    },
    isCountersign: {
      type: Boolean,
      default: false
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

<style lang="scss" scoped>
  .task-multiple-select{
    ::v-deep .el-tag {
      margin-right: 8px;
      background-color: #F6F6F6;
      border-color: #E8E8E8;
      color: #666666;
      padding-right: 4px;
      .el-tag__close{
        color: #666666;
        font-size: 12px;
        transform: scale(1);
        right: 1px;
        &:hover{
          background-color: transparent;
        }
      }
    }
    .tag-box {
      flex-grow: 1;
      margin-top: 8px;
    }
  }
</style>
