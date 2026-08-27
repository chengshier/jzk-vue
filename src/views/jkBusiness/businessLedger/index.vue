<template>
  <div class="divBox">
    <el-card shadow="never">
      <div slot="header"><span>业绩、经营收益与线下销售</span></div>
      <el-alert :closable="false" type="info" show-icon title="业绩用于业务统计；线下经营收益为 OFFLINE_REALIZED，不进入提现账户；只有 PLATFORM_PAYABLE 佣金进入结算和提现。" />
      <el-tabs v-model="tab" style="margin-top:14px" @tab-click="load">
        <el-tab-pane label="业绩账本" name="performance" />
        <el-tab-pane label="经营收益" name="profit" />
        <el-tab-pane label="线下销售审核" name="sale" />
      </el-tabs>
      <el-form inline size="small">
        <el-form-item label="用户ID"><el-input-number v-model="query.userId" :min="1" controls-position="right" /></el-form-item>
        <el-form-item v-if="tab!=='sale'" label="来源"><el-select v-model="query.sourceType" clearable><el-option label="线上零售" value="RETAIL_ORDER"/><el-option label="线下销售" value="OFFLINE_SALE"/><el-option label="平台订货" value="PLATFORM_ORDER"/><el-option label="库存调拨" value="STOCK_TRANSFER"/></el-select></el-form-item>
        <el-form-item label="状态"><el-input v-model="query.status" clearable /></el-form-item>
        <el-button size="small" @click="load">查询</el-button>
      </el-form>

      <el-table v-if="tab==='performance'" v-loading="loading" :data="list" size="mini" border>
        <el-table-column prop="performanceNo" label="业绩编号" min-width="170"/><el-table-column prop="ownerUserId" label="归属用户" width="100"/><el-table-column prop="ownerRoleCode" label="角色" width="110"/><el-table-column prop="performanceType" label="业绩类型" min-width="150"/><el-table-column prop="sourceType" label="来源" width="130"/><el-table-column prop="sourceNo" label="来源单号" min-width="170"/><el-table-column prop="quantity" label="数量" width="80"/><el-table-column prop="performanceAmount" label="有效金额" width="110"/><el-table-column prop="reversedAmount" label="已冲减" width="100"/><el-table-column prop="status" label="状态" width="110"/><el-table-column prop="occurredAt" label="发生时间" min-width="160"/>
      </el-table>
      <el-table v-else-if="tab==='profit'" v-loading="loading" :data="list" size="mini" border>
        <el-table-column prop="profitNo" label="收益编号" min-width="170"/><el-table-column prop="userId" label="归属用户" width="100"/><el-table-column prop="roleCode" label="角色" width="110"/><el-table-column prop="incomeNature" label="收益性质" width="150"/><el-table-column prop="sourceType" label="来源" width="130"/><el-table-column prop="sourceNo" label="来源单号" min-width="170"/><el-table-column prop="revenueAmount" label="收入" width="100"/><el-table-column prop="costAmount" label="成本" width="100"/><el-table-column prop="profitAmount" label="毛利" width="100"/><el-table-column prop="reversedAmount" label="已冲减" width="100"/><el-table-column prop="status" label="状态" width="110"/>
      </el-table>
      <el-table v-else v-loading="loading" :data="list" size="mini" border>
        <el-table-column prop="saleNo" label="销售单号" min-width="180"/><el-table-column prop="sellerUserId" label="销售人" width="100"/><el-table-column prop="sellerRoleCode" label="角色" width="110"/><el-table-column prop="customerType" label="客户类型" width="110"/><el-table-column prop="saleTime" label="销售时间" min-width="160"/><el-table-column prop="totalAmount" label="销售额" width="100"/><el-table-column prop="totalCostAmount" label="成本" width="100"/><el-table-column prop="totalProfitAmount" label="毛利" width="100"/><el-table-column prop="auditStatus" label="审核" width="110"/><el-table-column prop="status" label="状态" width="130"/><el-table-column label="操作" width="100" fixed="right"><template slot-scope="s"><el-button type="text" @click="openSale(s.row)">详情</el-button></template></el-table-column>
      </el-table>
      <el-pagination background layout="prev,pager,next,total" :total="total" :page-size="query.limit" :current-page="query.page" style="margin-top:16px" @current-change="p=>{query.page=p;load()}" />
    </el-card>

    <jk-business-drawer :visible.sync="drawer" title="线下销售详情" size="820px">
      <el-descriptions v-if="detail.id" :column="2" border size="small">
        <el-descriptions-item label="销售单号">{{detail.saleNo}}</el-descriptions-item><el-descriptions-item label="状态">{{detail.status}}</el-descriptions-item>
        <el-descriptions-item label="销售人">{{detail.sellerUserId}} / {{detail.sellerRoleCode}}</el-descriptions-item><el-descriptions-item label="区域">{{detail.regionCode||'--'}}</el-descriptions-item>
        <el-descriptions-item label="客户">{{detail.customerType}} / {{detail.customerPhoneMasked||'未留存'}}</el-descriptions-item><el-descriptions-item label="实名客户">{{detail.registeredCustomer?'是':'否'}}</el-descriptions-item>
        <el-descriptions-item label="销售额">{{detail.totalAmount}}</el-descriptions-item><el-descriptions-item label="经营毛利">{{detail.totalProfitAmount}}</el-descriptions-item>
      </el-descriptions>
      <h4>商品与成本快照</h4>
      <el-table :data="detail.items||[]" size="mini" border><el-table-column prop="productName" label="商品"/><el-table-column prop="skuName" label="规格"/><el-table-column prop="quantity" label="数量"/><el-table-column prop="unitPrice" label="售价"/><el-table-column prop="unitCost" label="批次成本"/><el-table-column prop="profitAmount" label="毛利"/></el-table>
      <h4>审核/操作日志</h4>
      <el-timeline><el-timeline-item v-for="x in detail.auditLogs||[]" :key="x.id" :timestamp="x.createTime">{{x.action}}：{{x.remark||x.afterStatus}}</el-timeline-item></el-timeline>
      <div slot="footer"><el-button @click="drawer=false">关闭</el-button><el-button v-if="detail.status==='PENDING_AUDIT'" type="danger" @click="audit(false)">驳回</el-button><el-button v-if="detail.status==='PENDING_AUDIT'" type="primary" @click="audit(true)">审核通过并确认出库</el-button></div>
    </jk-business-drawer>
  </div>
