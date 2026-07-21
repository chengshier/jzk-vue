<template>
  <div class="divBox">
    <el-alert title="第一阶段最小审核页面：仅覆盖身份申请审核闭环，不包含第二阶段业务模块。" type="info" :closable="false" />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header">身份申请审核</div>
      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="applyNo" label="申请单号" min-width="160" />
        <el-table-column label="申请人" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.applicantName || '用户不存在' }}</div>
            <div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="applyRoleName" label="申请身份" width="120" />
        <el-table-column label="审核状态" width="120">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.statusTag || 'info'">{{ row.auditStatusText || row.auditStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="区域" min-width="140">
          <template slot-scope="{ row }">
            <div>{{ row.regionName || '区域未配置' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="applyReason" label="申请原因" min-width="180" />
        <el-table-column prop="rejectReason" label="驳回原因" min-width="180" />
        <el-table-column label="附件预览" min-width="220">
          <template slot-scope="{ row }">
            <div v-if="certificateLinks(row.certificateFiles).length" class="preview-list">
              <div v-for="(url, index) in certificateLinks(row.certificateFiles)" :key="url + index" class="preview-item">
                <el-image
                  :src="url"
                  :preview-src-list="certificateLinks(row.certificateFiles)"
                  fit="cover"
                  class="preview-image"
                />
                <el-link :href="url" target="_blank" type="primary">附件{{ index + 1 }}</el-link>
              </div>
            </div>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" @click="audit(row, 'PASS')">通过</el-button>
            <el-button size="mini" type="danger" @click="audit(row, 'REJECT')">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getJkIdentityApplyList, auditJkIdentityApply } from '@/api/jkBusiness';
export default {
  data() {
    return {
      listData: { list: [] },
      query: { page: 1, limit: 20 },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      getJkIdentityApplyList(this.query).then((res) => {
        this.listData = res || { list: [] };
      });
    },
    audit(row, action) {
      const isReject = action === 'REJECT';
      const title = isReject ? '请输入驳回原因' : '请输入审核意见';
      const defaultValue = isReject ? (row.rejectReason || '') : '后台审核通过';
      this.$prompt(title, isReject ? '身份申请驳回' : '身份申请通过', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: defaultValue,
        inputValidator: (value) => {
          if (isReject && !String(value || '').trim()) {
            return '驳回原因不能为空';
          }
          return true;
        }
      }).then(({ value }) => {
        const inputValue = String(value || '').trim();
        auditJkIdentityApply({
          applyId: row.id,
          auditAction: action,
          rejectReason: isReject ? inputValue : '',
          auditRemark: isReject ? ('后台审核驳回：' + inputValue) : (inputValue || '后台审核通过'),
        }).then(() => {
          this.$message.success('操作成功');
          this.loadData();
        });
      }).catch(() => {});
    },
    certificateLinks(raw) {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw.filter(Boolean);
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (e) {}
      return String(raw).split(',').map((item) => item.trim()).filter(Boolean);
    },
  },
};
</script>

<style scoped>
.sub-text {
  color: #909399;
  font-size: 12px;
}
.file-link {
  margin-right: 8px;
}
.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.preview-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
</style>
