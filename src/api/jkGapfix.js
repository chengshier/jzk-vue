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
