<template>
  <el-container class="edit-online-dblink">
    <el-header class="step-header" style="overflow: hidden; background: white; height: 72px; border-bottom: 1px solid #EBEEF5;">
      <el-row type="flex" justify="space-between" align="middle" style="height: 100%">
        <div class="title" style="width: 200px; height: 40px; line-height: 40px; display: flex">
          <i class="header-logo logo online-icon icon-orange-icon" style="font-size: 40px;" />
          <span style="font-size: 22px; color: #333333; font-weight: bold;">数据库链接</span>
        </div>
        <el-row type="flex" justify="end">
          <el-button
            :size="defaultFormItemSize"
            type="primary"
            @click="onSaveClick"
          >
            保存
          </el-button>
          <el-button
            :size="defaultFormItemSize"
            type="success"
            :disabled="formData.onlineDblink.dblinkId == null"
            @click="() => onTestConnect(true).catch(e => {})"
          >
            测试链接
          </el-button>
          <el-button :size="defaultFormItemSize" @click="onCancelClick">退出</el-button>
        </el-row>
      </el-row>
    </el-header>
    <el-main style="padding: 15px; background-color: #F9F9F9;">
      <el-row type="flex" justify="center" style="height: 100%">
        <el-scrollbar style="height: calc(100vh - 90px)" class="custom-scroll edit-box">
          <el-form ref="formEditDBlink" :model="formData" class="full-width-input" :rules="rules" style="width: 100%; padding: 20px;"
            label-width="110px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="类型" prop="onlineDblink.dblinkType">
                  <el-select class="input-item" v-model="formData.onlineDblink.dblinkType" :clearable="true" filterable
                    placeholder="数据源类型"
                    @change="onTypeValueChange">
                    <el-option v-for="item in DblinkType.getList().filter(item => item.id !== DblinkType.CLICK_HOUSE)"
                      :key="item.id" :value="item.id" :label="item.name"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="名称" prop="onlineDblink.dblinkName">
                  <el-input class="input-item" v-model="formData.onlineDblink.dblinkName"
                    :clearable="true" placeholder="数据源名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="描述" prop="onlineDblink.dblinkDescription">
                  <el-input class="input-item" v-model="formData.onlineDblink.dblinkDescription"
                    :clearable="true" placeholder="数据源描述"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType != null">
                <el-form-item label="服务器地址" prop="onlineDblink.configuration.host">
                  <el-input class="input-item" v-model="formData.onlineDblink.configuration.host"
                    :clearable="true" placeholder="服务器地址"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType != null">
                <el-form-item label="端口号" prop="onlineDblink.configuration.port">
                  <el-input-number class="input-item" v-model="formData.onlineDblink.configuration.port"
                    :controls="false" :clearable="true" placeholder="端口号"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType != null && formData.onlineDblink.dblinkType !== DblinkType.ORACLE">
                <el-form-item label="数据库名" prop="onlineDblink.configuration.database">
                  <el-input class="input-item" v-model="formData.onlineDblink.configuration.database"
                    :clearable="true" placeholder="数据库名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType != null">
                <el-form-item label="用户名" prop="onlineDblink.configuration.username">
                  <el-input class="input-item" v-model="formData.onlineDblink.configuration.username"
                    :clearable="true" placeholder="用户名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType != null">
                <el-form-item label="密码" prop="onlineDblink.configuration.password">
                  <el-input class="input-item" v-model="formData.onlineDblink.configuration.password"
                    :clearable="true" placeholder="密码"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType === DblinkType.MYSQL || formData.onlineDblink.dblinkType === DblinkType.POSTGRESQL">
                <el-form-item label="JDBC额外参数" prop="onlineDblink.configuration.jdbcString">
                  <el-input class="input-item" v-model="formData.onlineDblink.configuration.jdbcString"
                    :clearable="true" placeholder="JDBC额外参数"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType === DblinkType.ORACLE">
                <el-form-item label="服务名 / SID" prop="onlineDblink.configuration.sid">
                  <el-radio-group v-model="formData.onlineDblink.configuration.sid">
                    <el-radio :label="true">SID</el-radio>
                    <el-radio :label="false">服务名</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType === DblinkType.ORACLE">
                <el-form-item label="服务名 / SID" prop="onlineDblink.configuration.serviceId"
                >
                  <el-input class="input-item" v-model="formData.onlineDblink.configuration.serviceId"
                    :clearable="true" placeholder="服务名 / SID"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType === DblinkType.POSTGRESQL">
                <el-form-item label="数据库 Schema" prop="onlineDblink.configuration.schema"
                >
                  <el-input class="input-item" v-model="formData.onlineDblink.configuration.schema"
                    :clearable="true" placeholder="数据库 Schema"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-divider>高级设置</el-divider>
              </el-col>
              <el-col :span="24">
                <el-form-item label="初始连接数" prop="onlineDblink.configuration.initialPoolSize">
                  <el-input-number class="input-item" v-model="formData.onlineDblink.configuration.initialPoolSize"
                    :controls="false" :clearable="true" placeholder="初始连接数"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="最小连接数" prop="onlineDblink.configuration.minPoolSize">
                  <el-input-number class="input-item" v-model="formData.onlineDblink.configuration.minPoolSize"
                    :controls="false" :clearable="true" placeholder="最小连接数"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="最大连接数" prop="onlineDblink.configuration.maxPoolSize">
                  <el-input-number class="input-item" v-model="formData.onlineDblink.configuration.maxPoolSize"
                    :controls="false" :clearable="true" placeholder="最大连接数"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-scrollbar>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import { uploadMixin, statsDateRangeMixin } from '@/core/mixins';
/* eslint-disable-next-line */
import { OnlineDblinkController } from '@/api/onlineController.js';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';

