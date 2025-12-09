import { waitForWebViewReady, expectScreenshot } from '../helpers/assertions';
import HomePage from '../pageobjects/home.page';

/**
 * Navigation Flow Test
 * Tests the basic bottom navigation flow between tabs:
 * - Apps screen (default)
 * - Create screen
 * - Account screen
 * - Verify back navigation works
 */
describe('01 - Navigation Flow', () => {
  before(async () => {
    // Wait for app to fully load and switch to WebView
    await browser.pause(5000);
    await waitForWebViewReady(30000);
  });

  describe('Initial State', () => {
    it('should launch on Apps screen by default', async () => {
      const appsHeader = await HomePage.appsHeader;
      await appsHeader.waitForDisplayed({ timeout: 10000 });
      expect(await appsHeader.isDisplayed()).toBe(true);
      expect(await appsHeader.getText()).toBe('Apps');
      await expectScreenshot('nav-01-apps-initial');
    });

    it('should show bottom navigation bar', async () => {
      const bottomNav = await HomePage.bottomNav;
      await bottomNav.waitForDisplayed({ timeout: 5000 });
      expect(await bottomNav.isDisplayed()).toBe(true);
    });

    it('should have all three navigation tabs', async () => {
      expect(await HomePage.appsTab.isDisplayed()).toBe(true);
      expect(await HomePage.createTab.isDisplayed()).toBe(true);
      expect(await HomePage.accountTab.isDisplayed()).toBe(true);
    });

    it('should show Apps tab as active (highlighted)', async () => {
      const appsTabClass = await HomePage.appsTab.getAttribute('class');
      expect(appsTabClass).toContain('text-primary');
    });
  });

  describe('Create Tab Navigation', () => {
    it('should navigate to Create screen when tapping Create tab', async () => {
      await HomePage.createTab.click();
      await browser.pause(1000); // Wait for animation

      // Verify Create screen is visible by checking for Create header/content
      const createHeader = await $('h1*=Create,h2*=Create,h3*=Create');
      await createHeader.waitForDisplayed({ timeout: 5000 });
      expect(await createHeader.isDisplayed()).toBe(true);

      await expectScreenshot('nav-02-create-screen');
    });

    it('should show Create tab as active', async () => {
      const createTabClass = await HomePage.createTab.getAttribute('class');
      expect(createTabClass).toContain('text-primary');
    });

    it('should verify Create screen content is loaded', async () => {
      // Look for project description input or template list
      const createContent = await $('[data-testid="screen-create"]');
      expect(await createContent.isDisplayed()).toBe(true);
    });
  });

  describe('Account Tab Navigation', () => {
    it('should navigate to Account screen when tapping Account tab', async () => {
      await HomePage.accountTab.click();
      await browser.pause(1000); // Wait for animation

      // Verify Account screen is visible
      const accountHeader = await $('h1*=Account,h2*=Account,h3*=Account');
      await accountHeader.waitForDisplayed({ timeout: 5000 });
      expect(await accountHeader.isDisplayed()).toBe(true);

      await expectScreenshot('nav-03-account-screen');
    });

    it('should show Account tab as active', async () => {
      const accountTabClass = await HomePage.accountTab.getAttribute('class');
      expect(accountTabClass).toContain('text-primary');
    });

    it('should verify Account screen content is loaded', async () => {
      const accountContent = await $('[data-testid="screen-account"]');
      expect(await accountContent.isDisplayed()).toBe(true);
    });
  });

  describe('Return to Apps Tab', () => {
    it('should navigate back to Apps screen', async () => {
      await HomePage.appsTab.click();
      await browser.pause(1000); // Wait for animation

      const appsHeader = await HomePage.appsHeader;
      await appsHeader.waitForDisplayed({ timeout: 5000 });
      expect(await appsHeader.isDisplayed()).toBe(true);

      await expectScreenshot('nav-04-apps-return');
    });

    it('should show Apps tab as active again', async () => {
      const appsTabClass = await HomePage.appsTab.getAttribute('class');
      expect(appsTabClass).toContain('text-primary');
    });
  });

  describe('Rapid Tab Switching', () => {
    it('should handle rapid navigation without breaking', async () => {
      // Rapidly switch between tabs
      await HomePage.createTab.click();
      await browser.pause(200);
      await HomePage.accountTab.click();
      await browser.pause(200);
      await HomePage.appsTab.click();
      await browser.pause(1000);

      // Verify we end up on Apps screen and app is stable
      const appsHeader = await HomePage.appsHeader;
      expect(await appsHeader.isDisplayed()).toBe(true);
      await expectScreenshot('nav-05-rapid-switch-stable');
    });
  });

  describe('Navigation Persistence', () => {
    it('should maintain state when switching tabs', async () => {
      // Go to Create
      await HomePage.createTab.click();
      await browser.pause(500);

      // Go to Account and back to Create
      await HomePage.accountTab.click();
      await browser.pause(500);
      await HomePage.createTab.click();
      await browser.pause(500);

      // Verify Create screen is still properly rendered
      const createContent = await $('[data-testid="screen-create"]');
      expect(await createContent.isDisplayed()).toBe(true);
      await expectScreenshot('nav-06-persistence-check');
    });
  });

  after(async () => {
    await expectScreenshot('nav-test-complete');
  });
});
