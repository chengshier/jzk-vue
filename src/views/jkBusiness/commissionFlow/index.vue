<template>
  <div class="divBox">
    <el-card shadow="never">
      <div slot="header" class="acea-row row-between-wrapper"><span>佣金流水</span><el-button size="mini" @click="load">刷新</el-button></div>
      <el-alert title="佣金流水由结算、冻结、解冻、冲正等统一账户服务生成，业务人员不需要按数据库账户 ID 查询。" type="info" :closable="false" class="mb15"/>
      <el-form inline size="small">
        <el-form-item label="流水类型"><el-select v-model="query.flowType" clearable placeholder="全部" style="width:160px"><el-option label="待结算增加" value="PENDING_IN"/><el-option label="结算入账" value="SETTLE_IN"/><el-option label="冻结" value="FREEZE"/><el-option label="解冻" value="UNFREEZE"/><el-option label="冲正" value="REVERSE"/><el-option label="扣减" value="DEDUCT"/></el-select></el-form-item>
        <el-form-item label="请求号"><el-input v-model="query.requestNo" clearable placeholder="幂等请求号"/></el-form-item>
        <el-button type="primary" size="small" @click="search">查询</el-button><el-button size="small" @click="reset">重置</el-button>
      </el-form>
      <el-table v-loading="loading" :data="listData.list" size="mini" border>
        <el-table-column prop="flowNo" label="流水号" min-width="170"/>
        <el-table-column label="用户" min-width="180"><template slot-scope="{row}"><div>{{row.applicantName||row.userNickname||'用户不存在'}}</div><div class="sub-text">{{row.applicantPhone||'--'}} / {{row.roleName||'身份未配置'}}</div></template></el-table-column>
        <el-table-column label="流水类型" min-width="120"><template slot-scope="{row}">{{row.flowTypeText||row.commissionFlowTypeText||flowTypeText(row.flowType)}}</template></el-table-column>
        <el-table-column prop="changeAmount" label="变动金额" width="110"/>
        <el-table-column prop="beforeAmount" label="变动前" width="105"/>
        <el-table-column prop="afterAmount" label="变动后" width="105"/>
        <el-table-column label="业务来源" min-width="130"><template slot-scope="{row}">{{row.sourceTypeText||sourceTypeText(row.sourceType)}}</template></el-table-column>
        <el-table-column prop="requestNo" label="请求号" min-width="180"/>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip/>
        <el-table-column prop="createTime" label="时间" min-width="160"/>
      </el-table>
      <el-pagination class="mt20" :current-page="query.page" :page-size="query.limit" :total="listData.total" layout="total, prev, pager, next, jumper" @current-change="pageChange"/>
    </el-card>
  </div>
</template>
<script>
import {getJkCommissionFlowList} from '@/api/jkBusiness'
export default{
  data(){return{query:{page:1,limit:20,flowType:'',requestNo:''},listData:{list:[],total:0},loading:false}},mounted(){this.load()},
  methods:{
    load(){this.loading=true;getJkCommissionFlowList(this.query).then(r=>{const p=(r&&r.data)||r||{};this.listData={list:p.list||p.records||(Array.isArray(p)?p:[]),total:Number(p.total||0)}}).finally(()=>this.loading=false)},search(){this.query.page=1;this.load()},reset(){this.query={page:1,limit:20,flowType:'',requestNo:''};this.load()},pageChange(p){this.query.page=p;this.load()},
    flowTypeText(v){return{PENDING_IN:'待结算增加',SETTLE_IN:'结算入账',FREEZE:'冻结',UNFREEZE:'解冻',REVERSE:'冲正',DEDUCT:'扣减'}[v]||v||'--'},sourceTypeText(v){return{RETAIL_ORDER:'普通零售订单',PLATFORM_ORDER:'平台订货',STOCK_TRANSFER:'库存调拨',REFUND:'退款',MANUAL:'人工处理'}[v]||v||'--'}
  }
}
</script>
<style scoped>.sub-text{color:#909399;font-size:12px}</style>
