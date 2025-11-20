from playwright.sync_api import sync_playwright
import os

def verify_feature():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # 1. Verify Default Content
        page.wait_for_selector("#preview")

        # Check text content for key phrases
        content = page.content()
        assert "الفيزياء" in content
        assert "جداول مقارنة" in content

        page.screenshot(path="verification/final_doc_view.png")
        print("Doc view captured")

        # 2. Switch to Mind Map
        # Use the checkbox toggle
        # Label is 'عرض كخريطة ذهنية', check ID viewToggle
        page.check("#viewToggle")

        page.wait_for_selector("#mindmap-container svg")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/final_mindmap_vertical.png")
        print("Vertical Map captured")

        # 3. Switch Layout to Horizontal
        page.select_option("#layoutSelect", "horizontal")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/final_mindmap_horizontal.png")
        print("Horizontal Map captured")

        browser.close()

if __name__ == "__main__":
    verify_feature()
