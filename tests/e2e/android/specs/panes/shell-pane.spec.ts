import { waitForWebViewReady } from '../../helpers/assertions';

describe('Shell Pane', () => {
  before(async () => {
    await waitForWebViewReady(30000);
  });

  it('should render shell pane', async () => {
    const pane = await $('[data-testid="shell-pane"]');
    expect(await pane.isDisplayed()).toBe(true);
  });

  it('should display shell header', async () => {
    const header = await $('[data-testid="shell-pane-header"]');
    expect(await header.isDisplayed()).toBe(true);
    expect(await header.getText()).toContain('Shell');
  });

  it('should show terminal area', async () => {
    const terminalArea = await $('[data-testid="terminal-area"]');
    expect(await terminalArea.isDisplayed()).toBe(true);
  });

  it('should display command input', async () => {
    const commandInput = await $('[data-testid="shell-input"]');
    expect(await commandInput.isDisplayed()).toBe(true);
  });

  it('should show clear terminal button', async () => {
    const clearButton = await $('[data-testid="clear-terminal-button"]');
    expect(await clearButton.isDisplayed()).toBe(true);
  });

  it('should display terminal output', async () => {
    const outputArea = await $('[data-testid="terminal-output"]');
    expect(await outputArea.isDisplayed()).toBe(true);
  });

  it('should show command history', async () => {
    const historyButton = await $('[data-testid="command-history-button"]');
    expect(await historyButton.isDisplayed()).toBe(true);
  });

  it('should display working directory', async () => {
    const workingDir = await $('[data-testid="working-directory"]');
    expect(await workingDir.isDisplayed()).toBe(true);
  });

  it('should show shell session indicator', async () => {
    const sessionIndicator = await $('[data-testid="shell-session-status"]');
    expect(await sessionIndicator.isDisplayed()).toBe(true);
  });

  it('should handle command input focus', async () => {
    const commandInput = await $('[data-testid="shell-input"]');
    await commandInput.click();

    const isFocused = await commandInput.isFocused();
    expect(isFocused).toBe(true);
  });

  it('should display scrollable output', async () => {
    const scrollContainer = await $('[data-testid="terminal-scroll-container"]');
    expect(await scrollContainer.isDisplayed()).toBe(true);
  });

  it('should not show error messages on load', async () => {
    const errorMessages = await $$('[data-testid*="error"]');
    expect(errorMessages.length).toBe(0);
  });
});
