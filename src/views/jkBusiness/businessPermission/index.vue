<template>
  <div class="divBox">
    <el-alert title="第一阶段仅提供权限点列表与模块分类，不进入复杂配置闭环。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">业务权限点管理</div>
      <el-table :data="list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column label="模块" width="120">
          <template slot-scope="{ row }">{{ row.moduleName || row.moduleCode || '--' }}</template>
        </el-table-column>
        <el-table-column prop="permissionCode" label="权限点编码" min-width="220" />
        <el-table-column prop="permissionName" label="权限点名称" min-width="160" />
        <el-table-column label="类型" width="90">
          <template slot-scope="{ row }">{{ row.permissionTypeText || row.permissionType || '--' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getJkBusinessPermissionList } from '@/api/jkBusiness';
export default {
  data() {
    return { list: [] };
  },
  mounted() {
    getJkBusinessPermissionList().then((res) => {
      this.list = res || [];
    });
  },
};
</script>
