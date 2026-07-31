const fs = require('fs')
const path = require('path')

const settingView = fs.readFileSync(
  path.resolve(__dirname, '../../../../src/views/systemSetting/setting/index.vue'),
  'utf8',
)
const minioMigration = fs.readFileSync(
  path.resolve(__dirname, '../../../../../crmeb/sql/jiuzhoukang/fix/jk_v31_minio_upload_config.sql'),
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
    expect(method[1]).not.toMatch(/handlerSave/)
  })

  it('normalizes Vue v-for parser refs before reading the unsaved form data', () => {
    const method = settingView.match(/getMinioFormData\(\)\s*\{([\s\S]*?)\n\s*\},/)

    expect(method).not.toBeNull()
    expect(method[1]).toMatch(/const parser = Array\.isArray\(form\) \? form\[0\] : form/)
    expect(method[1]).toMatch(/parser && parser\.formData \? \{ \.\.\.parser\.formData \} : \{\}/)
    expect(method[1]).not.toMatch(/currentEditData/)
  })

  it('uses the committed menu schema and a real password MinIO secret field', () => {
    expect(minioMigration).toMatch(/`is_delte`/)
    expect(minioMigration).not.toMatch(/`is_delete`/)
    expect(minioMigration).toMatch(/"__vModel__":"minioSecretKey"/)
    expect(minioMigration).toMatch(/JSON_SET\(@minio_form_content, '\$\.fields\[3\]\.type', 'password'\)/)
  })
})
