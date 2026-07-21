<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="query.status" clearable placeholder="佣金状态" class="filter-item"><el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" /></el-select>
      <el-select v-model="query.sourceType" clearable placeholder="来源类型" class="filter-item"><el-option v-for="item in sourceTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select>
      <el-select v-model="query.receiverRoleCode" clearable placeholder="收益身份" class="filter-item"><el-option v-for="item in roleOptions" :key="item.roleCode" :label="item.roleName" :value="item.roleCode" /></el-select>
      <el-select v-model="query.receiverUserId" filterable remote clearable placeholder="选择收益用户" :remote-method="searchUsers" :loading="userLoading" class="filter-item user-filter"><el-option v-for="user in userOptions" :key="user.id" :label="user.label" :value="user.id" /></el-select>
      <el-button type="primary" @click="load">查询</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border><el-table-column prop="commissionNo" label="佣金单号" min-width="160" /><el-table-column label="收益用户" min-width="180"><template slot-scope="{row}"><div>{{ row.applicantName || '用户不存在' }}</div><div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div></template></el-table-column><el-table-column label="身份" width="130"><template slot-scope="{row}"><div>{{ row.roleName || '身份未配置' }}</div></template></el-table-column><el-table-column label="来源类型" width="130"><template slot-scope="{row}">{{ row.sourceTypeText || '未配置' }}</template></el-table-column><el-table-column prop="sourceNo" label="来源单据" min-width="140" /><el-table-column prop="baseAmount" label="计算基数" width="105" /><el-table-column prop="commissionAmount" label="佣金金额" width="105" /><el-table-column prop="settledAmount" label="已结算" width="105" /><el-table-column label="状态" width="120"><template slot-scope="{row}"><el-tag size="mini" :type="row.statusTag || 'info'">{{ row.commissionStatusText || row.statusText || '状态未配置' }}</el-tag></template></el-table-column><el-table-column label="操作" width="90" fixed="right"><template slot-scope="{row}"><el-button size="mini" @click="showDetail(row)">详情</el-button></template></el-table-column></el-table>
    <el-dialog title="佣金记录详情" :visible.sync="detailVisible" width="680px"><el-descriptions v-if="detail" :column="2" border><el-descriptions-item label="佣金单号">{{ detail.commissionNo }}</el-descriptions-item><el-descriptions-item label="状态">{{ detail.commissionStatusText || detail.statusText || '状态未配置' }}</el-descriptions-item><el-descriptions-item label="来源类型">{{ detail.sourceTypeText || '未配置' }}</el-descriptions-item><el-descriptions-item label="来源单据">{{ detail.sourceNo }}</el-descriptions-item><el-descriptions-item label="收益用户">{{ detail.applicantName || '用户不存在' }}<span v-if="detail.applicantPhone"> / {{ detail.applicantPhone }}</span></el-descriptions-item><el-descriptions-item label="收益身份">{{ detail.roleName || '身份未配置' }}</el-descriptions-item><el-descriptions-item label="计算基数">{{ detail.baseAmount }}</el-descriptions-item><el-descriptions-item label="佣金金额">{{ detail.commissionAmount }}</el-descriptions-item><el-descriptions-item label="规则快照" :span="2">{{ detail.ruleSnapshotJson || '--' }}</el-descriptions-item></el-descriptions></el-dialog>
  </div>
</template>
<script>
import { getJkCommissionRecordList } from '@/api/jkBusiness'
import { getJkBusinessRoleList } from '@/api/jkBusiness'
import { jkCommissionSourceTypeOptions, jkCommissionStatusOptions } from '@/utils/jk-display'
import { userListApi } from '@/api/user'
export default {
  data() { return { statuses: jkCommissionStatusOptions, sourceTypes: jkCommissionSourceTypeOptions, query: { status: '', sourceType: '', receiverRoleCode: '', receiverUserId: '' }, list: [], loading: false, roleOptions: [], userOptions: [], userLoading: false, detail: null, detailVisible: false } },
  created() { this.loadRoles(); this.load() },
  methods: {
    loadRoles() { getJkBusinessRoleList({ page: 1, limit: 100, enabled: true }).then(response => { this.roleOptions = response.data || response || [] }) },
    searchUsers(keyword) { if (!keyword || !keyword.trim()) { this.userOptions = []; return } this.userLoading = true; userListApi({ keywords: keyword, page: 1, limit: 20 }).then(response => { const users = response.list || response.data || []; this.userOptions = users.map(user => ({ id: user.uid || user.id, label: (user.nickname || user.realName || '用户') + '（' + (user.uid || user.id) + '）' })) }).finally(() => { this.userLoading = false }) },
    load() { this.loading = true; getJkCommissionRecordList(this.query).then(response => { this.list = response.data || response || [] }).finally(() => { this.loading = false }) },
    showDetail(row) { this.detail = row; this.detailVisible = true }
  }
}
</script>
<style scoped>.filter-item{width:150px;margin-right:8px}.user-filter{width:180px}.sub-text{font-size:12px;color:#909399}</style>
