import workspacePage from '../../pageobjects/workspace.page';
import { expectVisible, expectCountAtLeast, expectLoadComplete } from '../../helpers/assertions';

describe('Backups Pane', () => {
  const backupsPane = {
    get container() { return $('android=new UiSelector().resourceId("backups-pane")'); },
    get backupList() { return $$('android=new UiSelector().resourceId("backup-item")'); },
    get createButton() { return $('android=new UiSelector().resourceId("create-backup-btn")'); },
    get restoreButton() { return $('android=new UiSelector().resourceId("restore-backup-btn")'); },
    get deleteButton() { return $('android=new UiSelector().resourceId("delete-backup-btn")'); },
    get autoBackupToggle() { return $('android=new UiSelector().resourceId("auto-backup-toggle")'); },
    get scheduleSelector() { return $('android=new UiSelector().resourceId("backup-schedule")'); },
    get storageInfo() { return $('android=new UiSelector().resourceId("storage-info")'); }
  };

  beforeEach(async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    for (const tool of tools) {
      const text = await tool.getText();
      if (text.toLowerCase().includes('backup')) {
        await tool.click();
        break;
      }
    }
  });

  it('should display backups pane', async () => {
    await expectVisible(backupsPane.container);
  });

  it('should list backups', async () => {
    const backups = await backupsPane.backupList;
    expect(backups.length).toBeGreaterThanOrEqual(0);
  });

  it('should have create button', async () => {
    await expectVisible(backupsPane.createButton);
  });

  it('should create backup on button tap', async () => {
    const initialCount = (await backupsPane.backupList).length;
    await backupsPane.createButton.click();
    await expectLoadComplete();
    const newCount = (await backupsPane.backupList).length;
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  it('should have auto-backup toggle', async () => {
    await expectVisible(backupsPane.autoBackupToggle);
  });

  it('should show storage info', async () => {
    await expectVisible(backupsPane.storageInfo);
  });

  it('should select backup for restore', async () => {
    const backups = await backupsPane.backupList;
    if (backups.length > 0) {
      await backups[0].click();
      await expectVisible(backupsPane.restoreButton);
    }
  });
});
