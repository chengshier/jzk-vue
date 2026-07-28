<template>
  <div class="app-container">
    <el-alert
      title="当前阶段不接入具体血糖仪厂商：仅保留 CALLBACK / PULL / HYBRID 通用底座，Provider 总开关默认关闭。"
      description="在厂商接口文档、测试账号、测试设备、字段、错误码和签名规则齐全前，不允许启用厂商、主动拉取或真实回调。"
      type="info" :closable="false" show-icon style="margin-bottom:16px"
    />
    <div class="filter-container">
      <el-input v-model="query.keyword" placeholder="厂商名称/编码" clearable style="width:220px"/>
      <el-select v-model="query.syncMode" clearable placeholder="同步模式"><el-option label="回调" value="CALLBACK"/><el-option label="主动拉取" value="PULL"/><el-option label="混合" value="HYBRID"/></el-select>
      <el-button type="primary" @click="load">查询</el-button><el-button @click="open()">新增停用配置</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="providerCode" label="厂商编码"/><el-table-column prop="providerName" label="厂商名称"/>
      <el-table-column prop="adapterType" label="适配器"/><el-table-column prop="syncMode" label="模式"/>
      <el-table-column prop="authType" label="认证"/><el-table-column prop="lastPullStatus" label="最近拉取"/>
      <el-table-column prop="lastPullTime" label="拉取时间" min-width="160"/><el-table-column label="状态"><template slot-scope="s"><el-tag type="info" size="mini">{{s.row.statusText||'全局未开放'}}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="120"><template slot-scope="s"><el-button size="mini" @click="open(s.row)">查看/编辑</el-button></template></el-table-column>
    </el-table>
    <el-dialog title="通用厂商接入配置（当前仅可停用保存）" :visible.sync="visible" width="760px">
      <el-form label-width="120px">
        <el-form-item label="厂商编码"><el-input v-model="form.providerCode"/></el-form-item><el-form-item label="厂商名称"><el-input v-model="form.providerName"/></el-form-item>
        <el-form-item label="同步模式"><el-select v-model="form.syncMode"><el-option label="回调" value="CALLBACK"/><el-option label="主动拉取" value="PULL"/><el-option label="回调+拉取" value="HYBRID"/></el-select></el-form-item>
        <el-form-item label="认证方式"><el-select v-model="form.authType"><el-option label="无" value="NONE"/><el-option label="API Key" value="API_KEY"/><el-option label="静态 Bearer" value="BEARER_STATIC"/><el-option label="OAuth2 客户端" value="OAUTH2_CLIENT_CREDENTIALS"/></el-select></el-form-item>
        <el-form-item label="基础地址"><el-input v-model="form.baseUrl" placeholder="待厂商资料齐全后配置"/></el-form-item>
        <el-form-item label="认证配置 JSON"><el-input v-model="form.credentialJson" type="textarea" :rows="5" placeholder="当前不应填写真实厂商密钥"/></el-form-item>
        <el-form-item label="通用映射 JSON"><el-input v-model="form.configJson" type="textarea" :rows="8" placeholder="仅保留通用配置能力，不猜测具体厂商字段"/></el-form-item>
        <el-form-item label="启用"><el-switch :value="false" disabled/><span class="disabled-note">Provider 总开关未开放</span></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="save">保存停用配置</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkHealthProviderList, saveJkHealthProvider } from '@/api/jkBusiness'
export default{
  data(){return{query:{page:1,limit:50,keyword:'',syncMode:''},list:[],loading:false,visible:false,form:{}}},
  created(){this.load()},
  methods:{
    rows(r){return(r&&r.data&&r.data.list)||(r&&r.list)||r.data||r||[]},
    load(){this.loading=true;getJkHealthProviderList(this.query).then(r=>this.list=this.rows(r)).finally(()=>this.loading=false)},
    open(row){this.form=row?{id:row.id,providerCode:row.providerCode,providerName:row.providerName,adapterType:row.adapterType,syncMode:row.syncMode,authType:row.authType,baseUrl:row.baseUrl,callbackPath:row.callbackPath,credentialJson:'',configJson:'',enabled:false}:{adapterType:'GENERIC_REST',syncMode:'HYBRID',authType:'NONE',enabled:false,credentialJson:'',configJson:''};this.visible=true},
    save(){const data=Object.assign({},this.form,{enabled:false});saveJkHealthProvider(data).then(()=>{this.$message.success('已保存为停用配置');this.visible=false;this.load()})}
  }
}
</script>
<style scoped>.disabled-note{margin-left:12px;color:#909399;font-size:12px}</style>
