const fs = require('fs');

const files = [
  'FHub-Clients/apps/web/src/features/courses/CourseDetailPage.tsx',
  'FHub-Clients/apps/web/src/features/discussions/QuestionDetailPage.tsx',
  'FHub-Clients/apps/web/src/components/common/MarkdownPreview.tsx',
  'FHub-Clients/apps/web/src/features/discussions/QuestionListPage.tsx',
  'FHub-Clients/apps/web/src/features/profile/ProfilePage.tsx'
];

// Regex matching Vietnamese characters
const viRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/;

files.forEach(file => {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  console.log(`\n--- Checking ${file} ---`);
  lines.forEach((line, idx) => {
    // ignore lines that are already translated using t('...', '...')
    const hasT = line.includes("t('") || line.includes('t("');
    const isComment = line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*');
    if (!isComment && viRegex.test(line)) {
      // If it contains vietnamese text outside of t('...')
      const withoutT = line.replace(/t\([^)]+\)/g, '');
      if (viRegex.test(withoutT)) {
        console.log(`L${idx + 1}: ${line.trim()}`);
      }
    }
  });
});
