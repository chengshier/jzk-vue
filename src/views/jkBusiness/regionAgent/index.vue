<template>
  <div class="divBox">
    <el-card shadow="never">
      <div slot="header"><span>区域代理配置</span><el-button size="mini" type="primary" style="float:right" @click="openBind">绑定/换绑</el-button></div>
      <el-form inline size="small">
        <el-form-item label="区域">
          <el-select v-model="query.regionCode" clearable filterable remote :remote-method="searchRegions" :loading="regionLoading" placeholder="名称/编码搜索" style="width:240px"><el-option v-for="x in regionOptions" :key="x.value" :label="x.label" :value="x.value" /></el-select>
        </el-form-item>
        <el-form-item label="区县代">
          <el-select v-model="query.countyAgentUserId" clearable filterable remote :remote-method="searchCounty" :loading="countyLoading" placeholder="姓名/手机号搜索" style="width:240px"><el-option v-for="x in countyOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select>
        </el-form-item>
        <el-button size="small" @click="load">查询</el-button>
      </el-form>
      <el-table :data="list" size="mini">
        <el-table-column prop="regionName" label="区域名称" />
        <el-table-column prop="regionCode" label="区域编码" />
        <el-table-column label="区县代"><template slot-scope="s">{{ s.row.countyAgentName || '--' }}（{{ s.row.countyAgentPhone || s.row.countyAgentUserId }}）</template></el-table-column>
        <el-table-column prop="bindStatusText" label="绑定状态" />
        <el-table-column prop="effectiveTime" label="生效时间" />
        <el-table-column prop="changeReason" label="变更原因" />
        <el-table-column label="操作" width="100"><template slot-scope="s"><el-button v-if="s.row.status" type="text" class="danger" @click="invalidate(s.row)">失效</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="绑定区域代理" :visible.sync="visible" width="560px">
      <el-form label-width="120px">
        <el-form-item label="区域" required><el-cascader v-model="form.regionPath" :props="regionCascaderProps" clearable filterable placeholder="逐级选择区域" style="width:100%" @change="handleRegionPathChange" /></el-form-item>
        <el-form-item label="区县代" required><el-select v-model="form.countyAgentUserId" filterable remote :remote-method="searchCounty" :loading="countyLoading" placeholder="按姓名或手机号搜索有效区县代" style="width:100%"><el-option v-for="x in countyOptions" :key="x.value" :label="x.label" :value="Number(x.value)" /></el-select></el-form-item>
        <el-form-item label="变更原因" required><el-input v-model.trim="form.changeReason" maxlength="300" /></el-form-item>
        <el-form-item label="备注"><el-input v-model.trim="form.remark" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="bind">确认</el-button></span>
    </el-dialog>
  </div>
</template>
<script>
import { getJkRegionAgentList, bindJkRegionAgent, invalidateJkRegionAgent, getJkRegionOptions, getJkUserOptions } from '@/api/jkBusiness'
export default {
  data() { return { list: [], query: { activeOnly: false }, visible: false, form: {}, regionOptions: [], countyOptions: [], countyLoading: false, regionLoading: false, regionCascaderProps: { lazy: true, emitPath: true, lazyLoad: this.loadRegionNode } } },
  mounted() { this.searchRegions(''); this.searchCounty(''); this.load() },
  methods: {
    load() { getJkRegionAgentList(this.query).then(r => { this.list = (r && r.data) || r || [] }) },
    searchRegions(keyword) { this.regionLoading = true; getJkRegionOptions({ keyword, enabled: true }).then(r => { this.regionOptions = (r && r.data) || r || [] }).finally(() => { this.regionLoading = false }) },
    loadRegionNode(node, resolve) { getJkRegionOptions({ parentRegionCode: node.level === 0 ? undefined : node.value, enabled: true }).then(r => { const rows = (r && r.data) || r || []; resolve(rows.map(x => ({ label: x.label, value: x.value, leaf: x.leaf, disabled: x.disabled }))) }).catch(() => resolve([])) },
    handleRegionPathChange(value) { this.form.regionCode = value && value.length ? value[value.length - 1] : null },
    searchCounty(keyword) { this.countyLoading = true; getJkUserOptions({ keyword, roleCode: 'county_agent', limit: 30 }).then(r => { this.countyOptions = (r && r.data) || r || [] }).finally(() => { this.countyLoading = false }) },
    openBind() { this.form = {}; this.visible = true; this.searchCounty('') },
    bind() { if (!this.form.regionCode || !this.form.countyAgentUserId || !this.form.changeReason) return this.$message.warning('请选择区域、区县代并填写变更原因'); bindJkRegionAgent(this.form).then(() => { this.$message.success('绑定成功'); this.visible = false; this.load() }) },
    invalidate(row) { this.$prompt('请输入失效原因', '确认', { inputPattern: /\S+/, inputErrorMessage: '原因不能为空' }).then(({ value }) => invalidateJkRegionAgent(row.id, value).then(() => { this.$message.success('已失效'); this.load() })) }
  }
}
</script>
<style scoped>.danger{color:#f56c6c}</style>
