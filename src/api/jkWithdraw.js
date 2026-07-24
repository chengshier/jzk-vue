import request from '@/utils/request'

/** 仅具备确认打款权限的管理员可主动查看完整银行卡号，服务端禁止缓存。 */
export function getJkWithdrawPayee(id) {
  return request({ url: '/admin/jk/withdraw/payee/' + id + '/reveal', method: 'post', data: {} })
}
