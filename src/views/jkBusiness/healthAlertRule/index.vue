<template>
  <div class="app-container">
    <el-alert title="个人规则优先于平台默认规则；当前 V1 仅对血糖数值执行自动预警。用户留空表示平台默认规则。" type="info" :closable="false" style="margin-bottom:16px"/>
    <div class="filter-container">
      <jk-user-remote-select v-model="query.ownerUserId" placeholder="规则用户姓名 / 手机号" class="filter-item"/>
      <el-select v-model="query.dataType" clearable placeholder="数据类型" class="filter-item" style="width:140px"><el-option label="血糖" value="GLUCOSE"/></el-select>
      <el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button><el-button type="success" @click="edit()">新增规则</el-button>
    </div>
    <el-table v-loading="loading" :data="listData.list" border>
      <el-table-column prop="ruleName" label="规则名称" min-width="170"/>
      <el-table-column label="适用用户" min-width="180"><template slot-scope="{row}"><div>{{row.ownerUserId?(row.ownerName||row.ownerNickname||'用户不存在'):'平台默认规则'}}</div><div v-if="row.ownerUserId" class="sub-text">{{row.ownerPhone||row.ownerUserId}}</div></template></el-table-column>
      <el-table-column label="检测时段" width="120"><template slot-scope="{row}">{{periodText(row.periodCode)}}</template></el-table-column>
      <el-table-column prop="minValue" label="下限" width="90"/><el-table-column prop="maxValue" label="上限" width="90"/>
      <el-table-column label="风险等级" width="100"><template slot-scope="{row}"><el-tag size="mini" :type="riskTag(row.alertLevel)">{{riskText(row.alertLevel)}}</el-tag></template></el-table-column>
      <el-table-column label="启用" width="80"><template slot-scope="{row}"><el-tag size="mini" :type="row.enabled?'success':'info'">{{row.enabled?'启用':'停用'}}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="80"><template slot-scope="{row}"><el-button type="text" @click="edit(row)">编辑</el-button></template></el-table-column>
    </el-table>
    <el-pagination class="mt20" :current-page="query.page" :page-size="query.limit" :total="listData.total" layout="total, prev, pager, next, jumper" @current-change="pageChange"/>

    <el-dialog :visible.sync="visible" title="健康预警规则" width="560px">
      <el-form label-width="105px">
        <el-form-item label="规则名称" required><el-input v-model.trim="form.ruleName" maxlength="80"/></el-form-item>
        <el-form-item label="适用用户"><jk-user-remote-select v-model="form.ownerUserId" placeholder="留空表示平台默认规则" width="100%"/></el-form-item>
        <el-form-item label="数据类型" required><el-select v-model="form.dataType" style="width:100%"><el-option label="血糖" value="GLUCOSE"/></el-select></el-form-item>
        <el-form-item label="检测时段"><el-select v-model="form.periodCode" clearable placeholder="全部时段" style="width:100%"><el-option label="空腹" value="FASTING"/><el-option label="餐前" value="BEFORE_MEAL"/><el-option label="餐后2小时" value="AFTER_MEAL_2H"/><el-option label="睡前" value="BEFORE_SLEEP"/><el-option label="随机" value="RANDOM"/></el-select></el-form-item>
        <el-form-item label="正常下限" required><el-input-number v-model="form.minValue" :precision="2" :min="0" :max="50" style="width:100%"/></el-form-item>
        <el-form-item label="正常上限" required><el-input-number v-model="form.maxValue" :precision="2" :min="0" :max="50" style="width:100%"/></el-form-item>
        <el-form-item label="风险等级" required><el-select v-model="form.alertLevel" style="width:100%"><el-option label="低风险" value="LOW"/><el-option label="中风险" value="MEDIUM"/><el-option label="高风险" value="HIGH"/></el-select></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.enabled"/></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import JkUserRemoteSelect from '@/components/JkUserRemoteSelect'
import {getJkHealthAlertRuleList,saveJkHealthAlertRule} from '@/api/jkBusiness'
export default{
  components:{JkUserRemoteSelect},
  data(){return{query:{page:1,limit:20,ownerUserId:null,dataType:''},listData:{list:[],total:0},loading:false,visible:false,saving:false,form:{dataType:'GLUCOSE',alertLevel:'MEDIUM',enabled:true,ownerUserId:null,periodCode:''}}},created(){this.load()},
  methods:{
    load(){this.loading=true;getJkHealthAlertRuleList(this.query).then(r=>{const p=(r&&r.data)||r||{};this.listData={list:p.list||p.records||[],total:Number(p.total||0)}}).finally(()=>this.loading=false)},search(){this.query.page=1;this.load()},reset(){this.query={page:1,limit:20,ownerUserId:null,dataType:''};this.load()},pageChange(p){this.query.page=p;this.load()},
    edit(row){this.form=row?Object.assign({},row):{dataType:'GLUCOSE',alertLevel:'MEDIUM',enabled:true,ownerUserId:null,periodCode:''};this.visible=true},
    save(){if(!this.form.ruleName)return this.$message.warning('请填写规则名称');if(this.form.minValue===null||this.form.maxValue===null)return this.$message.warning('请填写上下限');if(Number(this.form.minValue)>=Number(this.form.maxValue))return this.$message.warning('正常下限必须小于正常上限');this.saving=true;saveJkHealthAlertRule(this.form).then(()=>{this.$message.success('保存成功');this.visible=false;this.load()}).finally(()=>this.saving=false)},
    periodText(v){return{FASTING:'空腹',BEFORE_MEAL:'餐前',AFTER_MEAL_2H:'餐后2小时',BEFORE_SLEEP:'睡前',RANDOM:'随机'}[v]||'全部时段'},riskText(v){return{LOW:'低风险',MEDIUM:'中风险',HIGH:'高风险'}[v]||v||'--'},riskTag(v){if(v==='HIGH')return'danger';if(v==='MEDIUM')return'warning';return'success'}
  }
}
</script>
<style scoped>.filter-item{margin-right:10px}.sub-text{color:#909399;font-size:12px}</style>
