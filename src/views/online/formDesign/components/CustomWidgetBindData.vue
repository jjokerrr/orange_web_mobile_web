<template>
  <el-row>
    <el-form label-position="left" size="small" @submit.native.prevent>
      <el-col :span="24">
        <el-form-item label="组件类型">
          <el-input :value="SysCustomWidgetType.getValue(value.widgetType)" :disabled="true" />
        </el-form-item>
        <el-form-item label="绑定类型" v-if="(supportBindTable || supportBindColumn) && value.widgetType !== SysCustomWidgetType.Table">
          <el-select v-model="value.bindData.dataType" @change="onBindDataTypeChange" style="width: 100%">
            <el-option v-for="item in getValidBindDataType" :key="item.id"
              :label="item.name" :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定表"
          v-if="value.bindData.dataType === SysCustomWidgetBindDataType.Column && supportBindTable"
        >
          <el-select style="width: 100%;" v-model="value.bindData.tableId" placeholder="" filterable @change="onBindTableChange">
            <el-option v-for="item in getValidTableList" :key="item.tableId"
              :value="item.tableId" :label="item.tableName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定字段"
          v-if="value.bindData.dataType === SysCustomWidgetBindDataType.Column && supportBindColumn"
        >
          <el-select style="width: 100%;" v-model="value.bindData.columnId" placeholder="" clearable filterable @change="onBindColumnChange">
            <el-option v-for="item in getValidColumnList" :key="item.columnName"
              :value="item.columnId" :label="item.columnName" :disabled="item.disabled"
            >
              <el-row type="flex" justify="space-between" align="middle">
                <span>{{item.columnName}}</span>
                <el-tag v-if="item.disabled" style="margin-left: 40px;" size="mini" type="info">{{item.warningMsg}}</el-tag>
                <el-tag v-else style="margin-left: 40px;" size="mini" type="success">{{item.objectFieldType}}</el-tag>
              </el-row>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统变量" v-if="value.bindData.dataType === SysCustomWidgetBindDataType.SYSTEM_VARIABLE">
          <el-select style="width: 100%;" v-model="value.bindData.systemVariableType" placeholder filterable>
            <el-option v-for="item in OnlineSystemVariableType.getList()" :key="item.id"
              :label="item.name" :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="自定义字段" v-if="value.bindData.dataType === SysCustomWidgetBindDataType.Custom">
          <el-select style="width: 100%;" v-model="value.bindData.formFieldName" placeholder="" filterable>
            <el-option v-for="item in formConfig().form.customFieldList" :key="item.fieldName"
              :label="item.fieldName" :value="item.fieldName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="组件名称">
          <el-input v-model="value.showName" placeholder="" clearable filterable />
        </el-form-item>
        <el-form-item label="组件标识">
          <el-input v-model="value.variableName" placeholder="" clearable filterable />
        </el-form-item>
      </el-col>
    </el-form>
  </el-row>
</template>

<script>
import widgetData from '../../OnlinePageRender/components/config/index.js';
import { columnIsValidByWidgetType } from '../../OnlinePageRender/components/config/widgetTools.js'
import { findItemFromList } from '@/utils';

