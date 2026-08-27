<template>
  <div class="divBox">
    <el-alert title="商业方案用于统一管理角色、区域、版本和奖励组合。发布版本不可直接编辑；新建方案和模板默认关闭，不会自动生成可提现佣金。" type="warning" :closable="false" show-icon />

    <el-row :gutter="16" class="mt14">
      <el-col v-for="card in roleCards" :key="card.roleCode" :span="8">
        <el-card shadow="never" class="role-card">
          <div slot="header" class="card-header"><strong>{{ card.roleName }}</strong><el-button type="text" @click="createPlan(card)">新建方案草稿</el-button></div>
          <div v-for="reward in card.rewards" :key="reward.templateCode" class="reward-row">
            <div><strong>{{ reward.templateName }}</strong><div class="hint">{{ reward.statusText }}</div></div>
            <el-button size="mini" :type="reward.status === 'PUBLISHED' ? 'success' : 'primary'" plain @click="configureReward(card, reward)">{{ reward.status === 'PUBLISHED' ? '查看规则' : '开启并配置' }}</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="mt14">
      <div slot="header" class="card-header"><strong>商业方案版本</strong><el-button type="primary" size="mini" @click="openForm()">新增方案草稿</el-button></div>
      <el-form :inline="true" size="mini">
        <el-form-item label="方案编码"><el-input v-model.trim="query.planCode" clearable /></el-form-item>
        <el-form-item label="发布状态"><el-select v-model="query.publishStatus" clearable><el-option label="草稿" value="DRAFT" /><el-option label="已发布" value="PUBLISHED" /><el-option label="已停用" value="DISABLED" /></el-select></el-form-item>
        <el-button type="primary" @click="load">查询</el-button>
      </el-form>
      <el-table v-loading="loading" :data="plans" border size="mini">
        <el-table-column prop="planCode" label="方案编码" min-width="140" />
        <el-table-column prop="planName" label="方案名称" min-width="160" />
        <el-table-column prop="versionNo" label="版本" width="75"><template slot-scope="s">V{{ s.row.versionNo }}</template></el-table-column>
        <el-table-column label="适用身份" min-width="180"><template slot-scope="s">{{ listText(s.row.applicableRoleCodes, '未配置') }}</template></el-table-column>
        <el-table-column label="适用区域" min-width="180"><template slot-scope="s">{{ listText(s.row.applicableRegionCodes, '全部区域') }}</template></el-table-column>
        <el-table-column label="生效窗口" min-width="220"><template slot-scope="s">{{ s.row.effectiveStartTime || '尚未发布' }}<br>{{ s.row.effectiveEndTime || (s.row.publishStatus === 'PUBLISHED' ? '长期' : '--') }}</template></el-table-column>
        <el-table-column label="状态" width="110"><template slot-scope="s"><el-tag :type="statusTag(s.row.publishStatus)">{{ statusText(s.row.publishStatus) }}</el-tag></template></el-table-column>
        <el-table-column prop="changeSummary" label="变更摘要" min-width="180"><template slot-scope="s">{{ s.row.changeSummary || '未填写' }}</template></el-table-column>
        <el-table-column label="操作" width="270" fixed="right">
          <template slot-scope="s">
            <el-button type="text" @click="openDetail(s.row)">详情</el-button>
            <el-button v-if="s.row.publishStatus === 'DRAFT'" type="text" @click="openForm(s.row)">编辑</el-button>
            <el-button type="text" @click="copyVersion(s.row)">复制新版本</el-button>
            <el-button v-if="s.row.publishStatus === 'DRAFT'" type="text" @click="openPublish(s.row)">发布</el-button>
            <el-button v-if="s.row.publishStatus === 'PUBLISHED'" type="text" class="danger" @click="disable(s.row)">停用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="form.id ? '编辑商业方案草稿' : '新增商业方案草稿'" :visible.sync="formVisible" width="650px">
      <el-form label-width="110px">
        <el-form-item label="方案编码" required><el-input v-model.trim="form.planCode" :disabled="!!form.id" placeholder="如 MAKER_STANDARD" /></el-form-item>
        <el-form-item label="方案名称" required><el-input v-model.trim="form.planName" /></el-form-item>
        <el-form-item label="适用身份"><el-select v-model="form.applicableRoleCodes" multiple style="width:100%"><el-option label="创客" value="maker" /><el-option label="合伙人" value="partner" /><el-option label="区县代理" value="county_agent" /></el-select></el-form-item>
        <el-form-item label="适用区域"><el-select v-model="form.applicableRegionCodes" multiple filterable remote reserve-keyword :remote-method="searchRegions" :loading="optionLoading" style="width:100%" placeholder="留空表示全部区域"><el-option v-for="x in regionOptions" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="优先级"><el-input-number v-model="form.priority" :min="0" /></el-form-item>
        <el-form-item label="变更摘要"><el-input v-model.trim="form.changeSummary" type="textarea" :rows="3" maxlength="500" show-word-limit /></el-form-item>
        <el-form-item label="备注"><el-input v-model.trim="form.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="formVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存草稿</el-button></span>
    </el-dialog>

    <el-dialog title="发布商业方案版本" :visible.sync="publishVisible" width="580px">
      <el-alert title="发布后本版本不可直接编辑，历史订单不会跟随新版本重算。空方案不能发布。" type="warning" :closable="false" show-icon />
      <el-form label-width="110px" class="mt14">
        <el-form-item label="方案版本">{{ publishRow ? publishRow.planName + ' / V' + publishRow.versionNo : '' }}</el-form-item>
        <el-form-item label="生效时间" required><el-date-picker v-model="publishForm.effectiveStartTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" /></el-form-item>
        <el-form-item label="失效时间"><el-date-picker v-model="publishForm.effectiveEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="留空表示长期" /></el-form-item>
        <el-form-item label="发布说明"><el-input v-model.trim="publishForm.changeSummary" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="publishVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="publish">确认发布</el-button></span>
    </el-dialog>

    <el-drawer title="商业方案详情" :visible.sync="detailVisible" size="760px">
      <div v-loading="detailLoading" class="drawer-body">
        <el-descriptions v-if="detail.plan" :column="2" border size="small">
          <el-descriptions-item label="方案">{{ detail.plan.planName }}</el-descriptions-item><el-descriptions-item label="版本">V{{ detail.plan.versionNo }}</el-descriptions-item>
          <el-descriptions-item label="发布状态">{{ statusText(detail.plan.publishStatus) }}</el-descriptions-item><el-descriptions-item label="优先级">{{ detail.plan.priority }}</el-descriptions-item>
          <el-descriptions-item label="适用身份">{{ listText(detail.plan.applicableRoleCodes, '未配置') }}</el-descriptions-item><el-descriptions-item label="适用区域">{{ listText(detail.plan.applicableRegionCodes, '全部区域') }}</el-descriptions-item>
        </el-descriptions>
        <h4>已配置奖励</h4>
        <el-table :data="detail.rules || []" border size="mini">
          <el-table-column prop="ruleName" label="奖励名称" /><el-table-column prop="templateCode" label="业务模板" /><el-table-column label="状态"><template slot-scope="s">{{ s.row.publishStatus === 'PUBLISHED' ? '已发布' : '草稿 / 关闭' }}</template></el-table-column><el-table-column label="奖励数值"><template slot-scope="s">{{ rewardText(s.row) }}</template></el-table-column>
        </el-table>
        <h4>历史版本</h4>
        <el-timeline><el-timeline-item v-for="v in detail.versions || []" :key="v.id" :timestamp="v.publishedAt || v.createTime">V{{ v.versionNo }} · {{ statusText(v.publishStatus) }} · {{ v.changeSummary || '无变更摘要' }}</el-timeline-item></el-timeline>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getBusinessPlanList, getBusinessPlanDetail, getBusinessPlanRoleCards, saveBusinessPlan, copyBusinessPlan, publishBusinessPlan, disableBusinessPlan, getJkRegionOptions } from '@/api/jkGapfix'
