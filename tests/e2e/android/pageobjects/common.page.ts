class CommonPage {
  // Loading states - generic selectors
  get loadingSpinner() { return $('.animate-spin'); }
  get loadingText() { return $('p*=Loading'); }

  // Error states - generic error elements
  get errorIcon() { return $('div*=⚠️'); }
  get errorTitle() { return $('h3*=Failed'); }
  get errorMessage() { return $('p.text-center'); }
  get retryButton() { return $('button*=Retry'); }

  // Connection status (if implemented)
  get connectionIndicator() { return $('[data-testid="connection-indicator"]'); }
  get connectionStatus() { return $('[data-testid="connection-status"]'); }

  // Modals - generic modal selectors
  get modal() { return $('[role="dialog"]'); }
  get modalTitle() { return $('[role="dialog"] h2'); }
  get modalClose() { return $('[role="dialog"] button[aria-label*="Close"]'); }

  async waitForLoad(timeout = 10000) {
    try {
      await this.loadingSpinner.waitForDisplayed({ timeout: 2000 });
      await this.loadingSpinner.waitForDisplayed({ timeout, reverse: true });
    } catch {
      // Spinner may not appear for fast loads
    }
  }

  async dismissModal() {
    if (await this.modal.isDisplayed()) {
      await this.modalClose.click();
    }
  }

  async hasError() {
    try {
      return await this.errorIcon.isDisplayed();
    } catch {
      return false;
    }
  }

  async getErrorMessage() {
    if (await this.hasError()) {
      return await this.errorMessage.getText();
    }
    return '';
  }
}

export default new CommonPage();
