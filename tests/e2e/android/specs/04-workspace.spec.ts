import homePage from '../pageobjects/home.page';
import workspacePage from '../pageobjects/workspace.page';
import createPage from '../pageobjects/create.page';
import commonPage from '../pageobjects/common.page';
import { expectVisible, expectLoadComplete } from '../helpers/assertions';

describe('Workspace Screen', () => {
  before(async () => {
    // Create a test project first
    await homePage.navigateToCreate();
    await createPage.enterProjectName('E2E Test Project');
    await createPage.selectTemplate(0);
    await createPage.createProject();
    await commonPage.waitForLoading();
  });

  after(async () => {
    await workspacePage.goBack();
  });

  it('should display workspace tabs', async () => {
    await expectVisible(workspacePage.bottomTabs);
  });

  it('should have all 5 bottom tabs', async () => {
    await expectVisible(workspacePage.agentTab);
    await expectVisible(workspacePage.consoleTab);
    await expectVisible(workspacePage.previewTab);
    await expectVisible(workspacePage.filesTab);
    await expectVisible(workspacePage.gitTab);
  });

  it('should switch to Agent pane', async () => {
    await workspacePage.switchToAgent();
    await expectVisible(workspacePage.paneContainer);
  });

  it('should switch to Console pane', async () => {
    await workspacePage.switchToConsole();
    await expectVisible(workspacePage.paneContainer);
  });

  it('should switch to Preview pane', async () => {
    await workspacePage.switchToPreview();
    await expectVisible(workspacePage.paneContainer);
  });

  it('should switch to Files pane', async () => {
    await workspacePage.switchToFiles();
    await expectVisible(workspacePage.paneContainer);
  });

  it('should switch to Git pane', async () => {
    await workspacePage.switchToGit();
    await expectVisible(workspacePage.paneContainer);
  });

  it('should show project title', async () => {
    await expectVisible(workspacePage.projectTitle);
  });

  it('should have back button', async () => {
    await expectVisible(workspacePage.backButton);
  });
});
