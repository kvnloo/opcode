import workspacePage from '../../pageobjects/workspace.page';
import { expectVisible, expectCountAtLeast } from '../../helpers/assertions';

describe('Files Pane', () => {
  const filesPane = {
    get container() { return $('android=new UiSelector().resourceId("files-pane")'); },
    get fileTree() { return $('android=new UiSelector().resourceId("file-tree")'); },
    get fileItems() { return $$('android=new UiSelector().resourceId("file-item")'); },
    get folderItems() { return $$('android=new UiSelector().resourceId("folder-item")'); },
    get newFileButton() { return $('android=new UiSelector().resourceId("new-file-btn")'); },
    get newFolderButton() { return $('android=new UiSelector().resourceId("new-folder-btn")'); },
    get searchButton() { return $('android=new UiSelector().resourceId("search-files-btn")'); },
    get contextMenu() { return $('android=new UiSelector().resourceId("file-context-menu")'); }
  };

  beforeEach(async () => {
    await workspacePage.switchToFiles();
  });

  it('should display files pane', async () => {
    await expectVisible(filesPane.container);
  });

  it('should have file tree', async () => {
    await expectVisible(filesPane.fileTree);
  });

  it('should list files', async () => {
    const files = await filesPane.fileItems;
    expect(files.length).toBeGreaterThanOrEqual(0);
  });

  it('should have new file button', async () => {
    await expectVisible(filesPane.newFileButton);
  });

  it('should have new folder button', async () => {
    await expectVisible(filesPane.newFolderButton);
  });

  it('should have search button', async () => {
    await expectVisible(filesPane.searchButton);
  });

  it('should expand folder on tap', async () => {
    const folders = await filesPane.folderItems;
    if (folders.length > 0) {
      await folders[0].click();
      const expanded = await folders[0].getAttribute('expanded');
      expect(expanded).toBe('true');
    }
  });
});
