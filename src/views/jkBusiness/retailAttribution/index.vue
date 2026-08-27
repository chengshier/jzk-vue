<template>
  <div class="divBox">
    <el-alert
      title="本页展示下单时固化的不可变归属快照。优先级：有效直属关系 → 个人资料所在地区 → 本单标准收货区县 → 平台默认。已锁定记录只能创建冲正与补偿，不直接覆盖。"
      type="warning" :closable="false" show-icon />

    <el-card shadow="never" class="mt14">
      <el-form :inline="true" size="mini" @submit.native.prevent>
        <el-form-item label="订单号"><el-input v-model.trim="query.orderNo" clearable placeholder="输入订单号" @keyup.enter.native="search" /></el-form-item>
        <el-form-item label="归属来源">
          <el-select v-model="query.regionSourceType" clearable placeholder="全部">
            <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="归属状态">
          <el-select v-model="query.attributionStatus" clearable placeholder="全部">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData.list" border size="mini">
        <el-table-column prop="orderNo" label="订单号" min-width="165" />
        <el-table-column label="商品明细" min-width="170">
          <template slot-scope="{row}"><div>{{ row.productName || ('商品快照 #' + (row.productId || '--')) }}</div><small>{{ row.skuName || ('规格快照 #' + (row.skuId || '--')) }} / ×{{ row.quantity || 0 }}</small></template>
        </el-table-column>
        <el-table-column label="购买人" min-width="135"><template slot-scope="{row}">{{ row.buyerName || ('用户快照 #' + row.buyerUserId) }}</template></el-table-column>
        <el-table-column label="个人资料区域" min-width="150"><template slot-scope="{row}">{{ row.profileRegionName || row.profileRegionCode || '未填写' }}</template></el-table-column>
        <el-table-column label="本单收货区域" min-width="150"><template slot-scope="{row}">{{ row.shippingRegionName || row.shippingRegionCode || '无标准编码' }}</template></el-table-column>
        <el-table-column label="最终归属" min-width="165"><template slot-scope="{row}"><div>{{ row.finalRegionNameSnapshot || row.finalRegionCode || '平台默认' }}</div><el-tag size="mini" :type="sourceTag(row.regionSourceType)">{{ sourceText(row.regionSourceType) }}</el-tag></template></el-table-column>
        <el-table-column label="直属/区县代理" min-width="165"><template slot-scope="{row}"><div>{{ row.directParentName || (row.directParentUserId ? '直属快照 #' + row.directParentUserId : '无直属关系') }}</div><small>{{ row.countyAgentName || (row.countyAgentUserId ? '区县代理快照 #' + row.countyAgentUserId : '未匹配区县代理') }}</small></template></el-table-column>
        <el-table-column label="商品实付" width="105"><template slot-scope="{row}">¥{{ money(row.itemPaidAmount) }}</template></el-table-column>
        <el-table-column label="可计佣基数" width="110"><template slot-scope="{row}">¥{{ money(row.commissionBaseAmount) }}</template></el-table-column>
        <el-table-column label="状态" width="105"><template slot-scope="{row}"><el-tag size="mini" :type="statusTag(row.attributionStatus)">{{ statusText(row.attributionStatus) }}</el-tag><div class="lock-text">{{ row.lockStatus === 'LOCKED' ? '已锁定' : '未锁定' }}</div></template></el-table-column>
        <el-table-column label="操作" width="145" fixed="right"><template slot-scope="{row}"><el-button type="text" @click="openDetail(row)">解释详情</el-button><el-button v-if="canResolve(row)" type="text" @click="openAction(row, false)">处理</el-button><el-button v-else type="text" @click="openAction(row, true)">调整</el-button></template></el-table-column>
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="Number(tableData.total || 0)" :current-page="query.page" :page-size="query.limit" @current-change="pageChanged" />
    </el-card>

    <el-drawer title="零售订单归属解释" :visible.sync="drawerVisible" size="880px">
      <div v-loading="detailLoading" class="drawer-body" v-if="detail">
        <el-alert :title="detail.explain || '暂无解释'" type="info" :closable="false" show-icon />
        <el-tabs v-model="activeTab">
          <el-tab-pane label="归属结论" name="result">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="订单号">{{ attr.orderNo }}</el-descriptions-item><el-descriptions-item label="订单明细">{{ attr.orderInfoId }}</el-descriptions-item>
              <el-descriptions-item label="归属来源">{{ sourceText(attr.regionSourceType) }}</el-descriptions-item><el-descriptions-item label="最终区域">{{ attr.finalRegionNameSnapshot || attr.finalRegionCode || '平台默认' }}</el-descriptions-item>
              <el-descriptions-item label="个人资料区域">{{ attr.profileRegionCode || '未填写' }}</el-descriptions-item><el-descriptions-item label="本单收货区域">{{ attr.shippingRegionCode || '无标准编码' }}</el-descriptions-item>
              <el-descriptions-item label="商品实付">¥{{ money(attr.itemPaidAmount) }}</el-descriptions-item><el-descriptions-item label="可计佣基数">¥{{ money(attr.commissionBaseAmount) }}</el-descriptions-item>
              <el-descriptions-item label="运费处理">不参与佣金</el-descriptions-item><el-descriptions-item label="锁定状态">{{ attr.lockStatus === 'LOCKED' ? '已锁定，只能补偿' : '未锁定' }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="订单与地址" name="address"><json-view :value="jsonValue(attr.shippingAddressSnapshotJson)" /></el-tab-pane>
          <el-tab-pane label="关系快照" name="relation"><json-view :value="jsonValue(attr.relationSnapshotJson)" /></el-tab-pane>
          <el-tab-pane label="区域解析过程" name="region"><json-view :value="jsonValue(attr.regionResolutionSnapshotJson)" /></el-tab-pane>
          <el-tab-pane label="商品实付分摊" name="amount"><json-view :value="jsonValue(attr.priceSnapshotJson)" /></el-tab-pane>
          <el-tab-pane label="退款与调整" name="adjustment">
            <el-timeline v-if="(detail.adjustments || []).length"><el-timeline-item v-for="item in detail.adjustments" :key="item.id" :timestamp="item.createTime"><strong>{{ adjustmentText(item.adjustType) }} / {{ item.status }}</strong><div>{{ item.adjustReason }}</div></el-timeline-item></el-timeline>
            <el-empty v-else description="暂无调整记录" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

    <el-dialog :title="actionMode === 'adjust' ? '创建归属调整/补偿' : '处理待定归属'" :visible.sync="actionVisible" width="620px">
      <el-alert v-if="actionMode === 'adjust' && actionRow && actionRow.lockStatus === 'LOCKED'" title="该记录已锁定。本次只创建待冲正与补偿记录，不直接改变原归属、佣金或资金。" type="warning" :closable="false" show-icon />
      <el-form label-width="120px" class="mt14">
        <el-form-item label="最终区域" required>
          <el-select v-model="actionForm.finalRegionCode" filterable remote clearable reserve-keyword :remote-method="searchRegions" :loading="optionLoading" placeholder="按区域名称搜索，不填写区域编码" style="width:100%" @change="regionChanged">
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="区县代理">
          <el-select v-model="actionForm.countyAgentUserId" :disabled="!actionForm.finalRegionCode" filterable remote clearable reserve-keyword :remote-method="searchCountyAgents" :loading="optionLoading" placeholder="请先选择最终区域，再按姓名或手机号搜索" style="width:100%">
            <el-option v-for="item in countyAgentOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
          </el-select>
          <div class="form-hint">运营选择带姓名和手机号的业务选项，不手填数据库用户 ID。</div>
        </el-form-item>
        <el-form-item label="保留直属关系"><el-switch v-model="actionForm.keepDirectRelation" /></el-form-item>
        <el-form-item label="处理原因" required><el-input v-model.trim="actionForm.reason" type="textarea" :rows="4" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="actionVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="submitAction">确认提交</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { getRetailAttributionList, getRetailAttributionDetail, resolveRetailAttribution, adjustRetailAttribution, getRetailAttributionRegionOptions, getRetailAttributionCountyAgentOptions } from '@/api/jkGapfix'
import { optionList } from '@/utils/jkOptions'

const JsonView = { functional: true, props: { value: { type: [Object, Array, String], default: () => ({}) } }, render(h, ctx) { return h('pre', { class: 'json-view' }, [JSON.stringify(ctx.props.value || {}, null, 2)]) } }

export default {
  components: { JsonView },
  data() {
    return {
      loading: false, detailLoading: false, saving: false, optionLoading: false,
      query: { page: 1, limit: 20, orderNo: '', regionSourceType: '', attributionStatus: '' },
      tableData: { list: [], total: 0 }, drawerVisible: false, detail: null, activeTab: 'result',
      actionVisible: false, actionMode: 'resolve', actionRow: null,
      actionForm: { finalRegionCode: '', countyAgentUserId: null, keepDirectRelation: true, reason: '' },
      regionOptions: [], countyAgentOptions: [],
      sourceOptions: [
        { label: '直属关系快照', value: 'RELATION' }, { label: '个人资料区域', value: 'USER_PROFILE' },
        { label: '本单收货区域兜底', value: 'ORDER_ADDRESS_FALLBACK' }, { label: '平台默认', value: 'PLATFORM_DEFAULT' },
        { label: '人工已处理', value: 'MANUAL_RESOLVED' }
      ],
      statusOptions: [
        { label: '已解析', value: 'RESOLVED' }, { label: '待人工处理', value: 'PENDING_MANUAL' },
        { label: '存在冲突', value: 'CONFLICT' }, { label: '已锁定', value: 'LOCKED' }, { label: '已冲正', value: 'REVERSED' }
      ]
    }
  },
  computed: { attr() { return (this.detail && this.detail.attribution) || {} } },
  created() { this.load() },
  methods: {
    load() { this.loading = true; getRetailAttributionList(this.query).then(res => { const data = res.data || res || {}; this.tableData = { list: data.list || data.records || [], total: data.total || 0 } }).finally(() => { this.loading = false }) },
    search() { this.query.page = 1; this.load() }, reset() { this.query = { page: 1, limit: 20, orderNo: '', regionSourceType: '', attributionStatus: '' }; this.load() },
    pageChanged(page) { this.query.page = page; this.load() },
    openDetail(row) { this.detail = null; this.drawerVisible = true; this.activeTab = 'result'; this.detailLoading = true; getRetailAttributionDetail(row.id).then(res => { this.detail = res.data || res }).finally(() => { this.detailLoading = false }) },
    canResolve(row) { return row.lockStatus !== 'LOCKED' && ['PENDING_MANUAL', 'CONFLICT'].includes(row.attributionStatus) },
    openAction(row, adjust) { this.actionRow = row; this.actionMode = adjust ? 'adjust' : 'resolve'; this.actionForm = { finalRegionCode: row.finalRegionCode || '', countyAgentUserId: row.countyAgentUserId || null, keepDirectRelation: !!row.directParentUserId, reason: '' }; this.regionOptions = row.finalRegionCode ? [{ value: row.finalRegionCode, label: row.finalRegionNameSnapshot || row.finalRegionCode }] : []; this.countyAgentOptions = []; this.actionVisible = true },
    searchRegions(keyword) { if (!keyword || keyword.trim().length < 1) return; this.optionLoading = true; getRetailAttributionRegionOptions({ keyword: keyword.trim() }).then(res => { this.regionOptions = optionList(res) }).finally(() => { this.optionLoading = false }) },
    searchCountyAgents(keyword) { if (!this.actionForm.finalRegionCode) return; this.optionLoading = true; getRetailAttributionCountyAgentOptions({ regionCode: this.actionForm.finalRegionCode, keyword: keyword || '' }).then(res => { this.countyAgentOptions = optionList(res) }).finally(() => { this.optionLoading = false }) },
    regionChanged() { this.actionForm.countyAgentUserId = null; this.searchCountyAgents('') },
    submitAction() {
      if (!this.actionForm.finalRegionCode) return this.$message.warning('请选择最终区域')
      if (!this.actionForm.reason) return this.$message.warning('请输入处理原因')
      const api = this.actionMode === 'adjust' ? adjustRetailAttribution : resolveRetailAttribution
      const payload = { ...this.actionForm, requestNo: `RETAIL-ATTR-${this.actionMode.toUpperCase()}-${this.actionRow.id}-${Date.now()}` }
      this.saving = true
      api(this.actionRow.id, payload).then(() => { this.$message.success(this.actionMode === 'adjust' && this.actionRow.lockStatus === 'LOCKED' ? '已创建待冲正与补偿记录，原快照未覆盖' : '归属处理已保存'); this.actionVisible = false; this.load() }).finally(() => { this.saving = false })
    },
    jsonValue(value) { if (!value) return {}; if (typeof value !== 'string') return value; try { return JSON.parse(value) } catch (e) { return { raw: value } } },
    money(value) { return Number(value || 0).toFixed(2) },
    sourceText(value) { return { RELATION: '直属关系快照', USER_PROFILE: '个人资料区域', ORDER_ADDRESS_FALLBACK: '本单收货区域兜底', PLATFORM_DEFAULT: '平台默认', MANUAL_RESOLVED: '人工已处理' }[value] || value || '未记录' },
    sourceTag(value) { return value === 'RELATION' ? 'success' : value === 'PLATFORM_DEFAULT' ? 'info' : value === 'MANUAL_RESOLVED' ? 'warning' : '' },
    statusText(value) { return { RESOLVED: '已解析', PENDING_MANUAL: '待处理', CONFLICT: '有冲突', LOCKED: '已锁定', REVERSED: '已冲正' }[value] || value || '未知' },
    statusTag(value) { return value === 'RESOLVED' ? 'success' : value === 'PENDING_MANUAL' || value === 'CONFLICT' ? 'warning' : value === 'REVERSED' ? 'info' : '' },
    adjustmentText(value) { return { MANUAL_RESOLVE: '人工处理', UNLOCKED_ADJUST: '未锁定调整', LOCKED_COMPENSATION: '锁定后冲正补偿' }[value] || value }
  }
}
</script>

<style scoped>
.mt14{margin-top:14px}.el-pagination{margin-top:18px;text-align:right}.drawer-body{padding:0 24px 30px}.lock-text,.form-hint,small{margin-top:4px;color:#909399;font-size:12px}.json-view{max-height:520px;margin:0;padding:16px;overflow:auto;background:#f7f8fa;border:1px solid #ebeef5;border-radius:4px;white-space:pre-wrap;word-break:break-all;line-height:1.6}
</style>
