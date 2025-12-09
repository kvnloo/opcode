import { waitForWebViewReady } from '../../helpers/assertions';

describe('Git Pane', () => {
  before(async () => {
    await waitForWebViewReady(30000);
  });

  it('should render git pane', async () => {
    const pane = await $('[data-testid="git-pane"]');
    expect(await pane.isDisplayed()).toBe(true);
  });

  it('should display git header', async () => {
    const header = await $('[data-testid="git-pane-header"]');
    expect(await header.isDisplayed()).toBe(true);
    expect(await header.getText()).toContain('Git');
  });

  it('should show current branch', async () => {
    const branchDisplay = await $('[data-testid="current-branch"]');
    expect(await branchDisplay.isDisplayed()).toBe(true);
  });

  it('should display changes section', async () => {
    const changesSection = await $('[data-testid="git-changes"]');
    expect(await changesSection.isDisplayed()).toBe(true);
  });

  it('should show commit button', async () => {
    const commitButton = await $('[data-testid="commit-button"]');
    expect(await commitButton.isDisplayed()).toBe(true);
  });

  it('should display commit message input', async () => {
    const commitInput = await $('[data-testid="commit-message-input"]');
    expect(await commitInput.isDisplayed()).toBe(true);
  });

  it('should show staged files list', async () => {
    const stagedFiles = await $('[data-testid="staged-files"]');
    expect(await stagedFiles.isDisplayed()).toBe(true);
  });

  it('should display unstaged files list', async () => {
    const unstagedFiles = await $('[data-testid="unstaged-files"]');
    expect(await unstagedFiles.isDisplayed()).toBe(true);
  });

  it('should show branch selector', async () => {
    const branchSelector = await $('[data-testid="branch-selector"]');
    expect(await branchSelector.isDisplayed()).toBe(true);
  });

  it('should display sync button', async () => {
    const syncButton = await $('[data-testid="git-sync-button"]');
    expect(await syncButton.isDisplayed()).toBe(true);
  });

  it('should show commit history', async () => {
    const historySection = await $('[data-testid="commit-history"]');
    expect(await historySection.isDisplayed()).toBe(true);
  });

  it('should not show error messages on load', async () => {
    const errorMessages = await $$('[data-testid*="error"]');
    expect(errorMessages.length).toBe(0);
  });
});
