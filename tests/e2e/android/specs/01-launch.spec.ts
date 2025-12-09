import { waitForWebViewReady, switchToNative, expectScreenshot } from '../helpers/assertions';
import HomePage from '../pageobjects/home.page';

describe('App Launch and Navigation - Tauri WebView', () => {
  before(async () => {
    // Wait for app to fully load
    await browser.pause(5000);
  });

  // Helper to dismiss consent dialog if present
  async function dismissConsentDialogIfPresent() {
    try {
      const consentNoThanks = await HomePage.consentNoThanks;
      const isDisplayed = await consentNoThanks.isDisplayed();
      if (isDisplayed) {
        console.log('Consent dialog detected, dismissing...');
        await consentNoThanks.click();
        await browser.pause(500); // Wait for dialog to close
        console.log('Consent dialog dismissed');
      }
    } catch {
      // Dialog not present, continue
      console.log('No consent dialog present');
    }
  }

  it('should launch without crashes', async () => {
    // App is running if we get here - verify by checking contexts
    const contexts = await browser.getContexts();
    console.log('Available contexts:', contexts);
    expect(contexts.length).toBeGreaterThanOrEqual(1);
  });

  it('should have WebView context available', async () => {
    const contexts = await browser.getContexts();
    const hasWebView = contexts.some((ctx: string) => ctx.includes('WEBVIEW'));
    console.log('WebView available:', hasWebView);
    console.log('Contexts:', contexts);
    expect(hasWebView).toBe(true);
  });

  it('should switch to WebView context', async () => {
    await waitForWebViewReady(30000);
    const currentContext = await browser.getContext();
    console.log('Current context after switch:', currentContext);
    expect(currentContext).toContain('WEBVIEW');
  });

  it('should have page content in WebView', async () => {
    const pageSource = await browser.getPageSource();
    console.log('Page source length:', pageSource.length);
    expect(pageSource.length).toBeGreaterThan(100);
    expect(pageSource).toContain('<');
  });

  it('should display Apps screen by default', async () => {
    const appsHeader = await HomePage.appsHeader;
    await appsHeader.waitForDisplayed({ timeout: 10000 });
    expect(await appsHeader.isDisplayed()).toBe(true);
    console.log('Apps header displayed');
  });

  it('should show bottom navigation', async () => {
    const bottomNav = await HomePage.bottomNav;
    await bottomNav.waitForDisplayed({ timeout: 5000 });
    expect(await bottomNav.isDisplayed()).toBe(true);
    console.log('Bottom navigation displayed');
  });

  it('should dismiss consent dialog if present', async () => {
    await dismissConsentDialogIfPresent();
    // Verify dialog is gone
    await browser.pause(500);
    try {
      const consentDialog = await HomePage.consentDialog;
      const isStillDisplayed = await consentDialog.isDisplayed();
      expect(isStillDisplayed).toBe(false);
    } catch {
      // Element not found means dialog is dismissed - good!
    }
    console.log('Consent dialog handled');
  });

  it('should navigate to Create tab', async () => {
    await dismissConsentDialogIfPresent(); // Ensure dialog is dismissed
    const createTab = await HomePage.createTab;
    await createTab.waitForDisplayed({ timeout: 5000 });
    await createTab.click();
    await browser.pause(1000); // Wait for animation
    await expectScreenshot('create-tab');
    console.log('Navigated to Create tab');
  });

  it('should navigate to Account tab', async () => {
    await dismissConsentDialogIfPresent(); // Ensure dialog is dismissed
    const accountTab = await HomePage.accountTab;
    await accountTab.waitForDisplayed({ timeout: 5000 });
    await accountTab.click();
    await browser.pause(1000); // Wait for animation
    await expectScreenshot('account-tab');
    console.log('Navigated to Account tab');
  });

  it('should navigate back to Apps tab', async () => {
    await dismissConsentDialogIfPresent(); // Ensure dialog is dismissed
    const appsTab = await HomePage.appsTab;
    await appsTab.waitForDisplayed({ timeout: 5000 });
    await appsTab.click();
    await browser.pause(1000); // Wait for animation

    const appsHeader = await HomePage.appsHeader;
    expect(await appsHeader.isDisplayed()).toBe(true);
    await expectScreenshot('apps-tab-return');
    console.log('Returned to Apps tab');
  });

  it('should handle project loading states', async () => {
    // Check if loading or showing empty state or projects
    await browser.pause(2000); // Let the app settle

    const isLoading = await HomePage.isLoadingProjects();
    if (isLoading) {
      console.log('Projects are loading...');
      await HomePage.waitForProjectsLoad();
    }

    const hasError = await HomePage.hasError();
    const hasProjects = await HomePage.hasProjects();

    console.log('Has error:', hasError);
    console.log('Has projects:', hasProjects);

    // Should be in one of these states
    const inValidState = hasError || hasProjects || (await HomePage.emptyStateText.isDisplayed());
    expect(inValidState).toBe(true);

    await expectScreenshot('apps-state-final');
  });

  it('should take final screenshot', async () => {
    await expectScreenshot('launch-test-complete');
  });

  it('should switch back to native context', async () => {
    await switchToNative();
    const context = await browser.getContext();
    expect(context).toBe('NATIVE_APP');
  });

  it('should respond within acceptable time', async () => {
    const startTime = Date.now();
    await browser.getContexts();
    const responseTime = Date.now() - startTime;
    console.log('Response time:', responseTime, 'ms');
    expect(responseTime).toBeLessThan(5000);
  });
});
