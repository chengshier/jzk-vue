<template>
  <div class="divBox">
    <el-alert title="商品和 SKU 均来自 CRMEB 原商品管理。商品级规则可不选 SKU；SKU 规则必须选择属于当前商品的规格。后端会再次校验商品、SKU、价格和版本。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header" class="header-row"><span>商品价格规则</span><el-button size="mini" type="primary" @click="openDialog()">新增规则</el-button></div>
      <el-form :inline="true" size="mini" class="mb15">
        <el-form-item label="商品"><el-select v-model="query.productId" clearable filterable remote reserve-keyword placeholder="选择商品" :remote-method="searchProducts" :loading="productLoading" style="width:240px"><el-option v-for="item in productOptions" :key="item.id" :label="productLabel(item)" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="用户"><el-select v-model="query.userId" clearable filterable remote reserve-keyword placeholder="选择用户" :remote-method="searchUsers" :loading="userLoading" style="width:220px"><el-option v-for="item in userOptions" :key="item.id" :label="item.label" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="角色"><el-select v-model="query.roleCode" clearable placeholder="全部角色"><el-option v-for="item in roleOptions" :key="item.roleCode" :label="item.roleName" :value="item.roleCode" /></el-select></el-form-item>
        <el-form-item label="区域"><el-select v-model="query.regionCode" clearable filterable remote :remote-method="searchRegions" :loading="regionLoading" placeholder="名称/编码搜索" style="width:220px"><el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="query.status" clearable placeholder="全部状态"><el-option label="启用" :value="true" /><el-option label="禁用" :value="false" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="loadData">查询</el-button><el-button @click="resetQuery">重置</el-button></el-form-item>
      </el-form>

      <el-table :data="listData.list" size="mini" :header-cell-style="{ background:'#f8f8f9',color:'#515a6e' }">
        <el-table-column prop="ruleNo" label="规则编号" min-width="150" />
        <el-table-column label="商品" min-width="190"><template slot-scope="{row}"><span :class="{invalid:isInvalidProduct(row)}">{{ row.productName || '商品已删除' }}</span><el-tag v-if="isInvalidProduct(row)" size="mini" type="danger" class="ml6">异常</el-tag></template></el-table-column>
        <el-table-column label="SKU" min-width="190"><template slot-scope="{row}"><div :class="{invalid:isInvalidSku(row)}">{{ row.skuId ? (row.skuText || row.skuName || 'SKU 已删除') : '商品级规则' }}</div><div v-if="row.skuId" class="sub-text">编码：{{ row.skuCode || '--' }}</div></template></el-table-column>
        <el-table-column label="适用范围" min-width="210"><template slot-scope="{row}"><div>{{ row.roleName || '全部身份' }} / {{ row.regionName || '全部区域' }}</div><div class="sub-text">{{ row.userId ? ((row.applicantName || '用户不存在') + ' / ' + (row.applicantPhone || '--')) : '全部用户' }}</div></template></el-table-column>
        <el-table-column label="计价方式" width="150"><template slot-scope="{row}">{{ priceTypeText(row.priceType) }}<div class="sub-text">{{ row.priceType==='FIXED' ? ('¥'+money(row.fixedPrice)) : ((Number(row.discountRate||0)*10).toFixed(2)+'折') }}</div></template></el-table-column>
        <el-table-column prop="ruleVersion" label="版本" width="70" />
        <el-table-column label="状态" width="90"><template slot-scope="{row}"><el-tag size="mini" :type="row.statusTag || (row.status?'success':'info')">{{ row.statusText || (row.status?'启用':'禁用') }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="190" fixed="right"><template slot-scope="{row}"><el-button size="mini" @click="openDialog(row)">编辑</el-button><el-button size="mini" :type="row.status?'warning':'success'" :disabled="!row.status&&isInvalid(row)" @click="toggleStatus(row)">{{ row.status?'禁用':'启用' }}</el-button></template></el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="form.id?'编辑价格规则':'新增价格规则'" :visible.sync="dialogVisible" width="680px">
      <el-alert v-if="form.id&&isInvalid(form)" title="当前规则关联的商品或 SKU 已失效。请重新选择有效商品和规格后再保存或启用。" type="error" :closable="false" style="margin-bottom:14px" />
      <el-form ref="ruleForm" :model="form" :rules="rules" label-width="110px" size="small">
        <el-form-item label="商品" prop="productId"><el-select v-model="form.productId" clearable filterable remote reserve-keyword placeholder="请选择 CRMEB 商品" :remote-method="searchProducts" :loading="productLoading" style="width:100%" @change="handleProductChange"><el-option v-for="item in productOptions" :key="item.id" :label="productLabel(item)" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="SKU"><el-select v-model="form.skuId" clearable filterable :disabled="!form.productId" placeholder="不选表示商品级规则" style="width:100%" @change="handleSkuChange"><el-option v-for="item in skuOptions" :key="item.id" :label="item.label" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="SKU 编码"><el-input v-model="form.skuCode" disabled placeholder="选择 SKU 后自动回填" /></el-form-item>
        <el-form-item label="角色"><el-select v-model="form.roleCode" clearable placeholder="留空表示全部身份" style="width:100%"><el-option v-for="item in roleOptions" :key="item.roleCode" :label="item.roleName" :value="item.roleCode" /></el-select></el-form-item>
        <el-form-item label="区域"><el-cascader v-model="form.regionPath" clearable filterable :props="regionCascaderProps" placeholder="留空表示全部区域" style="width:100%" @change="handleRegionPathChange" /></el-form-item>
        <el-form-item label="指定用户"><el-select v-model="form.userId" clearable filterable remote reserve-keyword placeholder="留空表示全部用户" :remote-method="searchUsers" :loading="userLoading" style="width:100%"><el-option v-for="item in userOptions" :key="item.id" :label="item.label" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="价格类型" prop="priceType"><el-radio-group v-model="form.priceType"><el-radio label="FIXED">固定价</el-radio><el-radio label="DISCOUNT">折扣价</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="form.priceType==='FIXED'" label="固定价" prop="fixedPrice"><el-input-number v-model="form.fixedPrice" :min="0" :precision="2" :step="1" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item v-if="form.priceType==='DISCOUNT'" label="折扣率" prop="discountRate"><el-input-number v-model="form.discountRate" :min="0.001" :max="1" :precision="3" :step="0.01" controls-position="right" style="width:100%" /><div class="form-tip">例如 0.85 表示 8.5 折</div></el-form-item>
        <el-form-item label="规则版本" prop="ruleVersion"><el-input-number v-model="form.ruleVersion" :min="1" :step="1" :precision="0" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="生效时间"><el-date-picker v-model="form.effectiveTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="留空表示立即生效" style="width:100%" /></el-form-item>
        <el-form-item label="失效时间"><el-date-picker v-model="form.expireTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="留空表示长期有效" style="width:100%" /></el-form-item>
        <el-form-item label="备注"><el-input v-model.trim="form.remark" type="textarea" :rows="2" maxlength="300" show-word-limit /></el-form-item>
      </el-form>
      <div slot="footer"><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="submitForm">保存</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { getJkBusinessRoleList, getJkPriceRuleList, getJkPriceRuleRegionOptions, getJkRegionPath, saveJkPriceRule, updateJkPriceRuleStatus } from '@/api/jkBusiness'
import { productDetailApi, productLstApi } from '@/api/store'
import { userListApi } from '@/api/user'

const emptyForm = () => ({ id:null, productId:null, skuId:null, skuCode:'', roleCode:'', regionCode:'', regionPath:[], userId:null, priceType:'FIXED', fixedPrice:null, discountRate:null, ruleVersion:1, effectiveTime:null, expireTime:null, remark:'' })

export default {
  data() {
    return {
      listData:{ list:[] }, query:{ page:1,limit:20,productId:null,userId:null,roleCode:'',regionCode:'',status:null }, dialogVisible:false, saving:false, form:emptyForm(),
      roleOptions:[], regionOptions:[], regionLoading:false, regionCascaderProps:{ lazy:true,emitPath:true,lazyLoad:this.loadRegionNode }, productOptions:[], skuOptions:[], userOptions:[], productLoading:false, userLoading:false,
      rules:{ productId:[{ required:true,message:'请选择商品',trigger:'change' }], priceType:[{ required:true,message:'请选择价格类型',trigger:'change' }], fixedPrice:[{ validator:(r,v,cb)=>this.form.priceType==='FIXED'&&(v===null||v===undefined||Number(v)<0)?cb(new Error('固定价不能小于0')):cb(),trigger:'change' }], discountRate:[{ validator:(r,v,cb)=>this.form.priceType==='DISCOUNT'&&(!(Number(v)>0)||Number(v)>1)?cb(new Error('折扣率必须大于0且不大于1')):cb(),trigger:'change' }], ruleVersion:[{ required:true,message:'规则版本不能为空',trigger:'change' }] }
    }
  },
  mounted(){this.loadRoles();this.loadRegions('');this.searchProducts('');this.loadData()},
  methods:{
    loadRoles(){getJkBusinessRoleList({page:1,limit:100}).then(res=>{const data=res&&res.data?res.data:res;this.roleOptions=(data&&data.list)||data||[]})},
    loadRegions(keyword){this.regionLoading=true;getJkPriceRuleRegionOptions({keyword,enabled:true}).then(res=>{this.regionOptions=(res&&res.data)||res||[]}).finally(()=>{this.regionLoading=false})},
    searchRegions(keyword){this.loadRegions(keyword)},
    loadRegionNode(node,resolve){getJkPriceRuleRegionOptions({parentRegionCode:node.level===0?undefined:node.value,enabled:true}).then(res=>{const rows=(res&&res.data)||res||[];resolve(rows.map(item=>({label:item.label,value:item.value,leaf:item.leaf,disabled:item.disabled})))}).catch(()=>resolve([]))},
    handleRegionPathChange(value){this.form.regionCode=value&&value.length?value[value.length-1]:''},
    loadData(){getJkPriceRuleList(this.query).then(res=>{this.listData=res||{list:[]}})},
    resetQuery(){this.query={page:1,limit:20,productId:null,userId:null,roleCode:'',regionCode:'',status:null};this.loadData()},
    openDialog(row){this.form=row?Object.assign(emptyForm(),row):emptyForm();this.skuOptions=[];if(row&&row.productId){this.ensureProductOption(row.productId,row.productName,this.isInvalidProduct(row));this.handleProductChange(row.productId,row.skuId,row.skuCode)}if(row&&row.userId)this.ensureUserOption(row.userId,row.applicantName,row.applicantPhone,row.userNickname);if(row&&row.regionCode)getJkRegionPath(row.regionCode).then(res=>{const path=(res&&res.data)||res||{};this.$set(this.form,'regionPath',path.fullPathCodes||[])});this.dialogVisible=true;this.$nextTick(()=>this.$refs.ruleForm&&this.$refs.ruleForm.clearValidate())},
    searchProducts(keyword){this.productLoading=true;productLstApi({page:1,limit:30,keywords:keyword||''}).then(res=>{const data=res&&res.data?res.data:res;this.productOptions=(data&&data.list)||[]}).finally(()=>{this.productLoading=false})},
    productLabel(item){return(item.storeName||'商品未命名')+(item.isShow===false||item.isShow===0?'（已下架）':'')},
    ensureProductOption(id,name,invalid){if(id&&!this.productOptions.find(item=>item.id===id))this.productOptions.unshift({id,storeName:name||(invalid?'商品已删除':'历史商品'),isDel:invalid})},
    searchUsers(keyword){if(!keyword&&this.userOptions.length)return;this.userLoading=true;userListApi({keywords:keyword||'',page:1,limit:20}).then(response=>{const users=response.list||response.data||[];this.userOptions=users.map(user=>({id:user.uid||user.id,label:(user.nickname||user.realName||'用户')+'（'+(user.uid||user.id)+'）'}))}).finally(()=>{this.userLoading=false})},
    ensureUserOption(id,name,phone,nickname){if(id&&!this.userOptions.find(item=>item.id===id))this.userOptions.unshift({id,label:(name||nickname||'用户')+'（'+id+'）'+(phone?' '+phone:'')})},
    handleProductChange(productId,presetSkuId,presetSkuCode){this.form.skuId=presetSkuId||null;this.form.skuCode=presetSkuCode||'';this.skuOptions=[];if(!productId)return;productDetailApi(productId).then(res=>{const detail=(res&&res.data)||res||{};this.ensureProductOption(detail.id||productId,detail.storeName,false);this.skuOptions=(detail.attrValue||[]).map(item=>({id:item.id,label:item.attrValue||item.suk||'默认规格',skuCode:item.unique||item.barCode||item.suk||''}));if(presetSkuId&&!this.skuOptions.find(item=>item.id===presetSkuId))this.skuOptions.unshift({id:presetSkuId,label:'SKU 已删除',skuCode:presetSkuCode||''})}).catch(()=>{})},
    handleSkuChange(skuId){const current=this.skuOptions.find(item=>item.id===skuId);this.form.skuCode=current?(current.skuCode||''):''},
    submitForm(){this.$refs.ruleForm.validate(valid=>{if(!valid)return;if(this.form.effectiveTime&&this.form.expireTime&&this.form.expireTime<=this.form.effectiveTime)return this.$message.warning('失效时间必须晚于生效时间');this.saving=true;saveJkPriceRule(this.form).then(()=>{this.$message.success('保存成功');this.dialogVisible=false;this.loadData()}).finally(()=>{this.saving=false})})},
    toggleStatus(row){if(!row.status&&this.isInvalid(row))return this.$message.warning('关联商品或SKU已失效，不能启用');updateJkPriceRuleStatus({id:row.id,status:!row.status}).then(()=>{this.$message.success('操作成功');this.loadData()})},
    isInvalidProduct(row){return !row.productName||row.productName==='商品已删除'},isInvalidSku(row){return !!row.skuId&&(!row.skuName||row.skuName==='SKU 已删除'||row.skuText==='SKU 已删除')},isInvalid(row){return this.isInvalidProduct(row)||this.isInvalidSku(row)},
    priceTypeText(type){return type==='FIXED'?'固定价':type==='DISCOUNT'?'折扣价':type||'--'},money(v){const n=Number(v||0);return Number.isNaN(n)?String(v||'0.00'):n.toFixed(2)}
  }
}
</script>
<style scoped>
.mt14{margin-top:14px}.mb15{margin-bottom:15px}.header-row{display:flex;align-items:center;justify-content:space-between}.sub-text{color:#909399;font-size:12px}.invalid{color:#f56c6c}.ml6{margin-left:6px}.form-tip{margin-top:4px;color:#909399;font-size:12px}
</style>
