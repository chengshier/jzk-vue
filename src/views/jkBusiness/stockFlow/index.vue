<template>
  <div class="divBox">
    <el-alert
      title="库存流水是所有库存变更的审计记录。请通过业务单号追溯订货、调拨或退回单据，不在流水页直接修改库存。"
      type="info"
      :closable="false"
    />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">库存流水查询</div>
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
            style="width: 250px"
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
            style="width: 220px"
            @change="handleProductChange"
          >
            <el-option v-for="item in productOptions" :key="item.id" :label="item.storeName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="SKU">
          <el-select v-model="query.skuId" clearable filterable :disabled="!query.productId" placeholder="先选择商品" style="width: 210px">
            <el-option v-for="item in skuOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="流水类型">
          <el-select v-model="query.flowType" clearable placeholder="全部类型" style="width: 140px">
            <el-option v-for="item in flowTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务单号">
          <el-input v-model.trim="query.businessNo" clearable placeholder="订货/调拨/退回单号" style="width: 210px" @keyup.enter.native="search" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="flowNo" label="流水编号" min-width="165" />
        <el-table-column label="来源单据" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.businessNo || '--' }}</div>
            <div class="sub-text">{{ row.businessTypeText || row.businessType || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="所属账户" min-width="210">
          <template slot-scope="{ row }">
            <div>{{ row.applicantName || '用户不存在' }}</div>
            <div class="sub-text">{{ row.roleName || '--' }} / {{ row.regionName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品 / SKU" min-width="230">
          <template slot-scope="{ row }">
            <div>{{ row.productName || '商品已删除' }}</div>
            <div class="sub-text">{{ row.skuText || row.skuName || 'SKU 已删除' }} / {{ row.skuCode || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="流水类型" width="115">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="flowTag(row.flowType)">{{ row.flowTypeText || flowTypeText(row.flowType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数量变化" width="100" align="right">
          <template slot-scope="{ row }"><strong :class="Number(row.changeQty || 0) >= 0 ? 'positive' : 'negative'">{{ signed(row.changeQty) }}</strong></template>
        </el-table-column>
        <el-table-column label="可用库存" width="140" align="center">
          <template slot-scope="{ row }">{{ row.beforeAvailableQty || 0 }} → {{ row.afterAvailableQty || 0 }}</template>
        </el-table-column>
        <el-table-column label="冻结库存" width="140" align="center">
          <template slot-scope="{ row }">{{ row.beforeFrozenQty || 0 }} → {{ row.afterFrozenQty || 0 }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="发生时间" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="{ row }">
            <el-button v-if="sourceRoute(row.businessType)" type="text" size="mini" @click="openSource(row)">查看来源</el-button>
            <el-button v-else type="text" size="mini" @click="copyBusinessNo(row.businessNo)">复制单号</el-button>
          </template>
        </el-table-column>
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
import { getJkStockFlowList } from '@/api/jkBusiness'
import { getJkStockAccountOptions } from '@/api/jkOptions'
import { productDetailApi, productLstApi } from '@/api/store'

export default {
  data() {
    return {
      listData: { list: [], total: 0 },
      query: { page: 1, limit: 20, stockAccountId: null, productId: null, skuId: null, flowType: '', businessNo: '' },
      accountOptions: [],
      productOptions: [],
      skuOptions: [],
      accountLoading: false,
      productLoading: false,
      flowTypes: [
        { label: '冻结', value: 'FREEZE' },
        { label: '释放', value: 'RELEASE' },
        { label: '出库', value: 'OUTBOUND' },
        { label: '入库', value: 'INBOUND' },
      ],
    }
  },
  mounted() {
    if (this.$route.query.businessNo) this.query.businessNo = this.$route.query.businessNo
    this.loadData()
  },
  methods: {
    loadData() {
      getJkStockFlowList(this.query).then((res) => {
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
        this.skuOptions = (detail.attrValue || []).map(item => ({ id: item.id, label: item.attrValue || item.suk || ('SKU ' + item.id) }))
      })
    },
    search() {
      this.query.page = 1
      this.loadData()
    },
    reset() {
      this.query = { page: 1, limit: 20, stockAccountId: null, productId: null, skuId: null, flowType: '', businessNo: '' }
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
    flowTypeText(value) {
      const row = this.flowTypes.find(item => item.value === value)
      return row ? row.label : (value || '未配置')
    },
    flowTag(value) {
      if (value === 'INBOUND' || value === 'RELEASE') return 'success'
      if (value === 'OUTBOUND') return 'danger'
      if (value === 'FREEZE') return 'warning'
      return 'info'
    },
    signed(value) {
      const number = Number(value || 0)
      return number > 0 ? ('+' + number) : String(number)
    },
    sourceRoute(type) {
      const text = String(type || '').toUpperCase()
      if (text.includes('PLATFORM_ORDER')) return '/operation/jzk/platformOrder'
      if (text.includes('TRANSFER_RETURN')) return '/operation/jzk/stockTransferReturn'
      if (text.includes('TRANSFER')) return '/operation/jzk/stockTransfer'
      return ''
    },
    openSource(row) {
      this.$router.push({ path: this.sourceRoute(row.businessType), query: { businessNo: row.businessNo } })
    },
    copyBusinessNo(value) {
      if (!value) return this.$message.warning('当前流水没有业务单号')
      const input = document.createElement('input')
      input.value = value
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.$message.success('业务单号已复制')
    },
  },
}
</script>

<style scoped>
.sub-text { color: #909399; font-size: 12px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 18px; }
.positive { color: #67c23a; }
.negative { color: #f56c6c; }
</style>
