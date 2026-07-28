<template>
  <div class="divBox">
    <el-alert :closable="false" type="warning" show-icon title="创客、合伙人、区县代理佣金能力已实现，但所有模板默认关闭。规则必须保存草稿、试算确认、设置未来生效时间后才能发布。" />
    <el-card shadow="never" style="margin-top:14px">
      <div slot="header" class="head"><span>角色佣金规则 V3.1</span><el-button type="primary" size="small" @click="openDraft()">新建草稿</el-button></div>
      <el-form inline size="small">
        <el-form-item label="受益角色"><el-select v-model="query.roleCode" clearable><el-option v-for="x in roles" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="奖励类型"><el-input v-model="query.rewardType" clearable /></el-form-item>
        <el-button size="small" @click="load">查询</el-button>
      </el-form>
      <el-table v-loading="loading" :data="list" size="mini" border>
        <el-table-column prop="ruleCode" label="规则编码" min-width="150" />
        <el-table-column prop="ruleName" label="规则名称" min-width="190" />
        <el-table-column prop="receiverRoleName" label="受益角色" width="110" />
        <el-table-column prop="rewardType" label="奖励类型" min-width="170" />
        <el-table-column prop="sourceTypeText" label="来源" width="110" />
        <el-table-column prop="calculationType" label="计算" width="120" />
        <el-table-column label="参数" width="130"><template slot-scope="s">{{ parameterText(s.row) }}</template></el-table-column>
        <el-table-column label="状态" width="130"><template slot-scope="s"><el-tag :type="s.row.status?'success':'info'">{{ s.row.statusText || (s.row.status?'已发布':'草稿/关闭') }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="230" fixed="right"><template slot-scope="s"><el-button type="text" @click="openDraft(s.row)">编辑/复制</el-button><el-button type="text" @click="openTrial(s.row)">试算</el-button><el-button v-if="s.row.status" type="text" class="danger" @click="disable(s.row)">停用</el-button></template></el-table-column>
      </el-table>
    </el-card>

    <jk-business-drawer :visible.sync="draftVisible" title="佣金规则草稿" size="720px">
      <el-alert :closable="false" type="info" title="编辑已发布规则会自动创建新版本，不会改写历史佣金。" />
      <el-form :model="form" label-width="130px" size="small" style="margin-top:16px">
        <el-form-item label="规则编码" required><el-input v-model.trim="form.ruleCode" /></el-form-item>
        <el-form-item label="规则名称" required><el-input v-model.trim="form.ruleName" /></el-form-item>
        <el-form-item label="业务来源" required><el-select v-model="form.sourceType"><el-option v-for="x in sources" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="奖励类型" required><el-input v-model.trim="form.rewardType" /></el-form-item>
        <el-form-item label="受益人类型" required><el-select v-model="form.beneficiaryType"><el-option v-for="x in beneficiaries" :key="x" :label="x" :value="x" /></el-select></el-form-item>
        <el-form-item label="受益角色"><el-select v-model="form.receiverRoleCode"><el-option v-for="x in roles" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="计算基数" required><el-select v-model="form.baseType"><el-option v-for="x in bases" :key="x" :label="x" :value="x" /></el-select></el-form-item>
        <el-form-item label="计算方式" required><el-select v-model="form.calculationType"><el-option label="比例" value="PERCENT"/><el-option label="每单固定" value="FIXED_PER_ORDER"/><el-option label="按数量固定" value="FIXED_PER_QUANTITY"/><el-option label="阶梯比例" value="TIER_PERCENT"/></el-select></el-form-item>
        <el-form-item v-if="['PERCENT','TIER_PERCENT'].includes(form.calculationType)" label="比例(%)"><el-input-number v-model="form.rate" :min="0" :precision="4" /></el-form-item>
        <el-form-item v-if="form.calculationType==='FIXED_PER_ORDER'" label="每单金额"><el-input-number v-model="form.fixedAmount" :min="0" :precision="2" /></el-form-item>
        <el-form-item v-if="form.calculationType==='FIXED_PER_QUANTITY'" label="单位金额"><el-input-number v-model="form.unitAmount" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="叠加组"><el-input v-model.trim="form.stackGroup" placeholder="同组规则按策略选取" /></el-form-item>
        <el-form-item label="叠加策略"><el-select v-model="form.stackPolicy"><el-option label="同组只取一条" value="MAX_ONE"/><el-option label="取最高金额" value="HIGHEST_AMOUNT"/><el-option label="允许叠加" value="ALLOW_STACK"/></el-select></el-form-item>
        <el-form-item label="单笔上限"><el-input-number v-model="form.perOrderCap" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="结算延迟天数"><el-input-number v-model="form.settleDelayDays" :min="0" /></el-form-item>
        <el-form-item label="风险要求"><el-checkbox v-model="form.requiresRegisteredCustomer">实名客户</el-checkbox><el-checkbox v-model="form.requiresVoucher">付款凭证</el-checkbox><el-checkbox v-model="form.requiresAudit">人工审核</el-checkbox></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <div slot="footer"><el-button @click="draftVisible=false">取消</el-button><el-button type="primary" @click="saveDraft">保存关闭草稿</el-button></div>
    </jk-business-drawer>

    <jk-business-drawer :visible.sync="trialVisible" title="规则试算与发布" size="760px">
      <el-form :model="trial" label-width="130px" size="small">
        <el-form-item label="试算规则"><el-input :value="activeRule.ruleName" disabled /></el-form-item>
        <el-form-item label="业绩归属用户" required><el-input-number v-model="trial.ownerUserId" :min="1" /></el-form-item>
        <el-form-item label="直属上级"><el-input-number v-model="trial.directParentUserId" :min="1" /></el-form-item>
        <el-form-item label="所属区县代理"><el-input-number v-model="trial.countyAgentUserId" :min="1" /></el-form-item>
        <el-form-item label="销售/发货用户"><el-input-number v-model="trial.sellerUserId" :min="1" /></el-form-item>
        <el-form-item label="采购/收货用户"><el-input-number v-model="trial.purchaserUserId" :min="1" /></el-form-item>
        <el-form-item label="计算基数" required><el-input-number v-model="trial.baseAmount" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="成本金额"><el-input-number v-model="trial.costAmount" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="数量"><el-input-number v-model="trial.quantity" :min="1" /></el-form-item>
        <el-form-item label="风险条件"><el-checkbox v-model="trial.registeredCustomer">实名客户</el-checkbox><el-checkbox v-model="trial.voucherPresent">有凭证</el-checkbox><el-checkbox v-model="trial.audited">已审核</el-checkbox></el-form-item>
      </el-form>
      <el-button type="primary" size="small" @click="runTrial">执行试算</el-button>
      <el-table v-if="trialRows.length" :data="trialRows" size="mini" border style="margin-top:14px"><el-table-column prop="matchResult" label="匹配结果"/><el-table-column prop="beneficiaryUserId" label="受益用户"/><el-table-column prop="baseAmount" label="基数"/><el-table-column prop="cappedAmount" label="预计佣金"/><el-table-column prop="stackPolicy" label="叠加策略"/></el-table>
      <el-divider>发布设置</el-divider>
      <el-form label-width="130px" size="small"><el-form-item label="生效时间" required><el-date-picker v-model="publishForm.effectiveStartTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" /></el-form-item><el-form-item label="失效时间"><el-date-picker v-model="publishForm.effectiveEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" /></el-form-item><el-form-item label="发布备注"><el-input v-model="publishForm.remark" /></el-form-item></el-form>
      <el-alert :closable="false" type="warning" title="发布只影响生效时间之后的新业务，不追溯历史。" />
      <div slot="footer"><el-button @click="trialVisible=false">关闭</el-button><el-button type="primary" :disabled="!trialConfirmed" @click="publishRule">确认发布</el-button></div>
    </jk-business-drawer>
  </div>
</template>
<script>
import JkBusinessDrawer from '@/components/jkBusiness/JkBusinessDrawer'
import { saveJkCommissionRule } from '@/api/jkBusiness'
import { getCommissionV31Templates, trialCommissionV31, publishCommissionV31, disableCommissionV31 } from '@/api/jkV31'
const draft=()=>({ruleCode:'',ruleName:'',sourceType:'RETAIL_SALE',rewardType:'',beneficiaryType:'PERFORMANCE_OWNER',receiverRoleCode:'maker',baseType:'ITEM_PAID_AMOUNT',calculationType:'PERCENT',rate:null,fixedAmount:null,unitAmount:null,stackGroup:'',stackPolicy:'MAX_ONE',priority:0,perOrderCap:null,settleDelayDays:0,requiresRegisteredCustomer:false,requiresVoucher:false,requiresAudit:false,remark:''})
export default { components:{JkBusinessDrawer}, data(){return{query:{},loading:false,list:[],draftVisible:false,trialVisible:false,form:draft(),activeRule:{},trial:{ownerUserId:null,directParentUserId:null,countyAgentUserId:null,sellerUserId:null,purchaserUserId:null,baseAmount:0,costAmount:0,quantity:1,registeredCustomer:true,voucherPresent:true,audited:true},trialRows:[],trialConfirmed:false,publishForm:{effectiveStartTime:'',effectiveEndTime:'',remark:''},roles:[{label:'创客',value:'maker'},{label:'合伙人',value:'partner'},{label:'区县代理',value:'county_agent'}],sources:[{label:'线上零售',value:'RETAIL_ORDER'},{label:'终端零售',value:'RETAIL_SALE'},{label:'平台订货',value:'PLATFORM_ORDER'},{label:'库存调拨',value:'STOCK_TRANSFER'},{label:'周期业绩',value:'PERFORMANCE_PERIOD'}],beneficiaries:['PERFORMANCE_OWNER','DIRECT_PARENT_SNAPSHOT','COUNTY_AGENT_SNAPSHOT','SELLER_SNAPSHOT','PURCHASER_SNAPSHOT','TRANSFER_SENDER_SNAPSHOT','TRANSFER_RECEIVER_SNAPSHOT'],bases:['ITEM_PAID_AMOUNT','PLATFORM_ORDER_AMOUNT','TRANSFER_AMOUNT','VALID_PERFORMANCE_AMOUNT','VALID_QUANTITY','REAL_GROSS_PROFIT']}},
created(){this.load()},methods:{rows(r){return(r&&r.data&&r.data.list)||(r&&r.data)||r||[]},load(){this.loading=true;getCommissionV31Templates(this.query).then(r=>{this.list=this.rows(r)}).finally(()=>{this.loading=false})},parameterText(r){if(r.rate!=null)return r.rate+'%';if(r.fixedAmount!=null)return '¥'+r.fixedAmount;if(r.unitAmount!=null)return '¥'+r.unitAmount+'/件';return '未配置'},openDraft(row){this.form=row?Object.assign(draft(),row,{id:row.id}):draft();this.draftVisible=true},saveDraft(){if(!this.form.ruleCode||!this.form.ruleName||!this.form.rewardType)return this.$message.warning('请填写规则编码、名称和奖励类型');saveJkCommissionRule(this.form).then(()=>{this.$message.success('已保存为关闭草稿');this.draftVisible=false;this.load()})},openTrial(row){this.activeRule=row;this.trial={ruleId:row.id,sourceType:row.sourceType,ownerUserId:null,directParentUserId:null,countyAgentUserId:null,sellerUserId:null,purchaserUserId:null,regionCode:row.regionCode||'',baseAmount:0,costAmount:0,quantity:1,registeredCustomer:true,voucherPresent:true,audited:true};this.trialRows=[];this.trialConfirmed=false;this.publishForm={ruleId:row.id,trialConfirmed:true,effectiveStartTime:'',effectiveEndTime:'',remark:''};this.trialVisible=true},runTrial(){if(!this.trial.ownerUserId)return this.$message.warning('请填写业绩归属用户');trialCommissionV31(this.trial).then(r=>{this.trialRows=this.rows(r);this.trialConfirmed=this.trialRows.some(x=>x.matched&&x.selected);if(!this.trialConfirmed)this.$message.warning('当前试算没有选中可入账规则')})},publishRule(){if(!this.publishForm.effectiveStartTime)return this.$message.warning('请选择生效时间');publishCommissionV31(this.publishForm).then(()=>{this.$message.success('规则已发布');this.trialVisible=false;this.load()})},disable(row){this.$prompt('请输入停用原因','停用规则',{inputPattern:/\S+/,inputErrorMessage:'原因不能为空'}).then(({value})=>disableCommissionV31({ruleId:row.id,reason:value}).then(()=>{this.$message.success('已停用');this.load()}))}}}
</script>
<style scoped>.head{display:flex;align-items:center;justify-content:space-between}.danger{color:#f56c6c}</style>