export default {
  name: 'formEditOnlineDblink',
  props: {
    dblink: {
      type: Object
    }
  },
  mixins: [uploadMixin, statsDateRangeMixin, thirdPartyMixin],
  data () {
    return {
      formData: {
        onlineDblink: {
          dblinkId: undefined,
          dblinkName: undefined,
          dblinkDescription: undefined,
          dblinkType: undefined,
          configuration: {
            host: undefined,
            database: undefined,
            username: undefined,
            password: undefined,
            jdbcString: undefined,
            serviceId: undefined,
            port: undefined,
            schema: undefined,
            sid: true,
            initialPoolSize: 5,
            minPoolSize: 5,
            maxPoolSize: 50
          },
          isDatasourceInit: false
        }
      },
      rules: {
        'onlineDblink.dblinkName': [
          {required: true, message: '请输入名称', trigger: 'blur'}
        ],
        'onlineDblink.configuration.host': [
          {required: true, message: '请输入服务器地址', trigger: 'blur'}
        ],
        'onlineDblink.configuration.database': [
          {required: true, message: '请输入数据库名称', trigger: 'blur'}
        ],
        'onlineDblink.configuration.username': [
          {required: true, message: '请输入用户名', trigger: 'blur'}
        ],
        'onlineDblink.configuration.password': [
          {required: true, message: '请输入密码', trigger: 'blur'}
        ],
        'onlineDblink.configuration.port': [
          {required: true, message: '请输入端口号', trigger: 'blur'}
        ],
        'onlineDblink.configuration.initialPoolSize': [
          {required: true, message: '请输入初始连接数', trigger: 'blur'}
        ],
        'onlineDblink.configuration.minPoolSize': [
          {required: true, message: '请输入最小连接数', trigger: 'blur'}
        ],
        'onlineDblink.configuration.maxPoolSize': [
          {required: true, message: '请输入最大连接数', trigger: 'blur'}
        ],
        'onlineDblink.dblinkType': [
          {required: true, message: '请输入类型', trigger: 'blur'}
        ],
        'onlineDblink.configuration.serviceId': [
          {required: true, message: '请输入服务名 / SID', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    onTestConnect (showMsg = false) {
      return new Promise((resolve, reject) => {
        OnlineDblinkController.testConnection(this, {
          dblinkId: this.formData.onlineDblink.dblinkId
        }).then(res => {
          if (showMsg) this.$message.success('连接成功！');
          resolve(res);
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 类型选中值改变
     */
    onTypeValueChange (value) {
    },
    onCancelClick () {
      if (this.observer != null) {
        this.observer.cancel(true);
      } else {
        this.onCloseThirdDialog(true, this.thirdParams.path);
      }
    },
    /**
     * 保存
     */
    onSaveClick () {
      this.$refs.formEditDBlink.validate((valid) => {
        if (!valid) return;
        let params = {
          onlineDblinkDto: {
            dblinkId: (this.dialogParams.dblink || {}).dblinkId,
            dblinkName: this.formData.onlineDblink.dblinkName,
            dblinkDescription: this.formData.onlineDblink.dblinkDescription,
            dblinkType: this.formData.onlineDblink.dblinkType,
            configuration: JSON.stringify(this.formData.onlineDblink.configuration)
          }
        };

        let httpCall = this.dialogParams.dblink ? OnlineDblinkController.update(this, params) : OnlineDblinkController.add(this, params);

        httpCall.then(res => {
          this.$message.success('新增成功');
          if (this.dialogParams.dblink == null) this.formData.onlineDblink.dblinkId = res.data;
          return this.onTestConnect(false);
        }).then(() => {
          this.onCancelClick();
        }).catch(e => {});
      });
    },
    /**
     * 获取数据库链接详细信息
     */
    loadOnlineDblinkData () {
      return new Promise((resolve, reject) => {
        if (
          this.dialogParams.dblink == null
        ) {
          resolve();
          return;
        }
        let params = {
          dblinkId: this.dialogParams.dblink.dblinkId
        };
        OnlineDblinkController.view(this, params).then(res => {
          res.data.configuration = JSON.parse(res.data.configuration);
          this.formData.onlineDblink = {...res.data, isDatasourceInit: true};
          if (this.formData.onlineDblink.typeDictMap && this.formEditDBlink.dblinkType.impl.dirty) {
            this.formEditDBlink.dblinkType.impl.dropdownList = [this.formData.onlineDblink.typeDictMap];
          }
          resolve();
        }).catch(e => {
          console.log(e);
          reject();
        });
      });
    },
    reset () {
      this.formData.onlineDblink = {
        dblinkId: undefined,
        dblinkName: undefined,
        dblinkDescription: undefined,
        dblinkType: undefined,
        configuration: {
          host: undefined,
          database: undefined,
          username: undefined,
          password: undefined,
          jdbcString: undefined,
          serviceId: undefined,
          port: undefined,
          schema: undefined,
          sid: true,
          initialPoolSize: 5,
          minPoolSize: 5,
          maxPoolSize: 50
        },
        isDatasourceInit: false
      };
    },
    initFormData () {
    },
    formInit () {
    }
  },
  computed: {
    dialogParams () {
      return {
        dblink: this.dblink || this.thirdParams.dblink
      }
    }
  },
  mounted () {
    // 初始化页面数据
    this.formInit();
  },
  watch: {
    'dialogParams.dblink': {
      handler (newValue) {
        if (newValue == null) {
          this.reset();
        } else {
          this.loadOnlineDblinkData().catch(e => {
            console.log(e);
          });
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
  .edit-online-dblink {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    background: #F9F9F9;
  }

  .edit-box {
    background: white;
    width: 600px;
    padding: 20px;
    height: 100%;
  }
</style>
