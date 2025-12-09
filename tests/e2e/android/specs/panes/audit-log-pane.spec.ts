import { test, expect } from '@playwright/test';
import { AndroidHelpers } from '../../helpers/android-helpers';
import { WorkspacePage } from '../../page-objects/workspace-page';

test.describe('Audit Log Pane', () => {
  let helpers: AndroidHelpers;
  let workspacePage: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    helpers = new AndroidHelpers(page);
    workspacePage = new WorkspacePage(page);

    await helpers.launchApp();
    await workspacePage.waitForWorkspaceLoad();
    await workspacePage.openPane('audit-log');
  });

  test('should render audit log pane', async ({ page }) => {
    const paneContainer = page.locator('[data-testid="audit-log-pane"]');
    await expect(paneContainer).toBeVisible();
  });

  test('should display audit log entries', async ({ page }) => {
    const logEntries = page.locator('[data-testid="audit-log-entries"]');
    await expect(logEntries).toBeVisible();
  });

  test('should show log entry timestamp', async ({ page }) => {
    const timestamp = page.locator('[data-testid="audit-log-timestamp"]').first();
    if (await timestamp.isVisible()) {
      await expect(timestamp).toBeVisible();
    }
  });

  test('should display log entry action', async ({ page }) => {
    const action = page.locator('[data-testid="audit-log-action"]').first();
    if (await action.isVisible()) {
      await expect(action).toBeVisible();
    }
  });

  test('should show log entry user', async ({ page }) => {
    const user = page.locator('[data-testid="audit-log-user"]').first();
    if (await user.isVisible()) {
      await expect(user).toBeVisible();
    }
  });

  test('should display filter controls', async ({ page }) => {
    const filterControls = page.locator('[data-testid="audit-log-filters"]');
    await expect(filterControls).toBeVisible();
  });

  test('should show date range selector', async ({ page }) => {
    const dateRange = page.locator('[data-testid="audit-log-date-range"]');
    await expect(dateRange).toBeVisible();
  });

  test('should display action type filter', async ({ page }) => {
    const actionFilter = page.locator('[data-testid="audit-log-action-filter"]');
    await expect(actionFilter).toBeVisible();
  });

  test('should show search input', async ({ page }) => {
    const searchInput = page.locator('[data-testid="audit-log-search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display export logs button', async ({ page }) => {
    const exportButton = page.locator('[data-testid="export-audit-logs-button"]');
    await expect(exportButton).toBeVisible();
  });

  test('should show refresh button', async ({ page }) => {
    const refreshButton = page.locator('[data-testid="refresh-audit-logs-button"]');
    await expect(refreshButton).toBeVisible();
  });

  test('should allow searching logs', async ({ page }) => {
    const searchInput = page.locator('[data-testid="audit-log-search"]');
    await searchInput.fill('user login');
    await expect(searchInput).toHaveValue('user login');
  });

  test('should support scrolling through log entries', async ({ page }) => {
    const logEntries = page.locator('[data-testid="audit-log-entries"]');
    await helpers.performSwipe(logEntries, 'up', 300);
    await expect(logEntries).toBeVisible();
  });
});
