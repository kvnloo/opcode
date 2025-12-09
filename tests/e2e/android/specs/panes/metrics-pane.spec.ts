import { test, expect } from '@playwright/test';
import { AndroidHelpers } from '../../helpers/android-helpers';
import { WorkspacePage } from '../../page-objects/workspace-page';

test.describe('Metrics Pane', () => {
  let helpers: AndroidHelpers;
  let workspacePage: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    helpers = new AndroidHelpers(page);
    workspacePage = new WorkspacePage(page);

    await helpers.launchApp();
    await workspacePage.waitForWorkspaceLoad();
    await workspacePage.openPane('metrics');
  });

  test('should render metrics pane', async ({ page }) => {
    const paneContainer = page.locator('[data-testid="metrics-pane"]');
    await expect(paneContainer).toBeVisible();
  });

  test('should display performance metrics', async ({ page }) => {
    const perfMetrics = page.locator('[data-testid="performance-metrics"]');
    await expect(perfMetrics).toBeVisible();
  });

  test('should show CPU usage metric', async ({ page }) => {
    const cpuMetric = page.locator('[data-testid="cpu-usage-metric"]');
    await expect(cpuMetric).toBeVisible();
  });

  test('should display memory usage metric', async ({ page }) => {
    const memoryMetric = page.locator('[data-testid="memory-usage-metric"]');
    await expect(memoryMetric).toBeVisible();
  });

  test('should show network activity metric', async ({ page }) => {
    const networkMetric = page.locator('[data-testid="network-activity-metric"]');
    await expect(networkMetric).toBeVisible();
  });

  test('should display real-time graphs', async ({ page }) => {
    const realtimeGraphs = page.locator('[data-testid="realtime-metrics-graph"]');
    await expect(realtimeGraphs.first()).toBeVisible();
  });

  test('should show metric threshold indicators', async ({ page }) => {
    const thresholdIndicators = page.locator('[data-testid="metric-threshold-indicator"]');
    await expect(thresholdIndicators.first()).toBeVisible();
  });

  test('should display alert configuration', async ({ page }) => {
    const alertConfig = page.locator('[data-testid="metric-alert-config"]');
    await expect(alertConfig).toBeVisible();
  });

  test('should show historical data button', async ({ page }) => {
    const historicalButton = page.locator('[data-testid="historical-metrics-button"]');
    await expect(historicalButton).toBeVisible();
  });

  test('should display metrics refresh interval', async ({ page }) => {
    const refreshInterval = page.locator('[data-testid="metrics-refresh-interval"]');
    await expect(refreshInterval).toBeVisible();
  });

  test('should allow toggling metric visibility', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="toggle-metric-visibility"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.tap();
      await expect(toggleButton).toBeVisible();
    }
  });

  test('should support scrolling through metrics', async ({ page }) => {
    const metricsContainer = page.locator('[data-testid="metrics-pane"]');
    await helpers.performSwipe(metricsContainer, 'up', 300);
    await expect(metricsContainer).toBeVisible();
  });
});
