<template>
  <div class="app-container">
    <el-alert
      title="默认口径：完成或入库计业绩，退款和退回在发生日记负数；区域和团队使用业务快照；金额不含运费；匿名健康统计少于 10 人时不展示明细。"
      type="info"
      :closable="false"
      style="margin-bottom:16px"
    />
    <div class="filter-container">
      <el-date-picker v-model="dates" type="daterange" value-format="yyyy-MM-dd" start-placeholder="开始日期" end-placeholder="结束日期"/>
      <el-button type="primary" :loading="loading" @click="load">刷新全部</el-button>
      <el-date-picker v-model="runDate" type="date" value-format="yyyy-MM-dd" placeholder="汇总日期"/>
      <el-button :loading="running" @click="runDaily">运行日报汇总</el-button>
    </div>

    <el-tabs v-model="tab">
      <el-tab-pane label="区域业绩" name="region">
        <el-table v-loading="loading" :data="region" border>
          <el-table-column label="区域" min-width="170"><template slot-scope="{row}">{{ row.dimensionName || row.regionName || row.dimensionCode || '区域未配置' }}</template></el-table-column>
          <el-table-column label="指标" min-width="170"><template slot-scope="{row}">{{ metricText(row.metricCode) }}</template></el-table-column>
          <el-table-column prop="amount" label="金额（元）" width="130"/>
          <el-table-column prop="count" label="业务数量" width="110"/>
          <el-table-column prop="metricDate" label="统计日期" min-width="130"/>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="库存库龄" name="stock">
        <el-table v-loading="loading" :data="stock" border>
          <el-table-column prop="accountName" label="库存主体" min-width="170"/>
          <el-table-column label="区域" min-width="140"><template slot-scope="{row}">{{ row.regionName || row.regionCode || '区域未配置' }}</template></el-table-column>
          <el-table-column label="商品 / SKU" min-width="230"><template slot-scope="{row}"><div>{{row.productName||'商品已删除'}}</div><div class="sub-text">{{row.skuText||row.skuName||row.skuCode||'默认规格'}}</div></template></el-table-column>
          <el-table-column prop="availableQty" label="可用库存" width="100"/>
          <el-table-column prop="frozenQty" label="冻结库存" width="100"/>
          <el-table-column prop="maxAgeDays" label="最大库龄（天）" width="120"/>
          <el-table-column prop="noOutboundDays" label="无出库天数" width="115"/>
          <el-table-column label="库龄风险" width="105"><template slot-scope="{row}"><el-tag size="mini" :type="agingTag(row.agingLevel)">{{ agingText(row.agingLevel) }}</el-tag></template></el-table-column>
          <el-table-column prop="inventoryCost" label="库存成本（元）" width="130"/>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="库存账与批次账对账" name="stockReconcile">
        <el-alert title="此处只展示差异，不提供直接改库存入口。必须根据订货、调拨、退回和库存流水追溯原因后再处理。" type="warning" :closable="false" style="margin-bottom:12px"/>
        <el-table v-loading="loading" :data="stockReconcile" border>
          <el-table-column prop="accountName" label="库存主体" min-width="170"/>
          <el-table-column label="区域" min-width="130"><template slot-scope="{row}">{{row.regionName||row.regionCode||'区域未配置'}}</template></el-table-column>
          <el-table-column label="商品 / SKU" min-width="230"><template slot-scope="{row}"><div>{{row.productName||'商品已删除'}}</div><div class="sub-text">{{row.skuText||row.skuName||row.skuCode||'SKU 已删除'}}</div></template></el-table-column>
          <el-table-column prop="totalAvailableQty" label="总账可用" width="95"/>
          <el-table-column prop="batchAvailableQty" label="批次可用" width="95"/>
          <el-table-column label="可用差异" width="95"><template slot-scope="{row}"><span :class="differenceClass(row.availableDifference)">{{row.availableDifference||0}}</span></template></el-table-column>
          <el-table-column prop="totalFrozenQty" label="总账冻结" width="95"/>
          <el-table-column prop="batchFrozenQty" label="批次冻结" width="95"/>
          <el-table-column label="冻结差异" width="95"><template slot-scope="{row}"><span :class="differenceClass(row.frozenDifference)">{{row.frozenDifference||0}}</span></template></el-table-column>
          <el-table-column label="对账状态" width="105"><template slot-scope="{row}"><el-tag size="mini" :type="reconcileTag(row.reconcileStatus)">{{reconcileText(row.reconcileStatus)}}</el-tag></template></el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="财务对账" name="finance">
        <el-descriptions v-loading="loading" :column="3" border>
          <el-descriptions-item v-for="(value,key) in finance" :key="key" :label="financeLabel(key)">
            <span :class="financeValueClass(key,value)">{{ formatFinanceValue(key,value) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane label="匿名健康汇总" name="health">
        <el-alert title="匿名健康报表仅展示达到最小样本量的聚合结果，不允许从报表反查个人健康明细。" type="warning" :closable="false" style="margin-bottom:12px"/>
        <el-table v-loading="loading" :data="health" border>
          <el-table-column label="区域" min-width="150"><template slot-scope="{row}">{{row.regionName||row.regionCode||'区域未配置'}}</template></el-table-column>
          <el-table-column label="数据类型" width="110"><template slot-scope="{row}">{{healthTypeText(row.dataType)}}</template></el-table-column>
          <el-table-column prop="userCount" label="用户数" width="90"/>
          <el-table-column prop="recordCount" label="记录数" width="90"/>
          <el-table-column prop="averageValue" label="平均值" width="100"/>
          <el-table-column prop="alertCount" label="预警数" width="90"/>
          <el-table-column label="隐私保护" min-width="120"><template slot-scope="{row}"><el-tag size="mini" :type="row.suppressed?'warning':'success'">{{row.suppressed?'小样本已抑制':'可展示聚合'}}</el-tag></template></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {
  getJkRegionReport,
  getJkInventoryAgingReport,
  getJkInventoryReconcileReport,
  getJkFinanceReport,
  getJkHealthAnonymousReport,
  runJkReportDaily,
} from '@/api/jkBusiness'

export default {
  data() {
    return {
      dates: [], runDate: '', tab: 'region', loading: false, running: false,
      region: [], stock: [], stockReconcile: [], finance: {}, health: [],
    }
  },
  created() { this.load() },
  methods: {
    params() { return { startDate: this.dates && this.dates[0], endDate: this.dates && this.dates[1] } },
    payload(response, fallback) { return (response && response.data) || response || fallback },
    load() {
      this.loading = true
      const params = this.params()
      Promise.all([
        getJkRegionReport(params).then(res => { this.region = this.payload(res, []) }),
        getJkInventoryAgingReport({ warnDays: 60, seriousDays: 90 }).then(res => { this.stock = this.payload(res, []) }),
        getJkInventoryReconcileReport({ onlyMismatch: true }).then(res => { this.stockReconcile = this.payload(res, []) }),
        getJkFinanceReport(params).then(res => { this.finance = this.payload(res, {}) }),
        getJkHealthAnonymousReport(Object.assign({}, params, { minSampleSize: 10 })).then(res => { this.health = this.payload(res, []) }),
      ]).finally(() => { this.loading = false })
    },
    runDaily() {
      if (!this.runDate) return this.$message.warning('请选择汇总日期')
      this.running = true
      runJkReportDaily({ metricDate: this.runDate }).then(res => {
        this.$message.success('汇总完成，写入 ' + Number(this.payload(res, 0)) + ' 个指标')
        this.load()
      }).finally(() => { this.running = false })
    },
    metricText(value) {
      return {
        RETAIL_SALES: '普通零售销售额', PLATFORM_ORDER: '平台订货入库额', STOCK_TRANSFER: '库存调拨完成额',
        REFUND: '退款金额', TRANSFER_RETURN: '调拨退回金额', COMMISSION: '佣金金额', WITHDRAW: '提现金额',
      }[value] || value || '指标未配置'
    },
    agingText(value) { return { NORMAL: '正常', WARNING: '预警', SERIOUS: '严重', EXPIRED: '已过期' }[value] || value || '未评级' },
    agingTag(value) { if (value === 'SERIOUS' || value === 'EXPIRED') return 'danger'; if (value === 'WARNING') return 'warning'; return 'success' },
    reconcileText(value) { return { BALANCED: '账目一致', DIFFERENCE: '存在差异', MISSING_BATCH: '缺少批次' }[value] || value || '未检查' },
    reconcileTag(value) { return value === 'BALANCED' ? 'success' : 'danger' },
    differenceClass(value) { return Number(value || 0) === 0 ? 'success-text' : 'danger-text' },
    healthTypeText(value) { return { GLUCOSE: '血糖', DIET: '饮食', EXERCISE: '运动', MEDICINE: '用药', PROFILE: '健康档案' }[value] || value || '未配置' },
    financeLabel(key) {
      return {
        commissionAccountTotal: '佣金账户总额', commissionFlowTotal: '佣金流水净额', fundAccountTotal: '资金账户总额',
        fundFlowTotal: '资金流水净额', withdrawFrozenTotal: '提现冻结金额', withdrawPaidTotal: '已打款金额',
        commissionDifference: '佣金差异', fundDifference: '资金差异', reconcileStatus: '对账状态',
      }[key] || key
    },
    formatFinanceValue(key, value) {
      if (key === 'reconcileStatus') return this.reconcileText(value)
      if (typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(String(value || ''))) return Number(value || 0).toFixed(2)
      return value === null || value === undefined || value === '' ? '--' : value
    },
    financeValueClass(key, value) {
      if (key === 'reconcileStatus') return value === 'BALANCED' ? 'success-text' : 'danger-text'
      if (/difference/i.test(key) && Number(value || 0) !== 0) return 'danger-text'
      return ''
    },
  },
}
</script>

<style scoped>
.filter-container{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px}.sub-text{color:#909399;font-size:12px}.danger-text{color:#f56c6c;font-weight:600}.success-text{color:#67c23a;font-weight:600}
</style>
