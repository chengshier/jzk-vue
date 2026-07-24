<template>
  <div class="app-container">
    <el-alert title="对账只生成差异记录，不会自动修改账户金额；发现差异后必须根据佣金、资金和提现流水人工复核。自动任务默认关闭，真实环境验证后再开启。" type="warning" :closable="false" style="margin-bottom:16px" />
    <div class="filter-container">
      <el-input v-model="query.batchNo" clearable placeholder="对账批次" class="filter-item" style="width:200px"/>
      <el-select v-model="query.userId" clearable filterable remote reserve-keyword :remote-method="searchUsers" :loading="userLoading" placeholder="姓名/手机号搜索用户" class="filter-item" style="width:240px">
        <el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value"/>
      </el-select>
      <el-select v-model="query.status" clearable placeholder="对账状态" class="filter-item" style="width:150px"><el-option label="平衡" value="BALANCED"/><el-option label="存在差异" value="DIFFERENCE"/></el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="success" @click="run">{{ query.userId ? '对选中用户执行对账' : '对全部账户执行对账' }}</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="batchNo" label="批次号" min-width="180"/>
      <el-table-column label="用户" min-width="180"><template slot-scope="{row}">{{row.applicantName||'名称待补充'}} / {{row.applicantPhone||'手机号待补充'}}</template></el-table-column>
      <el-table-column prop="roleName" label="身份" width="100"/>
      <el-table-column label="状态" width="110"><template slot-scope="{row}"><el-tag :type="row.statusTag||'info'">{{row.statusText||row.reconcileStatus}}</el-tag></template></el-table-column>
      <el-table-column prop="pendingDifference" label="待结算差异" width="120"/><el-table-column prop="totalCommissionDifference" label="总佣金差异" width="120"/><el-table-column prop="withdrawingDifference" label="提现中差异" width="120"/><el-table-column prop="withdrawnDifference" label="已提现差异" width="120"/><el-table-column prop="crossAccountDifference" label="跨账户差异" width="120"/>
      <el-table-column prop="issueSummary" label="差异说明" min-width="260" show-overflow-tooltip/><el-table-column prop="reconcileTime" label="对账时间" min-width="160"/>
    </el-table>
  </div>
</template>
<script>
import { getJkAccountReconcileList, runJkAccountReconcile, getJkUserOptions } from '@/api/jkBusiness'
export default {
  data() { return { query: {}, list: [], loading: false, userOptions: [], userLoading: false } },
  created() { this.searchUsers(''); this.load() },
  methods: {
    searchUsers(keyword) { this.userLoading = true; getJkUserOptions({ keyword, limit: 30 }).then(r => { this.userOptions = (r && r.data) || r || [] }).finally(() => { this.userLoading = false }) },
    load() { this.loading = true; getJkAccountReconcileList(this.query).then(r => { this.list = (r && r.list) || (r && r.data && r.data.list) || r.data || r || [] }).finally(() => { this.loading = false }) },
    run() {
      const selected = this.userOptions.find(x => Number(x.value) === Number(this.query.userId))
      const scope = this.query.userId ? `用户“${selected ? selected.label : '当前选中用户'}”` : '全部账户'
      this.$confirm(`将对${scope}执行审计性对账。该操作只记录差异，不会自动修改金额，是否继续？`, '执行账户对账', { type: 'warning' })
        .then(() => runJkAccountReconcile({ userId: this.query.userId || null, requestNo: 'RECON-' + Date.now() }))
        .then(r => { const rows = (r && r.data) || r || []; const diff = rows.filter(x => x.reconcileStatus === 'DIFFERENCE').length; this.$message[diff ? 'warning' : 'success'](`对账完成，差异 ${diff} 条`); this.load() })
    }
  }
}
</script>
