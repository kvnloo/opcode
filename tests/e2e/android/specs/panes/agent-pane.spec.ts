import { waitForWebViewReady } from '../../helpers/assertions';

describe('Agent Pane', () => {
  before(async () => {
    await waitForWebViewReady(30000);
  });

  it('should render agent pane', async () => {
    const pane = await $('[data-testid="agent-pane"]');
    expect(await pane.isDisplayed()).toBe(true);
  });

  it('should display agent list header', async () => {
    const header = await $('[data-testid="agent-pane-header"]');
    expect(await header.isDisplayed()).toBe(true);
    expect(await header.getText()).toContain('Agents');
  });

  it('should show available agents', async () => {
    const agentList = await $('[data-testid="agent-list"]');
    expect(await agentList.isDisplayed()).toBe(true);
  });

  it('should display agent cards', async () => {
    const agentCards = await $$('[data-testid^="agent-card-"]');
    expect(agentCards.length).toBeGreaterThan(0);
  });

  it('should show agent spawn button', async () => {
    const spawnButton = await $('[data-testid="spawn-agent-button"]');
    expect(await spawnButton.isDisplayed()).toBe(true);
  });

  it('should display agent status indicators', async () => {
    const statusIndicator = await $('[data-testid="agent-status"]');
    expect(await statusIndicator.isDisplayed()).toBe(true);
  });

  it('should handle agent selection', async () => {
    const firstAgent = await $('[data-testid^="agent-card-"]');
    await firstAgent.click();

    const detailsPanel = await $('[data-testid="agent-details"]');
    expect(await detailsPanel.isDisplayed()).toBe(true);
  });

  it('should show agent capabilities', async () => {
    const capabilities = await $('[data-testid="agent-capabilities"]');
    expect(await capabilities.isDisplayed()).toBe(true);
  });

  it('should display active agent count', async () => {
    const activeCount = await $('[data-testid="active-agents-count"]');
    expect(await activeCount.isDisplayed()).toBe(true);
  });

  it('should not show error messages on load', async () => {
    const errorMessages = await $$('[data-testid*="error"]');
    expect(errorMessages.length).toBe(0);
  });
});
