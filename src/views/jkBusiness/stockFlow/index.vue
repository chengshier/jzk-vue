<template>
  <div class="divBox">
    <el-alert title="第二阶段：库存流水查询页面，用于初始化与测试留痕；本阶段不出现调拨、订货闭环动作。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">库存流水查询</div>
      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="flowNo" label="流水编号" min-width="150" />
        <el-table-column prop="businessNo" label="业务单号" min-width="150" />
        <el-table-column label="所属账户" min-width="200">
          <template slot-scope="{ row }">
            <div>{{ row.applicantName || '用户不存在' }}</div>
            <div class="sub-text">{{ row.roleName || '--' }} / {{ row.regionName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.productName || '商品已删除' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="SKU" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.skuText || row.skuName || 'SKU 已删除' }}</div>
            <div class="sub-text">编码：{{ row.skuCode || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="流水类型" width="120">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.statusTag || 'info'">{{ row.flowTypeText || '未配置' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="业务来源" width="130">
          <template slot-scope="{ row }">
            <span>{{ row.businessTypeText || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="changeQty" label="变更数量" width="90" />
        <el-table-column prop="beforeAvailableQty" label="变更前可用" width="110" />
        <el-table-column prop="afterAvailableQty" label="变更后可用" width="110" />
        <el-table-column prop="remark" label="备注" min-width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getJkStockFlowList } from '@/api/jkBusiness';
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
      getJkStockFlowList(this.query).then((res) => {
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
