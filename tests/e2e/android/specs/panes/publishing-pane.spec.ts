import { waitForWebViewReady } from '../../helpers/assertions';

describe('Publishing Pane', () => {
  before(async () => {
    await waitForWebViewReady(30000);
  });

  it('should render publishing pane', async () => {
    const pane = await $('[data-testid="publishing-pane"]');
    expect(await pane.isDisplayed()).toBe(true);
  });

  it('should display publishing header', async () => {
    const header = await $('[data-testid="publishing-pane-header"]');
    expect(await header.isDisplayed()).toBe(true);
    expect(await header.getText()).toContain('Publish');
  });

  it('should show app name input', async () => {
    const appNameInput = await $('[data-testid="app-name-input"]');
    expect(await appNameInput.isDisplayed()).toBe(true);
  });

  it('should display version input', async () => {
    const versionInput = await $('[data-testid="version-input"]');
    expect(await versionInput.isDisplayed()).toBe(true);
  });

  it('should show platform selector', async () => {
    const platformSelector = await $('[data-testid="platform-selector"]');
    expect(await platformSelector.isDisplayed()).toBe(true);
  });

  it('should display build configuration', async () => {
    const buildConfig = await $('[data-testid="build-configuration"]');
    expect(await buildConfig.isDisplayed()).toBe(true);
  });

  it('should show publish button', async () => {
    const publishButton = await $('[data-testid="publish-button"]');
    expect(await publishButton.isDisplayed()).toBe(true);
  });

  it('should display build status', async () => {
    const buildStatus = await $('[data-testid="build-status"]');
    expect(await buildStatus.isDisplayed()).toBe(true);
  });

  it('should show release notes input', async () => {
    const releaseNotes = await $('[data-testid="release-notes-input"]');
    expect(await releaseNotes.isDisplayed()).toBe(true);
  });

  it('should display publishing history', async () => {
    const history = await $('[data-testid="publishing-history"]');
    expect(await history.isDisplayed()).toBe(true);
  });

  it('should show distribution channels', async () => {
    const channels = await $('[data-testid="distribution-channels"]');
    expect(await channels.isDisplayed()).toBe(true);
  });

  it('should not show error messages on load', async () => {
    const errorMessages = await $$('[data-testid*="error"]');
    expect(errorMessages.length).toBe(0);
  });
});
