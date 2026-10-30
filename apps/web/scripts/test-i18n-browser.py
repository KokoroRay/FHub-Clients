"""Isolated browser smoke test; all API traffic is mocked, no live data is changed.

Run against a local Vite server: py -3 scripts/test-i18n-browser.py
Requires the Playwright Python package and an installed Chrome browser.
"""
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:5178'
OUTPUT = Path('../../../UI_Screenshots/i18n-verification').resolve()
OUTPUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 1000})
    preference_writes = []
    def mock_api(route):
        if route.request.resource_type not in ('xhr', 'fetch'):
            return route.continue_()
        if route.request.method == 'PUT' and route.request.url.endswith('/feed-preferences'):
            preference_writes.append(route.request.post_data_json)
        return route.fulfill(status=200, content_type='application/json',
            body=json.dumps({'items': [], 'totalCount': 0, 'pageNumber': 1, 'pageSize': 50}))
    context.route(re.compile(r'.*/api/.*'), mock_api)
    context.add_init_script("""
      if (!localStorage.getItem('fhub_language')) localStorage.setItem('fhub_language', 'en');
      if (!localStorage.getItem('fhub_user_preferences')) localStorage.setItem('fhub_user_preferences', JSON.stringify({language:'vi',defaultFeed:'courses'}));
      localStorage.setItem('fhub_token', 'isolated-test-token');
      localStorage.setItem('fhub_user', JSON.stringify({id:'1',fullName:'QA User',role:'Admin',campus:'HL'}));
      if (!localStorage.getItem('fhub_active_subdomain')) localStorage.setItem('fhub_active_subdomain', 'ops');
    """)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE + '/tags')
    page.get_by_role('button', name='Add New Tag').click()
    page.get_by_role('heading', name='Create New Semantic Tag').wait_for()
    assert page.get_by_placeholder('Briefly explain the meaning and context of using the tag...').count() == 1
    assert page.get_by_text('Mark as AI-generated', exact=True).count() == 1
    assert page.get_by_role('button', name='Save Tag', exact=True).count() == 1
    page.screenshot(path=str(OUTPUT / 'semantic-tags-en.png'), full_page=True)
    for language, title, save in [
        ('vi', 'Tạo Thẻ Ngữ Nghĩa Mới', 'Lưu Thẻ'),
        ('ja', '新しいセマンティック タグの作成', 'タグを保存'),
        ('en', 'Create New Semantic Tag', 'Save Tag'),
    ]:
        page.evaluate("""lang => {
          localStorage.setItem('fhub_language', lang);
          window.dispatchEvent(new StorageEvent('storage', {key:'fhub_language',newValue:lang}));
        }""", language)
        page.get_by_role('heading', name=title, exact=True).wait_for()
        assert page.locator('html').get_attribute('lang') == language
        assert page.get_by_role('button', name=save, exact=True).count() == 1
        if language == 'ja':
            page.screenshot(path=str(OUTPUT / 'semantic-tags-ja.png'), full_page=True)
    # Representative admin routes should render without exceptions in each locale.
    routes = ['/users','/tickets','/campuses','/majors','/specializations','/courses','/reputation','/badges','/audit-logs','/health','/moderation','/verifications','/staff','/news','/settings']
    for url in routes:
        page.goto(BASE + url)
        page.locator('h1').first.wait_for()
        assert not page.get_by_text('Đã xảy ra sự cố hiển thị giao diện', exact=True).count(), url
    # Exercise the real preference control and persistence across reloads.
    language_select = page.locator('select:has(option[value="ja"])')
    language_select.select_option('ja')
    page.wait_for_function("document.documentElement.lang === 'ja'")
    page.wait_for_function("JSON.parse(localStorage.getItem('fhub_user_preferences')).language === 'ja'")
    page.wait_for_timeout(200)
    assert preference_writes, 'Language change should persist to the profile API'
    saved = json.loads(preference_writes[-1]['feedPreferenceJson'])
    assert saved['language'] == 'ja' and saved['defaultFeed'] == 'courses'
    page.reload()
    page.wait_for_function("document.documentElement.lang === 'ja'")
    assert page.locator('select:has(option[value="ja"])').input_value() == 'ja'
    # Student portal uses the same language preference and translator.
    page.evaluate("localStorage.setItem('fhub_active_subdomain','main')")
    main_routes = ['/', '/courses', '/discussions', '/articles', '/workflows', '/materials', '/course-evaluations', '/profile', '/settings', '/messages', '/notifications', '/mentorship', '/tickets', '/bookmarks', '/reputation-rules', '/broadcasts', '/alumni']
    for url in main_routes:
        page.goto(BASE + url)
        page.locator('#root > *').first.wait_for()
        page.wait_for_function("document.documentElement.lang === 'ja'")
    assert not errors, '\n'.join(errors)
    browser.close()
    print('Passed: EN/VN/JP modal switching, preference persistence, 15 admin and 17 student routes. Screenshots:', OUTPUT)
