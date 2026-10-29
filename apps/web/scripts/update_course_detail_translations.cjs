const fs = require('fs');
const path = 'FHub-Clients/apps/web/src/context/translations.ts';
let code = fs.readFileSync(path, 'utf8');

const pIdx = code.indexOf('export const phraseTranslations: Record<SupportedLanguage, Record<string, string>> =');
const transPart = code.substring(0, pIdx);
const phrasePart = code.substring(pIdx);

const transConstIdx = transPart.indexOf('export const translations: Record<SupportedLanguage, Translations> =');
const transJsonStart = transPart.indexOf('{', transConstIdx);
const transJsonEnd = transPart.lastIndexOf('};');
const transJsonStr = transPart.substring(transJsonStart, transJsonEnd + 1);

const phraseJsonStart = phrasePart.indexOf('{');
const phraseJsonEnd = phrasePart.lastIndexOf('};');
const phraseJsonStr = phrasePart.substring(phraseJsonStart, phraseJsonEnd + 1);

let translations = eval('(' + transJsonStr + ')');
let phraseTranslations = eval('(' + phraseJsonStr + ')');

const newDetailedKeys = {
  vi: {
    // common
    'common.viewAll': 'Xem tất cả',
    'common.copyCode': 'Sao chép code',
    'common.copied': 'Đã chép',
    'common.copy': 'Sao chép',
    'common.send': 'Gửi',
    'common.department': 'Khoa / Ngành',
    'common.material': 'Tài liệu',
    'common.anonymousStudent': 'Sinh viên ẩn danh',

    // courses detail
    'courses.outcomesAndSyllabus': 'Mục tiêu môn học & Đề cương',
    'courses.creditsCount': 'Số tín chỉ',
    'courses.recommendedSemester': 'Học kỳ gợi ý',
    'courses.gradingStructure': 'Cơ cấu điểm & Thi cử',
    'courses.asPerSyllabus': 'Theo Syllabus',
    'courses.passingGrade': 'Điểm qua môn',
    'courses.askQuestionThisCourse': 'Đặt câu hỏi môn này',
    'courses.noQuestionsYet': 'Chưa có câu hỏi thảo luận nào cho môn học này trong hệ thống.',
    'courses.beFirstToAsk': 'Hãy là người đầu tiên đặt câu hỏi cho môn',
    'courses.hasBestAnswer': 'Đã có Best Answer',
    'courses.materialsHeading': 'Tài liệu & Đề thi môn',
    'courses.contributeMaterial': 'Đóng góp tài liệu',
    'courses.noMaterialsYet': 'Chưa có tài liệu học tập nào cho môn',
    'courses.uploadFirstMaterial': 'Tải lên tài liệu đầu tiên cho môn',
    'courses.workflowsHeading': 'Workflows & Lộ trình thực hành',
    'courses.shareWorkflow': 'Chia sẻ Workflow',
    'courses.noWorkflowsYet': 'Chưa có workflow nào cho môn học này.',
    'courses.shareFirstWorkflow': 'Chia sẻ Workflow đầu tiên cho môn',
    'courses.evaluationsPortal': 'Chuyên trang Course Evaluations (UC10)',
    'courses.evaluationsExperience': '• Đánh giá & Kinh nghiệm thực tế',
    'courses.reviewsOnPortal': 'Đánh giá môn học',
    'courses.onPortal': 'trên Course Evaluations',
    'courses.evaluationsPortalDesc': 'Hệ thống đánh giá môn học, xếp hạng độ khó, khối lượng bài tập, gợi ý giảng viên và mẹo qua môn được quản lý tập trung tại chuyên trang Course Evaluations. Bạn có thể tra cứu đầy đủ và đóng góp ý kiến của mình tại đó.',
    'courses.writeReview': 'Viết đánh giá',
    'courses.averageRating': 'Điểm trung bình',
    'courses.difficulty': 'Độ khó',
    'courses.workload': 'Khối lượng bài tập',
    'courses.reviewsCount': 'Số đánh giá',
    'courses.reviewsSuffix': 'lượt review',
    'courses.updating': 'Đang cập nhật',
    'courses.typicalReviews': 'Nhận xét & Kinh nghiệm tiêu biểu',
    'courses.viewFullOnPortal': 'Xem đầy đủ trên Course Evaluations',
    'courses.noReviewsYet': 'Chưa có đánh giá nào cho môn',
    'courses.onSystem': 'trên hệ thống.',
    'courses.beFirstToReview': 'Hãy là người đầu tiên đánh giá môn',
    'courses.survivalTipsLabel': 'Mẹo sống sót:',
    'courses.viewOnPortal': 'Xem trên Course Evaluations',

    // questions detail & list
    'questions.answersUnit': 'câu',
    'questions.bestAnswerSolvedNotice': 'Câu trả lời chính xác đã giải quyết được vấn đề • Đã cộng +50 Karma cho tác giả',
    'questions.sortByHighestScore': 'Sắp xếp theo: Điểm cao nhất',
    'questions.answeredAt': 'Trả lời:',
    'questions.tabWrite': 'Soạn thảo',
    'questions.tabPreview': 'Xem trước',
    'questions.addCodeBlock': 'Thêm Code Block',
    'questions.bold': 'In đậm',
    'questions.italic': 'In nghiêng',
    'questions.list': 'Danh sách',
    'questions.quote': 'Trích dẫn',
    'questions.answerPlaceholder': 'Nhập nội dung giải đáp chi tiết, hướng dẫn từng bước và kèm code snippet mẫu...',
    'questions.markdownHelperNotice': 'Hỗ trợ Markdown: dùng ```csharp để highlight code.',

    // markdown preview
    'markdown.emptyPreview': 'Chưa có nội dung để hiển thị xem trước. Hãy nhập nội dung ở tab soạn thảo.'
  },
  en: {
    // common
    'common.viewAll': 'View All',
    'common.copyCode': 'Copy code',
    'common.copied': 'Copied',
    'common.copy': 'Copy',
    'common.send': 'Send',
    'common.department': 'Department',
    'common.material': 'Material',
    'common.anonymousStudent': 'Anonymous Student',

    // courses detail
    'courses.outcomesAndSyllabus': 'Learning Outcomes & Syllabus',
    'courses.creditsCount': 'Number of Credits',
    'courses.recommendedSemester': 'Recommended Semester',
    'courses.gradingStructure': 'Grading Scheme & Examinations',
    'courses.asPerSyllabus': 'As per Syllabus',
    'courses.passingGrade': 'Passing Grade',
    'courses.askQuestionThisCourse': 'Ask Question for this Course',
    'courses.noQuestionsYet': 'No questions have been asked for this course yet.',
    'courses.beFirstToAsk': 'Be the first to ask a question for',
    'courses.hasBestAnswer': 'Has Best Answer',
    'courses.materialsHeading': 'Study Materials & Past Exams for',
    'courses.contributeMaterial': 'Contribute Material',
    'courses.noMaterialsYet': 'No study materials uploaded yet for',
    'courses.uploadFirstMaterial': 'Upload the first material for',
    'courses.workflowsHeading': 'Hands-on Workflows & Guides for',
    'courses.shareWorkflow': 'Share Workflow',
    'courses.noWorkflowsYet': 'No workflows available for this course.',
    'courses.shareFirstWorkflow': 'Share the first workflow for',
    'courses.evaluationsPortal': 'Course Evaluations Portal (UC10)',
    'courses.evaluationsExperience': '• Reviews & Practical Tips',
    'courses.reviewsOnPortal': 'Course Evaluations for',
    'courses.onPortal': 'on Course Evaluations',
    'courses.evaluationsPortalDesc': 'The course rating system, difficulty scoring, workload ratings, lecturer recommendations, and survival tips are centralized at the Course Evaluations portal. You can browse and contribute your reviews there.',
    'courses.writeReview': 'Write Review',
    'courses.averageRating': 'Average Rating',
    'courses.difficulty': 'Difficulty',
    'courses.workload': 'Workload',
    'courses.reviewsCount': 'Total Reviews',
    'courses.reviewsSuffix': 'reviews',
    'courses.updating': 'Updating',
    'courses.typicalReviews': 'Featured Reviews & Tips',
    'courses.viewFullOnPortal': 'View All on Course Evaluations',
    'courses.noReviewsYet': 'No reviews submitted for course',
    'courses.onSystem': 'in the system.',
    'courses.beFirstToReview': 'Be the first to review course',
    'courses.survivalTipsLabel': 'Survival Tips:',
    'courses.viewOnPortal': 'View on Course Evaluations',

    // questions detail & list
    'questions.answersUnit': 'ans',
    'questions.bestAnswerSolvedNotice': 'Accurate answer that solved the problem • +50 Karma awarded to author',
    'questions.sortByHighestScore': 'Sort by: Highest score',
    'questions.answeredAt': 'Answered:',
    'questions.tabWrite': 'Write',
    'questions.tabPreview': 'Preview',
    'questions.addCodeBlock': 'Add Code Block',
    'questions.bold': 'Bold',
    'questions.italic': 'Italic',
    'questions.list': 'List',
    'questions.quote': 'Quote',
    'questions.answerPlaceholder': 'Enter detailed explanation, step-by-step guidance, and code snippets...',
    'questions.markdownHelperNotice': 'Markdown supported: use ```csharp to highlight code.',

    // markdown preview
    'markdown.emptyPreview': 'No content to preview. Type your content in the editor tab.'
  },
  ja: {
    // common
    'common.viewAll': 'すべて表示',
    'common.copyCode': 'コードをコピー',
    'common.copied': 'コピー完了',
    'common.copy': 'コピー',
    'common.send': '送信',
    'common.department': '学部 / 学科',
    'common.material': '資料',
    'common.anonymousStudent': '匿名の学生',

    // courses detail
    'courses.outcomesAndSyllabus': '学習目標とシラバス',
    'courses.creditsCount': '単位数',
    'courses.recommendedSemester': '推奨履修学期',
    'courses.gradingStructure': '成績評価構成と試験',
    'courses.asPerSyllabus': 'シラバスに準拠',
    'courses.passingGrade': '合格基準点',
    'courses.askQuestionThisCourse': 'この科目の質問を投稿',
    'courses.noQuestionsYet': 'この科目に関する質問はまだ投稿されていません。',
    'courses.beFirstToAsk': 'この科目の最初の質問を投稿しましょう:',
    'courses.hasBestAnswer': 'ベストアンサー選定済み',
    'courses.materialsHeading': '学習資料と過去問:',
    'courses.contributeMaterial': '資料を投稿',
    'courses.noMaterialsYet': 'この科目の学習資料はまだありません:',
    'courses.uploadFirstMaterial': 'この科目の最初の資料をアップロード:',
    'courses.workflowsHeading': '実践ワークフローとガイド:',
    'courses.shareWorkflow': 'ワークフローを共有',
    'courses.noWorkflowsYet': 'この科目のワークフローはまだありません。',
    'courses.shareFirstWorkflow': 'この科目の最初のワークフローを共有:',
    'courses.evaluationsPortal': '科目評価ポータル (UC10)',
    'courses.evaluationsExperience': '• 評価と実践的アドバイス',
    'courses.reviewsOnPortal': '科目レビュー:',
    'courses.onPortal': '（科目評価ポータル）',
    'courses.evaluationsPortalDesc': '科目の評価、難易度ランキング、課題の負荷、担当教員の評判、合格のヒントは科目評価ポータルで一元管理されています。詳細の確認やレビューの投稿が可能です。',
    'courses.writeReview': 'レビューを書く',
    'courses.averageRating': '平均評価',
    'courses.difficulty': '難易度',
    'courses.workload': '課題の負荷',
    'courses.reviewsCount': 'レビュー数',
    'courses.reviewsSuffix': '件のレビュー',
    'courses.updating': '更新中',
    'courses.typicalReviews': '代表的なレビューとアドバイス',
    'courses.viewFullOnPortal': '科目評価ポータルで全件確認',
    'courses.noReviewsYet': 'この科目のレビューはまだありません:',
    'courses.onSystem': '（システム内）',
    'courses.beFirstToReview': 'この科目の最初のレビューを投稿しましょう:',
    'courses.survivalTipsLabel': '攻略のヒント:',
    'courses.viewOnPortal': '科目評価ポータルで見る',

    // questions detail & list
    'questions.answersUnit': '回答',
    'questions.bestAnswerSolvedNotice': '問題を解決した正確な回答です • 著者に +50 Karma が付与されました',
    'questions.sortByHighestScore': '並び替え: 最高スコア順',
    'questions.answeredAt': '回答日時:',
    'questions.tabWrite': '作成',
    'questions.tabPreview': 'プレビュー',
    'questions.addCodeBlock': 'コードブロックを追加',
    'questions.bold': '太字',
    'questions.italic': '斜体',
    'questions.list': 'リスト',
    'questions.quote': '引用',
    'questions.answerPlaceholder': '詳しい解説、ステップごとの手順、サンプルコードを入力してください...',
    'questions.markdownHelperNotice': 'Markdown対応: ```csharp を使用してコードをハイライトできます。',

    // markdown preview
    'markdown.emptyPreview': 'プレビューするコンテンツがありません。作成タブで内容を入力してください。'
  }
};

