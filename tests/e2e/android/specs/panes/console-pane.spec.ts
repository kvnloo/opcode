import { waitForWebViewReady } from '../../helpers/assertions';

describe('Console Pane', () => {
  before(async () => {
    await waitForWebViewReady(30000);
  });

  it('should render console pane', async () => {
    const pane = await $('[data-testid="console-pane"]');
    expect(await pane.isDisplayed()).toBe(true);
  });

  it('should display console header', async () => {
    const header = await $('[data-testid="console-pane-header"]');
    expect(await header.isDisplayed()).toBe(true);
    expect(await header.getText()).toContain('Console');
  });

  it('should show console output area', async () => {
    const outputArea = await $('[data-testid="console-output"]');
    expect(await outputArea.isDisplayed()).toBe(true);
  });

  it('should display log level filters', async () => {
    const filters = await $('[data-testid="log-level-filters"]');
    expect(await filters.isDisplayed()).toBe(true);
  });

  it('should show clear console button', async () => {
    const clearButton = await $('[data-testid="clear-console-button"]');
    expect(await clearButton.isDisplayed()).toBe(true);
  });

  it('should display timestamp toggle', async () => {
    const timestampToggle = await $('[data-testid="timestamp-toggle"]');
    expect(await timestampToggle.isDisplayed()).toBe(true);
  });

  it('should show search input', async () => {
    const searchInput = await $('[data-testid="console-search"]');
    expect(await searchInput.isDisplayed()).toBe(true);
  });

  it('should handle log filtering', async () => {
    const errorFilter = await $('[data-testid="filter-error"]');
    await errorFilter.click();

    const outputArea = await $('[data-testid="console-output"]');
    expect(await outputArea.isDisplayed()).toBe(true);
  });

  it('should display scrollable output', async () => {
    const scrollContainer = await $('[data-testid="console-scroll-container"]');
    expect(await scrollContainer.isDisplayed()).toBe(true);
  });

  it('should show export logs button', async () => {
    const exportButton = await $('[data-testid="export-logs-button"]');
    expect(await exportButton.isDisplayed()).toBe(true);
  });

  it('should not show error messages on load', async () => {
    const errorMessages = await $$('[data-testid*="error"]');
    expect(errorMessages.length).toBe(0);
  });
});
