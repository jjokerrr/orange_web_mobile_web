<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <!-- 设置字段验证规则 -->
    <el-form v-if="!isCreateRule" class="full-width-input form-box" ref="form" :rules="rules" :model="formData"
      label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="验证规则" prop="ruleId" key="ruleId">
            <el-row type="flex" justify="space-between">
              <el-select class="input-item" v-model="formData.ruleId" placeholder="选择验证规则" clearable
                :disabled="isEdit"
                :loading="ruleListWidget.loading"
                @visible-change="ruleListWidget.onVisibleChange"
                @change="onRuleIdChange">
                <el-option v-for="item in ruleListWidget.dropdownList" :key="item.ruleId" :value="item.ruleId" :label="item.ruleName">
                  <el-row type="flex" justify="end" align="middle" class="rule-item">
                    <span style="width: 100%;">{{item.ruleName}}</span>
                    <el-button v-if="!item.builtin" type="text" icon="el-icon-edit-outline"
                      style="margin-left: 30px;" @click.stop="onEditRule(item)"
                    />
                    <el-button v-if="!item.builtin" type="text" icon="el-icon-circle-close"
                      @click.stop="onDeleteRule(item)"
                    />
                  </el-row>
                </el-option>
              </el-select>
              <el-button v-if="!isEdit" type="warning" style="margin-left: 3px;" @click="onCreateRuleClick">新建规则</el-button>
            </el-row>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="错误信息" prop="message" key="message">
            <el-input v-model="formData.message" placeholder="输入校验错误信息" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="最小值">
            <el-input-number class="number-center" v-model="formData.min" placeholder="输入最小值"
              :disabled="!ruleInfo || ruleInfo.ruleType !== SysOnlineRuleType.RANGE" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="最大值">
            <el-input-number class="number-center" v-model="formData.max" placeholder="输入最大值"
              :disabled="!ruleInfo || ruleInfo.ruleType !== SysOnlineRuleType.RANGE" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 新建验证规则 -->
    <el-form v-if="isCreateRule" class="full-width-input form-box" ref="ruleData" :rules="rules" :model="ruleData"
      label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="规则类型" prop="ruleType">
            <el-input :value="SysOnlineRuleType.getValue(ruleData.ruleType)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="规则名称" prop="ruleName" key="ruleName">
            <el-input v-model="ruleData.ruleName" placeholder="规则名称" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="正则表达式" prop="pattern" key="pattern">
            <el-input type="textarea" v-model="ruleData.pattern" placeholder="规则正则表达式" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="menu-box" type="flex" justify="end">
      <el-button :size="defaultFormItemSize" :plain="true" @click="onCancelClick">取消</el-button>
      <el-button type="primary" :size="defaultFormItemSize" @click="onSubmit">保存</el-button>
    </el-row>
  </div>
</template>

<script>
import { findItemFromList } from '@/utils';
import { DropdownWidget } from '@/utils/widget.js';
import { OnlineRuleController, OnlineColumnController } from '@/api/onlineController.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';

