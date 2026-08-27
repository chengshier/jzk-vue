import Layout from '@/layout';

const jkBusinessRouter = {
  path: '/operation/jzk', component: Layout, redirect: '/operation/jzk/platformOrder', name: 'JkBusiness', meta: { title: '九州康管理', icon: 'clipboard' },
  children: [
    // 身份与团队
    { path: 'identityApply', component: () => import('@/views/jkBusiness/identityApplyAudit/index'), name: 'jkIdentityApplyAudit', meta: { title: '身份申请审核', section: 'identity' } },
    { path: 'userRole', component: () => import('@/views/jkBusiness/userBusinessIdentity/index'), name: 'jkUserBusinessIdentity', meta: { title: '业务身份管理', section: 'identity' } },
    { path: 'region', component: () => import('@/views/jkBusiness/region/index'), name: 'jkRegion', meta: { title: '区域管理', section: 'identity' } },
    { path: 'regionAgent', component: () => import('@/views/jkBusiness/regionAgent/index'), name: 'jkRegionAgent', meta: { title: '区域代理配置', section: 'identity' } },
    { path: 'agentRelation', component: () => import('@/views/jkBusiness/agentRelation/index'), name: 'jkAgentRelation', meta: { title: '上下级关系', section: 'identity' } },
    { path: 'relationLimit', component: () => import('@/views/jkBusiness/relationLimit/index'), name: 'jkRelationLimit', meta: { title: '绑定人数规则', section: 'identity' } },
    { path: 'relationChange', component: () => import('@/views/jkBusiness/relationChange/index'), name: 'jkRelationChange', meta: { title: '换绑申请审核', section: 'identity' } },
    { path: 'auditLog', component: () => import('@/views/jkBusiness/auditLog/index'), name: 'jkAuditLog', meta: { title: '业务审核日志', section: 'identity' } },

    // 商品、价格和推广内容
    { path: 'priceRule', component: () => import('@/views/jkBusiness/priceRule/index'), name: 'jkPriceRule', meta: { title: '商品价格规则', section: 'product' } },
    { path: 'promotionMaterial', component: () => import('@/views/jkBusiness/promotionMaterial/index'), name: 'jkPromotionMaterial', meta: { title: '推广素材管理', section: 'product' } },

    // 订货、调拨和终端零售
    { path: 'platformOrder', component: () => import('@/views/jkBusiness/platformOrder/index'), name: 'jkPlatformOrder', meta: { title: '平台订货管理', section: 'trade' } },
    { path: 'stockTransfer', component: () => import('@/views/jkBusiness/stockTransfer/index'), name: 'jkStockTransfer', meta: { title: '库存调拨管理', section: 'trade' } },
    { path: 'stockTransferReturn', component: () => import('@/views/jkBusiness/stockTransferReturn/index'), name: 'jkStockTransferReturn', meta: { title: '调拨退回管理', section: 'trade' } },
    { path: 'receiveException', component: () => import('@/views/jkBusiness/receiveException/index'), name: 'jkReceiveException', meta: { title: '异常收货处理', section: 'trade' } },
    { path: 'businessLedger', component: () => import('@/views/jkBusiness/businessLedger/index'), name: 'jkBusinessLedger', meta: { title: '业绩与线下销售', section: 'trade' } },

    // 库存
    { path: 'stockAccount', component: () => import('@/views/jkBusiness/stockAccount/index'), name: 'jkStockAccount', meta: { title: '库存主体', section: 'stock' } },
    { path: 'stockItem', component: () => import('@/views/jkBusiness/stockItem/index'), name: 'jkStockItem', meta: { title: '库存明细', section: 'stock' } },
    { path: 'stockFlow', component: () => import('@/views/jkBusiness/stockFlow/index'), name: 'jkStockFlow', meta: { title: '库存流水', section: 'stock' } },
    { path: 'stockBatch', component: () => import('@/views/jkBusiness/stockBatch/index'), name: 'jkStockBatch', meta: { title: '批次与库龄', section: 'stock' } },
    { path: 'stockCheck', component: () => import('@/views/jkBusiness/stockCheck/index'), name: 'jkStockCheck', meta: { title: '库存盘点', section: 'stock' } },

    // 收益与资金
    { path: 'commissionRule', component: () => import('@/views/jkBusiness/commissionRule/index'), name: 'jkCommissionRule', meta: { title: '旧版分佣规则', section: 'finance' } },
    { path: 'commissionV31', component: () => import('@/views/jkBusiness/commissionV31/index'), name: 'jkCommissionV31', meta: { title: '角色佣金规则 V3.1', section: 'finance' } },
    { path: 'commissionRecord', component: () => import('@/views/jkBusiness/commissionRecord/index'), name: 'jkCommissionRecord', meta: { title: '佣金明细', section: 'finance' } },
    { path: 'commissionAccount', component: () => import('@/views/jkBusiness/commissionAccount/index'), name: 'jkCommissionAccount', meta: { title: '佣金账户', section: 'finance' } },
    { path: 'commissionFlow', component: () => import('@/views/jkBusiness/commissionFlow/index'), name: 'jkCommissionFlow', meta: { title: '佣金流水', section: 'finance' } },
    { path: 'commissionReverse', component: () => import('@/views/jkBusiness/commissionReverse/index'), name: 'jkCommissionReverse', meta: { title: '佣金冲正', section: 'finance' } },
    { path: 'commissionSettle', component: () => import('@/views/jkBusiness/commissionSettle/index'), name: 'jkCommissionSettle', meta: { title: '佣金结算任务', section: 'finance' } },
    { path: 'fundAccount', component: () => import('@/views/jkBusiness/fundAccount/index'), name: 'jkFundAccount', meta: { title: '资金账户', section: 'finance' } },
    { path: 'fundFlow', component: () => import('@/views/jkBusiness/fundFlow/index'), name: 'jkFundFlow', meta: { title: '资金流水', section: 'finance' } },
    { path: 'withdrawAudit', component: () => import('@/views/jkBusiness/withdrawAudit/index'), name: 'jkWithdrawAudit', meta: { title: '提现审核', section: 'finance' } },

    // 经营、风险与健康
    { path: 'reportOverview', component: () => import('@/views/jkBusiness/reportOverview/index'), name: 'jkReportOverview', meta: { title: '业务总览报表', section: 'report' } },
    { path: 'reportAnalysis', component: () => import('@/views/jkBusiness/reportAnalysis/index'), name: 'jkReportAnalysis', meta: { title: '经营分析报表', section: 'report' } },
    { path: 'reportExport', component: () => import('@/views/jkBusiness/reportExport/index'), name: 'jkReportExport', meta: { title: '报表导出中心', section: 'report' } },
    { path: 'riskEvent', component: () => import('@/views/jkBusiness/riskEvent/index'), name: 'jkRiskEvent', meta: { title: '风险事件中心', section: 'risk' } },
    { path: 'riskRule', component: () => import('@/views/jkBusiness/riskRule/index'), name: 'jkRiskRule', meta: { title: '风险规则配置', section: 'risk' } },
    { path: 'healthProvider', component: () => import('@/views/jkBusiness/healthProvider/index'), name: 'jkHealthProvider', meta: { title: '健康厂商接入', section: 'health' } },
    { path: 'healthDevice', component: () => import('@/views/jkBusiness/healthDevice/index'), name: 'jkHealthDevice', meta: { title: '健康设备管理', section: 'health' } },
    { path: 'healthBind', component: () => import('@/views/jkBusiness/healthBind/index'), name: 'jkHealthBind', meta: { title: '设备绑定记录', section: 'health' } },
    { path: 'healthData', component: () => import('@/views/jkBusiness/healthData/index'), name: 'jkHealthData', meta: { title: '授权健康数据', section: 'health' } },
    { path: 'healthAuthorization', component: () => import('@/views/jkBusiness/healthAuthorization/index'), name: 'jkHealthAuthorization', meta: { title: '健康授权查询', section: 'health' } },
    { path: 'healthAlertRule', component: () => import('@/views/jkBusiness/healthAlertRule/index'), name: 'jkHealthAlertRule', meta: { title: '健康预警规则', section: 'health' } },
    { path: 'healthAlertRecord', component: () => import('@/views/jkBusiness/healthAlertRecord/index'), name: 'jkHealthAlertRecord', meta: { title: '健康预警处理', section: 'health' } },
    { path: 'healthAccessLog', component: () => import('@/views/jkBusiness/healthAccessLog/index'), name: 'jkHealthAccessLog', meta: { title: '健康访问日志', section: 'health' } },
    { path: 'healthSync', component: () => import('@/views/jkBusiness/healthSync/index'), name: 'jkHealthSync', meta: { title: '健康同步日志', section: 'health' } },
    { path: 'healthIntegration', component: () => import('@/views/jkBusiness/healthIntegration/index'), name: 'jkHealthIntegration', meta: { title: '健康接入状态', section: 'health' } },

    // 系统与运维
    { path: 'businessRole', component: () => import('@/views/jkBusiness/businessRole/index'), name: 'jkBusinessRole', meta: { title: '系统·业务角色', section: 'system' } },
    { path: 'businessPermission', component: () => import('@/views/jkBusiness/businessPermission/index'), name: 'jkBusinessPermission', meta: { title: '系统·权限点', section: 'system' } },
    { path: 'adminMapping', component: () => import('@/views/jkBusiness/adminMapping/index'), name: 'jkAdminMapping', meta: { title: '系统·账号映射', section: 'system' } },
    { path: 'dict', component: () => import('@/views/jkBusiness/dict/index'), name: 'jkDict', meta: { title: '系统·业务字典', section: 'system' } },
    { path: 'businessEvent', component: () => import('@/views/jkBusiness/businessEvent/index'), name: 'jkBusinessEvent', meta: { title: '运维·事件补偿', section: 'system' } },
    { path: 'accountReconcile', component: () => import('@/views/jkBusiness/accountReconcile/index'), name: 'jkAccountReconcile', meta: { title: '运维·账户对账', section: 'system' } }
  ]
};
export default jkBusinessRouter;
