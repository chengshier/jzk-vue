import { findFirstNonNullChildren } from '@/utils/system'

describe('findFirstNonNullChildren', () => {
  it('skips directory and button nodes to find the first navigable page', () => {
    const page = findFirstNonNullChildren([
      { path: '/business', menuType: 'M', children: [] },
      { path: '/business/export', menuType: 'A', children: [] },
      { path: '/business/overview', menuType: 'C', children: [] },
    ])

    expect(page.path).toBe('/business/overview')
  })
})
