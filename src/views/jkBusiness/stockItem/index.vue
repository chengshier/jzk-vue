<template>
  <div class="divBox">
    <el-alert
      title="库存明细展示各库存主体持有的商品和 SKU 数量。库存数量只能由订货、调拨、退回等业务流程变更，不能在此直接编辑。"
      type="info"
      :closable="false"
    />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">库存明细查询</div>
      <el-form :inline="true" size="mini" class="mb15">
        <el-form-item label="库存主体">
          <el-select
            v-model="query.stockAccountId"
            clearable
            filterable
            remote
            reserve-keyword
            placeholder="账户编号/用户/身份"
            :remote-method="searchAccounts"
            :loading="accountLoading"
            style="width: 260px"
          >
            <el-option v-for="item in accountOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品">
          <el-select
            v-model="query.productId"
            clearable
            filterable
            remote
            reserve-keyword
            placeholder="商品名称搜索"
            :remote-method="searchProducts"
            :loading="productLoading"
            style="width: 230px"
            @change="handleProductChange"
          >
            <el-option v-for="item in productOptions" :key="item.id" :label="item.storeName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="SKU">
          <el-select v-model="query.skuId" clearable filterable :disabled="!query.productId" placeholder="先选择商品" style="width: 220px">
            <el-option v-for="item in skuOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="SKU编码">
          <el-input v-model.trim="query.skuCode" clearable placeholder="精确或模糊查询" style="width: 180px" @keyup.enter.native="search" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column label="所属账户" min-width="220">
          <template slot-scope="{ row }">
            <div>{{ row.applicantName || row.ownerName || '用户不存在' }}</div>
            <div class="sub-text">{{ row.roleName || '--' }} / {{ row.regionName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品" min-width="200">
          <template slot-scope="{ row }"><div>{{ row.productName || '商品已删除' }}</div></template>
        </el-table-column>
        <el-table-column label="SKU" min-width="210">
          <template slot-scope="{ row }">
            <div>{{ row.skuText || row.skuName || 'SKU 已删除' }}</div>
            <div v-if="row.skuCode" class="sub-text">编码：{{ row.skuCode }}</div>
          </template>
        </el-table-column>
        <el-table-column label="可用库存" width="110" align="right">
          <template slot-scope="{ row }"><strong :class="{ danger: Number(row.availableQty || 0) <= 0 }">{{ row.availableQty || 0 }}</strong></template>
        </el-table-column>
        <el-table-column prop="frozenQty" label="冻结库存" width="100" align="right" />
        <el-table-column prop="totalInQty" label="累计入库" width="100" align="right" />
        <el-table-column prop="totalOutQty" label="累计出库" width="100" align="right" />
        <el-table-column label="参考价值" width="120" align="right">
          <template slot-scope="{ row }">¥{{ money(row.stockValue) }}</template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="160" />
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :current-page="query.page"
          :page-size="query.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="Number(listData.total || 0)"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getJkStockItemList } from '@/api/jkBusiness'
import { getJkStockAccountOptions } from '@/api/jkOptions'
import { productDetailApi, productLstApi } from '@/api/store'

export default {
  data() {
    return {
      listData: { list: [], total: 0 },
      query: { page: 1, limit: 20, stockAccountId: null, productId: null, skuId: null, skuCode: '' },
      accountOptions: [],
      productOptions: [],
      skuOptions: [],
      accountLoading: false,
      productLoading: false,
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      getJkStockItemList(this.query).then((res) => {
        this.listData = res || { list: [], total: 0 }
      })
    },
    searchAccounts(keyword) {
      this.accountLoading = true
      getJkStockAccountOptions({ keyword: keyword || '', limit: 30 }).then((res) => {
        this.accountOptions = (res && res.data) || res || []
      }).finally(() => { this.accountLoading = false })
    },
    searchProducts(keyword) {
      this.productLoading = true
      productLstApi({ page: 1, limit: 20, keywords: keyword || '' }).then((res) => {
        const payload = res && res.data ? res.data : res
        this.productOptions = (payload && payload.list) || []
      }).finally(() => { this.productLoading = false })
    },
    handleProductChange(productId) {
      this.query.skuId = null
      this.skuOptions = []
      if (!productId) return
      productDetailApi(productId).then((res) => {
        const detail = (res && res.data) || res || {}
        const attrValue = detail.attrValue || []
        this.skuOptions = attrValue.map(item => ({
          id: item.id,
          label: item.attrValue || item.suk || ('SKU ' + item.id),
        }))
      })
    },
    search() {
      this.query.page = 1
      this.loadData()
    },
    reset() {
      this.query = { page: 1, limit: 20, stockAccountId: null, productId: null, skuId: null, skuCode: '' }
      this.accountOptions = []
      this.productOptions = []
      this.skuOptions = []
      this.loadData()
    },
    handlePageChange(page) {
      this.query.page = page
      this.loadData()
    },
    handleSizeChange(limit) {
      this.query.limit = limit
      this.query.page = 1
      this.loadData()
    },
    money(value) {
      const number = Number(value || 0)
      return Number.isNaN(number) ? '0.00' : number.toFixed(2)
    },
  },
}
</script>

<style scoped>
.sub-text { color: #909399; font-size: 12px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 18px; }
.danger { color: #f56c6c; }
</style>
