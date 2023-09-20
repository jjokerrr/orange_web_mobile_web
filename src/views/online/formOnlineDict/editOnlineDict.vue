<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative;">
    <el-form ref="formEditOnlineFormDict" :model="formOnlineDict" class="full-width-input form-box" :rules="rules" style="width: 100%;"
      label-width="100px" :size="defaultFormItemSize" label-position="right" @submit.native.prevent>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="字典名称" prop="dictName">
            <el-input class="input-item" v-model="formOnlineDict.dictName"
              :clearable="true" placeholder="字典名称" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="字典类型" prop="dictType">
            <el-select class="input-item" v-model="formOnlineDict.dictType"
              :clearable="true" :disabled="isEdit"
              placeholder="字典类型" :loading="dictTypeWidget.loading"
              @visible-change="dictTypeWidget.onVisibleChange"
              @change="onDictTypeChange">
              <el-option v-for="item in dictTypeWidget.dropdownList" :key="item.id" :value="item.id" :label="item.name" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 静态字典选择 -->
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.STATIC">
          <el-form-item label="字典选择" prop="staticDictName">
            <el-select class="input-item" v-model="formOnlineDict.staticDictName" :clearable="true"
              filterable placeholder="字典类型" :loading="staticDictWidget.loading"
              @visible-change="staticDictWidget.onVisibleChange"
              @change="onStaiicDictChange">
              <el-option v-for="item in staticDictWidget.dropdownList" :key="item.id" :value="item.id" :label="item.name" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 数据表字典，选择数据表 -->
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="数据库" prop="dblinkId">
            <el-select class="input-item" v-model="formOnlineDict.dblinkId" :clearable="true"
              placeholder="数据表所属数据库" :loading="dblinkIdWidget.loading"
              @visible-change="dblinkIdWidget.onVisibleChange"
              @change="onDblinkChange">
              <el-option v-for="item in dblinkIdWidget.dropdownList" :key="item.dblinkId" :value="item.dblinkId" :label="item.dblinkName" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="数据表" prop="tableName">
            <el-select class="input-item" v-model="formOnlineDict.tableName" :clearable="true"
              placeholder="选择字典数据表" :loading="tableNameWidget.loading" filterable
              @visible-change="tableNameWidget.onVisibleChange"
              @change="onDictTableChange">
              <el-option v-for="item in tableNameWidget.dropdownList" :key="item.id" :value="item.id" :label="item.name" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- URL字典，输入字典获取url -->
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.URL">
          <el-form-item label="字典URL" prop="dictListUrl">
            <el-input class="input-item" v-model="formOnlineDict.dictListUrl"
              :clearable="true" placeholder="输入字典获取url"
              @change="clearDictInfo">
              <el-button slot="append" :size="defaultFormItemSize" @click="onGetDictData(true)">获取数据</el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24" style="height: 47px;"
          v-if="formOnlineDict.dictType === SysOnlineDictType.URL || formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="树状字典">
            <el-switch v-model="formOnlineDict.treeFlag" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.treeFlag &&
          (formOnlineDict.dictType === SysOnlineDictType.URL || formOnlineDict.dictType === SysOnlineDictType.TABLE)">
          <el-form-item label="字典父字段">
            <el-select v-model="formOnlineDict.parentKeyColumnName" clearable
              placeholder="选择字典父字段" filterable allow-create default-first-option>
              <el-option v-for="column in dictColumnList" :key="column" :label="column" :value="column" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.URL || formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="字典键字段" prop="keyColumnName">
            <el-select v-model="formOnlineDict.keyColumnName" clearable
              placeholder="选择字典键字段" filterable allow-create default-first-option>
              <el-option v-for="column in dictColumnList" :key="column" :label="column" :value="column" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.URL || formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="字典值字段" prop="valueColumnName">
            <el-select v-model="formOnlineDict.valueColumnName" clearable
              placeholder="选择字典值字段" filterable allow-create default-first-option>
              <el-option v-for="column in dictColumnList" :key="column" :label="column" :value="column" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="逻辑删除字段">
            <el-select v-model="formOnlineDict.deletedColumnName" clearable
              placeholder="选择逻辑删除字段" filterable allow-create default-first-option>
              <el-option v-for="column in dictColumnList" :key="column" :label="column" :value="column" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="用户过滤字段">
            <el-select v-model="formOnlineDict.userFilterColumnName" clearable
              placeholder="选择用户过滤字段，用于数据权限用户过滤" filterable allow-create default-first-option>
              <el-option v-for="column in dictColumnList" :key="column" :label="column" :value="column" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="部门过滤字段">
            <el-select v-model="formOnlineDict.deptFilterColumnName" clearable
              placeholder="选择部门过滤字段，用于数据权限部门过滤" filterable allow-create default-first-option>
              <el-option v-for="column in dictColumnList" :key="column" :label="column" :value="column" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="租户过滤字段">
            <el-select v-model="formOnlineDict.tenantFilterColumnName" clearable
              placeholder="选择租户过滤字段，用于多租户租户过滤" filterable allow-create default-first-option>
              <el-option v-for="column in dictColumnList" :key="column" :label="column" :value="column" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 字典参数 -->
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.URL || formOnlineDict.dictType === SysOnlineDictType.TABLE">
          <el-form-item label="字典参数">
            <el-select v-model="dictParamList" placeholder="请添加字典获取参数"
              multiple filterable allow-create default-first-option>
              <el-option v-for="item in dictColumnList" :key="item" :value="item"
                :label="item">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 字典数据 -->
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.STATIC || formOnlineDict.dictType === SysOnlineDictType.CUSTOM">
          <vxe-table :data="dictData" :size="defaultFormItemSize" header-cell-class-name="table-header-gray" height="300px">
            <vxe-column title="字典键数据" field="id" />
            <vxe-column title="字典值数据" field="name" />
            <vxe-column title="操作" width="100px" fixed="right" align="right"
              v-if="formOnlineDict.dictType === SysOnlineDictType.CUSTOM">
              <template slot="header">
                <el-row type="flex" justify="end" align="middle">
                  <EditDictDataButton width="200px" btnText="新建" @save="onAddDictData" />
                </el-row>
              </template>
              <template slot-scope="scope">
                <EditDictDataButton width="200px" :value="scope.row" btnText="编辑" @save="onEditDictData" />
                <el-button style="margin-left: 10px;padding: 0" :size="defaultFormItemSize" type="text" @click="onDeleteDictData(scope.row)">删除</el-button>
              </template>
            </vxe-column>
            <template slot="empty">
              <div class="table-empty unified-font">
                <img src="@/assets/img/empty.png">
                <span>暂无数据</span>
              </div>
            </template>
          </vxe-table>
        </el-col>
        <!-- 编码字典 -->
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.CODE">
          <el-form-item label="选择编码字典">
            <el-row type="flex" justify="space-between">
              <el-input v-model="filter.dictCode"
                :clearable="true" placeholder="输入字典编码查询"
              />
              <el-button type="primary" :plain="true" :size="defaultFormItemSize" style="margin-left: 15px;" @click="onSearch">查询</el-button>
            </el-row>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="formOnlineDict.dictType === SysOnlineDictType.CODE" style="margin-bottom: 15px;">
          <el-radio-group class="radio-table" v-model="formOnlineDict.dictCode" style="width: 100%;">
            <vxe-table ref="globalDictTable"
              :data="globalDictTableWidget.dataList"
              :size="defaultFormItemSize"
              header-cell-class-name="table-header-gray"
              height="300px"
            >
              <vxe-column title="选择" header-align="center" align="center" width="50px">
                <template slot-scope="scope">
                  <el-radio :label="scope.row.dictCode"> </el-radio>
                </template>
              </vxe-column>
              <vxe-column title="字典名称" field="dictName" />
              <vxe-column title="字典编码" field="dictCode" />
              <template slot="empty">
                <div class="table-empty unified-font">
                  <img src="@/assets/img/empty.png">
                  <span>暂无数据</span>
                </div>
              </template>
            </vxe-table>
          </el-radio-group>
          <el-row type="flex" justify="end" style="margin-top: 16px;">
            <el-pagination
              :total="globalDictTableWidget.totalCount"
              :current-page="globalDictTableWidget.currentPage"
              :page-size="globalDictTableWidget.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, prev, pager, next, sizes"
              @current-change="globalDictTableWidget.onCurrentPageChange"
              @size-change="globalDictTableWidget.onPageSizeChange"
            />
          </el-row>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="menu-box">
      <el-col :span="24" style="margin-top: 15px;">
        <el-row class="no-scroll flex-box" type="flex" justify="end">
          <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
            取消
          </el-button>
          <el-button type="primary" :size="defaultFormItemSize"
            @click="onSaveClick()">
            保存
          </el-button>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { findItemFromList } from '@/utils';
