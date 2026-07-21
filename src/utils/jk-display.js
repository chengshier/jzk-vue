export const jkPlatformOrderStatusOptions = [
  { value: 'CREATED', label: '待提交付款' },
  { value: 'PENDING_PAYMENT', label: '待付款' },
  { value: 'PAYMENT_SUBMITTED', label: '已提交付款凭证' },
  { value: 'PAYMENT_REJECTED', label: '付款驳回' },
  { value: 'PAYMENT_APPROVED', label: '付款审核通过' },
  { value: 'WAIT_SHIP', label: '待发货' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'RECEIVED', label: '已收货' },
  { value: 'STOCK_IN', label: '已入库' },
  { value: 'CANCELLED', label: '已取消' },
  { value: 'CLOSED', label: '已关闭' },
];

export const jkStockTransferStatusOptions = [
  { value: 'SUBMITTED', label: '待区县代审核' },
  { value: 'PENDING_AUDIT', label: '待审核' },
  { value: 'AUDIT_REJECTED', label: '审核驳回' },
  { value: 'AUDIT_APPROVED', label: '审核通过' },
  { value: 'PENDING_PAYMENT', label: '待付款' },
  { value: 'PAYMENT_SUBMITTED', label: '已提交付款凭证' },
  { value: 'PAYMENT_REJECTED', label: '付款驳回' },
  { value: 'PAYMENT_APPROVED', label: '付款确认通过' },
  { value: 'WAIT_TRANSFER', label: '待拨货' },
  { value: 'TRANSFERRED', label: '已拨货' },
  { value: 'RECEIVED', label: '已收货' },
  { value: 'STOCK_IN', label: '已入库' },
  { value: 'CANCELLED', label: '已取消' },
  { value: 'CLOSED', label: '已关闭' },
];

export const jkWithdrawStatusOptions = [
  { value: 'SUBMITTED', label: '已提交' },
  { value: 'AUDITING', label: '审核中' },
  { value: 'APPROVED', label: '审核通过' },
  { value: 'REJECTED', label: '已驳回' },
  { value: 'PAID', label: '已打款' },
  { value: 'CANCELLED', label: '已取消' },
];

export const jkCommissionStatusOptions = [
  { value: 'CREATED', label: '已创建' },
  { value: 'PENDING_SETTLE', label: '待结算' },
  { value: 'FROZEN', label: '已冻结' },
  { value: 'SETTLED', label: '已结算' },
  { value: 'AVAILABLE', label: '可提现' },
  { value: 'WITHDRAWING', label: '提现中' },
  { value: 'WITHDRAWN', label: '已提现' },
  { value: 'REVERSED', label: '已冲正' },
  { value: 'CANCELLED', label: '已取消' },
];

export const jkCommissionSourceTypeOptions = [
  { value: 'RETAIL_ORDER', label: '零售订单' },
  { value: 'PLATFORM_ORDER', label: '平台订货' },
  { value: 'PLATFORM_ORDER_STOCK_IN', label: '平台订货入库' },
  { value: 'STOCK_TRANSFER', label: '库存调拨' },
  { value: 'WITHDRAW', label: '提现' },
  { value: 'MANUAL_ADJUST', label: '人工调整' },
];

export const jkFundFlowTypeOptions = [
  { value: 'SETTLE_IN', label: '结算转入' },
  { value: 'WITHDRAW_FREEZE', label: '提现冻结' },
  { value: 'WITHDRAW_RELEASE', label: '提现驳回释放' },
  { value: 'WITHDRAW_PAID', label: '线下打款' },
  { value: 'REVERSE_DEDUCT', label: '佣金冲正扣减' },
  { value: 'MANUAL_ADJUST', label: '人工调整' },
];

export const jkCommissionReverseTypeOptions = [
  { value: 'MANUAL_ADJUST', label: '人工调整' },
  { value: 'REFUND', label: '退款冲正' },
  { value: 'RETURN', label: '退货冲正' },
  { value: 'ORDER_CANCEL', label: '订单取消' },
  { value: 'TRANSFER_RETURN', label: '调拨退回' },
  { value: 'IDENTITY_FROZEN', label: '身份冻结' },
];
