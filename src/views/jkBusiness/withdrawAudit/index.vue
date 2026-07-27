<template>
  <div class="app-container">
    <el-alert title="银行卡完整卡号仅在确认线下打款时按单查看；列表和普通详情不返回明文或密文快照。" type="info" :closable="false" style="margin-bottom:16px" />
    <div class="filter-container">
      <el-select v-model="query.status" clearable placeholder="提现状态" class="filter-item"><el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" /></el-select>
      <el-select v-model="query.roleCode" clearable placeholder="收益身份" class="filter-item"><el-option v-for="item in roleOptions" :key="item.roleCode" :label="item.roleName" :value="item.roleCode" /></el-select><el-select v-model="query.userId" filterable remote clearable placeholder="选择用户" :remote-method="searchUsers" :loading="userLoading" class="filter-item user-filter"><el-option v-for="user in userOptions" :key="user.id" :label="user.label" :value="user.id" /></el-select><el-button type="primary" @click="load">查询</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="withdrawNo" label="提现单号" min-width="170" />
      <el-table-column label="申请用户" min-width="180"><template slot-scope="{row}"><div>{{ row.applicantName || '用户不存在' }}</div><div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div></template></el-table-column>
      <el-table-column label="身份" width="140"><template slot-scope="{row}"><div>{{ row.roleName || '身份未配置' }}</div></template></el-table-column>
      <el-table-column prop="amount" label="申请金额" width="120" />
      <el-table-column label="状态" width="130"><template slot-scope="{row}"><el-tag size="mini" :type="row.statusTag || 'info'">{{ row.withdrawStatusText || row.statusText || '状态未配置' }}</el-tag></template></el-table-column>
      <el-table-column prop="rejectReason" label="驳回原因" min-width="160" />
      <el-table-column prop="createTime" label="申请时间" width="170" />
      <el-table-column label="操作" width="280" fixed="right"><template slot-scope="{row}">
        <el-button size="mini" @click="showDetail(row)">详情</el-button>
        <el-button v-if="['SUBMITTED','AUDITING'].includes(row.status)" size="mini" type="success" @click="audit(row, true)">审核通过</el-button>
        <el-button v-if="['SUBMITTED','AUDITING'].includes(row.status)" size="mini" type="warning" @click="audit(row, false)">驳回</el-button>
        <el-button v-if="row.status === 'APPROVED'" size="mini" type="primary" @click="confirmPaid(row)">确认打款</el-button>
      </template></el-table-column>
    </el-table>
    <el-dialog title="提现详情" :visible.sync="detailVisible" width="640px" @closed="resetDetail">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="提现单号">{{ detail.withdrawNo }}</el-descriptions-item><el-descriptions-item label="状态">{{ detail.withdrawStatusText || detail.statusText || '未配置' }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.applicantName || '用户不存在' }}<span v-if="detail.applicantPhone"> / {{ detail.applicantPhone }}</span></el-descriptions-item><el-descriptions-item label="身份">{{ detail.roleName || '身份未配置' }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ detail.amount }}</el-descriptions-item><el-descriptions-item label="申请时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="驳回原因" :span="2">{{ detail.rejectReason || '--' }}</el-descriptions-item>
        <el-descriptions-item label="收款信息" :span="2">
          <div v-if="payee"><div>{{ payee.accountName }} / {{ payee.bankName }}</div><div class="bank-account">{{ payee.bankAccount }}</div></div>
          <el-button v-else size="mini" type="primary" plain :loading="payeeLoading" @click="revealPayee">查看完整收款账户</el-button>
          <span v-if="!payee" class="security-tip">仅具备确认打款权限的管理员可查看</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>
<script>
import { auditJkWithdraw, confirmJkWithdrawPaid, getJkBusinessRoleList, getJkWithdrawList } from '@/api/jkBusiness'
import { getJkWithdrawPayee } from '@/api/jkWithdraw'
import { jkWithdrawStatusOptions } from '@/utils/jk-display'
import { userListApi } from '@/api/user'
export default {
  data() { return { statuses: jkWithdrawStatusOptions, roleOptions: [], query: { status: '', roleCode: '', userId: '' }, list: [], loading: false, userOptions: [], userLoading: false, detail: null, detailVisible: false, payee: null, payeeLoading: false } },
  created() { this.loadRoles(); this.load() },
  methods: {
    loadRoles() { getJkBusinessRoleList({ page: 1, limit: 100, enabled: true }).then(res => { this.roleOptions = res.data || res || [] }) },
    load() { this.loading = true; getJkWithdrawList(this.query).then(response => { this.list = response.data || response || [] }).finally(() => { this.loading = false }) },
    searchUsers(keyword) { if (!keyword || !keyword.trim()) { this.userOptions = []; return } this.userLoading = true; userListApi({ keywords: keyword, page: 1, limit: 20 }).then(response => { const users = response.list || response.data || []; this.userOptions = users.map(user => ({ id: user.uid || user.id, label: (user.nickname || user.realName || '用户') + '（' + (user.uid || user.id) + '）' })) }).finally(() => { this.userLoading = false }) },
    showDetail(row) { this.detail = row; this.payee = null; this.detailVisible = true },
    resetDetail() { this.detail = null; this.payee = null },
    revealPayee() { if (!this.detail) return; this.payeeLoading = true; getJkWithdrawPayee(this.detail.id).then(res => { this.payee = res.data || res || null }).catch(() => { this.$message.error('无权查看或收款账户快照不可解密') }).finally(() => { this.payeeLoading = false }) },
    audit(row, approved) { const title = approved ? '审核通过提现申请' : '驳回提现申请'; const inputValue = approved ? '审核通过，等待线下打款' : ''; this.$prompt(approved ? '请输入审核备注' : '请输入驳回原因', title, { inputValue, inputPattern: /\S+/, inputErrorMessage: approved ? '审核备注不能为空' : '驳回原因不能为空' }).then(({ value }) => auditJkWithdraw({ id: row.id, approved, requestNo: 'WITHDRAW_AUDIT_' + Date.now(), remark: value }).then(() => { this.$message.success('审核操作成功'); this.load() })) },
    confirmPaid(row) { this.$confirm('请先在详情中核对完整收款账户。确认已完成线下打款？该操作会扣减冻结金额且不能撤销。', '确认线下打款', { type: 'warning' }).then(() => confirmJkWithdrawPaid({ id: row.id, requestNo: 'WITHDRAW_PAID_' + Date.now(), remark: '后台确认线下打款' }).then(() => { this.$message.success('已确认打款'); this.load() })) }
  }
}
</script>
<style scoped>.filter-item{width:160px;margin-right:8px}.sub-text{font-size:12px;color:#909399}.security-tip{margin-left:10px;color:#909399;font-size:12px}.bank-account{margin-top:6px;font-size:18px;font-weight:600;letter-spacing:1px}</style>
