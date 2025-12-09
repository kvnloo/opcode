import { test, expect } from '@playwright/test';
import { AndroidHelpers } from '../../helpers/android-helpers';
import { WorkspacePage } from '../../page-objects/workspace-page';

test.describe('Analytics Pane', () => {
  let helpers: AndroidHelpers;
  let workspacePage: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    helpers = new AndroidHelpers(page);
    workspacePage = new WorkspacePage(page);

    await helpers.launchApp();
    await workspacePage.waitForWorkspaceLoad();
    await workspacePage.openPane('analytics');
  });

  test('should render analytics pane', async ({ page }) => {
    const paneContainer = page.locator('[data-testid="analytics-pane"]');
    await expect(paneContainer).toBeVisible();
  });

  test('should display analytics dashboard', async ({ page }) => {
    const dashboard = page.locator('[data-testid="analytics-dashboard"]');
    await expect(dashboard).toBeVisible();
  });

  test('should show usage statistics', async ({ page }) => {
    const usageStats = page.locator('[data-testid="usage-statistics"]');
    await expect(usageStats).toBeVisible();
  });

  test('should display activity chart', async ({ page }) => {
    const activityChart = page.locator('[data-testid="activity-chart"]');
    await expect(activityChart).toBeVisible();
  });

  test('should show time range selector', async ({ page }) => {
    const timeRangeSelector = page.locator('[data-testid="time-range-selector"]');
    await expect(timeRangeSelector).toBeVisible();
  });

  test('should display metrics summary cards', async ({ page }) => {
    const metricsCards = page.locator('[data-testid="metrics-summary-card"]');
    await expect(metricsCards.first()).toBeVisible();
  });

  test('should show user activity breakdown', async ({ page }) => {
    const activityBreakdown = page.locator('[data-testid="activity-breakdown"]');
    await expect(activityBreakdown).toBeVisible();
  });

  test('should display export data button', async ({ page }) => {
    const exportButton = page.locator('[data-testid="export-analytics-button"]');
    await expect(exportButton).toBeVisible();
  });

  test('should show refresh button', async ({ page }) => {
    const refreshButton = page.locator('[data-testid="refresh-analytics-button"]');
    await expect(refreshButton).toBeVisible();
  });

  test('should allow changing time range', async ({ page }) => {
    const timeRangeSelector = page.locator('[data-testid="time-range-selector"]');
    await timeRangeSelector.tap();

    const rangeOption = page.locator('[data-testid="time-range-7d"]');
    if (await rangeOption.isVisible()) {
      await rangeOption.tap();
    }
  });

  test('should support scrolling through analytics data', async ({ page }) => {
    const dashboard = page.locator('[data-testid="analytics-dashboard"]');
    await helpers.performSwipe(dashboard, 'up', 300);
    await expect(dashboard).toBeVisible();
  });
});
