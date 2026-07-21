<template>
  <div class="divBox">
    <el-alert title="第二阶段：库存明细查询页面，仅展示账户库存，不提供第三阶段业务操作按钮。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">库存明细查询</div>
      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
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
            <div v-if="row.skuCode" class="sub-text">编码：{{ row.skuCode }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="availableQty" label="可用库存" width="100" />
        <el-table-column prop="frozenQty" label="冻结库存" width="100" />
        <el-table-column prop="totalInQty" label="累计入库" width="100" />
        <el-table-column prop="totalOutQty" label="累计出库" width="100" />
        <el-table-column prop="version" label="版本" width="80" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getJkStockItemList } from '@/api/jkBusiness';
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
      getJkStockItemList(this.query).then((res) => {
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
