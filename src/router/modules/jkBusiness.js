import Layout from '@/layout';

const jkBusinessRouter = {
  path: '/operation/jzk',
  component: Layout,
  redirect: '/operation/jzk/platformOrder',
  name: 'JkBusiness',
  meta: {
    title: '九州康业务',
    icon: 'clipboard',
  },
  children: [
    { path: 'commissionRule', component: () => import('@/views/jkBusiness/commissionRule/index'), name: 'jkCommissionRule', meta: { title: '分佣规则管理', icon: '' } },
    { path: 'commissionRecord', component: () => import('@/views/jkBusiness/commissionRecord/index'), name: 'jkCommissionRecord', meta: { title: '佣金明细', icon: '' } },
    { path: 'commissionAccount', component: () => import('@/views/jkBusiness/commissionAccount/index'), name: 'jkCommissionAccount', meta: { title: '佣金账户', icon: '' } },
    { path: 'commissionReverse', component: () => import('@/views/jkBusiness/commissionReverse/index'), name: 'jkCommissionReverse', meta: { title: '佣金冲正记录', icon: '' } },
    { path: 'commissionSettle', component: () => import('@/views/jkBusiness/commissionSettle/index'), name: 'jkCommissionSettle', meta: { title: '结算任务', icon: '' } },
    { path: 'fundAccount', component: () => import('@/views/jkBusiness/fundAccount/index'), name: 'jkFundAccount', meta: { title: '资金账户', icon: '' } },
    { path: 'fundFlow', component: () => import('@/views/jkBusiness/fundFlow/index'), name: 'jkFundFlow', meta: { title: '资金流水', icon: '' } },
    { path: 'withdrawAudit', component: () => import('@/views/jkBusiness/withdrawAudit/index'), name: 'jkWithdrawAudit', meta: { title: '提现审核', icon: '' } },
    {
      path: 'platformOrder',
      component: () => import('@/views/jkBusiness/platformOrder/index'),
      name: 'jkPlatformOrder',
      meta: { title: '区县代订货管理', icon: '' },
    },
    {
      path: 'stockTransfer',
      component: () => import('@/views/jkBusiness/stockTransfer/index'),
      name: 'jkStockTransfer',
      meta: { title: '创客/合伙人调拨管理', icon: '' },
    },
    {
      path: 'businessRole',
      component: () => import('@/views/jkBusiness/businessRole/index'),
      name: 'jkBusinessRole',
      meta: { title: '业务角色管理', icon: '' },
    },
    {
      path: 'businessPermission',
      component: () => import('@/views/jkBusiness/businessPermission/index'),
      name: 'jkBusinessPermission',
      meta: { title: '业务权限点管理', icon: '' },
    },
    {
      path: 'identityApply',
      component: () => import('@/views/jkBusiness/identityApplyAudit/index'),
      name: 'jkIdentityApplyAudit',
      meta: { title: '身份申请审核', icon: '' },
    },
    {
      path: 'userRole',
      component: () => import('@/views/jkBusiness/userBusinessIdentity/index'),
      name: 'jkUserBusinessIdentity',
      meta: { title: '用户业务身份管理', icon: '' },
    },
    {
      path: 'auditLog',
      component: () => import('@/views/jkBusiness/auditLog/index'),
      name: 'jkAuditLog',
      meta: { title: '审核日志', icon: '' },
    },
    {
      path: 'priceRule',
      component: () => import('@/views/jkBusiness/priceRule/index'),
      name: 'jkPriceRule',
      meta: { title: '价格规则管理', icon: '' },
    },
    {
      path: 'stockAccount',
      component: () => import('@/views/jkBusiness/stockAccount/index'),
      name: 'jkStockAccount',
      meta: { title: '库存账户底座', icon: '' },
    },
    {
      path: 'stockItem',
      component: () => import('@/views/jkBusiness/stockItem/index'),
      name: 'jkStockItem',
      meta: { title: '库存明细查询', icon: '' },
    },
    {
      path: 'stockFlow',
      component: () => import('@/views/jkBusiness/stockFlow/index'),
      name: 'jkStockFlow',
      meta: { title: '库存流水查询', icon: '' },
    },
  ],
};

export default jkBusinessRouter;
