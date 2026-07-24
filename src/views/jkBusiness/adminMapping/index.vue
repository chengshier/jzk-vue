<template>
  <div class="divBox">
    <el-card shadow="never">
      <div slot="header"><span>后台业务用户映射</span><el-button size="mini" type="primary" style="float:right" @click="edit()">新增映射</el-button></div>
      <el-alert title="非超级管理员必须显式映射一个前台业务用户，后台业务权限和数据范围才可正确生效。" type="warning" :closable="false" />
      <el-table :data="list" size="mini" class="mt14">
        <el-table-column label="后台管理员"><template slot-scope="s">{{ s.row.adminRealName || '--' }}（{{ s.row.adminAccount || s.row.systemAdminId }}）</template></el-table-column>
        <el-table-column label="前台业务用户"><template slot-scope="s">{{ s.row.frontUserName || '--' }}（{{ s.row.frontUserPhone || s.row.frontUserId }}）</template></el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="状态" width="90"><template slot-scope="s"><el-switch v-model="s.row.status" @change="status(s.row)" /></template></el-table-column>
        <el-table-column label="操作" width="80"><template slot-scope="s"><el-button type="text" @click="edit(s.row)">编辑</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="后台业务用户映射" :visible.sync="visible" width="560px">
      <el-form label-width="130px">
        <el-form-item label="后台管理员" required><el-select v-model="form.systemAdminId" filterable remote :remote-method="searchAdmins" :loading="adminLoading" placeholder="姓名或账号搜索" style="width:100%"><el-option v-for="x in adminOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
        <el-form-item label="前台业务用户" required><el-select v-model="form.frontUserId" filterable remote :remote-method="searchUsers" :loading="userLoading" placeholder="姓名或手机号搜索" style="width:100%"><el-option v-for="x in userOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
        <el-form-item label="备注"><el-input v-model.trim="form.remark" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkAdminMappingList, saveJkAdminMapping, updateJkAdminMappingStatus, getJkAdminOptions, getJkUserOptions } from '@/api/jkBusiness'
export default {
  data() { return { list: [], visible: false, form: { status: true }, adminOptions: [], userOptions: [], adminLoading: false, userLoading: false } },
  mounted() { this.searchAdmins(''); this.searchUsers(''); this.load() },
  methods: {
    load() { getJkAdminMappingList({}).then(r => { this.list = (r && r.data) || r || [] }) },
    searchAdmins(keyword) { this.adminLoading = true; getJkAdminOptions({ keyword, limit: 30 }).then(r => { this.adminOptions = (r && r.data) || r || [] }).finally(() => { this.adminLoading = false }) },
    searchUsers(keyword) { this.userLoading = true; getJkUserOptions({ keyword, limit: 30 }).then(r => { this.userOptions = (r && r.data) || r || [] }).finally(() => { this.userLoading = false }) },
    edit(row) { this.form = row ? Object.assign({}, row) : { status: true }; if (row) { this.adminOptions = [{ value: String(row.systemAdminId), label: (row.adminRealName || row.adminAccount || '管理员') + '（ID:' + row.systemAdminId + '）' }]; this.userOptions = [{ value: String(row.frontUserId), label: (row.frontUserName || '用户') + ' / ' + (row.frontUserPhone || '--') + '（ID:' + row.frontUserId + '）' }] } this.visible = true },
    save() { if (!this.form.systemAdminId || !this.form.frontUserId) return this.$message.warning('请选择后台管理员和前台业务用户'); saveJkAdminMapping(this.form).then(() => { this.$message.success('保存成功'); this.visible = false; this.load() }) },
    status(row) { updateJkAdminMappingStatus(row.id, row.status).then(() => this.$message.success('状态已更新')) }
  }
}
</script>
