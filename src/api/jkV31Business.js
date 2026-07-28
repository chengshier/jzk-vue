import request from '@/utils/request'

export function getJkOfflineSaleList(params) { return request({ url: '/admin/jk/offline-sale/list', method: 'get', params }) }
export function getJkOfflineSaleDetail(id) { return request({ url: '/admin/jk/offline-sale/' + id, method: 'get' }) }
export function auditJkOfflineSale(data) { return request({ url: '/admin/jk/offline-sale/audit', method: 'post', data }) }

export function getJkPerformanceRecordList(params) { return request({ url: '/admin/jk/performance/list', method: 'get', params }) }
export function getJkOperationProfitList(params) { return request({ url: '/admin/jk/operation-profit/list', method: 'get', params }) }

export function trialJkCommissionRule(data) { return request({ url: '/admin/jk/commission/rule/trial', method: 'post', data }) }
export function publishJkCommissionRule(data) { return request({ url: '/admin/jk/commission/rule/publish', method: 'post', data }) }
export function disableJkCommissionRule(id, reason) { return request({ url: '/admin/jk/commission/rule/disable', method: 'post', params: { id, reason } }) }
