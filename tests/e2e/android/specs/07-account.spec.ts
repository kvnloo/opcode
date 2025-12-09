import homePage from '../pageobjects/home.page';
import commonPage from '../pageobjects/common.page';
import { expectVisible, expectText } from '../helpers/assertions';

describe('Account Screen', () => {
  const accountPage = {
    get container() { return $('android=new UiSelector().resourceId("account-screen")'); },
    get profileSection() { return $('android=new UiSelector().resourceId("profile-section")'); },
    get settingsSection() { return $('android=new UiSelector().resourceId("settings-section")'); },
    get themeToggle() { return $('android=new UiSelector().resourceId("theme-toggle")'); },
    get notificationsToggle() { return $('android=new UiSelector().resourceId("notifications-toggle")'); },
    get aboutSection() { return $('android=new UiSelector().resourceId("about-section")'); },
    get versionText() { return $('android=new UiSelector().resourceId("version-text")'); },
    get logoutButton() { return $('android=new UiSelector().resourceId("logout-btn")'); },
    get helpButton() { return $('android=new UiSelector().resourceId("help-btn")'); },
    get feedbackButton() { return $('android=new UiSelector().resourceId("feedback-btn")'); }
  };

  beforeEach(async () => {
    await homePage.navigateToAccount();
    await accountPage.container.waitForDisplayed();
  });

  afterEach(async () => {
    await homePage.navHome.click();
  });

  it('should display account screen', async () => {
    await expectVisible(accountPage.container);
  });

  it('should show profile section', async () => {
    await expectVisible(accountPage.profileSection);
  });

  it('should show settings section', async () => {
    await expectVisible(accountPage.settingsSection);
  });

  it('should have theme toggle', async () => {
    await expectVisible(accountPage.themeToggle);
  });

  it('should toggle theme on tap', async () => {
    const initialState = await accountPage.themeToggle.getAttribute('checked');
    await accountPage.themeToggle.click();
    const newState = await accountPage.themeToggle.getAttribute('checked');
    expect(newState).not.toBe(initialState);
    // Toggle back
    await accountPage.themeToggle.click();
  });

  it('should have notifications toggle', async () => {
    await expectVisible(accountPage.notificationsToggle);
  });

  it('should show about section', async () => {
    await expectVisible(accountPage.aboutSection);
  });

  it('should display version', async () => {
    await expectVisible(accountPage.versionText);
    const version = await accountPage.versionText.getText();
    expect(version).toMatch(/\d+\.\d+\.\d+/);
  });

  it('should have help button', async () => {
    await expectVisible(accountPage.helpButton);
  });

  it('should have feedback button', async () => {
    await expectVisible(accountPage.feedbackButton);
  });
});
