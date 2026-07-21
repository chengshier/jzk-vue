<template>
  <div class="divBox">
    <el-alert title="第一阶段最小身份管理页面：仅覆盖冻结、解冻、取消闭环，不进入库存、分佣等后续业务。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">用户业务身份管理</div>
      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column label="用户" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.applicantName || row.userNickname || row.nickname || '用户不存在' }}</div>
            <div class="sub-text">{{ row.userNickname || row.nickname || '--' }} / {{ row.applicantPhone || row.phone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="身份" width="120" />
        <el-table-column label="审核状态" width="120">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.statusTag || 'info'">{{ row.auditStatusText || '状态未配置' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="区域" min-width="150">
          <template slot-scope="{ row }">
            <div>{{ row.regionName || '区域未配置' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="freezeStatus" label="冻结状态" width="100">
          <template slot-scope="{ row }">{{ row.freezeStatus ? '已冻结' : '正常' }}</template>
        </el-table-column>
        <el-table-column prop="freezeReason" label="原因" min-width="180" />
        <el-table-column label="操作" width="220">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="operate(row, 'freeze')" v-if="!row.freezeStatus">冻结</el-button>
            <el-button size="mini" type="primary" @click="operate(row, 'unfreeze')" v-if="row.freezeStatus">解冻</el-button>
            <el-button size="mini" type="danger" @click="operate(row, 'cancel')">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getJkUserBusinessRoleList, freezeJkIdentity, unfreezeJkIdentity, cancelJkIdentity } from '@/api/jkBusiness';
export default {
  data() {
    return {
      listData: { list: [] },
      query: { page: 1, limit: 20 },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      getJkUserBusinessRoleList(this.query).then((res) => {
        this.listData = res || { list: [] };
      });
    },
    operate(row, action) {
      const map = {
        freeze: freezeJkIdentity,
        unfreeze: unfreezeJkIdentity,
        cancel: cancelJkIdentity,
      };
      map[action]({ userBusinessRoleId: row.id, reason: `后台${action}操作` }).then(() => {
        this.$message.success('操作成功');
        this.loadData();
      });
    },
  },
};
</script>

<style scoped>
.sub-text {
  color: #909399;
  font-size: 12px;
}
</style>

