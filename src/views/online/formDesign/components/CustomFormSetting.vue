<template>
  <el-form label-position="left" size="small" @submit.native.prevent>
    <el-form-item label="表单 ID">
      <el-row type="flex" justify="space-between" align="middle" style="width: 100%">
        <el-input readonly :value="formConfig().form.formId" />
        <el-button class="formShareBtn" type="text" icon="el-icon-share"
          style="margin-left: 8px;"
          :title="(formConfig().form.formType !== SysOnlineFormType.QUERY && formConfig().form.formType !== SysOnlineFormType.ADVANCE_QUERY) ? '只允许接入查询表单' : '复制接入信息'"
          :disabled="formConfig().form.formType !== SysOnlineFormType.QUERY && formConfig().form.formType !== SysOnlineFormType.ADVANCE_QUERY"
          :data-clipboard-text="shareInfo"
          @click="onShareForm"
        />
      </el-row>
    </el-form-item>
    <el-form-item label="表单类型">
      <el-input v-model="(formConfig().form.formTypeDictMap || {}).name" placeholder="" disabled />
    </el-form-item>
    <el-form-item label="表单名称">
      <el-input v-model="formConfig().form.formName" placeholder="" clearable filterable />
    </el-form-item>
    <el-form-item label="表单编码">
      <el-input v-model="formConfig().form.formCode" placeholder="" clearable filterable />
    </el-form-item>
    <el-form-item label="标签位置">
      <el-row type="flex" align="middle" style="height: 40px;width: 100%">
        <el-radio-group v-model="formConfig().form.labelPosition" size="small">
          <el-radio-button label="left">居左</el-radio-button>
          <el-radio-button label="right">居右</el-radio-button>
          <el-radio-button label="top">顶部</el-radio-button>
        </el-radio-group>
      </el-row>
    </el-form-item>
    <el-form-item label="标签宽度">
      <el-row type="flex" style="width: 100%">
        <el-input-number v-model="formConfig().form.labelWidth" style="width: 100%;" controls-position="right" />
      </el-row>
    </el-form-item>
    <el-form-item label="栅格间距">
      <el-row type="flex" style="width: 100%">
        <el-input-number v-model="formConfig().form.gutter" style="width: 100%" controls-position="right" />
      </el-row>
    </el-form-item>
    <el-form-item label="过滤组件宽度" v-if="formConfig().form.formType === SysOnlineFormType.QUERY || formConfig().form.formType === SysOnlineFormType.ADVANCE_QUERY">
      <el-row type="flex" style="width: 100%">
        <el-input-number v-model="formConfig().form.filterItemWidth" style="width: 100%" controls-position="right" />
      </el-row>
    </el-form-item>
    <el-form-item label="是否全屏" v-if="supportDialog">
      <el-row type="flex" align="middle" style="height: 40px;width: 100%">
        <el-radio-group v-model="formConfig().form.fullscreen" size="small">
          <el-radio :label="true">全屏</el-radio>
          <el-radio :label="false">弹窗</el-radio>
        </el-radio-group>
      </el-row>
    </el-form-item>
    <el-form-item v-if="supportDialog && !formConfig().form.fullscreen" label="弹窗宽度">
      <el-row type="flex" style="width: 100%">
        <el-input-number v-model="formConfig().form.width" style="width: 100%" controls-position="right" />
      </el-row>
    </el-form-item>
    <el-form-item v-if="supportDialog && !formConfig().form.fullscreen" label="弹窗高度">
      <el-row type="flex" style="width: 100%">
        <el-input-number v-model="formConfig().form.height" style="width: 100%" controls-position="right" />
      </el-row>
    </el-form-item>
    <el-form-item label="脱敏字段"
      v-if="formConfig().form.formType !== SysOnlineFormType.FLOW && formConfig().form.formType !== SysOnlineFormType.FORM"
    >
      <el-cascader style="width: 100%;"
        v-model="formConfig().form.maskFieldList"
        placeholder="选择表单脱敏字段"
        :show-all-levels="false"
        :collapse-tags="true"
        :options="getAllTableMaskColumnTree"
        :props="{multiple: true, label: 'name', value: 'id'}"
      />
    </el-form-item>
    <MultiItemList :data="formConfig().form.customFieldList"
      label="自定义字段"
      @add="onEditFormField()"
      @edit="onEditFormField"
      @delete="onRemoveFormField"
      :prop="{
        label: 'fieldName',
        value: 'fieldName'
      }"
    >
    </MultiItemList>
  </el-form>
</template>

<script>
import Clipboard from 'clipboard';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';
import { findItemFromList } from '@/utils';
import MultiItemList from '@/components/MultiItemList/index.vue';
import EditFormField from './EditFormField.vue';
import OnlineWidgetConfig from '../../OnlinePageRender/components/config/index.js';
import treeConfig from '@/online/config/tree.js';

