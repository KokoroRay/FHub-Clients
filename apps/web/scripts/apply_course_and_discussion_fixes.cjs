const fs = require('fs');

function updateFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let count = 0;
  for (const [target, replacement] of replacements) {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      count++;
    } else {
      console.warn(`[WARN] Target not found in ${filePath}:\n>>> ${target.substring(0, 60)}...`);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}: ${count}/${replacements.length} replaced.`);
}

// 1. CourseDetailPage.tsx
updateFile('FHub-Clients/apps/web/src/features/courses/CourseDetailPage.tsx', [
  [
    "{course.credits || 3} Tín chỉ",
    "{course.credits || 3} {t('common.credits', 'Tín chỉ')}"
  ],
  [
    "<span>Mục tiêu môn học & Đề cương</span>",
    "<span>{t('courses.outcomesAndSyllabus', 'Mục tiêu môn học & Đề cương')}</span>"
  ],
  [
    "Số tín chỉ\n                      </span>",
    "{t('courses.creditsCount', 'Số tín chỉ')}\n                      </span>"
  ],
  [
    "Học kỳ gợi ý\n                      </span>",
    "{t('courses.recommendedSemester', 'Học kỳ gợi ý')}\n                      </span>"
  ],
  [
    "Học kỳ {course.semester || 'N/A'}",
    "{t('common.term', 'Học kỳ')} {course.semester || 'N/A'}"
  ],
  [
    "Cơ cấu điểm & Thi cử\n                  </h4>",
    "{t('courses.gradingStructure', 'Cơ cấu điểm & Thi cử')}\n                  </h4>"
  ],
  [
    "<span className=\"font-bold text-slate-900 dark:text-slate-100\">\n                      Theo Syllabus\n                    </span>",
    "<span className=\"font-bold text-slate-900 dark:text-slate-100\">\n                      {t('courses.asPerSyllabus', 'Theo Syllabus')}\n                    </span>"
  ],
  [
    "<span className=\"font-bold text-blue-600\">Theo Syllabus</span>",
    "<span className=\"font-bold text-blue-600\">{t('courses.asPerSyllabus', 'Theo Syllabus')}</span>"
  ],
  [
    "<span className=\"font-bold text-purple-600\">Theo Syllabus</span>",
    "<span className=\"font-bold text-purple-600\">{t('courses.asPerSyllabus', 'Theo Syllabus')}</span>"
  ],
  [
    "<span>Điểm qua môn:</span>",
    "<span>{t('courses.passingGrade', 'Điểm qua môn')}:</span>"
  ],
  [
    "Thảo luận & Hỏi đáp ({courseQuestions.length})",
    "{t('courses.tabDiscussions', 'Hỏi đáp & Thảo luận')} ({courseQuestions.length})"
  ],
  [
    ">Đặt câu hỏi môn này</Button>",
    ">{t('courses.askQuestionThisCourse', 'Đặt câu hỏi môn này')}</Button>"
  ],
  [
    "Chưa có câu hỏi thảo luận nào cho môn học này trong hệ thống.",
    "{t('courses.noQuestionsYet', 'Chưa có câu hỏi thảo luận nào cho môn học này trong hệ thống.')}"
  ],
  [
    "Hãy là người đầu tiên đặt câu hỏi cho môn {course.code}",
    "{t('courses.beFirstToAsk', 'Hãy là người đầu tiên đặt câu hỏi cho môn')} {course.code}"
  ],
  [
    ">Đã có Best Answer</Badge>",
    ">{t('courses.hasBestAnswer', 'Đã có Best Answer')}</Badge>"
  ],
  [
    "Tài liệu & Đề thi môn {course.code} ({courseMaterials.length})",
    "{t('courses.materialsHeading', 'Tài liệu & Đề thi môn')} {course.code} ({courseMaterials.length})"
  ],
  [
    ">Đóng góp tài liệu</Button>",
    ">{t('courses.contributeMaterial', 'Đóng góp tài liệu')}</Button>"
  ],
  [
    "Chưa có tài liệu học tập nào cho môn {course.code}.",
    "{t('courses.noMaterialsYet', 'Chưa có tài liệu học tập nào cho môn')} {course.code}."
  ],
  [
    "Tải lên tài liệu đầu tiên cho môn {course.code}",
    "{t('courses.uploadFirstMaterial', 'Tải lên tài liệu đầu tiên cho môn')} {course.code}"
  ],
  [
    ": 'Tài liệu'} • {m.downloadCount || 0} lượt tải",
    ": t('common.material', 'Tài liệu')} • {m.downloadCount || 0} {t('materials.downloadsSuffix', 'lượt tải')}"
  ],
  [
    ">Chi tiết</Button>",
    ">{t('common.details', 'Chi tiết')}</Button>"
  ],
  [
    "Workflows & Lộ trình thực hành ({courseWorkflows.length})",
    "{t('courses.workflowsHeading', 'Workflows & Lộ trình thực hành')} ({courseWorkflows.length})"
  ],
  [
    ">Chia sẻ Workflow</Button>",
    ">{t('courses.shareWorkflow', 'Chia sẻ Workflow')}</Button>"
  ],
  [
    "Chưa có workflow nào cho môn học này.",
    "{t('courses.noWorkflowsYet', 'Chưa có workflow nào cho môn học này.')}"
  ],
  [
    "Chia sẻ Workflow đầu tiên cho môn {course.code}",
    "{t('courses.shareFirstWorkflow', 'Chia sẻ Workflow đầu tiên cho môn')} {course.code}"
  ],
  [
    "Chuyên trang Course Evaluations (UC10)",
    "{t('courses.evaluationsPortal', 'Chuyên trang Course Evaluations (UC10)')}"
  ],
  [
    "• Đánh giá & Kinh nghiệm thực tế",
    "{t('courses.evaluationsExperience', '• Đánh giá & Kinh nghiệm thực tế')}"
  ],
  [
    "Đánh giá môn học {course.code} trên Course Evaluations",
    "{t('courses.reviewsOnPortal', 'Đánh giá môn học')} {course.code} {t('courses.onPortal', 'trên Course Evaluations')}"
  ],
  [
    "Hệ thống đánh giá môn học, xếp hạng độ khó, khối lượng bài\n                    tập, gợi ý giảng viên và mẹo qua môn được quản lý tập trung\n                    tại chuyên trang <strong>Course Evaluations</strong>. Bạn có\n                    thể tra cứu đầy đủ và đóng góp ý kiến của mình tại đó.",
    "{t('courses.evaluationsPortalDesc', 'Hệ thống đánh giá môn học, xếp hạng độ khó, khối lượng bài tập, gợi ý giảng viên và mẹo qua môn được quản lý tập trung tại chuyên trang Course Evaluations. Bạn có thể tra cứu đầy đủ và đóng góp ý kiến của mình tại đó.')}"
  ],
  [
    "<span>Viết đánh giá</span>",
    "<span>{t('courses.writeReview', 'Viết đánh giá')}</span>"
  ],
  [
    "Điểm trung bình\n                  </span>",
    "{t('courses.averageRating', 'Điểm trung bình')}\n                  </span>"
  ],
  [
    ">Độ khó</span>",
    ">{t('courses.difficulty', 'Độ khó')}</span>"
  ],
  [
    "Khối lượng bài tập\n                  </span>",
    "{t('courses.workload', 'Khối lượng bài tập')}\n                  </span>"
  ],
  [
    "Số đánh giá\n                  </span>",
    "{t('courses.reviewsCount', 'Số đánh giá')}\n                  </span>"
  ],
  [
    "lượt review`",
    " ' + t('courses.reviewsSuffix', 'lượt review')`"
  ],
  [
    ": 'Đang cập nhật'}",
    ": t('courses.updating', 'Đang cập nhật')}"
  ],
  [
    "Nhận xét & Kinh nghiệm tiêu biểu ({courseReviews.length})",
    "{t('courses.typicalReviews', 'Nhận xét & Kinh nghiệm tiêu biểu')} ({courseReviews.length})"
  ],
  [
    "<span>Xem đầy đủ trên Course Evaluations</span>",
    "<span>{t('courses.viewFullOnPortal', 'Xem đầy đủ trên Course Evaluations')}</span>"
  ],
  [
    "Chưa có đánh giá nào cho môn {course.code} trên hệ thống.",
    "{t('courses.noReviewsYet', 'Chưa có đánh giá nào cho môn')} {course.code} {t('courses.onSystem', 'trên hệ thống.')}"
  ],
  [
    "Hãy là người đầu tiên đánh giá môn {course.code}",
    "{t('courses.beFirstToReview', 'Hãy là người đầu tiên đánh giá môn')} {course.code}"
  ],
  [
    ": 'Sinh viên ẩn danh'",
    ": t('common.anonymousStudent', 'Sinh viên ẩn danh')"
  ],
  [
    "Kỳ {r.semesterCode || 'FA24'} •{' '}",
    "{t('common.term', 'Kỳ')} {r.semesterCode || 'FA24'} •{' '}"
  ],
  [
    "Mẹo sống sót:{' '}",
    "{t('courses.survivalTipsLabel', 'Mẹo sống sót:')}{' '}"
  ],
  [
    "Độ khó: {r.difficultyRating || 3}/5",
    "{t('courses.difficulty', 'Độ khó')}: {r.difficultyRating || 3}/5"
  ],
  [
    "<span>Xem trên Course Evaluations</span>",
    "<span>{t('courses.viewOnPortal', 'Xem trên Course Evaluations')}</span>"
  ]
]);