import * as StaticDict from '@/staticDict';
/* eslint-disable-next-line */
import { DropdownWidget, TableWidget } from '@/utils/widget.js';
/* eslint-disable-next-line */
import { OnlineDictController, OnlineDblinkController } from '@/api/onlineController.js';
import EditDictDataButton from './editDictDataButton.vue';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';

export default {
  name: 'formEditOnlineDict',
  props: {
    dictId: {
      default: undefined
    }
  },
  mixins: [thirdPartyMixin],
  components: {
    EditDictDataButton
  },
  data () {
    return {
      filter: {
        dictCode: undefined
      },
      globalDictTableWidget: new TableWidget(this.loadGlobalDictList, this.loadGlobalDictListVerify, true, false),
      formOnlineDict: {
        dblinkId: undefined,
        dictName: undefined,
        dictType: this.SysOnlineDictType.TABLE,
        dictListUrl: undefined,
        staticDictName: undefined,
        tableName: undefined,
        // 字典父字段名称
        parentKeyColumnName: undefined,
        // 字典键字段名称
        keyColumnName: undefined,
        // 字典值字段名称
        valueColumnName: undefined,
        // 逻辑删除字段名称
        deletedColumnName: undefined,
        // 用户过滤字段名称
        userFilterColumnName: undefined,
        // 部门过滤字段名称
        deptFilterColumnName: undefined,
        // 租户过滤字段名称
        tenantFilterColumnName: undefined,
        // 树状字典
        treeFlag: false,
        // 编码字典code
        dictCode: undefined
      },
      dictData: [],
      // 字典字段列表
      dictColumnList: [],
      // 数据表所属数据库
      dblinkIdWidget: new DropdownWidget(this.loadDblinkWidgetDropdownList),
      // 字典数据表
      tableNameWidget: new DropdownWidget(this.loadTableNameWidgetDropdownList),
      // 字典类型
      dictTypeWidget: new DropdownWidget(this.loadDictTypeWidgetDropdownList),
      // 静态字典下拉选择
      staticDictWidget: new DropdownWidget(this.loadStaticDictWidgetDropdownList),
      // 当前选中字典参数
      currentParam: undefined,
      // 字典参数列表
      dictParamList: [],
      dictTableProps: {
        lazy: true,
        lazyLoad: this.loadDictTableData
      },
      rules: {
        'dictName': [
          {required: true, message: '请输入字典名称', trigger: 'blur'}
        ],
        'dblinkId': [
          {required: true, message: '请选择字典数据表所属数据库', trigger: 'blur'}
        ],
        'tableName': [
          {required: true, message: '请选择字典数据表', trigger: 'blur'}
        ],
        'dictListUrl': [
          {required: true, message: '请输入字典数据获取URL', trigger: 'blur'}
        ],
        'staticDictName': [
          {required: true, message: '请选择静态字典', trigger: 'blur'}
        ],
        'keyColumnName': [
          {required: true, message: '请输入字典键字段名称', trigger: 'blur'}
        ],
        'valueColumnName': [
          {required: true, message: '请输入字典值字段名称', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    loadGlobalDictList (params) {
      if (params == null) params = {};
      params = {
        ...params,
        globalDictDtoFilter: {
          dictCode: this.filter.dictCode === '' ? undefined : this.filter.dictCode
        }
      }

      return new Promise((resolve, reject) => {
        OnlineDictController.listAllGlobalDict(this, params).then(res => {
          if (Array.isArray(res.data.dataList) && this.formOnlineDict.dictCode !== null) {
            let currentRow = findItemFromList(res.data.dataList, this.formOnlineDict.dictCode, 'dictCode');
            if (currentRow) {
              this.$refs.globalDictTable.setCurrentRow(currentRow);
            }
          }
          resolve({
            dataList: res.data.dataList,
            totalCount: res.data.totalCount
          });
        }).catch(e => {
          console.log(e);
          reject(e);
        });
      });
    },
    loadGlobalDictListVerify () {
      return true;
    },
    onSearch () {
      this.formOnlineDict.dictCode = undefined;
      this.onSearchGlobalDict();
    },
    onSearchGlobalDict () {
      this.globalDictTableWidget.refreshTable(true, 1);
    },
    /**
     * 字典数据
     */
    onAddDictData (dictData) {
      if (dictData != null) this.dictData.push(dictData);
    },
    onEditDictData (newValue, oldValue) {
      if (newValue != null && oldValue != null) {
        this.dictData = this.dictData.map(item => {
          return item.id === oldValue.id ? newValue : item;
        });
      }
    },
    onDeleteDictData (row) {
      if (row != null) {
        this.dictData = this.dictData.filter(item => {
          return item.id !== row.id;
        });
      }
    },
    loadDblinkWidgetDropdownList () {
      return new Promise((resolve, reject) => {
        OnlineDblinkController.list(this, {}).then(res => {
          return resolve(res.data.dataList);
        }).catch(e => {
          reject(e);
        });
      });
    },
    onDblinkChange (value) {
      this.clearDictInfo();
      this.formOnlineDict.tableName = undefined;
      this.tableNameWidget.dirty = true;
    },
    loadTableNameWidgetDropdownList () {
      if (this.formOnlineDict.dblinkId == null || this.formOnlineDict.dblinkId === '') return Promise.reject();
      return new Promise((resolve, reject) => {
        OnlineDblinkController.listDblinkTables(this, {
          dblinkId: this.formOnlineDict.dblinkId
        }).then(res => {
          resolve(res.data.map(item => {
            return {
              id: item.tableName,
              name: item.tableName
            }
          }));
        }).catch(e => {
          reject(e);
        });
      });
    },
    /**
     * 选择字典数据表
     */
    onDictTableChange (value) {
      this.formOnlineDict.tableName = value;
      if (this.formOnlineDict.tableName != null) {
        this.loadTableColumnList();
      }
    },
    /**
     * 清空字典信息
     */
    clearDictInfo () {
      this.formOnlineDict.parentKeyColumnName = undefined;
      this.formOnlineDict.keyColumnName = undefined;
      this.formOnlineDict.valueColumnName = undefined;
      this.dictParamList = [];
      this.formOnlineDict.staticDictName = undefined;
      this.dictData = [];
    },
    loadTableColumnList () {
      let params = {
        dblinkId: this.formOnlineDict.dblinkId,
        tableName: this.formOnlineDict.tableName
      }
      this.dictColumnList = [];
      OnlineDblinkController.listDblinkTableColumns(this, params).then(res => {
        this.dictColumnList = res.data.map(item => {
          return item.columnName;
        });
      }).catch(e => {});
    },
    onDictTypeChange () {
      this.clearDictInfo();
      this.formOnlineDict.dictListUrl = undefined;
      this.formOnlineDict.tableName = undefined;
      this.formOnlineDict.dblinkId = undefined;
      this.dictColumnList = [];
      if (this.formOnlineDict.dictType === this.SysOnlineDictType.CODE) {
        this.onSearch();
      }
    },
    onStaiicDictChange () {
      let staticDict = StaticDict[this.formOnlineDict.staticDictName];
      this.dictData = [];
      if (staticDict != null) {
        this.dictData = staticDict.getList();
      }
    },
    /**
     * 获取字典数据
     */
    onGetDictData (showWarning = false) {
      let url = this.formOnlineDict.dictListUrl;
      if (url == null || url === '') {
        this.$message.error('请输入字典数据获取URL');
        return;
      }
      this.dictColumnList = [];
      this.doUrl(url, 'get', {}).then(res => {
        if (showWarning) {
          this.$message.success('获取字典数据成功！');
        }
        if (Array.isArray(res.data) && res.data.length > 0) {
          let dictDataItem = res.data[0];
          this.dictColumnList = Object.keys(dictDataItem);
        }
      }).catch(e => {});
    },
    /**
     * 获取字典类型下拉列表
     */
    loadDictTypeWidgetDropdownList () {
      return Promise.resolve(this.SysOnlineDictType.getList());
    },
    onCancel (isSuccess) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess);
      } else {
        this.onCloseThirdDialog();
      }
    },
    /**
     * 获取静态字典下拉列表
     */
    loadStaticDictWidgetDropdownList () {
      return Promise.resolve(Object.keys(StaticDict).map(key => {
        // 过滤掉静态字典的基类
        if (key === 'DictionaryBase') return undefined;
        return {
          id: key,
          name: StaticDict[key].showName
        }
      }).filter(item => item != null));
    },
    /**
     * 保存字典信息
     */
    onSaveClick () {
      this.$refs.formEditOnlineFormDict.validate((valid) => {
        if (!valid) return;
        let params = {
          onlineDictDto: {
            ...this.formOnlineDict,
            dblinkId: this.formOnlineDict.dblinkId,
            dictDataJson: JSON.stringify({
              staticDictName: this.formOnlineDict.dictType === this.SysOnlineDictType.STATIC ? this.formOnlineDict.staticDictName : undefined,
              dictData: this.formOnlineDict.dictType === this.SysOnlineDictType.CUSTOM ? this.dictData : undefined,
              paramList: this.dictParamList.map(item => {
                return {
                  dictParamName: item
                }
              })
            })
          }
        }

        let httpCall = this.isEdit ? OnlineDictController.update(this, params) : OnlineDictController.add(this, params);
        httpCall.then(res => {
          this.$message.success('保存成功');
          this.onCancel(true);
        }).catch(e => {
          this.onCancel(false);
        });
      });
    }
  },
  computed: {
    finalDictId () {
      return (this.thirdParams || {}).dictId || this.dictId;
    },
    isEdit () {
      return this.finalDictId != null && this.finalDictId !== '';
    }
  },
  mounted () {
    // 获取字典类型下拉列表数据
    this.dictTypeWidget.onVisibleChange(true);
    // 编辑状态下获取字典参数列表
    if (this.isEdit) {
      OnlineDictController.view(this, {
        dictId: this.finalDictId
      }).then(res => {
        this.formOnlineDict = {
          ...res.data
        };
        // 解析字典参数信息
        this.formOnlineDict.dictDataJson = undefined;
        let dataJson = JSON.parse(res.data.dictDataJson);
        if (dataJson && Array.isArray(dataJson.paramList)) {
          this.dictParamList = dataJson.paramList.map(item => {
            return item.dictParamName;
          });
        }
        // 获取字典字段
        if (this.formOnlineDict.dictType === this.SysOnlineDictType.TABLE) {
          // 获取下拉数据
          this.dblinkIdWidget.onVisibleChange(true);
          this.tableNameWidget.onVisibleChange(true);
          this.loadTableColumnList();
        } else if (this.formOnlineDict.dictType === this.SysOnlineDictType.URL) {
          this.onGetDictData();
        } else if (this.formOnlineDict.dictType === this.SysOnlineDictType.STATIC) {
          this.staticDictWidget.onVisibleChange(true);
          if (dataJson) this.formOnlineDict.staticDictName = dataJson.staticDictName;
          this.dictData = StaticDict[this.formOnlineDict.staticDictName] ? StaticDict[this.formOnlineDict.staticDictName].getList() : [];
        } else if (this.formOnlineDict.dictType === this.SysOnlineDictType.CUSTOM) {
          if (dataJson && Array.isArray(dataJson.dictData)) {
            this.dictData = dataJson.dictData;
          }
        } else if (this.formOnlineDict.dictType === this.SysOnlineDictType.CODE) {
          this.onSearchGlobalDict();
        }
      }).catch(e => {});
    }
  }
}
</script>

<style scoped>
  .radio-table >>> .el-radio__label {
    display: none;
  }
</style>
