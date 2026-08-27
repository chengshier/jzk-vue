<template>
  <div class="divBox"><el-card shadow="never"><div slot="header"><span>业绩明细</span></div>
    <el-alert title="业绩账本独立于佣金账户。内部订货、调拨和零售可形成业绩，但不代表一定产生可提现佣金。" type="info" :closable="false" style="margin-bottom:16px" />
    <el-form inline size="small">
      <el-form-item label="归属人"><el-select v-model="query.ownerUserId" clearable filterable remote :remote-method="searchUsers" placeholder="姓名/手机号" style="width:220px"><el-option v-for="x in users" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
      <el-form-item label="业绩类型"><el-select v-model="query.performanceType" clearable><el-option v-for="x in types" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
      <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option label="有效" value="VALID"/><el-option label="部分冲正" value="PARTIALLY_REVERSED"/><el-option label="已冲正" value="REVERSED"/></el-select></el-form-item>
      <el-button type="primary" @click="load">查询</el-button>
    </el-form>
    <el-table v-loading="loading" :data="list" size="mini">
      <el-table-column prop="performanceNo" label="业绩编号" min-width="180"/><el-table-column label="归属人" min-width="140"><template slot-scope="s">{{s.row.ownerName||s.row.ownerUserId}}<br><small>{{s.row.ownerRoleName||s.row.ownerRoleCode}}</small></template></el-table-column>
      <el-table-column label="类型" min-width="130"><template slot-scope="s">{{label(s.row.performanceType)}}</template></el-table-column><el-table-column prop="sourceNo" label="来源单号" min-width="170"/>
      <el-table-column label="业绩金额" width="120"><template slot-scope="s">¥{{money(s.row.performanceAmount)}}</template></el-table-column><el-table-column label="已冲正" width="110"><template slot-scope="s">¥{{money(s.row.reversedAmount)}}</template></el-table-column>
      <el-table-column prop="occurredAt" label="发生时间" min-width="160"/><el-table-column prop="status" label="状态" width="130"/>
    </el-table><el-pagination :current-page="query.page" :page-size="query.limit" :total="total" layout="total, prev, pager, next" @current-change="changePage" />
  </el-card></div>
</template>
<script>
import { getJkPerformanceRecordList } from '@/api/jkV31Business'
import { getJkUserOptions } from '@/api/jkBusiness'
export default { data(){return{query:{page:1,limit:20},list:[],total:0,loading:false,users:[],types:[{label:'线上零售',value:'RETAIL_ONLINE'},{label:'线下零售',value:'RETAIL_OFFLINE'},{label:'平台订货',value:'PLATFORM_PURCHASE'},{label:'库存调拨',value:'STOCK_TRANSFER'},{label:'库存周转',value:'INVENTORY_TURNOVER'}]}},created(){this.searchUsers('');this.load()},methods:{unwrap(r){return(r&&r.data)||r||{}},load(){this.loading=true;getJkPerformanceRecordList(this.query).then(r=>{const d=this.unwrap(r);this.list=d.list||d.records||(Array.isArray(d)?d:[]);this.total=Number(d.total||this.list.length)}).finally(()=>this.loading=false)},searchUsers(keyword){getJkUserOptions({keyword,limit:30}).then(r=>this.users=this.unwrap(r)||[])},changePage(p){this.query.page=p;this.load()},money(v){const n=Number(v||0);return Number.isNaN(n)?v:n.toFixed(2)},label(v){const x=this.types.find(i=>i.value===v);return x?x.label:v}}}
</script>
<style scoped>.el-pagination{margin-top:18px;text-align:right}small{color:#909399}</style>
