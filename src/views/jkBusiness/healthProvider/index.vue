<template>
  <div class="app-container">
    <el-alert title="支持 CALLBACK、PULL 和 HYBRID。标准 REST/JSON 厂商可通过 JSONPath 配置接入；密钥只会加密保存，不会回显。" type="warning" :closable="false" style="margin-bottom:16px"/>
    <div class="filter-container">
      <el-input v-model="query.keyword" placeholder="厂商名称/编码" clearable style="width:220px"/>
      <el-select v-model="query.syncMode" clearable placeholder="同步模式"><el-option label="回调" value="CALLBACK"/><el-option label="主动拉取" value="PULL"/><el-option label="混合" value="HYBRID"/></el-select>
      <el-button type="primary" @click="load">查询</el-button><el-button @click="open()">新增厂商</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="providerCode" label="厂商编码"/><el-table-column prop="providerName" label="厂商名称"/>
      <el-table-column prop="adapterType" label="适配器"/><el-table-column prop="syncMode" label="模式"/>
      <el-table-column prop="authType" label="认证"/><el-table-column prop="lastPullStatus" label="最近拉取"/>
      <el-table-column prop="lastPullTime" label="拉取时间" min-width="160"/><el-table-column prop="statusText" label="状态"/>
      <el-table-column label="操作" width="220"><template slot-scope="s"><el-button size="mini" @click="open(s.row)">编辑</el-button><el-button v-if="s.row.pullSupported" size="mini" type="primary" @click="pull(s.row)">立即拉取</el-button></template></el-table-column>
    </el-table>
    <el-dialog title="健康厂商接入配置" :visible.sync="visible" width="760px">
      <el-form label-width="120px">
        <el-form-item label="厂商编码"><el-input v-model="form.providerCode"/></el-form-item><el-form-item label="厂商名称"><el-input v-model="form.providerName"/></el-form-item>
        <el-form-item label="同步模式"><el-select v-model="form.syncMode"><el-option label="回调" value="CALLBACK"/><el-option label="主动拉取" value="PULL"/><el-option label="回调+拉取" value="HYBRID"/></el-select></el-form-item>
        <el-form-item label="认证方式"><el-select v-model="form.authType"><el-option label="无" value="NONE"/><el-option label="API Key" value="API_KEY"/><el-option label="静态 Bearer" value="BEARER_STATIC"/><el-option label="OAuth2客户端" value="OAUTH2_CLIENT_CREDENTIALS"/></el-select></el-form-item>
        <el-form-item label="基础地址"><el-input v-model="form.baseUrl" placeholder="https://api.vendor.com"/></el-form-item>
        <el-form-item label="认证配置 JSON"><el-input v-model="form.credentialJson" type="textarea" :rows="5" placeholder='例如 {"callbackSecret":"...","apiKey":"..."}'/></el-form-item>
        <el-form-item label="双模式映射 JSON"><el-input v-model="form.configJson" type="textarea" :rows="10" placeholder='可同时配置 pullPath/dataPath/fieldMapping 与 callbackDataPath/callbackFieldMapping/callbackSignatureType 等'/></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.enabled"/></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkHealthProviderList, saveJkHealthProvider, pullJkHealthProvider } from '@/api/jkBusiness'
export default { data(){return{query:{page:1,limit:50,keyword:'',syncMode:''},list:[],loading:false,visible:false,form:{}}},created(){this.load()},methods:{rows(r){return(r&&r.data&&r.data.list)||(r&&r.list)||r.data||r||[]},load(){this.loading=true;getJkHealthProviderList(this.query).then(r=>this.list=this.rows(r)).finally(()=>this.loading=false)},open(row){this.form=row?{id:row.id,providerCode:row.providerCode,providerName:row.providerName,adapterType:row.adapterType,syncMode:row.syncMode,authType:row.authType,baseUrl:row.baseUrl,callbackPath:row.callbackPath,credentialJson:'',configJson:'',enabled:row.enabled}:{adapterType:'GENERIC_REST',syncMode:'HYBRID',authType:'NONE',enabled:true,credentialJson:'{"callbackSecret":"请替换为厂商密钥"}',configJson:'{"pullPath":"/data","method":"GET","dataPath":"$.data.list","fieldMapping":{"deviceSn":"$.deviceSn","externalNo":"$.id","value":"$.value","measuredAt":"$.time","unit":"$.unit","period":"$.period"},"callbackDataPath":"$.data","callbackFieldMapping":{"deviceSn":"$.deviceSn","externalNo":"$.id","value":"$.value","measuredAt":"$.time","unit":"$.unit","period":"$.period"},"callbackSignatureType":"HMAC_SHA256","callbackSignHeader":"X-Signature","callbackTimestampHeader":"X-Timestamp","callbackSignContent":"TIMESTAMP_BODY","pullIntervalMinutes":5}' };this.visible=true},save(){saveJkHealthProvider(this.form).then(()=>{this.$message.success('保存成功');this.visible=false;this.load()})},pull(row){this.$confirm('确认立即调用该厂商主动拉取接口？').then(()=>pullJkHealthProvider({providerId:row.id,limit:200}).then(r=>{this.$message.success('同步完成，处理 '+((r&&r.data)||0)+' 条');this.load()}))}}}
</script>
