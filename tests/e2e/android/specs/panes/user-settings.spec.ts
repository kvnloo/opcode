import { waitForWebViewReady } from '../../helpers/assertions';

describe('User Settings', () => {
  before(async () => {
    await waitForWebViewReady(30000);
  });

  it('should render user settings pane', async () => {
    const pane = await $('[data-testid="user-settings-pane"]');
    expect(await pane.isDisplayed()).toBe(true);
  });

  it('should display settings header', async () => {
    const header = await $('[data-testid="settings-header"]');
    expect(await header.isDisplayed()).toBe(true);
    expect(await header.getText()).toContain('Settings');
  });

  it('should show profile section', async () => {
    const profileSection = await $('[data-testid="profile-section"]');
    expect(await profileSection.isDisplayed()).toBe(true);
  });

  it('should display appearance settings', async () => {
    const appearanceSection = await $('[data-testid="appearance-section"]');
    expect(await appearanceSection.isDisplayed()).toBe(true);
  });

  it('should show theme selector', async () => {
    const themeSelector = await $('[data-testid="theme-selector"]');
    expect(await themeSelector.isDisplayed()).toBe(true);
  });

  it('should display editor preferences', async () => {
    const editorPrefs = await $('[data-testid="editor-preferences"]');
    expect(await editorPrefs.isDisplayed()).toBe(true);
  });

  it('should show notification settings', async () => {
    const notifications = await $('[data-testid="notification-settings"]');
    expect(await notifications.isDisplayed()).toBe(true);
  });

  it('should display keyboard shortcuts', async () => {
    const shortcuts = await $('[data-testid="keyboard-shortcuts"]');
    expect(await shortcuts.isDisplayed()).toBe(true);
  });

  it('should show save settings button', async () => {
    const saveButton = await $('[data-testid="save-settings-button"]');
    expect(await saveButton.isDisplayed()).toBe(true);
  });

  it('should display reset settings button', async () => {
    const resetButton = await $('[data-testid="reset-settings-button"]');
    expect(await resetButton.isDisplayed()).toBe(true);
  });

  it('should show account section', async () => {
    const accountSection = await $('[data-testid="account-section"]');
    expect(await accountSection.isDisplayed()).toBe(true);
  });

  it('should not show error messages on load', async () => {
    const errorMessages = await $$('[data-testid*="error"]');
    expect(errorMessages.length).toBe(0);
  });
});
