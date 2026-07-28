<template>
  <div class="divBox"><el-card shadow="never"><div slot="header"><span>经营收益</span></div>
    <el-alert title="本页记录代理在线下已经实现的经营毛利，例如区县代理调拨价差。该金额不属于平台应付佣金，不进入提现账户。" type="warning" :closable="false" style="margin-bottom:16px" />
    <el-form inline size="small">
      <el-form-item label="经营人"><el-select v-model="query.userId" clearable filterable remote :remote-method="searchUsers" placeholder="姓名/手机号" style="width:220px"><el-option v-for="x in users" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
      <el-form-item label="来源"><el-select v-model="query.sourceType" clearable><el-option label="线下销售" value="OFFLINE_SALE"/><el-option label="库存调拨" value="STOCK_TRANSFER"/></el-select></el-form-item>
      <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option label="已确认" value="CONFIRMED"/><el-option label="部分冲正" value="PARTIALLY_REVERSED"/><el-option label="已冲正" value="REVERSED"/><el-option label="冲正记录" value="REVERSAL"/></el-select></el-form-item>
      <el-button type="primary" @click="load">查询</el-button>
    </el-form>
    <el-table v-loading="loading" :data="list" size="mini">
      <el-table-column prop="profitNo" label="收益编号" min-width="180"/><el-table-column label="经营人" min-width="140"><template slot-scope="s">{{s.row.userName||s.row.userId}}<br><small>{{s.row.roleName||s.row.roleCode}}</small></template></el-table-column>
      <el-table-column prop="sourceType" label="来源" width="130"/><el-table-column prop="sourceNo" label="来源单号" min-width="160"/><el-table-column prop="quantity" label="数量" width="70"/>
      <el-table-column label="营业收入" width="110"><template slot-scope="s">¥{{money(s.row.revenueAmount)}}</template></el-table-column><el-table-column label="实际成本" width="110"><template slot-scope="s">¥{{money(s.row.costAmount)}}</template></el-table-column>
      <el-table-column label="经营毛利" width="110"><template slot-scope="s"><strong>¥{{money(s.row.profitAmount)}}</strong></template></el-table-column><el-table-column label="已冲正" width="110"><template slot-scope="s">¥{{money(s.row.reversedAmount)}}</template></el-table-column><el-table-column prop="status" label="状态" width="130"/>
    </el-table><el-pagination :current-page="query.page" :page-size="query.limit" :total="total" layout="total, prev, pager, next" @current-change="changePage" />
  </el-card></div>
</template>
<script>
import { getJkOperationProfitList } from '@/api/jkV31Business'
import { getJkUserOptions } from '@/api/jkBusiness'
export default {data(){return{query:{page:1,limit:20},list:[],total:0,loading:false,users:[]}},created(){this.searchUsers('');this.load()},methods:{unwrap(r){return(r&&r.data)||r||{}},load(){this.loading=true;getJkOperationProfitList(this.query).then(r=>{const d=this.unwrap(r);this.list=d.list||d.records||(Array.isArray(d)?d:[]);this.total=Number(d.total||this.list.length)}).finally(()=>this.loading=false)},searchUsers(keyword){getJkUserOptions({keyword,limit:30}).then(r=>this.users=this.unwrap(r)||[])},changePage(p){this.query.page=p;this.load()},money(v){const n=Number(v||0);return Number.isNaN(n)?v:n.toFixed(2)}}}
</script>
<style scoped>.el-pagination{margin-top:18px;text-align:right}small{color:#909399}strong{color:#e6a23c}</style>
