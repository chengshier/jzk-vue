const fs = require('fs')
const path = require('path')

const settingView = fs.readFileSync(
  path.resolve(__dirname, '../../../../src/views/systemSetting/setting/index.vue'),
  'utf8',
)

describe('system setting MinIO connection test contract', () => {
  it('renders the connection test only for the MinIO upload tab', () => {
    expect(settingView).toMatch(/v-if="isMinioUploadConfig && tabItem\.extra === activeNamel2"/)
    expect(settingView).toMatch(/@click="testMinioConfig"/)
  })

  it('tests unsaved values through the MinIO endpoint without saving the form', () => {
    const method = settingView.match(/testMinioConfig\(\)\s*\{([\s\S]*?)\n\s*\},/)

    expect(method).not.toBeNull()
    expect(method[1]).toMatch(/testMinioConfigApi\(this\.getMinioFormData\(\)\)/)
    expect(method[1]).not.toMatch(/systemConfigSave/)
  })
})
