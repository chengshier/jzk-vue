<template>
  <div class="divBox">
    <el-alert
      title="第三阶段仅处理区县代向平台订货、线下凭证、付款审核、平台发货、确认收货入库，不包含分佣、提现、健康数据与售后逆向。"
      type="info"
      :closable="false"
    />
    <el-card shadow="never" class="box-card mt14">
      <div slot="header" class="acea-row row-between-wrapper">
        <span>区县代订货管理</span>
        <el-button size="mini" @click="loadData">刷新</el-button>
      </div>
      <el-form :inline="true" size="mini" class="mb15">
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="query.keywords" placeholder="订货单号 / requestNo" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="listData.list" size="mini" :header-cell-style="{ background: '#f8f8f9', color: '#515a6e' }">
        <el-table-column prop="platformOrderNo" label="订货单号" min-width="160" />
        <el-table-column prop="requestNo" label="requestNo" min-width="160" />
        <el-table-column label="申请人" min-width="180">
          <template slot-scope="{ row }">
            <div>{{ row.applicantName || '用户不存在' }}</div>
            <div class="sub-text">{{ row.userNickname || '--' }} / {{ row.applicantPhone || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="区域" min-width="140">
          <template slot-scope="{ row }">
            <div>{{ row.regionName || '区域未配置' }}</div>
            <div class="sub-text">{{ row.roleName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商品 / SKU" min-width="220">
          <template slot-scope="{ row }">
            <div>{{ row.firstProductName || '商品已删除' }}</div>
            <div class="sub-text">{{ row.firstSkuText || row.firstSkuName || 'SKU 已删除' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="金额" width="110" />
        <el-table-column label="状态" width="150">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.statusTag || 'info'">{{ row.statusText || '状态未配置' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="付款状态" width="110">
          <template slot-scope="{ row }">{{ row.payStatusText || '--' }}</template>
        </el-table-column>
        <el-table-column label="入库状态" width="110">
          <template slot-scope="{ row }">{{ row.receiveStatusText || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="280" fixed="right">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="showDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'PAYMENT_SUBMITTED'" size="mini" type="primary" @click="audit(row, true)">审核通过</el-button>
            <el-button v-if="row.status === 'PAYMENT_SUBMITTED'" size="mini" type="warning" @click="audit(row, false)">审核驳回</el-button>
            <el-button v-if="row.status === 'PAYMENT_APPROVED'" size="mini" type="success" @click="ship(row)">发货</el-button>
            <el-button
              v-if="['CREATED', 'PAYMENT_SUBMITTED', 'PAYMENT_REJECTED', 'PAYMENT_APPROVED'].includes(row.status)"
              size="mini"
              type="danger"
              @click="closeOrder(row)"
            >
              关闭
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="订货单详情" :visible.sync="detailVisible" width="960px">
      <div v-if="detail.order">
        <el-descriptions :column="2" border size="mini">
          <el-descriptions-item label="订货单号">{{ detail.order.platformOrderNo }}</el-descriptions-item>
          <el-descriptions-item label="requestNo">{{ detail.order.requestNo }}</el-descriptions-item>
          <el-descriptions-item label="申请人">
            {{ detail.order.applicantName || '用户不存在' }}
            <span v-if="detail.order.applicantPhone"> / {{ detail.order.applicantPhone }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">{{ detail.order.statusText || '状态未配置' }}</el-descriptions-item>
          <el-descriptions-item label="付款状态">{{ detail.order.payStatusText || '--' }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">{{ detail.order.auditStatusText || '--' }}</el-descriptions-item>
          <el-descriptions-item label="入库状态">{{ detail.order.receiveStatusText || '--' }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ detail.order.regionName || '区域未配置' }}</el-descriptions-item>
          <el-descriptions-item label="金额">{{ detail.order.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="驳回原因">{{ detail.order.rejectReason || '--' }}</el-descriptions-item>
          <el-descriptions-item label="关闭原因">{{ detail.order.cancelReason || '--' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ detail.order.auditRemark || '--' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">商品明细</h4>
        <el-table :data="detail.items || []" size="mini">
          <el-table-column label="商品" min-width="180">
            <template slot-scope="{ row }">
              <div>{{ row.productName || '商品已删除' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="SKU" min-width="180">
            <template slot-scope="{ row }">
              <div>{{ row.skuText || row.skuName || 'SKU 已删除' }}</div>
              <div v-if="row.skuCode" class="sub-text">编码：{{ row.skuCode }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="unitPrice" label="单价" width="100" />
          <el-table-column prop="totalAmount" label="金额" width="100" />
        </el-table>

        <h4 class="section-title">付款凭证</h4>
        <el-table :data="detail.vouchers || []" size="mini">
          <el-table-column prop="voucherNo" label="凭证号" min-width="150" />
          <el-table-column label="审核状态" width="110">
            <template slot-scope="{ row }">
              <el-tag size="mini" :type="row.voucherStatusTag || 'info'">{{ row.voucherStatusText || row.auditStatusText || '--' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="rejectReason" label="驳回原因" min-width="150" />
          <el-table-column label="凭证预览" min-width="180">
            <template slot-scope="{ row }">
              <div v-if="row.voucherUrl" class="voucher-preview">
                <el-image
                  :src="row.voucherUrl"
                  :preview-src-list="[row.voucherUrl]"
                  fit="cover"
                  class="voucher-image"
                />
                <el-link :href="row.voucherUrl" target="_blank" type="primary">原图打开</el-link>
              </div>
              <span v-else>--</span>
            </template>
          </el-table-column>
        </el-table>

        <h4 class="section-title">审核日志</h4>
        <el-table :data="detail.auditLogs || []" size="mini">
          <el-table-column label="动作" width="120">
            <template slot-scope="{ row }">{{ row.auditActionText || '--' }}</template>
          </el-table-column>
          <el-table-column label="前状态" width="120">
            <template slot-scope="{ row }">{{ row.beforeStatusText || '--' }}</template>
          </el-table-column>
          <el-table-column label="后状态" width="120">
            <template slot-scope="{ row }">{{ row.afterStatusText || '--' }}</template>
          </el-table-column>
          <el-table-column prop="rejectReason" label="驳回原因" min-width="150" />
          <el-table-column prop="auditRemark" label="备注" min-width="160" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  auditJkPlatformOrderPayment,
  closeJkPlatformOrder,
  getJkPlatformOrderDetail,
  getJkPlatformOrderList,
  shipJkPlatformOrder,
} from '@/api/jkBusiness';
import { jkPlatformOrderStatusOptions } from '@/utils/jk-display';

export default {
  data() {
    return {
      query: { page: 1, limit: 20, status: '', keywords: '' },
      statusOptions: jkPlatformOrderStatusOptions,
      listData: { list: [] },
      detailVisible: false,
      detail: { order: null, items: [], vouchers: [], auditLogs: [] },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      getJkPlatformOrderList(this.query).then((res) => {
        this.listData = res || { list: [] };
      });
    },
    resetQuery() {
      this.query = { page: 1, limit: 20, status: '', keywords: '' };
      this.loadData();
    },
    showDetail(row) {
      getJkPlatformOrderDetail(row.id).then((res) => {
        this.detail = res || { order: null, items: [], vouchers: [], auditLogs: [] };
        this.detailVisible = true;
      });
    },
    audit(row, approved) {
      this.$prompt('请输入备注，可为空', approved ? '付款审核通过' : '付款审核驳回', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: '',
      }).then(({ value }) => {
        auditJkPlatformOrderPayment({ businessId: row.id, approved, remark: value }).then(() => {
          this.$message.success('操作成功');
          this.loadData();
        });
      }).catch(() => {});
    },
    ship(row) {
      shipJkPlatformOrder({ businessId: row.id, remark: '平台发货' }).then(() => {
        this.$message.success('发货成功');
        this.loadData();
      });
    },
    closeOrder(row) {
      this.$prompt('请输入关闭原因', '关闭订货单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        closeJkPlatformOrder({ businessId: row.id, remark: value }).then(() => {
          this.$message.success('关闭成功');
          this.loadData();
        });
      }).catch(() => {});
    },
  },
};
</script>

<style scoped>
.section-title {
  margin: 18px 0 10px;
}
.sub-text {
  color: #909399;
  font-size: 12px;
}
.voucher-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.voucher-image {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
</style>
