<template>
  <el-container>
    <el-main style="background-color: white;">
      <el-card class="base-card" shadow="never" :body-style="{ padding: '16px' }" style="border: none;">
        <div slot="header" class="base-card-header">
          <el-row type="flex" align="middle">
            <el-radio-group v-model="formData.deptType" :size="defaultFormItemSize" @change="formData.deptId = undefined">
              <el-radio-button label="allDeptPost">全部</el-radio-button>
              <el-radio-button label="selfDeptPost">本部门</el-radio-button>
              <el-radio-button label="siblingDeptPost">同级部门</el-radio-button>
              <el-radio-button label="upDeptPost">上级部门</el-radio-button>
              <el-radio-button label="deptPost">指定部门</el-radio-button>
            </el-radio-group>
            <el-cascader v-model="formData.deptId" :clearable="true"
              :size="defaultFormItemSize" placeholder="选择部门" v-show="formData.deptType === 'deptPost'"
              :props="{value: 'id', label: 'name', checkStrictly: true}"
              :options="dialogParams.deptList">
            </el-cascader>
            <!--
            <el-select v-model="formData.deptId" :size="defaultFormItemSize" placeholder="选择部门" v-show="formData.deptType === 'deptPost'" style="margin-left: 10px;">
              <el-option v-for="item in deptList" :key="item.id"
                :label="item.name" :value="item.id"
              />
            </el-select>
            -->
          </el-row>
          <div class="base-card-operation">
            <el-button type="primary" :size="defaultFormItemSize"
              :disabled="selectPost.length <= 0"
              @click="onAddPostClick()"
            >
              添加岗位
            </el-button>
          </div>
        </div>
        <el-table :data="getValidDeptPostList" :size="defaultFormItemSize" height="470px"
          header-cell-class-name="table-header-gray"
          row-key="deptPostId"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50px" :selectable="canSelect" />
          <el-table-column label="岗位名称">
            <template slot-scope="scope">
              <span>{{scope.row.postShowName || scope.row.postName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="领导岗位">
            <template slot-scope="scope">
              <el-tag :size="defaultFormItemSize" :type="scope.row.leaderPost ? 'success' : 'danger'">
                {{scope.row.leaderPost ? '是' : '否'}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="岗位级别" prop="postLevel" />
          <template slot="empty">
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png">
              <span>暂无数据</span>
            </div>
          </template>
        </el-table>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
export default {
  name: 'taskPostSelect',
  mixins: [thirdPartyMixin],
  props: {
    deptList: {
      type: Array
    },
    postList: {
      type: Array
    },
    deptPostList: {
      type: Array
    },
    usedIdList: {
      type: Array
    }
  },
  data () {
    return {
      currentDept: undefined,
      formData: {
        deptType: 'allDeptPost',
        deptId: undefined,
        postId: undefined
      },
      // deptList: [],
      selectPost: []
    }
  },
  methods: {
    onCancel (isSuccess, data) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, data);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, undefined, data);
      }
    },
    canSelect (row) {
      if (Array.isArray(this.dialogParams.usedIdList) && this.dialogParams.usedIdList.length > 0) {
        return this.dialogParams.usedIdList.map(id => { return id.split('__')[1] }).indexOf((row.deptPostId || row.postId)) === -1;
      } else {
        return true;
      }
    },
    handleSelectionChange (values) {
      this.selectPost = values;
    },
    onAddPostClick () {
      this.onCancel(true, this.selectPost.map(item => {
        return {
          id: `${this.formData.deptType}__${item.deptPostId || item.postId}`,
          deptType: this.formData.deptType,
          deptPostId: this.formData.deptType === 'deptPost' ? item.deptPostId : undefined,
          postId: this.formData.deptType === 'deptPost' ? undefined : item.postId
        }
      }));
    }
  },
  computed: {
    dialogParams () {
      return {
        deptList: this.deptList || this.thirdParams.deptList,
        postList: this.postList || this.thirdParams.postList,
        deptPostList: this.deptPostList || this.thirdParams.deptPostList,
        usedIdList: this.usedIdList || this.thirdParams.usedIdList
      }
    },
    getDeptTreeData () {
      return this.dialogParams.deptList;
    },
    getValidDeptPostList () {
      if (this.formData.deptType !== 'deptPost') {
        return this.dialogParams.postList || [];
      } else {
        return (this.dialogParams.deptPostList || []).filter(item => {
          return item.deptId === (Array.isArray(this.formData.deptId) ? this.formData.deptId[this.formData.deptId.length - 1] : this.formData.deptId);
        });
      }
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
  .dept-tree >>> .el-tree-node__content {
    height: 35px;
  }
</style>
