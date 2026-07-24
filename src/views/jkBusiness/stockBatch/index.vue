<template>
  <div class="app-container">
    <el-alert title="批次账与库存总账同事务更新。首次部署前必须确认没有冻结库存，再执行期初批次初始化。数量只能由业务流水改变，页面只维护成本、生产日期和有效期。" type="warning" :closable="false" style="margin-bottom:16px" />
    <div class="filter-container">
      <el-input v-model="q.stockAccountId" placeholder="库存账户ID" clearable style="width:160px" />
      <el-input v-model="q.productId" placeholder="商品ID" clearable style="width:140px" />
      <el-select v-model="q.agingLevel" clearable placeholder="库龄等级"><el-option label="30天关注" value="ATTENTION"/><el-option label="60天预警" value="WARNING"/><el-option label="90天严重" value="SERIOUS"/></el-select>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="danger" @click="initOpening">初始化期初批次</el-button>
    </div>
    <el-table v-loading="loading" :data="list" border>
      <el-table-column prop="batchNo" label="批次号" min-width="190" />
      <el-table-column prop="accountName" label="库存主体" min-width="150" />
      <el-table-column prop="productName" label="商品" min-width="170" />
      <el-table-column prop="skuName" label="SKU" min-width="150" />
      <el-table-column prop="availableQty" label="可用" width="75" />
      <el-table-column prop="frozenQty" label="冻结" width="75" />
      <el-table-column prop="outboundQty" label="已出库" width="80" />
      <el-table-column prop="unitCost" label="单位成本" width="100" />
      <el-table-column prop="productionDate" label="生产日期" min-width="155" />
      <el-table-column prop="expireTime" label="有效期" min-width="155" />
      <el-table-column prop="inboundTime" label="入库时间" min-width="155" />
      <el-table-column prop="ageDays" label="库龄" width="75" />
      <el-table-column prop="ageLevel" label="等级" width="90" />
      <el-table-column label="操作" width="80"><template slot-scope="{row}"><el-button type="text" @click="edit(row)">维护</el-button></template></el-table-column>
    </el-table>
    <el-dialog title="维护批次元数据" :visible.sync="visible" width="520px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="批次号"><el-input :value="form.batchNo" disabled /></el-form-item>
        <el-form-item label="单位成本"><el-input-number v-model="form.unitCost" :min="0" :precision="4" style="width:100%" /></el-form-item>
        <el-form-item label="生产日期"><el-date-picker v-model="form.productionDate" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" /></el-form-item>
        <el-form-item label="有效期"><el-date-picker v-model="form.expireTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkStockBatchList, initJkStockBatchOpening, updateJkStockBatchMetadata } from '@/api/jkBusiness'
export default {
  data(){return{q:{page:1,limit:100,stockAccountId:'',productId:'',agingLevel:''},list:[],loading:false,visible:false,form:{}}},
  created(){this.load()},
  methods:{
    rows(r){const d=r&&r.data?r.data:r;return(d&&d.list)||[]},
    load(){this.loading=true;getJkStockBatchList(this.q).then(r=>this.list=this.rows(r)).finally(()=>this.loading=false)},
    initOpening(){this.$confirm('仅在升级前审计确认 frozen_qty=0 后执行。是否继续？','高风险操作',{type:'warning'}).then(()=>initJkStockBatchOpening().then(r=>{this.$message.success('新增期初批次 '+((r&&r.data)||0)+' 条');this.load()}))},
    edit(row){this.form={id:row.id,batchNo:row.batchNo,unitCost:row.unitCost,productionDate:row.productionDate,expireTime:row.expireTime};this.visible=true},
    save(){updateJkStockBatchMetadata(this.form).then(()=>{this.$message.success('已保存');this.visible=false;this.load()})}
  }
}
</script>
