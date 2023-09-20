<template>
  <div class="copy-select" :span="24">
    <el-button icon="el-icon-plus" :size="defaultFormItemSize" @click="onEditCopyForItem">添加抄送</el-button>
    <ul>
      <li v-for="row in tableDataList" :key="row.type">
        <label>{{SysFlowCopyForType.getValue(row.type)}}</label>
        <div v-if="row.showNameList.length">
          <el-tag :size="defaultFormItemSize" effect="dark"
            v-for="item in row.showNameList" :key="item.id"
            closable @close="onCloseSubItem(row, item)"
          >
            {{item.name}}
          </el-tag>
        </div>
        <div v-else>
          <el-tag :size="defaultFormItemSize" effect="dark" :key="row.type"
            closable @close="onDeleteCopyItem(row)"
          >
            {{SysFlowCopyForType.getValue(row.type)}}
          </el-tag>
        </div>
      </li>
    </ul>
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
      roleList: [],
      roleMap: new Map(),
      deptList: [],
      deptMap: new Map(),
      postList: [],
      postMap: new Map(),
      deptPostList: [],
      deptPostMap: new Map(),
      calcUserName: {
        // eslint-disable-next-line no-template-curly-in-string
        '${startUserName}': '流程发起人',
        // eslint-disable-next-line no-template-curly-in-string
        '${appointedAssignee}': '指定审批人'
      }
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
                  name: role.name,
                  ...role
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
    this.postMap = null;
    this.deptPostMap = null;
  }
}
</script>

<style lang="scss" scoped>
  .full-line-btn {
    width: 100%;
    margin: 10px 0px;
    border: 1px dashed #EBEEF5;
  }

  .copy-select{
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
    ul{
      list-style: none;
      margin: 4px 0 0;
      padding: 0;
      li{
        margin-bottom: 8px;
        label{
          display: inline-block;
          color: #666666;
          font-size: 12px;
          line-height: 32px;
          margin-bottom: 2px;
        }
      }
    }
  }
</style>
