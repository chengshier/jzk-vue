<template>
  <div class="divBox">
    <el-alert title="异常上报后暂停正常入库。旧的“直接处理完成”入口已关闭，必须进入 V2 分项方案，按真实商品配置补发、退款、退回或接受现状。" type="warning" :closable="false" />
    <el-card shadow="never" class="mt14">
      <div slot="header" class="head"><span>异常收货工作台</span><el-button size="mini" @click="loadData">刷新</el-button></div>
      <el-form :inline="true" size="mini">
        <el-form-item label="业务类型"><el-select v-model="query.businessType" clearable><el-option label="平台订货" value="PLATFORM_ORDER"/><el-option label="库存调拨" value="STOCK_TRANSFER"/></el-select></el-form-item>
        <el-form-item label="处理状态"><el-select v-model="query.status" clearable><el-option label="待处理" value="PENDING"/><el-option label="处理中" value="PROCESSING"/><el-option label="已处理" value="RESOLVED"/><el-option label="已驳回" value="REJECTED"/></el-select></el-form-item>
        <el-form-item label="收货人"><el-select v-model="query.receiverUserId" clearable filterable remote :remote-method="searchUsers" :loading="userLoading" placeholder="姓名 / 手机号" style="width:220px"><el-option v-for="x in userOptions" :key="x.value" :label="x.label" :value="Number(x.value)"/></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="listData.list" size="mini" border>
        <el-table-column prop="exceptionNo" label="异常单号" min-width="165"/>
        <el-table-column label="业务单据" min-width="180"><template slot-scope="{row}"><div>{{row.businessTypeText||businessTypeText(row.businessType)}}</div><small>{{row.businessNo||'--'}}</small></template></el-table-column>
        <el-table-column label="收货人" min-width="160"><template slot-scope="{row}"><div>{{row.receiverName||'用户不存在'}}</div><small>{{row.receiverPhone||row.receiverUserId||'--'}}</small></template></el-table-column>
        <el-table-column label="数量差异" min-width="170"><template slot-scope="{row}"><div>应收 {{row.expectedTotalQty||0}} / 实收 {{row.receivedTotalQty||0}}</div><small class="danger">短缺 {{row.shortageTotalQty||0}} / 破损 {{row.damagedTotalQty||0}}</small></template></el-table-column>
        <el-table-column prop="exceptionReason" label="异常原因" min-width="210" show-overflow-tooltip/>
        <el-table-column label="状态" width="100"><template slot-scope="{row}"><el-tag size="mini" :type="statusTag(row.status)">{{row.statusText||statusText(row.status)}}</el-tag></template></el-table-column>
        <el-table-column prop="createTime" label="上报时间" min-width="155"/>
        <el-table-column label="操作" min-width="245" fixed="right"><template slot-scope="{row}"><el-button type="text" @click="showDetail(row)">详情</el-button><el-button v-if="row.status==='PENDING'" type="text" @click="handle(row,'PROCESSING')">受理</el-button><el-button v-if="['PENDING','PROCESSING'].includes(row.status)" type="text" style="color:#67c23a" @click="openResolution(row)">V2处理方案</el-button><el-button v-if="['PENDING','PROCESSING'].includes(row.status)" type="text" style="color:#f56c6c" @click="handle(row,'REJECTED')">驳回</el-button></template></el-table-column>
      </el-table>
      <el-pagination class="mt20" :current-page="query.page" :page-size="query.limit" :total="listData.total||0" layout="total,prev,pager,next,jumper" @current-change="pageChange"/>
    </el-card>

    <el-drawer title="异常收货详情" :visible.sync="detailVisible" size="70%">
      <div v-if="detail.exception" class="drawer-body">
        <el-descriptions :column="2" border size="small"><el-descriptions-item label="异常单号">{{detail.exception.exceptionNo}}</el-descriptions-item><el-descriptions-item label="状态"><el-tag size="mini" :type="statusTag(detail.exception.status)">{{detail.exception.statusText||statusText(detail.exception.status)}}</el-tag></el-descriptions-item><el-descriptions-item label="业务单据">{{detail.exception.businessTypeText||businessTypeText(detail.exception.businessType)}} / {{detail.exception.businessNo}}</el-descriptions-item><el-descriptions-item label="收货人">{{detail.exception.receiverName||'用户不存在'}} / {{detail.exception.receiverPhone||detail.exception.receiverUserId}}</el-descriptions-item><el-descriptions-item label="异常原因" :span="2">{{detail.exception.exceptionReason||'--'}}</el-descriptions-item><el-descriptions-item label="当前处理说明" :span="2">{{detail.exception.handleRemark||'--'}}</el-descriptions-item></el-descriptions>
        <h4>商品差异</h4>
        <el-table :data="detail.items||[]" size="mini" border><el-table-column prop="productName" label="商品" min-width="170"/><el-table-column prop="skuName" label="规格" min-width="140"/><el-table-column prop="expectedQty" label="应收" width="80"/><el-table-column prop="receivedQty" label="实收" width="80"/><el-table-column prop="shortageQty" label="短缺" width="80"/><el-table-column prop="damagedQty" label="破损" width="80"/><el-table-column prop="itemRemark" label="说明" min-width="150"/></el-table>
        <template v-if="evidenceUrls.length"><h4>异常凭证</h4><div class="evidence"><el-image v-for="url in evidenceUrls" :key="url" :src="url" :preview-src-list="evidenceUrls" fit="cover"/></div></template>
        <el-alert v-if="['PENDING','PROCESSING'].includes(detail.exception.status)" title="处理完成必须进入 V2 方案。纯补发全部完成后系统恢复待收货；退款、退回或接受现状必须等待真实后续动作。" type="warning" :closable="false" class="mt20"/>
        <div class="drawer-actions"><el-button v-if="detail.exception.status==='PENDING'" @click="handle(detail.exception,'PROCESSING')">标记处理中</el-button><el-button v-if="['PENDING','PROCESSING'].includes(detail.exception.status)" type="success" @click="openResolution(detail.exception)">进入V2处理方案</el-button><el-button v-if="['PENDING','PROCESSING'].includes(detail.exception.status)" type="danger" @click="handle(detail.exception,'REJECTED')">驳回上报</el-button></div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { getJkUserOptions } from '@/api/jkBusiness'
