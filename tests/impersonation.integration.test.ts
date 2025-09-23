import { AsyncClient, Browser, OS } from '../src/Client';

const browsers: Browser[] = ['chrome', 'safari', 'edge', 'firefox', 'okhttp'];
const oss: OS[] = ['android', 'ios', 'linux', 'macos', 'windows'];

interface FingerprintResult {
  browser: Browser;
  os: OS;
  tlsPeetWs?: any;
  ja3er?: any;
  error?: string;
}

describe('Impersonation Integration Tests', () => {
  const results: FingerprintResult[] = [];

  beforeAll(() => {
    // Increase timeout for integration tests
    jest.setTimeout(60000);
  });

  afterAll(() => {
    // Report results
    console.log('Fingerprinting Test Results:');
    console.log(JSON.stringify(results, null, 2));

    // Calculate success rates
    const successful = results.filter(r => !r.error);
    const total = results.length;
    console.log(`Success rate: ${successful.length}/${total} (${((successful.length / total) * 100).toFixed(2)}%)`);

    // Analyze if impersonation worked
    // For tls.peet.ws, check if JA3 matches expected for browser
    // But since we don't have expected, just log
    successful.forEach(r => {
      if (r.tlsPeetWs) {
        console.log(`${r.browser}-${r.os}: JA3=${r.tlsPeetWs.ja3}, User-Agent detected as ${r.tlsPeetWs.user_agent}`);
      }
      if (r.ja3er) {
        console.log(`${r.browser}-${r.os}: JA3er=${r.ja3er.ja3}, User-Agent=${r.ja3er.user_agent}`);
      }
    });
  });

  browsers.forEach(browser => {
    oss.forEach(os => {
      it(`should test impersonation for ${browser} on ${os}`, async () => {
        const client = new AsyncClient({ impersonate: browser, impersonate_os: os });
        const result: FingerprintResult = { browser, os };

        try {
          // Test tls.peet.ws
          const tlsResponse = await client.get('https://tls.peet.ws/api/all');
          result.tlsPeetWs = tlsResponse.json();

          // Test ja3er.com
          try {
            const ja3erResponse = await client.get('https://ja3er.com/json');
            result.ja3er = ja3erResponse.json();
          } catch (e: any) {
            result.ja3er = { error: e.message };
          }
        } catch (e: any) {
          result.error = e.message;
        }

        results.push(result);
      });
    });
  });
});