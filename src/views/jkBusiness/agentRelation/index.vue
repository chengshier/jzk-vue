<template>
  <div class="divBox">
    <el-card shadow="never">
      <div slot="header" class="header-row">
        <div><strong>上下级关系管理</strong><div class="hint">普通入口只允许首次绑定；已有关系必须走换绑申请，特殊情况使用管理员强制调整。</div></div>
        <el-button size="mini" type="primary" @click="openInitialBind">首次绑定</el-button>
      </div>
      <el-form inline size="small">
        <el-form-item label="下级用户"><el-select v-model="query.userId" clearable filterable remote :remote-method="searchUsers" :loading="userLoading" placeholder="姓名/手机号搜索" style="width:240px"><el-option v-for="x in userOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
        <el-form-item label="直属上级"><el-select v-model="query.parentUserId" clearable filterable remote :remote-method="searchParents" :loading="parentLoading" placeholder="姓名/手机号搜索" style="width:240px"><el-option v-for="x in parentOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
        <el-checkbox v-model="query.activeOnly">仅有效</el-checkbox><el-button size="small" @click="load">查询</el-button>
      </el-form>
      <el-table :data="list" size="mini">
        <el-table-column label="下级" min-width="180"><template slot-scope="s">{{ s.row.userName || '--' }}（{{ s.row.userPhone || s.row.userId }}）</template></el-table-column>
        <el-table-column label="直属上级" min-width="180"><template slot-scope="s">{{ s.row.parentName || '平台' }}（{{ s.row.parentPhone || s.row.parentUserId || '--' }}）</template></el-table-column>
        <el-table-column prop="roleName" label="下级身份" />
        <el-table-column prop="relationType" label="关系类型" /><el-table-column prop="bindSource" label="绑定来源" />
        <el-table-column prop="effectiveTime" label="生效时间" min-width="145" /><el-table-column prop="expireTime" label="失效时间" min-width="145" />
        <el-table-column label="状态"><template slot-scope="s"><el-tag size="mini" :type="s.row.status?'success':'info'">{{ s.row.status ? '有效' : '历史' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="220" fixed="right"><template slot-scope="s"><el-button type="text" @click="openDetail(s.row)">关系详情</el-button><el-button v-if="s.row.status" type="text" @click="openForce(s.row)">强制调整</el-button><el-button v-if="s.row.status" type="text" class="danger" @click="invalidate(s.row)">失效</el-button></template></el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="首次分配上级" :visible.sync="initialVisible" width="560px">
      <el-alert title="该入口不会覆盖已有关系。已有上级时请让用户提交换绑申请。" type="info" :closable="false" style="margin-bottom:18px" />
      <el-form label-width="120px">
        <el-form-item label="下级用户" required><el-select v-model="initialForm.userId" filterable remote :remote-method="searchUsers" :loading="userLoading" placeholder="姓名/手机号搜索" style="width:100%"><el-option v-for="x in userOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
        <el-form-item label="直属上级"><el-select v-model="initialForm.parentUserId" clearable filterable remote :remote-method="searchParents" :loading="parentLoading" placeholder="清空表示归属平台" style="width:100%" @change="loadInitialQuota"><el-option v-for="x in parentOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
        <el-form-item v-if="initialQuota" label="目标上级额度"><el-tag :type="initialQuota.full?'danger':(initialQuota.warning?'warning':'success')">已用 {{initialQuota.usedCount}} + 预占 {{initialQuota.reservedCount}} / 上限 {{initialQuota.maxDirectChildren}}</el-tag></el-form-item>
        <el-form-item label="来源码"><el-input v-model="initialForm.sourceCode" /></el-form-item>
        <el-form-item label="分配原因" required><el-input v-model.trim="initialForm.changeReason" maxlength="300" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="initialVisible=false">取消</el-button><el-button type="primary" @click="initialBind">确认首次绑定</el-button></span>
    </el-dialog>

    <jk-business-drawer :visible.sync="detailVisible" title="关系与额度详情" size="720px">
      <template #context><div v-if="current" class="context-title">{{current.userName||current.userId}} → {{current.parentName||'平台'}}</div></template>
      <el-descriptions v-if="current" :column="2" border size="small">
        <el-descriptions-item label="下级用户">{{current.userName||'--'}} / {{current.userPhone||current.userId}}</el-descriptions-item>
        <el-descriptions-item label="直属上级">{{current.parentName||'平台'}} / {{current.parentPhone||current.parentUserId||'--'}}</el-descriptions-item>
        <el-descriptions-item label="绑定来源">{{current.bindSource||'--'}}</el-descriptions-item><el-descriptions-item label="关系类型">{{current.relationType||'--'}}</el-descriptions-item>
        <el-descriptions-item label="生效时间">{{current.effectiveTime||'--'}}</el-descriptions-item><el-descriptions-item label="状态">{{current.status?'有效':'历史'}}</el-descriptions-item>
      </el-descriptions>
      <el-card v-if="detailQuota" shadow="never" class="quota-card">
        <div slot="header"><strong>当前上级直属人数额度</strong></div>
        <el-progress :percentage="quotaPercent(detailQuota)" :status="detailQuota.full?'exception':(detailQuota.warning?'warning':undefined)" />
        <div class="quota-grid"><span>上限：{{detailQuota.maxDirectChildren}}</span><span>已用：{{detailQuota.usedCount}}</span><span>预占：{{detailQuota.reservedCount}}</span><span>剩余：{{detailQuota.remainingCount}}</span></div>
        <div class="hint">命中规则：{{detailQuota.ruleName||detailQuota.ruleCode||'默认规则'}}；超额策略：{{detailQuota.overflowPolicy==='APPROVAL'?'专项审批':'直接拒绝'}}</div>
      </el-card>
    </jk-business-drawer>

    <jk-business-drawer :visible.sync="forceVisible" title="管理员强制调整关系" size="720px">
      <template #context><el-alert title="该操作绕过普通换绑流程，但仍执行循环校验、人数额度、审计日志和 CRMEB spreadUid 同步。" type="warning" :closable="false" /></template>
      <el-form label-width="130px">
        <el-form-item label="下级用户"><el-input :value="forceForm.userName+'（'+forceForm.userId+'）'" disabled /></el-form-item>
        <el-form-item label="原直属上级"><el-input :value="forceForm.oldParentName||'平台'" disabled /></el-form-item>
        <el-form-item label="新直属上级"><el-select v-model="forceForm.parentUserId" clearable filterable remote :remote-method="searchParents" :loading="parentLoading" placeholder="清空表示调整为平台归属" style="width:100%" @change="loadForceQuota"><el-option v-for="x in parentOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
        <el-form-item v-if="forceQuota" label="目标上级额度"><el-tag :type="forceQuota.full?'danger':(forceQuota.warning?'warning':'success')">已用 {{forceQuota.usedCount}} + 预占 {{forceQuota.reservedCount}} / 上限 {{forceQuota.maxDirectChildren}}</el-tag></el-form-item>
        <el-form-item label="调整原因" required><el-input v-model.trim="forceForm.reason" type="textarea" :rows="4" maxlength="500" show-word-limit /></el-form-item>
        <el-form-item label="备注"><el-input v-model="forceForm.remark" maxlength="500" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="forceVisible=false">取消</el-button><el-button type="danger" @click="forceAdjust">确认强制调整</el-button></template>
    </jk-business-drawer>
  </div>
</template>

<script>
import JkBusinessDrawer from '@/components/jkBusiness/JkBusinessDrawer'
import { getJkAgentRelationList, bindJkAgentRelation, invalidateJkAgentRelation, getJkUserOptions } from '@/api/jkBusiness'
import { getRelationQuotaUsage, forceAdjustAgentRelation } from '@/api/jkV31'
export default{
  components:{JkBusinessDrawer},
  data(){return{list:[],query:{activeOnly:true},initialVisible:false,initialForm:{},initialQuota:null,detailVisible:false,current:null,detailQuota:null,forceVisible:false,forceForm:{},forceQuota:null,userOptions:[],parentOptions:[],userLoading:false,parentLoading:false}},
  mounted(){this.searchUsers('');this.searchParents('');this.load()},
  methods:{
    load(){getJkAgentRelationList(this.query).then(r=>{this.list=(r&&r.data)||r||[]})},
    searchUsers(keyword){this.userLoading=true;getJkUserOptions({keyword,limit:30}).then(r=>{this.userOptions=(r&&r.data)||r||[]}).finally(()=>{this.userLoading=false})},
    searchParents(keyword){this.parentLoading=true;getJkUserOptions({keyword,limit:30}).then(r=>{this.parentOptions=(r&&r.data)||r||[]}).finally(()=>{this.parentLoading=false})},
    openInitialBind(){this.initialForm={relationType:'DIRECT',bindSource:'ADMIN',changeReason:'后台首次分配'};this.initialQuota=null;this.initialVisible=true},
    loadInitialQuota(){this.initialQuota=null;if(!this.initialForm.parentUserId)return;getRelationQuotaUsage({parentUserId:this.initialForm.parentUserId,childUserId:this.initialForm.userId}).then(r=>{this.initialQuota=(r&&r.data)||r})},
    initialBind(){if(!this.initialForm.userId||!this.initialForm.changeReason)return this.$message.warning('请选择下级用户并填写首次分配原因');bindJkAgentRelation(this.initialForm).then(()=>{this.$message.success('首次关系已建立');this.initialVisible=false;this.load()})},
    openDetail(row){this.current=row;this.detailQuota=null;this.detailVisible=true;if(row.parentUserId)getRelationQuotaUsage({parentUserId:row.parentUserId,childUserId:row.userId}).then(r=>{this.detailQuota=(r&&r.data)||r})},
    quotaPercent(q){if(!q||!q.maxDirectChildren)return 0;return Math.min(100,Math.round((Number(q.usedCount||0)+Number(q.reservedCount||0))*100/Number(q.maxDirectChildren)))},
    openForce(row){this.forceForm={userId:row.userId,userName:row.userName||row.userId,oldParentName:row.parentName||'平台',parentUserId:row.parentUserId,reason:'',remark:''};this.forceQuota=null;this.forceVisible=true;this.loadForceQuota()},
    loadForceQuota(){this.forceQuota=null;if(!this.forceForm.parentUserId)return;getRelationQuotaUsage({parentUserId:this.forceForm.parentUserId,childUserId:this.forceForm.userId}).then(r=>{this.forceQuota=(r&&r.data)||r})},
    forceAdjust(){if(!this.forceForm.reason)return this.$message.warning('请填写强制调整原因');this.$confirm('该操作会立即变更正式关系并写入审计日志，确认继续？','高风险操作',{type:'warning'}).then(()=>forceAdjustAgentRelation(this.forceForm).then(()=>{this.$message.success('关系已强制调整');this.forceVisible=false;this.load()}))},
    invalidate(row){this.$prompt('请输入失效原因','确认',{inputPattern:/\S+/,inputErrorMessage:'原因不能为空'}).then(({value})=>invalidateJkAgentRelation(row.id,value).then(()=>{this.$message.success('已失效');this.load()}))}
  }
}
</script>

<style scoped>.header-row{display:flex;align-items:center;justify-content:space-between}.hint{margin-top:6px;color:#909399;font-size:12px}.danger{color:#f56c6c}.context-title{font-size:16px;font-weight:600}.quota-card{margin-top:20px}.quota-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.quota-grid span{padding:10px;border-radius:4px;background:#f5f7fa;text-align:center}</style>
