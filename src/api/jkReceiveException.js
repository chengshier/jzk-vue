import request from '@/utils/request'

export function getJkReceiveExceptionList(params) {
  return request({ url: '/admin/jk/receive-exception/list', method: 'get', params })
}

export function getJkReceiveExceptionDetail(id) {
  return request({ url: '/admin/jk/receive-exception/' + id, method: 'get' })
}

export function handleJkReceiveException(data) {
  return request({ url: '/admin/jk/receive-exception/handle', method: 'post', data })
}