export default {
  props: {
    column: {
      type: Object
    },
    columnRule: {
      type: Object
    }
  },
  mixins: [thirdPartyMixin],
  data () {
    return {
      isCreateRule: false,
      isEditRule: false,
      formData: {
        ruleId: undefined,
        message: undefined,
        min: undefined,
        max: undefined
      },
      ruleData: {
        ruleName: undefined,
        ruleType: this.SysOnlineRuleType.CUSTOM,
        pattern: undefined,
        builtin: false
      },
      rules: {
        ruleId: [
          {required: true, message: '请选择验证规则', trigger: 'blur'}
        ],
        message: [
          {required: true, message: '请输入校验错误信息', trigger: 'blur'}
        ],
        ruleName: [
          {required: true, message: '规则名称不能为空', trigger: 'blur'}
        ],
        pattern: [
          {required: true, message: '正则表达式不能为空', trigger: 'blur'}
        ]
      },
      ruleListWidget: new DropdownWidget(this.loadRuleListDropdownList)
    }
  },
  methods: {
    removeValidate () {
      if (this.$refs.ruleData) this.$refs.ruleData.clearValidate();
      if (this.$refs.form) this.$refs.form.clearValidate();
    },
    onCancelClick () {
      if (!this.isCreateRule) {
        this.onCancel(false);
      }
      this.isCreateRule = this.isEditRule = false;
      this.removeValidate();
    },
    onCancel (isSuccess) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path);
      }
    },
    onSubmit () {
      if (this.isEdit) {
        this.onUpdateColumnRule();
      } else {
        this.isCreateRule ? this.onSaveRule() : this.onSetColumnRule();
      }
    },
    onCreateRuleClick () {
      this.isCreateRule = true;
      this.isEditRule = false;
      this.ruleData = {
        ruleName: undefined,
        pattern: undefined,
        ruleType: this.SysOnlineRuleType.CUSTOM,
        builtin: false
      }
      this.removeValidate();
    },
    onEditRule (rule) {
      this.isCreateRule = true;
      this.isEditRule = true;
      this.ruleData = {
        ...rule
      }
      this.removeValidate();
    },
    onDeleteRule (rule) {
      this.$confirm('是否删除此规则？').then(res => {
        let params = {
          ruleId: rule.ruleId
        }
        return OnlineRuleController.delete(this, params);
      }).then(res => {
        if (this.formData.ruleId === rule.ruleId) {
          this.formData.ruleId = undefined;
        }
        this.ruleListWidget.dirty = true;
        this.ruleListWidget.onVisibleChange(true);
      }).catch(e => {});
    },
    onSaveRule () {
      this.$refs.ruleData.validate(valid => {
        if (!valid) return;
        let params = {
          onlineRuleDto: {
            ...this.ruleData
          }
        }
        let httpCall = this.isEditRule ? OnlineRuleController.update(this, params) : OnlineRuleController.add(this, params);
        httpCall.then(res => {
          if (!this.isEditRule) this.formData.ruleId = res.data;
          this.ruleListWidget.dirty = true;
          this.ruleListWidget.onVisibleChange(true);
          this.isCreateRule = false;
        }).catch(e => {});
      })
    },
    onSetColumnRule () {
      let params = {
        columnId: this.dialogParams.column.columnId,
        onlineColumnRuleDtoList: [
          {
            columnId: this.dialogParams.column.columnId,
            ruleId: this.formData.ruleId,
            propDataJson: JSON.stringify({
              message: this.formData.message,
              min: this.formData.min,
              max: this.formData.max
            })
          }
        ]
      }
      OnlineColumnController.addOnlineColumnRule(this, params).then(res => {
        this.$message.success('添加成功！');
        this.onCancel(true);
      }).catch(e => {});
    },
    onUpdateColumnRule () {
      let params = {
        onlineColumnRuleDto: {
          columnId: this.dialogParams.column.columnId,
          ruleId: this.formData.ruleId,
          propDataJson: JSON.stringify({
            message: this.formData.message,
            min: this.formData.min,
            max: this.formData.max
          })
        }
      }
      OnlineColumnController.updateOnlineColumnRule(this, params).then(res => {
        this.$message.success('保存成功！');
        this.onCancel(true);
      }).catch(e => {});
    },
    loadRuleListDropdownList () {
      return new Promise((resolve, reject) => {
        let params = {
          columnId: this.dialogParams.column.columnId
        }
        let httpCall = this.isEdit ? OnlineColumnController.listOnlineColumnRule(this, params) : OnlineColumnController.listNotInOnlineColumnRule(this, params);
        httpCall.then(res => {
          resolve(res.data.dataList);
        }).catch(e => {
          reject(e);
        })
      });
    },
    onRuleIdChange (value) {
      this.formData.message = undefined;
    }
  },
  computed: {
    dialogParams () {
      return {
        column: this.column || this.thirdParams.column,
        columnRule: this.columnRule || this.thirdParams.columnRule
      }
    },
    isEdit () {
      return this.dialogParams.columnRule != null;
    },
    ruleInfo () {
      return findItemFromList(this.ruleListWidget.dropdownList, this.formData.ruleId, 'ruleId');
    }
  },
  mounted () {
    if (this.dialogParams.columnRule != null) {
      this.formData = {
        ruleId: this.dialogParams.columnRule.ruleId,
        message: this.dialogParams.columnRule.columnRuleInfo.message,
        max: this.dialogParams.columnRule.columnRuleInfo.max,
        min: this.dialogParams.columnRule.columnRuleInfo.min
      }
      this.ruleListWidget.onVisibleChange(true);
    }
  }
}
</script>

<style scoped>
  .rule-item .el-button {
    display: none;
    font-size: 14px;
  }

  .rule-item:hover .el-button {
    display: block;
  }
</style>
