<template>
  <div class="divBox jk-region-page">
    <el-row :gutter="14">
      <el-col :xs="24" :sm="9" :md="8" :lg="7">
        <el-card shadow="never" class="panel-card">
          <div slot="header" class="panel-header">
            <span>区域树</span>
            <el-button size="mini" icon="el-icon-refresh" @click="refreshCurrentNode">刷新</el-button>
          </div>
          <el-input
            v-model.trim="searchKeyword"
            size="small"
            clearable
            placeholder="输入名称或编码搜索"
            @keyup.enter.native="searchRegion"
            @clear="clearSearch"
          >
            <el-button slot="append" icon="el-icon-search" :loading="searchLoading" @click="searchRegion" />
          </el-input>
          <div v-if="searchResults.length" class="search-result">
            <div
              v-for="item in searchResults"
              :key="item.regionCode"
              class="search-item"
              @click="locateRegion(item.regionCode)"
            >
              <div class="search-name">{{ item.fullPathName }}</div>
              <div class="search-code">{{ item.regionCode }} / {{ levelText(item.regionLevel) }}</div>
            </div>
          </div>
          <el-tree
            ref="regionTree"
            class="region-tree"
            node-key="regionCode"
            lazy
            highlight-current
            :load="loadTreeNode"
            :props="treeProps"
            :expand-on-click-node="false"
            @node-click="selectNode"
          >
            <span slot-scope="{ node, data }" class="tree-node">
              <span>{{ data.regionName }}</span>
              <span class="tree-meta">{{ data.regionCode }}</span>
              <el-tag v-if="data.status === false" size="mini" type="info">停用</el-tag>
            </span>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="15" :md="16" :lg="17">
        <el-card shadow="never" class="panel-card">
          <div slot="header" class="panel-header">
            <span>区域详情</span>
            <div>
              <el-button size="mini" type="primary" icon="el-icon-plus" @click="openCreateChild">新增下级</el-button>
              <el-button size="mini" icon="el-icon-edit" :disabled="!currentRegion" @click="openEdit(currentRegion)">编辑</el-button>
              <el-button
                size="mini"
                :type="currentRegion && currentRegion.status ? 'warning' : 'success'"
                :disabled="!currentRegion || disableStatusButton"
                @click="changeStatus"
              >{{ currentRegion && currentRegion.status ? '停用' : '启用' }}</el-button>
              <el-button size="mini" icon="el-icon-document" :disabled="!currentRegion" @click="loadUsage">占用</el-button>
            </div>
          </div>
          <el-empty v-if="!currentRegion" description="请选择左侧区域" />
          <div v-else v-loading="detailLoading">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="区域名称">{{ currentRegion.regionName }}</el-descriptions-item>
              <el-descriptions-item label="区域编码">{{ currentRegion.regionCode }}</el-descriptions-item>
              <el-descriptions-item label="层级">{{ levelText(currentRegion.regionLevel) }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag size="mini" :type="currentRegion.status ? 'success' : 'info'">{{ currentRegion.status ? '启用' : '停用' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="完整路径" :span="2">{{ currentPathName || '--' }}</el-descriptions-item>
              <el-descriptions-item label="业务占用" :span="2">
                <el-tag size="mini" :type="usage && usage.businessRecordCount > 0 ? 'warning' : 'success'">
                  {{ usage && usage.businessRecordCount > 0 ? '已占用' : '未占用' }}
                </el-tag>
                <span v-if="usage" class="usage-text">业务记录 {{ usage.businessRecordCount || 0 }} 条，启用子区域 {{ usage.activeChildCount || 0 }} 个</span>
              </el-descriptions-item>
            </el-descriptions>
            <div class="sub-header">
              <span>直属下级</span>
              <el-button size="mini" icon="el-icon-refresh" @click="loadChildrenList">刷新列表</el-button>
            </div>
            <el-table v-loading="childrenLoading" :data="childrenList" size="mini" border>
              <el-table-column prop="regionName" label="区域名称" min-width="150" />
              <el-table-column prop="regionCode" label="区域编码" min-width="120" />
              <el-table-column label="层级" width="90">
                <template slot-scope="{ row }">{{ levelText(row.regionLevel) }}</template>
              </el-table-column>
              <el-table-column label="状态" width="90">
                <template slot-scope="{ row }">
                  <el-tag size="mini" :type="row.status ? 'success' : 'info'">{{ row.status ? '启用' : '停用' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="childCount" label="直属下级" width="90" />
              <el-table-column label="操作" width="150">
                <template slot-scope="{ row }">
                  <el-button type="text" @click="locateRegion(row.regionCode)">定位</el-button>
                  <el-button type="text" @click="openEdit(row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :title="form.id ? '编辑区域' : '新增区域'" :visible.sync="dialogVisible" width="560px">
      <el-form :model="form" label-width="110px" size="small">
        <el-form-item label="区域编码" required>
          <el-input v-model.trim="form.regionCode" :disabled="!!form.id && formOccupied" maxlength="64" />
        </el-form-item>
        <el-form-item label="区域名称" required>
          <el-input v-model.trim="form.regionName" maxlength="128" />
        </el-form-item>
        <el-form-item label="上级区域">
          <el-cascader
            v-model="parentPath"
            clearable
            filterable
            :props="cascaderProps"
            :show-all-levels="true"
            placeholder="省级区域可不选"
            style="width:100%"
            @change="handleParentChange"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="form.remark" type="textarea" :rows="3" maxlength="500" />
        </el-form-item>
      </el-form>
      <div v-if="formUsage && formUsage.reasons && formUsage.reasons.length" class="usage-warning">
        <div v-for="item in formUsage.reasons" :key="item">{{ item }}</div>
      </div>
      <span slot="footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRegion">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog title="业务占用情况" :visible.sync="usageVisible" width="520px">
      <el-descriptions v-if="usage" :column="2" border size="small">
        <el-descriptions-item label="可停用">{{ usage.canDisable ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="可删除">{{ usage.canDelete ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="区域代理">{{ usage.regionAgentCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="业务身份">{{ usage.userRoleCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="数据范围">{{ usage.dataScopeCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="价格规则">{{ usage.priceRuleCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="库存账户">{{ usage.stockAccountCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="归属快照">{{ usage.attributionCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="业务总数" :span="2">{{ usage.businessRecordCount || 0 }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="usage && usage.reasons && usage.reasons.length" class="usage-warning">
        <div v-for="item in usage.reasons" :key="item">{{ item }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getJkRegionChildren,
  searchJkRegions,
  getJkRegionPath,
  getJkRegionSelectorOptions,
  getJkRegionUsage,
  saveJkRegion,
  updateJkRegionStatus,
} from '@/api/jkBusiness'

export default {
  data() {
    return {
      treeProps: { label: 'regionName', isLeaf: 'leaf' },
      searchKeyword: '',
      searchResults: [],
      searchLoading: false,
      currentRegion: null,
      currentPathName: '',
      currentPathCodes: [],
      childrenList: [],
      childrenLoading: false,
      detailLoading: false,
      usage: null,
      usageVisible: false,
      dialogVisible: false,
      saving: false,
      form: { status: true },
      parentPath: [],
      formUsage: null,
      formOccupied: false,
      cascaderProps: {
        lazy: true,
        checkStrictly: true,
        emitPath: true,
        lazyLoad: this.loadCascaderNode,
      },
    }
  },
  computed: {
    disableStatusButton() {
      return this.currentRegion && this.currentRegion.status && this.usage && !this.usage.canDisable
    },
  },
  methods: {
    normalizeResponse(res) {
      return (res && res.data) || res || []
    },
    normalizeTreeNodes(rows) {
      return rows.map(item => Object.assign({}, item, {
        leaf: item.regionLevel >= 3 || item.hasChildren === false,
      }))
    },
    levelText(level) {
      return level === 1 ? '省级' : level === 2 ? '市级' : level === 3 ? '区县级' : '--'
    },
    loadTreeNode(node, resolve) {
      const parentRegionCode = node.level === 0 ? undefined : node.data.regionCode
      if (node.level > 0 && node.data.regionLevel >= 3) {
        resolve([])
        return
      }
      getJkRegionChildren({ parentRegionCode })
        .then(res => resolve(this.normalizeTreeNodes(this.normalizeResponse(res))))
        .catch(() => resolve([]))
    },
    loadCascaderNode(node, resolve) {
      const parentRegionCode = node.level === 0 ? undefined : node.value
      getJkRegionSelectorOptions({ parentRegionCode, enabled: true }).then(res => {
        const rows = this.normalizeResponse(res)
        resolve(rows.map(item => ({
          label: item.label,
          value: item.value,
          leaf: item.leaf || item.regionLevel >= 2,
          disabled: item.disabled,
          regionLevel: item.regionLevel,
        })))
      }).catch(() => resolve([]))
    },
    selectNode(data) {
      this.currentRegion = data
      this.loadDetail(data.regionCode)
    },
    loadDetail(regionCode) {
      this.detailLoading = true
      Promise.all([getJkRegionPath(regionCode), getJkRegionUsage(regionCode)]).then(([pathRes, usageRes]) => {
        const path = this.normalizeResponse(pathRes)
        this.currentPathName = path.fullPathName || ''
        this.currentPathCodes = path.fullPathCodes || []
        this.usage = this.normalizeResponse(usageRes)
        this.loadChildrenList()
      }).finally(() => {
        this.detailLoading = false
      })
    },
    loadChildrenList() {
      if (!this.currentRegion) return
      this.childrenLoading = true
      getJkRegionChildren({ parentRegionCode: this.currentRegion.regionCode }).then(res => {
        this.childrenList = this.normalizeResponse(res)
      }).finally(() => {
        this.childrenLoading = false
      })
    },
    searchRegion() {
      if (!this.searchKeyword) {
        this.searchResults = []
        return
      }
      this.searchLoading = true
      searchJkRegions({ keyword: this.searchKeyword, limit: 50 }).then(res => {
        this.searchResults = this.normalizeResponse(res)
      }).finally(() => {
        this.searchLoading = false
      })
    },
    clearSearch() {
      this.searchResults = []
    },
    locateRegion(regionCode) {
      getJkRegionPath(regionCode).then(res => {
        const path = this.normalizeResponse(res)
        const codes = path.fullPathCodes || []
        this.expandPath(codes, 0)
        this.currentPathName = path.fullPathName || ''
        this.currentPathCodes = codes
      })
    },
    expandPath(codes, index) {
      if (!codes.length) return
      this.$nextTick(() => {
        const tree = this.$refs.regionTree
        const node = tree && tree.getNode(codes[index])
        if (!node) {
          return
        }
        node.expand(() => {
          if (index < codes.length - 1) {
            this.expandPath(codes, index + 1)
          } else {
            tree.setCurrentKey(codes[index])
            this.currentRegion = node.data
            this.loadDetail(codes[index])
          }
        })
      })
    },
    refreshCurrentNode() {
      const tree = this.$refs.regionTree
      if (!tree) return
      if (!this.currentRegion) {
        const root = tree.root
        root.loaded = false
        root.loadData()
        return
      }
      const node = tree.getNode(this.currentRegion.regionCode)
      if (node) {
        node.loaded = false
        node.expand()
      }
      this.loadDetail(this.currentRegion.regionCode)
    },
    openCreateChild() {
      const parent = this.currentRegion
      this.form = { status: true, parentRegionCode: parent ? parent.regionCode : null }
      this.parentPath = parent ? this.currentPathCodes.slice() : []
      this.formUsage = null
      this.formOccupied = false
      this.dialogVisible = true
    },
    openEdit(row) {
      this.form = Object.assign({ status: true }, row)
      this.formUsage = null
      this.formOccupied = false
      getJkRegionPath(row.regionCode).then(pathRes => {
        const path = this.normalizeResponse(pathRes)
        const codes = path.fullPathCodes || []
        this.parentPath = codes.slice(0, Math.max(codes.length - 1, 0))
      })
      getJkRegionUsage(row.regionCode).then(usageRes => {
        this.formUsage = this.normalizeResponse(usageRes)
        this.formOccupied = this.formUsage && this.formUsage.businessRecordCount > 0
      })
      this.dialogVisible = true
    },
    handleParentChange(value) {
      this.form.parentRegionCode = value && value.length ? value[value.length - 1] : null
    },
    saveRegion() {
      if (!this.form.regionCode || !this.form.regionName) {
        this.$message.warning('请填写区域编码和区域名称')
        return
      }
      this.saving = true
      const payload = Object.assign({}, this.form, { parentRegionCode: this.form.parentRegionCode || null })
      saveJkRegion(payload).then(() => {
        this.$message.success('保存成功')
        this.dialogVisible = false
        this.refreshParentAfterSave(payload.parentRegionCode)
      }).finally(() => {
        this.saving = false
      })
    },
    refreshParentAfterSave(parentRegionCode) {
      const tree = this.$refs.regionTree
      if (!tree) return
      if (!parentRegionCode) {
        tree.root.loaded = false
        tree.root.loadData()
      } else {
        const node = tree.getNode(parentRegionCode)
        if (node) {
          node.loaded = false
          node.expand()
        }
      }
      if (this.currentRegion) {
        this.loadDetail(this.currentRegion.regionCode)
      }
    },
    changeStatus() {
      if (!this.currentRegion) return
      const targetStatus = !this.currentRegion.status
      const text = targetStatus ? '启用' : '停用'
      this.$confirm('确认' + text + '“' + this.currentRegion.regionName + '”？', '提示', { type: targetStatus ? 'info' : 'warning' }).then(() => {
        updateJkRegionStatus(this.currentRegion.id, targetStatus).then(() => {
          this.$message.success('操作成功')
          this.currentRegion.status = targetStatus
          this.refreshCurrentNode()
        })
      })
    },
    loadUsage() {
      if (!this.currentRegion) return
      getJkRegionUsage(this.currentRegion.regionCode).then(res => {
        this.usage = this.normalizeResponse(res)
        this.usageVisible = true
      })
    },
  },
}
</script>

<style scoped>
.jk-region-page .panel-card {
  min-height: 640px;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.region-tree {
  margin-top: 12px;
}
.tree-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.tree-meta,
.search-code,
.usage-text {
  color: #909399;
  font-size: 12px;
}
.search-result {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-top: 10px;
  max-height: 220px;
  overflow: auto;
}
.search-item {
  cursor: pointer;
  padding: 8px 10px;
  border-bottom: 1px solid #f2f6fc;
}
.search-item:hover {
  background: #f5f7fa;
}
.search-name {
  color: #303133;
  line-height: 20px;
}
.sub-header {
  margin: 16px 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.usage-warning {
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #faecd8;
  background: #fdf6ec;
  color: #e6a23c;
  line-height: 22px;
}
</style>