// 2. QuestionDetailPage.tsx
updateFile('FHub-Clients/apps/web/src/features/discussions/QuestionDetailPage.tsx', [
  [
    "Câu trả lời chính xác đã giải quyết được vấn đề • Đã cộng +50 Karma cho tác giả",
    "{t('questions.bestAnswerSolvedNotice', 'Câu trả lời chính xác đã giải quyết được vấn đề • Đã cộng +50 Karma cho tác giả')}"
  ],
  [
    "Sắp xếp theo: Điểm cao nhất",
    "{t('questions.sortByHighestScore', 'Sắp xếp theo: Điểm cao nhất')}"
  ],
  [
    "? `Trả lời: ${new Date(ans.createdAt).toLocaleDateString('vi-VN')}`",
    "? `${t('questions.answeredAt', 'Trả lời:')} ${new Date(ans.createdAt).toLocaleDateString()}`"
  ],
  [
    ": `Karma: ${ans.author.karma.toLocaleString()} pts • Trả lời: ${new Date(ans.createdAt).toLocaleDateString('vi-VN')}`}",
    ": `Karma: ${ans.author.karma.toLocaleString()} pts • ${t('questions.answeredAt', 'Trả lời:')} ${new Date(ans.createdAt).toLocaleDateString()}`}"
  ],
  [
    ">Gửi</Button>",
    ">{t('common.send', 'Gửi')}</Button>"
  ],
  [
    "Soạn thảo\n              </button>",
    "{t('questions.tabWrite', 'Soạn thảo')}\n              </button>"
  ],
  [
    "Xem trước\n              </button>",
    "{t('questions.tabPreview', 'Xem trước')}\n              </button>"
  ],
  [
    "title=\"Thêm Code Block\"",
    "title={t('questions.addCodeBlock', 'Thêm Code Block')}"
  ],
  [
    "title=\"In đậm\"",
    "title={t('questions.bold', 'In đậm')}"
  ],
  [
    "title=\"In nghiêng\"",
    "title={t('questions.italic', 'In nghiêng')}"
  ],
  [
    "title=\"Danh sách\"",
    "title={t('questions.list', 'Danh sách')}"
  ],
  [
    "title=\"Trích dẫn\"",
    "title={t('questions.quote', 'Trích dẫn')}"
  ],
  [
    "placeholder=\"Nhập nội dung giải đáp chi tiết, hướng dẫn từng bước và kèm code snippet mẫu...\"",
    "placeholder={t('questions.answerPlaceholder', 'Nhập nội dung giải đáp chi tiết, hướng dẫn từng bước và kèm code snippet mẫu...')}"
  ],
  [
    "💡 Hỗ trợ Markdown: dùng <code>```csharp</code> để highlight code.",
    "💡 {t('questions.markdownHelperNotice', 'Hỗ trợ Markdown: dùng ```csharp để highlight code.')}"
  ]
]);

