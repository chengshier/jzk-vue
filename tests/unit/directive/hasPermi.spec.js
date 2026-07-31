jest.mock('@/store', () => ({
  getters: { permissions: [] }
}))

import store from '@/store'
import hasPermi from '@/directive/permission/hasPermi'

describe('v-hasPermi', () => {
  it('removes a MinIO test action without its authority', () => {
    const parentNode = { removeChild: jest.fn() }
    const button = { parentNode }

    hasPermi.inserted(button, { value: ['admin:system:config:minio:test'] })

    expect(parentNode.removeChild).toHaveBeenCalledWith(button)
  })

  it('keeps a MinIO test action for its authority', () => {
    store.getters.permissions = ['admin:system:config:minio:test']
    const parentNode = { removeChild: jest.fn() }
    const button = { parentNode }

    hasPermi.inserted(button, { value: ['admin:system:config:minio:test'] })

    expect(parentNode.removeChild).not.toHaveBeenCalled()
  })
})