import { getJkReceiveExceptionList, getJkReceiveExceptionDetail, handleJkReceiveException } from '@/api/jkReceiveException'
export default{
  data(){return{query:{page:1,limit:20,status:'',businessType:'',receiverUserId:null},listData:{list:[],total:0},loading:false,userLoading:false,userOptions:[],detailVisible:false,detail:{exception:null,items:[]}}},
  computed:{evidenceUrls(){try{return this.detail.exception&&this.detail.exception.evidenceJson?JSON.parse(this.detail.exception.evidenceJson):[]}catch(e){return[]}}},
  created(){this.searchUsers('');this.loadData()},
  methods:{
    searchUsers(keyword){this.userLoading=true;getJkUserOptions({keyword:keyword||'',limit:30}).then(r=>this.userOptions=r.data||r||[]).finally(()=>this.userLoading=false)},
    loadData(){this.loading=true;getJkReceiveExceptionList(this.query).then(r=>{const d=r.data||r||{};this.listData={list:d.list||d.records||[],total:Number(d.total||0)}}).finally(()=>this.loading=false)},
    search(){this.query.page=1;this.loadData()},reset(){this.query={page:1,limit:20,status:'',businessType:'',receiverUserId:null};this.loadData()},pageChange(p){this.query.page=p;this.loadData()},
    showDetail(row){getJkReceiveExceptionDetail(row.id).then(r=>{this.detail=r.data||r||{exception:null,items:[]};this.detailVisible=true})},
    openResolution(row){this.$router.push({path:'/operation/jzk/receiveExceptionResolution',query:{exceptionId:row.id}})},
    handle(row,action){const title=action==='PROCESSING'?'受理异常':'驳回异常上报';const placeholder=action==='PROCESSING'?'请输入当前核对或处理安排':'请输入驳回原因';this.$prompt(placeholder,title,{inputPattern:/\S+/,inputErrorMessage:'处理说明不能为空'}).then(({value})=>handleJkReceiveException({exceptionId:row.id,action,remark:value})).then(r=>{this.$message.success('处理成功');const d=r.data||r;if(this.detailVisible&&d)this.detail=d;this.loadData()}).catch(()=>{})},
    businessTypeText(v){return v==='PLATFORM_ORDER'?'平台订货':v==='STOCK_TRANSFER'?'库存调拨':v||'--'},statusText(v){return{PENDING:'待处理',PROCESSING:'处理中',RESOLVED:'已处理',REJECTED:'已驳回'}[v]||v||'--'},statusTag(v){return v==='RESOLVED'?'success':v==='REJECTED'?'danger':v==='PROCESSING'?'info':'warning'}
  }
}
</script>
<style scoped>.mt14{margin-top:14px}.mt20{margin-top:20px}.head{display:flex;align-items:center;justify-content:space-between}.danger{color:#f56c6c}.drawer-body{padding:0 24px 32px}.drawer-actions{margin-top:20px;text-align:right}.evidence{display:flex;flex-wrap:wrap;gap:12px}.evidence .el-image{width:110px;height:110px;border-radius:6px}small{color:#909399}</style>
