<template>
  <div class="divBox">
    <el-alert title="打开事件由小程序采集；有效成交事件只由后端零售完成与归属快照生成。场景快照缺失时按推广人统计，不伪造场景转化。" type="info" :closable="false" show-icon />
    <el-card shadow="never" class="mt14">
      <el-form :inline="true" size="mini">
        <el-form-item label="推广场景"><el-input v-model.trim="query.sceneCode" clearable placeholder="场景编码，可留空" /></el-form-item>
        <el-form-item label="推广人">
          <el-select v-model="query.promoterUserId" filterable remote clearable reserve-keyword :remote-method="searchUsers" :loading="optionLoading" placeholder="按姓名或手机号搜索">
            <el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="Number(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围"><el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="yyyy-MM-dd HH:mm:ss" /></el-form-item>
        <el-button type="primary" @click="load">查询</el-button><el-button @click="reset">重置</el-button>
      </el-form>
    </el-card>

    <el-row :gutter="14" class="mt14">
      <el-col :span="4"><el-card shadow="never"><div class="metric-label">推广打开</div><div class="metric-value">{{ summary.openCount || 0 }}</div></el-card></el-col>
      <el-col :span="4"><el-card shadow="never"><div class="metric-label">已识别访客</div><div class="metric-value">{{ summary.identifiedVisitorCount || 0 }}</div></el-card></el-col>
      <el-col :span="4"><el-card shadow="never"><div class="metric-label">有效成交订单</div><div class="metric-value">{{ summary.completedOrderCount || 0 }}</div></el-card></el-col>
      <el-col :span="4"><el-card shadow="never"><div class="metric-label">有效成交金额</div><div class="metric-value">¥{{ money(summary.completedAmount) }}</div></el-card></el-col>
      <el-col :span="4"><el-card shadow="never"><div class="metric-label">打开转化率</div><div class="metric-value">{{ summary.conversionRate == null ? '不可计算' : summary.conversionRate + '%' }}</div></el-card></el-col>
      <el-col :span="4"><el-card shadow="never"><div class="metric-label">推广场景数</div><div class="metric-value">{{ summary.sceneCount || 0 }}</div></el-card></el-col>
    </el-row>

    <el-card shadow="never" class="mt14">
      <div slot="header"><strong>推广效果事件</strong><span class="hint">客户端不能写 RETAIL_COMPLETED</span></div>
      <el-table v-loading="loading" :data="events" border size="mini">
        <el-table-column prop="occurredAt" label="发生时间" min-width="160" />
        <el-table-column label="事件" width="125"><template slot-scope="{row}"><el-tag :type="row.eventType === 'RETAIL_COMPLETED' ? 'success' : 'info'">{{ eventText(row.eventType) }}</el-tag></template></el-table-column>
        <el-table-column prop="sceneCode" label="推广场景" min-width="180"><template slot-scope="{row}">{{ row.sceneCode || '场景快照缺失' }}</template></el-table-column>
        <el-table-column label="推广人" min-width="155"><template slot-scope="{row}">{{ row.promoterName || (row.promoterUserId ? '业务快照用户 #' + row.promoterUserId : '尚未关联') }}</template></el-table-column>
        <el-table-column label="访客/购买人" min-width="155"><template slot-scope="{row}">{{ row.visitorName || (row.visitorUserId ? '业务快照用户 #' + row.visitorUserId : '匿名打开') }}</template></el-table-column>
        <el-table-column prop="sourceNo" label="业务单号" min-width="160"><template slot-scope="{row}">{{ row.sourceNo || '--' }}</template></el-table-column>
        <el-table-column label="成交金额" width="120"><template slot-scope="{row}">{{ row.eventType === 'RETAIL_COMPLETED' ? '¥' + money(row.amount) : '--' }}</template></el-table-column>
        <el-table-column label="写入来源" width="145"><template slot-scope="{row}">{{ row.eventType === 'RETAIL_COMPLETED' ? '后端业务完成事件' : '小程序入口采集' }}</template></el-table-column>
      </el-table>
      <el-empty v-if="!loading && !events.length" description="当前条件下没有推广效果事件" />
    </el-card>
  </div>
</template>

<script>
import { getPromotionEffectSummary, getPromotionEffectList } from '@/api/jkPromotionEffect'
import { getJkUserOptions } from '@/api/jkGapfix'
export default {
  data(){return{loading:false,optionLoading:false,query:{sceneCode:'',promoterUserId:null},dateRange:[],summary:{},events:[],userOptions:[]}},
  created(){this.load()},
  methods:{
    params(){return{...this.query,startTime:this.dateRange&&this.dateRange[0],endTime:this.dateRange&&this.dateRange[1]}},
    load(){this.loading=true;Promise.all([getPromotionEffectSummary(this.params()),getPromotionEffectList(this.params())]).then(([summary,events])=>{this.summary=(summary&&summary.data)||summary||{};this.events=(events&&events.data)||events||[]}).finally(()=>{this.loading=false})},
    reset(){this.query={sceneCode:'',promoterUserId:null};this.dateRange=[];this.load()},
    searchUsers(keyword){this.optionLoading=true;getJkUserOptions({keyword:keyword||'',roleCode:'',limit:30}).then(r=>{this.userOptions=(r&&r.data)||r||[]}).finally(()=>{this.optionLoading=false})},
    eventText(v){return{OPEN:'推广打开',RETAIL_COMPLETED:'有效零售完成'}[v]||v},
    money(v){return Number(v||0).toFixed(2)}
  }
}
</script>
<style scoped>.mt14{margin-top:14px}.metric-label{color:#909399;font-size:13px}.metric-value{margin-top:9px;color:#303133;font-size:23px;font-weight:600}.hint{margin-left:12px;color:#909399;font-size:12px}</style>
