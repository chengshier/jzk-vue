<template>
  <div class="app-container">
    <div class="filter-container">
      <jk-user-remote-select v-model="query.userId" placeholder="用户姓名 / 手机号" class="filter-item"/>
      <el-select v-model="query.status" clearable placeholder="处理状态" class="filter-item" style="width:140px"><el-option label="待处理" value="OPEN"/><el-option label="已关注" value="ACKNOWLEDGED"/><el-option label="已关闭" value="CLOSED"/></el-select>
      <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button>
    </div>
    <el-table v-loading="loading" :data="listData.list" border>
      <el-table-column label="用户" min-width="170"><template slot-scope="{row}"><div>{{row.userName||row.nickname||'用户不存在'}}</div><div class="sub-text">{{row.userPhone||row.userId||'--'}}</div></template></el-table-column>
      <el-table-column label="数据类型" width="100"><template slot-scope="{row}">{{dataTypeText(row.dataType)}}</template></el-table-column>
      <el-table-column prop="measuredValue" label="测量值" width="100"/>
      <el-table-column label="风险等级" width="100"><template slot-scope="{row}"><el-tag size="mini" :type="riskTag(row.alertLevel)">{{riskText(row.alertLevel)}}</el-tag></template></el-table-column>
      <el-table-column label="状态" width="100"><template slot-scope="{row}">{{statusText(row.status)}}</template></el-table-column>
      <el-table-column prop="createTime" label="产生时间" min-width="160"/>
      <el-table-column prop="handleRemark" label="处理说明" min-width="200" show-overflow-tooltip/>
      <el-table-column label="操作" width="150"><template slot-scope="{row}"><el-button v-if="row.status!=='CLOSED'" type="text" @click="process(row,'ACKNOWLEDGE')">标记关注</el-button><el-button v-if="row.status!=='CLOSED'" type="text" style="color:#67c23a" @click="process(row,'CLOSE')">关闭</el-button></template></el-table-column>
    </el-table>
    <el-pagination class="mt20" :current-page="query.page" :page-size="query.limit" :total="listData.total" layout="total, prev, pager, next, jumper" @current-change="pageChange"/>
  </div>
</template>
<script>
import JkUserRemoteSelect from '@/components/JkUserRemoteSelect'
import {getJkHealthAlertRecordList,processJkHealthAlert} from '@/api/jkBusiness'
export default{
  components:{JkUserRemoteSelect},
  data(){return{query:{page:1,limit:20,userId:null,status:''},listData:{list:[],total:0},loading:false}},
  created(){this.load()},
  methods:{
    load(){this.loading=true;getJkHealthAlertRecordList(this.query).then(r=>{const p=(r&&r.data)||r||{};this.listData={list:p.list||p.records||[],total:Number(p.total||0)}}).finally(()=>this.loading=false)},search(){this.query.page=1;this.load()},reset(){this.query={page:1,limit:20,userId:null,status:''};this.load()},pageChange(p){this.query.page=p;this.load()},
    process(row,action){this.$prompt('请输入处理说明','健康预警',{inputPattern:/\S+/,inputErrorMessage:'处理说明不能为空'}).then(({value})=>processJkHealthAlert({alertId:row.id,action,remark:value}).then(()=>{this.$message.success('处理成功');this.load()})).catch(()=>{})},
    dataTypeText(v){return{GLUCOSE:'血糖',DIET:'饮食',EXERCISE:'运动',MEDICINE:'用药'}[v]||v||'--'},statusText(v){return{OPEN:'待处理',ACKNOWLEDGED:'已关注',CLOSED:'已关闭'}[v]||v||'--'},riskText(v){return{LOW:'低风险',MEDIUM:'中风险',HIGH:'高风险',CRITICAL:'紧急'}[v]||v||'--'},riskTag(v){if(v==='CRITICAL'||v==='HIGH')return'danger';if(v==='MEDIUM')return'warning';return'success'}
  }
}
</script>
<style scoped>.filter-item{margin-right:10px}.sub-text{color:#909399;font-size:12px}</style>
