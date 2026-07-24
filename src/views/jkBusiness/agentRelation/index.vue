<template>
  <div class="divBox">
    <el-card shadow="never">
      <div slot="header"><span>上下级关系管理</span><el-button size="mini" type="primary" style="float:right" @click="openBind">绑定/换绑</el-button></div>
      <el-form inline size="small">
        <el-form-item label="下级用户">
          <el-select v-model="query.userId" clearable filterable remote :remote-method="searchUsers" :loading="userLoading" placeholder="姓名/手机号搜索" style="width:240px"><el-option v-for="x in userOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select>
        </el-form-item>
        <el-form-item label="直属上级">
          <el-select v-model="query.parentUserId" clearable filterable remote :remote-method="searchParents" :loading="parentLoading" placeholder="姓名/手机号搜索" style="width:240px"><el-option v-for="x in parentOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select>
        </el-form-item>
        <el-checkbox v-model="query.activeOnly">仅有效</el-checkbox><el-button size="small" @click="load">查询</el-button>
      </el-form>
      <el-table :data="list" size="mini">
        <el-table-column label="下级"><template slot-scope="s">{{ s.row.userName || '--' }}（{{ s.row.userPhone || s.row.userId }}）</template></el-table-column>
        <el-table-column label="直属上级"><template slot-scope="s">{{ s.row.parentName || '平台' }}（{{ s.row.parentPhone || s.row.parentUserId || '--' }}）</template></el-table-column>
        <el-table-column prop="relationType" label="关系类型" /><el-table-column prop="bindSource" label="绑定来源" />
        <el-table-column prop="effectiveTime" label="生效时间" /><el-table-column prop="expireTime" label="失效时间" />
        <el-table-column label="状态"><template slot-scope="s">{{ s.row.status ? '有效' : '历史' }}</template></el-table-column>
        <el-table-column label="操作" width="90"><template slot-scope="s"><el-button v-if="s.row.status" type="text" @click="invalidate(s.row)">失效</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="绑定/换绑上下级" :visible.sync="visible" width="560px">
      <el-form label-width="120px">
        <el-form-item label="下级用户" required>
          <el-select v-model="form.userId" filterable remote :remote-method="searchUsers" :loading="userLoading" placeholder="姓名/手机号搜索" style="width:100%"><el-option v-for="x in userOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select>
        </el-form-item>
        <el-form-item label="直属上级">
          <el-select v-model="form.parentUserId" clearable filterable remote :remote-method="searchParents" :loading="parentLoading" placeholder="清空表示归属平台" style="width:100%"><el-option v-for="x in parentOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select>
        </el-form-item>
        <el-form-item label="关系类型"><el-select v-model="form.relationType"><el-option label="后台维护" value="MANUAL" /><el-option label="扫码绑定" value="QR" /><el-option label="旧分销迁移" value="LEGACY_SPREAD" /></el-select></el-form-item>
        <el-form-item label="来源码"><el-input v-model="form.sourceCode" /></el-form-item>
        <el-form-item label="变更原因" required><el-input v-model.trim="form.changeReason" maxlength="300" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="bind">确认</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkAgentRelationList, bindJkAgentRelation, invalidateJkAgentRelation, getJkUserOptions } from '@/api/jkBusiness'
export default {
  data() { return { list: [], query: { activeOnly: true }, visible: false, form: { relationType: 'MANUAL', bindSource: 'ADMIN' }, userOptions: [], parentOptions: [], userLoading: false, parentLoading: false } },
  mounted() { this.searchUsers(''); this.searchParents(''); this.load() },
  methods: {
    load() { getJkAgentRelationList(this.query).then(r => { this.list = (r && r.data) || r || [] }) },
    searchUsers(keyword) { this.userLoading = true; getJkUserOptions({ keyword, limit: 30 }).then(r => { this.userOptions = (r && r.data) || r || [] }).finally(() => { this.userLoading = false }) },
    searchParents(keyword) { this.parentLoading = true; getJkUserOptions({ keyword, limit: 30 }).then(r => { this.parentOptions = (r && r.data) || r || [] }).finally(() => { this.parentLoading = false }) },
    openBind() { this.form = { relationType: 'MANUAL', bindSource: 'ADMIN' }; this.visible = true },
    bind() { if (!this.form.userId || !this.form.changeReason) return this.$message.warning('请选择下级用户并填写变更原因'); bindJkAgentRelation(this.form).then(() => { this.$message.success('关系已保存'); this.visible = false; this.load() }) },
    invalidate(row) { this.$prompt('请输入失效原因', '确认', { inputPattern: /\S+/, inputErrorMessage: '原因不能为空' }).then(({ value }) => invalidateJkAgentRelation(row.id, value).then(() => { this.$message.success('已失效'); this.load() })) }
  }
}
</script>
