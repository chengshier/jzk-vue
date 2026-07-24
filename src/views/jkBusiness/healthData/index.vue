<template>
  <div class="app-container">
    <el-alert title="常规查询必须由用户授权给健康顾问；平台超级管理员协助用户核查时，应使用“平台协助核查”，填写原因并二次确认，访问行为会强制审计。" type="warning" :closable="false" style="margin-bottom:16px"/>
    <div class="filter-container">
      <el-select v-model="query.ownerUserId" filterable remote clearable placeholder="搜索用户姓名/手机号" :remote-method="searchUsers" style="width:260px"><el-option v-for="o in users" :key="o.value" :label="o.label" :value="o.value"/></el-select>
      <el-select v-model="query.dataType" clearable placeholder="数据类型"><el-option label="血糖" value="GLUCOSE"/><el-option label="饮食" value="DIET"/><el-option label="运动" value="EXERCISE"/><el-option label="用药" value="MEDICINE"/></el-select>
      <el-button type="primary" @click="loadAuthorized">授权查询</el-button><el-button :disabled="!query.ownerUserId" @click="exportAuthorized">授权导出</el-button>
      <el-button type="danger" :disabled="!query.ownerUserId" @click="openEmergency">平台协助核查</el-button>
    </div>
    <el-tag v-if="mode==='EMERGENCY'" type="danger" style="margin-bottom:10px">当前为平台协助核查模式：{{emergencyReason}}</el-tag>
    <el-table v-loading="loading" :data="list" border><el-table-column prop="dataTypeText" label="类型"/><el-table-column prop="numericValue" label="数值"/><el-table-column prop="unit" label="单位"/><el-table-column prop="periodCode" label="时段"/><el-table-column prop="measuredAt" label="记录时间" min-width="160"/><el-table-column prop="sourceType" label="来源"/><el-table-column prop="riskLevelText" label="风险"/><el-table-column prop="detail" label="可见详情" min-width="220" show-overflow-tooltip/></el-table>
    <el-dialog title="平台协助用户核查健康明细" :visible.sync="emergencyVisible" width="560px">
      <el-alert title="仅限用户投诉、数据异常核实或客服协助。操作会记录管理员、用户、范围、原因和时间。" type="error" :closable="false" style="margin-bottom:16px"/>
      <el-input v-model="emergencyForm.reason" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入不少于5个字的核查原因"/>
      <el-checkbox v-model="emergencyForm.confirmed" style="margin-top:16px">我确认当前操作有真实业务必要，并接受审计</el-checkbox>
      <span slot="footer"><el-button @click="emergencyVisible=false">取消</el-button><el-button type="danger" @click="loadEmergency">确认核查</el-button><el-button type="warning" @click="exportEmergency">核查并导出</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import{getJkHealthDataList,exportJkHealthData,getJkUserOptions,emergencyViewJkHealthData,emergencyExportJkHealthData}from'@/api/jkBusiness'
export default{data(){return{query:{page:1,limit:20,ownerUserId:'',dataType:''},users:[],list:[],loading:false,mode:'AUTHORIZED',emergencyVisible:false,emergencyReason:'',emergencyForm:{reason:'',confirmed:false}}},methods:{rows(r){return(r&&r.list)||(r&&r.data&&r.data.list)||r.data||r||[]},searchUsers(keyword){getJkUserOptions({keyword,limit:20}).then(r=>this.users=(r&&r.data)||r||[])},loadAuthorized(){if(!this.query.ownerUserId)return this.$message.warning('请先选择数据所有人');this.mode='AUTHORIZED';this.loading=true;getJkHealthDataList(this.query).then(r=>this.list=this.rows(r)).finally(()=>this.loading=false)},openEmergency(){this.emergencyForm={reason:'',confirmed:false};this.emergencyVisible=true},payload(){return{ownerUserId:this.query.ownerUserId,dataType:this.query.dataType,reason:this.emergencyForm.reason,confirmed:this.emergencyForm.confirmed}},loadEmergency(){if(!this.emergencyForm.confirmed)return this.$message.warning('请完成二次确认');this.loading=true;emergencyViewJkHealthData(this.payload(),{page:1,limit:20}).then(r=>{this.list=this.rows(r);this.mode='EMERGENCY';this.emergencyReason=this.emergencyForm.reason;this.emergencyVisible=false}).finally(()=>this.loading=false)},exportAuthorized(){exportJkHealthData({ownerUserId:this.query.ownerUserId,dataType:this.query.dataType}).then(res=>this.download(res,'授权健康数据.csv'))},exportEmergency(){if(!this.emergencyForm.confirmed)return this.$message.warning('请完成二次确认');emergencyExportJkHealthData(this.payload()).then(res=>{this.download(res,'平台协助核查健康数据.csv');this.emergencyVisible=false})},download(res,name){const blob=res instanceof Blob?res:new Blob([res]);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}}}
</script>
