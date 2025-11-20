from playwright.sync_api import sync_playwright
import os

def verify_layouts():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # 1. Verify Default Doc View
        page.wait_for_selector("#preview")
        page.screenshot(path="verification/view_doc.png")
        print("Doc view captured")

        # 2. Verify Vertical Map
        page.click("#btn-mm-vert")
        page.wait_for_selector("#mindmap-container svg")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/view_vertical.png")
        print("Vertical Map captured")

        # 3. Verify Horizontal Map
        page.click("#btn-mm-horiz")
        # Wait a bit for re-render
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/view_horizontal.png")
        print("Horizontal Map captured")

        browser.close()

if __name__ == "__main__":
    verify_layouts()
