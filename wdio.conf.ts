import type { Options } from '@wdio/types';

// Set environment variables for Android SDK
process.env.ANDROID_HOME = process.env.ANDROID_HOME || '/home/kvn/android/sdk';
process.env.ANDROID_SDK_ROOT = process.env.ANDROID_SDK_ROOT || '/home/kvn/android/sdk';
process.env.PATH = `/home/kvn/android/sdk/platform-tools:${process.env.PATH}`;

export const config: Options.Testrunner = {
  runner: 'local',
  port: 4723,
  specs: ['./tests/e2e/android/**/*.spec.ts'],
  exclude: [],
  maxInstances: 1,

  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'R5CY93G2WNH', // Samsung device ID
    'appium:app': './src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'claudia.asterisk.so',
    'appium:appActivity': '.MainActivity',
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 240,
    'appium:autoGrantPermissions': true,
    // Enable automatic Chromedriver download for WebView automation
    'appium:chromedriverAutodownload': true,
  }],

  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // Connect to existing Appium server (started by run-e2e-tests.sh or manually)
  // Appium should be started with: appium --allow-insecure='*:chromedriver_autodownload'
  services: [],

  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  afterTest: async function(test, context, { error, result, duration, passed, retries }) {
    if (!passed) {
      await browser.saveScreenshot(`./screenshots/${test.title.replace(/\s/g, '_')}_${Date.now()}.png`);
    }
  },
};
