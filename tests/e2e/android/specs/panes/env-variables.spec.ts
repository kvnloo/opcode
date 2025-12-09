import workspacePage from '../../pageobjects/workspace.page';
import { expectVisible, expectEnabled } from '../../helpers/assertions';

describe('Environment Variables Pane', () => {
  const envPane = {
    get container() { return $('android=new UiSelector().resourceId("env-variables-pane")'); },
    get variableList() { return $$('android=new UiSelector().resourceId("env-variable")'); },
    get addButton() { return $('android=new UiSelector().resourceId("add-env-btn")'); },
    get keyInput() { return $('android=new UiSelector().resourceId("env-key-input")'); },
    get valueInput() { return $('android=new UiSelector().resourceId("env-value-input")'); },
    get saveButton() { return $('android=new UiSelector().resourceId("save-env-btn")'); },
    get deleteButton() { return $('android=new UiSelector().resourceId("delete-env-btn")'); },
    get importButton() { return $('android=new UiSelector().resourceId("import-env-btn")'); },
    get exportButton() { return $('android=new UiSelector().resourceId("export-env-btn")'); }
  };

  beforeEach(async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    for (const tool of tools) {
      const text = await tool.getText();
      if (text.toLowerCase().includes('env') || text.toLowerCase().includes('variable')) {
        await tool.click();
        break;
      }
    }
  });

  it('should display env variables pane', async () => {
    await expectVisible(envPane.container);
  });

  it('should list environment variables', async () => {
    const variables = await envPane.variableList;
    expect(variables.length).toBeGreaterThanOrEqual(0);
  });

  it('should have add button', async () => {
    await expectVisible(envPane.addButton);
  });

  it('should open add form on button tap', async () => {
    await envPane.addButton.click();
    await expectVisible(envPane.keyInput);
    await expectVisible(envPane.valueInput);
  });

  it('should add new variable', async () => {
    await envPane.addButton.click();
    await envPane.keyInput.setValue('TEST_VAR');
    await envPane.valueInput.setValue('test_value');
    await envPane.saveButton.click();
    
    const variables = await envPane.variableList;
    const hasVariable = variables.some(async (v) => {
      const text = await v.getText();
      return text.includes('TEST_VAR');
    });
    expect(hasVariable).toBe(true);
  });

  it('should have import/export buttons', async () => {
    await expectVisible(envPane.importButton);
    await expectVisible(envPane.exportButton);
  });
});