// 3. MarkdownPreview.tsx
updateFile('FHub-Clients/apps/web/src/components/common/MarkdownPreview.tsx', [
  [
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { useLanguage } from '../../context/LanguageContext';"
  ],
  [
    "export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className = '' }) => {",
    "export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className = '' }) => {\n  const { t } = useLanguage();"
  ],
  [
    "Chưa có nội dung để hiển thị xem trước. Hãy nhập nội dung ở tab soạn thảo.",
    "{t('markdown.emptyPreview', 'Chưa có nội dung để hiển thị xem trước. Hãy nhập nội dung ở tab soạn thảo.')}"
  ],
  [
    "const CodeBlockRenderer: React.FC<{ language: string; code: string }> = ({ language, code }) => {",
    "const CodeBlockRenderer: React.FC<{ language: string; code: string }> = ({ language, code }) => {\n  const { t } = useLanguage();"
  ],
  [
    "title=\"Sao chép code\"",
    "title={t('common.copyCode', 'Sao chép code')}"
  ],
  [
    "<span>{copied ? 'Đã chép' : 'Sao chép'}</span>",
    "<span>{copied ? t('common.copied', 'Đã chép') : t('common.copy', 'Sao chép')}</span>"
  ]
]);

// 4. QuestionListPage.tsx
updateFile('FHub-Clients/apps/web/src/features/discussions/QuestionListPage.tsx', [
  [
    "<span className=\"text-[11px] font-medium\">ans</span>",
    "<span className=\"text-[11px] font-medium\">{t('questions.answersUnit', 'câu')}</span>"
  ]
]);

// 5. ProfilePage.tsx
updateFile('FHub-Clients/apps/web/src/features/profile/ProfilePage.tsx', [
  [
    "{t('View All')} ({userBadges.length})",
    "{t('common.viewAll', 'Xem tất cả')} ({userBadges.length})"
  ],
  [
    "{t('View All')}\n",
    "{t('common.viewAll', 'Xem tất cả')}\n"
  ]
]);

console.log('All course & discussion detailed fixes applied successfully!');
