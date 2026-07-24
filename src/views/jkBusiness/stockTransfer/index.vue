<template>
  <div class="divBox">
    <el-alert title="调拨拨货必须登记配送方式、物流单号和拨货时间；调拨确认收货后才增加下级库存。已完成调拨的退回单在“调拨退回”菜单处理。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header" class="acea-row row-between-wrapper"><span>创客/合伙人调拨管理</span><el-button size="mini" @click="loadData">刷新</el-button></div>
      <el-form :inline="true" size="mini" class="mb15">
        <el-form-item label="状态"><el-select v-model="query.status" clearable placeholder="全部"><el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item label="关键字"><el-input v-model="query.keywords" placeholder="调拨单号 / requestNo" /></el-form-item>
        <el-form-item><el-button type="primary" @click="loadData">查询</el-button><el-button @click="resetQuery">重置</el-button></el-form-item>
      </el-form>
      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="transferNo" label="调拨单号" min-width="160" /><el-table-column prop="requestNo" label="requestNo" min-width="160" />
        <el-table-column label="申请人" min-width="180"><template slot-scope="{ row }"><div>{{ row.applicantName || '用户不存在' }}</div><div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div></template></el-table-column>
        <el-table-column label="身份" min-width="120"><template slot-scope="{ row }"><div>{{ row.roleName || '身份未配置' }}</div><div class="sub-text">{{ row.regionName || '区域未配置' }}</div></template></el-table-column>
        <el-table-column label="商品 / SKU" min-width="220"><template slot-scope="{ row }"><div>{{ row.firstProductName || '商品已删除' }}</div><div class="sub-text">{{ row.firstSkuText || row.firstSkuName || 'SKU 已删除' }}</div></template></el-table-column>
        <el-table-column prop="totalAmount" label="金额" width="110" />
        <el-table-column label="状态" width="150"><template slot-scope="{ row }"><el-tag size="mini" :type="row.statusTag || 'info'">{{ row.statusText || '状态未配置' }}</el-tag></template></el-table-column>
        <el-table-column label="物流" min-width="170"><template slot-scope="{ row }"><div>{{ logisticsCompanyText(row.logisticsCompany) }}</div><div class="sub-text">{{ row.logisticsNo || '--' }}</div></template></el-table-column>
        <el-table-column label="操作" min-width="340" fixed="right"><template slot-scope="{ row }"><el-button size="mini" @click="showDetail(row)">详情</el-button><el-button v-if="row.status === 'SUBMITTED'" size="mini" type="primary" @click="audit(row, true)">审核通过</el-button><el-button v-if="row.status === 'SUBMITTED'" size="mini" type="warning" @click="audit(row, false)">审核驳回</el-button><el-button v-if="row.status === 'PAYMENT_SUBMITTED'" size="mini" type="primary" @click="payment(row, true)">付款确认</el-button><el-button v-if="row.status === 'PAYMENT_SUBMITTED'" size="mini" type="warning" @click="payment(row, false)">付款驳回</el-button><el-button v-if="row.status === 'PAYMENT_APPROVED'" size="mini" type="success" @click="openDispatch(row)">拨货</el-button><el-button v-if="['SUBMITTED','AUDIT_REJECTED','AUDIT_APPROVED','PAYMENT_SUBMITTED','PAYMENT_REJECTED','PAYMENT_APPROVED'].includes(row.status)" size="mini" type="danger" @click="closeTransfer(row)">关闭</el-button></template></el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="调拨单详情" :visible.sync="detailVisible" width="960px">
      <div v-if="detail.transfer">
        <el-descriptions :column="2" border size="mini">
          <el-descriptions-item label="调拨单号">{{ detail.transfer.transferNo }}</el-descriptions-item><el-descriptions-item label="requestNo">{{ detail.transfer.requestNo }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ detail.transfer.applicantName || '用户不存在' }}<span v-if="detail.transfer.applicantPhone"> / {{ detail.transfer.applicantPhone }}</span></el-descriptions-item><el-descriptions-item label="状态">{{ detail.transfer.statusText || '状态未配置' }}</el-descriptions-item>
          <el-descriptions-item label="付款状态">{{ detail.transfer.payStatusText || '--' }}</el-descriptions-item><el-descriptions-item label="审核状态">{{ detail.transfer.auditStatusText || '--' }}</el-descriptions-item><el-descriptions-item label="入库状态">{{ detail.transfer.receiveStatusText || '--' }}</el-descriptions-item><el-descriptions-item label="区域">{{ detail.transfer.regionName || '区域未配置' }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ detail.transfer.totalAmount }}</el-descriptions-item><el-descriptions-item label="驳回原因">{{ detail.transfer.rejectReason || '--' }}</el-descriptions-item><el-descriptions-item label="关闭原因">{{ detail.transfer.cancelReason || '--' }}</el-descriptions-item><el-descriptions-item label="审核备注">{{ detail.transfer.auditRemark || '--' }}</el-descriptions-item>
          <el-descriptions-item label="配送方式">{{ logisticsCompanyText(detail.transfer.logisticsCompany) }}</el-descriptions-item><el-descriptions-item label="物流单号">{{ detail.transfer.logisticsNo || '--' }}</el-descriptions-item><el-descriptions-item label="拨货时间" :span="2">{{ detail.transfer.shippingTime || '--' }}</el-descriptions-item>
        </el-descriptions>
        <h4 class="section-title">商品明细</h4><el-table :data="detail.items || []" size="mini"><el-table-column label="商品" min-width="180"><template slot-scope="{ row }"><div>{{ row.productName || '商品已删除' }}</div></template></el-table-column><el-table-column label="SKU" min-width="180"><template slot-scope="{ row }"><div>{{ row.skuText || row.skuName || 'SKU 已删除' }}</div><div v-if="row.skuCode" class="sub-text">编码：{{ row.skuCode }}</div></template></el-table-column><el-table-column prop="quantity" label="数量" width="80" /><el-table-column prop="unitPrice" label="单价" width="100" /><el-table-column prop="totalAmount" label="金额" width="100" /></el-table>
        <h4 class="section-title">付款凭证</h4><el-table :data="detail.vouchers || []" size="mini"><el-table-column prop="voucherNo" label="凭证号" min-width="150" /><el-table-column label="审核状态" width="110"><template slot-scope="{ row }"><el-tag size="mini" :type="row.voucherStatusTag || 'info'">{{ row.voucherStatusText || row.auditStatusText || '--' }}</el-tag></template></el-table-column><el-table-column prop="rejectReason" label="驳回原因" min-width="150" /><el-table-column label="凭证预览" min-width="180"><template slot-scope="{ row }"><div v-if="row.voucherUrl" class="voucher-preview"><el-image :src="row.voucherUrl" :preview-src-list="[row.voucherUrl]" fit="cover" class="voucher-image" /><el-link :href="row.voucherUrl" target="_blank" type="primary">原图打开</el-link></div><span v-else>--</span></template></el-table-column></el-table>
        <h4 class="section-title">审核日志</h4><el-table :data="detail.auditLogs || []" size="mini"><el-table-column label="动作" width="120"><template slot-scope="{ row }">{{ row.auditActionText || '--' }}</template></el-table-column><el-table-column label="前状态" width="120"><template slot-scope="{ row }">{{ row.beforeStatusText || '--' }}</template></el-table-column><el-table-column label="后状态" width="120"><template slot-scope="{ row }">{{ row.afterStatusText || '--' }}</template></el-table-column><el-table-column prop="rejectReason" label="驳回原因" min-width="150" /><el-table-column prop="auditRemark" label="备注" min-width="160" /></el-table>
      </div>
    </el-dialog>

    <el-dialog title="区县代拨货" :visible.sync="dispatchVisible" width="520px" @closed="resetDispatchForm">
      <el-form :model="dispatchForm" label-width="90px">
        <el-form-item label="调拨单号"><span>{{ dispatchForm.transferNo }}</span></el-form-item>
        <el-form-item label="配送方式"><el-radio-group v-model="dispatchForm.mode"><el-radio label="LOGISTICS">物流配送</el-radio><el-radio label="SELF_PICKUP">自提/无需物流</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="dispatchForm.mode==='LOGISTICS'" label="物流公司" required><el-input v-model.trim="dispatchForm.logisticsCompany" maxlength="100" placeholder="请输入物流公司" /></el-form-item>
        <el-form-item v-if="dispatchForm.mode==='LOGISTICS'" label="物流单号" required><el-input v-model.trim="dispatchForm.logisticsNo" maxlength="100" placeholder="请输入物流单号" /></el-form-item>
        <el-form-item label="拨货时间" required><el-date-picker v-model="dispatchForm.shippingTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择拨货时间" style="width:100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model.trim="dispatchForm.remark" type="textarea" maxlength="200" show-word-limit /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="dispatchVisible=false">取消</el-button><el-button type="primary" :loading="dispatching" @click="submitDispatch">确认拨货</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { auditJkStockTransfer, closeJkStockTransfer, confirmJkStockTransferPayment, dispatchJkStockTransfer, getJkStockTransferDetail, getJkStockTransferList } from '@/api/jkBusiness'
