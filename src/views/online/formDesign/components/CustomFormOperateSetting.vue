<template>
  <el-form :size="defaultFormItemSize" @submit.native.prevent>
    <MultiItemList
      label="操作"
      :data="value"
      addText="添加"
      @add="onEditOperate()"
      @edit="onEditOperate"
      @delete="onDeleteOperate"
      :prop="{
        label: 'name',
        value: 'name',
        disabled: function (item) {
          return item.builtin;
        }
      }">
      <el-tag slot="right" slot-scope="scope" size="mini" :type="scope.data.enabled ? 'success' : 'danger'">
        {{scope.data.enabled ? '启动' : '禁用'}}
      </el-tag>
    </MultiItemList>
  </el-form>
</template>

<script>
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import EditCustomFormOperate from './EditCustomFormOperate.vue';
import MultiItemList from '@/components/MultiItemList/index.vue';

export default {
  name: 'customFormOperateSetting',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    formList: {
      type: Array,
      default: () => []
    },
    tableList: {
      type: Array,
      default: () => []
    }
  },
  inject: ['formConfig'],
  mixins: [refreshDataMixins],
  components: {
    MultiItemList
  },
  data () {
    return {}
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdEditCustomFormOperate' && data.isSuccess) {
        this.handlerEditOperate(data.rowData, data.data);
      }
    },
    onDeleteOperate (row) {
      this.$confirm('是否删除此操作？').then(res => {
        this.$emit('input', this.value.filter(item => item.id !== row.id));
      }).catch(e => {});
    },
    handlerEditOperate (row, res) {
      let tempList = [];
      if (row == null) {
        res.id = new Date().getTime();
        tempList = this.value.concat(res);
      } else {
        tempList = this.value.map(item => {
          return item.id === res.id ? res : item;
        });
      }
      this.$emit('input', tempList);
    },
    onEditOperate (row) {
      this.$dialog.show(row == null ? '添加操作' : '编辑操作', EditCustomFormOperate, {
        area: (row && row.type === this.SysCustomWidgetOperationType.EXPORT) ? '900px' : '600px',
        offset: '50px'
      }, {
        rowData: row,
        formList: this.formList.map(item => {
          return {
            formId: item.formId,
            formType: item.formType,
            formName: item.formName
          }
        }),
        tableList: this.tableList,
        formConfig: this.buildFormConfig,
        path: 'thirdEditCustomFormOperate'
      }, {
        height: (row && row.type === this.SysCustomWidgetOperationType.EXPORT) ? '80vh' : '600px',
        width: (row && row.type === this.SysCustomWidgetOperationType.EXPORT) ? '900px' : '600px',
        pathName: '/thirdParty/thirdEditCustomFormOperate'
      }).then(res => {
        this.handlerEditOperate(row, res);
      }).catch(e => {
        console.log(e);
      });
    }
  },
  computed: {
    buildFormConfig () {
      let formConfig = this.formConfig();
      return {
        form: {
          formType: formConfig.form.formType,
          customFieldList: formConfig.form.customFieldList
        },
        getMasterTable: {
          relationType: formConfig.getMasterTable.relationType,
          tag: {
            datasourceName: formConfig.getMasterTable.tag.datasourceName,
            relationName: formConfig.getMasterTable.tag.relationName,
            variableName: formConfig.getMasterTable.tag.variableName
          },
          columnList: formConfig.getMasterTable.columnList.map(column => {
            return {
              filterType: column.filterType,
              columnComment: column.columnComment,
              columnName: column.columnName,
              columnId: column.columnId
            }
          })
        },
        getAllTableList: formConfig.getAllTableList.map(table => {
          return {
            relationType: table.relationType,
            tag: {
              datasourceName: table.tag.datasourceName,
              relationName: table.tag.relationName,
              variableName: table.tag.variableName
            },
            columnList: table.columnList.map(column => {
              return {
                filterType: column.filterType,
                columnComment: column.columnComment,
                columnName: column.columnName,
                columnId: column.columnId
              }
            })
          }
        })
      }
    }
  }
}

</script>

<style scoped>
  .full-line-btn {
    width: 100%;
    margin-top: 10px;
    border: 1px dashed #EBEEF5;
  }
</style>
