<template>
  <div class="divBox">
    <el-alert title="第一阶段最小日志页面：当前仅用于身份申请、审核、冻结、解冻、取消审计查询。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">审核日志</div>
      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column label="业务类型" width="130">
          <template slot-scope="{ row }">{{ row.businessTypeText || '--' }}</template>
        </el-table-column>
        <el-table-column prop="businessNo" label="业务单号" min-width="160" />
        <el-table-column prop="auditUserName" label="审核人" width="120" />
        <el-table-column label="动作" width="120">
          <template slot-scope="{ row }">{{ row.auditActionText || '--' }}</template>
        </el-table-column>
        <el-table-column label="前状态" width="120">
          <template slot-scope="{ row }">{{ row.beforeStatusText || '--' }}</template>
        </el-table-column>
        <el-table-column label="后状态" width="120">
          <template slot-scope="{ row }">{{ row.afterStatusText || '--' }}</template>
        </el-table-column>
        <el-table-column prop="rejectReason" label="驳回原因" min-width="180" />
        <el-table-column prop="auditRemark" label="备注" min-width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getJkAuditLogList } from '@/api/jkBusiness';
export default {
  data() {
    return {
      listData: { list: [] },
      query: { page: 1, limit: 20 },
    };
  },
  mounted() {
    getJkAuditLogList(this.query).then((res) => {
      this.listData = res || { list: [] };
    });
  },
};
</script>