import { jkStockTransferStatusOptions } from '@/utils/jk-display'
export default {
  data() { return { query: { page: 1, limit: 20, status: '', keywords: '' }, statusOptions: jkStockTransferStatusOptions, listData: { list: [] }, detailVisible: false, detail: { transfer: null, items: [], vouchers: [], auditLogs: [] }, dispatchVisible: false, dispatching: false, dispatchForm: this.newDispatchForm() } },
  mounted() { this.loadData() },
  methods: {
    newDispatchForm() { return { businessId: null, transferNo: '', mode: 'LOGISTICS', logisticsCompany: '', logisticsNo: '', shippingTime: this.nowText(), remark: '' } },
    nowText() { const d = new Date(); const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) },
    loadData() { getJkStockTransferList(this.query).then(res => { this.listData = res || { list: [] } }) },
    resetQuery() { this.query = { page: 1, limit: 20, status: '', keywords: '' }; this.loadData() },
    showDetail(row) { getJkStockTransferDetail(row.id).then(res => { this.detail = res || { transfer: null, items: [], vouchers: [], auditLogs: [] }; this.detailVisible = true }) },
    audit(row, approved) { this.$prompt('请输入审核备注，可为空', approved ? '调拨审核通过' : '调拨审核驳回', { confirmButtonText: '确定', cancelButtonText: '取消', inputValue: '' }).then(({ value }) => auditJkStockTransfer({ businessId: row.id, approved, remark: value }).then(() => { this.$message.success('操作成功'); this.loadData() })).catch(() => {}) },
    payment(row, approved) { this.$prompt('请输入付款审核备注，可为空', approved ? '付款确认通过' : '付款确认驳回', { confirmButtonText: '确定', cancelButtonText: '取消', inputValue: '' }).then(({ value }) => confirmJkStockTransferPayment({ businessId: row.id, approved, remark: value }).then(() => { this.$message.success('操作成功'); this.loadData() })).catch(() => {}) },
    openDispatch(row) { this.dispatchForm = this.newDispatchForm(); this.dispatchForm.businessId = row.id; this.dispatchForm.transferNo = row.transferNo; this.dispatchVisible = true },
    submitDispatch() { if (!this.dispatchForm.shippingTime) return this.$message.warning('请选择拨货时间'); if (this.dispatchForm.mode === 'LOGISTICS' && (!this.dispatchForm.logisticsCompany || !this.dispatchForm.logisticsNo)) return this.$message.warning('请填写物流公司和物流单号'); const selfPickup = this.dispatchForm.mode === 'SELF_PICKUP'; this.dispatching = true; dispatchJkStockTransfer({ businessId: this.dispatchForm.businessId, logisticsCompany: selfPickup ? 'SELF_PICKUP' : this.dispatchForm.logisticsCompany, logisticsNo: selfPickup ? 'SELF_PICKUP' : this.dispatchForm.logisticsNo, shippingTime: this.dispatchForm.shippingTime, remark: this.dispatchForm.remark || (selfPickup ? '区县代拨货：自提' : '区县代物流拨货') }).then(() => { this.$message.success('拨货成功'); this.dispatchVisible = false; this.loadData() }).finally(() => { this.dispatching = false }) },
    resetDispatchForm() { this.dispatchForm = this.newDispatchForm() },
    closeTransfer(row) { this.$prompt('请输入关闭原因', '关闭调拨单', { confirmButtonText: '确定', cancelButtonText: '取消' }).then(({ value }) => closeJkStockTransfer({ businessId: row.id, remark: value }).then(() => { this.$message.success('关闭成功'); this.loadData() })).catch(() => {}) },
    logisticsCompanyText(value) { if (!value) return '--'; return value === 'SELF_PICKUP' ? '自提/无需物流' : value }
  }
}
</script>
<style scoped>.section-title{margin:18px 0 10px}.sub-text{color:#909399;font-size:12px}.voucher-preview{display:flex;flex-direction:column;gap:8px}.voucher-image{width:72px;height:72px;border-radius:6px;border:1px solid #ebeef5}</style>
