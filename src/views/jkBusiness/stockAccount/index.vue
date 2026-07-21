<template>
  <div class="divBox">
    <el-alert title="第二阶段：库存账户底座，只提供账户查询，不包含调拨、订货、发货、入库确认动作。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">库存账户管理</div>
      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="accountNo" label="账户编号" min-width="150" />
        <el-table-column label="账户类型" width="140">
          <template slot-scope="{ row }">
            <span>{{ row.accountTypeText || row.accountType || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="120">
          <template slot-scope="{ row }">
            <div>{{ row.roleName || '身份未配置' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="区域" min-width="140">
          <template slot-scope="{ row }">
            <div>{{ row.regionName || '区域未配置' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="所属用户" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.ownerName || '--' }}</div>
            <div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.statusTag || (row.status ? 'success' : 'info')">{{ row.statusText || (row.status ? '启用' : '禁用') }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getJkStockAccountList } from '@/api/jkBusiness';
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
      getJkStockAccountList(this.query).then((res) => {
        this.listData = res || { list: [] };
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
