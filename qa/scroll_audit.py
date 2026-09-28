"""Capture and assert the scroll-linked scenes at exact progress points."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto((root/'index.html').as_uri())
    page.evaluate("document.documentElement.style.scrollBehavior='auto'")
    page.wait_for_timeout(500)
    page.screenshot(path=str(root/'qa/v2-desktop-hero-actual.png'))
    hero=page.locator('#top').evaluate('(element) => ({top:element.offsetTop,height:element.offsetHeight})')
    for point in [0.1,0.55,0.9]:
        page.evaluate('(y) => scrollTo(0,y)',hero['top']+(hero['height']-900)*point)
        page.wait_for_timeout(300)
        top=page.locator('.hero-stage').evaluate('(element) => element.getBoundingClientRect().top')
        assert abs(top)<2,('hero did not stay pinned',point,top)
        page.screenshot(path=str(root/f'qa/v2-hero-scroll-{point}.png'))
    api=page.locator('#api').evaluate('(element) => ({top:element.offsetTop,height:element.offsetHeight})')
    for point,stage in [(0.04,'0'),(0.30,'1'),(0.56,'2'),(0.84,'3')]:
        page.evaluate('(y) => scrollTo(0,y)',api['top']+(api['height']-900)*point)
        page.wait_for_timeout(400)
        actual=page.locator('#api-stage').get_attribute('data-stage')
        top=page.locator('#api-stage').evaluate('(element) => element.getBoundingClientRect().top')
        print('API',point,actual)
        assert actual==stage,(point,actual,stage)
        assert abs(top)<2,('API did not stay pinned',point,top)
        page.screenshot(path=str(root/f'qa/v2-api-scroll-{stage}.png'))
    assert not errors,errors
    browser.close()
