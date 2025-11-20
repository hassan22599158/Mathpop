from playwright.sync_api import sync_playwright
import os

def verify_mindmap():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html file
        # Note: Playwright might need file:// URI.
        file_path = os.path.abspath("index.html")
        page.goto(f"file://{file_path}")

        # Wait for the page to load
        page.wait_for_selector("#editor")

        # Click on "Mind Map" button
        page.click("#btn-mindmap")

        # Wait for the Mind Map to render (SVG element)
        page.wait_for_selector("#mindmap-container svg")

        # Give it a moment for D3 animation/rendering
        page.wait_for_timeout(2000)

        # Take a screenshot
        screenshot_path = "verification/mindmap_view.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_mindmap()
