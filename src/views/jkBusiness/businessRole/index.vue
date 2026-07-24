<template>
  <div class="divBox">
    <el-alert title="角色只负责权限集合；库存、区域和团队访问仍由数据范围校验，不允许在业务代码中硬编码角色。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header" class="header-row"><span>业务角色管理</span><el-button size="mini" type="primary" @click="openEdit()">新增角色</el-button></div>
      <el-table :data="list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="roleCode" label="角色编码" min-width="120" />
        <el-table-column prop="roleName" label="角色名称" min-width="120" />
        <el-table-column prop="roleLevel" label="等级" width="70" />
        <el-table-column label="前台申请" width="90"><template slot-scope="{row}">{{ row.allowFrontApply ? '允许' : '不允许' }}</template></el-table-column>
        <el-table-column label="需审核" width="80"><template slot-scope="{row}">{{ row.needAudit ? '是' : '否' }}</template></el-table-column>
        <el-table-column label="启用" width="80"><template slot-scope="{row}"><el-switch v-model="row.enabled" @change="changeStatus(row)" /></template></el-table-column>
        <el-table-column label="权限点" min-width="320"><template slot-scope="{row}">{{ (row.permissionDisplayList || row.permissionNames || row.permissionCodes || []).join(' / ') || '--' }}</template></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" />
        <el-table-column label="操作" width="150" fixed="right"><template slot-scope="{row}"><el-button type="text" @click="openEdit(row)">编辑</el-button><el-button type="text" @click="openPermission(row)">配置权限</el-button></template></el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="form.id ? '编辑业务角色' : '新增业务角色'" :visible.sync="editVisible" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="角色编码"><el-input v-model.trim="form.roleCode" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="角色名称"><el-input v-model.trim="form.roleName" /></el-form-item>
        <el-form-item label="角色类型"><el-select v-model="form.roleType"><el-option label="前台业务身份" value="FRONT_BUSINESS"/><el-option label="后台业务身份" value="BACK_BUSINESS"/></el-select></el-form-item>
        <el-form-item label="角色等级"><el-input-number v-model="form.roleLevel" :min="0" /></el-form-item>
        <el-form-item label="需审核"><el-switch v-model="form.needAudit" /></el-form-item>
        <el-form-item label="前台可申请"><el-switch v-model="form.allowFrontApply" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.enabled" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="editVisible=false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></span>
    </el-dialog>

    <el-dialog title="配置角色权限" :visible.sync="permissionVisible" width="720px">
      <div class="permission-title">{{ currentRole && currentRole.roleName }}</div>
      <el-checkbox-group v-model="checkedPermissions">
        <div v-for="group in permissionGroups" :key="group.moduleCode" class="permission-group">
          <div class="module-title">{{ group.moduleName }}</div>
          <el-checkbox v-for="item in group.items" :key="item.permissionCode" :label="item.permissionCode" :disabled="!item.enabled">{{ item.permissionName }}（{{ item.permissionCode }}）</el-checkbox>
        </div>
      </el-checkbox-group>
      <span slot="footer"><el-button @click="permissionVisible=false">取消</el-button><el-button type="primary" @click="submitPermissions">保存授权</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkBusinessRoleList, updateJkBusinessRoleStatus, saveJkBusinessRole, assignJkBusinessRolePermissions, getJkBusinessPermissionList } from '@/api/jkBusiness';
const defaults = () => ({ id: null, roleCode: '', roleName: '', roleType: 'FRONT_BUSINESS', roleLevel: 0, needAudit: true, allowFrontApply: true, enabled: true, sort: 0, remark: '' });
export default {
  data() { return { list: [], permissions: [], editVisible: false, permissionVisible: false, form: defaults(), currentRole: null, checkedPermissions: [] }; },
  computed: { permissionGroups() { const map = {}; (this.permissions || []).forEach(v => { const key = v.moduleCode || 'other'; if (!map[key]) map[key] = { moduleCode: key, moduleName: v.moduleName || key, items: [] }; map[key].items.push(v); }); return Object.values(map); } },
  mounted() { this.loadData(); getJkBusinessPermissionList().then(res => { this.permissions = res || []; }); },
  methods: {
    loadData() { getJkBusinessRoleList({}).then(res => { this.list = res || []; }); },
    changeStatus(row) { updateJkBusinessRoleStatus({ roleId: row.id, enabled: row.enabled }).then(() => this.$message.success('状态已更新')).catch(() => { row.enabled = !row.enabled; }); },
    openEdit(row) { this.form = row ? { ...defaults(), ...row } : defaults(); this.editVisible = true; },
    submit() { if (!this.form.roleCode || !this.form.roleName) return this.$message.warning('请填写角色编码和名称'); saveJkBusinessRole(this.form).then(() => { this.$message.success('保存成功'); this.editVisible = false; this.loadData(); }); },
    openPermission(row) { this.currentRole = row; this.checkedPermissions = [...(row.permissionCodes || [])]; this.permissionVisible = true; },
    submitPermissions() { assignJkBusinessRolePermissions({ roleId: this.currentRole.id, permissionCodes: this.checkedPermissions }).then(() => { this.$message.success('授权已更新'); this.permissionVisible = false; this.loadData(); }); },
  },
};
</script>
<style scoped>.mt14{margin-top:14px}.header-row{display:flex;justify-content:space-between;align-items:center}.permission-title{font-weight:600;margin-bottom:12px}.permission-group{padding:10px 0;border-bottom:1px solid #eee}.module-title{margin-bottom:8px;font-weight:600}.permission-group .el-checkbox{display:block;margin:6px 0}</style>
