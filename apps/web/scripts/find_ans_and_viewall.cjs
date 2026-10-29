const fs = require('fs');

function searchPattern(filePath, regex) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    if (regex.test(line)) {
      console.log(`${filePath}:${idx + 1} -> ${line.trim()}`);
    }
  });
}

const files = [
  'FHub-Clients/apps/web/src/features/courses/CourseDetailPage.tsx',
  'FHub-Clients/apps/web/src/features/discussions/QuestionDetailPage.tsx',
  'FHub-Clients/apps/web/src/features/discussions/QuestionListPage.tsx',
  'FHub-Clients/apps/web/src/features/feed/FeedPage.tsx',
  'FHub-Clients/apps/web/src/features/profile/ProfilePage.tsx',
  'FHub-Clients/apps/web/src/components/navigation/RightSidebar.tsx',
  'FHub-Clients/apps/web/src/components/common/MarkdownPreview.tsx'
];

console.log('--- Search Pattern ans ---');
files.forEach(f => searchPattern(f, /\bans\b|\s+ans/));

console.log('--- Search Pattern View All ---');
files.forEach(f => searchPattern(f, /View All/i));
