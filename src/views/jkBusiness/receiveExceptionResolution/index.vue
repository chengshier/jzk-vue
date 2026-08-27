<template>
  <div class="divBox">
    <el-alert title="处理方案必须从异常单真实商品明细中选择，不允许手填商品或异常明细 ID。补发、退款、退回和接受数量合计不得超过短缺与破损剩余数量。" type="warning" :closable="false" />

    <el-card shadow="never" class="mt14">
      <el-form :inline="true" size="mini">
        <el-form-item label="异常单ID"><el-input-number v-model="exceptionId" :min="1" controls-position="right" /></el-form-item>
        <el-form-item><el-button type="primary" @click="load">加载异常单</el-button><el-button type="success" :disabled="!canCreate" @click="openCreate">创建处理方案</el-button></el-form-item>
      </el-form>

      <el-descriptions v-if="exception" :column="4" border size="small">
        <el-descriptions-item label="异常单号">{{ exception.exceptionNo }}</el-descriptions-item>
        <el-descriptions-item label="业务单号">{{ exception.businessNo }}</el-descriptions-item>
        <el-descriptions-item label="收货人">{{ exception.receiverName || exception.receiverUserId }}</el-descriptions-item>
        <el-descriptions-item label="状态"><el-tag size="mini" :type="exception.status==='PROCESSING'?'info':'warning'">{{ exception.statusText || exception.status }}</el-tag></el-descriptions-item>
        <el-descriptions-item label="应收/实收">{{ exception.expectedTotalQty || 0 }} / {{ exception.receivedTotalQty || 0 }}</el-descriptions-item>
        <el-descriptions-item label="短缺/破损">{{ exception.shortageTotalQty || 0 }} / {{ exception.damagedTotalQty || 0 }}</el-descriptions-item>
        <el-descriptions-item label="异常原因" :span="2">{{ exception.exceptionReason || '--' }}</el-descriptions-item>
      </el-descriptions>

      <el-table v-if="exceptionItems.length" :data="exceptionItems" size="mini" border class="mt14">
        <el-table-column prop="productName" label="商品" min-width="170" />
        <el-table-column label="规格" min-width="150"><template slot-scope="{row}"><div>{{row.skuName||'默认规格'}}</div><small>{{row.skuCode||'--'}}</small></template></el-table-column>
        <el-table-column prop="expectedQty" label="应收" width="75" />
        <el-table-column prop="receivedQty" label="实收" width="75" />
        <el-table-column prop="shortageQty" label="短缺" width="75" />
        <el-table-column prop="damagedQty" label="破损" width="75" />
        <el-table-column label="已分配" width="80"><template slot-scope="{row}">{{ allocated(row.id) }}</template></el-table-column>
        <el-table-column label="剩余可处理" width="105"><template slot-scope="{row}"><strong :class="{danger:remaining(row)<=0}">{{ remaining(row) }}</strong></template></el-table-column>
      </el-table>

      <el-empty v-if="loaded&&!exception" description="请从异常收货工作台进入，或输入有效异常单 ID" />
    </el-card>

    <el-card v-for="x in resolutions" :key="x.id" shadow="never" class="resolution">
      <div slot="header" class="head">
        <div><strong>{{x.resolutionNo}}</strong><el-tag size="mini" class="ml8">{{x.resolutionTypeText||typeText(x.resolutionType)}}</el-tag></div>
        <el-tag size="mini" :type="x.resolutionStatus==='COMPLETED'?'success':x.resolutionStatus==='CANCELLED'?'info':'warning'">{{x.resolutionStatusText||statusText(x.resolutionStatus)}}</el-tag>
      </div>
      <el-descriptions :column="4" size="mini"><el-descriptions-item label="接受数量">{{x.acceptedQuantity||0}}</el-descriptions-item><el-descriptions-item label="补发数量">{{x.reshipQuantity||0}}</el-descriptions-item><el-descriptions-item label="退款金额">¥{{money(x.refundAmount)}}</el-descriptions-item><el-descriptions-item label="索赔金额">¥{{money(x.claimAmount)}}</el-descriptions-item></el-descriptions>
      <el-table :data="x.items||[]" size="mini" border>
        <el-table-column label="商品" min-width="170"><template slot-scope="{row}">{{ itemName(row.exceptionItemId) }}</template></el-table-column>
        <el-table-column prop="acceptedQty" label="接受" width="70"/><el-table-column prop="reshipQty" label="补发" width="70"/><el-table-column prop="refundQty" label="退款" width="70"/><el-table-column prop="returnQty" label="退回" width="70"/>
        <el-table-column label="补发物流" min-width="180"><template slot-scope="{row}">{{row.logisticsCompany||'--'}} / {{row.logisticsNo||'--'}}</template></el-table-column>
        <el-table-column prop="itemRemark" label="说明" min-width="160"/>
      </el-table>
      <div v-if="x.resolutionStatus==='PENDING_CONFIRM'" class="actions"><el-button size="mini" type="primary" @click="complete(x)">确认真实完成</el-button><el-button size="mini" @click="cancel(x)">取消方案</el-button></div>
    </el-card>
    <el-empty v-if="loaded&&exception&&!resolutions.length" description="该异常单暂无 V2 处理方案" />

    <el-dialog title="创建异常收货V2处理方案" :visible.sync="visible" width="1050px">
      <el-form :inline="true" size="small">
        <el-form-item label="处理类型"><el-select v-model="form.resolutionType" @change="resetQuantities"><el-option label="补发" value="RESHIP"/><el-option label="差额退款" value="REFUND"/><el-option label="退回异常商品" value="RETURN"/><el-option label="接受现状" value="ACCEPT"/><el-option label="组合处理" value="MIXED"/></el-select></el-form-item>
        <el-form-item label="责任方"><el-select v-model="form.responsibilityParty" clearable><el-option label="平台" value="PLATFORM"/><el-option label="发货方" value="SENDER"/><el-option label="物流" value="LOGISTICS"/><el-option label="收货方" value="RECEIVER"/></el-select></el-form-item>
        <el-form-item v-if="hasRefund" label="退款金额"><el-input-number v-model="form.refundAmount" :min="0" :precision="2" /></el-form-item>
      </el-form>
      <el-table :data="form.items" size="mini" border>
        <el-table-column prop="productName" label="商品" min-width="160" />
        <el-table-column label="剩余" width="70"><template slot-scope="{row}">{{row.remainingQty}}</template></el-table-column>
        <el-table-column label="接受" width="110"><template slot-scope="{row}"><el-input-number v-model="row.acceptedQty" :disabled="!allow('accepted')" :min="0" :max="row.remainingQty" size="mini" controls-position="right"/></template></el-table-column>
        <el-table-column label="补发" width="110"><template slot-scope="{row}"><el-input-number v-model="row.reshipQty" :disabled="!allow('reship')" :min="0" :max="row.remainingQty" size="mini" controls-position="right"/></template></el-table-column>
        <el-table-column label="退款" width="110"><template slot-scope="{row}"><el-input-number v-model="row.refundQty" :disabled="!allow('refund')" :min="0" :max="row.remainingQty" size="mini" controls-position="right"/></template></el-table-column>
        <el-table-column label="退回" width="110"><template slot-scope="{row}"><el-input-number v-model="row.returnQty" :disabled="!allow('return')" :min="0" :max="row.remainingQty" size="mini" controls-position="right"/></template></el-table-column>
        <el-table-column label="物流公司" min-width="120"><template slot-scope="{row}"><el-input v-model.trim="row.logisticsCompany" :disabled="!allow('reship')" size="mini"/></template></el-table-column>
        <el-table-column label="物流单号" min-width="130"><template slot-scope="{row}"><el-input v-model.trim="row.logisticsNo" :disabled="!allow('reship')" size="mini"/></template></el-table-column>
        <el-table-column label="说明" min-width="150"><template slot-scope="{row}"><el-input v-model.trim="row.itemRemark" size="mini"/></template></el-table-column>
      </el-table>
      <el-form label-width="90px" class="mt14"><el-form-item label="处理说明"><el-input v-model.trim="form.remark" type="textarea" :rows="3" /></el-form-item></el-form>
      <el-alert title="创建方案只登记处理依据，不会立即修改库存或资金。点击“确认真实完成”前必须核对补发物流、退款、退回等真实动作。" type="info" :closable="false" />
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存待确认方案</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkReceiveExceptionDetail } from '@/api/jkReceiveException'
import { getReceiveResolutionList, createReceiveResolution, completeReceiveResolution, cancelReceiveResolution } from '@/api/jkPhase3'
export default{
  data(){return{exceptionId:Number(this.$route.query.exceptionId)||null,loaded:false,exception:null,exceptionItems:[],resolutions:[],visible:false,saving:false,form:{resolutionType:'RESHIP',responsibilityParty:'',refundAmount:0,claimAmount:0,remark:'',items:[]}}},
  computed:{hasRefund(){return this.form.resolutionType==='REFUND'||this.form.resolutionType==='MIXED'},canCreate(){return this.exception&&['PENDING','PROCESSING'].includes(this.exception.status)&&this.exceptionItems.some(x=>this.remaining(x)>0)}},
  created(){if(this.exceptionId)this.load()},
  methods:{
    load(){if(!this.exceptionId)return this.$message.warning('请输入异常单ID');this.loaded=false;Promise.all([getJkReceiveExceptionDetail(this.exceptionId),getReceiveResolutionList({exceptionId:this.exceptionId})]).then(([a,b])=>{const d=a.data||a||{};this.exception=d.exception||null;this.exceptionItems=d.items||[];this.resolutions=b.data||b||[]}).finally(()=>this.loaded=true)},
    allocated(id){let n=0;this.resolutions.filter(x=>x.resolutionStatus!=='CANCELLED').forEach(x=>(x.items||[]).filter(i=>i.exceptionItemId===id).forEach(i=>{n+=Number(i.acceptedQty||0)+Number(i.reshipQty||0)+Number(i.refundQty||0)+Number(i.returnQty||0)}));return n},
    remaining(row){return Math.max(0,Number(row.shortageQty||0)+Number(row.damagedQty||0)-this.allocated(row.id))},
    openCreate(){this.form={resolutionType:'RESHIP',responsibilityParty:'',refundAmount:0,claimAmount:0,remark:'',items:this.exceptionItems.filter(x=>this.remaining(x)>0).map(x=>({exceptionItemId:x.id,productName:x.productName,remainingQty:this.remaining(x),acceptedQty:0,reshipQty:0,refundQty:0,returnQty:0,logisticsCompany:'',logisticsNo:'',itemRemark:''}))};this.visible=true},
    allow(field){return this.form.resolutionType==='MIXED'||({accepted:'ACCEPT',reship:'RESHIP',refund:'REFUND',return:'RETURN'}[field]===this.form.resolutionType)},
    resetQuantities(){this.form.items.forEach(x=>{x.acceptedQty=0;x.reshipQty=0;x.refundQty=0;x.returnQty=0;if(!this.allow('reship')){x.logisticsCompany='';x.logisticsNo=''}})},
    save(){const items=this.form.items.filter(x=>Number(x.acceptedQty||0)+Number(x.reshipQty||0)+Number(x.refundQty||0)+Number(x.returnQty||0)>0).map(({productName,remainingQty,...x})=>x);if(!items.length)return this.$message.warning('至少为一个异常商品填写处理数量');if(!this.form.remark)return this.$message.warning('处理说明不能为空');if(items.some(x=>Number(x.acceptedQty||0)+Number(x.reshipQty||0)+Number(x.refundQty||0)+Number(x.returnQty||0)>this.form.items.find(i=>i.exceptionItemId===x.exceptionItemId).remainingQty))return this.$message.warning('处理数量超过剩余异常数量');this.saving=true;createReceiveResolution({...this.form,items,exceptionId:this.exceptionId,requestNo:'RESOLUTION-'+this.exceptionId+'-'+Date.now(),evidenceUrls:[]}).then(()=>{this.$message.success('处理方案已创建，尚未修改库存或资金');this.visible=false;this.load()}).finally(()=>this.saving=false)},
    complete(x){this.$prompt('请填写补发物流、退款、退回等真实完成依据','确认处理完成',{inputValidator:v=>!!String(v||'').trim()||'完成依据不能为空'}).then(({value})=>completeReceiveResolution({resolutionId:x.id,requestNo:'COMPLETE-'+x.id+'-'+Date.now(),remark:value}).then(()=>{this.$message.success('处理进度已更新');this.load()})).catch(()=>{})},
    cancel(x){this.$prompt('请输入取消原因','取消处理方案',{inputValidator:v=>!!String(v||'').trim()||'原因不能为空'}).then(({value})=>cancelReceiveResolution({resolutionId:x.id,requestNo:'CANCEL-'+x.id+'-'+Date.now(),remark:value}).then(()=>{this.$message.success('方案已取消');this.load()})).catch(()=>{})},
    itemName(id){const x=this.exceptionItems.find(i=>i.id===id);return x?(x.productName+' / '+(x.skuName||x.skuCode||'默认规格')):('异常明细 '+id)},money(v){return Number(v||0).toFixed(2)},typeText(v){return {RESHIP:'补发',REFUND:'差额退款',RETURN:'退回异常商品',ACCEPT:'接受现状',MIXED:'组合处理'}[v]||v},statusText(v){return {PENDING_CONFIRM:'待确认',COMPLETED:'已完成',CANCELLED:'已取消'}[v]||v}
  }
}
</script>
<style scoped>.mt14{margin-top:14px}.resolution{margin-top:14px}.head{display:flex;align-items:center;justify-content:space-between}.ml8{margin-left:8px}.actions{margin-top:14px;text-align:right}.danger{color:#f56c6c}small{color:#909399}</style>
