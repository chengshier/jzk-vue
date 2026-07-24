<template>
  <div class="divBox">
    <el-alert
      title="异常收货 V1 只记录差异并暂停正常入库。平台完成补发、核对或线下处理后，将业务单恢复为待收货，由收货人重新执行正常全量收货；本页面不会直接修改库存数量。"
      type="warning"
      :closable="false"
    />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header" class="acea-row row-between-wrapper">
        <span>异常收货工作台</span>
        <el-button size="mini" @click="loadData">刷新</el-button>
      </div>

      <el-form :inline="true" size="mini" class="mb15">
        <el-form-item label="业务类型">
          <el-select v-model="query.businessType" clearable placeholder="全部" style="width:140px">
            <el-option label="平台订货" value="PLATFORM_ORDER" />
            <el-option label="库存调拨" value="STOCK_TRANSFER" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width:140px">
            <el-option label="待处理" value="PENDING" />
            <el-option label="处理中" value="PROCESSING" />
            <el-option label="已处理" value="RESOLVED" />
            <el-option label="已驳回" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item label="收货人">
          <el-select
            v-model="query.receiverUserId"
            clearable
            filterable
            remote
            :remote-method="searchUsers"
            :loading="userLoading"
            placeholder="姓名 / 手机号"
            style="width:230px"
          >
            <el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="listData.list" size="mini" border>
        <el-table-column prop="exceptionNo" label="异常单号" min-width="165" />
        <el-table-column label="业务单据" min-width="190">
          <template slot-scope="{ row }">
            <div>{{ row.businessTypeText || businessTypeText(row.businessType) }}</div>
            <div class="sub-text">{{ row.businessNo || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="收货人" min-width="170">
          <template slot-scope="{ row }">
            <div>{{ row.receiverName || '用户不存在' }}</div>
            <div class="sub-text">{{ row.receiverPhone || row.receiverUserId || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="异常类型" width="120">
          <template slot-scope="{ row }">{{ row.exceptionTypeText || exceptionTypeText(row.exceptionType) }}</template>
        </el-table-column>
        <el-table-column label="数量差异" min-width="180">
          <template slot-scope="{ row }">
            <div>应收 {{ row.expectedTotalQty || 0 }} / 实收 {{ row.receivedTotalQty || 0 }}</div>
            <div class="danger-text">短缺 {{ row.shortageTotalQty || 0 }} / 破损 {{ row.damagedTotalQty || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="exceptionReason" label="异常原因" min-width="220" show-overflow-tooltip />
        <el-table-column label="状态" width="110">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.statusTag || statusTag(row.status)">{{ row.statusText || statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="上报时间" min-width="155" />
        <el-table-column label="操作" min-width="245" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" @click="showDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'PENDING'" type="text" @click="handle(row, 'PROCESSING')">受理</el-button>
            <el-button v-if="['PENDING','PROCESSING'].includes(row.status)" type="text" style="color:#67c23a" @click="handle(row, 'RESOLVED')">处理完成</el-button>
            <el-button v-if="['PENDING','PROCESSING'].includes(row.status)" type="text" style="color:#f56c6c" @click="handle(row, 'REJECTED')">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="mt20"
        :current-page="query.page"
        :page-size="query.limit"
        :total="listData.total || 0"
        layout="total, prev, pager, next, jumper"
        @current-change="pageChange"
      />
    </el-card>

    <el-dialog title="异常收货详情" :visible.sync="detailVisible" width="900px">
      <div v-if="detail.exception">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="异常单号">{{ detail.exception.exceptionNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag size="mini" :type="detail.exception.statusTag || statusTag(detail.exception.status)">
              {{ detail.exception.statusText || statusText(detail.exception.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="业务类型">{{ detail.exception.businessTypeText || businessTypeText(detail.exception.businessType) }}</el-descriptions-item>
          <el-descriptions-item label="业务单号">{{ detail.exception.businessNo || '--' }}</el-descriptions-item>
          <el-descriptions-item label="收货人">
            {{ detail.exception.receiverName || '用户不存在' }} / {{ detail.exception.receiverPhone || detail.exception.receiverUserId }}
          </el-descriptions-item>
          <el-descriptions-item label="异常类型">{{ detail.exception.exceptionTypeText || exceptionTypeText(detail.exception.exceptionType) }}</el-descriptions-item>
          <el-descriptions-item label="上报时间">{{ detail.exception.createTime || '--' }}</el-descriptions-item>
          <el-descriptions-item label="处理时间">{{ detail.exception.handleTime || '--' }}</el-descriptions-item>
          <el-descriptions-item label="异常原因" :span="2">{{ detail.exception.exceptionReason || '--' }}</el-descriptions-item>
          <el-descriptions-item label="处理说明" :span="2">{{ detail.exception.handleRemark || '--' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">商品差异</h4>
        <el-table :data="detail.items || []" size="mini" border>
          <el-table-column prop="productName" label="商品" min-width="180" />
          <el-table-column label="SKU" min-width="160">
            <template slot-scope="{ row }">
              <div>{{ row.skuName || '默认规格' }}</div>
              <div class="sub-text">{{ row.skuCode || '--' }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="expectedQty" label="应收" width="80" />
          <el-table-column prop="receivedQty" label="实收" width="80" />
          <el-table-column prop="shortageQty" label="短缺" width="80" />
          <el-table-column prop="damagedQty" label="破损" width="80" />
          <el-table-column prop="itemRemark" label="明细说明" min-width="150" />
        </el-table>

        <template v-if="evidenceUrls.length">
          <h4 class="section-title">异常凭证</h4>
          <div class="evidence-list">
            <el-image
              v-for="url in evidenceUrls"
              :key="url"
              :src="url"
              :preview-src-list="evidenceUrls"
              fit="cover"
              class="evidence-image"
            />
          </div>
        </template>

        <el-alert
          v-if="['PENDING','PROCESSING'].includes(detail.exception.status)"
          title="处理完成或驳回后，系统只会把原业务单恢复为待收货，不会直接产生库存入库。请确认补发、核对或线下处理已完成。"
          type="warning"
          :closable="false"
          class="mt20"
        />
      </div>
      <div slot="footer">
        <el-button @click="detailVisible=false">关闭</el-button>
        <template v-if="detail.exception && ['PENDING','PROCESSING'].includes(detail.exception.status)">
          <el-button v-if="detail.exception.status === 'PENDING'" type="primary" plain @click="handle(detail.exception, 'PROCESSING')">标记处理中</el-button>
          <el-button type="danger" @click="handle(detail.exception, 'REJECTED')">驳回上报</el-button>
          <el-button type="success" @click="handle(detail.exception, 'RESOLVED')">确认处理完成</el-button>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getJkUserOptions } from '@/api/jkBusiness'
import { getJkReceiveExceptionList, getJkReceiveExceptionDetail, handleJkReceiveException } from '@/api/jkReceiveException'

export default {
  data() {
    return {
      query: { page: 1, limit: 20, status: '', businessType: '', receiverUserId: null },
      listData: { list: [], total: 0 },
      loading: false,
      userLoading: false,
      userOptions: [],
      detailVisible: false,
      detail: { exception: null, items: [] },
    }
  },
  computed: {
    evidenceUrls() {
      try {
        return this.detail.exception && this.detail.exception.evidenceJson
          ? JSON.parse(this.detail.exception.evidenceJson)
          : []
      } catch (error) {
        return []
      }
    },
  },
  created() {
    this.searchUsers('')
    this.loadData()
  },
  methods: {
    searchUsers(keyword) {
      this.userLoading = true
      getJkUserOptions({ keyword: keyword || '', limit: 30 })
        .then(res => { this.userOptions = (res && res.data) || res || [] })
        .finally(() => { this.userLoading = false })
    },
    loadData() {
      this.loading = true
      getJkReceiveExceptionList(this.query).then(res => {
        const payload = (res && res.data) || res || {}
        this.listData = { list: payload.list || payload.records || [], total: Number(payload.total || 0) }
      }).finally(() => { this.loading = false })
    },
    search() { this.query.page = 1; this.loadData() },
    reset() {
      this.query = { page: 1, limit: 20, status: '', businessType: '', receiverUserId: null }
      this.loadData()
    },
    pageChange(page) { this.query.page = page; this.loadData() },
    showDetail(row) {
      getJkReceiveExceptionDetail(row.id).then(res => {
        this.detail = (res && res.data) || res || { exception: null, items: [] }
        this.detailVisible = true
      })
    },
    handle(row, action) {
      const titleMap = { PROCESSING: '受理异常', RESOLVED: '确认处理完成', REJECTED: '驳回异常上报' }
      const promptMap = {
        PROCESSING: '请输入受理说明或当前处理安排',
        RESOLVED: '请输入补发、核对或线下处理结果',
        REJECTED: '请输入驳回原因，收货人将重新核对收货',
      }
      this.$prompt(promptMap[action], titleMap[action], {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '处理说明不能为空',
      }).then(({ value }) => {
        return handleJkReceiveException({ exceptionId: row.id, action, remark: value })
      }).then(res => {
        this.$message.success('处理成功')
        const payload = (res && res.data) || res || null
        if (this.detailVisible && payload) this.detail = payload
        this.loadData()
      }).catch(() => {})
    },
    businessTypeText(value) { return value === 'PLATFORM_ORDER' ? '平台订货' : value === 'STOCK_TRANSFER' ? '库存调拨' : value || '--' },
    exceptionTypeText(value) { return { SHORTAGE: '数量短缺', DAMAGED: '商品破损', MIXED: '短缺并破损', OTHER: '其他异常' }[value] || value || '--' },
    statusText(value) { return { PENDING: '待处理', PROCESSING: '处理中', RESOLVED: '已处理', REJECTED: '已驳回' }[value] || value || '--' },
    statusTag(value) { if (value === 'RESOLVED') return 'success'; if (value === 'REJECTED') return 'danger'; if (value === 'PROCESSING') return 'info'; return 'warning' },
  },
}
</script>

<style scoped>
.section-title{margin:20px 0 10px}.sub-text{color:#909399;font-size:12px}.danger-text{margin-top:4px;color:#f56c6c;font-size:12px}.evidence-list{display:flex;flex-wrap:wrap;gap:12px}.evidence-image{width:110px;height:110px;border:1px solid #ebeef5;border-radius:6px}
</style>
