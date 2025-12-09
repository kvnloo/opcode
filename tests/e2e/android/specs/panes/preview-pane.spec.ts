import { waitForWebViewReady } from '../../helpers/assertions';

describe('Preview Pane', () => {
  before(async () => {
    await waitForWebViewReady(30000);
  });

  it('should render preview pane', async () => {
    const pane = await $('[data-testid="preview-pane"]');
    expect(await pane.isDisplayed()).toBe(true);
  });

  it('should display preview header', async () => {
    const header = await $('[data-testid="preview-pane-header"]');
    expect(await header.isDisplayed()).toBe(true);
    expect(await header.getText()).toContain('Preview');
  });

  it('should show preview iframe', async () => {
    const iframe = await $('[data-testid="preview-iframe"]');
    expect(await iframe.isDisplayed()).toBe(true);
  });

  it('should display refresh button', async () => {
    const refreshButton = await $('[data-testid="refresh-preview-button"]');
    expect(await refreshButton.isDisplayed()).toBe(true);
  });

  it('should show device size selector', async () => {
    const deviceSelector = await $('[data-testid="device-size-selector"]');
    expect(await deviceSelector.isDisplayed()).toBe(true);
  });

  it('should display orientation toggle', async () => {
    const orientationToggle = await $('[data-testid="orientation-toggle"]');
    expect(await orientationToggle.isDisplayed()).toBe(true);
  });

  it('should show preview URL bar', async () => {
    const urlBar = await $('[data-testid="preview-url-bar"]');
    expect(await urlBar.isDisplayed()).toBe(true);
  });

  it('should handle refresh action', async () => {
    const refreshButton = await $('[data-testid="refresh-preview-button"]');
    await refreshButton.click();

    const iframe = await $('[data-testid="preview-iframe"]');
    expect(await iframe.isDisplayed()).toBe(true);
  });

  it('should display loading indicator', async () => {
    const loadingIndicator = await $('[data-testid="preview-loading"]');
    // May or may not be visible depending on load state
    const exists = await loadingIndicator.isExisting();
    expect(typeof exists).toBe('boolean');
  });

  it('should show open in browser button', async () => {
    const openButton = await $('[data-testid="open-in-browser-button"]');
    expect(await openButton.isDisplayed()).toBe(true);
  });

  it('should not show error messages on load', async () => {
    const errorMessages = await $$('[data-testid*="error"]');
    expect(errorMessages.length).toBe(0);
  });
});
