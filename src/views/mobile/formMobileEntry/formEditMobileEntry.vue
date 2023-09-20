<template>
  <div class="form-single-fragment" style="position: relative;">
    <el-form ref="formEditMobileEntry" :model="formData" class="full-width-input" :rules="rules" style="width: 100%;"
      label-width="80px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="24" v-if="entryType === MobileEntryType.SUDOKU">
          <el-form-item label="所属分组" prop="parentId">
            <el-select v-model="formData.parentId">
              <el-option v-for="group in groupList" :key="group.id"
                :label="group.name"
                :value="group.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="显示名称" prop="entryName">
            <el-input class="input-item" v-model="formData.entryName"
              :clearable="true" placeholder="显示名称"
            />
          </el-form-item>
        </el-col>
        <template v-if="entryType !== MobileEntryType.GROUP">
          <el-col :span="24">
            <el-form-item label="绑定类型">
              <el-select v-model="formData.bindType" plaaceholder="绑定类型"
                :disabled="isEdit"
                @change="onBindTypeChange">
                <el-option v-for="item in SysMenuBindType.getList().filter(item => item !== SysMenuBindType.THRID_URL)" :key="item.id"
                  :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.bindType === SysMenuBindType.ROUTER">
            <el-form-item label="菜单路由">
              <el-input v-model="formData.formRouterName" placeholder="菜单路由" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.bindType === SysMenuBindType.ONLINE_FORM">
            <el-form-item label="在线表单" prop="onlineFormId">
              <el-cascader v-model="onlineFormPath" :options="formTreeData" filterable
                :clearable="true" placeholder="选择绑定的在线表单"
                :props="{value: 'id', label: 'name'}"
                @change="onOnlineFormChange" />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="formData.bindType === SysMenuBindType.WORK_ORDER">
            <el-form-item label="工作流" prop="onlineFlowEntryId">
              <el-cascader v-model="onlineFlowPath" :options="entryTreeData" filterable
                :clearable="true" placeholder="选择绑定的工单"
                :props="{value: 'id', label: 'name'}"
                @change="onOnlineEntryChange" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="可见性" prop="commonEntry">
              <el-radio-group v-model="formData.commonEntry" @change="formData.roleIdList = undefined">
                <el-radio-button :label="true">所有人可见</el-radio-button>
                <el-radio-button :label="false">指定角色可见</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="!formData.commonEntry">
            <el-form-item label="用户角色" prop="roleIdList">
              <el-select v-model="formData.roleIdList" multiple placeholder="绑定用户角色">
                <el-option v-for="role in roleList" :key="role.roleId"
                  :label="role.roleName" :value="role.roleId" />
              </el-select>
            </el-form-item>
          </el-col>
        </template>
        <el-col :span="24">
          <el-form-item label="显示顺序" prop="showOrder">
            <el-input-number class="input-item" v-model="formData.showOrder"
              controls-position="right" style="width: 100%;"
              :clearable="true" placeholder="显示顺序"
            />
          </el-form-item>
        </el-col>
        <template v-if="entryType !== MobileEntryType.GROUP">
          <el-col :span="24">
            <el-form-item label="显示图片" prop="imageData">
              <el-upload
                class="upload-image-item"
                :show-file-list="false"
                :headers="getUploadHeaders"
                name="uploadFile" accept="image/*"
                :action="getUploadActionUrl('/admin/mobile/mobileEntry/uploadImage')"
                :on-success="onImageDataUploadSuccess"
                :on-remove="onImageDataRemoveFile"
              >
                <div v-if="formData.imageData != null" style="position: relative">
                  <img class="upload-image-show" :src="getImageUrl" />
                  <div class="upload-img-del el-icon-close"
                    @click.stop="onImageDataRemoveFile()" />
                </div>
                <i v-else class="el-icon-plus upload-image-item"></i>
              </el-upload>
            </el-form-item>
          </el-col>
        </template>
        <el-col :span="24">
          <el-row class="no-scroll flex-box" type="flex" justify="end">
            <el-button type="primary" :size="defaultFormItemSize" :plain="true"
              @click="onCancel(false)">
              取消
            </el-button>
            <el-button type="primary" :size="defaultFormItemSize"
              @click="onSubmit()">
              保存
            </el-button>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
