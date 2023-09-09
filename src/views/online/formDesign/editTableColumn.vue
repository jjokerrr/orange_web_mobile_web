<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <el-form v-if="dialogParams.rowData" ref="form" :model="formData"
      class="full-width-input form-box" :rules="rules" style="width: 100%; height: 450px;"
      label-width="120px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent
    >
      <el-form-item label="字段名：">
        <span :title="formData.columnComment">{{formData.columnName}}</span>
        <el-tag :size="defaultFormItemSize" type="warning" v-if="formData.primaryKey" style="margin-left: 20px;">主键</el-tag>
      </el-form-item>
      <el-form-item label="字段类型：">
        <span>{{formData.fullColumnType}}</span>
        <el-tag :size="defaultFormItemSize" type="success" effect="dark" style="margin-left: 10px;">{{formData.objectFieldType}}</el-tag>
      </el-form-item>
      <el-form-item label="是否必填：">
        <el-switch v-model="formData.required" />
      </el-form-item>
      <el-form-item label="显示名称：">
        <el-input v-model="formData.columnComment" style="width: 100%;" @change="dirty = true" placeholder="字段在表单上的显示名称" />
      </el-form-item>
      <el-form-item label="字典数据：">
        <el-select v-model="formData.dictId" placeholder="选择字段绑定的字典" style="width: 100%;"
          clearable filterable :disabled="formData.objectFieldType === 'Boolean'"
          @change="onDictChange"
        >
          <el-option v-for="item in dialogParams.dictList" :key="item.dictId" :value="item.dictId" :label="item.dictName" />
        </el-select>
      </el-form-item>
      <el-form-item label="过滤支持：">
        <el-radio-group v-model="formData.filterType" @change="dirty = true">
          <el-radio-button v-for="item in SysOnlineColumnFilterType.getList()"
            :key="item.id" :label="item.id"
            :disabled="item.id === SysOnlineColumnFilterType.MULTI_SELECT_FILTER && (formData.dictId == null || formData.dictId === '')"
          >
            {{SysOnlineColumnFilterType.getValue(item.id)}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="字段类别：">
        <el-select v-model="formData.fieldKind" clearable placeholder="字段的业务类别" @change="dirty = true" style="width: 100%;">
          <el-option v-for="item in getValidColumnKind" :key="item.id"
            :label="item.name" :value="item.id" :disabled="columnKindItemDisabled(item)"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.fieldKind === SysOnlineFieldKind.UPLOAD || formData.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE"
        label="存储类型："
      >
        <el-select v-model="formData.uploadFileSystemType" clearable placeholder="字段的业务类别" @change="dirty = true" style="width: 100%;">
          <el-option label="本地存储" :value="0" />
          <el-option label="分布式存储" :value="100" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.fieldKind === SysOnlineFieldKind.AUTO_CODE"
        label="自动编码规则："
      >
        <el-input v-model="formData.encodedRule.prefix" style="width: 80px; margin-right: 5px;" placeholder="前缀" @change="dirty = true" />
        <el-select v-model="formData.encodedRule.precisionTo" clearable placeholder="" @change="dirty = true" style="width: 160px; margin-right: 5px;">
          <el-option v-for="item in SysAutoCodeType.getList()" :key="item.id"
            :label="item.name" :value="item.id"
          />
        </el-select>
        <el-input v-model="formData.encodedRule.middle" style="width: 80px; margin-right: 5px;" placeholder="后缀" @change="dirty = true" />
        <el-input-number v-model="formData.encodedRule.idWidth" style="width: 100px;"
          placeholder="序号宽度" :controls="false" :min="1" @change="dirty = true"
        />
      </el-form-item>
    </el-form>
    <el-row class="no-scroll flex-box menu-box" type="flex" justify="end">
      <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
        取消
      </el-button>
      <el-button type="primary" :size="defaultFormItemSize"
        @click="onSubmit()">
        保存
      </el-button>
    </el-row>
  </div>
</template>

<script>
import { OnlineColumnController } from '@/api/onlineController.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';

export default {
  name: 'editTableColumn',
  props: {
    rowData: {
      type: Object
    },
    isMasterTable: {
      type: Boolean,
      default: false
    },
    dictList: {
      type: Array
    }
  },
  mixins: [thirdPartyMixin],
  data () {
    return {
      formData: {

      },
      rules: {}
    }
  },
  methods: {
    onCancel (isSuccess = false) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path);
      }
    },
    onSubmit () {
      this.formData.encodedRule.calculateWhenView = this.formData.fieldKind === this.SysOnlineFieldKind.AUTO_CODE;
      if (this.formData.encodedRule.calculateWhenView) {
        if (this.formData.encodedRule.prefix == null || this.formData.encodedRule.prefix === '') {
          this.$message.error('自动编码前缀不能为空！');
          return Promise.reject();
        }
        if (this.formData.encodedRule.precisionTo == null || this.formData.encodedRule.precisionTo === '') {
          this.$message.error('自动编码精度类型！');
          return Promise.reject();
        }
        if (this.formData.encodedRule.idWidth == null || this.formData.encodedRule.idWidth <= 0) {
          this.$message.error('自动编码编号长度不能小于1！');
          return Promise.reject();
        }
      }
      return new Promise((resolve, reject) => {
        let params = {
          onlineColumnDto: {
            ...this.formData,
            dictId: this.formData.objectFieldType === 'Boolean' ? undefined : this.formData.dictId,
            uploadFileSystemType: this.formData.uploadFileSystemType || 0,
            userFilter: this.dataPermFilterType === this.SysOnlineDataPermFilterType.USER_FILTER,
            deptFilter: this.dataPermFilterType === this.SysOnlineDataPermFilterType.DEPT_FILTER,
            encodedRule: JSON.stringify(this.formData.encodedRule),
            nullable: !this.formData.required
          }
        }

        OnlineColumnController.update(this, params).then(res => {
          this.dirty = false;
          this.$message.success('保存成功！');
          this.onCancel(true);
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 绑定字典改变，如果取消绑定字典，则不能选择多选过滤
     */
    onDictChange (value) {
      if ((value == null || value === '') && this.formData.filterType === this.SysOnlineColumnFilterType.MULTI_SELECT_FILTER) {
        this.formData.filterType = this.SysOnlineColumnFilterType.NONE;
      }
    },
    columnKindItemDisabled (columnKind) {
      switch (columnKind.id) {
        case this.SysOnlineFieldKind.CREATE_TIME:
        case this.SysOnlineFieldKind.UPDATE_TIME:
          return this.formData.objectFieldType !== 'Date';
        case this.SysOnlineFieldKind.UPLOAD:
        case this.SysOnlineFieldKind.UPLOAD_IMAGE:
        case this.SysOnlineFieldKind.RICH_TEXT:
        case this.SysOnlineFieldKind.AUTO_CODE:
          return this.formData.objectFieldType !== 'String';
        case this.SysOnlineFieldKind.LOGIC_DELETE:
        case this.SysOnlineFieldKind.FLOW_STATUS:
          return this.formData.objectFieldType !== 'Integer';
        default:
          return false;
      }
    }
  },
  computed: {
    dialogParams () {
      return {
        rowData: this.rowData || this.thirdParams.rowData,
        isMasterTable: this.isMasterTable || this.thirdParams.isMasterTable,
        dictList: this.dictList || this.thirdParams.dictList
      }
    },
    getValidColumnKind () {
      return this.SysOnlineFieldKind.getList().filter(item => {
        return this.dialogParams.isMasterTable ? true : item.id !== this.SysOnlineFieldKind.FLOW_STATUS;
      });
    }
  },
  mounted () {
    this.formData = {
      ...this.dialogParams.rowData,
      encodedRule: this.dialogParams.rowData.encodedRule ? JSON.parse(this.dialogParams.rowData.encodedRule) : {}
    }
  }
}
</script>

<style>
</style>
