<template>
  <div class="divBox">
    <el-alert title="第一阶段基础配置页面：用于业务角色开关与权限查看，不代表完整区域代理业务闭环。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">业务角色管理</div>
      <el-table :data="list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="roleCode" label="角色编码" min-width="120" />
        <el-table-column prop="roleName" label="角色名称" min-width="120" />
        <el-table-column prop="roleLevel" label="等级" width="80" />
        <el-table-column prop="needAudit" label="需审核" width="90">
          <template slot-scope="{ row }">{{ row.needAudit ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用" width="90">
          <template slot-scope="{ row }">
            <el-switch v-model="row.enabled" @change="changeStatus(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="permissionCodes" label="权限点" min-width="320">
          <template slot-scope="{ row }">
            <span>{{ (row.permissionDisplayList || row.permissionNames || row.permissionCodes || []).join(' / ') || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getJkBusinessRoleList, updateJkBusinessRoleStatus } from '@/api/jkBusiness';
export default {
  data() {
    return { list: [] };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      getJkBusinessRoleList({}).then((res) => {
        this.list = res || [];
      });
    },
    changeStatus(row) {
      updateJkBusinessRoleStatus({ roleId: row.id, enabled: row.enabled }).then(() => {
        this.$message.success('状态已更新');
      });
    },
  },
};
</script>

