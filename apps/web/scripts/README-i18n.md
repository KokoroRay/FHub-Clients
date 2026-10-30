UI localization supports `vi` (VN), `en` (EN), and `ja` (JP).

Use `useLanguage().t()` for UI labels, placeholders, confirmation text, feedback,
and status display. Add all three translations to `src/context/uiTranslations.json`.
Interpolate dynamic values with named placeholders and the third `t()` argument.
Keep enum values, filter identifiers, URLs, email addresses, and submitted content
unchanged. Translate fixed catalog labels when rendering, so they respond to a
language change without resetting forms or refetching data.

Store API timestamps in their original format and use `locale`, `formatDate`, or
`formatTime` when rendering. Do not store already-formatted dates in component state.
Language names in the selector deliberately use their native spelling.

Run `npm run check:i18n` for catalog completeness, placeholder parity, interpolation,
fallbacks, language aliases, dates, and hard-coded JSX/attribute checks. Run
`npm run build` for TypeScript and production validation.

For the isolated browser smoke test, start Vite on port 5178:

    npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
    py -3 scripts/test-i18n-browser.py

The browser test requires Python Playwright and Chrome. It mocks API requests and
uses a fresh browser context. It checks modal switching, preference persistence,
preservation of other preferences, and admin/student routes. Verification screenshots
are saved under the workspace's `UI_Screenshots/i18n-verification` directory.
