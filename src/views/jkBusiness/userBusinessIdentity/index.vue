<template>
  <div class="divBox">
    <el-alert
      title="业务身份管理用于查看已经生效或历史的九州康身份，并执行冻结、解冻和取消。用户资料仍来自 CRMEB 用户中心，本页不会创建第二套用户。"
      type="info"
      :closable="false"
    />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">业务身份管理</div>
      <el-form :inline="true" size="mini" class="mb15">
        <el-form-item label="用户">
          <el-input v-model.trim="query.keyword" clearable placeholder="姓名 / 昵称 / 手机号" style="width:220px" @keyup.enter.native="loadData" />
        </el-form-item>
        <el-form-item label="身份">
          <el-select v-model="query.roleCode" clearable placeholder="全部身份" style="width:150px">
            <el-option v-for="item in roleOptions" :key="item.roleCode" :label="item.roleName" :value="item.roleCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.auditStatus" clearable placeholder="全部状态" style="width:150px">
            <el-option label="待审核" value="PENDING" />
            <el-option label="已生效" value="EFFECTIVE" />
            <el-option label="已冻结" value="FROZEN" />
            <el-option label="已取消" value="CANCELLED" />
            <el-option label="已驳回" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item label="冻结状态">
          <el-select v-model="query.freezeStatus" clearable placeholder="全部" style="width:130px">
            <el-option label="正常" :value="false" />
            <el-option label="已冻结" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column label="用户" min-width="200">
          <template slot-scope="{ row }">
            <div>{{ row.applicantName || row.userNickname || row.nickname || '用户不存在' }}</div>
            <div class="sub-text">{{ row.userNickname || row.nickname || '--' }} / {{ row.applicantPhone || row.phone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="身份" width="120" />
        <el-table-column label="主身份" width="80"><template slot-scope="{row}">{{ row.isPrimary ? '是' : '否' }}</template></el-table-column>
        <el-table-column label="审核状态" width="120">
          <template slot-scope="{ row }"><el-tag size="mini" :type="row.statusTag || 'info'">{{ row.auditStatusText || row.auditStatus || '状态未配置' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="区域" min-width="150"><template slot-scope="{ row }">{{ row.regionName || row.regionCode || '区域未配置' }}</template></el-table-column>
        <el-table-column label="所属区县代" min-width="120"><template slot-scope="{ row }">{{ row.belongCountyAgentId || '--' }}</template></el-table-column>
        <el-table-column prop="effectiveTime" label="生效时间" min-width="160" />
        <el-table-column label="冻结状态" width="100"><template slot-scope="{ row }"><el-tag size="mini" :type="row.freezeStatus ? 'danger' : 'success'">{{ row.freezeStatus ? '已冻结' : '正常' }}</el-tag></template></el-table-column>
        <el-table-column prop="freezeReason" label="冻结原因" min-width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template slot-scope="{ row }">
            <el-button v-if="!row.freezeStatus && row.auditStatus === 'EFFECTIVE'" size="mini" type="warning" @click="operate(row, 'freeze')">冻结</el-button>
            <el-button v-if="row.freezeStatus" size="mini" type="primary" @click="operate(row, 'unfreeze')">解冻</el-button>
            <el-button v-if="!['CANCELLED','REJECTED'].includes(row.auditStatus)" size="mini" type="danger" @click="operate(row, 'cancel')">取消身份</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
import { getJkBusinessRoleList, getJkUserBusinessRoleList, freezeJkIdentity, unfreezeJkIdentity, cancelJkIdentity } from '@/api/jkBusiness'

export default {
  data() {
    return {
      listData: { list: [] },
      query: { page: 1, limit: 20, keyword: '', roleCode: '', auditStatus: '', freezeStatus: null },
      roleOptions: []
    }
  },
  mounted() {
    this.loadRoles()
    this.loadData()
  },
  methods: {
    loadRoles() {
      getJkBusinessRoleList({ page: 1, limit: 100, enabled: true }).then(res => {
        const data = res && res.data ? res.data : res
        this.roleOptions = (data && data.list) || data || []
      })
    },
    loadData() {
      getJkUserBusinessRoleList(this.query).then(res => { this.listData = res || { list: [] } })
    },
    resetQuery() {
      this.query = { page: 1, limit: 20, keyword: '', roleCode: '', auditStatus: '', freezeStatus: null }
      this.loadData()
    },
    operate(row, action) {
      const config = {
        freeze: { title: '冻结业务身份', label: '请输入冻结原因', api: freezeJkIdentity, success: '身份已冻结' },
        unfreeze: { title: '解冻业务身份', label: '请输入解冻说明', api: unfreezeJkIdentity, success: '身份已解冻' },
        cancel: { title: '取消业务身份', label: '请输入取消原因', api: cancelJkIdentity, success: '身份已取消' }
      }[action]
      const confirm = action === 'cancel' ? '取消后该身份将不能继续参与库存、收益和提现业务，确认继续？' : config.label
      this.$prompt(confirm, config.title, {
        inputPattern: /\S+/,
        inputErrorMessage: '操作原因不能为空',
        confirmButtonText: '确认',
        cancelButtonText: '返回',
        type: action === 'cancel' ? 'warning' : undefined
      }).then(({ value }) => config.api({ userBusinessRoleId: row.id, reason: String(value || '').trim() }).then(() => {
        this.$message.success(config.success)
        this.loadData()
      }))
    }
  }
}
</script>
<style scoped>
.mt14{margin-top:14px}.mb15{margin-bottom:15px}.sub-text{color:#909399;font-size:12px}
</style>
