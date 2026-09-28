"""Browser smoke test for the personal-branding site."""
from pathlib import Path
from os import getenv
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = getenv('SITE_URL') or (ROOT / 'index.html').as_uri()
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for width, height in [(390, 844), (768, 1024), (1440, 900)]:
        page = browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(URL)
        page.wait_for_timeout(500)
        for image in page.locator('img').all():
            image.scroll_into_view_if_needed()
        page.wait_for_timeout(400)
        dimensions = page.evaluate('''() => ({width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
            outliers: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 2).slice(0,15).map(el => [el.tagName, String(el.className), Math.round(el.getBoundingClientRect().right)]),
            unloaded: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src)})''')
        print(width, dimensions, errors)
        # Layout failures are reported after screenshots so they can be inspected.
        assert not dimensions['unloaded'], dimensions
        assert not errors, errors
        assert page.locator('[data-education-stop]').count() == 3
        assert page.locator('[data-timeline-item]').count() == 3
        assert page.locator('.skill-route').count() == 4
        assert page.locator('.achievement-ticket').count() == 6
        page.locator('#education-next').click()
        page.wait_for_function("document.querySelector('#education-position').textContent.includes('ANAND')")
        assert 'ANAND' in page.locator('#education-position').inner_text()
        page.locator('[data-api-step="2"]').click()
        assert page.locator('#api-stage').get_attribute('data-stage') == '2'
        page.locator('[data-incident="quality"]').click()
        assert 'Trace the mismatch' in page.locator('#incident-title').inner_text()
        page.locator('[data-price="2"]').click()
        assert page.locator('#price-stage').get_attribute('data-price-stage') == '2'
        page.locator('[data-lab="1"]').click()
        assert 'retrieval and agent' in page.locator('#lab-copy').inner_text()
        assert page.locator('#ai-console').get_attribute('data-lab') == '1'
        assert page.locator('[data-lab-visual="1"]').get_attribute('aria-hidden') == 'false'
        page.locator('#cert-tab-1').click()
        assert page.locator('#cert-tab-1').get_attribute('aria-selected') == 'true'
        assert 'Product Management' in page.locator('#cert-name').inner_text()
        page.locator('#cert-tab-1').press('ArrowRight')
        assert page.locator('#cert-tab-2').get_attribute('aria-selected') == 'true'
        assert 'Data Science' in page.locator('#cert-name').inner_text()
        page.locator('#principles-button').click()
        assert 'is-decomposed' in page.locator('#first-principles').get_attribute('class')
        page.locator('[data-food="undhiyu"]').click()
        assert 'seasonal dish' in page.locator('#food-detail').inner_text()
        page.locator('#game-button').click()
        assert page.locator('#games').get_attribute('class').find('playing') >= 0
        page.locator('#manga-button').click()
        assert page.locator('#manga-page-number').inner_text() == '02'
        assert page.locator('#manga img').count() == 0
        assert page.locator('#manga .crew-figure').count() == 3
        page.locator('#crew-button').click()
        assert 'is-playing' not in page.locator('#manga-spread').get_attribute('class')
        for section in ['top','api','health','pricing','thinking','path','experience','skills','achievements','certifications','first-principles','beyond','movement','food','games','manga','connect']:
            if width == 768 and section not in ['top','api','path','experience','skills','achievements','certifications','beyond']:
                continue
            if width == 390 and section not in ['top','api','health','path','experience','skills','achievements','certifications','beyond','food','manga']:
                continue
            page.locator('#'+section).scroll_into_view_if_needed()
            page.wait_for_timeout(950)
            page.screenshot(path=str(ROOT / 'qa' / f'v2-{width}-{section}.png'))
        # A 1–3px subpixel scroll extent comes from the angled decorative cutouts.
        assert dimensions['scrollWidth'] <= width + 4, dimensions
        page.close()
    browser.close()
