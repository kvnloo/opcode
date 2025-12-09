import { waitForWebViewReady } from '../../helpers/assertions';

describe('Workflows Pane', () => {
  before(async () => {
    await waitForWebViewReady(30000);
  });

  it('should render workflows pane', async () => {
    const pane = await $('[data-testid="workflows-pane"]');
    expect(await pane.isDisplayed()).toBe(true);
  });

  it('should display workflows header', async () => {
    const header = await $('[data-testid="workflows-pane-header"]');
    expect(await header.isDisplayed()).toBe(true);
    expect(await header.getText()).toContain('Workflows');
  });

  it('should show workflow list', async () => {
    const workflowList = await $('[data-testid="workflow-list"]');
    expect(await workflowList.isDisplayed()).toBe(true);
  });

  it('should display create workflow button', async () => {
    const createButton = await $('[data-testid="create-workflow-button"]');
    expect(await createButton.isDisplayed()).toBe(true);
  });

  it('should show workflow templates', async () => {
    const templates = await $('[data-testid="workflow-templates"]');
    expect(await templates.isDisplayed()).toBe(true);
  });

  it('should display active workflows', async () => {
    const activeWorkflows = await $('[data-testid="active-workflows"]');
    expect(await activeWorkflows.isDisplayed()).toBe(true);
  });

  it('should show workflow status indicators', async () => {
    const statusIndicator = await $('[data-testid="workflow-status"]');
    expect(await statusIndicator.isDisplayed()).toBe(true);
  });

  it('should handle workflow selection', async () => {
    const firstWorkflow = await $('[data-testid^="workflow-card-"]');
    await firstWorkflow.click();

    const detailsPanel = await $('[data-testid="workflow-details"]');
    expect(await detailsPanel.isDisplayed()).toBe(true);
  });

  it('should display workflow execution history', async () => {
    const history = await $('[data-testid="workflow-history"]');
    expect(await history.isDisplayed()).toBe(true);
  });

  it('should show run workflow button', async () => {
    const runButton = await $('[data-testid="run-workflow-button"]');
    expect(await runButton.isDisplayed()).toBe(true);
  });

  it('should display workflow configuration', async () => {
    const config = await $('[data-testid="workflow-configuration"]');
    expect(await config.isDisplayed()).toBe(true);
  });

  it('should not show error messages on load', async () => {
    const errorMessages = await $$('[data-testid*="error"]');
    expect(errorMessages.length).toBe(0);
  });
});
