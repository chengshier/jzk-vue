const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src', 'views', 'jkBusiness', 'identityApplyAudit', 'index.vue');
const content = fs.readFileSync(file, 'utf8');

const requiredSnippets = ['this.$prompt', 'rejectReason', 'auditRemark'];
const missing = requiredSnippets.filter((snippet) => !content.includes(snippet));

if (missing.length) {
  console.error('identity apply audit page missing interactive audit inputs:', missing.join(', '));
  process.exit(1);
}

console.log('identity apply audit page contains interactive audit inputs');
