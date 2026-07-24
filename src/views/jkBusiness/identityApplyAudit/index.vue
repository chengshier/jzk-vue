<template>
  <div class="divBox">
    <el-alert
      title="身份申请审核用于处理用户提交的创客、合伙人和区县代申请。审核通过后会生成业务身份及相应库存、收益账户；驳回必须填写明确原因。"
      type="info"
      :closable="false"
    />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">身份申请审核</div>
      <el-form :inline="true" size="mini" class="mb15">
        <el-form-item label="申请人"><el-input v-model.trim="query.keyword" clearable placeholder="姓名 / 昵称 / 手机号 / 申请单号" style="width:240px" @keyup.enter.native="loadData" /></el-form-item>
        <el-form-item label="申请身份">
          <el-select v-model="query.applyRoleCode" clearable placeholder="全部身份" style="width:150px">
            <el-option v-for="item in roleOptions" :key="item.roleCode" :label="item.roleName" :value="item.roleCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="query.auditStatus" clearable placeholder="全部状态" style="width:140px">
            <el-option label="待审核" value="PENDING" />
            <el-option label="已通过" value="EFFECTIVE" />
            <el-option label="已驳回" value="REJECTED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="query.regionCode" clearable filterable remote :remote-method="searchRegions" :loading="regionLoading" placeholder="区域名称/编码" style="width:220px">
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="loadData">查询</el-button><el-button @click="resetQuery">重置</el-button></el-form-item>
      </el-form>

      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="applyNo" label="申请单号" min-width="170" />
        <el-table-column label="申请人" min-width="190">
          <template slot-scope="{ row }"><div>{{ row.applicantName || '用户不存在' }}</div><div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div></template>
        </el-table-column>
        <el-table-column prop="applyRoleName" label="申请身份" width="120" />
        <el-table-column label="审核状态" width="120"><template slot-scope="{ row }"><el-tag size="mini" :type="row.statusTag || 'info'">{{ row.auditStatusText || row.auditStatus }}</el-tag></template></el-table-column>
        <el-table-column label="区域" min-width="150"><template slot-scope="{ row }">{{ row.regionName || row.regionCode || '区域未配置' }}</template></el-table-column>
        <el-table-column prop="applyReason" label="申请原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="rejectReason" label="驳回原因" min-width="180" show-overflow-tooltip />
        <el-table-column label="附件" width="100"><template slot-scope="{ row }"><el-button v-if="certificateLinks(row.certificateFiles).length" type="text" @click="previewRow=row;previewVisible=true">查看{{ certificateLinks(row.certificateFiles).length }}份</el-button><span v-else>--</span></template></el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="showDetail(row)">详情</el-button>
            <template v-if="row.auditStatus === 'PENDING'">
              <el-button size="mini" type="primary" @click="audit(row, 'PASS')">通过</el-button>
              <el-button size="mini" type="danger" @click="audit(row, 'REJECT')">驳回</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="身份申请详情" :visible.sync="detailVisible" width="720px">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="申请单号">{{ detail.applyNo }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ detail.auditStatusText || detail.auditStatus }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detail.applicantName || '--' }} / {{ detail.applicantPhone || '--' }}</el-descriptions-item>
        <el-descriptions-item label="申请身份">{{ detail.applyRoleName || detail.applyRoleCode }}</el-descriptions-item>
        <el-descriptions-item label="申请区域">{{ detail.regionName || detail.regionCode || '--' }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detail.createTime || '--' }}</el-descriptions-item>
        <el-descriptions-item label="申请原因" :span="2">{{ detail.applyReason || '--' }}</el-descriptions-item>
        <el-descriptions-item label="驳回原因" :span="2">{{ detail.rejectReason || '--' }}</el-descriptions-item>
        <el-descriptions-item label="审核备注" :span="2">{{ detail.auditRemark || '--' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog title="申请附件" :visible.sync="previewVisible" width="720px">
      <div class="preview-list">
        <div v-for="(url,index) in certificateLinks(previewRow && previewRow.certificateFiles)" :key="url+index" class="preview-item">
          <el-image :src="url" :preview-src-list="certificateLinks(previewRow && previewRow.certificateFiles)" fit="cover" class="preview-image" />
          <el-link :href="url" target="_blank" type="primary">附件{{ index + 1 }}</el-link>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getJkIdentityApplyList, auditJkIdentityApply, getJkBusinessRoleList, getJkRegionOptions } from '@/api/jkBusiness'

export default {
  data() {
    return {
      listData: { list: [] },
      query: { page: 1, limit: 20, keyword: '', auditStatus: 'PENDING', applyRoleCode: '', regionCode: '' },
      roleOptions: [],
      regionOptions: [],
      regionLoading: false,
      detailVisible: false,
      detail: null,
      previewVisible: false,
      previewRow: null
    }
  },
  mounted() {
    this.loadRoles()
    this.searchRegions('')
    this.loadData()
  },
  methods: {
    loadRoles() {
      getJkBusinessRoleList({ page: 1, limit: 100, enabled: true }).then(res => {
        const data = res && res.data ? res.data : res
        this.roleOptions = (data && data.list) || data || []
      })
    },
    searchRegions(keyword) {
      this.regionLoading = true
      getJkRegionOptions({ keyword: keyword || '', enabled: true }).then(res => {
        this.regionOptions = (res && res.data) || res || []
      }).finally(() => { this.regionLoading = false })
    },
    loadData() {
      getJkIdentityApplyList(this.query).then(res => { this.listData = res || { list: [] } })
    },
    resetQuery() {
      this.query = { page: 1, limit: 20, keyword: '', auditStatus: 'PENDING', applyRoleCode: '', regionCode: '' }
      this.loadData()
    },
    showDetail(row) {
      this.detail = row
      this.detailVisible = true
    },
    audit(row, action) {
      const isReject = action === 'REJECT'
      this.$prompt(isReject ? '请输入明确的驳回原因' : '请输入审核意见', isReject ? '身份申请驳回' : '身份申请通过', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: isReject ? (row.rejectReason || '') : '资料核验通过',
        inputValidator: value => isReject && !String(value || '').trim() ? '驳回原因不能为空' : true
      }).then(({ value }) => {
        const inputValue = String(value || '').trim()
        auditJkIdentityApply({
          applyId: row.id,
          auditAction: action,
          rejectReason: isReject ? inputValue : '',
          auditRemark: isReject ? ('后台审核驳回：' + inputValue) : (inputValue || '后台审核通过')
        }).then(() => {
          this.$message.success('操作成功')
          this.loadData()
        })
      }).catch(() => {})
    },
    certificateLinks(raw) {
      if (!raw) return []
      if (Array.isArray(raw)) return raw.filter(Boolean)
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
      } catch (e) {}
      return String(raw).split(',').map(item => item.trim()).filter(Boolean)
    }
  }
}
</script>
<style scoped>
.mt14{margin-top:14px}.mb15{margin-bottom:15px}.sub-text{color:#909399;font-size:12px}.preview-list{display:flex;flex-wrap:wrap;gap:16px}.preview-item{display:flex;flex-direction:column;gap:6px}.preview-image{width:140px;height:140px;border-radius:6px;border:1px solid #ebeef5}
</style>