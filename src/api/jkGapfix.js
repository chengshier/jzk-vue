import request from '@/utils/request'

export const getRetailAttributionList = params => request({ url: '/admin/jk/retail-attribution/list', method: 'get', params })
export const getRetailAttributionDetail = id => request({ url: `/admin/jk/retail-attribution/${id}`, method: 'get' })
export const getRetailAttributionOverview = id => request({ url: `/admin/jk/retail-attribution/${id}/overview`, method: 'get' })
export const resolveRetailAttribution = (id, data) => request({ url: `/admin/jk/retail-attribution/${id}/resolve`, method: 'post', data })
export const adjustRetailAttribution = (id, data) => request({ url: `/admin/jk/retail-attribution/${id}/adjust`, method: 'post', data })

export const getJkUserProfileRegion = userId => request({ url: `/admin/jk/user/${userId}/region`, method: 'get' })
export const saveJkUserProfileRegion = (userId, data) => request({ url: `/admin/jk/user/${userId}/region`, method: 'post', data })

export const getJkRegionOptions = params => request({ url: '/admin/jk/options/regions', method: 'get', params })
export const getJkUserOptions = params => request({ url: '/admin/jk/options/users', method: 'get', params })

export const getBusinessPlanList = params => request({ url: '/admin/jk/business-plan/list', method: 'get', params })
export const getBusinessPlanDetail = id => request({ url: `/admin/jk/business-plan/${id}`, method: 'get' })
export const getBusinessPlanRoleCards = () => request({ url: '/admin/jk/business-plan/role-cards', method: 'get' })
export const saveBusinessPlan = data => request({ url: '/admin/jk/business-plan/save', method: 'post', data })
export const copyBusinessPlan = (id, changeSummary) => request({ url: `/admin/jk/business-plan/${id}/copy`, method: 'post', params: { changeSummary } })
export const publishBusinessPlan = data => request({ url: '/admin/jk/business-plan/publish', method: 'post', data })
export const disableBusinessPlan = (id, reason) => request({ url: `/admin/jk/business-plan/${id}/disable`, method: 'post', params: { reason } })

export const getCommissionTemplates = params => request({ url: '/admin/jk/commission/rule/templates', method: 'get', params })
export const saveCommissionTemplateDraft = data => request({ url: '/admin/jk/commission/rule/template/save', method: 'post', data })
export const trialCommissionBySource = data => request({ url: '/admin/jk/commission/rule/trial/source', method: 'post', data })
