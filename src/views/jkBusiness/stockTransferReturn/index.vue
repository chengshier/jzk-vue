<template>
  <div class="app-container">
    <el-alert
      title="当前为 V1 线下退款流程：申请人提交 → 区县代审核并冻结申请人库存 → 申请人寄回 → 区县代确认收货并完成库存回流 → 区县代上传退款凭证并确认线下退款 → 完成。"
      type="info"
      :closable="false"
      style="margin-bottom: 16px"
    />

    <div class="filter-container">
      <el-select v-model="query.status" clearable placeholder="退回状态" class="filter-item" style="width: 180px">
        <el-option label="待审核" value="SUBMITTED" />
        <el-option label="审核驳回" value="AUDIT_REJECTED" />
        <el-option label="待寄回" value="AUDIT_APPROVED" />
        <el-option label="已寄回待收货" value="RETURN_SHIPPED" />
        <el-option label="待退款" value="REFUND_PENDING" />
        <el-option label="已完成" value="COMPLETED" />
        <el-option label="已取消" value="CANCELLED" />
        <el-option label="已关闭" value="CLOSED" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
    </div>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="returnNo" label="退回单号" min-width="175" />
      <el-table-column prop="originalTransferNo" label="原调拨单" min-width="170" />
      <el-table-column label="申请人" min-width="180">
        <template slot-scope="{ row }">{{ row.applicantName || '--' }} / {{ row.applicantPhone || row.userId }}</template>
      </el-table-column>
      <el-table-column label="首件商品" min-width="190">
        <template slot-scope="{ row }">{{ row.firstProductName || '--' }} {{ row.firstSkuName || '' }}</template>
      </el-table-column>
      <el-table-column prop="returnAmount" label="退回金额" width="110" />
      <el-table-column label="状态" width="140">
        <template slot-scope="{ row }"><el-tag :type="row.statusTag || 'info'">{{ row.statusText || row.status }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="refundStatusText" label="退款" width="110" />
      <el-table-column prop="createTime" label="申请时间" min-width="160" />
      <el-table-column label="操作" width="260" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" @click="detail(row)">详情</el-button>
          <template v-if="row.status === 'SUBMITTED'">
            <el-button type="text" @click="audit(row, true)">通过</el-button>
            <el-button type="text" class="danger" @click="audit(row, false)">驳回</el-button>
          </template>
          <el-button v-if="row.status === 'RETURN_SHIPPED'" type="text" @click="receive(row)">确认收货</el-button>
          <el-button v-if="row.status === 'REFUND_PENDING'" type="text" @click="openRefund(row)">确认退款</el-button>
          <el-button v-if="['SUBMITTED', 'AUDIT_APPROVED'].includes(row.status)" type="text" class="danger" @click="close(row)">关闭</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="调拨退回详情" :visible.sync="visible" width="760px">
      <div v-if="current.returnOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="退回单">{{ current.returnOrder.returnNo }}</el-descriptions-item>
          <el-descriptions-item label="原调拨单">{{ current.returnOrder.originalTransferNo }}</el-descriptions-item>
          <el-descriptions-item label="退回原因">{{ current.returnOrder.returnReason || '--' }}</el-descriptions-item>
          <el-descriptions-item label="物流">{{ current.returnOrder.logisticsCompany || '--' }} {{ current.returnOrder.logisticsNo || '' }}</el-descriptions-item>
          <el-descriptions-item label="退款凭证">
            <a v-if="current.returnOrder.refundVoucherUrl" :href="current.returnOrder.refundVoucherUrl" target="_blank">查看凭证</a>
            <span v-else>--</span>
          </el-descriptions-item>
          <el-descriptions-item label="退款备注">{{ current.returnOrder.refundRemark || '--' }}</el-descriptions-item>
        </el-descriptions>
        <el-table :data="current.items || []" border style="margin-top: 15px">
          <el-table-column prop="productName" label="商品" />
          <el-table-column prop="skuName" label="SKU" />
          <el-table-column prop="returnQuantity" label="数量" width="80" />
          <el-table-column prop="unitPrice" label="单价" width="100" />
          <el-table-column prop="returnAmount" label="金额" width="100" />
        </el-table>
      </div>
    </el-dialog>

    <el-dialog title="确认线下退款" :visible.sync="refundVisible" width="520px" :close-on-click-modal="false">
      <el-alert title="确认前请先完成实际线下退款，并上传银行回单、转账截图或其他可追溯凭证。" type="warning" :closable="false" style="margin-bottom: 16px" />
      <el-form label-width="100px">
        <el-form-item label="退款凭证" required>
          <upload-froms v-model="refundForm.refundVoucherUrl" />
          <a v-if="refundForm.refundVoucherUrl" :href="refundForm.refundVoucherUrl" target="_blank" class="preview-link">预览已选凭证</a>
        </el-form-item>
        <el-form-item label="退款备注" required>
          <el-input v-model.trim="refundForm.remark" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="填写线下流水号、退款账户或其他说明" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="refundVisible = false">取消</el-button>
        <el-button type="primary" :loading="refundSubmitting" @click="submitRefund">确认已退款</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import UploadFroms from '@/components/uploadPicture/forGenrator/index.vue'
import {
  getJkStockTransferReturnList,
  getJkStockTransferReturnDetail,
  auditJkStockTransferReturn,
  receiveJkStockTransferReturn,
  refundJkStockTransferReturn,
  closeJkStockTransferReturn
} from '@/api/jkBusiness'

export default {
  components: { UploadFroms },
  data() {
    return {
      query: {},
      list: [],
      loading: false,
      visible: false,
      current: {},
      refundVisible: false,
      refundSubmitting: false,
      refundForm: { returnId: null, refundVoucherUrl: '', remark: '' }
    }
  },
  created() { this.load() },
  methods: {
    load() {
      this.loading = true
      getJkStockTransferReturnList(this.query)
        .then(r => { this.list = (r && r.list) || (r && r.data && r.data.list) || r.data || r || [] })
        .finally(() => { this.loading = false })
    },
    detail(row) {
      getJkStockTransferReturnDetail(row.id).then(r => { this.current = r.data || r || {}; this.visible = true })
    },
    audit(row, approved) {
      this.$prompt(approved ? '请输入审核备注' : '请输入驳回原因', approved ? '审核通过' : '审核驳回', {
        inputPattern: /\S+/,
        inputErrorMessage: '不能为空'
      }).then(({ value }) => auditJkStockTransferReturn({
        businessId: row.id,
        approved,
        remark: value,
        requestNo: 'RETURN-AUDIT-' + Date.now()
      }).then(() => { this.$message.success('处理完成'); this.load() }))
    },
    receive(row) {
      this.$prompt('请输入收货备注', '确认退货收货', { inputPattern: /\S+/, inputErrorMessage: '不能为空' })
        .then(({ value }) => receiveJkStockTransferReturn({
          businessId: row.id,
          requestNo: 'RETURN-RECEIVE-' + Date.now(),
          remark: value
        }).then(() => { this.$message.success('库存已回流'); this.load() }))
    },
    openRefund(row) {
      this.refundForm = { returnId: row.id, refundVoucherUrl: '', remark: '' }
      this.refundVisible = true
    },
    submitRefund() {
      if (!this.refundForm.refundVoucherUrl) return this.$message.warning('请上传退款凭证')
      if (!this.refundForm.remark) return this.$message.warning('请填写退款备注')
      this.refundSubmitting = true
      refundJkStockTransferReturn({
        returnId: this.refundForm.returnId,
        requestNo: 'RETURN-REFUND-' + Date.now(),
        refundVoucherUrl: this.refundForm.refundVoucherUrl,
        remark: this.refundForm.remark
      }).then(() => {
        this.$message.success('退回流程已完成')
        this.refundVisible = false
        this.load()
      }).finally(() => { this.refundSubmitting = false })
    },
    close(row) {
      this.$prompt('请输入关闭原因', '关闭退回单', { inputPattern: /\S+/, inputErrorMessage: '不能为空' })
        .then(({ value }) => closeJkStockTransferReturn({
          businessId: row.id,
          requestNo: 'RETURN-CLOSE-' + Date.now(),
          remark: value
        }).then(() => { this.$message.success('已关闭'); this.load() }))
    }
  }
}
</script>

<style scoped>
.danger { color: #f56c6c; }
.preview-link { display: inline-block; margin-left: 12px; vertical-align: top; }
</style>
