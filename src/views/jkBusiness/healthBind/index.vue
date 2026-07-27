<template>
  <div class="app-container">
    <el-alert title="绑定历史用于追踪设备从谁绑定、何时解绑；后台仅查询，不直接修改历史。" type="info" :closable="false" style="margin-bottom:16px"/>
    <div class="filter-container">
      <jk-user-remote-select v-model="query.userId" placeholder="绑定用户姓名 / 手机号" class="filter-item"/>
      <el-input v-model="query.deviceSn" placeholder="设备编号" clearable class="filter-item" style="width:200px"/>
      <el-select v-model="query.status" clearable placeholder="绑定状态" class="filter-item" style="width:140px"><el-option label="已绑定" value="ACTIVE"/><el-option label="已解绑" value="UNBOUND"/></el-select>
      <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
    </div>
    <el-table v-loading="loading" :data="listData.list" border>
      <el-table-column prop="bindNo" label="绑定编号" min-width="170"/>
      <el-table-column prop="deviceSn" label="设备编号" min-width="160"/>
      <el-table-column prop="deviceModel" label="设备型号" min-width="130"/>
      <el-table-column label="绑定用户" min-width="180"><template slot-scope="{row}"><div>{{row.userName||row.nickname||'用户不存在'}}</div><div class="sub-text">{{row.userPhone||row.userId||'--'}}</div></template></el-table-column>
      <el-table-column label="绑定来源" width="110"><template slot-scope="{row}">{{sourceText(row.bindSource)}}</template></el-table-column>
      <el-table-column prop="bindTime" label="绑定时间" min-width="160"/>
      <el-table-column prop="unbindTime" label="解绑时间" min-width="160"/>
      <el-table-column label="状态" width="100"><template slot-scope="{row}"><el-tag size="mini" :type="row.status==='ACTIVE'?'success':'info'">{{row.status==='ACTIVE'?'已绑定':'已解绑'}}</el-tag></template></el-table-column>
    </el-table>
    <el-pagination class="mt20" :current-page="query.page" :page-size="query.limit" :total="listData.total" layout="total, prev, pager, next, jumper" @current-change="pageChange"/>
  </div>
</template>
<script>
import JkUserRemoteSelect from '@/components/JkUserRemoteSelect'
import {getJkHealthBindList} from '@/api/jkBusiness'
export default{
  components:{JkUserRemoteSelect},data(){return{query:{page:1,limit:20,userId:null,deviceSn:'',status:''},listData:{list:[],total:0},loading:false}},created(){this.load()},
  methods:{
    load(){this.loading=true;getJkHealthBindList(this.query).then(r=>{const p=(r&&r.data)||r||{};this.listData={list:p.list||p.records||[],total:Number(p.total||0)}}).finally(()=>this.loading=false)},search(){this.query.page=1;this.load()},reset(){this.query={page:1,limit:20,userId:null,deviceSn:'',status:''};this.load()},pageChange(p){this.query.page=p;this.load()},sourceText(v){return{APP:'用户端',DEVICE:'设备端',ADMIN:'后台',CALLBACK:'厂商回调'}[v]||v||'--'}
  }
}
</script>
<style scoped>.filter-item{margin-right:10px}.sub-text{color:#909399;font-size:12px}</style>
