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

export function getJkPriceRuleRegionOptions(params) {
  return request({ url: '/admin/jk/price-rule/region/options', method: 'get', params })
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

export function saveJkBusinessRole(data) { return request({ url: '/admin/jk/business-role/save', method: 'post', data }) }
export function assignJkBusinessRolePermissions(data) { return request({ url: '/admin/jk/business-role/assign-permissions', method: 'post', data }) }
export function saveJkBusinessPermission(data) { return request({ url: '/admin/jk/business-permission/save', method: 'post', data }) }
export function updateJkBusinessPermissionStatus(id, enabled) { return request({ url: '/admin/jk/business-permission/status', method: 'post', params: { id, enabled } }) }

export function getJkRegionList(params) { return request({ url: '/admin/jk/region/list', method: 'get', params }) }
export function getJkRegionChildren(params) { return request({ url: '/admin/jk/region/children', method: 'get', params }) }
export function searchJkRegions(params) { return request({ url: '/admin/jk/region/search', method: 'get', params }) }
export function getJkRegionPath(regionCode) { return request({ url: '/admin/jk/region/path/' + regionCode, method: 'get' }) }
export function getJkRegionSelectorOptions(params) { return request({ url: '/admin/jk/region/options', method: 'get', params }) }
export function getJkRegionUsage(regionCode) { return request({ url: '/admin/jk/region/' + regionCode + '/usage', method: 'get' }) }
export const getRegionChildren = getJkRegionChildren
export const searchRegions = searchJkRegions
export const getRegionPath = getJkRegionPath
export const getRegionOptions = getJkRegionSelectorOptions
export const getRegionUsage = getJkRegionUsage
export function saveJkRegion(data) { return request({ url: '/admin/jk/region/save', method: 'post', data }) }
export function updateJkRegionStatus(id, status) { return request({ url: '/admin/jk/region/status', method: 'post', params: { id, status } }) }
export function getJkRegionAgentList(params) { return request({ url: '/admin/jk/region-agent/list', method: 'get', params }) }
export function bindJkRegionAgent(data) { return request({ url: '/admin/jk/region-agent/bind', method: 'post', data }) }
export function invalidateJkRegionAgent(id, reason) { return request({ url: '/admin/jk/region-agent/invalidate', method: 'post', params: { id, reason } }) }
export function getJkAgentRelationList(params) { return request({ url: '/admin/jk/agent-relation/list', method: 'get', params }) }
export function bindJkAgentRelation(data) { return request({ url: '/admin/jk/agent-relation/bind', method: 'post', data }) }
export function invalidateJkAgentRelation(id, reason) { return request({ url: '/admin/jk/agent-relation/invalidate', method: 'post', params: { id, reason } }) }
export function getJkAdminMappingList(params) { return request({ url: '/admin/jk/admin-mapping/list', method: 'get', params }) }
export function saveJkAdminMapping(data) { return request({ url: '/admin/jk/admin-mapping/save', method: 'post', data }) }
export function updateJkAdminMappingStatus(id, status) { return request({ url: '/admin/jk/admin-mapping/status', method: 'post', params: { id, status } }) }

export function getJkDictTypeList(params) { return request({ url: '/admin/jk/dict/type/list', method: 'get', params }) }
export function saveJkDictType(data) { return request({ url: '/admin/jk/dict/type/save', method: 'post', data }) }
export function updateJkDictTypeStatus(id, status) { return request({ url: '/admin/jk/dict/type/status', method: 'post', params: { id, status } }) }
export function getJkDictItemList(params) { return request({ url: '/admin/jk/dict/item/list', method: 'get', params }) }
export function saveJkDictItem(data) { return request({ url: '/admin/jk/dict/item/save', method: 'post', data }) }
export function updateJkDictItemStatus(id, status) { return request({ url: '/admin/jk/dict/item/status', method: 'post', params: { id, status } }) }
export function getJkCommissionFlowList(params) { return request({ url: '/admin/jk/commission/flow/list', method: 'get', params }) }

// 前四阶段最终闭环：可靠事件、自动结算、账户对账、换绑审核、调拨退回
export function getJkBusinessEventList(params) { return request({ url: '/admin/jk/closure/event/list', method: 'get', params }) }
export function retryJkBusinessEvent(data) { return request({ url: '/admin/jk/closure/event/retry', method: 'post', data }) }
export function triggerJkAutoSettle(params) { return request({ url: '/admin/jk/closure/commission/auto-settle', method: 'post', params }) }
export function getJkAccountReconcileList(params) { return request({ url: '/admin/jk/closure/account-reconcile/list', method: 'get', params }) }
export function runJkAccountReconcile(data) { return request({ url: '/admin/jk/closure/account-reconcile/run', method: 'post', data }) }
export function getJkRelationChangeList(params) { return request({ url: '/admin/jk/agent-relation/change/list', method: 'get', params }) }
export function getJkRelationChangeDetail(id) { return request({ url: '/admin/jk/agent-relation/change/' + id, method: 'get' }) }
export function auditJkRelationChange(data) { return request({ url: '/admin/jk/agent-relation/change/audit', method: 'post', data }) }
export function getJkStockTransferReturnList(params) { return request({ url: '/admin/jk/stock-transfer-return/list', method: 'get', params }) }
export function getJkStockTransferReturnDetail(id) { return request({ url: '/admin/jk/stock-transfer-return/' + id, method: 'get' }) }
export function auditJkStockTransferReturn(data) { return request({ url: '/admin/jk/stock-transfer-return/audit', method: 'post', data }) }
export function receiveJkStockTransferReturn(data) { return request({ url: '/admin/jk/stock-transfer-return/receive', method: 'post', data }) }
export function refundJkStockTransferReturn(data) { return request({ url: '/admin/jk/stock-transfer-return/refund', method: 'post', data }) }
export function closeJkStockTransferReturn(data) { return request({ url: '/admin/jk/stock-transfer-return/close', method: 'post', data }) }

// 九州康后台通用选择器
export function getJkUserOptions(params) { return request({ url: '/admin/jk/options/users', method: 'get', params }) }
export function getJkAdminOptions(params) { return request({ url: '/admin/jk/options/admins', method: 'get', params }) }
export function getJkRegionOptions(params) { return request({ url: '/admin/jk/options/regions', method: 'get', params }) }

// 第五阶段：健康数据管理
export function getJkHealthBindList(params) { return request({ url: '/admin/jk/health/bind/list', method: 'get', params }) }
export function getJkHealthDataList(params) { return request({ url: '/admin/jk/health/data/list', method: 'get', params }) }
export function exportJkHealthData(params) { return request({ url: '/admin/jk/health/data/export', method: 'get', params, responseType: 'blob' }) }
export function getJkHealthSyncList(params) { return request({ url: '/admin/jk/health/sync/list', method: 'get', params }) }
export function retryJkHealthSync(id) { return request({ url: '/admin/jk/health/sync/' + id + '/retry', method: 'post' }) }
export function getJkHealthIntegrationStatus() { return request({ url: '/admin/jk/health/integration/status', method: 'get' }) }

export function getJkHealthDeviceList(params) { return request({ url: '/admin/jk/health/device/list', method: 'get', params }) }
export function saveJkHealthDevice(data) { return request({ url: '/admin/jk/health/device/save', method: 'post', data }) }
export function getJkHealthAuthorizationList(params) { return request({ url: '/admin/jk/health/authorization/list', method: 'get', params }) }
export function getJkHealthAlertRuleList(params) { return request({ url: '/admin/jk/health/alert-rule/list', method: 'get', params }) }
export function saveJkHealthAlertRule(data) { return request({ url: '/admin/jk/health/alert-rule/save', method: 'post', data }) }
export function getJkHealthAlertRecordList(params) { return request({ url: '/admin/jk/health/alert-record/list', method: 'get', params }) }
export function processJkHealthAlert(data) { return request({ url: '/admin/jk/health/alert-record/process', method: 'post', data }) }
export function getJkHealthAccessLogList(params) { return request({ url: '/admin/jk/health/access-log/list', method: 'get', params }) }

// 第六阶段：报表与风险
export function getJkPhaseSixOverview() { return request({ url: '/admin/jk/phase-six/overview', method: 'get' }) }
export function getJkRiskEventList(params) { return request({ url: '/admin/jk/phase-six/risk/list', method: 'get', params }) }
export function handleJkRiskEvent(data) { return request({ url: '/admin/jk/phase-six/risk/handle', method: 'post', data }) }

// 第五阶段正式完善：健康厂商 Callback/Pull 双模式与平台协助核查
export function getJkHealthProviderList(params) { return request({ url: '/admin/jk/health/provider/list', method: 'get', params }) }
export function saveJkHealthProvider(data) { return request({ url: '/admin/jk/health/provider/save', method: 'post', data }) }
export function pullJkHealthProvider(data) { return request({ url: '/admin/jk/health/provider/pull', method: 'post', data }) }
export function emergencyViewJkHealthData(data, params) { return request({ url: '/admin/jk/health/emergency/data/list', method: 'post', data, params }) }
export function emergencyExportJkHealthData(data) { return request({ url: '/admin/jk/health/emergency/data/export', method: 'post', data, responseType: 'blob' }) }

// 第六阶段正式完善：库存批次、经营报表与导出
export function getJkStockBatchList(params) { return request({ url: '/admin/jk/stock-batch/list', method: 'get', params }) }
export function initJkStockBatchOpening() { return request({ url: '/admin/jk/stock-batch/opening-init', method: 'post' }) }
export function runJkReportDaily(params) { return request({ url: '/admin/jk/phase-six/report/daily/run', method: 'post', params }) }
export function getJkReportTrend(params) { return request({ url: '/admin/jk/phase-six/report/trend', method: 'get', params }) }
export function getJkRegionReport(params) { return request({ url: '/admin/jk/phase-six/report/region', method: 'get', params }) }
export function getJkTeamReport(params) { return request({ url: '/admin/jk/phase-six/report/team', method: 'get', params }) }
export function getJkInventoryAgingReport(params) { return request({ url: '/admin/jk/phase-six/report/inventory-aging', method: 'get', params }) }
export function getJkInventoryReconcileReport(params) { return request({ url: '/admin/jk/phase-six/report/inventory-reconcile', method: 'get', params }) }
export function getJkFinanceReport(params) { return request({ url: '/admin/jk/phase-six/report/finance', method: 'get', params }) }
export function getJkHealthAnonymousReport(params) { return request({ url: '/admin/jk/phase-six/report/health-anonymous', method: 'get', params }) }
export function createJkReportExport(data) { return request({ url: '/admin/jk/phase-six/report/export/create', method: 'post', data }) }
export function getJkReportExportList(params) { return request({ url: '/admin/jk/phase-six/report/export/list', method: 'get', params }) }
export function runJkReportExports() { return request({ url: '/admin/jk/phase-six/report/export/run', method: 'post' }) }
export function downloadJkReportExport(id) { return request({ url: '/admin/jk/phase-six/report/export/' + id + '/download', method: 'get', responseType: 'blob' }) }

export function getJkRiskRuleList(params) { return request({ url: '/admin/jk/phase-six/risk/rule/list', method: 'get', params }) }
export function saveJkRiskRule(data) { return request({ url: '/admin/jk/phase-six/risk/rule/save', method: 'post', data }) }
export function enableJkRiskRule(id, enabled) { return request({ url: `/admin/jk/phase-six/risk/rule/${id}/enabled`, method: 'post', params: { enabled } }) }
export function runJkRiskRule(id) { return request({ url: `/admin/jk/phase-six/risk/rule/${id}/run`, method: 'post' }) }
export function runAllJkRiskRules() { return request({ url: '/admin/jk/phase-six/risk/rule/run-all', method: 'post' }) }
export function updateJkStockBatchMetadata(data) { return request({ url: '/admin/jk/stock-batch/metadata', method: 'post', data }) }
