import { getMinioConfigFormData } from '@/utils/minioConfig'

describe('MinIO dynamic form data', () => {
  it('uses the first Vue v-for parser ref and returns its unsaved form data', () => {
    const unsaved = { minioEndpoint: 'https://storage.example.com', minioSecretKey: 'not-persisted' }

    expect(getMinioConfigFormData([{ formData: unsaved }])).toEqual(unsaved)
  })

  it('returns an empty payload when no parser is mounted', () => {
    expect(getMinioConfigFormData()).toEqual({})
  })
})
