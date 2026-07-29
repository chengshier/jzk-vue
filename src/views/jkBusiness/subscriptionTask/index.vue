<template>
  <div class="divBox">
    <el-alert :title="statusText" :type="ability.ready?'success':'warning'" :closable="false" />
    <el-row :gutter="12" class="mt14">
      <el-col v-for="item in statCards" :key="item.label" :span="4">
        <el-card shadow="never" class="stat-card"><div class="stat-value">{{ item.value }}</div><div class="stat-label">{{ item.label }}</div></el-card>
      </el-col>
    </el-row>
    <el-card shadow="never" class="mt14">
      <el-form :inline="true" size="mini">
        <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option v-for="x in statuses" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="模板"><el-select v-model="query.templateCode" clearable><el-option v-for="x in templates" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="接收用户"><el-input-number v-model="query.receiverUserId" :min="1" controls-position="right" /></el-form-item>
        <el-form-item><el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button><el-button @click="loadStatus">刷新状态</el-button><el-button type="success" :disabled="!ability.ready" @click="process">处理到期任务</el-button></el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="data.list" size="mini">
        <el-table-column prop="taskNo" label="任务编号" min-width="165"/>
        <el-table-column label="模板" min-width="130"><template slot-scope="{row}">{{templateText(row.templateCode)}}</template></el-table-column>
        <el-table-column prop="receiverUserId" label="接收用户" width="100"/>
        <el-table-column label="业务来源" min-width="150"><template slot-scope="{row}">{{row.businessType||'--'}} / {{row.businessId||'--'}}</template></el-table-column>
        <el-table-column label="状态" width="120"><template slot-scope="{row}"><el-tag size="mini" :type="tag(row.status)">{{row.statusText||taskStatusText(row.status)}}</el-tag></template></el-table-column>
        <el-table-column prop="retryCount" label="重试" width="70"/>
        <el-table-column prop="nextRetryTime" label="下次重试" min-width="155"/>
        <el-table-column prop="errorMessage" label="等待/失败原因" min-width="220" show-overflow-tooltip/>
        <el-table-column prop="sentAt" label="发送时间" min-width="155"/>
        <el-table-column label="操作" width="90" fixed="right"><template slot-scope="{row}"><el-button v-if="canRetry(row)" type="text" @click="retry(row)">重新入队</el-button><span v-else-if="row.status==='PROCESSING'" class="processing-tip">处理中</span></template></el-table-column>
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="Number(data.total||0)" :current-page="query.page" :page-size="query.limit" @current-change="p=>{query.page=p;load()}"/>
    </el-card>
  </div>
</template>
<script>
import { getSubscriptionTaskList, getSubscriptionStatus, processSubscriptionTasks, retrySubscriptionTask } from '@/api/jkPhase3'
export default{
  data(){return{
    loading:false,
    ability:{},
    data:{list:[],total:0},
    query:{page:1,limit:20,status:'',templateCode:'',receiverUserId:null},
    statuses:[
      {label:'待发送',value:'PENDING'},
      {label:'发送处理中',value:'PROCESSING'},
      {label:'等待重试',value:'RETRY_WAIT'},
      {label:'等待配置',value:'WAIT_CONFIG'},
      {label:'等待接收人授权',value:'WAIT_RECIPIENT'},
      {label:'发送成功',value:'SENT'},
      {label:'发送失败',value:'FAILED'}
    ],
    templates:[
      {label:'审核结果',value:'AUDIT_RESULT'},
      {label:'调拨状态',value:'TRANSFER_STATUS'},
      {label:'收货提醒',value:'RECEIVE_REMINDER'},
      {label:'提现状态',value:'WITHDRAW_STATUS'}
    ]
  }},
  computed:{
    statusText(){
      if(this.ability.ready)return'微信订阅消息基础配置已就绪；只有微信接口明确返回 errcode=0，任务才会标记为发送成功。'
      if(this.ability.enabled===false)return'订阅消息发送总开关默认关闭。业务仍会记录等待配置任务，但不会调用微信接口。'
      return'订阅消息配置不完整，请检查微信总开关、appid/secret、模板ID、字段映射和接收人的有效小程序 openId。'
    },
    statCards(){return[
      {label:'待处理',value:Number(this.ability.pending||0)},
      {label:'处理中',value:Number(this.ability.processing||0)},
      {label:'等待配置',value:Number(this.ability.waitConfig||0)},
      {label:'等待授权',value:Number(this.ability.waitRecipient||0)},
      {label:'发送失败',value:Number(this.ability.failed||0)},
      {label:'能力状态',value:this.ability.ready?'就绪':'未就绪'}
    ]}
  },
  created(){this.load();this.loadStatus()},
  methods:{
    load(){this.loading=true;getSubscriptionTaskList(this.query).then(r=>{const d=r.data||r||{};this.data={list:d.list||d.records||[],total:d.total||0}}).finally(()=>this.loading=false)},
    search(){this.query.page=1;this.load()},
    reset(){this.query={page:1,limit:20,status:'',templateCode:'',receiverUserId:null};this.load()},
    loadStatus(){getSubscriptionStatus().then(r=>this.ability=r.data||r||{}).catch(()=>this.ability={ready:false})},
    process(){processSubscriptionTasks(50).then(r=>{this.$message.success(`本次成功发送 ${Number((r&&r.data)||0)} 条`);this.load();this.loadStatus()})},
    retry(row){this.$prompt('重新入队会重新读取用户当前可信小程序 openId，请填写操作原因','重新入队',{inputValue:'管理员确认配置或用户授权后重新入队',inputValidator:v=>!!String(v||'').trim()||'原因不能为空'}).then(({value})=>retrySubscriptionTask(row.id,value).then(()=>{this.$message.success('任务状态已重新计算');this.load();this.loadStatus()})).catch(()=>{})},
    canRetry(row){return row.status!=='SENT'&&row.status!=='PROCESSING'},
    templateText(v){const x=this.templates.find(i=>i.value===v);return x?x.label:v},
    taskStatusText(v){const x=this.statuses.find(i=>i.value===v);return x?x.label:v},
    tag(v){if(v==='SENT')return'success';if(v==='FAILED')return'danger';if(v==='WAIT_CONFIG'||v==='WAIT_RECIPIENT')return'warning';return'info'}
  }
}
</script>
<style scoped>
.mt14{margin-top:14px}.el-pagination{margin-top:18px;text-align:right}.stat-card{text-align:center}.stat-value{min-height:28px;color:#303133;font-size:22px;font-weight:600}.stat-label{margin-top:5px;color:#909399;font-size:12px}.processing-tip{color:#909399;font-size:12px}
</style>
