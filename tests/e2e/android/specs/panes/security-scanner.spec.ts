import { waitForWebViewReady } from '../../helpers/assertions';

describe('Security Scanner', () => {
  before(async () => {
    await waitForWebViewReady(30000);
  });

  it('should render security scanner pane', async () => {
    const pane = await $('[data-testid="security-scanner-pane"]');
    expect(await pane.isDisplayed()).toBe(true);
  });

  it('should display security scanner header', async () => {
    const header = await $('[data-testid="security-scanner-header"]');
    expect(await header.isDisplayed()).toBe(true);
    expect(await header.getText()).toContain('Security');
  });

  it('should show scan button', async () => {
    const scanButton = await $('[data-testid="start-scan-button"]');
    expect(await scanButton.isDisplayed()).toBe(true);
  });

  it('should display scan results area', async () => {
    const resultsArea = await $('[data-testid="scan-results"]');
    expect(await resultsArea.isDisplayed()).toBe(true);
  });

  it('should show vulnerability count', async () => {
    const vulnCount = await $('[data-testid="vulnerability-count"]');
    expect(await vulnCount.isDisplayed()).toBe(true);
  });

  it('should display severity filters', async () => {
    const severityFilters = await $('[data-testid="severity-filters"]');
    expect(await severityFilters.isDisplayed()).toBe(true);
  });

  it('should show critical vulnerabilities', async () => {
    const criticalSection = await $('[data-testid="critical-vulnerabilities"]');
    expect(await criticalSection.isDisplayed()).toBe(true);
  });

  it('should display scan history', async () => {
    const scanHistory = await $('[data-testid="scan-history"]');
    expect(await scanHistory.isDisplayed()).toBe(true);
  });

  it('should show export report button', async () => {
    const exportButton = await $('[data-testid="export-report-button"]');
    expect(await exportButton.isDisplayed()).toBe(true);
  });

  it('should display scan configuration', async () => {
    const scanConfig = await $('[data-testid="scan-configuration"]');
    expect(await scanConfig.isDisplayed()).toBe(true);
  });

  it('should show vulnerability details', async () => {
    const details = await $('[data-testid="vulnerability-details"]');
    expect(await details.isDisplayed()).toBe(true);
  });

  it('should not show error messages on load', async () => {
    const errorMessages = await $$('[data-testid*="error"]');
    expect(errorMessages.length).toBe(0);
  });
});
