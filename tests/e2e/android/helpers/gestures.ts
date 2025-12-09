export async function swipeUp(percentage = 0.5) {
  const { width, height } = await driver.getWindowSize();
  const startX = width / 2;
  const startY = height * 0.8;
  const endY = height * (0.8 - percentage);
  
  await driver.touchAction([
    { action: 'press', x: startX, y: startY },
    { action: 'wait', ms: 100 },
    { action: 'moveTo', x: startX, y: endY },
    { action: 'release' }
  ]);
}

export async function swipeDown(percentage = 0.5) {
  const { width, height } = await driver.getWindowSize();
  const startX = width / 2;
  const startY = height * 0.3;
  const endY = height * (0.3 + percentage);
  
  await driver.touchAction([
    { action: 'press', x: startX, y: startY },
    { action: 'wait', ms: 100 },
    { action: 'moveTo', x: startX, y: endY },
    { action: 'release' }
  ]);
}

export async function swipeLeft(percentage = 0.5) {
  const { width, height } = await driver.getWindowSize();
  const startX = width * 0.8;
  const endX = width * (0.8 - percentage);
  const y = height / 2;
  
  await driver.touchAction([
    { action: 'press', x: startX, y },
    { action: 'wait', ms: 100 },
    { action: 'moveTo', x: endX, y },
    { action: 'release' }
  ]);
}

export async function swipeRight(percentage = 0.5) {
  const { width, height } = await driver.getWindowSize();
  const startX = width * 0.2;
  const endX = width * (0.2 + percentage);
  const y = height / 2;
  
  await driver.touchAction([
    { action: 'press', x: startX, y },
    { action: 'wait', ms: 100 },
    { action: 'moveTo', x: endX, y },
    { action: 'release' }
  ]);
}

export async function longPress(element: WebdriverIO.Element, duration = 1000) {
  const location = await element.getLocation();
  const size = await element.getSize();
  const x = location.x + size.width / 2;
  const y = location.y + size.height / 2;
  
  await driver.touchAction([
    { action: 'press', x, y },
    { action: 'wait', ms: duration },
    { action: 'release' }
  ]);
}

export async function doubleTap(element: WebdriverIO.Element) {
  await element.click();
  await driver.pause(100);
  await element.click();
}

export async function pinchZoom(zoomIn = true) {
  const { width, height } = await driver.getWindowSize();
  const centerX = width / 2;
  const centerY = height / 2;
  const offset = zoomIn ? 100 : -100;
  
  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: centerX - offset, y: centerY },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 500, x: centerX - (zoomIn ? 0 : offset * 2), y: centerY },
        { type: 'pointerUp', button: 0 }
      ]
    },
    {
      type: 'pointer',
      id: 'finger2',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: centerX + offset, y: centerY },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 500, x: centerX + (zoomIn ? 0 : offset * 2), y: centerY },
        { type: 'pointerUp', button: 0 }
      ]
    }
  ]);
  await driver.releaseActions();
}

export async function scrollToElement(selector: string, maxScrolls = 5) {
  for (let i = 0; i < maxScrolls; i++) {
    try {
      const element = await $(selector);
      if (await element.isDisplayed()) {
        return element;
      }
    } catch {
      // Element not found yet
    }
    await swipeUp(0.3);
  }
  throw new Error(`Element ${selector} not found after ${maxScrolls} scrolls`);
}
