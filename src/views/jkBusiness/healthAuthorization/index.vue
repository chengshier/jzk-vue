<template>
  <div class="app-container">
    <el-alert title="此页只查看授权关系，不提供绕过用户授权的健康明细入口。" type="warning" :closable="false" style="margin-bottom:16px"/>
    <div class="filter-container">
      <jk-user-remote-select v-model="query.ownerUserId" placeholder="数据所有人姓名 / 手机号" class="filter-item"/>
      <jk-user-remote-select v-model="query.granteeUserId" placeholder="健康顾问姓名 / 手机号" class="filter-item"/>
      <el-select v-model="query.status" clearable placeholder="授权状态" class="filter-item" style="width:140px"><el-option label="有效" value="ACTIVE"/><el-option label="已撤销" value="REVOKED"/><el-option label="已过期" value="EXPIRED"/></el-select>
      <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
    </div>
    <el-table v-loading="loading" :data="listData.list" border>
      <el-table-column prop="authorizationNo" label="授权编号" min-width="180"/>
      <el-table-column label="数据所有人" min-width="170"><template slot-scope="{row}"><div>{{row.ownerName||'用户不存在'}}</div><div class="sub-text">{{row.ownerPhone||row.ownerUserId||'--'}}</div></template></el-table-column>
      <el-table-column label="健康顾问" min-width="170"><template slot-scope="{row}"><div>{{row.granteeName||'用户不存在'}}</div><div class="sub-text">{{row.granteePhone||row.granteeUserId||'--'}}</div></template></el-table-column>
      <el-table-column label="授权范围" min-width="240"><template slot-scope="{row}">{{scopeText(row.scopeCodes)}}</template></el-table-column>
      <el-table-column label="允许导出" width="90"><template slot-scope="{row}"><el-tag size="mini" :type="row.allowExport?'success':'info'">{{row.allowExport?'是':'否'}}</el-tag></template></el-table-column>
      <el-table-column prop="effectiveTime" label="生效时间" min-width="160"/>
      <el-table-column prop="expireTime" label="失效时间" min-width="160"/>
      <el-table-column label="状态" width="100"><template slot-scope="{row}"><el-tag size="mini" :type="statusTag(row.status)">{{statusText(row.status)}}</el-tag></template></el-table-column>
    </el-table>
    <el-pagination class="mt20" :current-page="query.page" :page-size="query.limit" :total="listData.total" layout="total, prev, pager, next, jumper" @current-change="pageChange"/>
  </div>
</template>
<script>
import JkUserRemoteSelect from '@/components/JkUserRemoteSelect'
import {getJkHealthAuthorizationList} from '@/api/jkBusiness'
export default{
  components:{JkUserRemoteSelect},
  data(){return{query:{page:1,limit:20,ownerUserId:null,granteeUserId:null,status:''},listData:{list:[],total:0},loading:false}},created(){this.load()},
  methods:{
    load(){this.loading=true;getJkHealthAuthorizationList(this.query).then(r=>{const p=(r&&r.data)||r||{};this.listData={list:p.list||p.records||[],total:Number(p.total||0)}}).finally(()=>this.loading=false)},search(){this.query.page=1;this.load()},reset(){this.query={page:1,limit:20,ownerUserId:null,granteeUserId:null,status:''};this.load()},pageChange(p){this.query.page=p;this.load()},
    statusText(v){return{ACTIVE:'有效',REVOKED:'已撤销',EXPIRED:'已过期'}[v]||v||'--'},statusTag(v){if(v==='ACTIVE')return'success';if(v==='REVOKED')return'danger';return'info'},scopeText(v){const map={GLUCOSE:'血糖',DIET:'饮食',EXERCISE:'运动',MEDICINE:'用药',PROFILE:'健康档案',ALL:'全部'};if(Array.isArray(v))return v.map(x=>map[x]||x).join('、');return String(v||'').split(',').filter(Boolean).map(x=>map[x]||x).join('、')||'--'}
  }
}
</script>
<style scoped>.filter-item{margin-right:10px}.sub-text{color:#909399;font-size:12px}</style>