/* eslint-disable-next-line */
import { treeDataTranslate, findTreeNodePath, findTreeNode, findItemFromList, fileToBase64 } from '@/utils';
/* eslint-disable-next-line */
import { UploadWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { uploadMixin, statsDateRangeMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { SystemController, MobileEntryController } from '@/api';
import { OnlinePageController } from '@/api/onlineController.js';
import { FlowOperationController } from '@/api/flowController.js';

export default {
  name: 'formEditMobileEntry',
  props: {
    entryType: {
      type: Number,
      default: 0
    },
    entryId: {
      default: undefined
    },
    parentId: {
      default: undefined
    },
    groupList: {
      type: Array,
      default: () => []
    },
    rowData: {
      type: Object
    }
  },
  mixins: [uploadMixin, statsDateRangeMixin],
  data () {
    return {
      formData: {
        entryId: undefined,
        parentId: undefined,
        entryName: undefined,
        entryType: undefined,
        formRouterName: undefined,
        onlineFormId: undefined,
        reportPageId: undefined,
        onlineFlowEntryId: undefined,
        bindType: undefined,
        extraData: undefined,
        imageData: undefined,
        showOrder: undefined,
        roleIdList: undefined,
        commonEntry: true
      },
      onlineFormPath: [],
      formTreeData: [],
      onlineFlowPath: [],
      entryTreeData: [],
      reportPageTreeData: [],
      reportPagePath: [],
      roleList: [],
      reportPageProps: {
        label: 'name',
        value: 'id'
      },
      rules: {
        entryName: [
          {required: true, message: '请输入显示名称', trigger: 'blur'}
        ],
        imageData: [
          {required: true, message: '请选择显示图片', trigger: 'blur'}
        ],
        showOrder: [
          {required: true, message: '请输入显示顺序', trigger: 'blur'}
        ],
        bindType: [
          {required: true, message: '请选择绑定类型', trigger: 'blur'}
        ],
        onlineFormId: [
          {required: true, message: '请选择绑定的在线表单', trigger: 'blur'}
        ],
        onlineFlowEntryId: [
          {required: true, message: '请选择菜单绑定的工单', trigger: 'blur'}],
        reportPageId: [{required: true, message: '请选择绑定的报表页面', trigger: 'blur'}
        ],
        formRouterName: [
          {required: true, message: '请输入路由名称', trigger: 'blur'}
        ],
        roleIdList: [
          {required: true, message: '请选择绑定用户角色', trigger: 'blur'}
        ]
      },
      formEditMobileEntry: {
        imageData: {
          impl: new UploadWidget(1)
        },
        isInit: false
      }
    }
  },
  methods: {
    onCancel (isSuccess, data) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, data);
      }
    },
    /**
     * 编辑
     */
    onSubmit () {
      this.$refs.formEditMobileEntry.validate((valid) => {
        if (!valid) return;
        let params = {
          mobileEntryDto: {
            entryId: this.entryId,
            parentId: this.formData.parentId,
            entryName: this.formData.entryName,
            imageData: this.formData.imageData,
            showOrder: this.formData.showOrder,
            commonEntry: this.formData.commonEntry,
            entryType: this.formData.entryType
          },
          roleIdListString: Array.isArray(this.formData.roleIdList) ? this.formData.roleIdList.join(',') : undefined
        };

        params.mobileEntryDto.extraData = JSON.stringify({
          bindType: this.formData.bindType,
          onlineFormId: this.formData.onlineFormId,
          onlineFlowEntryId: this.formData.onlineFlowEntryId,
          reportPageId: this.formData.reportPageId,
          formRouterName: this.formData.formRouterName,
          targetUrl: this.formData.targetUrl
        });

        let httpCall = this.isEdit ? MobileEntryController.update(this, params) : MobileEntryController.add(this, params);

        httpCall.then(res => {
          this.$message.success('保存成功');
          this.onCancel(true);
        }).catch(e => {});
      });
    },
    /**
     * 获取移动端首页显示管理详细信息
     */
    loadMobileEntryData () {
      return new Promise((resolve, reject) => {
        if (!this.isEdit) {
          resolve();
          return;
        }
        let params = {
          entryId: this.entryId
        };
        MobileEntryController.view(this, params).then(res => {
          let extraData = null;
          if (res.data.extraData != null && res.data.extraData !== '') {
            extraData = JSON.parse(res.data.extraData);
          }
          try {
            res.data.imageData = JSON.parse(res.data.imageData);
          } catch (e) {
            res.data.imageData = undefined;
          }
          
          this.formData = {
            ...this.formData,
            ...res.data,
            ...extraData
          }
          if (Array.isArray(this.formData.mobileEntryRoleList)) {
            this.formData.roleIdList = this.formData.mobileEntryRoleList.map(item => item.roleId);
          }
          resolve();
        }).catch(e => {
          reject();
        });
      });
    },
    onBindTypeChange (value) {
      this.formData.onlineFormId = undefined;
      this.formData.formRouterName = undefined;
      this.formData.reportPageId = undefined;
      this.formData.onlineFlowEntryId = undefined;
    },
    onOnlineFormChange (values) {
      this.formData.onlineFormId = values[1];
    },
    onOnlineEntryChange (values) {
      this.formData.onlineFlowEntryId = values[0];
      this.formData.onlineFormId = values[1];
    },
    loadPageAndForms () {
      OnlinePageController.listAllPageAndForm(this, {}).then(res => {
        let formList = res.data.formList;
        let pageList = res.data.pageList;
        if (!Array.isArray(formList) || !Array.isArray(pageList)) {
          this.formTreeData = [];
          return;
        }
        this.formTreeData = pageList.map(page => {
          let children = formList.filter(form => {
            return form.pageId === page.pageId && form.formKind === this.SysOnlineFormKind.PAGE && (form.formType === this.SysOnlineFormType.QUERY || form.formType === this.SysOnlineFormType.ADVANCE_QUERY);
          }).map(form => {
            return {
              id: form.formId,
              name: form.formName
            }
          });

          return {
            id: page.pageId,
            name: page.pageName,
            disabled: !page.published,
            children
          }
        });
        if (this.formData.onlineFormId) {
          this.onlineFormPath = findTreeNodePath(this.formTreeData, this.formData.onlineFormId, 'id');
        }
      }).catch(e => {});
    },
    loadFlowEntryForms () {
      FlowOperationController.listFlowEntryForm(this, {}).then(res => {
        if (Array.isArray(res.data)) {
          this.entryTreeData = res.data.map(entry => {
            let formList = [];
            if (Array.isArray(entry.formList)) {
              formList = entry.formList.filter(form => form.formType === this.SysOnlineFormType.WORK_ORDER).map(form => {
                return {
                  id: form.formId,
                  name: form.formName
                }
              });
            }
            if (formList.length > 0) {
              return {
                id: entry.entryId,
                name: entry.processDefinitionName,
                children: formList
              }
            }
            return null;
          }).filter(entry => entry != null);
        }
        if (this.formData.onlineFlowEntryId) {
          this.onlineFlowPath = [this.formData.onlineFlowEntryId, this.formData.onlineFormId];
        }
      }).catch(e => {});
    },
    loadRole () {
      SystemController.getRoleList(this, {}).then(res => {
        this.roleList = res.data.dataList;
      }).catch(e => {});
    },
    initFormData () {
      this.formData.entryType = this.entryType;
      this.formData.parentId = this.parentId;
      this.loadMobileEntryData().then(res => {
        this.loadPageAndForms();
        this.loadFlowEntryForms();
        this.loadRole();
      }).catch(e => {});
    },
    /**
     * 显示图片上传成功
     */
    onImageDataUploadSuccess (response) {
      if (response.success) {
        this.formData.imageData = response.data;
        // this.setHeadImage(response.data);
      } else {
        this.$message.error(response.message);
      }
    },
    /**
     * 移除显示图片
     */
    onImageDataRemoveFile () {
      this.formData.imageData = undefined;
    },
    onUploadLimit () {
      this.$message.error('已经超出最大上传个数限制');
    },
    /**
     * 重置表单数据
     */
    resetFormData () {
      this.formData = {
        entryId: undefined,
        parentId: this.parentId,
        entryName: undefined,
        entryType: undefined,
        commonEntry: true,
        formRouterName: undefined,
        onlineFormId: undefined,
        reportPageId: undefined,
        onlineFlowEntryId: undefined,
        extraData: undefined,
        imageData: undefined,
        showOrder: undefined
      }
    },
    formInit () {
      this.initFormData();
    }
  },
  computed: {
    isEdit () {
      return this.rowData != null;
    },
    getImageUrl () {
      return this.getUploadFileUrl(this.formData.imageData, { filename: this.formData.imageData.filename });
    }
  },
  mounted () {
    // 初始化页面数据
    this.formInit();
  },
  watch: {
  }
}
</script>
