<template>
  <div class="divBox">
    <el-alert title="状态、流水类型和审核动作由动态字典维护；角色、权限和区域名称仍由各自业务表维护。" type="info" :closable="false" />
    <el-row :gutter="14" class="mt14">
      <el-col :span="9">
        <el-card shadow="never">
          <div slot="header" class="header-row"><span>字典类型</span><el-button size="mini" type="primary" @click="openType()">新增类型</el-button></div>
          <el-input v-model="keywords" size="mini" clearable placeholder="编码或名称" @keyup.enter.native="loadTypes"><el-button slot="append" icon="el-icon-search" @click="loadTypes" /></el-input>
          <el-table :data="types" size="mini" highlight-current-row class="mt14" @current-change="selectType">
            <el-table-column prop="dictType" label="类型编码" min-width="150" />
            <el-table-column prop="dictName" label="类型名称" min-width="120" />
            <el-table-column label="启用" width="70"><template slot-scope="{row}"><el-switch v-model="row.status" @change="changeTypeStatus(row)" /></template></el-table-column>
            <el-table-column label="操作" width="70"><template slot-scope="{row}"><el-button type="text" @click.stop="openType(row)">编辑</el-button></template></el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="15">
        <el-card shadow="never">
          <div slot="header" class="header-row"><span>字典项{{ currentType ? '：' + currentType.dictName : '' }}</span><el-button size="mini" type="primary" :disabled="!currentType" @click="openItem()">新增字典项</el-button></div>
          <el-empty v-if="!currentType" description="请先选择左侧字典类型" />
          <el-table v-else :data="items" size="mini">
            <el-table-column prop="itemCode" label="编码" min-width="130" />
            <el-table-column prop="itemLabel" label="中文名称" min-width="130" />
            <el-table-column prop="itemTag" label="标签样式" width="100" />
            <el-table-column prop="sort" label="排序" width="70" />
            <el-table-column label="启用" width="70"><template slot-scope="{row}"><el-switch v-model="row.status" @change="changeItemStatus(row)" /></template></el-table-column>
            <el-table-column label="操作" width="70"><template slot-scope="{row}"><el-button type="text" @click="openItem(row)">编辑</el-button></template></el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :title="typeForm.id ? '编辑字典类型' : '新增字典类型'" :visible.sync="typeVisible" width="520px">
      <el-form :model="typeForm" label-width="100px">
        <el-form-item label="类型编码"><el-input v-model.trim="typeForm.dictType" :disabled="!!typeForm.id" /></el-form-item>
        <el-form-item label="类型名称"><el-input v-model.trim="typeForm.dictName" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="typeForm.status" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="typeForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="typeVisible=false">取消</el-button><el-button type="primary" @click="submitType">保存</el-button></span>
    </el-dialog>

    <el-dialog :title="itemForm.id ? '编辑字典项' : '新增字典项'" :visible.sync="itemVisible" width="560px">
      <el-form :model="itemForm" label-width="100px">
        <el-form-item label="字典类型"><el-input v-model="itemForm.dictType" disabled /></el-form-item>
        <el-form-item label="字典项编码"><el-input v-model.trim="itemForm.itemCode" :disabled="!!itemForm.id" /></el-form-item>
        <el-form-item label="中文名称"><el-input v-model.trim="itemForm.itemLabel" /></el-form-item>
        <el-form-item label="标签样式"><el-select v-model="itemForm.itemTag" clearable><el-option label="默认" value="info"/><el-option label="成功" value="success"/><el-option label="警告" value="warning"/><el-option label="危险" value="danger"/></el-select></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="itemForm.sort" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="itemForm.status" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="itemForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="itemVisible=false">取消</el-button><el-button type="primary" @click="submitItem">保存</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { getJkDictTypeList, saveJkDictType, updateJkDictTypeStatus, getJkDictItemList, saveJkDictItem, updateJkDictItemStatus } from '@/api/jkBusiness';
const typeDefault = () => ({ id: null, dictType: '', dictName: '', remark: '', status: true });
const itemDefault = (dictType = '') => ({ id: null, dictType, itemCode: '', itemLabel: '', itemTag: 'info', sort: 0, remark: '', status: true });
export default {
  data() { return { keywords: '', types: [], items: [], currentType: null, typeVisible: false, itemVisible: false, typeForm: typeDefault(), itemForm: itemDefault() }; },
  mounted() { this.loadTypes(); },
  methods: {
    loadTypes() { getJkDictTypeList({ keywords: this.keywords }).then(res => { this.types = res || []; if (this.currentType) { const fresh = this.types.find(v => v.id === this.currentType.id); if (fresh) this.selectType(fresh); } }); },
    selectType(row) { if (!row) return; this.currentType = row; getJkDictItemList({ dictType: row.dictType }).then(res => { this.items = res || []; }); },
    openType(row) { this.typeForm = row ? { ...row } : typeDefault(); this.typeVisible = true; },
    submitType() { if (!this.typeForm.dictType || !this.typeForm.dictName) return this.$message.warning('请填写类型编码和名称'); saveJkDictType(this.typeForm).then(() => { this.$message.success('保存成功'); this.typeVisible = false; this.loadTypes(); }); },
    changeTypeStatus(row) { updateJkDictTypeStatus(row.id, row.status).then(() => this.$message.success('状态已更新')).catch(() => { row.status = !row.status; }); },
    openItem(row) { this.itemForm = row ? { ...row } : itemDefault(this.currentType.dictType); this.itemVisible = true; },
    submitItem() { if (!this.itemForm.itemCode || !this.itemForm.itemLabel) return this.$message.warning('请填写字典项编码和中文名称'); saveJkDictItem(this.itemForm).then(() => { this.$message.success('保存成功'); this.itemVisible = false; this.selectType(this.currentType); }); },
    changeItemStatus(row) { updateJkDictItemStatus(row.id, row.status).then(() => this.$message.success('状态已更新')).catch(() => { row.status = !row.status; }); },
  },
};
</script>
<style scoped>.header-row{display:flex;align-items:center;justify-content:space-between}.mt14{margin-top:14px}</style>