</template>
<script>
import JkBusinessDrawer from '@/components/jkBusiness/JkBusinessDrawer'
import { getPerformanceRecords, getOperationProfitRecords, getOfflineSaleList, getOfflineSaleDetail, auditOfflineSale } from '@/api/jkV31'
export default { components:{JkBusinessDrawer},data(){return{tab:'performance',query:{page:1,limit:20,userId:null,sourceType:'',status:''},list:[],total:0,loading:false,drawer:false,detail:{}}},created(){this.load()},methods:{page(r){const d=(r&&r.data)||r||{};return{list:d.list||d.records||[],total:Number(d.total||0)}},load(){this.loading=true;let fn,params=Object.assign({},this.query);if(this.tab==='performance'){fn=getPerformanceRecords;params.ownerUserId=params.userId}else if(this.tab==='profit'){fn=getOperationProfitRecords}else{fn=getOfflineSaleList;params.sellerUserId=params.userId;delete params.sourceType}fn(params).then(r=>{const p=this.page(r);this.list=p.list;this.total=p.total}).finally(()=>{this.loading=false})},openSale(row){getOfflineSaleDetail(row.id).then(r=>{this.detail=(r&&r.data)||r||{};this.drawer=true})},audit(approved){this.$prompt(approved?'请输入审核备注':'请输入驳回原因','线下销售审核',{inputPattern:/\S+/,inputErrorMessage:'内容不能为空'}).then(({value})=>auditOfflineSale({saleId:this.detail.id,approved,remark:value}).then(()=>{this.$message.success(approved?'审核通过':'已驳回');this.drawer=false;this.load()}))}}}
</script>
