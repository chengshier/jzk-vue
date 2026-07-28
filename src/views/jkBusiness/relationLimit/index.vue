<template>
  <div class="divBox">
    <el-card shadow="never">
      <div slot="header" class="header-row">
        <div><strong>绑定人数规则</strong><div class="hint">默认 50 人仅是可配置种子；规则按角色、区域和优先级匹配。</div></div>
        <el-button type="primary" size="mini" @click="openCreate">新增规则</el-button>
      </div>
      <el-form inline size="small">
        <el-form-item label="关键词"><el-input v-model.trim="query.keyword" clearable placeholder="规则编码/名称" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option label="启用" :value="true"/><el-option label="停用" :value="false"/></el-select></el-form-item>
        <el-button size="small" type="primary" @click="load">查询</el-button>
      </el-form>
      <el-table v-loading="loading" :data="list" size="mini">
        <el-table-column prop="ruleCode" label="规则编码" min-width="165" />
        <el-table-column prop="ruleName" label="规则名称" min-width="150" />
        <el-table-column label="适用上级"><template slot-scope="s">{{ roleName(s.row.parentRoleCode) }}</template></el-table-column>
        <el-table-column label="适用下级"><template slot-scope="s">{{ roleName(s.row.childRoleCode) }}</template></el-table-column>
        <el-table-column prop="regionCode" label="区域"><template slot-scope="s">{{ s.row.regionCode || '全部区域' }}</template></el-table-column>
        <el-table-column prop="maxDirectChildren" label="人数上限" width="90" />
        <el-table-column prop="warningThreshold" label="预警(%)" width="85" />
        <el-table-column label="超额策略" width="95"><template slot-scope="s">{{ s.row.overflowPolicy === 'APPROVAL' ? '专项审批' : '直接拒绝' }}</template></el-table-column>
        <el-table-column prop="priority" label="优先级" width="75" />
        <el-table-column label="状态" width="90"><template slot-scope="s"><el-tag size="mini" :type="s.row.status?'success':'info'">{{ s.row.status?'启用':'停用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150" fixed="right"><template slot-scope="s"><el-button type="text" @click="edit(s.row)">编辑</el-button><el-button type="text" @click="toggle(s.row)">{{s.row.status?'停用':'启用'}}</el-button></template></el-table-column>
      </el-table>
      <el-pagination :current-page="query.page" :page-size="query.limit" :total="total" layout="total, prev, pager, next" @current-change="pageChange" />
    </el-card>

    <jk-business-drawer :visible.sync="drawer" :title="form.id?'编辑绑定人数规则':'新增绑定人数规则'" size="720px">
      <template #context><el-alert type="info" :closable="false" title="更具体的角色/区域规则优先于通用规则；生产启用前请先核对影响人数。" /></template>
      <el-form ref="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="规则编码" prop="ruleCode"><el-input v-model.trim="form.ruleCode" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="规则名称" prop="ruleName"><el-input v-model.trim="form.ruleName" /></el-form-item>
        <el-form-item label="版本号"><el-input v-model.trim="form.versionNo" placeholder="V1" /></el-form-item>
        <el-form-item label="适用上级角色"><el-select v-model="form.parentRoleCode" clearable style="width:100%"><el-option v-for="x in parentRoles" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="适用下级角色"><el-select v-model="form.childRoleCode" clearable style="width:100%"><el-option v-for="x in childRoles" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="区域编码"><el-input v-model.trim="form.regionCode" placeholder="留空表示全部区域" /></el-form-item>
        <el-form-item label="直属人数上限" prop="maxDirectChildren"><el-input-number v-model="form.maxDirectChildren" :min="0" :max="100000" /></el-form-item>
        <el-form-item label="预警阈值"><el-input-number v-model="form.warningThreshold" :min="1" :max="100" /> %</el-form-item>
        <el-form-item label="超额策略"><el-radio-group v-model="form.overflowPolicy"><el-radio label="REJECT">直接拒绝</el-radio><el-radio label="APPROVAL">专项审批</el-radio></el-radio-group></el-form-item>
        <el-form-item label="优先级"><el-input-number v-model="form.priority" :min="-9999" :max="9999" /></el-form-item>
        <el-form-item label="生效时间"><el-date-picker v-model="form.effectiveStartTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="可留空" /></el-form-item>
        <el-form-item label="失效时间"><el-date-picker v-model="form.effectiveEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="可留空" /></el-form-item>
        <el-form-item label="保存后启用"><el-switch v-model="form.status" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><el-button @click="drawer=false">取消</el-button><el-button type="primary" :loading="saving" @click="submit">保存</el-button></template>
    </jk-business-drawer>
  </div>
</template>

<script>
import JkBusinessDrawer from '@/components/jkBusiness/JkBusinessDrawer'
import { getRelationLimitRuleList, saveRelationLimitRule, updateRelationLimitRuleStatus } from '@/api/jkV31'
const ROLES={normal_user:'普通用户',maker:'创客',partner:'合伙人',county_agent:'区县代理'}
export default{
  components:{JkBusinessDrawer},
  data(){return{loading:false,saving:false,drawer:false,list:[],total:0,query:{page:1,limit:20},form:{},parentRoles:[{label:'创客',value:'maker'},{label:'合伙人',value:'partner'},{label:'区县代理',value:'county_agent'}],childRoles:Object.keys(ROLES).map(x=>({label:ROLES[x],value:x})),rules:{ruleCode:[{required:true,message:'请输入规则编码',trigger:'blur'}],ruleName:[{required:true,message:'请输入规则名称',trigger:'blur'}],maxDirectChildren:[{required:true,message:'请输入人数上限',trigger:'change'}]}}},
  mounted(){this.load()},
  methods:{
    roleName(code){return code?(ROLES[code]||code):'全部角色'},
    load(){this.loading=true;getRelationLimitRuleList(this.query).then(r=>{const d=(r&&r.data)||r||{};this.list=d.list||d.records||d;this.total=Number(d.total||this.list.length||0)}).finally(()=>{this.loading=false})},
    pageChange(page){this.query.page=page;this.load()},
    defaults(){return{versionNo:'V1',maxDirectChildren:50,warningThreshold:80,overflowPolicy:'REJECT',priority:0,status:false}},
    openCreate(){this.form=this.defaults();this.drawer=true},
    edit(row){this.form=Object.assign(this.defaults(),JSON.parse(JSON.stringify(row)));this.drawer=true},
    submit(){this.$refs.form.validate(valid=>{if(!valid)return;this.saving=true;saveRelationLimitRule(this.form).then(()=>{this.$message.success('规则已保存');this.drawer=false;this.load()}).finally(()=>{this.saving=false})})},
    toggle(row){this.$confirm(`确认${row.status?'停用':'启用'}规则“${row.ruleName}”？`,'提示').then(()=>updateRelationLimitRuleStatus(row.id,!row.status).then(()=>{this.$message.success('状态已更新');this.load()}))}
  }
}
</script>

<style scoped>.header-row{display:flex;align-items:center;justify-content:space-between}.hint{margin-top:6px;color:#909399;font-size:12px}.el-pagination{margin-top:18px;text-align:right}</style>