const emptyForm = () => ({ id: null, planCode: '', planName: '', applicableRoleCodes: [], applicableRegionCodes: [], priority: 0, changeSummary: '', remark: '' })
export default {
  data() { return { loading: false, saving: false, optionLoading: false, detailLoading: false, query: { planCode: '', publishStatus: '' }, plans: [], roleCards: [], formVisible: false, form: emptyForm(), publishVisible: false, publishRow: null, publishForm: { effectiveStartTime: '', effectiveEndTime: '', changeSummary: '' }, detailVisible: false, detail: {}, regionOptions: [] } },
  created() { this.load(); this.loadCards() },
  methods: {
    unwrap(r) { return (r && r.data) || r || [] },
    load() { this.loading = true; getBusinessPlanList(this.query).then(r => { this.plans = this.unwrap(r) }).finally(() => { this.loading = false }) },
    loadCards() { getBusinessPlanRoleCards().then(r => { this.roleCards = this.unwrap(r) }) },
    createPlan(card) { this.openForm({ planCode: card.roleCode.toUpperCase() + '_PLAN', planName: card.roleName, applicableRoleCodes: JSON.stringify([card.roleCode]), applicableRegionCodes: '[]', priority: 0 }) },
    configureReward(card, reward) { this.$router.push({ path: '/operation/jzk/commissionRule', query: { ruleId: reward.ruleId || '', roleCode: card.roleCode, templateCode: reward.templateCode }}) },
    openForm(row) { this.form = row ? { id: row.id || null, planCode: row.planCode || '', planName: row.planName || '', applicableRoleCodes: this.parseList(row.applicableRoleCodes), applicableRegionCodes: this.parseList(row.applicableRegionCodes), priority: Number(row.priority || 0), changeSummary: row.changeSummary || '', remark: row.remark || '' } : emptyForm(); this.formVisible = true },
    save() { if (!this.form.planCode || !this.form.planName) return this.$message.warning('请填写方案编码和名称'); this.saving = true; saveBusinessPlan(this.form).then(() => { this.$message.success('商业方案草稿已保存，未发布未启用'); this.formVisible = false; this.load(); this.loadCards() }).finally(() => { this.saving = false }) },
    copyVersion(row) { this.$prompt('请输入新版本变更摘要', '复制为新版本', { inputValue: `从 V${row.versionNo} 复制` }).then(({ value }) => copyBusinessPlan(row.id, value).then(() => { this.$message.success('已复制为新草稿版本'); this.load() })).catch(() => {}) },
    openPublish(row) { this.publishRow = row; this.publishForm = { effectiveStartTime: '', effectiveEndTime: '', changeSummary: row.changeSummary || '' }; this.publishVisible = true },
    publish() { if (!this.publishForm.effectiveStartTime) return this.$message.warning('请选择生效时间'); this.saving = true; publishBusinessPlan({ planId: this.publishRow.id, ...this.publishForm }).then(() => { this.$message.success('方案版本已发布'); this.publishVisible = false; this.load(); this.loadCards() }).finally(() => { this.saving = false }) },
    disable(row) { this.$prompt('请输入停用原因', '停用商业方案', { inputType: 'textarea' }).then(({ value }) => disableBusinessPlan(row.id, value).then(() => { this.$message.success('已停用，只影响后续新业务'); this.load(); this.loadCards() })).catch(() => {}) },
    openDetail(row) { this.detailVisible = true; this.detailLoading = true; this.detail = {}; getBusinessPlanDetail(row.id).then(r => { this.detail = (r && r.data) || r || {} }).finally(() => { this.detailLoading = false }) },
    searchRegions(keyword) { if (!keyword) return; this.optionLoading = true; getJkRegionOptions({ keyword, targetLevel: 3, enabled: true }).then(r => { this.regionOptions = this.unwrap(r) }).finally(() => { this.optionLoading = false }) },
    parseList(value) { if (Array.isArray(value)) return value; if (!value) return []; try { return JSON.parse(value) } catch (e) { return [] } },
    listText(value, empty) { const list = this.parseList(value); return list.length ? list.join('、') : empty },
    statusText(v) { return { DRAFT: '草稿 / 未启用', PUBLISHED: '已发布', DISABLED: '已停用', EXPIRED: '已过期' }[v] || v || '未知' },
    statusTag(v) { return v === 'PUBLISHED' ? 'success' : v === 'DISABLED' ? 'info' : 'warning' },
    rewardText(row) { if (row.publishStatus !== 'PUBLISHED' && row.rate == null && row.fixedAmount == null) return '未配置 / 未发布'; if (row.calculationType === 'PERCENT' || row.calculationType === 'TIER_PERCENT') return row.rate == null ? '未配置' : `${row.rate}%`; return row.fixedAmount == null ? '未配置' : `¥${Number(row.fixedAmount).toFixed(2)}` }
  }
}
</script>
<style scoped>.mt14{margin-top:14px}.card-header{display:flex;align-items:center;justify-content:space-between}.role-card{min-height:310px}.reward-row{display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid #ebeef5}.reward-row:last-child{border-bottom:0}.hint{margin-top:4px;color:#909399;font-size:12px}.danger{color:#f56c6c}.drawer-body{padding:0 22px 30px}h4{margin:22px 0 12px}</style>
