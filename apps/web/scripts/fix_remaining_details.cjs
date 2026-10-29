const fs = require('fs');

let c = fs.readFileSync('FHub-Clients/apps/web/src/features/courses/CourseDetailPage.tsx', 'utf8');

c = c.replace(/>\s*Đặt câu hỏi môn này\s*<\/Button>/g, ">{t('courses.askQuestionThisCourse', 'Đặt câu hỏi môn này')}</Button>");
c = c.replace(/>\s*Đã có Best Answer\s*<\/Badge>/g, ">{t('courses.hasBestAnswer', 'Đã có Best Answer')}</Badge>");
c = c.replace(/>\s*Đóng góp tài liệu\s*<\/Button>/g, ">{t('courses.contributeMaterial', 'Đóng góp tài liệu')}</Button>");
c = c.replace(/>\s*Chi tiết\s*<\/Button>/g, ">{t('common.details', 'Chi tiết')}</Button>");
c = c.replace(/>\s*Chia sẻ Workflow\s*<\/Button>/g, ">{t('courses.shareWorkflow', 'Chia sẻ Workflow')}</Button>");
c = c.replace(/: 'Tài liệu'\}\s*•\s*\{m\.downloadCount \|\| 0\} lượt tải/g, ": t('common.material', 'Tài liệu')} • {m.downloadCount || 0} {t('materials.downloadsSuffix', 'lượt tải')}");
c = c.replace(/\? 'Sinh viên ẩn danh'/g, "? t('common.anonymousStudent', 'Sinh viên ẩn danh')");

fs.writeFileSync('FHub-Clients/apps/web/src/features/courses/CourseDetailPage.tsx', c, 'utf8');

let q = fs.readFileSync('FHub-Clients/apps/web/src/features/discussions/QuestionDetailPage.tsx', 'utf8');
q = q.replace(/>\s*Gửi\s*<\/Button>/g, ">{t('common.send', 'Gửi')}</Button>");
fs.writeFileSync('FHub-Clients/apps/web/src/features/discussions/QuestionDetailPage.tsx', q, 'utf8');

console.log('Cleaned up remaining items in CourseDetailPage and QuestionDetailPage!');
