<template>
  <div class="app-container">
    <el-alert title="换绑只影响后续新业务，历史订单归属不变。审核通过前系统会再次校验未完成调拨、库存余额、待结算佣金和处理中提现。" type="info" :closable="false" style="margin-bottom:16px" />
    <div class="filter-container">
      <el-select v-model="query.userId" clearable filterable remote :remote-method="searchUsers" :loading="userLoading" placeholder="申请人姓名/手机号" class="filter-item" style="width:240px">
        <el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
      </el-select>
      <el-select v-model="query.status" clearable placeholder="状态" class="filter-item" style="width:140px">
        <el-option label="待审核" value="PENDING"/><el-option label="已通过" value="APPROVED"/><el-option label="已驳回" value="REJECTED"/><el-option label="已取消" value="CANCELLED"/>
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="applyNo" label="申请单号" min-width="170"/>
      <el-table-column label="申请人" min-width="180"><template slot-scope="{row}"><div>{{row.userName||'--'}}</div><div class="sub-text">{{row.userPhone||row.userId}}</div></template></el-table-column>
      <el-table-column prop="currentParentName" label="当前上级" min-width="130"/>
      <el-table-column prop="targetParentName" label="目标上级" min-width="130"/>
      <el-table-column prop="applyReason" label="换绑原因" min-width="190" show-overflow-tooltip/>
      <el-table-column label="状态" width="100"><template slot-scope="{row}"><el-tag size="mini" :type="row.statusTag||statusTag(row.status)">{{row.statusText||row.status}}</el-tag></template></el-table-column>
      <el-table-column prop="createTime" label="申请时间" min-width="160"/>
      <el-table-column label="操作" width="190" fixed="right">
        <template slot-scope="{row}">
          <el-button type="text" @click="showDetail(row)">详情</el-button>
          <template v-if="row.status==='PENDING'">
            <el-button type="text" @click="audit(row,true)">通过</el-button>
            <el-button type="text" style="color:#f56c6c" @click="audit(row,false)">驳回</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="换绑申请详情" :visible.sync="detailVisible" width="680px">
      <el-descriptions v-if="detail" :column="2" border size="small">
        <el-descriptions-item label="申请单号">{{ detail.applyNo || '--' }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag size="mini" :type="detail.statusTag||statusTag(detail.status)">{{ detail.statusText||detail.status }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detail.userName || '--' }} / {{ detail.userPhone || detail.userId }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detail.createTime || '--' }}</el-descriptions-item>
        <el-descriptions-item label="当前上级">{{ detail.currentParentName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="目标上级">{{ detail.targetParentName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="换绑原因" :span="2">{{ detail.applyReason || '--' }}</el-descriptions-item>
        <el-descriptions-item label="审核备注" :span="2">{{ detail.auditRemark || detail.rejectReason || '--' }}</el-descriptions-item>
      </el-descriptions>
      <el-alert
        v-if="detail && detail.status==='PENDING'"
        title="点击通过时，后端会实时重新检查库存、未完成调拨、待结算佣金和处理中提现；存在任一阻断项时不会完成换绑。"
        type="warning"
        :closable="false"
        style="margin-top:16px"
      />
      <div slot="footer">
        <el-button @click="detailVisible=false">关闭</el-button>
        <template v-if="detail && detail.status==='PENDING'">
          <el-button type="danger" @click="audit(detail,false)">驳回</el-button>
          <el-button type="primary" @click="audit(detail,true)">通过并重新校验</el-button>
        </template>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getJkRelationChangeList, getJkRelationChangeDetail, auditJkRelationChange, getJkUserOptions } from '@/api/jkBusiness'
export default {
  data() {
    return { query: {}, list: [], loading: false, userOptions: [], userLoading: false, detailVisible: false, detail: null }
  },
  created() { this.searchUsers(''); this.load() },
  methods: {
    searchUsers(keyword) {
      this.userLoading = true
      getJkUserOptions({ keyword: keyword || '', limit: 30 }).then(res => { this.userOptions = (res && res.data) || res || [] }).finally(() => { this.userLoading = false })
    },
    load() {
      this.loading = true
      getJkRelationChangeList(this.query).then(res => { this.list = (res && res.list) || (res && res.data && res.data.list) || res.data || res || [] }).finally(() => { this.loading = false })
    },
    reset() { this.query = {}; this.load() },
    showDetail(row) {
      getJkRelationChangeDetail(row.id).then(res => {
        this.detail = (res && res.data) || res || null
        this.detailVisible = true
      })
    },
    audit(row, approved) {
      this.$prompt(approved ? '请输入审核备注' : '请输入驳回原因', approved ? '通过换绑' : '驳回换绑', { inputPattern: /\S+/, inputErrorMessage: '不能为空' })
        .then(({ value }) => auditJkRelationChange({ applyId: row.id, approved, remark: value, requestNo: 'REL-AUDIT-' + Date.now() }))
        .then(() => {
          this.$message.success('处理完成')
          this.detailVisible = false
          this.load()
        })
    },
    statusTag(status) {
      if (status === 'APPROVED') return 'success'
      if (status === 'REJECTED' || status === 'CANCELLED') return 'danger'
      return 'warning'
    },
  },
}
</script>
<style scoped>
.sub-text{color:#909399;font-size:12px}.filter-item{margin-right:10px}
</style>
