<template>
  <div class="app-container">
    <el-alert
      title="推广素材发布后会直接显示在小程序“推广素材”页面。请使用可公开访问的 HTTPS 图片地址，保存前确认文案、身份范围和上下架状态。"
      type="info"
      :closable="false"
      style="margin-bottom:16px"
    />

    <el-card shadow="never">
      <div slot="header" class="header-row">
        <span>推广素材配置</span>
        <div><el-button size="mini" @click="add">新增素材</el-button><el-button size="mini" type="primary" :loading="saving" @click="save">保存发布</el-button></div>
      </div>

      <el-table v-loading="loading" :data="list" border row-key="id">
        <el-table-column label="排序" width="90"><template slot-scope="{row}"><el-input-number v-model="row.sort" :min="0" :max="9999" controls-position="right" size="mini" style="width:76px" /></template></el-table-column>
        <el-table-column label="类型" width="130"><template slot-scope="{row}"><el-select v-model="row.type" size="mini"><el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value" /></el-select></template></el-table-column>
        <el-table-column label="标题" min-width="180"><template slot-scope="{row}"><el-input v-model.trim="row.title" size="mini" maxlength="50" placeholder="素材标题" /></template></el-table-column>
        <el-table-column label="说明" min-width="210"><template slot-scope="{row}"><el-input v-model.trim="row.description" size="mini" maxlength="120" placeholder="展示说明" /></template></el-table-column>
        <el-table-column label="推广文案" min-width="260"><template slot-scope="{row}"><el-input v-model="row.copyText" type="textarea" :rows="2" maxlength="500" show-word-limit placeholder="用户可一键复制的文案" /></template></el-table-column>
        <el-table-column label="图片地址" min-width="260">
          <template slot-scope="{row}">
            <el-input v-model.trim="row.imageUrl" size="mini" :disabled="row.type==='copy'" placeholder="HTTPS 图片地址" />
            <el-image v-if="row.imageUrl" :src="row.imageUrl" :preview-src-list="[row.imageUrl]" fit="cover" class="preview" />
          </template>
        </el-table-column>
        <el-table-column label="适用身份" min-width="210"><template slot-scope="{row}"><el-select v-model="row.roleCodes" multiple clearable size="mini" placeholder="留空表示全部"><el-option v-for="role in roleOptions" :key="role.roleCode" :label="role.roleName" :value="role.roleCode" /></el-select></template></el-table-column>
        <el-table-column label="状态" width="85"><template slot-scope="{row}"><el-switch v-model="row.status" /></template></el-table-column>
        <el-table-column label="操作" width="80" fixed="right"><template slot-scope="{$index}"><el-button type="text" class="danger" @click="remove($index)">删除</el-button></template></el-table-column>
      </el-table>
      <el-empty v-if="!loading&&!list.length" description="暂无推广素材，请点击新增素材" />
    </el-card>
  </div>
</template>
<script>
import { getJkBusinessRoleList } from '@/api/jkBusiness'
import { getJkPromotionMaterialList, saveJkPromotionMaterials } from '@/api/jkOptions'

const emptyRow = () => ({ id: '', type: 'poster', title: '', description: '', copyText: '', imageUrl: '', roleCodes: [], sort: 0, status: true })

export default {
  data() {
    return {
      list: [],
      roleOptions: [],
      loading: false,
      saving: false,
      types: [
        { label: '推广文案', value: 'copy' },
        { label: '商品素材', value: 'product' },
        { label: '健康知识', value: 'health' },
        { label: '推广海报', value: 'poster' }
      ]
    }
  },
  created() {
    this.loadRoles()
    this.load()
  },
  methods: {
    loadRoles() {
      getJkBusinessRoleList({ page: 1, limit: 100, enabled: true }).then(response => {
        const data = response && response.data ? response.data : response
        this.roleOptions = (data && data.list) || data || []
      })
    },
    load() {
      this.loading = true
      getJkPromotionMaterialList().then(response => {
        const data = (response && response.data) || response || []
        this.list = (Array.isArray(data) ? data : []).map(item => Object.assign(emptyRow(), item, { roleCodes: Array.isArray(item.roleCodes) ? item.roleCodes : [] }))
      }).finally(() => { this.loading = false })
    },
    add() {
      this.list.unshift(emptyRow())
    },
    remove(index) {
      this.$confirm('确认删除该推广素材？保存发布后小程序将不再显示。', '删除确认', { type: 'warning' })
        .then(() => { this.list.splice(index, 1) })
    },
    validate() {
      for (let i = 0; i < this.list.length; i++) {
        const row = this.list[i]
        if (!row.title) return '第' + (i + 1) + '条素材标题不能为空'
        if (row.type !== 'copy' && !row.imageUrl) return '第' + (i + 1) + '条图片素材地址不能为空'
        if (row.imageUrl && !/^https:\/\//i.test(row.imageUrl)) return '第' + (i + 1) + '条图片必须使用 HTTPS 地址'
        if (!row.copyText && row.type === 'copy') return '第' + (i + 1) + '条文案素材内容不能为空'
      }
      return ''
    },
    save() {
      const error = this.validate()
      if (error) return this.$message.warning(error)
      this.saving = true
      saveJkPromotionMaterials(this.list).then(() => {
        this.$message.success('推广素材已保存并发布')
        this.load()
      }).finally(() => { this.saving = false })
    }
  }
}
</script>
<style scoped>
.header-row{display:flex;align-items:center;justify-content:space-between}.preview{display:block;width:70px;height:70px;margin-top:8px;border-radius:6px;border:1px solid #ebeef5}.danger{color:#f56c6c}
</style>
