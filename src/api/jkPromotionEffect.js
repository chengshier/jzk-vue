import request from '@/utils/request'

export const getPromotionEffectSummary = params => request({ url: '/admin/jk/promotion-effect/summary', method: 'get', params })
export const getPromotionEffectList = params => request({ url: '/admin/jk/promotion-effect/list', method: 'get', params })
