import request from '@/utils/request'

// V3.1 第一批：关系人数规则与管理员强制调整
export function getRelationLimitRuleList(params) {
  return request({ url: '/admin/jk/relation-quota/rule/list', method: 'get', params })
}

export function saveRelationLimitRule(data) {
  return request({ url: '/admin/jk/relation-quota/rule/save', method: 'post', data })
}

export function updateRelationLimitRuleStatus(id, status) {
  return request({ url: '/admin/jk/relation-quota/rule/status', method: 'post', params: { id, status }})
}

export function getRelationQuotaUsage(params) {
  return request({ url: '/admin/jk/relation-quota/usage', method: 'get', params })
}

export function forceAdjustAgentRelation(data) {
  return request({ url: '/admin/jk/relation-quota/force-adjust', method: 'post', data })
}
