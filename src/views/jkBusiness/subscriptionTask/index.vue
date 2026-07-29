<template>
  <div class="divBox">
    <el-alert :title="statusText" :type="ability.ready?'success':'warning'" :closable="false" />
    <el-card shadow="never" class="mt14">
      <el-form :inline="true" size="mini">
        <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option v-for="x in statuses" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="模板"><el-select v-model="query.templateCode" clearable><el-option v-for="x in templates" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="接收用户"><el-input-number v-model="query.receiverUserId" :min="1" controls-position="right" /></el-form-item>
        <el-form-item><el-button type="primary" @click="load">查询</el-button><el-button @click="loadStatus">刷新状态</el-button><el-button type="success" :disabled="!ability.ready" @click="process">处理到期任务</el-button></el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="data.list" size="mini">
        <el-table-column prop="taskNo" label="任务编号" min-width="165"/><el-table-column label="模板" min-width="130"><template slot-scope="{row}">{{templateText(row.templateCode)}}</template></el-table-column><el-table-column prop="receiverUserId" label="接收用户" width="100"/><el-table-column label="业务来源" min-width="150"><template slot-scope="{row}">{{row.businessType||'--'}} / {{row.businessId||'--'}}</template></el-table-column><el-table-column label="状态" width="120"><template slot-scope="{row}"><el-tag size="mini" :type="tag(row.status)">{{row.statusText||taskStatusText(row.status)}}</el-tag></template></el-table-column><el-table-column prop="retryCount" label="重试" width="70"/><el-table-column prop="nextRetryTime" label="下次重试" min-width="155"/><el-table-column prop="errorMessage" label="等待/失败原因" min-width="220" show-overflow-tooltip/><el-table-column prop="sentAt" label="发送时间" min-width="155"/><el-table-column label="操作" width="90" fixed="right"><template slot-scope="{row}"><el-button v-if="row.status!=='SENT'" type="text" @click="retry(row)">重新入队</el-button></template></el-table-column>
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="Number(data.total||0)" :current-page="query.page" :page-size="query.limit" @current-change="p=>{query.page=p;load()}"/>
    </el-card>
  </div>
</template>
<script>
import { getSubscriptionTaskList, getSubscriptionStatus, processSubscriptionTasks, retrySubscriptionTask } from '@/api/jkPhase3'
export default{data(){return{loading:false,ability:{},data:{list:[],total:0},query:{page:1,limit:20,status:'',templateCode:'',receiverUserId:null},statuses:[{label:'待发送',value:'PENDING'},{label:'等待重试',value:'RETRY_WAIT'},{label:'等待配置',value:'WAIT_CONFIG'},{label:'等待接收人授权',value:'WAIT_RECIPIENT'},{label:'发送成功',value:'SENT'},{label:'发送失败',value:'FAILED'}],templates:[{label:'审核结果',value:'AUDIT_RESULT'},{label:'调拨状态',value:'TRANSFER_STATUS'},{label:'收货提醒',value:'RECEIVE_REMINDER'},{label:'提现状态',value:'WITHDRAW_STATUS'}]}},computed:{statusText(){if(this.ability.ready)return'微信订阅消息能力已就绪；只有微信接口明确返回成功，任务才会标记为发送成功。';if(this.ability.enabled===false)return'订阅消息总开关默认关闭，当前不会发送消息，也不会产生无意义的周期失败日志。';return'订阅消息配置不完整，请检查微信凭据、模板ID和接收人的有效openId。'}},created(){this.load();this.loadStatus()},methods:{load(){this.loading=true;getSubscriptionTaskList(this.query).then(r=>{const d=r.data||r||{};this.data={list:d.list||d.records||[],total:d.total||0}}).finally(()=>this.loading=false)},loadStatus(){getSubscriptionStatus().then(r=>this.ability=r.data||r||{}).catch(()=>this.ability={ready:false})},process(){processSubscriptionTasks(50).then(r=>{this.$message.success(`本次成功发送 ${r.data||0} 条`);this.load();this.loadStatus()})},retry(row){this.$prompt('请输入重新入队原因','重新入队',{inputValue:'管理员确认配置后重新入队',inputValidator:v=>!!String(v||'').trim()||'原因不能为空'}).then(({value})=>retrySubscriptionTask(row.id,value).then(()=>{this.$message.success('已重新入队');this.load()})).catch(()=>{})},templateText(v){const x=this.templates.find(i=>i.value===v);return x?x.label:v},taskStatusText(v){const x=this.statuses.find(i=>i.value===v);return x?x.label:v},tag(v){return v==='SENT'?'success':v==='FAILED'?'danger':v==='WAIT_CONFIG'||v==='WAIT_RECIPIENT'?'warning':'info'}}}
</script>
<style scoped>.mt14{margin-top:14px}.el-pagination{margin-top:18px;text-align:right}</style>
