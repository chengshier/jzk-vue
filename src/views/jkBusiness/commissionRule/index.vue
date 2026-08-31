<template>
  <div class="divBox">
    <el-alert
      title="普通运营只需选择业务奖励模板、受益身份、奖励数值和适用范围。业务来源、受益人解析、计算基数、触发时机和收益性质由模板自动生成；所有新规则默认关闭。"
      type="warning" :closable="false" show-icon />

    <el-row :gutter="14" class="mt14">
      <el-col v-for="template in templates" :key="template.templateCode" :span="8">
        <el-card shadow="hover" class="template-card" :class="{ selected: form.templateCode === template.templateCode }">
          <div class="template-card__title">{{ template.templateName }}</div>
          <div class="template-card__desc">{{ template.description }}</div>
          <div class="template-card__status">默认状态：关闭 / 未发布</div>
          <el-button type="primary" size="mini" plain @click="openTemplate(template)">选择并配置</el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="mt14">
      <div slot="header" class="header-row">
        <div><strong>收益奖励规则</strong><span class="sub-title">仅已发布且处于生效窗口的规则会生成 PLATFORM_PAYABLE</span></div>
        <el-button type="primary" size="mini" @click="openTemplateSelector">新增奖励草稿</el-button>
      </div>
      <el-form :inline="true" size="mini">
        <el-form-item label="受益身份">
          <el-select v-model="query.receiverRoleCode" clearable placeholder="全部身份">
            <el-option label="创客" value="maker"/><el-option label="合伙人" value="partner"/><el-option label="区县代理" value="county_agent"/>
          </el-select>
        </el-form-item>
        <el-form-item label="发布状态">
          <el-select v-model="query.publishStatus" clearable placeholder="全部状态">
            <el-option label="草稿 / 关闭" value="DRAFT"/><el-option label="已发布" value="PUBLISHED"/><el-option label="已停用" value="DISABLED"/>
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="load">查询</el-button>
      </el-form>

      <el-table v-loading="loading" :data="list" border size="mini">
        <el-table-column label="业务奖励" min-width="210">
          <template slot-scope="{row}"><div class="rule-name">{{ row.ruleName }}</div><div class="hint">{{ templateName(row.templateCode) }}</div></template>
        </el-table-column>
        <el-table-column label="商业方案" min-width="170">
          <template slot-scope="{row}">{{ row.planCode || '未关联' }}<span v-if="row.planVersionNo || row.versionNo"> / V{{ row.planVersionNo || row.versionNo }}</span></template>
        </el-table-column>
        <el-table-column label="奖励给谁" width="125"><template slot-scope="{row}">{{ roleName(row.receiverRoleCode) }}</template></el-table-column>
        <el-table-column label="什么时候发奖" min-width="180"><template slot-scope="{row}">{{ scenarioText(row.templateCode) }}</template></el-table-column>
        <el-table-column label="奖励多少" width="135"><template slot-scope="{row}">{{ rewardText(row) }}</template></el-table-column>
        <el-table-column label="封顶与预算" min-width="180"><template slot-scope="{row}">{{ capText(row) }}</template></el-table-column>
        <el-table-column label="发布状态" width="125">
          <template slot-scope="{row}"><el-tag :type="publishTag(row.publishStatus)">{{ publishText(row.publishStatus) }}</el-tag><div class="hint">{{ row.status ? '业务开关开启' : '业务开关关闭' }}</div></template>
        </el-table-column>
        <el-table-column label="生效窗口" min-width="210"><template slot-scope="{row}">{{ row.effectiveStartTime || '未发布' }}<br>{{ row.effectiveEndTime || (row.publishStatus === 'PUBLISHED' ? '长期' : '--') }}</template></el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" @click="showBusinessDetail(row)">业务解释</el-button>
            <el-button type="text" @click="openSourceTrial(row)">按真实单据试算</el-button>
            <el-button v-if="row.publishStatus === 'DRAFT'" type="text" @click="openPublish(row)">发布</el-button>
            <el-button v-if="row.publishStatus === 'PUBLISHED'" type="text" class="danger" @click="disable(row)">停用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="配置业务奖励草稿" :visible.sync="formVisible" width="760px" :close-on-click-modal="false">
      <el-alert v-if="selectedTemplate" :title="selectedTemplate.description" type="info" :closable="false" show-icon />
      <el-form label-width="125px" class="mt14" size="small">
        <el-form-item label="商业方案" required>
          <el-select v-model="form.planId" style="width:100%" placeholder="选择草稿方案版本">
            <el-option v-for="plan in draftPlans" :key="plan.id" :label="`${plan.planName} / V${plan.versionNo}（草稿）`" :value="plan.id"/>
          </el-select>
          <div class="form-hint">奖励规则必须归入商业方案的草稿版本；发布后不可直接改历史版本。</div>
        </el-form-item>
        <el-form-item label="奖励模板" required>
          <el-select v-model="form.templateCode" style="width:100%" @change="templateChanged">
            <el-option v-for="item in templates" :key="item.templateCode" :label="item.templateName" :value="item.templateCode"/>
          </el-select>
        </el-form-item>
        <el-form-item label="规则名称" required><el-input v-model.trim="form.ruleName" maxlength="100" show-word-limit placeholder="例如：创客直属推荐奖励（2026秋季）"/></el-form-item>
        <el-form-item label="奖励给谁" required>
          <el-select v-model="form.receiverRoleCode" style="width:100%">
            <el-option v-for="role in allowedRoles" :key="role" :label="roleName(role)" :value="role"/>
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="奖励方式" required><el-select v-model="form.rewardMode" style="width:100%"><el-option label="按有效金额比例" value="PERCENT"/><el-option v-if="!selectedTemplate || !selectedTemplate.supportsPeriod" label="每单固定金额" value="FIXED_PER_ORDER"/><el-option v-if="!selectedTemplate || !selectedTemplate.supportsPeriod" label="每件固定金额" value="FIXED_PER_ITEM"/></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item :label="form.rewardMode === 'PERCENT' ? '奖励比例(%)' : '奖励金额(元)'" required><el-input-number v-model="form.rewardValue" :min="form.rewardMode === 'PERCENT' ? 0.0001 : 0.01" :precision="form.rewardMode === 'PERCENT' ? 4 : 2" style="width:100%"/><div class="form-hint">必须大于 0；未确定真实数值时不要保存为 0。</div></el-form-item></el-col>
        </el-row>
        <template v-if="selectedTemplate && selectedTemplate.supportsPeriod">
          <el-row :gutter="16">
            <el-col :span="12"><el-form-item label="统计周期" required><el-select v-model="form.periodType" style="width:100%"><el-option label="自然月" value="MONTH"/><el-option label="自然季度" value="QUARTER"/><el-option label="自然年" value="YEAR"/></el-select></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="业绩门槛(元)" required><el-input-number v-model="form.performanceThreshold" :min="0.01" :precision="2" style="width:100%"/></el-form-item></el-col>
          </el-row>
        </template>
        <el-form-item label="适用区域">
          <el-select v-model="form.regionCodes" multiple filterable remote reserve-keyword :remote-method="searchRegions" :loading="optionLoading" style="width:100%" placeholder="留空表示按方案区域，不手填区域编码">
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="单笔封顶(元)"><el-input-number v-model="form.perOrderCap" :min="0.01" :precision="2" style="width:100%"/><div class="form-hint">留空表示不限制</div></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="周期封顶(元)"><el-input-number v-model="form.perUserPeriodCap" :min="0.01" :precision="2" style="width:100%"/><div class="form-hint">留空表示不限制</div></el-form-item></el-col>
        </el-row>
        <el-form-item label="规则总预算(元)"><el-input-number v-model="form.totalBudget" :min="0.01" :precision="2" style="width:100%"/><div class="form-hint">留空表示不限制；预算耗尽后不再生成新的平台应付奖励。</div></el-form-item>
        <el-form-item label="结算等待(天)"><el-input-number v-model="form.settleDelayDays" :min="0" :max="365"/></el-form-item>
        <el-form-item label="备注"><el-input v-model.trim="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit/></el-form-item>
        <el-alert title="保存后只生成关闭状态的草稿，不会自动发布，也不会产生佣金。" type="warning" :closable="false" show-icon/>
      </el-form>
      <span slot="footer"><el-button @click="formVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="saveTemplate">保存草稿</el-button></span>
    </el-dialog>

    <el-dialog title="按真实业务单据试算" :visible.sync="trialVisible" width="760px" :close-on-click-modal="false">
      <el-alert title="只输入真实业务单号。服务端从下单、线下销售、订货、调拨或业绩账本快照加载购买人、销售人、直属上级、区县代理和计算基数；不读取当前关系，不写佣金账户。" type="info" :closable="false" show-icon />
      <el-form label-width="125px" class="mt14">
        <el-form-item label="试算规则"><el-input :value="trialRule ? trialRule.ruleName : ''" disabled/></el-form-item>
        <el-form-item label="真实业务类型" required>
          <el-select v-model="trialForm.sourceType" style="width:100%">
            <el-option label="线上零售订单" value="RETAIL_ORDER"/><el-option label="线下终端销售单" value="OFFLINE_SALE"/><el-option label="平台订货单" value="PLATFORM_ORDER"/><el-option label="库存调拨单" value="STOCK_TRANSFER"/><el-option label="业绩账本记录" value="PERFORMANCE_PERIOD"/>
          </el-select>
        </el-form-item>
        <el-form-item label="业务单号" required><el-input v-model.trim="trialForm.sourceNo" :placeholder="sourcePlaceholder"/><div class="form-hint">填写订单号、销售单号、订货单号、调拨单号或业绩编号，不填写用户 ID。</div></el-form-item>
      </el-form>
      <div v-if="trialPayload" class="trial-source">
        <div class="trial-source__title">已加载：{{ trialPayload.sourceLabel }}</div>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="业务单号">{{ trialPayload.sourceSnapshot.sourceNo }}</el-descriptions-item>
          <el-descriptions-item label="归属区域">{{ trialPayload.sourceSnapshot.regionCode || '平台默认 / 未匹配' }}</el-descriptions-item>
          <el-descriptions-item label="计算基数">¥{{ money(trialPayload.sourceSnapshot.baseAmount) }}</el-descriptions-item>
          <el-descriptions-item label="购买人快照">{{ snapshotLabel(trialPayload.sourceSnapshot.buyerUserId, '无购买人') }}</el-descriptions-item>
          <el-descriptions-item label="销售人快照">{{ snapshotLabel(trialPayload.sourceSnapshot.sellerUserId, '无销售人') }}</el-descriptions-item>
          <el-descriptions-item label="直属上级快照">{{ snapshotLabel(trialPayload.sourceSnapshot.directParentUserId, '无直属关系') }}</el-descriptions-item>
          <el-descriptions-item label="区县代理快照">{{ snapshotLabel(trialPayload.sourceSnapshot.countyAgentUserId, '未匹配区县代理') }}</el-descriptions-item>
          <el-descriptions-item label="商品/SKU">{{ trialPayload.sourceSnapshot.productId || '--' }} / {{ trialPayload.sourceSnapshot.skuId || '--' }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ trialPayload.sourceSnapshot.quantity || 0 }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-table v-if="trialResults.length" :data="trialResults" border size="mini" class="mt14">
        <el-table-column label="匹配结果" width="120"><template slot-scope="{row}"><el-tag :type="row.matchStatus === 'MATCHED' ? 'success' : 'warning'">{{ matchText(row.matchStatus) }}</el-tag></template></el-table-column>
        <el-table-column label="受益人" min-width="150"><template slot-scope="{row}">{{ snapshotLabel(row.beneficiaryUserId, '未解析受益人') }}</template></el-table-column>
        <el-table-column label="计算过程" min-width="210"><template slot-scope="{row}">基数 ¥{{ money(row.baseAmount) }} → 原始 ¥{{ money(row.rawAmount) }} → 封顶后 ¥{{ money(row.cappedAmount) }}</template></el-table-column>
        <el-table-column label="为什么命中/未命中" min-width="260"><template slot-scope="{row}"><div v-if="row.reasonCode">{{ reasonText(row.reasonCode) }}</div><div v-for="(text,index) in row.explanations || []" :key="index" class="hint">{{ text }}</div></template></el-table-column>
      </el-table>
      <el-empty v-else-if="trialExecuted" description="没有匹配结果；当前可能没有已发布规则，或业务快照不满足规则条件"/>
      <el-alert v-if="trialExecuted && !trialHasPayableMatch" class="mt14" title="当前试算没有可支付的命中结果，不能确认发布。请检查业务单据、适用范围和奖励参数。" type="warning" :closable="false" show-icon/>
      <el-checkbox v-if="trialHasPayableMatch" v-model="trialConfirmed" class="trial-confirm">我已核对该真实业务单据的受益人、计算基数和预计奖励，确认试算结果符合预期</el-checkbox>
      <span slot="footer"><el-button @click="trialVisible=false">关闭</el-button><el-button type="primary" :loading="trialLoading" @click="runSourceTrial">加载快照并试算</el-button></span>
    </el-dialog>

    <el-dialog title="发布奖励规则" :visible.sync="publishVisible" width="570px">
      <el-alert title="发布后规则不可直接编辑；仅从生效时间开始匹配新业务，历史订单不会重算。" type="warning" :closable="false" show-icon/>
      <el-alert class="mt14" title="本次发布已绑定当前规则最近一次人工确认的真实业务试算；如果规则或试算条件发生变化，请重新试算确认。" type="success" :closable="false" show-icon/>
      <el-form label-width="110px" class="mt14">
        <el-form-item label="规则">{{ publishRule ? publishRule.ruleName : '' }}</el-form-item>
        <el-form-item label="生效时间" required><el-date-picker v-model="publishForm.effectiveStartTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"/></el-form-item>
        <el-form-item label="失效时间"><el-date-picker v-model="publishForm.effectiveEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="留空表示长期"/></el-form-item>
        <el-form-item label="发布说明" required><el-input v-model.trim="publishForm.remark" type="textarea" :rows="3"/></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="publishVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="publish">确认发布</el-button></span>
    </el-dialog>

    <el-drawer title="奖励规则业务解释" :visible.sync="detailVisible" size="720px">
      <div v-if="detailRule" class="drawer-body">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="为什么发奖励">{{ scenarioText(detailRule.templateCode) }}</el-descriptions-item>
          <el-descriptions-item label="奖励给谁">{{ roleName(detailRule.receiverRoleCode) }}</el-descriptions-item>
          <el-descriptions-item label="按什么计算">{{ baseText(detailRule.templateCode) }}</el-descriptions-item>
          <el-descriptions-item label="奖励多少">{{ rewardText(detailRule) }}</el-descriptions-item>
          <el-descriptions-item label="封顶与预算">{{ capText(detailRule) }}</el-descriptions-item>
          <el-descriptions-item label="收益性质">平台另行支付（PLATFORM_PAYABLE）</el-descriptions-item>
          <el-descriptions-item label="什么时候生效">{{ detailRule.effectiveStartTime || '尚未发布' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ publishText(detailRule.publishStatus) }}</el-descriptions-item>
        </el-descriptions>
        <el-alert class="mt14" title="线下已经实现的经营毛利 OFFLINE_REALIZED 不进入本规则和提现账户。" type="info" :closable="false" show-icon/>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getJkCommissionRuleList } from '@/api/jkBusiness';
