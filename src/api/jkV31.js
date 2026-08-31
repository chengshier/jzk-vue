import request from '@/utils/request'

// V3.1 第一批：关系人数规则与管理员强制调整
export function getRelationLimitRuleList(params) { return request({ url: '/admin/jk/relation-quota/rule/list', method: 'get', params }) }
export function saveRelationLimitRule(data) { return request({ url: '/admin/jk/relation-quota/rule/save', method: 'post', data }) }
export function updateRelationLimitRuleStatus(id, status) { return request({ url: '/admin/jk/relation-quota/rule/status', method: 'post', params: { id, status }}) }
export function getRelationQuotaUsage(params) { return request({ url: '/admin/jk/relation-quota/usage', method: 'get', params }) }
export function forceAdjustAgentRelation(data) { return request({ url: '/admin/jk/relation-quota/force-adjust', method: 'post', data }) }

// V3.1 第二批：业绩、经营收益与线下销售
export function getPerformanceRecords(params) { return request({ url: '/admin/jk/performance/list', method: 'get', params }) }
export function getOperationProfitRecords(params) { return request({ url: '/admin/jk/operation-profit/list', method: 'get', params }) }
export function getOfflineSaleList(params) { return request({ url: '/admin/jk/offline-sale/list', method: 'get', params }) }
export function getOfflineSaleDetail(id) { return request({ url: '/admin/jk/offline-sale/' + id, method: 'get' }) }
export function auditOfflineSale(data) { return request({ url: '/admin/jk/offline-sale/audit', method: 'post', data }) }

// V3.1 第三批：盘点、推广、消息、导出与健康报告
export function getStockCheckList(params) { return request({ url: '/admin/jk/stock-check/list', method: 'get', params }) }
export function getStockCheckDetail(id) { return request({ url: '/admin/jk/stock-check/' + id, method: 'get' }) }
export function createStockCheck(data) { return request({ url: '/admin/jk/stock-check/create', method: 'post', data }) }
export function submitStockCheck(data) { return request({ url: '/admin/jk/stock-check/submit', method: 'post', data }) }
export function auditStockCheck(data) { return request({ url: '/admin/jk/stock-check/audit', method: 'post', data }) }
export function getPromotionStats(params) { return request({ url: '/admin/jk/promotion/stat/list', method: 'get', params }) }
export function getSubscriptionTasks(params) { return request({ url: '/admin/jk/subscription/task/list', method: 'get', params }) }
export function getReportExportTasks(params) { return request({ url: '/admin/jk/report-export-task/list', method: 'get', params }) }
export function getHealthReports(params) { return request({ url: '/admin/jk/health/report/list', method: 'get', params }) }
