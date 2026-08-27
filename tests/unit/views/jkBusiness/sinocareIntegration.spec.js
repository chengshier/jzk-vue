const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '../../../../')
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('Sinocare administrative integration contract', () => {
  it('shows readiness flags without rendering key material', () => {
    const view = read('src/views/jkBusiness/healthIntegration/index.vue')
    expect(view).toMatch(/sinocareAppIdConfigured/)
    expect(view).toMatch(/sinocareAuthorizationH5UrlConfigured/)
    expect(view).toMatch(/sinocarePublicKeyConfigured/)
    expect(view).not.toMatch(/\{\{\s*data\.sinocarePublicKey\s*\}\}/)
  })
  it('lists failed callback records without encrypted payload fields', () => {
    const view = read('src/views/jkBusiness/sinocareCallback/index.vue')
    expect(view).toMatch(/getJkSinocareCallbackList/)
    expect(view).toMatch(/retryJkSinocareCallback/)
    expect(view).toMatch(/row\.processStatus==='FAILED'/)
    expect(view).not.toMatch(/ciphertext|signature|payload/)
  })
})
