import request from '@/utils/request'

export const getStockCheckList = params => request({ url: '/admin/jk/stock-check/list', method: 'get', params })
export const getStockCheckDetail = id => request({ url: `/admin/jk/stock-check/${id}`, method: 'get' })
export const createStockCheck = data => request({ url: '/admin/jk/stock-check/create', method: 'post', data })
export const saveStockCheckCount = (id, data) => request({ url: `/admin/jk/stock-check/${id}/count`, method: 'post', data })
export const submitStockCheck = (id, data) => request({ url: `/admin/jk/stock-check/${id}/submit`, method: 'post', data })
export const auditStockCheck = data => request({ url: '/admin/jk/stock-check/audit', method: 'post', data })

export const getReceiveResolutionList = params => request({ url: '/admin/jk/receive-exception-resolution/list', method: 'get', params })
export const createReceiveResolution = data => request({ url: '/admin/jk/receive-exception-resolution/create', method: 'post', data })
export const completeReceiveResolution = data => request({ url: '/admin/jk/receive-exception-resolution/complete', method: 'post', data })
export const cancelReceiveResolution = data => request({ url: '/admin/jk/receive-exception-resolution/cancel', method: 'post', data })

export const getHealthReportList = params => request({ url: '/admin/jk/health/report/list', method: 'get', params })
export const getHealthReportDetail = id => request({ url: `/admin/jk/health/report/${id}`, method: 'get' })

export const getPromotionSceneList = params => request({ url: '/admin/jk/promotion-code/scene/list', method: 'get', params })
export const savePromotionScene = data => request({ url: '/admin/jk/promotion-code/scene/save', method: 'post', data })
export const getPromotionStatus = () => request({ url: '/admin/jk/promotion-code/status', method: 'get' })

export const getSubscriptionTaskList = params => request({ url: '/admin/jk/subscription-task/list', method: 'get', params })
export const getSubscriptionStatus = () => request({ url: '/admin/jk/subscription-task/status', method: 'get' })
export const processSubscriptionTasks = limit => request({ url: '/admin/jk/subscription-task/process', method: 'post', params: { limit } })
export const retrySubscriptionTask = (id, reason) => request({ url: `/admin/jk/subscription-task/${id}/retry`, method: 'post', params: { reason } })

export const getFileStorageStatus = () => request({ url: '/admin/jk/file/status', method: 'get' })
