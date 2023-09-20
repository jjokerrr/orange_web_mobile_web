<template>
  <div class="copy-select" :span="24">
    <el-table :data="tableDataList" :show-header="false">
      <el-table-column label="操作" width="28px">
        <template slot-scope="scope">
          <el-button type="text" icon="el-icon-remove-outline"
            @click="onDeleteCopyItem(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="抄送类型" width="150px">
        <template slot-scope="scope">
          <span>{{SysFlowCopyForType.getValue(scope.row.type)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="抄送对象">
        <template slot-scope="scope">
          <el-tag :size="defaultFormItemSize" type="primary" effect="dark"
            v-for="item in scope.row.showNameList" :key="item.id"
            closable @close="onCloseSubItem(scope.row, item)"
          >
            {{item.name}}
          </el-tag>
        </template>
      </el-table-column>
      <template slot="empty">
        <div class="table-empty unified-font">
          <img src="@/assets/img/empty.png">
          <span>暂无数据</span>
        </div>
      </template>
    </el-table>
    <el-button class="add-btn" :size="defaultFormItemSize" icon="el-icon-plus" @click="onEditCopyForItem()">添加抄送人</el-button>
  </div>
</template>

<script>
import { treeDataTranslate } from '@/utils';
import { SysCommonBizController } from '@/api';
import addCopyForItem from './addCopyForItem.vue';
import refreshDataMixins from '@/views/thirdParty/refreshDataMixins.js';

export default {
  name: 'copyForSelect',
  mixins: [refreshDataMixins],
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      isInit: false,
      calcUserName: {
        // eslint-disable-next-line no-template-curly-in-string
        '${startUserName}': '流程发起人',
        // eslint-disable-next-line no-template-curly-in-string
        '${appointedAssignee}': '指定审批人 '
      },
      roleList: [],
      roleMap: new Map(),
      deptList: [],
      deptMap: new Map()
    }
  },
  methods: {
    refreshData (data) {
      if (data.path === 'thirdAddCopyForItem' && data.isSuccess) {
        this.updateEditCopyForItem(data.data)
      }
    },
    onDeleteCopyItem (row) {
      this.$confirm('是否删除此抄送人？').then(res => {
        let temp = (this.value || []).filter(item => {
          return row.type !== item.type;
        });
        this.$emit('input', temp);
      }).catch(e => {});
    },
    onCloseSubItem (row, item) {
      this.$confirm('是否移除此抄送人？').then(res => {
        let temp = (this.value || []).filter(copyItem => {
          if (row.type === copyItem.type) {
            if (copyItem.id == null || copyItem.id === '') return false;
            let tempIdList = (copyItem.id || '').split(',');
            tempIdList = tempIdList.filter(subItemId => {
              return subItemId !== item.id;
            });
            if (tempIdList.length <= 0) {
              return false;
            } else {
              copyItem.id = tempIdList.join(',');
              return true;
            }
          } else {
            return true;
          }
        });
        this.$emit('input', temp);
      }).catch(e => {});
    },
    onEditCopyForItem () {
      this.$dialog.show('添加抄送人', addCopyForItem, {
        area: '600px'
      }, {
        roleList: this.roleList,
        deptList: this.deptList,
        postList: this.postList,
        deptPostList: this.deptPostList,
        path: 'thirdAddCopyForItem'
      }, {
        width: '600px',
        height: '450px',
        pathName: '/thirdParty/thirdAddCopyForItem'
      }).then(res => {
        this.updateEditCopyForItem(res);
      }).catch(e => {});
    },
    updateEditCopyForItem (res) {
      let copyForType = res.type;
      let bFind = false;
      // 按照抄送类型更新
      let temp = (this.value || []).map(copyItem => {
        if (copyItem.type === copyForType) {
          bFind = true;
          let oldIdList = (copyItem.id || '').split(',');
          let newIdList = (res.id || '').split(',');
          // 合并新旧选项
          let idList = oldIdList;
          newIdList.forEach(id => {
            if (idList.indexOf(id) === -1) idList.push(id);
          });
          return {
            ...copyItem,
            id: idList.join(','),
            userName: res.userName
          };
        } else {
          return {
            ...copyItem
          }
        }
      });
      if (!bFind) {
        temp.push({
          ...res
        });
      }
      this.$emit('input', temp);
    },
    loadSysDeptList () {
      return new Promise((resolve, reject) => {
        let params = {
          widgetType: 'upms_dept',
          filter: {}
        };
        SysCommonBizController.list(this, params, null, {
          showMask: false
        }).then(res => {
          let deptList = [];
          res.data.dataList.forEach(item => {
            const obj = {
              id: String(item.deptId),
              name: item.deptName,
              parentId: item.parentId,
              ...item
            };
            this.deptMap.set(obj.id, obj);
            deptList.push(obj)
          })
          this.deptList = treeDataTranslate(deptList);
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    },
    loadSysRoleList () {
      return new Promise((resolve, reject) => {
        let params = {
          widgetType: 'upms_role',
          filter: {}
        };
        SysCommonBizController.list(this, params, null, {
          showMask: false
        }).then(res => {
          this.roleList = res.data.dataList.map(item => {
            return {
              id: String(item.roleId),
              name: item.roleName,
              ...item
            }
          });

          this.roleList.forEach(item => {
            this.roleMap.set(item.id, item);
          });
          resolve();
        }).catch(e => {
          reject(e);
        });
      });
    }
  },
  computed: {
    tableDataList () {
      if (this.isInit && Array.isArray(this.value)) {
        return this.value.map(item => {
          let showNameList = (item.id || '').split(',');
          switch (item.type) {
            case this.SysFlowCopyForType.USER:
              // eslint-disable-next-line no-case-declarations
              let userNames = item?.userName || [];
              showNameList = showNameList.map((id, i) => {
                return (id && id !== '') ? {
                  id: id,
                  // eslint-disable-next-line no-template-curly-in-string
                  name: this.calcUserName[id] ? this.calcUserName[id] : (userNames.find(row => row.id === id)?.name || id)
                } : undefined
              }).filter(item => item != null);
              break;
            case this.SysFlowCopyForType.ROLE:
              showNameList = showNameList.map(id => {
                let role = this.roleMap.get(id);
                return role ? {
                  id: id,
                  name: role.name
                } : undefined
              }).filter(item => item != null);
              break;
            case this.SysFlowCopyForType.DEPT:
              showNameList = showNameList.map(id => {
                let dept = this.deptMap.get(id);
                return dept ? {
                  id: id,
                  name: dept.name
                } : undefined
              }).filter(item => item != null);
              break;
            case this.SysFlowCopyForType.SELF_DEPT_LEADER:
            case this.SysFlowCopyForType.UP_DEPT_LEADER:
              showNameList = [];
              break;
          }
          return {
            ...item,
            showNameList
          }
        });
      }
      return [];
    }
  },
  mounted () {
    let httpCalls = [
      this.loadSysDeptList(),
      this.loadSysRoleList()
    ];
    Promise.all(httpCalls).then(res => {
      this.isInit = true;
    }).catch(e => {});
  },
  beforeDestroy () {
    this.roleMap = null;
    this.deptMap = null;
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/style/element-variables.scss';
  .add-btn {
    margin-top: 16px;
    color: $--color-primary;
    border-color: $--color-primary;
  }

  .copy-select ::v-deep .el-tag {
    margin-right: 10px;
  }

  .table-btn.delete ::v-deep .el-icon-remove-outline{
    font-size: 16px;
    color: #999999;
  }
  .el-table ::v-deep .cell{
    color: #333333;
  }
  .el-table ::v-deep td{
    padding: 0;
  }
  .el-table ::v-deep .el-table__row{
    height: 50px;
  }

  .copy-select ::v-deep .el-tag--primary{
    border-color: #E8E8E8;
    background-color: #F6F6F6;
    color: #666666;
  }
  .copy-select ::v-deep .el-tag{
    margin-right: 8px;
  }
  .copy-select ::v-deep .el-tag__close{
    color: #999999;
    font-size: 14px;
    transform: scale(1);
    right: -2px;
    top: 0px;
  }
  .copy-select ::v-deep .el-tag__close:hover{
    background-color: transparent;
    color: #999999;
  }
</style>
