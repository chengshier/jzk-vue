<template>
  <div class="app-container">
    <el-alert
      title="批次与库龄用于查看各库存主体的生产批次、有效期和成本。日常库存由订货、调拨、退回等业务自动入库，本页不能直接修改库存数量。"
      type="info"
      :closable="false"
      style="margin-bottom:16px"
    />

    <div class="filter-container">
      <el-select
        v-model="q.stockAccountId"
        clearable
        filterable
        remote
        reserve-keyword
        :remote-method="searchAccounts"
        :loading="accountLoading"
        placeholder="选择库存主体"
        class="filter-item account-select"
      >
        <el-option v-for="item in accountOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
      </el-select>
      <el-select
        v-model="q.productId"
        clearable
        filterable
        remote
        reserve-keyword
        :remote-method="searchProducts"
        :loading="productLoading"
        placeholder="选择商品"
        class="filter-item product-select"
      >
        <el-option v-for="item in productOptions" :key="item.id" :label="item.storeName" :value="item.id" />
      </el-select>
      <el-select v-model="q.agingLevel" clearable placeholder="库龄等级" class="filter-item">
        <el-option label="30天关注" value="ATTENTION" />
        <el-option label="60天预警" value="WARNING" />
        <el-option label="90天严重" value="SERIOUS" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="batchNo" label="批次号" min-width="190" />
      <el-table-column prop="accountName" label="库存主体" min-width="170" />
      <el-table-column prop="productName" label="商品" min-width="180" />
      <el-table-column prop="skuName" label="SKU" min-width="160" />
      <el-table-column prop="availableQty" label="可用" width="75" />
      <el-table-column prop="frozenQty" label="冻结" width="75" />
      <el-table-column prop="outboundQty" label="已出库" width="80" />
      <el-table-column prop="unitCost" label="单位成本" width="100" />
      <el-table-column prop="productionDate" label="生产日期" min-width="155" />
      <el-table-column prop="expireTime" label="有效期" min-width="155" />
      <el-table-column prop="inboundTime" label="入库时间" min-width="155" />
      <el-table-column prop="ageDays" label="库龄" width="75" />
      <el-table-column label="等级" width="100">
        <template slot-scope="{row}">
          <el-tag size="mini" :type="ageTag(row.ageLevel)">{{ ageText(row.ageLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90" fixed="right">
        <template slot-scope="{row}"><el-button type="text" @click="edit(row)">维护元数据</el-button></template>
      </el-table-column>
    </el-table>

    <el-collapse class="maintenance-panel">
      <el-collapse-item title="历史库存初始化工具（仅首次上线或历史数据迁移使用）" name="opening">
        <el-alert
          title="该操作会把现有库存总账转换为期初批次。执行前必须确认所有冻结库存为0，并完成数据库备份。正常订货和调拨不需要执行。"
          type="warning"
          :closable="false"
          show-icon
        />
        <el-button type="danger" plain class="opening-button" @click="initOpening">执行期初批次初始化</el-button>
      </el-collapse-item>
    </el-collapse>

    <el-dialog title="维护批次元数据" :visible.sync="visible" width="520px">
      <el-alert title="这里只维护单位成本、生产日期和有效期，不改变库存数量。" type="info" :closable="false" style="margin-bottom:16px" />
      <el-form :model="form" label-width="100px">
        <el-form-item label="批次号"><el-input :value="form.batchNo" disabled /></el-form-item>
        <el-form-item label="单位成本"><el-input-number v-model="form.unitCost" :min="0" :precision="4" style="width:100%" /></el-form-item>
        <el-form-item label="生产日期"><el-date-picker v-model="form.productionDate" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" /></el-form-item>
        <el-form-item label="有效期"><el-date-picker v-model="form.expireTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkStockBatchList, initJkStockBatchOpening, updateJkStockBatchMetadata } from '@/api/jkBusiness'
import { getJkStockAccountOptions } from '@/api/jkOptions'
import { productLstApi } from '@/api/store'

export default {
  data() {
    return {
      q: { page: 1, limit: 100, stockAccountId: null, productId: null, agingLevel: '' },
      list: [],
      loading: false,
      visible: false,
      form: {},
      accountOptions: [],
      productOptions: [],
      accountLoading: false,
      productLoading: false
    }
  },
  created() {
    this.searchAccounts('')
    this.searchProducts('')
    this.load()
  },
  methods: {
    rows(response) {
      const data = response && response.data ? response.data : response
      return (data && data.list) || []
    },
    load() {
      this.loading = true
      getJkStockBatchList(this.q).then(response => { this.list = this.rows(response) }).finally(() => { this.loading = false })
    },
    reset() {
      this.q = { page: 1, limit: 100, stockAccountId: null, productId: null, agingLevel: '' }
      this.load()
    },
    searchAccounts(keyword) {
      this.accountLoading = true
      getJkStockAccountOptions({ keyword: keyword || '', limit: 30 }).then(response => {
        this.accountOptions = (response && response.data) || response || []
      }).finally(() => { this.accountLoading = false })
    },
    searchProducts(keyword) {
      this.productLoading = true
      productLstApi({ page: 1, limit: 20, keywords: keyword || '' }).then(response => {
        const data = response && response.data ? response.data : response
        this.productOptions = (data && data.list) || []
      }).finally(() => { this.productLoading = false })
    },
    initOpening() {
      this.$confirm('这是一次性历史数据迁移操作。请确认已备份数据库且全部冻结库存为0。是否继续？', '高风险操作', {
        type: 'warning',
        confirmButtonText: '已确认，继续',
        cancelButtonText: '取消'
      }).then(() => initJkStockBatchOpening().then(response => {
        this.$message.success('新增期初批次 ' + ((response && response.data) || 0) + ' 条')
        this.load()
      }))
    },
    edit(row) {
      this.form = { id: row.id, batchNo: row.batchNo, unitCost: row.unitCost, productionDate: row.productionDate, expireTime: row.expireTime }
      this.visible = true
    },
    save() {
      if (this.form.productionDate && this.form.expireTime && this.form.expireTime <= this.form.productionDate) {
        return this.$message.warning('有效期必须晚于生产日期')
      }
      updateJkStockBatchMetadata(this.form).then(() => {
        this.$message.success('已保存')
        this.visible = false
        this.load()
      })
    },
    ageText(level) {
      return { ATTENTION: '关注', WARNING: '预警', SERIOUS: '严重', NORMAL: '正常' }[level] || level || '--'
    },
    ageTag(level) {
      return { ATTENTION: 'info', WARNING: 'warning', SERIOUS: 'danger', NORMAL: 'success' }[level] || 'info'
    }
  }
}
</script>
<style scoped>
.filter-item{width:150px;margin-right:8px}.account-select{width:300px}.product-select{width:260px}.maintenance-panel{margin-top:20px}.opening-button{margin-top:14px}
</style>