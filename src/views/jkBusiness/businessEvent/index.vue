<template>
  <div class="app-container">
    <el-alert title="库存入库等主事务完成后，事件独立处理；失败不会回滚库存，可在此人工重试。达到最大次数后状态为已终止。" type="info" :closable="false" style="margin-bottom:16px" />
    <div class="filter-container">
      <el-input v-model="query.eventType" clearable placeholder="事件类型" class="filter-item" style="width:220px" />
      <el-select v-model="query.eventStatus" clearable placeholder="处理状态" class="filter-item" style="width:150px">
        <el-option label="待处理" value="PENDING"/><el-option label="处理中" value="PROCESSING"/><el-option label="处理失败" value="FAILED"/><el-option label="处理成功" value="SUCCESS"/><el-option label="已终止" value="DEAD"/>
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="eventKey" label="事件唯一键" min-width="240"/>
      <el-table-column prop="eventType" label="事件类型" min-width="190"/>
      <el-table-column prop="businessNo" label="业务单号" min-width="170"/>
      <el-table-column label="状态" width="110"><template slot-scope="{row}"><el-tag :type="row.statusTag||'info'">{{row.eventStatusText||row.eventStatus}}</el-tag></template></el-table-column>
      <el-table-column label="重试" width="90"><template slot-scope="{row}">{{row.retryCount||0}} / {{row.maxRetryCount||0}}</template></el-table-column>
      <el-table-column prop="nextRetryTime" label="下次重试" min-width="160"/>
      <el-table-column prop="errorMessage" label="失败原因" min-width="260" show-overflow-tooltip/>
      <el-table-column prop="processedTime" label="处理时间" min-width="160"/>
      <el-table-column label="操作" width="90" fixed="right"><template slot-scope="{row}"><el-button v-if="row.eventStatus==='FAILED'||row.eventStatus==='DEAD'" type="text" @click="retry(row)">重试</el-button></template></el-table-column>
    </el-table>
  </div>
</template>
<script>
import { getJkBusinessEventList, retryJkBusinessEvent } from '@/api/jkBusiness'
export default { data(){return{query:{},list:[],loading:false}},created(){this.load()},methods:{load(){this.loading=true;getJkBusinessEventList(this.query).then(r=>{this.list=(r&&r.list)||(r&&r.data&&r.data.list)||r.data||r||[]}).finally(()=>this.loading=false)},retry(row){this.$confirm('确认重新处理该事件？主业务不会重复执行。','事件重试').then(()=>retryJkBusinessEvent({eventId:row.id,requestNo:'EVENT-RETRY-'+Date.now()}).then(()=>{this.$message.success('已执行重试');this.load()}))}}}
</script>
