import { expect } from 'expect-webdriverio';

/**
 * Switch to WebView context for Tauri apps
 * Tauri renders UI in a WebView, not native Android views
 */
export async function switchToWebView(timeout = 30000) {
  const endTime = Date.now() + timeout;

  while (Date.now() < endTime) {
    const contexts = await browser.getContexts();
    // Prefer the app's WebView context over chrome's WebView
    // For Tauri app: WEBVIEW_claudia.asterisk.so
    const appWebviewContext = contexts.find((ctx: string) =>
      ctx.includes('WEBVIEW_claudia') || ctx.includes('WEBVIEW_com.opcode')
    );
    const webviewContext = appWebviewContext || contexts.find((ctx: string) =>
      ctx.includes('WEBVIEW') && !ctx.includes('chrome')
    );

    if (webviewContext) {
      await browser.switchContext(webviewContext);
      return true;
    }
    await browser.pause(1000);
  }
  return false;
}

/**
 * Switch back to native context
 */
export async function switchToNative() {
  await browser.switchContext('NATIVE_APP');
}

/**
 * Get current context
 */
export async function getCurrentContext(): Promise<string> {
  return await browser.getContext();
}

/**
 * Wait for WebView to be ready and switch to it
 */
export async function waitForWebViewReady(timeout = 30000) {
  const switched = await switchToWebView(timeout);
  if (!switched) {
    throw new Error('WebView context not available after ' + timeout + 'ms');
  }
  // Wait for page to be interactive
  await browser.pause(2000);
}

export async function expectVisible(element: WebdriverIO.Element, timeout = 10000) {
  await element.waitForDisplayed({ timeout });
  expect(await element.isDisplayed()).toBe(true);
}

export async function expectNotVisible(element: WebdriverIO.Element, timeout = 5000) {
  try {
    await element.waitForDisplayed({ timeout, reverse: true });
  } catch {
    expect(await element.isDisplayed()).toBe(false);
  }
}

export async function expectEnabled(element: WebdriverIO.Element) {
  expect(await element.isEnabled()).toBe(true);
}

export async function expectDisabled(element: WebdriverIO.Element) {
  expect(await element.isEnabled()).toBe(false);
}

export async function expectText(element: WebdriverIO.Element, expectedText: string) {
  const text = await element.getText();
  expect(text).toBe(expectedText);
}

export async function expectTextContains(element: WebdriverIO.Element, substring: string) {
  const text = await element.getText();
  expect(text).toContain(substring);
}

export async function expectCount(elements: WebdriverIO.ElementArray, expectedCount: number) {
  expect(elements.length).toBe(expectedCount);
}

export async function expectCountAtLeast(elements: WebdriverIO.ElementArray, minCount: number) {
  expect(elements.length).toBeGreaterThanOrEqual(minCount);
}

export async function expectAttribute(element: WebdriverIO.Element, attr: string, value: string) {
  const attrValue = await element.getAttribute(attr);
  expect(attrValue).toBe(value);
}

export async function expectFocused(element: WebdriverIO.Element) {
  const focused = await element.isFocused();
  expect(focused).toBe(true);
}

export async function expectNoErrors() {
  const errorBanner = await $('android=new UiSelector().resourceId("error-banner")');
  try {
    const isDisplayed = await errorBanner.isDisplayed();
    expect(isDisplayed).toBe(false);
  } catch {
    // Element doesn't exist, which is good
  }
}

export async function expectLoadComplete(timeout = 30000) {
  const spinner = await $('android=new UiSelector().resourceId("loading-spinner")');
  try {
    await spinner.waitForDisplayed({ timeout: 2000 });
    await spinner.waitForDisplayed({ timeout, reverse: true });
  } catch {
    // Spinner may not appear for fast loads
  }
}

export async function expectScreenshot(name: string) {
  const timestamp = Date.now();
  await browser.saveScreenshot(`./screenshots/${name}_${timestamp}.png`);
}

export async function expectNoANR(action: () => Promise<void>, timeout = 5000) {
  const startTime = Date.now();
  await action();
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(timeout);
}

export async function expectTransition(action: () => Promise<void>, newElementSelector: string, timeout = 10000) {
  await action();
  const newElement = await $(newElementSelector);
  await newElement.waitForDisplayed({ timeout });
  expect(await newElement.isDisplayed()).toBe(true);
}
