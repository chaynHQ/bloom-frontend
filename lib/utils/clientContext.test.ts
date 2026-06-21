import { getClientContext } from './clientContext';

const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  androidTablet:
    'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  windowsEdge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  macFirefox: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
};

function mockNavigator(userAgent: string, maxTouchPoints = 0, language = 'en-GB') {
  Object.defineProperty(window, 'navigator', {
    value: { userAgent, maxTouchPoints, language },
    configurable: true,
  });
}

describe('getClientContext', () => {
  it('classifies an iPhone on Safari as mobile/iOS/Safari', () => {
    mockNavigator(UA.iphoneSafari);
    const ctx = getClientContext();
    expect(ctx.deviceType).toBe('mobile');
    expect(ctx.os).toBe('iOS');
    expect(ctx.browser).toBe('Safari');
  });

  it('classifies an Android phone on Chrome as mobile/Android/Chrome', () => {
    mockNavigator(UA.androidChrome);
    const ctx = getClientContext();
    expect(ctx.deviceType).toBe('mobile');
    expect(ctx.os).toBe('Android');
    expect(ctx.browser).toBe('Chrome');
  });

  it('classifies an Android device without "Mobile" as a tablet', () => {
    mockNavigator(UA.androidTablet);
    expect(getClientContext().deviceType).toBe('tablet');
  });

  it('detects Edge ahead of Chrome on Windows desktop', () => {
    mockNavigator(UA.windowsEdge);
    const ctx = getClientContext();
    expect(ctx.deviceType).toBe('desktop');
    expect(ctx.os).toBe('Windows');
    expect(ctx.browser).toBe('Edge');
  });

  it('treats a touch-enabled Macintosh UA as an iPad (tablet/iOS)', () => {
    mockNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 5);
    const ctx = getClientContext();
    expect(ctx.deviceType).toBe('tablet');
    expect(ctx.os).toBe('iOS');
  });

  it('includes the browser language and a timezone', () => {
    mockNavigator(UA.macFirefox, 0, 'fr-FR');
    const ctx = getClientContext();
    expect(ctx.browserLanguage).toBe('fr-FR');
    expect(ctx.os).toBe('macOS');
    expect(ctx.browser).toBe('Firefox');
    expect(typeof ctx.timezone).toBe('string');
  });
});
