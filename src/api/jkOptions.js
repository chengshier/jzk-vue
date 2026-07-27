import request from '@/utils/request'

export function getJkUserOptions(params) {
  return request({ url: '/admin/jk/options/users', method: 'get', params })
}

export function getJkRegionOptions(params) {
  return request({ url: '/admin/jk/options/regions', method: 'get', params })
}

export function getJkStockAccountOptions(params) {
  return request({ url: '/admin/jk/options/stock-accounts', method: 'get', params })
}

export function getJkPromotionMaterialList() {
  return request({ url: '/admin/jk/promotion/material/list', method: 'get' })
}

export function saveJkPromotionMaterials(data) {
  return request({ url: '/admin/jk/promotion/material/save', method: 'post', data })
}
