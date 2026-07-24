<template>
  <div class="divBox">
    <el-alert title="权限编码会被后端注解和角色授权直接使用，保存后不可随意改码；启停会刷新受影响用户权限缓存。" type="warning" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header" class="header-row"><span>业务权限点管理</span><el-button size="mini" type="primary" @click="openEdit()">新增权限点</el-button></div>
      <el-table :data="list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column label="模块" width="130"><template slot-scope="{row}">{{ row.moduleName || row.moduleCode || '--' }}</template></el-table-column>
        <el-table-column prop="permissionCode" label="权限点编码" min-width="230" />
        <el-table-column prop="permissionName" label="权限点名称" min-width="150" />
        <el-table-column label="类型" width="90"><template slot-scope="{row}">{{ row.permissionTypeText || row.permissionType || '--' }}</template></el-table-column>
        <el-table-column label="启用" width="80"><template slot-scope="{row}"><el-switch v-model="row.enabled" @change="changeStatus(row)" /></template></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" />
        <el-table-column label="操作" width="70"><template slot-scope="{row}"><el-button type="text" @click="openEdit(row)">编辑</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog :title="form.id ? '编辑权限点' : '新增权限点'" :visible.sync="visible" width="580px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="权限编码"><el-input v-model.trim="form.permissionCode" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="权限名称"><el-input v-model.trim="form.permissionName" /></el-form-item>
        <el-form-item label="模块编码"><el-input v-model.trim="form.moduleCode" /></el-form-item>
        <el-form-item label="权限类型"><el-select v-model="form.permissionType"><el-option label="接口" value="API"/><el-option label="菜单" value="MENU"/><el-option label="按钮" value="BUTTON"/><el-option label="数据范围" value="DATA"/></el-select></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.enabled" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkBusinessPermissionList, saveJkBusinessPermission, updateJkBusinessPermissionStatus } from '@/api/jkBusiness';
const defaults = () => ({ id: null, permissionCode: '', permissionName: '', moduleCode: '', permissionType: 'API', enabled: true, remark: '' });
export default {
  data() { return { list: [], visible: false, form: defaults() }; },
  mounted() { this.load(); },
  methods: {
    load() { getJkBusinessPermissionList().then(res => { this.list = res || []; }); },
    openEdit(row) { this.form = row ? { ...defaults(), ...row } : defaults(); this.visible = true; },
    submit() { if (!this.form.permissionCode || !this.form.permissionName || !this.form.moduleCode) return this.$message.warning('请完整填写权限编码、名称和模块'); saveJkBusinessPermission(this.form).then(() => { this.$message.success('保存成功'); this.visible = false; this.load(); }); },
    changeStatus(row) { updateJkBusinessPermissionStatus(row.id, row.enabled).then(() => this.$message.success('状态已更新')).catch(() => { row.enabled = !row.enabled; }); },
  },
};
</script>
<style scoped>.mt14{margin-top:14px}.header-row{display:flex;justify-content:space-between;align-items:center}</style>
