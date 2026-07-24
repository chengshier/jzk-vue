<template>
  <div class="app-container">
    <el-alert title="访问日志不保存血糖值、用药内容等健康明文，只记录访问者、所有人、范围和结果。" type="info" :closable="false" style="margin-bottom:16px"/>
    <div class="filter-container">
      <jk-user-remote-select v-model="query.ownerUserId" placeholder="数据所有人姓名 / 手机号" class="filter-item"/>
      <jk-user-remote-select v-model="query.viewerUserId" placeholder="访问人姓名 / 手机号" class="filter-item"/>
      <el-select v-model="query.accessResult" clearable placeholder="访问结果" class="filter-item" style="width:140px">
        <el-option label="允许" value="ALLOWED"/><el-option label="拒绝" value="DENIED"/>
      </el-select>
      <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
    </div>
    <el-table v-loading="loading" :data="listData.list" border>
      <el-table-column prop="requestNo" label="访问编号" min-width="180"/>
      <el-table-column label="访问人" min-width="170"><template slot-scope="{row}"><div>{{row.viewerName||row.viewerNickname||'用户不存在'}}</div><div class="sub-text">{{row.viewerPhone||row.viewerUserId||'--'}}</div></template></el-table-column>
      <el-table-column label="数据所有人" min-width="170"><template slot-scope="{row}"><div>{{row.ownerName||row.ownerNickname||'用户不存在'}}</div><div class="sub-text">{{row.ownerPhone||row.ownerUserId||'--'}}</div></template></el-table-column>
      <el-table-column label="动作" width="120"><template slot-scope="{row}">{{actionText(row.actionType)}}</template></el-table-column>
      <el-table-column label="范围" min-width="160"><template slot-scope="{row}">{{scopeText(row.scopeCode)}}</template></el-table-column>
      <el-table-column label="结果" width="90"><template slot-scope="{row}"><el-tag size="mini" :type="row.accessResult==='ALLOWED'?'success':'danger'">{{row.accessResult==='ALLOWED'?'允许':'拒绝'}}</el-tag></template></el-table-column>
      <el-table-column prop="denyReason" label="拒绝原因" min-width="220"/>
      <el-table-column prop="accessTime" label="访问时间" min-width="160"/>
    </el-table>
    <el-pagination class="mt20" :current-page="query.page" :page-size="query.limit" :total="listData.total" layout="total, prev, pager, next, jumper" @current-change="pageChange"/>
  </div>
</template>
<script>
import JkUserRemoteSelect from '@/components/JkUserRemoteSelect'
import { getJkHealthAccessLogList } from '@/api/jkBusiness'
export default {
  components:{JkUserRemoteSelect},
  data(){return{query:{page:1,limit:20,ownerUserId:null,viewerUserId:null,accessResult:''},listData:{list:[],total:0},loading:false}},
  created(){this.load()},
  methods:{
    load(){this.loading=true;getJkHealthAccessLogList(this.query).then(r=>{const p=(r&&r.data)||r||{};this.listData={list:p.list||p.records||[],total:Number(p.total||0)}}).finally(()=>this.loading=false)},
    search(){this.query.page=1;this.load()},reset(){this.query={page:1,limit:20,ownerUserId:null,viewerUserId:null,accessResult:''};this.load()},pageChange(page){this.query.page=page;this.load()},
    actionText(v){return{VIEW:'查看',EXPORT:'导出',CREATE:'新增',UPDATE:'修改',DELETE:'删除'}[v]||v||'--'},
    scopeText(v){return{GLUCOSE:'血糖',DIET:'饮食',EXERCISE:'运动',MEDICINE:'用药',PROFILE:'健康档案',ALL:'全部健康数据'}[v]||v||'--'}
  }
}
</script>
<style scoped>.filter-item{margin-right:10px}.sub-text{color:#909399;font-size:12px}</style>
