import request from '@/utils/request'

export function getJkStockAccountOptions(params) {
  return request({ url: '/admin/jk/options/stock-accounts', method: 'get', params })
}
