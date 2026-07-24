import request from '@/utils/request'

/** 仅具备确认打款权限的管理员可查看完整银行卡号。 */
export function getJkWithdrawPayee(id) {
  return request({ url: '/admin/jk/withdraw/payee/' + id, method: 'get' })
}