import { publishJkCommissionRule, disableJkCommissionRule } from '@/api/jkV31Business';
import { getBusinessPlanList, getCommissionTemplates, saveCommissionTemplateDraft, trialCommissionBySource, getJkRegionOptions } from '@/api/jkGapfix';

const emptyForm = () => ({
  planId: null,
  templateCode: '',
  ruleName: '',
  receiverRoleCode: '',
  rewardMode: 'PERCENT',
  rewardValue: null,
  productIds: [],
  regionCodes: [],
  performanceThreshold: null,
  periodType: 'MONTH',
  perOrderCap: null,
  perUserPeriodCap: null,
  totalBudget: null,
  settleDelayDays: 0,
  remark: '',
});

export default {
  data() {
    return {
      loading: false,
      saving: false,
      optionLoading: false,
      trialLoading: false,
      query: { receiverRoleCode: '', publishStatus: '' },
      list: [],
      templates: [],
      draftPlans: [],
      regionOptions: [],
      formVisible: false,
      form: emptyForm(),
      selectedTemplate: null,
      trialVisible: false,
      trialRule: null,
      trialForm: { sourceType: 'RETAIL_ORDER', sourceNo: '' },
      trialPayload: null,
      trialResults: [],
      trialExecuted: false,
      trialConfirmed: false,
      publishVisible: false,
      publishRule: null,
      publishForm: { effectiveStartTime: '', effectiveEndTime: '', remark: '' },
      detailVisible: false,
      detailRule: null,
    };
  },
  computed: {
    allowedRoles() {
      return this.selectedTemplate && this.selectedTemplate.receiverRoles
        ? this.selectedTemplate.receiverRoles
        : ['maker', 'partner', 'county_agent'];
    },
    sourcePlaceholder() {
      return {
        RETAIL_ORDER: '输入商城订单号',
        OFFLINE_SALE: '输入线下销售单号',
        PLATFORM_ORDER: '输入平台订货单号',
        STOCK_TRANSFER: '输入库存调拨单号',
        PERFORMANCE_PERIOD: '输入业绩编号',
      }[this.trialForm.sourceType] || '输入真实业务单号';
    },
    trialHasPayableMatch() {
      return this.trialResults.some((row) => row.matchStatus === 'MATCHED' && Number(row.cappedAmount || 0) > 0);
    },
  },
  created() {
    this.query.receiverRoleCode = this.$route.query.roleCode || '';
    this.loadTemplates();
    this.loadPlans();
    this.load();
  },
  methods: {
    unwrap(r) { return (r && r.data) || r || []; },
    loadTemplates() {
      getCommissionTemplates({}).then((r) => {
        this.templates = this.unwrap(r);
        const code = this.$route.query.templateCode;
        if (code && !this.$route.query.ruleId) {
          const target = this.templates.find((x) => x.templateCode === code);
          if (target) this.openTemplate(target);
        }
      });
    },
    loadPlans() {
      getBusinessPlanList({ publishStatus: 'DRAFT' }).then((r) => { this.draftPlans = this.unwrap(r); });
    },
    load() {
      this.loading = true;
      getJkCommissionRuleList({ receiverRoleCode: this.query.receiverRoleCode, status: null })
        .then((r) => {
          let rows = this.unwrap(r);
          const ruleId = this.$route.query.ruleId;
          if (ruleId) rows = rows.filter((x) => String(x.id) === String(ruleId));
          if (this.query.publishStatus) rows = rows.filter((x) => x.publishStatus === this.query.publishStatus);
          this.list = rows;
        })
        .finally(() => { this.loading = false; });
    },
    openTemplateSelector() { this.form = emptyForm(); this.selectedTemplate = null; this.formVisible = true; },
    openTemplate(template) {
      this.selectedTemplate = template;
      this.form = emptyForm();
      this.form.templateCode = template.templateCode;
      this.form.receiverRoleCode = (template.receiverRoles || [])[0] || '';
      this.form.ruleName = template.templateName;
      const role = this.$route.query.roleCode;
      if (role && (template.receiverRoles || []).includes(role)) this.form.receiverRoleCode = role;
      this.formVisible = true;
    },
    templateChanged(code) {
      this.selectedTemplate = this.templates.find((x) => x.templateCode === code) || null;
      if (this.selectedTemplate && !this.allowedRoles.includes(this.form.receiverRoleCode)) this.form.receiverRoleCode = this.allowedRoles[0] || '';
      if (this.selectedTemplate) this.form.ruleName = this.form.ruleName || this.selectedTemplate.templateName;
    },
    searchRegions(keyword) {
      if (!keyword) return;
      this.optionLoading = true;
      getJkRegionOptions({ keyword, targetLevel: 3, enabled: true })
        .then((r) => { this.regionOptions = this.unwrap(r); })
        .finally(() => { this.optionLoading = false; });
    },
    saveTemplate() {
      if (!this.form.planId || !this.form.templateCode || !this.form.ruleName || !this.form.receiverRoleCode || this.form.rewardValue === null) return this.$message.warning('请补齐商业方案、奖励模板、规则名称、受益身份和奖励数值');
      if (Number(this.form.rewardValue) <= 0) return this.$message.warning('奖励数值必须大于 0，未配置时不要填写 0');
      if ([this.form.perOrderCap, this.form.perUserPeriodCap, this.form.totalBudget].some((v) => v !== null && v !== undefined && Number(v) <= 0)) return this.$message.warning('封顶和总预算填写后必须大于 0，留空表示不限制');
      if (this.selectedTemplate && this.selectedTemplate.supportsPeriod && (!this.form.periodType || !this.form.performanceThreshold)) return this.$message.warning('周期奖励必须填写统计周期和业绩门槛');
      this.saving = true;
      saveCommissionTemplateDraft(this.form)
        .then(() => {
          this.$message.success('奖励草稿已保存，当前仍为关闭状态');
          this.formVisible = false;
          this.load();
          this.loadPlans();
        })
        .finally(() => { this.saving = false; });
    },
    openSourceTrial(row) {
      this.trialRule = row;
      this.trialForm = { sourceType: row.sourceType || 'RETAIL_ORDER', sourceNo: '' };
      this.trialPayload = null;
      this.trialResults = [];
      this.trialExecuted = false;
      this.trialConfirmed = false;
      this.trialVisible = true;
    },
    runSourceTrial() {
      if (!this.trialForm.sourceNo) return this.$message.warning('请输入真实业务单号');
      this.trialLoading = true;
      this.trialExecuted = false;
      this.trialConfirmed = false;
      trialCommissionBySource({ ruleId: this.trialRule.id, sourceType: this.trialForm.sourceType, sourceNo: this.trialForm.sourceNo })
        .then((r) => {
          this.trialPayload = (r && r.data) || r || {};
          this.trialResults = this.trialPayload.trialResults || [];
          this.trialExecuted = true;
        })
        .finally(() => { this.trialLoading = false; });
    },
    openPublish(row) {
      if (!this.trialConfirmed || !this.trialRule || String(this.trialRule.id) !== String(row.id)) {
        this.$message.warning('请先使用真实业务单据完成试算，并人工核对确认结果后再发布');
        return;
      }
      this.publishRule = row;
      this.publishForm = { effectiveStartTime: '', effectiveEndTime: '', remark: '' };
      this.publishVisible = true;
    },
    publish() {
      if (!this.publishForm.effectiveStartTime) return this.$message.warning('请选择生效时间');
      if (!this.publishForm.remark) return this.$message.warning('请填写发布说明');
      if (!this.trialConfirmed || !this.trialRule || String(this.trialRule.id) !== String(this.publishRule.id)) return this.$message.warning('当前规则没有已人工确认的真实业务试算，请重新试算');
      this.saving = true;
      publishJkCommissionRule({ ruleId: this.publishRule.id, trialConfirmed: true, ...this.publishForm })
        .then(() => {
          this.$message.success('规则已发布，仅影响生效后的新业务');
          this.publishVisible = false;
          this.trialConfirmed = false;
          this.trialRule = null;
          this.load();
        })
        .finally(() => { this.saving = false; });
    },
    disable(row) {
      this.$prompt('请输入停用原因', '停用奖励规则', { inputType: 'textarea' })
        .then(({ value }) => disableJkCommissionRule(row.id, value)
          .then(() => { this.$message.success('规则已停用，只影响后续新业务'); this.load(); }))
        .catch(() => {});
    },
    showBusinessDetail(row) { this.detailRule = row; this.detailVisible = true; },
    roleName(code) { return { maker: '创客', partner: '合伙人', county_agent: '区县代理' }[code] || code || '未配置'; },
    templateName(code) { const t = this.templates.find((x) => x.templateCode === code); return t ? t.templateName : (code || '旧版高级规则'); },
    scenarioText(code) { return { DIRECT_REFERRAL: '有效终端零售完成后奖励下单时直属推荐人', SELF_RETAIL: '经核验的线下终端销售完成后奖励实际销售人', TEAM_MANAGEMENT: '统计周期有效终端销售达到门槛后奖励团队负责人', REGION_MANAGEMENT: '区域内有效终端零售完成后奖励订单快照中的区县代理', PLATFORM_ORDER_SUBSIDY: '平台订货真实入库后按已发布规则补贴', TRANSFER_PLATFORM_SUBSIDY: '库存调拨真实完成后按已发布规则补贴', TIER_REWARD: '统计周期有效终端销售达到阶梯门槛后奖励' }[code] || '按已固化业务快照和已发布规则判断'; },
    baseText(code) { return ['TEAM_MANAGEMENT', 'TIER_REWARD'].includes(code) ? '统计周期有效终端销售业绩' : '商品实付净额（优惠分摊后，不含运费）或模板规定的真实业务基数'; },
    rewardText(row) {
      if (row.rate == null && row.fixedAmount == null && row.unitAmount == null) return '未配置 / 未发布';
      if (['PERCENT', 'TIER_PERCENT'].includes(row.calculationType)) return row.rate == null || Number(row.rate) <= 0 ? '未配置 / 未发布' : `${row.rate}%`;
      const amount = row.fixedAmount != null ? row.fixedAmount : row.unitAmount;
      return amount == null || Number(amount) <= 0 ? '未配置 / 未发布' : `¥${Number(amount).toFixed(2)}`;
    },
    capText(row) {
      const values = [];
      if (row.perOrderCap != null && Number(row.perOrderCap) > 0) values.push(`单笔 ¥${Number(row.perOrderCap).toFixed(2)}`);
      if (row.perUserPeriodCap != null && Number(row.perUserPeriodCap) > 0) values.push(`周期 ¥${Number(row.perUserPeriodCap).toFixed(2)}`);
      if (row.totalBudget != null && Number(row.totalBudget) > 0) values.push(`总预算 ¥${Number(row.totalBudget).toFixed(2)}`);
      return values.length ? values.join(' / ') : '未设置限制';
    },
    publishText(v) { return { DRAFT: '草稿 / 关闭', PUBLISHED: '已发布', DISABLED: '已停用' }[v] || v || '草稿 / 关闭'; },
    publishTag(v) { return v === 'PUBLISHED' ? 'success' : v === 'DISABLED' ? 'info' : 'warning'; },
    snapshotLabel(id, empty) { return id ? `业务快照用户 #${id}` : empty; },
    money(v) { return Number(v || 0).toFixed(2); },
    matchText(v) { return { MATCHED: '命中', NOT_MATCHED: '未命中', EXCLUDED_BY_STACK: '叠加策略排除', NO_ACTIVE_RULE: '无生效规则', NO_PAYABLE_MATCH: '无可支付匹配' }[v] || v; },
    reasonText(v) { return { REGION_NOT_MATCH: '业务区域不匹配', REGISTERED_CUSTOMER_REQUIRED: '要求注册客户', VOUCHER_REQUIRED: '要求真实凭证', AUDIT_REQUIRED: '要求审核通过', BENEFICIARY_NOT_FOUND: '业务快照未解析受益人', BUSINESS_SCOPE_NOT_MATCH: '不在商品、区域或周期门槛范围', CALCULATION_CONFIG_INCOMPLETE: '奖励数值尚未配置' }[v] || v; },
  },
};
</script>

<style scoped>
.mt14{margin-top:14px}.header-row{display:flex;align-items:center;justify-content:space-between}.sub-title{margin-left:12px;color:#909399;font-size:12px}.template-card{min-height:190px;margin-bottom:14px}.template-card.selected{border-color:#409eff}.template-card__title{font-size:16px;font-weight:600}.template-card__desc{min-height:58px;margin:10px 0;color:#606266;font-size:13px;line-height:1.6}.template-card__status{margin-bottom:12px;color:#e6a23c;font-size:12px}.rule-name{font-weight:600}.hint,.form-hint{margin-top:4px;color:#909399;font-size:12px;line-height:1.5}.danger{color:#f56c6c}.trial-source{margin-top:14px}.trial-source__title{margin-bottom:10px;font-weight:600}.trial-confirm{display:block;margin-top:14px}.drawer-body{padding:0 22px 30px}
</style>