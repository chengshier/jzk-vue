<template>
  <div class="divBox">
    <el-alert title="盘点先固化账面快照。审核时如快照后的库存已经发生正常业务变化，系统会拒绝用过期盘点覆盖真实库存。" type="warning" :closable="false" />
    <el-card shadow="never" class="mt14">
      <el-form :inline="true" size="mini">
        <el-form-item label="状态"><el-select v-model="query.status" clearable><el-option v-for="x in statuses" :key="x.value" :label="x.label" :value="x.value" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="load">查询</el-button><el-button type="success" @click="openCreate">创建盘点</el-button></el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="data.list" size="mini">
        <el-table-column prop="checkNo" label="盘点单号" min-width="170" />
        <el-table-column prop="ownerName" label="库存主体" min-width="150" />
        <el-table-column prop="checkType" label="盘点类型" width="100" />
        <el-table-column label="差异数量" width="100"><template slot-scope="{row}"><span :class="{danger:Number(row.differenceQuantity)!==0}">{{ row.differenceQuantity || 0 }}</span></template></el-table-column>
        <el-table-column label="差异金额" width="120"><template slot-scope="{row}">¥{{ money(row.differenceAmount) }}</template></el-table-column>
        <el-table-column label="状态" width="110"><template slot-scope="{row}"><el-tag size="mini" :type="tag(row.status)">{{ statusText(row.status) }}</el-tag></template></el-table-column>
        <el-table-column prop="snapshotTime" label="快照时间" min-width="160" />
        <el-table-column label="操作" width="150" fixed="right"><template slot-scope="{row}"><el-button type="text" @click="view(row)">详情</el-button><el-button v-if="row.status==='SUBMITTED'" type="text" @click="audit(row)">审核</el-button></template></el-table-column>
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="Number(data.total||0)" :current-page="query.page" :page-size="query.limit" @current-change="p=>{query.page=p;load()}" />
    </el-card>

    <el-dialog title="创建盘点" :visible.sync="createVisible" width="520px">
      <el-form label-width="100px">
        <el-form-item label="库存主体">
          <el-select v-model="createForm.stockAccountId" filterable style="width:100%" placeholder="请选择真实库存主体">
            <el-option v-for="x in accounts" :key="x.id" :label="accountLabel(x)" :value="x.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="盘点类型"><el-select v-model="createForm.checkType" style="width:100%"><el-option label="全盘" value="FULL" /><el-option label="抽盘" value="PARTIAL" /></el-select></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="createVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="create">创建账面快照</el-button></span>
    </el-dialog>

    <el-drawer title="盘点详情" :visible.sync="detailVisible" size="72%">
      <div v-if="detail" class="drawer-body">
        <el-descriptions :column="3" border><el-descriptions-item label="盘点单号">{{detail.checkNo}}</el-descriptions-item><el-descriptions-item label="状态">{{statusText(detail.status)}}</el-descriptions-item><el-descriptions-item label="快照时间">{{detail.snapshotTime}}</el-descriptions-item></el-descriptions>
        <el-table :data="detail.items||[]" size="mini" class="mt14">
          <el-table-column prop="productName" label="商品" min-width="160" /><el-table-column prop="skuName" label="规格" min-width="140" /><el-table-column prop="bookQuantity" label="账面" width="80" /><el-table-column prop="actualQuantity" label="实盘" width="80" /><el-table-column prop="differenceQuantity" label="差异" width="80" /><el-table-column prop="adjustStatus" label="调整状态" width="100" />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { getJkStockAccountList } from '@/api/jkBusiness'
import { getStockCheckList, getStockCheckDetail, createStockCheck, auditStockCheck } from '@/api/jkPhase3'
export default {
  data() { return { loading:false,saving:false,data:{list:[],total:0},query:{page:1,limit:20,status:''},statuses:[{label:'盘点中',value:'COUNTING'},{label:'待审核',value:'SUBMITTED'},{label:'已通过',value:'APPROVED'},{label:'已驳回',value:'REJECTED'}],createVisible:false,detailVisible:false,detail:null,accounts:[],createForm:{stockAccountId:null,checkType:'FULL'} } },
  created(){ this.load(); this.loadAccounts() },
  methods:{
    load(){this.loading=true;getStockCheckList(this.query).then(r=>{const d=r.data||r||{};this.data={list:d.list||d.records||[],total:d.total||0}}).finally(()=>this.loading=false)},
    loadAccounts(){getJkStockAccountList({page:1,limit:200,status:true}).then(r=>{const d=r.data||r||{};this.accounts=d.list||d.records||[]})},
    openCreate(){this.createForm={stockAccountId:null,checkType:'FULL'};this.createVisible=true},
    create(){if(!this.createForm.stockAccountId)return this.$message.warning('请选择库存主体');this.saving=true;createStockCheck({...this.createForm,requestNo:'CHECK-'+Date.now()}).then(()=>{this.$message.success('盘点快照已创建');this.createVisible=false;this.load()}).finally(()=>this.saving=false)},
    view(row){getStockCheckDetail(row.id).then(r=>{this.detail=r.data||r;this.detailVisible=true})},
    audit(row){this.$prompt('请输入审核说明','盘点审核',{inputValidator:v=>!!String(v||'').trim()||'审核说明不能为空'}).then(({value})=>auditStockCheck({checkId:row.id,approved:true,requestNo:'AUDIT-'+row.id+'-'+Date.now(),remark:value}).then(()=>{this.$message.success('审核完成');this.load()})).catch(()=>{})},
    accountLabel(x){return [x.accountNo,x.ownerName||x.roleName||x.accountTypeText].filter(Boolean).join(' / ')},money(v){return Number(v||0).toFixed(2)},statusText(v){return {COUNTING:'盘点中',SUBMITTED:'待审核',APPROVED:'已通过',REJECTED:'已驳回',CANCELLED:'已取消'}[v]||v},tag(v){return v==='APPROVED'?'success':v==='REJECTED'?'danger':v==='SUBMITTED'?'warning':'info'}
  }
}
</script>
<style scoped>.mt14{margin-top:14px}.drawer-body{padding:0 24px 30px}.danger{color:#f56c6c;font-weight:600}.el-pagination{margin-top:18px;text-align:right}</style>
