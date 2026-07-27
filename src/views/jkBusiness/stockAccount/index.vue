<template>
  <div class="divBox">
    <el-alert
      title="库存主体用于标识平台、区县代、合伙人和创客各自持有的库存，不在此页面录入或修改库存数量。"
      type="info"
      :closable="false"
    />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">库存主体查询</div>
      <el-form :inline="true" size="mini" class="mb15">
        <el-form-item label="账户类型">
          <el-select v-model="query.accountType" clearable placeholder="全部类型" style="width: 150px">
            <el-option v-for="item in accountTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属身份">
          <el-select v-model="query.roleCode" clearable placeholder="全部身份" style="width: 150px">
            <el-option v-for="item in roleOptions" :key="item.roleCode" :label="item.roleName" :value="item.roleCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属用户">
          <el-select
            v-model="query.ownerUserId"
            clearable
            filterable
            remote
            reserve-keyword
            placeholder="姓名/昵称/手机号"
            :remote-method="searchUsers"
            :loading="userLoading"
            style="width: 230px"
          >
            <el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select
            v-model="query.regionCode"
            clearable
            filterable
            remote
            reserve-keyword
            placeholder="区域名称/编码"
            :remote-method="searchRegions"
            :loading="regionLoading"
            style="width: 220px"
          >
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 120px">
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="accountNo" label="账户编号" min-width="160" />
        <el-table-column label="账户类型" width="140">
          <template slot-scope="{ row }"><span>{{ row.accountTypeText || accountTypeText(row.accountType) }}</span></template>
        </el-table-column>
        <el-table-column label="角色" min-width="120">
          <template slot-scope="{ row }"><div>{{ row.roleName || '身份未配置' }}</div></template>
        </el-table-column>
        <el-table-column label="区域" min-width="150">
          <template slot-scope="{ row }"><div>{{ row.regionName || row.regionCode || '区域未配置' }}</div></template>
        </el-table-column>
        <el-table-column label="所属用户" min-width="200">
          <template slot-scope="{ row }">
            <div>{{ row.ownerName || row.applicantName || '--' }}</div>
            <div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用途说明" min-width="220">
          <template slot-scope="{ row }"><span>{{ usageText(row.accountType) }}</span></template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.statusTag || (row.status ? 'success' : 'info')">{{ row.statusText || (row.status ? '启用' : '停用') }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, prev, pager, next, sizes"
          :current-page="query.page"
          :page-size="query.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="Number(listData.total || 0)"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getJkBusinessRoleList, getJkStockAccountList } from '@/api/jkBusiness'
import { getJkRegionOptions, getJkUserOptions } from '@/api/jkOptions'

export default {
  data() {
    return {
      listData: { list: [], total: 0 },
      query: { page: 1, limit: 20, accountType: '', roleCode: '', ownerUserId: null, regionCode: '', status: null },
      accountTypes: [
        { label: '平台库存', value: 'PLATFORM' },
        { label: '零售库存', value: 'RETAIL' },
        { label: '区县代库存', value: 'COUNTY_AGENT' },
        { label: '合伙人库存', value: 'PARTNER' },
        { label: '创客库存', value: 'MAKER' },
      ],
      roleOptions: [],
      userOptions: [],
      regionOptions: [],
      userLoading: false,
      regionLoading: false,
    }
  },
  mounted() {
    this.loadRoles()
    this.loadData()
  },
  methods: {
    loadData() {
      getJkStockAccountList(this.query).then((res) => {
        this.listData = res || { list: [], total: 0 }
      })
    },
    loadRoles() {
      getJkBusinessRoleList({ page: 1, limit: 100 }).then((res) => {
        const payload = res && res.list ? res : (res && res.data ? res.data : res)
        this.roleOptions = (payload && payload.list) || []
      })
    },
    searchUsers(keyword) {
      this.userLoading = true
      getJkUserOptions({ keyword: keyword || '', limit: 20 }).then((res) => {
        this.userOptions = (res && res.data) || res || []
      }).finally(() => { this.userLoading = false })
    },
    searchRegions(keyword) {
      this.regionLoading = true
      getJkRegionOptions({ keyword: keyword || '', enabled: true }).then((res) => {
        this.regionOptions = (res && res.data) || res || []
      }).finally(() => { this.regionLoading = false })
    },
    search() {
      this.query.page = 1
      this.loadData()
    },
    reset() {
      this.query = { page: 1, limit: 20, accountType: '', roleCode: '', ownerUserId: null, regionCode: '', status: null }
      this.userOptions = []
      this.regionOptions = []
      this.loadData()
    },
    handlePageChange(page) {
      this.query.page = page
      this.loadData()
    },
    handleSizeChange(limit) {
      this.query.limit = limit
      this.query.page = 1
      this.loadData()
    },
    accountTypeText(value) {
      const row = this.accountTypes.find(item => item.value === value)
      return row ? row.label : (value || '--')
    },
    usageText(value) {
      const descriptions = {
        PLATFORM: '平台物理库存镜像，主账来自 CRMEB 商品/SKU，不手工录入',
        RETAIL: '普通商城零售库存视图',
        COUNTY_AGENT: '区县代订货收货后形成的库存',
        PARTNER: '合伙人通过调拨收货形成的库存',
        MAKER: '创客通过调拨收货形成的库存',
      }
      return descriptions[value] || '用于标识库存归属主体'
    },
  },
}
</script>

<style scoped>
.sub-text { color: #909399; font-size: 12px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 18px; }
</style>