export default {
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  inject: ['formConfig'],
  methods: {
    clearDictInfo () {
      this.value.props.dictInfo = {
        dictId: undefined,
        paramList: []
      }
    },
    resetWidgetProps () {
      let tempProps = {};
      if (this.getWidgetAttributeConfig != null) {
        Object.keys(this.getWidgetAttributeConfig).forEach(attributeKey => {
          let attributeItem = this.getWidgetAttributeConfig[attributeKey];
          if (typeof attributeItem.value === 'function') {
            tempProps[attributeKey] = attributeItem.value(this.formConfig());
          }
        });
      }
      this.value.props = {
        ...this.value.props,
        ...tempProps
      }
    },
    onBindTableChange (val) {
      this.value.bindData.table = this.getBindTable;
      if (this.getBindTable) {
        if (this.getBindTable.relationType == null) {
          this.value.datasource = this.getBindTable.tag;
        } else {
          this.value.relation = this.getBindTable.tag;
          let temp = findItemFromList(this.formConfig().getAllTableList, this.value.relation.datasourceId, 'id');
          this.value.datasource = temp ? temp.tag : undefined;
        }
      }
      if (this.value.datasource == null) console.error('没有找到组件绑定的数据源！');
      this.value.bindData.columnId = undefined;
      this.onBindColumnChange(undefined);
      this.resetWidgetProps();
    },
    onBindColumnChange (val) {
      this.clearDictInfo();
      this.value.bindData.column = findItemFromList(this.getValidColumnList, val, 'columnId');
      this.value.column = this.value.bindData.column;
      if (this.value.column) {
        this.value.showName = this.value.column.columnComment;
        this.value.variableName = this.value.column.objectFieldName || this.value.column.columnName;
        if (this.value.props.required != null) {
          if (this.value.column.required == null) {
            this.value.props.required = !this.value.column.nullable;
          } else {
            this.value.props.required = this.value.column.required;
          }
        }
      }
      // Text类型组件，设置默认显示内容
      if (this.value.widgetType === this.SysCustomWidgetType.Text) {
        this.value.props.text = (this.value.column || {}).columnComment || '文本组件';
      }
    },
    onBindDataTypeChange (val) {
      this.clearDictInfo();
    }
  },
  computed: {
    supportBindTable () {
      return widgetData.supportBindTable(this.value);
    },
    supportBindColumn () {
      return widgetData.supportBindColumn(this.value);
    },
    getWidgetAttributeConfig () {
      // return (widgetData.getWidgetAttribute(this.value.widgetType) || {}).attribute;
      return (this.formConfig().getWidgetAttribute(this.value.widgetType) || {}).attribute;
    },
    getValidTableList () {
      if (this.value.parent != null) {
        return this.formConfig().getTableWidgetTableList;
      } else if (this.value.widgetType === this.SysCustomWidgetType.Table || this.value.widgetType === this.SysCustomWidgetType.List) {
        return this.formConfig().getTableWidgetTableList.filter(item => {
          if (this.formType === this.SysOnlineFormType.QUERY || this.formType === this.SysOnlineFormType.ONE_TO_ONE_QUERY) {
            return item.tableId === this.formConfig().getMasterTable.tableId;
          } else {
            return true;
          }
        });
      } else if (this.value.widgetType === this.SysCustomWidgetType.DataSelect) {
        // 关联选择组件，只能从主表中选择
        return this.formConfig().getValidTableList.filter(item => {
          return item.tableId === this.formConfig().getMasterTable.tableId;
        });
      } else {
        return this.formConfig().getValidTableList;
      }
    },
    getBindTable () {
      return findItemFromList(this.getValidTableList, this.value.bindData.tableId, 'tableId');
    },
    getValidColumnList () {
      let temp = this.getBindTable ? this.getBindTable.columnList.map(item => {
        let { disabled, warningMsg } = columnIsValidByWidgetType(item, this.value.widgetType, this.formType);
        // 查询页面仅能选择支持过滤的字段
        if (!disabled && item.filterType === this.SysOnlineColumnFilterType.NONE &&
          this.formConfig().activeMode !== 'mobile' &&
          [this.SysOnlineFormType.QUERY, this.SysOnlineFormType.ADVANCE_QUERY, this.SysOnlineFormType.ONE_TO_ONE_QUERY].indexOf(this.formType) !== -1
        ) {
          disabled = true;
          warningMsg = '未支持过滤';
        }
        return {
          ...item,
          disabled,
          warningMsg
        }
      }).sort((val1, val2) => {
        return ((val1.disabled ? 1 : 0) - (val2.disabled ? 1 : 0));
      }) : [];
      return temp;
    },
    getValidBindDataType () {
      return this.SysCustomWidgetBindDataType.getList().filter(item => {
        switch (item.id) {
          case this.SysCustomWidgetBindDataType.Column: return true;
          case this.SysCustomWidgetBindDataType.Custom: return this.value.widgetType !== this.SysCustomWidgetType.Table;
          case this.SysCustomWidgetBindDataType.SYSTEM_VARIABLE: return this.value.widgetType === this.SysCustomWidgetType.Label;
          case this.SysCustomWidgetBindDataType.Fixed: return this.value.widgetType === this.SysCustomWidgetType.Image || this.value.widgetType === this.SysCustomWidgetType.Text;
        }
      });
    },
    masterTable () {
      return this.formConfig().getMasterTable;
    },
    formType () {
      return this.formConfig().form.formType;
    }
  },
  mounted () {
  },
  watch: {
    getValidTableList: {
      handler () {
        if (this.value.bindData.tableId == null && this.getValidTableList && this.getValidTableList.length === 1) {
          this.value.bindData.tableId = this.getValidTableList[0].tableId;
          this.onBindTableChange();
        }
      },
      immediate: true
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
