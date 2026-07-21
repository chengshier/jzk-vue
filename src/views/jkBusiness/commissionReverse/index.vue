<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" @click="openCreate">手动冲正</el-button>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="reverseNo" label="冲正单号" min-width="170" />
      <el-table-column label="佣金记录" min-width="180"><template slot-scope="{row}"><div>{{ row.originalCommissionNo || row.sourceNo || '原佣金记录已删除' }}</div><div class="sub-text">{{ row.applicantName || '用户不存在' }}<span v-if="row.applicantPhone"> / {{ row.applicantPhone }}</span><span v-if="row.roleName"> / {{ row.roleName }}</span><span v-else> / 身份未配置</span></div></template></el-table-column>
      <el-table-column label="来源类型" width="130"><template slot-scope="{row}">{{ row.sourceTypeText || '未配置' }}</template></el-table-column>
      <el-table-column label="冲正类型" width="150"><template slot-scope="{row}">{{ row.reverseTypeText || '未配置' }}</template></el-table-column>
      <el-table-column prop="reverseAmount" label="冲正金额" width="110" />
      <el-table-column prop="beforeAmount" label="冲正前余额" width="120" />
      <el-table-column prop="afterAmount" label="冲正后余额" width="120" />
      <el-table-column label="状态" width="100"><template slot-scope="{row}"><el-tag size="mini" :type="row.statusTag || 'info'">{{ row.commissionStatusText || row.statusText || '状态未配置' }}</el-tag></template></el-table-column>
      <el-table-column prop="reason" label="原因" min-width="160" />
      <el-table-column prop="createTime" label="创建时间" width="170" />
    </el-table>
    <el-dialog title="手动佣金冲正" :visible.sync="dialogVisible" width="900px" @open="loadRecords">
      <el-alert title="请从可冲正佣金记录中选择；已结算余额不足时将写入负向待抵扣额，不会把账户余额扣成负数。" type="warning" :closable="false" show-icon />
      <el-table v-loading="recordLoading" :data="records" border highlight-current-row style="margin-top:16px" @current-change="selectRecord">
        <el-table-column width="55"><template slot-scope="scope"><el-radio v-model="form.commissionRecordId" :label="scope.row.id">&nbsp;</el-radio></template></el-table-column>
        <el-table-column prop="commissionNo" label="佣金单号" min-width="150" />
        <el-table-column label="收益用户" min-width="170"><template slot-scope="{row}"><div>{{ row.applicantName || '用户不存在' }}</div><div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div></template></el-table-column>
        <el-table-column label="角色" width="120"><template slot-scope="{row}">{{ row.roleName || '身份未配置' }}</template></el-table-column>
        <el-table-column label="来源" width="120"><template slot-scope="{row}">{{ row.sourceTypeText || '未配置' }}</template></el-table-column>
        <el-table-column prop="commissionAmount" label="佣金金额" width="105" />
        <el-table-column label="状态" width="120"><template slot-scope="{row}">{{ row.commissionStatusText || row.statusText || '状态未配置' }}</template></el-table-column>
      </el-table>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" style="margin-top:18px">
        <el-form-item label="冲正类型" prop="reverseType"><el-select v-model="form.reverseType" placeholder="请选择"><el-option v-for="item in reverseTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item label="冲正金额" prop="amount"><el-input v-model="form.amount" type="number" min="0.01" placeholder="输入不超过该记录剩余佣金的金额" /></el-form-item>
        <el-form-item label="冲正原因" prop="reason"><el-input v-model="form.reason" type="textarea" :rows="2" maxlength="255" show-word-limit /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="submitting" @click="submit">确认冲正</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkCommissionRecordList, getJkCommissionReverseList, manualJkCommissionReverse } from '@/api/jkBusiness'
import { jkCommissionReverseTypeOptions } from '@/utils/jk-display'
export default {
  data() { return { list: [], records: [], loading: false, recordLoading: false, dialogVisible: false, submitting: false, form: { commissionRecordId: null, reverseType: 'MANUAL_ADJUST', amount: '', reason: '' }, reverseTypes: jkCommissionReverseTypeOptions, rules: { commissionRecordId: [{ required: true, message: '请选择佣金记录', trigger: 'change' }], reverseType: [{ required: true, message: '请选择冲正类型', trigger: 'change' }], amount: [{ required: true, message: '请输入冲正金额', trigger: 'blur' }], reason: [{ required: true, message: '请输入冲正原因', trigger: 'blur' }] }} },
  created() { this.load() },
  methods: {
    load() { this.loading = true; getJkCommissionReverseList().then(response => { this.list = response.data || response || [] }).finally(() => { this.loading = false }) },
    openCreate() { this.form = { commissionRecordId: null, reverseType: 'MANUAL_ADJUST', amount: '', reason: '' }; this.dialogVisible = true },
    loadRecords() { this.recordLoading = true; Promise.all([getJkCommissionRecordList({ status: 'PENDING_SETTLE' }), getJkCommissionRecordList({ status: 'SETTLED' })]).then(responses => { this.records = (responses[0].data || responses[0] || []).concat(responses[1].data || responses[1] || []) }).finally(() => { this.recordLoading = false }) },
    selectRecord(row) { if (row) this.form.commissionRecordId = row.id },
    submit() { this.$refs.form.validate(valid => { if (!valid) return; this.submitting = true; manualJkCommissionReverse({ commissionRecordId: this.form.commissionRecordId, reverseType: this.form.reverseType, amount: this.form.amount, reason: this.form.reason, requestNo: 'ADMIN_REVERSE_' + Date.now() }).then(() => { this.$message.success('冲正处理成功'); this.dialogVisible = false; this.load() }).finally(() => { this.submitting = false }) }) }
  }
}
</script>
<style scoped>.sub-text{font-size:12px;color:#909399}</style>
