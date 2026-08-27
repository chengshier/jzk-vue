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
const systemConfigApi = fs.readFileSync(
  path.resolve(__dirname, '../../../../src/api/systemConfig.js'),
  'utf8',
)

describe('system setting MinIO connection test contract', () => {
  it('renders the connection test only for the MinIO upload tab', () => {
    expect(settingView).toMatch(/v-if="isMinioUploadConfig && tabItem\.extra === activeNamel2"/)
    expect(settingView).toMatch(/@click="testMinioConfig"/)
    expect(settingView).toMatch(/v-hasPermi="\['admin:system:config:minio:test'\]"/)
  })

  it('tests unsaved values through the MinIO endpoint without saving the form', () => {
    const method = settingView.match(/testMinioConfig\(\)\s*\{([\s\S]*?)\n\s{4}\},\n\s{2}\},/)

    expect(method).not.toBeNull()
    expect(method[1]).toMatch(/testMinioConfigApi\(this\.getMinioFormData\(\)\)/)
    expect(method[1]).not.toMatch(/systemConfigSave/)
    expect(method[1]).not.toMatch(/handlerSave/)
    expect(method[1].match(/systemConfigApi\s*\.\s*\w+/g)).toEqual(['systemConfigApi\n        .testMinioConfigApi'])
  })

  it('sends the MinIO test request to the exact POST endpoint', () => {
    const api = systemConfigApi.match(/export function testMinioConfigApi\(data\)\s*\{([\s\S]*?)\n\}/)

    expect(api).not.toBeNull()
    expect(api[1]).toMatch(/url: '\/admin\/system\/config\/minio\/test'/)
    expect(api[1]).toMatch(/method: 'POST'/)
  })

  it('normalizes Vue v-for parser refs before reading the unsaved form data', () => {
    const method = settingView.match(/getMinioFormData\(\)\s*\{([\s\S]*?)\n\s*\},/)

    expect(method).not.toBeNull()
    expect(method[1]).toMatch(/return getMinioConfigFormData\(form\)/)
    expect(method[1]).not.toMatch(/currentEditData/)
  })

  it('uses the committed menu schema and a real password MinIO secret field', () => {
    expect(minioMigration).toMatch(/`is_delte`/)
    expect(minioMigration).not.toMatch(/`is_delete`/)
    expect(minioMigration).toMatch(/"__vModel__":"minioSecretKey"/)
    expect(minioMigration).toMatch(/JSON_SET\(@minio_form_content, '\$\.fields\[3\]\.type', 'password'\)/)
  })

  it('documents the public-IP-only constraint for administrative connection tests', () => {
    expect(minioMigration).toMatch(/MinIO Endpoint（公共 IPv4）/)
    expect(minioMigration).toMatch(/仅支持公网 IPv4 地址/)
  })

  it('has an idempotency guard for every MinIO category, config, menu, and role grant insert', () => {
    expect(minioMigration).toMatch(/INSERT INTO `eb_category`[\s\S]*?WHERE[\s\S]*?NOT EXISTS/)
    expect(minioMigration).toMatch(/INSERT INTO `eb_system_config`[\s\S]*?WHERE[\s\S]*?NOT EXISTS/)
    expect(minioMigration).toMatch(/INSERT INTO `eb_system_menu`[\s\S]*?WHERE[\s\S]*?NOT EXISTS/)
    expect(minioMigration).toMatch(/INSERT INTO `eb_system_role_menu`[\s\S]*?ON DUPLICATE KEY UPDATE/)
    expect(minioMigration).toMatch(/UPDATE `eb_system_config`[\s\S]*?`form_id` = @minio_form_id[\s\S]*?`name` IN \(/)
    expect(minioMigration).toMatch(/`form_id` IS NULL OR `form_id` <> @minio_form_id/)
  })
})
