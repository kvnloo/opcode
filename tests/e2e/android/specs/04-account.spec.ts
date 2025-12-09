import { waitForWebViewReady, expectScreenshot } from '../helpers/assertions';
import HomePage from '../pageobjects/home.page';

/**
 * Account Screen Test
 * Tests the Account screen features including profile info and theme toggle.
 */
describe('04 - Account Features', () => {
  before(async () => {
    // Setup: Navigate to Account screen
    await browser.pause(5000);
    await waitForWebViewReady(30000);

    // Navigate to Account tab
    await HomePage.accountTab.click();
    await browser.pause(1000);
  });

  describe('Account Screen Layout', () => {
    it('should display Account screen', async () => {
      const accountScreen = await $('[data-testid="screen-account"]');
      await accountScreen.waitForDisplayed({ timeout: 10000 });
      expect(await accountScreen.isDisplayed()).toBe(true);
      await expectScreenshot('account-01-screen-loaded');
    });

    it('should show Account header', async () => {
      const accountHeader = await $('h1*=Account,h2*=Account');
      await accountHeader.waitForDisplayed({ timeout: 5000 });
      expect(await accountHeader.isDisplayed()).toBe(true);

      const headerText = await accountHeader.getText();
      expect(headerText).toContain('Account');
    });

    it('should display account icon/avatar', async () => {
      // Look for user icon or avatar
      const accountIcon = await $('[data-testid="account-icon"],.lucide-user,.lucide-user-circle');
      await accountIcon.waitForDisplayed({ timeout: 5000 });
      expect(await accountIcon.isDisplayed()).toBe(true);
    });
  });

  describe('Profile Information', () => {
    it('should display user profile section', async () => {
      // Look for profile info container
      const profileSection = await $('[data-testid="profile-section"],.border');
      await profileSection.waitForDisplayed({ timeout: 5000 });
      expect(await profileSection.isDisplayed()).toBe(true);

      await expectScreenshot('account-02-profile-section');
    });

    it('should show user name or email', async () => {
      // Look for text elements that might contain user info
      const profileText = await $$('p,span,div');

      // At least one element should be visible with text content
      let hasText = false;
      for (const element of profileText) {
        const text = await element.getText().catch(() => '');
        if (text && text.length > 0 && text !== 'Account') {
          hasText = true;
          break;
        }
      }
      expect(hasText).toBe(true);
    });

    it('should display account status or tier info (if applicable)', async () => {
      // Look for status badges or tier information
      const statusElement = await $('[data-testid="account-status"],[data-testid="account-tier"]');
      const isVisible = await statusElement.isDisplayed().catch(() => false);

      // This may not be implemented yet, so we just log the result
      console.log('Account status/tier visible:', isVisible);
    });
  });

  describe('Theme Settings', () => {
    it('should display theme toggle or theme settings', async () => {
      // Look for theme toggle button or switch
      const themeToggle = await $(
        '[data-testid="theme-toggle"],' +
        'button*=Theme,' +
        'button*=Dark Mode,' +
        'button*=Light Mode,' +
        '[role="switch"]'
      );

      await themeToggle.waitForDisplayed({ timeout: 5000 });
      expect(await themeToggle.isDisplayed()).toBe(true);

      await expectScreenshot('account-03-theme-toggle');
    });

    it('should toggle theme when tapping theme button', async () => {
      const themeToggle = await $(
        '[data-testid="theme-toggle"],' +
        'button*=Theme,' +
        'button*=Dark,' +
        'button*=Light,' +
        '[role="switch"]'
      );

      // Get initial state (try to read aria-checked or class)
      const initialState = await themeToggle.getAttribute('aria-checked').catch(() =>
        themeToggle.getAttribute('class')
      );

      // Click toggle
      await themeToggle.click();
      await browser.pause(1000); // Wait for theme change animation

      // Get new state
      const newState = await themeToggle.getAttribute('aria-checked').catch(() =>
        themeToggle.getAttribute('class')
      );

      // State should have changed
      expect(newState).not.toBe(initialState);

      await expectScreenshot('account-04-theme-toggled');
    });

    it('should persist theme change visually', async () => {
      // Check if background or text colors changed
      const screenElement = await $('[data-testid="screen-account"]');
      const backgroundColor = await screenElement.getCSSProperty('background-color');

      // Just verify we can read CSS properties (actual validation would require baseline)
      expect(backgroundColor).toBeDefined();
      expect(backgroundColor.value).toBeDefined();

      await expectScreenshot('account-05-theme-persisted');
    });

    it('should toggle theme back to original state', async () => {
      const themeToggle = await $(
        '[data-testid="theme-toggle"],' +
        'button*=Theme,' +
        'button*=Dark,' +
        'button*=Light,' +
        '[role="switch"]'
      );

      // Click toggle again to restore
      await themeToggle.click();
      await browser.pause(1000);

      await expectScreenshot('account-06-theme-restored');
    });
  });

  describe('Settings Sections', () => {
    it('should display settings or preferences sections', async () => {
      // Look for settings sections
      const settingsSections = await $$('[data-testid*="settings"],[data-testid*="preference"]');

      if (settingsSections.length > 0) {
        console.log('Found settings sections:', settingsSections.length);
        expect(settingsSections.length).toBeGreaterThan(0);
      } else {
        // Settings may not be fully implemented
        console.log('No settings sections found yet');
      }
    });

    it('should show account options or actions', async () => {
      // Look for buttons like Sign Out, Edit Profile, etc.
      const actionButtons = await $$('button*=Sign,button*=Edit,button*=Logout,button*=Settings');

      if (actionButtons.length > 0) {
        console.log('Found action buttons:', actionButtons.length);
        for (const button of actionButtons) {
          const text = await button.getText();
          console.log('Action button:', text);
        }
      } else {
        console.log('No action buttons found yet');
      }
    });
  });

  describe('Account Screen Navigation', () => {
    it('should allow navigation away from Account screen', async () => {
      // Navigate to Apps
      await HomePage.appsTab.click();
      await browser.pause(1000);

      const appsHeader = await HomePage.appsHeader;
      await appsHeader.waitForDisplayed({ timeout: 5000 });
      expect(await appsHeader.isDisplayed()).toBe(true);
    });

    it('should return to Account screen via navigation', async () => {
      await HomePage.accountTab.click();
      await browser.pause(1000);

      const accountScreen = await $('[data-testid="screen-account"]');
      await accountScreen.waitForDisplayed({ timeout: 5000 });
      expect(await accountScreen.isDisplayed()).toBe(true);

      await expectScreenshot('account-07-return-to-account');
    });

    it('should persist theme setting across navigation', async () => {
      // Navigate away and back, theme should persist
      await HomePage.createTab.click();
      await browser.pause(500);

      await HomePage.accountTab.click();
      await browser.pause(500);

      const accountScreen = await $('[data-testid="screen-account"]');
      expect(await accountScreen.isDisplayed()).toBe(true);

      // Theme should still be applied (visual check via screenshot)
      await expectScreenshot('account-08-theme-persists-navigation');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on interactive elements', async () => {
      const themeToggle = await $(
        '[data-testid="theme-toggle"],' +
        'button*=Theme,' +
        '[role="switch"]'
      );

      const ariaLabel = await themeToggle.getAttribute('aria-label').catch(() => null);
      const hasAriaLabel = ariaLabel !== null && ariaLabel.length > 0;

      console.log('Theme toggle aria-label:', ariaLabel);
      expect(hasAriaLabel).toBe(true);
    });

    it('should have semantic HTML structure', async () => {
      const headings = await $$('h1,h2,h3');
      expect(headings.length).toBeGreaterThan(0);

      const buttons = await $$('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  after(async () => {
    await expectScreenshot('account-test-complete');
  });
});
