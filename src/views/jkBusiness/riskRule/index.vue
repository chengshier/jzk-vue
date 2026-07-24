<template>
  <div class="app-container">
    <el-alert title="风险规则只产生告警，不会自动冻结库存、扣减资金或修改健康数据。真实环境确认阈值后再开启定时扫描。" type="warning" :closable="false" style="margin-bottom:16px" />
    <div class="filter-container">
      <el-input v-model="query.keyword" placeholder="编码/名称" style="width:200px" clearable />
      <el-select v-model="query.scannerType" clearable placeholder="扫描器">
        <el-option v-for="x in scannerOptions" :key="x.value" :label="x.label" :value="x.value" />
      </el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="success" @click="open()">新增规则</el-button>
      <el-button type="warning" @click="runAll">执行全部启用规则</el-button>
    </div>
    <el-table :data="list" border>
      <el-table-column prop="ruleCode" label="规则编码" min-width="170" />
      <el-table-column prop="ruleName" label="规则名称" min-width="160" />
      <el-table-column prop="scannerType" label="扫描类型" min-width="190" />
      <el-table-column prop="riskLevel" label="等级" width="90" />
      <el-table-column prop="thresholdValue" label="阈值" width="90" />
      <el-table-column prop="windowHours" label="窗口(小时)" width="110" />
      <el-table-column prop="lastScanStatus" label="最近扫描" width="100" />
      <el-table-column prop="lastScanTime" label="扫描时间" min-width="160" />
      <el-table-column label="启用" width="80"><template slot-scope="{row}"><el-switch :value="row.enabled" @change="v=>toggle(row,v)" /></template></el-table-column>
      <el-table-column label="操作" width="160"><template slot-scope="{row}"><el-button type="text" @click="open(row)">编辑</el-button><el-button type="text" @click="run(row)">扫描</el-button></template></el-table-column>
    </el-table>
    <el-dialog title="风险规则" :visible.sync="visible" width="620px">
      <el-form :model="form" label-width="110px">
        <el-form-item label="规则编码"><el-input v-model="form.ruleCode" /></el-form-item>
        <el-form-item label="规则名称"><el-input v-model="form.ruleName" /></el-form-item>
        <el-form-item label="扫描类型"><el-select v-model="form.scannerType" style="width:100%"><el-option v-for="x in scannerOptions" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item label="风险类型"><el-input v-model="form.riskType" placeholder="如 STOCK_AGING" /></el-form-item>
        <el-form-item label="风险等级"><el-select v-model="form.riskLevel" style="width:100%"><el-option label="低" value="LOW"/><el-option label="中" value="MEDIUM"/><el-option label="高" value="HIGH"/><el-option label="严重" value="CRITICAL"/></el-select></el-form-item>
        <el-form-item label="阈值"><el-input-number v-model="form.thresholdValue" :min="1" /></el-form-item>
        <el-form-item label="统计窗口"><el-input-number v-model="form.windowHours" :min="1" /><span style="margin-left:8px">小时，仅越权聚合等规则使用</span></el-form-item>
        <el-form-item label="扩展配置"><el-input v-model="form.configJson" type="textarea" :rows="3" placeholder="JSON，可留空" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.enabled" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkRiskRuleList, saveJkRiskRule, enableJkRiskRule, runJkRiskRule, runAllJkRiskRules } from '@/api/jkBusiness'
const empty = () => ({ ruleCode:'', ruleName:'', scannerType:'STOCK_AGING', riskType:'STOCK_AGING', riskLevel:'MEDIUM', thresholdValue:60, windowHours:24, configJson:'', enabled:false, remark:'' })
export default {
  data(){return{query:{page:1,limit:50},list:[],visible:false,form:empty(),scannerOptions:[
    {label:'库存库龄',value:'STOCK_AGING'},{label:'冻结库存超时',value:'STOCK_FROZEN_TIMEOUT'},{label:'库存总账与批次账差异',value:'STOCK_BATCH_MISMATCH'},{label:'业务事件死信',value:'DEAD_EVENT'},{label:'账户对账差异',value:'ACCOUNT_MISMATCH'},{label:'健康越权访问聚集',value:'HEALTH_DENIED_BURST'}
  ]}},
  created(){this.load()},
  methods:{
    load(){getJkRiskRuleList(this.query).then(r=>{const d=r&&r.data?r.data:r;this.list=(d&&d.list)||[]})},
    open(row){this.form=row?Object.assign(empty(),row):empty();this.visible=true},
    save(){saveJkRiskRule(this.form).then(()=>{this.$message.success('已保存');this.visible=false;this.load()})},
    toggle(row,v){enableJkRiskRule(row.id,v).then(()=>{this.$message.success('已更新');this.load()})},
    run(row){this.$confirm('本次只生成风险事件，不会自动改账，确认执行？','提示').then(()=>runJkRiskRule(row.id)).then(r=>{this.$message.success(`已发现 ${r.data||0} 项`);this.load()})},
    runAll(){this.$confirm('执行全部已启用规则？','提示').then(()=>runAllJkRiskRules()).then(r=>{this.$message.success(`已发现 ${r.data||0} 项`);this.load()})}
  }
}
</script>
