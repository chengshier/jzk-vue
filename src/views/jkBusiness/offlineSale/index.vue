<template>
  <div class="divBox">
    <el-card shadow="never">
      <div slot="header" class="header"><span>线下销售管理</span><el-tag type="info">经营收益与平台佣金分账</el-tag></div>
      <el-alert title="线下销售确认后会真实扣减销售人库存并固化批次成本；经营毛利不进入提现账户，只有已发布规则产生的平台奖励才可结算。" type="warning" :closable="false" style="margin-bottom:16px" />
      <el-form inline size="small">
        <el-form-item label="销售人"><el-select v-model="query.sellerUserId" clearable filterable remote :remote-method="searchUsers" placeholder="姓名/手机号" style="width:220px"><el-option v-for="x in users" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option v-for="x in statuses" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-button type="primary" @click="load">查询</el-button>
      </el-form>
      <el-table v-loading="loading" :data="list" size="mini">
        <el-table-column prop="saleNo" label="销售单号" min-width="180" />
        <el-table-column label="销售人" min-width="150"><template slot-scope="s">{{ s.row.sellerName || s.row.sellerUserId }}<br><small>{{ s.row.sellerRoleName || s.row.sellerRoleCode }}</small></template></el-table-column>
        <el-table-column prop="customerType" label="客户类型" width="130" />
        <el-table-column prop="totalQuantity" label="数量" width="80" />
        <el-table-column label="成交金额" width="120"><template slot-scope="s">¥{{ money(s.row.totalAmount) }}</template></el-table-column>
        <el-table-column prop="saleTime" label="销售时间" min-width="160" />
        <el-table-column label="状态" width="110"><template slot-scope="s"><el-tag :type="s.row.statusTag || 'info'">{{ s.row.statusText || s.row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150"><template slot-scope="s"><el-button type="text" @click="openDetail(s.row)">详情</el-button><el-button v-if="s.row.status==='PENDING_AUDIT'" type="text" @click="openAudit(s.row)">审核</el-button></template></el-table-column>
      </el-table>
      <el-pagination :current-page="query.page" :page-size="query.limit" :total="total" layout="total, prev, pager, next" @current-change="changePage" />
    </el-card>

    <jk-business-drawer :visible.sync="drawer" title="线下销售详情" width="760px">
      <template v-if="detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="销售单号">{{ detail.saleNo }}</el-descriptions-item><el-descriptions-item label="状态">{{ detail.statusText || detail.status }}</el-descriptions-item>
          <el-descriptions-item label="销售人">{{ detail.sellerName || detail.sellerUserId }}</el-descriptions-item><el-descriptions-item label="身份">{{ detail.sellerRoleName || detail.sellerRoleCode }}</el-descriptions-item>
          <el-descriptions-item label="客户类型">{{ detail.customerType }}</el-descriptions-item><el-descriptions-item label="关联客户">{{ detail.customerNameMasked || '--' }} {{ detail.customerPhoneMasked || '' }}</el-descriptions-item>
          <el-descriptions-item label="成交金额">¥{{ money(detail.totalAmount) }}</el-descriptions-item><el-descriptions-item label="收款方式">{{ detail.payMethod || '--' }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ detail.regionCode || '--' }}</el-descriptions-item><el-descriptions-item label="区县代理">{{ detail.countyAgentName || detail.countyAgentUserId || '--' }}</el-descriptions-item>
        </el-descriptions>
        <h4>商品与成本</h4>
        <el-table :data="detail.items || []" size="mini" border>
          <el-table-column label="商品"><template slot-scope="s">{{ s.row.productName || s.row.productId }} / {{ s.row.skuName || s.row.skuCode }}</template></el-table-column>
          <el-table-column prop="quantity" label="数量" width="70" /><el-table-column label="单价" width="90"><template slot-scope="s">¥{{ money(s.row.unitPrice) }}</template></el-table-column>
          <el-table-column label="成本" width="100"><template slot-scope="s">{{ s.row.costAmount == null ? '待确认' : '¥'+money(s.row.costAmount) }}</template></el-table-column>
          <el-table-column label="经营毛利" width="110"><template slot-scope="s">{{ s.row.profitAmount == null ? '待确认' : '¥'+money(s.row.profitAmount) }}</template></el-table-column>
        </el-table>
        <h4>处理记录</h4>
        <el-timeline><el-timeline-item v-for="x in detail.auditLogs || []" :key="x.id" :timestamp="x.createTime">{{ x.action }}：{{ x.remark || '--' }}</el-timeline-item></el-timeline>
      </template>
    </jk-business-drawer>

    <el-dialog title="审核线下销售" :visible.sync="auditVisible" width="520px">
      <el-form label-width="90px"><el-form-item label="审核结果"><el-radio-group v-model="auditForm.approved"><el-radio :label="true">通过并确认</el-radio><el-radio :label="false">驳回</el-radio></el-radio-group></el-form-item><el-form-item label="审核备注"><el-input v-model.trim="auditForm.remark" type="textarea" :rows="4" maxlength="500" /></el-form-item></el-form>
      <span slot="footer"><el-button @click="auditVisible=false">取消</el-button><el-button type="primary" @click="submitAudit">确认</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import JkBusinessDrawer from '@/components/jkBusiness/JkBusinessDrawer'
import { getJkOfflineSaleList, getJkOfflineSaleDetail, auditJkOfflineSale } from '@/api/jkV31Business'
import { getJkUserOptions } from '@/api/jkBusiness'
export default {
  components: { JkBusinessDrawer },
  data() { return { query: { page: 1, limit: 20, status: '' }, list: [], total: 0, loading: false, users: [], drawer: false, detail: null, auditVisible: false, auditForm: {}, statuses: [{ label: '待审核', value: 'PENDING_AUDIT' }, { label: '已确认', value: 'CONFIRMED' }, { label: '已驳回', value: 'REJECTED' }, { label: '已退货', value: 'RETURNED' }, { label: '已取消', value: 'CANCELLED' }] } },
  created() { this.searchUsers(''); this.load() },
  methods: {
    unwrap(r) { return (r && r.data) || r || {} },
    load() { this.loading = true; getJkOfflineSaleList(this.query).then(r => { const d = this.unwrap(r); this.list = d.list || d.records || (Array.isArray(d) ? d : []); this.total = Number(d.total || this.list.length) }).finally(() => { this.loading = false }) },
    searchUsers(keyword) { getJkUserOptions({ keyword, limit: 30 }).then(r => { this.users = this.unwrap(r) || [] }) },
    openDetail(row) { getJkOfflineSaleDetail(row.id).then(r => { this.detail = this.unwrap(r); this.drawer = true }) },
    openAudit(row) { this.auditForm = { saleId: row.id, approved: true, remark: '', requestNo: 'ADMIN-OFFLINE-' + row.id + '-' + Date.now() }; this.auditVisible = true },
    submitAudit() { if (!this.auditForm.remark) return this.$message.warning('请填写审核备注'); auditJkOfflineSale(this.auditForm).then(() => { this.$message.success('审核完成'); this.auditVisible = false; this.load() }) },
    changePage(page) { this.query.page = page; this.load() }, money(v) { const n = Number(v || 0); return Number.isNaN(n) ? v : n.toFixed(2) }
  }
}
</script>
<style scoped>.header{display:flex;align-items:center;justify-content:space-between}.el-pagination{margin-top:18px;text-align:right}h4{margin:22px 0 12px}small{color:#909399}</style>
