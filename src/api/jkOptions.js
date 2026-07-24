import request from '@/utils/request'

export function getJkStockAccountOptions(params) {
  return request({ url: '/admin/jk/options/stock-accounts', method: 'get', params })
}

export function getJkPromotionMaterialList() {
  return request({ url: '/admin/jk/promotion/material/list', method: 'get' })
}

export function saveJkPromotionMaterials(data) {
  return request({ url: '/admin/jk/promotion/material/save', method: 'post', data })
}
