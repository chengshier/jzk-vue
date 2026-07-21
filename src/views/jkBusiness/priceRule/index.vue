<template>
  <div class="divBox">
    <el-alert title="第二阶段 V1：仅支持固定价/折扣价规则；本页属于价格规则基础底座，不包含阶梯价、活动价编排。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header" class="acea-row row-between-wrapper">
        <span>价格规则管理</span>
        <el-button size="mini" type="primary" @click="openDialog()">新增规则</el-button>
      </div>
      <el-form :inline="true" size="mini" class="mb15">
        <el-form-item label="商品">
          <el-select v-model="query.productId" clearable filterable remote reserve-keyword placeholder="选择商品" :remote-method="searchProducts" :loading="productLoading" style="width: 240px">
            <el-option v-for="item in productOptions" :key="item.id" :label="item.storeName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户">
          <el-select v-model="query.userId" clearable filterable remote reserve-keyword placeholder="选择用户" :remote-method="searchUsers" :loading="userLoading" style="width: 220px">
            <el-option v-for="item in userOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="query.roleCode" clearable placeholder="全部角色">
            <el-option v-for="item in roleOptions" :key="item.roleCode" :label="item.roleName" :value="item.roleCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="query.regionCode" clearable filterable placeholder="全部区域" style="width: 220px">
            <el-option v-for="item in regionOptions" :key="item.regionCode" :label="item.regionName" :value="item.regionCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部状态">
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="ruleNo" label="规则编号" min-width="150" />
        <el-table-column label="商品" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.productName || '商品已删除' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="SKU" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.skuText || row.skuName || 'SKU 已删除' }}</div>
            <div class="sub-text">编码：{{ row.skuCode || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="120">
          <template slot-scope="{ row }">
            <div>{{ row.roleName || '身份未配置' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="区域" min-width="140">
          <template slot-scope="{ row }">
            <div>{{ row.regionName || '区域未配置' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="指定用户" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.applicantName || '用户不存在' }}</div>
            <div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="priceType" label="价格类型" width="120" />
        <el-table-column prop="fixedPrice" label="固定价" width="110" />
        <el-table-column prop="discountRate" label="折扣率" width="110" />
        <el-table-column prop="ruleVersion" label="版本" width="80" />
        <el-table-column label="状态" width="90">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.statusTag || (row.status ? 'success' : 'info')">{{ row.statusText || (row.status ? '启用' : '禁用') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="openDialog(row)">编辑</el-button>
            <el-button size="mini" :type="row.status ? 'warning' : 'success'" @click="toggleStatus(row)">
              {{ row.status ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="form.id ? '编辑规则' : '新增规则'" :visible.sync="dialogVisible" width="620px">
      <el-form :model="form" label-width="110px" size="mini">
        <el-form-item label="商品选择">
          <el-select v-model="form.productId" clearable filterable remote reserve-keyword placeholder="请选择商品" :remote-method="searchProducts" :loading="productLoading" style="width: 100%" @change="handleProductChange">
            <el-option v-for="item in productOptions" :key="item.id" :label="item.storeName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="SKU 选择">
          <el-select v-model="form.skuId" clearable filterable placeholder="请先选择商品" style="width: 100%" @change="handleSkuChange">
            <el-option v-for="item in skuOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="SKU 编码"><el-input v-model="form.skuCode" disabled /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleCode" clearable placeholder="请选择角色">
            <el-option v-for="item in roleOptions" :key="item.roleCode" :label="item.roleName" :value="item.roleCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域选择">
          <el-select v-model="form.regionCode" clearable filterable placeholder="请选择区域" style="width: 100%">
            <el-option v-for="item in regionOptions" :key="item.regionCode" :label="item.regionName" :value="item.regionCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="指定用户">
          <el-select v-model="form.userId" clearable filterable remote reserve-keyword placeholder="请选择用户" :remote-method="searchUsers" :loading="userLoading" style="width: 100%">
            <el-option v-for="item in userOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格类型">
          <el-select v-model="form.priceType" placeholder="请选择">
            <el-option label="固定价" value="FIXED" />
            <el-option label="折扣价" value="DISCOUNT" />
          </el-select>
        </el-form-item>
        <el-form-item label="固定价"><el-input v-model="form.fixedPrice" /></el-form-item>
        <el-form-item label="折扣率"><el-input v-model="form.discountRate" placeholder="例如 0.85" /></el-form-item>
        <el-form-item label="规则版本"><el-input v-model="form.ruleVersion" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="dialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitForm">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getJkBusinessRoleList, getJkPriceRuleList, getJkPriceRuleRegionOptions, saveJkPriceRule, updateJkPriceRuleStatus } from '@/api/jkBusiness';
import { productDetailApi, productLstApi } from '@/api/store';
import { userListApi } from '@/api/user';
export default {
  data() {
    return {
      listData: { list: [] },
      query: { page: 1, limit: 20, productId: null, userId: null, roleCode: '', regionCode: '', status: null },
      dialogVisible: false,
      form: { priceType: 'FIXED', ruleVersion: 1 },
      roleOptions: [],
      regionOptions: [],
      productOptions: [],
      skuOptions: [],
      userOptions: [],
      productLoading: false,
      userLoading: false,
    };
  },
  mounted() {
    this.loadRoles();
    this.loadRegions();
    this.searchProducts('');
    this.loadData();
  },
  methods: {
    loadRoles() {
      getJkBusinessRoleList({ page: 1, limit: 100 }).then((res) => {
        const payload = res && res.list ? res : (res && res.data ? res.data : res);
        this.roleOptions = (payload && payload.list) || [];
      });
    },
    loadRegions() {
      getJkPriceRuleRegionOptions().then((res) => {
        this.regionOptions = (res && res.data) || res || [];
      });
    },
    loadData() {
      getJkPriceRuleList(this.query).then((res) => {
        this.listData = res || { list: [] };
      });
    },
    resetQuery() {
      this.query = { page: 1, limit: 20, productId: null, userId: null, roleCode: '', regionCode: '', status: null };
      this.loadData();
    },
    openDialog(row) {
      this.form = row ? { ...row } : { priceType: 'FIXED', ruleVersion: 1 };
      if (row && row.productId) {
        this.ensureProductOption(row.productId, row.productName);
        this.handleProductChange(row.productId, row.skuId, row.skuCode);
      } else {
        this.skuOptions = [];
      }
      if (row && row.userId) {
        this.ensureUserOption(row.userId, row.applicantName, row.applicantPhone, row.userNickname);
      }
      this.dialogVisible = true;
    },
    searchProducts(keyword) {
      this.productLoading = true;
      const params = { page: 1, limit: 20, keywords: keyword || '', isShow: 1 };
      productLstApi(params).then((res) => {
        const payload = res && res.data ? res.data : res;
        this.productOptions = (payload && payload.list) || [];
      }).finally(() => {
        this.productLoading = false;
      });
    },
    ensureProductOption(id, name) {
      if (!id) return;
      if (!this.productOptions.find(item => item.id === id)) {
        this.productOptions.unshift({ id, storeName: name || '商品已删除' });
      }
    },
    searchUsers(keyword) {
      if (!keyword && this.userOptions.length) return;
      this.userLoading = true;
      userListApi({ keywords: keyword || '', page: 1, limit: 20 }).then((response) => {
        const users = response.list || response.data || [];
        this.userOptions = users.map(user => ({ id: user.uid || user.id, label: (user.nickname || user.realName || '用户') + '（' + (user.uid || user.id) + '）' }));
      }).finally(() => {
        this.userLoading = false;
      });
    },
    ensureUserOption(id, applicantName, applicantPhone, userNickname) {
      if (!id) return;
      if (!this.userOptions.find(item => item.id === id)) {
        const label = (applicantName || userNickname || '用户') + '（' + id + '）' + (applicantPhone ? ' ' + applicantPhone : '');
        this.userOptions.unshift({ id, label });
      }
    },
    handleProductChange(productId, presetSkuId, presetSkuCode) {
      this.form.skuId = presetSkuId || null;
      this.form.skuCode = presetSkuCode || '';
      this.skuOptions = [];
      if (!productId) {
        return;
      }
      productDetailApi(productId).then((res) => {
        const detail = (res && res.data) || res || {};
        this.ensureProductOption(detail.id || productId, detail.storeName);
        const attrValue = detail.attrValue || [];
        this.skuOptions = attrValue.map(item => ({
          id: item.id,
          label: item.attrValue || item.suk || 'SKU 已删除',
          skuCode: item.barCode || item.suk || '',
        }));
      });
    },
    handleSkuChange(skuId) {
      const current = this.skuOptions.find(item => item.id === skuId);
      this.form.skuCode = current ? (current.skuCode || '') : '';
    },
    submitForm() {
      saveJkPriceRule(this.form).then(() => {
        this.$message.success('保存成功');
        this.dialogVisible = false;
        this.loadData();
      });
    },
    toggleStatus(row) {
      updateJkPriceRuleStatus({ id: row.id, status: !row.status }).then(() => {
        this.$message.success('操作成功');
        this.loadData();
      });
    },
  },
};
</script>

<style scoped>
.sub-text {
  color: #909399;
  font-size: 12px;
}
</style>
