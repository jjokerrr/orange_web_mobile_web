<template>
  <el-row class="process-data-compensation third-party-dlg" style="position: relative;">
    <el-col :span="24" class="form-box">
      <el-radio-group v-model="selectTransId" style="width: 100%;" @change="onSelectChange">
        <el-table :data="finalDataList" :size="defaultFormItemSize" header-cell-class-name="table-header-gray" height="600px" style="width: 100%;">
          <el-table-column type="expand">
            <template slot-scope="props">
              <div class="sql-list">
                <div class="sql-item" v-for="(sqlData, index) in props.row.sqlDataList" :key="index">
                  <span>{{sqlData.sql}}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="任务名称" prop="taskName" width="150px">
            <template slot-scope="scope">
              <el-radio :label="scope.row.transId">{{scope.row.taskName}}</el-radio>
            </template>
          </el-table-column>
          <el-table-column label="创建人" prop="createUsername" width="150px" />
          <el-table-column label="创建时间" prop="createTime" width="200px" />
          <el-table-column label="错误原因" prop="errorReason" />
          <template slot="empty">
            <div class="table-empty unified-font">
              <img src="@/assets/img/empty.png">
              <span>暂无数据</span>
            </div>
          </template>
        </el-table>
      </el-radio-group>
    </el-col>
    <el-col :span="24" style="margin-top: 20px;" class="menu-box">
      <el-row type="flex" justify="end">
        <el-button :size="defaultFormItemSize" :plain="true" @click="onCancel(false)">
          取消
        </el-button>
        <el-button type="primary" :size="defaultFormItemSize"
          :disabled="selectTransId == null"
          @click="onSubmitClick()"
        >
          补偿数据
        </el-button>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { findItemFromList } from '@/utils';
import thirdPartyMixin from '@/views/thirdParty/thirdPartyMixin.js';
import { FlowOperationController } from '@/api/flowController.js';

export default {
  props: {
    dataList: {
      type: Array,
      required: true
    }
  },
  mixins: [thirdPartyMixin],
  data () {
    return {
      selectTransId: undefined,
      processInstanceId: undefined
    }
  },
  methods: {
    onCancel (isSuccess, data) {
      if (this.observer != null) {
        this.observer.cancel(isSuccess, data);
      } else {
        this.onCloseThirdDialog(isSuccess, this.thirdParams.path, null, data);
      }
    },
    onSubmitClick () {
      if (this.selectTransId == null) {
        this.$message.warning('请选择要补偿的任务！');
        return;
      }
      let params = {
        transId: this.selectTransId,
        processInstanceId: this.processInstanceId
      }

      FlowOperationController.fixBusinessData(this, params).then(res => {
        this.$messager.success('补偿成功！');
        this.onCancel(true);
      }).catch(e => {});
    },
    onSelectChange (val) {
      let node = findItemFromList(this.finalDataList, val, 'taskId');
      if (node != null) {
        this.selectTransId = node.transId;
        this.processInstanceId = node.processInstanceId;
      }
    }
  },
  computed: {
    dialogParams () {
      return {
        dataList: this.dataList || this.thirdParams.dataList
      }
    },
    finalDataList () {
      return this.dialogParams.dataList.map(item => {
        return {
          ...item,
          sqlDataList: JSON.parse(item.sqlData)
        }
      });
    }
  }
}
</script>

<style scoped>
  .process-data-compensation >>> .el-table__expanded-cell {
    padding: 5px 0px;
  }

  .sql-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .sql-item span {
    font-size: 14px;
    display: inline-block;
    padding: 5px;
    word-break: break-all;
    line-height: 1.5;
  }

  .el-table >>> .el-radio__input.is-checked + .el-radio__label {
    color: #606266;
  }
  /*
  .sql-item:nth-child(odd) {
    background: #F3F9F2;
  }
  .sql-item:nth-child(even) {
    background: #FDF5E6;
  }
  */
</style>