const phraseList = [
  { vi: 'Xem tất cả', en: 'View All', ja: 'すべて表示' },
  { vi: 'View All', en: 'View All', ja: 'すべて表示' },
  { vi: 'Sao chép', en: 'Copy', ja: 'コピー' },
  { vi: 'Đã chép', en: 'Copied', ja: 'コピー完了' },
  { vi: 'Sao chép code', en: 'Copy code', ja: 'コードをコピー' },
  { vi: 'Gửi', en: 'Send', ja: '送信' },
  { vi: 'Mục tiêu môn học & Đề cương', en: 'Learning Outcomes & Syllabus', ja: '学習目標とシラバス' },
  { vi: 'Số tín chỉ', en: 'Number of Credits', ja: '単位数' },
  { vi: 'Học kỳ gợi ý', en: 'Recommended Semester', ja: '推奨履修学期' },
  { vi: 'Cơ cấu điểm & Thi cử', en: 'Grading Scheme & Examinations', ja: '成績評価構成と試験' },
  { vi: 'Theo Syllabus', en: 'As per Syllabus', ja: 'シラバスに準拠' },
  { vi: 'Điểm qua môn:', en: 'Passing Grade:', ja: '合格基準点:' },
  { vi: 'Điểm qua môn', en: 'Passing Grade', ja: '合格基準点' },
  { vi: 'Mở Course Evaluations', en: 'Open Course Evaluations', ja: '科目評価ポータルを開く' },
  { vi: 'Đặt câu hỏi môn này', en: 'Ask Question for this Course', ja: 'この科目の質問を投稿' },
  { vi: 'Đóng góp tài liệu', en: 'Contribute Material', ja: '資料を投稿' },
  { vi: 'Chia sẻ Workflow', en: 'Share Workflow', ja: 'ワークフローを共有' },
  { vi: 'Viết đánh giá', en: 'Write Review', ja: 'レビューを書く' },
  { vi: 'Xem trên Course Evaluations', en: 'View on Course Evaluations', ja: '科目評価ポータルで見る' },
  { vi: 'Mẹo sống sót:', en: 'Survival Tips:', ja: '攻略のヒント:' },
  { vi: 'Câu trả lời chính xác đã giải quyết được vấn đề • Đã cộng +50 Karma cho tác giả', en: 'Accurate answer that solved the problem • +50 Karma awarded to author', ja: '問題を解決した正確な回答です • 著者に +50 Karma が付与されました' },
  { vi: 'Sắp xếp theo: Điểm cao nhất', en: 'Sort by: Highest score', ja: '並び替え: 最高スコア順' },
  { vi: 'Soạn thảo', en: 'Write', ja: '作成' },
  { vi: 'Xem trước', en: 'Preview', ja: 'プレビュー' },
  { vi: 'Trả lời:', en: 'Answered:', ja: '回答日時:' }
];

['vi', 'en', 'ja'].forEach(lang => {
  translations[lang] = translations[lang] || {};
  Object.assign(translations[lang], newDetailedKeys[lang]);
});

phraseList.forEach(p => {
  ['vi', 'en', 'ja'].forEach(lang => {
    phraseTranslations[lang] = phraseTranslations[lang] || {};
    phraseTranslations[lang][p.vi] = p[lang];
    phraseTranslations[lang][p.en] = p[lang];
  });
});

const prefix = code.substring(0, transConstIdx);
const newCode = prefix +
  'export const translations: Record<SupportedLanguage, Translations> = ' +
  JSON.stringify(translations, null, 2) +
  ';\n\nexport const phraseTranslations: Record<SupportedLanguage, Record<string, string>> = ' +
  JSON.stringify(phraseTranslations, null, 2) +
  ';\n';

fs.writeFileSync(path, newCode, 'utf8');
console.log('Successfully updated translations with course & discussion detailed keys! Total keys:', Object.keys(translations.vi).length);
