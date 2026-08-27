<template>
  <div class="divBox">
    <el-alert title="周期业绩只汇总有效线上零售订单和经核验的线下终端销售。平台订货、库存调拨和线下已实现经营毛利不会直接计入团队销售奖励。" type="warning" :closable="false" show-icon />
    <el-card shadow="never" class="mt14">
      <div slot="header" class="header-row"><strong>周期业绩与阶梯奖励</strong><el-button type="primary" size="mini" @click="openBuild">构建周期</el-button></div>
      <el-form :inline="true" size="mini">
        <el-form-item label="周期"><el-select v-model="query.periodType" clearable><el-option label="月度" value="MONTH"/><el-option label="季度" value="QUARTER"/><el-option label="年度" value="YEAR"/><el-option label="自定义" value="CUSTOM"/></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option label="草稿" value="DRAFT"/><el-option label="待审核" value="PENDING_REVIEW"/><el-option label="已关闭锁定" value="CLOSED"/></el-select></el-form-item>
        <el-button type="primary" @click="load">查询</el-button>
      </el-form>
      <el-table v-loading="loading" :data="list" border size="mini">
        <el-table-column prop="periodNo" label="周期编号" min-width="155" />
        <el-table-column label="周期范围" min-width="220"><template slot-scope="{row}">{{ row.startTime }}<br>{{ row.endTime }}</template></el-table-column>
        <el-table-column label="统计口径" min-width="160"><template slot-scope="{row}">{{ periodText(row.periodType) }} / {{ roleText(row.ownerRoleCode) }}<div class="hint">{{ row.regionCode || '全部区域' }}</div></template></el-table-column>
        <el-table-column prop="memberCount" label="成员数" width="80" />
        <el-table-column label="有效业绩" width="120"><template slot-scope="{row}">¥{{ money(row.netPerformanceAmount) }}</template></el-table-column>
        <el-table-column label="退款冲减" width="110"><template slot-scope="{row}">¥{{ money(row.totalRefundAmount) }}</template></el-table-column>
        <el-table-column label="试算奖励" width="110"><template slot-scope="{row}">{{ row.trialRewardAmount == null ? '未试算' : '¥' + money(row.trialRewardAmount) }}</template></el-table-column>
        <el-table-column label="已生成奖励" width="120"><template slot-scope="{row}">{{ row.status === 'CLOSED' ? '¥' + money(row.approvedRewardAmount) : '尚未关闭' }}</template></el-table-column>
        <el-table-column label="状态" width="105"><template slot-scope="{row}"><el-tag :type="statusTag(row.status)">{{ statusText(row.status) }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" @click="openDetail(row)">贡献与奖励</el-button>
            <el-button v-if="row.status !== 'CLOSED'" type="text" @click="trial(row)">试算</el-button>
            <el-button v-if="row.status === 'PENDING_REVIEW'" type="text" @click="closePeriod(row)">审核关闭</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="构建周期业绩" :visible.sync="buildVisible" width="680px" :close-on-click-modal="false">
      <el-alert title="构建只复制业务发生时已固化的业绩和关系快照，不读取当前上下级关系；构建后先试算、再审核关闭。" type="info" :closable="false" show-icon />
      <el-form label-width="120px" class="mt14">
        <el-form-item label="周期类型" required><el-select v-model="buildForm.periodType" style="width:100%"><el-option label="月度" value="MONTH"/><el-option label="季度" value="QUARTER"/><el-option label="年度" value="YEAR"/><el-option label="自定义" value="CUSTOM"/></el-select></el-form-item>
        <el-form-item label="统计时间" required><el-date-picker v-model="buildRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%"/></el-form-item>
        <el-form-item label="商业方案"><el-select v-model="buildForm.planId" clearable style="width:100%" placeholder="留空表示不按方案过滤"><el-option v-for="plan in planOptions" :key="plan.id" :label="`${plan.planName} / V${plan.versionNo} / ${publishText(plan.publishStatus)}`" :value="plan.id"/></el-select></el-form-item>
        <el-form-item label="受益身份"><el-select v-model="buildForm.ownerRoleCode" clearable style="width:100%" placeholder="全部业务身份"><el-option label="创客" value="maker"/><el-option label="合伙人" value="partner"/><el-option label="区县代理" value="county_agent"/></el-select></el-form-item>
        <el-form-item label="区域范围"><el-select v-model="buildForm.regionCode" clearable filterable remote reserve-keyword :remote-method="searchRegions" :loading="optionLoading" style="width:100%" placeholder="按名称搜索，留空表示全部区域"><el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value"/></el-select></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="buildVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="build">构建草稿</el-button></span>
    </el-dialog>

    <el-drawer title="周期贡献、试算和奖励结果" :visible.sync="detailVisible" size="880px">
      <div class="drawer-body" v-loading="detailLoading">
        <el-alert v-if="detail.period" :title="detail.period.status === 'CLOSED' ? '该周期已审核关闭并锁定，后续异常只能通过退款冲正或补偿处理。' : '当前周期尚未关闭，试算不会写入佣金账户。'" :type="detail.period.status === 'CLOSED' ? 'success' : 'info'" :closable="false" show-icon />
        <el-tabs v-model="activeTab" class="mt14">
          <el-tab-pane label="周期概览" name="overview">
            <el-descriptions v-if="detail.period" :column="3" border size="small">
              <el-descriptions-item label="周期编号">{{ detail.period.periodNo }}</el-descriptions-item><el-descriptions-item label="有效业绩">¥{{ money(detail.period.netPerformanceAmount) }}</el-descriptions-item><el-descriptions-item label="退款冲减">¥{{ money(detail.period.totalRefundAmount) }}</el-descriptions-item>
              <el-descriptions-item label="成员数">{{ detail.period.memberCount }}</el-descriptions-item><el-descriptions-item label="试算奖励">¥{{ money(detail.period.trialRewardAmount) }}</el-descriptions-item><el-descriptions-item label="真实奖励">{{ detail.period.status === 'CLOSED' ? '¥' + money(detail.period.approvedRewardAmount) : '尚未生成' }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="成员贡献" name="owners">
            <el-table :data="detail.ownerSummary || []" border size="mini"><el-table-column label="成员"><template slot-scope="{row}">{{ row.ownerName || ('业务快照成员 #' + row.ownerUserId) }}</template></el-table-column><el-table-column prop="recordCount" label="有效记录" width="100"/><el-table-column label="净业绩"><template slot-scope="{row}">¥{{ money(row.netPerformanceAmount) }}</template></el-table-column></el-table>
          </el-tab-pane>
          <el-tab-pane label="来源明细" name="items">
            <el-table :data="detail.items || []" border size="mini"><el-table-column prop="sourceType" label="来源"/><el-table-column prop="sourceId" label="业务快照"/><el-table-column label="业绩"><template slot-scope="{row}">¥{{ money(row.performanceAmount) }}</template></el-table-column><el-table-column label="退款"><template slot-scope="{row}">¥{{ money(row.refundAmount) }}</template></el-table-column><el-table-column label="净额"><template slot-scope="{row}">¥{{ money(row.netAmount) }}</template></el-table-column></el-table>
          </el-tab-pane>
          <el-tab-pane label="奖励结果" name="rewards">
            <el-table :data="detail.rewards || []" border size="mini"><el-table-column label="受益成员"><template slot-scope="{row}">{{ row.ownerName || ('业务快照成员 #' + row.ownerUserId) }}</template></el-table-column><el-table-column label="有效业绩"><template slot-scope="{row}">¥{{ money(row.performanceAmount) }}</template></el-table-column><el-table-column label="批准奖励"><template slot-scope="{row}">¥{{ money(row.approvedRewardAmount) }}</template></el-table-column><el-table-column prop="status" label="结果"/></el-table>
            <el-empty v-if="!(detail.rewards || []).length" description="尚未审核关闭，未生成真实奖励"/>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

    <el-dialog title="周期奖励试算结果" :visible.sync="trialVisible" width="850px">
      <el-alert v-if="trialData.notice" :title="trialData.notice" type="info" :closable="false" show-icon />
      <el-table :data="trialData.owners || []" border size="mini" class="mt14"><el-table-column label="受益成员"><template slot-scope="{row}">{{ row.ownerName || ('业务快照成员 #' + row.ownerUserId) }}</template></el-table-column><el-table-column label="净业绩"><template slot-scope="{row}">¥{{ money(row.netPerformanceAmount) }}</template></el-table-column><el-table-column label="试算奖励"><template slot-scope="{row}">¥{{ money(row.trialRewardAmount) }}</template></el-table-column><el-table-column label="说明"><template slot-scope="{row}">{{ (row.trialResults || []).length ? '已按当前规则和封顶条件试算' : '没有已发布或指定规则命中' }}</template></el-table-column></el-table>
      <span slot="footer"><el-button type="primary" @click="trialVisible=false">关闭</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { getPerformancePeriodList, getPerformancePeriodDetail, buildPerformancePeriod, trialPerformancePeriod, closePerformancePeriod, getBusinessPlanList, getJkRegionOptions } from '@/api/jkGapfix'
export default {
  data(){return{loading:false,saving:false,optionLoading:false,detailLoading:false,query:{status:'',periodType:''},list:[],buildVisible:false,buildRange:[],buildForm:{periodType:'MONTH',planId:null,ownerRoleCode:'',regionCode:''},planOptions:[],regionOptions:[],detailVisible:false,detail:{},activeTab:'overview',trialVisible:false,trialData:{}}},
  created(){this.load();getBusinessPlanList({}).then(r=>{this.planOptions=(r&&r.data)||r||[]})},
  methods:{
    load(){this.loading=true;getPerformancePeriodList(this.query).then(r=>{this.list=(r&&r.data)||r||[]}).finally(()=>{this.loading=false})},
    openBuild(){this.buildRange=[];this.buildForm={periodType:'MONTH',planId:null,ownerRoleCode:'',regionCode:''};this.buildVisible=true},
    searchRegions(keyword){if(!keyword)return;this.optionLoading=true;getJkRegionOptions({keyword,targetLevel:3,enabled:true}).then(r=>{this.regionOptions=(r&&r.data)||r||[]}).finally(()=>{this.optionLoading=false})},
    build(){if(!this.buildRange||this.buildRange.length!==2)return this.$message.warning('请选择统计开始和结束时间');this.saving=true;buildPerformancePeriod({...this.buildForm,startTime:this.buildRange[0],endTime:this.buildRange[1],requestNo:'PERIOD-BUILD-'+Date.now()}).then(()=>{this.$message.success('周期草稿已构建，尚未生成佣金');this.buildVisible=false;this.load()}).finally(()=>{this.saving=false})},
    openDetail(row){this.detailVisible=true;this.detailLoading=true;this.activeTab='overview';getPerformancePeriodDetail(row.id).then(r=>{this.detail=(r&&r.data)||r||{}}).finally(()=>{this.detailLoading=false})},
    trial(row){this.loading=true;trialPerformancePeriod(row.id).then(r=>{this.trialData=(r&&r.data)||r||{};this.trialVisible=true;this.load()}).finally(()=>{this.loading=false})},
    closePeriod(row){this.$prompt('请输入审核关闭说明。关闭后本周期锁定，后续只能冲正或补偿。','审核关闭周期',{inputType:'textarea'}).then(({value})=>closePerformancePeriod(row.id,{requestNo:'PERIOD-CLOSE-'+row.id+'-'+Date.now(),remark:value}).then(()=>{this.$message.success('周期已关闭并生成已发布规则对应的真实奖励');this.load()})).catch(()=>{})},
    money(v){return Number(v||0).toFixed(2)},periodText(v){return{MONTH:'月度',QUARTER:'季度',YEAR:'年度',CUSTOM:'自定义'}[v]||v},roleText(v){return{maker:'创客',partner:'合伙人',county_agent:'区县代理'}[v]||'全部身份'},statusText(v){return{DRAFT:'草稿',PENDING_REVIEW:'待审核',CLOSED:'已关闭锁定',REVERSED:'已冲正'}[v]||v},statusTag(v){return v==='CLOSED'?'success':v==='PENDING_REVIEW'?'warning':'info'},publishText(v){return{DRAFT:'草稿',PUBLISHED:'已发布',DISABLED:'已停用'}[v]||v}
  }
}
</script>
<style scoped>.mt14{margin-top:14px}.header-row{display:flex;align-items:center;justify-content:space-between}.hint{margin-top:4px;color:#909399;font-size:12px}.drawer-body{padding:0 22px 30px}</style>
