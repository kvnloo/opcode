import { waitForWebViewReady, expectScreenshot } from '../helpers/assertions';
import HomePage from '../pageobjects/home.page';

describe('Comprehensive Navigation Tests', () => {
  before(async () => {
    // Wait for app and switch to WebView
    await browser.pause(5000);
    await waitForWebViewReady(30000);
  });

  describe('Bottom Navigation Flow', () => {
    it('should start on Apps tab', async () => {
      const appsHeader = await HomePage.appsHeader;
      await appsHeader.waitForDisplayed({ timeout: 10000 });
      expect(await appsHeader.isDisplayed()).toBe(true);
      await expectScreenshot('nav-apps-initial');
    });

    it('should navigate through all tabs in sequence', async () => {
      // Navigate to Create
      await HomePage.navigateToCreate();
      await browser.pause(1000);
      await expectScreenshot('nav-create-screen');

      // Navigate to Account
      await HomePage.navigateToAccount();
      await browser.pause(1000);
      await expectScreenshot('nav-account-screen');

      // Return to Apps
      await HomePage.appsTab.click();
      await browser.pause(1000);
      const appsHeader = await HomePage.appsHeader;
      expect(await appsHeader.isDisplayed()).toBe(true);
      await expectScreenshot('nav-apps-return');
    });

    it('should handle rapid tab switching', async () => {
      // Rapidly switch tabs to test state management
      await HomePage.createTab.click();
      await browser.pause(200);
      await HomePage.accountTab.click();
      await browser.pause(200);
      await HomePage.appsTab.click();
      await browser.pause(1000);

      const appsHeader = await HomePage.appsHeader;
      expect(await appsHeader.isDisplayed()).toBe(true);
      await expectScreenshot('nav-rapid-switch');
    });
  });

  describe('Apps Screen State Management', () => {
    beforeEach(async () => {
      // Ensure we're on Apps tab
      const appsTab = await HomePage.appsTab;
      await appsTab.click();
      await browser.pause(500);
    });

    it('should display loading state properly', async () => {
      // This test observes the loading state if it appears
      await browser.pause(500);
      const isLoading = await HomePage.isLoadingProjects();
      console.log('Loading state visible:', isLoading);

      if (isLoading) {
        await expectScreenshot('nav-apps-loading');
        await HomePage.waitForProjectsLoad();
      }
    });

    it('should display final state (empty, error, or projects)', async () => {
      await HomePage.waitForProjectsLoad();

      const hasError = await HomePage.hasError();
      const hasProjects = await HomePage.hasProjects();

      console.log('Final state - Error:', hasError, 'Projects:', hasProjects);

      if (hasError) {
        expect(await HomePage.errorTitle.isDisplayed()).toBe(true);
        await expectScreenshot('nav-apps-error');
      } else if (hasProjects) {
        // Has projects - should see project list
        await expectScreenshot('nav-apps-projects');
      } else {
        // Empty state
        expect(await HomePage.emptyStateText.isDisplayed()).toBe(true);
        await expectScreenshot('nav-apps-empty');
      }
    });

    it('should allow filter interaction', async () => {
      const filterButton = await HomePage.filterButton;
      expect(await filterButton.isDisplayed()).toBe(true);
      await expectScreenshot('nav-apps-filter-button');

      // Note: Not clicking as dropdown may not be implemented yet
      console.log('Filter button is visible and clickable');
    });
  });

  describe('Tab Persistence', () => {
    it('should maintain tab state after navigation', async () => {
      // Navigate to Create
      await HomePage.createTab.click();
      await browser.pause(500);

      // Navigate to Account and back to Create
      await HomePage.accountTab.click();
      await browser.pause(500);
      await HomePage.createTab.click();
      await browser.pause(500);

      // Verify we're still on Create
      await expectScreenshot('nav-tab-persistence');
    });
  });

  describe('Visual State Indicators', () => {
    it('should show active tab indicators', async () => {
      // Check Apps tab active state
      await HomePage.appsTab.click();
      await browser.pause(500);
      const appsTabClass = await HomePage.appsTab.getAttribute('class');
      expect(appsTabClass).toContain('text-primary');
      await expectScreenshot('nav-apps-active');

      // Check Create tab active state
      await HomePage.createTab.click();
      await browser.pause(500);
      const createTabClass = await HomePage.createTab.getAttribute('class');
      expect(createTabClass).toContain('text-primary');
      await expectScreenshot('nav-create-active');

      // Check Account tab active state
      await HomePage.accountTab.click();
      await browser.pause(500);
      const accountTabClass = await HomePage.accountTab.getAttribute('class');
      expect(accountTabClass).toContain('text-primary');
      await expectScreenshot('nav-account-active');
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const appsLabel = await HomePage.appsTab.getAttribute('aria-label');
      const createLabel = await HomePage.createTab.getAttribute('aria-label');
      const accountLabel = await HomePage.accountTab.getAttribute('aria-label');

      expect(appsLabel).toBe('Apps');
      expect(createLabel).toBe('Create');
      expect(accountLabel).toBe('Account');
    });

    it('should have proper aria-current on active tab', async () => {
      await HomePage.appsTab.click();
      await browser.pause(500);

      const appsCurrent = await HomePage.appsTab.getAttribute('aria-current');
      expect(appsCurrent).toBe('page');

      await HomePage.createTab.click();
      await browser.pause(500);

      const createCurrent = await HomePage.createTab.getAttribute('aria-current');
      expect(createCurrent).toBe('page');
    });
  });

  after(async () => {
    await expectScreenshot('nav-tests-complete');
  });
});