export default {
  props: {
  },
  components: {
    MultiItemList
  },
  inject: ['formConfig'],
  mixins: [refreshDataMixins],
  data () {
    return {
      labelPosition: ''
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdEditFormField' && data.isSuccess) {
        this.handlerEditOperate(data.rowData, data.data);
      }
    },
    handlerEditOperate (row, fieldName) {
      if (Array.isArray(this.formConfig().form.customFieldList)) {
        if (row == null) {
          let temp = findItemFromList(this.formConfig().form.customFieldList, fieldName, 'fieldName');
          if (temp != null) {
            this.$message.error('此字段已存在！');
          } else {
            this.formConfig().form.customFieldList.push({
              fieldName: fieldName
            });
          }
        } else {
          if (row.fieldName !== fieldName) {
            // 修改了字段名
            let temp = findItemFromList(this.formConfig().form.customFieldList, fieldName, 'fieldName');
            if (temp != null) {
              this.$message.error('此字段已存在！');
            } else {
              this.formConfig().form.customFieldList = this.formConfig().form.customFieldList.map(item => {
                if (item.fieldName === row.fieldName) {
                  return {
                    fieldName: fieldName
                  };
                } else {
                  return {
                    ...item
                  }
                }
              });
            }
          }
        }
      } else {
        this.formConfig().form.customFieldList = [{
          fieldName: fieldName
        }];
      }
    },
    onEditFormField (row) {
      this.$dialog.show(row ? '编辑字段' : '添加字段', EditFormField, {
        area: '600px'
      }, {
        rowData: row,
        path: 'thirdEditFormField'
      }, {
        height: '200px',
        width: '600px',
        pathName: '/thirdParty/thirdEditFormField'
      }).then(fieldName => {
        this.handlerEditOperate(row, fieldName);
      }).catch(e => {});
    },
    onRemoveFormField (row) {
      this.$confirm('是否移除此字段？').then(res => {
        this.formConfig().form.customFieldList = this.formConfig().form.customFieldList.filter(item => {
          return item !== row;
        });
      }).catch(e => {});
    },
    advanceQueryChange (val) {
      if (val && this.formConfig().form.leftWidget == null) {
        this.$set(this.formConfig().form, 'leftWidget', {
          ...OnlineWidgetConfig.getWidgetObject(treeConfig)
        });
      }
      this.$set(this.formConfig().form, 'advanceQuery', val);
    },
    onShareForm () {
      let clipboard = new Clipboard('.formShareBtn');
      clipboard.on('success', e => {
        this.$message.success('接入信息复制成功！');
        clipboard.destroy();
      });
      clipboard.on('error', e => {
        this.$message.error('浏览器不支持复制，请手动复制接入信息：' + this.shareUrl);
        clipboard.destroy();
      });
    }
  },
  computed: {
    shareInfo () {
      let shareInfo = {
        url: window.location.origin + '/#/thirdParty/thirdOnlineForm?formId=' + this.formConfig().form.formId,
        datasourceVariableName: this.formConfig().getMasterTable == null ? undefined : this.formConfig().getMasterTable.tag.variableName
      }

      return JSON.stringify(shareInfo);
    },
    supportDialog () {
      return (
        // 编辑表单支持弹窗
        this.formConfig().form.formType === this.SysOnlineFormType.FORM ||
        // 子表查询页面支持弹窗
        (
          this.formConfig().form.formType === this.SysOnlineFormType.QUERY &&
          this.formConfig().getMasterTable && this.formConfig().getMasterTable.relationType != null
        )
      );
    },
    getMaskTableList () {
      if (this.formConfig().form.formType === this.SysOnlineFormType.FORM) {
        return this.formConfig().getAllTableList.filter(table => {
          if (this.formConfig().getMasterTable.relationType == null) {
            // 主表编辑
            return true;
          } else {
            // 从表编辑
            return table.tableId === this.formConfig().getMasterTable.tableId;
          }
        });
      } else {
        return this.formConfig().getValidTableList;
      }
    },
    getAllTableMaskColumnTree () {
      return this.getMaskTableList.map(table => {
        let maskColumnList = table.columnList.filter(column => {
          return column.fieldKind === this.SysOnlineFieldKind.FIELD_MASK;
        }).map(column => {
          return {
            id: column.columnId,
            name: column.columnName
          }
        });
        if (maskColumnList.length > 0) {
          return {
            id: table.tableId,
            name: table.tableName,
            children: maskColumnList
          }
        }
        return null;
      }).filter(item => item != null);
    }
  }
}
</script>

<style>

</style>
