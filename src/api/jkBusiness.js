import request from '@/utils/request'

export function getJkBusinessRoleList(params) {
  return request({ url: '/admin/jk/business-role/list', method: 'get', params })
}

export function updateJkBusinessRoleStatus(data) {
  return request({ url: '/admin/jk/business-role/updateStatus', method: 'post', data })
}

export function getJkBusinessPermissionList() {
  return request({ url: '/admin/jk/business-permission/list', method: 'get' })
}

export function getJkIdentityApplyList(params) {
  return request({ url: '/admin/jk/identity/apply/list', method: 'get', params })
}

export function auditJkIdentityApply(data) {
  return request({ url: '/admin/jk/identity/apply/audit', method: 'post', data })
}

export function getJkUserBusinessRoleList(params) {
  return request({ url: '/admin/jk/identity/user-role/list', method: 'get', params })
}

export function freezeJkIdentity(data) {
  return request({ url: '/admin/jk/identity/freeze', method: 'post', data })
}

export function unfreezeJkIdentity(data) {
  return request({ url: '/admin/jk/identity/unfreeze', method: 'post', data })
}

export function cancelJkIdentity(data) {
  return request({ url: '/admin/jk/identity/cancel', method: 'post', data })
}

export function getJkAuditLogList(params) {
  return request({ url: '/admin/jk/audit-log/list', method: 'get', params })
}

export function getJkPriceRuleList(params) {
  return request({ url: '/admin/jk/price-rule/list', method: 'get', params })
}

export function saveJkPriceRule(data) {
  return request({ url: '/admin/jk/price-rule/save', method: 'post', data })
}

export function updateJkPriceRuleStatus(data) {
  return request({ url: '/admin/jk/price-rule/updateStatus', method: 'post', data })
}

export function getJkPriceRuleRegionOptions() {
  return request({ url: '/admin/jk/price-rule/region/options', method: 'get' })
}

export function getJkStockAccountList(params) {
  return request({ url: '/admin/jk/stock/account/list', method: 'get', params })
}

export function getJkStockItemList(params) {
  return request({ url: '/admin/jk/stock/item/list', method: 'get', params })
}

export function getJkStockFlowList(params) {
  return request({ url: '/admin/jk/stock/flow/list', method: 'get', params })
}

export function getJkPlatformOrderList(params) {
  return request({ url: '/admin/jk/platform-order/list', method: 'get', params })
}

export function getJkPlatformOrderDetail(id) {
  return request({ url: '/admin/jk/platform-order/' + id + '/detail', method: 'get' })
}

export function auditJkPlatformOrderPayment(data) {
  return request({ url: '/admin/jk/platform-order/payment/audit', method: 'post', data })
}

export function shipJkPlatformOrder(data) {
  return request({ url: '/admin/jk/platform-order/ship', method: 'post', data })
}

export function closeJkPlatformOrder(data) {
  return request({ url: '/admin/jk/platform-order/close', method: 'post', data })
}

export function getJkStockTransferList(params) {
  return request({ url: '/admin/jk/stock-transfer/list', method: 'get', params })
}

export function getJkStockTransferDetail(id) {
  return request({ url: '/admin/jk/stock-transfer/' + id + '/detail', method: 'get' })
}

export function auditJkStockTransfer(data) {
  return request({ url: '/admin/jk/stock-transfer/audit', method: 'post', data })
}

export function confirmJkStockTransferPayment(data) {
  return request({ url: '/admin/jk/stock-transfer/payment/confirm', method: 'post', data })
}

export function dispatchJkStockTransfer(data) {
  return request({ url: '/admin/jk/stock-transfer/dispatch', method: 'post', data })
}

export function closeJkStockTransfer(data) {
  return request({ url: '/admin/jk/stock-transfer/close', method: 'post', data })
}

export function getJkCommissionRuleList(params) { return request({ url: '/admin/jk/commission/rule/list', method: 'get', params }) }
export function saveJkCommissionRule(data) { return request({ url: '/admin/jk/commission/rule/save', method: 'post', data }) }
export function getJkCommissionRecordList(params) { return request({ url: '/admin/jk/commission/record/list', method: 'get', params }) }
export function getJkCommissionAccountList(params) { return request({ url: '/admin/jk/commission/account/list', method: 'get', params }) }
export function getJkCommissionReverseList(params) { return request({ url: '/admin/jk/commission/reverse/list', method: 'get', params }) }
export function getJkFundAccountList(params) { return request({ url: '/admin/jk/fund/account/list', method: 'get', params }) }
export function getJkFundFlowList(params) { return request({ url: '/admin/jk/fund/flow/list', method: 'get', params }) }
export function getJkWithdrawList(params) { return request({ url: '/admin/jk/withdraw/list', method: 'get', params }) }
export function auditJkWithdraw(data) { return request({ url: '/admin/jk/withdraw/audit', method: 'post', data }) }
export function confirmJkWithdrawPaid(data) { return request({ url: '/admin/jk/withdraw/confirm-paid', method: 'post', data }) }
export function getJkCommissionSettleTaskList(params) { return request({ url: '/admin/jk/commission/settle/task/list', method: 'get', params }) }
export function settleJkCommissionRecords(data) { return request({ url: '/admin/jk/commission/settle/manual', method: 'post', data }) }

export function updateJkCommissionRuleStatus(id, status) { return request({ url: '/admin/jk/commission/rule/updateStatus', method: 'post', params: { id, status }}) }

export function manualJkCommissionReverse(data) { return request({ url: '/admin/jk/commission/reverse/manual', method: 'post', data }) }

export function getJkCommissionRuleItemList(params) { return request({ url: '/admin/jk/commission/rule/item/list', method: 'get', params }) }
export function saveJkCommissionRuleItem(data) { return request({ url: '/admin/jk/commission/rule/item/save', method: 'post', data }) }
export function updateJkCommissionRuleItemStatus(id, status) { return request({ url: '/admin/jk/commission/rule/item/updateStatus', method: 'post', params: { id, status }}) }
