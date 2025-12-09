import homePage from '../pageobjects/home.page';
import createPage from '../pageobjects/create.page';
import commonPage from '../pageobjects/common.page';
import { expectVisible, expectEnabled, expectDisabled } from '../helpers/assertions';

describe('Create Screen', () => {
  beforeEach(async () => {
    await homePage.navigateToCreate();
    await createPage.projectNameInput.waitForDisplayed();
  });

  afterEach(async () => {
    await homePage.navHome.click();
  });

  it('should display project name input', async () => {
    await expectVisible(createPage.projectNameInput);
  });

  it('should display template grid', async () => {
    await expectVisible(createPage.templateGrid);
  });

  it('should have templates available', async () => {
    const templates = await createPage.templates;
    expect(templates.length).toBeGreaterThan(0);
  });

  it('should disable create button when name is empty', async () => {
    await createPage.projectNameInput.clearValue();
    await expectDisabled(createPage.createProjectButton);
  });

  it('should enable create button with valid name', async () => {
    await createPage.enterProjectName('Test Project');
    await createPage.selectTemplate(0);
    await expectEnabled(createPage.createProjectButton);
  });

  it('should show error for invalid project name', async () => {
    await createPage.enterProjectName('');
    await createPage.createProjectButton.click();
    await expectVisible(createPage.errorMessage);
  });

  it('should cancel and return to home', async () => {
    await createPage.cancel();
    const isHome = await homePage.isLoaded();
    expect(isHome).toBe(true);
  });

  it('should select template on tap', async () => {
    await createPage.selectTemplate(0);
    const templates = await createPage.templates;
    const selected = await templates[0].getAttribute('selected');
    expect(selected).toBe('true');
  });
});
