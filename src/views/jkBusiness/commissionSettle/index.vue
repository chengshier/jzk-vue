<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="status" clearable placeholder="结算状态" class="filter-item" style="width:150px"><el-option label="待结算" value="PENDING_SETTLE" /><el-option label="已结算" value="SETTLED" /><el-option label="可提现" value="AVAILABLE" /></el-select>
      <el-button type="primary" @click="loadRecords">查询待结算佣金</el-button>
      <el-button type="success" :disabled="!selected.length" @click="settle">结算选中记录</el-button>
      <el-button type="warning" :loading="autoLoading" @click="autoSettle">立即结算全部到期佣金</el-button>
    </div>
    <el-alert title="仅可同时结算同一用户、同一身份的待结算佣金；通过勾选列表选择，不允许手填记录 ID。" type="info" :closable="false" style="margin-bottom:16px" />
    <el-table v-loading="loading" :data="records" border @selection-change="selected=$event">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="commissionNo" label="佣金单号" min-width="160" />
      <el-table-column label="用户" min-width="180"><template slot-scope="{row}"><div>{{ row.applicantName || '用户不存在' }}</div><div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div></template></el-table-column>
      <el-table-column label="身份" width="120"><template slot-scope="{row}">{{ row.roleName || '身份未配置' }}</template></el-table-column>
      <el-table-column label="来源" width="130"><template slot-scope="{row}">{{ row.sourceTypeText || '未配置' }}</template></el-table-column>
      <el-table-column prop="sourceNo" label="来源单据" min-width="140" />
      <el-table-column prop="commissionAmount" label="佣金金额" width="120" />
      <el-table-column label="状态" width="120"><template slot-scope="{row}">{{ row.commissionStatusText || row.statusText || '状态未配置' }}</template></el-table-column>
    </el-table>
    <h3 style="margin-top:24px">结算任务</h3>
    <el-table :data="tasks" border><el-table-column prop="taskNo" label="任务号" min-width="160" /><el-table-column label="状态"><template slot-scope="{row}"><el-tag size="mini" :type="row.statusTag || 'info'">{{ row.statusText || '状态未配置' }}</el-tag></template></el-table-column><el-table-column prop="totalCount" label="总数" /><el-table-column prop="successCount" label="成功" /><el-table-column prop="failReason" label="失败原因" min-width="180" /><el-table-column prop="createTime" label="创建时间" min-width="160" /></el-table>
  </div>
</template>
<script>
import { getJkCommissionRecordList, getJkCommissionSettleTaskList, settleJkCommissionRecords, triggerJkAutoSettle } from '@/api/jkBusiness'
export default { data() { return { status: 'PENDING_SETTLE', records: [], tasks: [], selected: [], loading: false, autoLoading: false } }, created() { this.loadRecords(); this.loadTasks() }, methods: { loadRecords() { this.loading = true; getJkCommissionRecordList({ status: this.status }).then(r => { this.records = r.data || r || [] }).finally(() => { this.loading = false }) }, loadTasks() { getJkCommissionSettleTaskList().then(r => { this.tasks = r.data || r || [] }) }, settle() { const ids = this.selected.map(x => x.id); this.$prompt('请输入本次结算请求号（不可重复）', '确认结算', { inputPattern: /\S+/, inputErrorMessage: '请求号不能为空' }).then(({ value }) => settleJkCommissionRecords({ commissionRecordIds: ids, requestNo: value }).then(() => { this.$message.success('结算任务已提交'); this.loadRecords(); this.loadTasks() })) }, autoSettle() { this.$confirm('将立即扫描并结算所有已结束冻结期的待结算佣金，未到期记录不会处理。确认继续？', '自动结算', { type: 'warning' }).then(() => { this.autoLoading = true; return triggerJkAutoSettle({ limit: 500, triggerNo: 'ADMIN-' + Date.now() }) }).then(r => { const count = r && r.data !== undefined ? r.data : r; this.$message.success('自动结算完成，处理记录数：' + (count || 0)); this.loadRecords(); this.loadTasks() }).finally(() => { this.autoLoading = false }) } }}
</script>
<style scoped>.sub-text{font-size:12px;color:#909399}</style>
