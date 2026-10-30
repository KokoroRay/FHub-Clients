const fs = require('fs');
const path = require('path');

function searchFiles(dir, term) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      searchFiles(full, term);
    } else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes(term)) {
        console.log(`Found [${term}] in: ${full.replace(/\\/g, '/')}`);
      }
    }
  }
}

console.log('--- Search Results ---');
searchFiles('FHub-Clients/apps/web/src', 'Câu trả lời chính xác');
searchFiles('FHub-Clients/apps/web/src', 'Sắp xếp theo');
searchFiles('FHub-Clients/apps/web/src', 'Sao chép');
searchFiles('FHub-Clients/apps/web/src', 'Soạn thảo');
searchFiles('FHub-Clients/apps/web/src', 'Hỗ trợ Markdown:');
searchFiles('FHub-Clients/apps/web/src', 'ans');
searchFiles('FHub-Clients/apps/web/src', 'View All');
