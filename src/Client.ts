import * as https from 'https';
import * as http from 'http';

export interface Auth {
  username?: string;
  password?: string;
  token?: string;
}

export interface Proxy {
  host: string;
  port: number;
  auth?: Auth;
}

export interface SSL {
  rejectUnauthorized?: boolean;
  ca?: string;
  cert?: string;
  key?: string;
}

export type Browser = 'chrome' | 'safari' | 'edge' | 'firefox' | 'okhttp';
export type OS = 'android' | 'ios' | 'linux' | 'macos' | 'windows';

export interface ClientOptions {
  timeout?: number;
  headers?: Record<string, string>;
  auth?: Auth;
  proxy?: Proxy;
  cookies?: string;
  ssl?: SSL;
  userAgent?: string;
  impersonate?: Browser;
  impersonate_os?: OS;
}

export class Response {
  constructor(
    public status: number,
    public headers: Record<string, string | string[] | undefined>,
    public data: string
  ) {}

  json<T = any>(): T {
    return JSON.parse(this.data);
  }

  text(): string {
    return this.data;
  }
}

export class RequestError extends Error {
  constructor(message: string, public status?: number, public headers?: Record<string, string | string[] | undefined>) {
    super(message);
    this.name = 'RequestError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class Client {
  private defaultOptions: ClientOptions;

  constructor(options: ClientOptions = {}) {
    this.defaultOptions = options;
  }

  private static getImpersonationHeaders(impersonate?: Browser, impersonate_os?: OS): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!impersonate) return headers;

    // Define User-Agents and other headers based on browser and OS
    const userAgents: Record<Browser, Record<OS, string>> = {
      chrome: {
        android: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.80 Mobile/15E148 Safari/604.1',
        linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      safari: {
        android: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
        macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
        windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15'
      },
      edge: {
        android: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36 Edg/91.0.864.59',
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 EdgiOS/46.3.13 Mobile/15E148 Safari/604.1',
        linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
      },
      firefox: {
        android: 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/29.0 Mobile/15E148 Safari/605.1.15',
        linux: 'Mozilla/5.0 (X11; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0',
        macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0',
        windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0'
      },
      okhttp: {
        android: 'okhttp/4.9.0',
        ios: 'okhttp/4.9.0', // OkHttp is primarily for Android, but including for completeness
        linux: 'okhttp/4.9.0',
        macos: 'okhttp/4.9.0',
        windows: 'okhttp/4.9.0'
      }
    };

    const os = impersonate_os || 'windows'; // Default to windows if not specified
    headers['User-Agent'] = userAgents[impersonate][os];

    // Common headers for impersonation
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
    headers['Accept-Language'] = 'en-US,en;q=0.5';
    headers['Accept-Encoding'] = 'gzip, deflate, br';
    headers['DNT'] = '1';
    headers['Connection'] = 'keep-alive';
    headers['Upgrade-Insecure-Requests'] = '1';

    // Browser-specific headers
    if (impersonate === 'chrome' || impersonate === 'edge') {
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = 'none';
      headers['Sec-Fetch-User'] = '?1';
      headers['Sec-Ch-Ua'] = '" Not A;Brand";v="99", "Chromium";v="91", "Google Chrome";v="91"'; // Example for Chrome
      headers['Sec-Ch-Ua-Mobile'] = os === 'android' || os === 'ios' ? '?1' : '?0';
    } else if (impersonate === 'firefox') {
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = 'none';
      headers['Sec-Fetch-User'] = '?1';
    } else if (impersonate === 'safari') {
      // Safari has fewer Sec-Fetch headers
    }

    return headers;
  }

  get(url: string, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void {
    this.request('GET', url, undefined, options, callback);
  }

  post(url: string, data?: any, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void {
    this.request('POST', url, data, options, callback);
  }

  put(url: string, data?: any, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void {
    this.request('PUT', url, data, options, callback);
  }

  patch(url: string, data?: any, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void {
    this.request('PATCH', url, data, options, callback);
  }

  delete(url: string, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void {
    this.request('DELETE', url, undefined, options, callback);
  }

  head(url: string, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void {
    this.request('HEAD', url, undefined, options, callback);
  }

  options(url: string, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void {
    this.request('OPTIONS', url, undefined, options, callback);
  }

  private request(method: string, url: string, data?: any, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void {
    if (!callback) {
      throw new Error('Callback is required for Client');
    }

    const parsedUrl = new URL(url);
    const mergedOptions = { ...this.defaultOptions, ...options };
    const impersonationHeaders = Client.getImpersonationHeaders(mergedOptions.impersonate, mergedOptions.impersonate_os);
    const reqOptions: https.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers: { ...impersonationHeaders, ...mergedOptions.headers },
      timeout: mergedOptions.timeout || 5000,
    };

    // Handle auth
    if (mergedOptions.auth) {
      if (mergedOptions.auth.token) {
        (reqOptions.headers as any)['Authorization'] = `Bearer ${mergedOptions.auth.token}`;
      } else if (mergedOptions.auth.username && mergedOptions.auth.password) {
        const auth = Buffer.from(`${mergedOptions.auth.username}:${mergedOptions.auth.password}`).toString('base64');
        (reqOptions.headers as any)['Authorization'] = `Basic ${auth}`;
      }
    }

    // Cookies
    if (mergedOptions.cookies) {
      (reqOptions.headers as any)['Cookie'] = mergedOptions.cookies;
    }

    // SSL options
    if (mergedOptions.ssl) {
      reqOptions.rejectUnauthorized = mergedOptions.ssl.rejectUnauthorized;
      if (mergedOptions.ssl.ca) reqOptions.ca = mergedOptions.ssl.ca;
      if (mergedOptions.ssl.cert) reqOptions.cert = mergedOptions.ssl.cert;
      if (mergedOptions.ssl.key) reqOptions.key = mergedOptions.ssl.key;
    }

    // Proxy: Basic implementation; for full proxy support, consider using a proxy agent library
    // For now, skipping advanced proxy handling

    const req = (parsedUrl.protocol === 'https:' ? https : http).request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const response = new Response(res.statusCode!, res.headers, body);
        callback(null, response);
      });
    });

    req.on('error', (err) => {
      callback(new RequestError(err.message));
    });

    req.on('timeout', () => {
      req.destroy();
      callback(new TimeoutError('Request timeout'));
    });

      if (data) {
        if (typeof data === 'string') {
          req.write(data);
        } else {
          (reqOptions.headers as any)['Content-Type'] = 'application/json';
          req.write(JSON.stringify(data));
        }
      }
    req.end();
  }
}

export class AsyncClient {
  private defaultOptions: ClientOptions;

  constructor(options: ClientOptions = {}) {
    this.defaultOptions = options;
  }

  private static getImpersonationHeaders(impersonate?: Browser, impersonate_os?: OS): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!impersonate) return headers;

    // Define User-Agents and other headers based on browser and OS
    const userAgents: Record<Browser, Record<OS, string>> = {
      chrome: {
        android: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.80 Mobile/15E148 Safari/604.1',
        linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      safari: {
        android: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
        macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
        windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15'
      },
      edge: {
        android: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36 Edg/91.0.864.59',
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 EdgiOS/46.3.13 Mobile/15E148 Safari/604.1',
        linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
      },
      firefox: {
        android: 'Mozilla/5.0 (Android 10; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/29.0 Mobile/15E148 Safari/605.1.15',
        linux: 'Mozilla/5.0 (X11; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0',
        macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0',
        windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0'
      },
      okhttp: {
        android: 'okhttp/4.9.0',
        ios: 'okhttp/4.9.0', // OkHttp is primarily for Android, but including for completeness
        linux: 'okhttp/4.9.0',
        macos: 'okhttp/4.9.0',
        windows: 'okhttp/4.9.0'
      }
    };

    const os = impersonate_os || 'windows'; // Default to windows if not specified
    headers['User-Agent'] = userAgents[impersonate][os];

    // Common headers for impersonation
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
    headers['Accept-Language'] = 'en-US,en;q=0.5';
    headers['Accept-Encoding'] = 'gzip, deflate, br';
    headers['DNT'] = '1';
    headers['Connection'] = 'keep-alive';
    headers['Upgrade-Insecure-Requests'] = '1';

    // Browser-specific headers
    if (impersonate === 'chrome' || impersonate === 'edge') {
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = 'none';
      headers['Sec-Fetch-User'] = '?1';
      headers['Sec-Ch-Ua'] = '" Not A;Brand";v="99", "Chromium";v="91", "Google Chrome";v="91"'; // Example for Chrome
      headers['Sec-Ch-Ua-Mobile'] = os === 'android' || os === 'ios' ? '?1' : '?0';
    } else if (impersonate === 'firefox') {
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = 'none';
      headers['Sec-Fetch-User'] = '?1';
    } else if (impersonate === 'safari') {
      // Safari has fewer Sec-Fetch headers
    }

    return headers;
  }

  async get(url: string, options?: ClientOptions): Promise<Response> {
    return this.request('GET', url, undefined, options);
  }

  async post(url: string, data?: any, options?: ClientOptions): Promise<Response> {
    return this.request('POST', url, data, options);
  }

  async put(url: string, data?: any, options?: ClientOptions): Promise<Response> {
    return this.request('PUT', url, data, options);
  }

  async patch(url: string, data?: any, options?: ClientOptions): Promise<Response> {
    return this.request('PATCH', url, data, options);
  }

  async delete(url: string, options?: ClientOptions): Promise<Response> {
    return this.request('DELETE', url, undefined, options);
  }

  async head(url: string, options?: ClientOptions): Promise<Response> {
    return this.request('HEAD', url, undefined, options);
  }

  async options(url: string, options?: ClientOptions): Promise<Response> {
    return this.request('OPTIONS', url, undefined, options);
  }

  private async request(method: string, url: string, data?: any, options?: ClientOptions): Promise<Response> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const mergedOptions = { ...this.defaultOptions, ...options };
      const impersonationHeaders = AsyncClient.getImpersonationHeaders(mergedOptions.impersonate, mergedOptions.impersonate_os);
      const reqOptions: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method,
        headers: { ...impersonationHeaders, ...mergedOptions.headers },
        timeout: mergedOptions.timeout || 5000,
      };

      // Handle auth
      if (mergedOptions.auth) {
        if (mergedOptions.auth.token) {
          (reqOptions.headers as any)['Authorization'] = `Bearer ${mergedOptions.auth.token}`;
        } else if (mergedOptions.auth.username && mergedOptions.auth.password) {
          const auth = Buffer.from(`${mergedOptions.auth.username}:${mergedOptions.auth.password}`).toString('base64');
          (reqOptions.headers as any)['Authorization'] = `Basic ${auth}`;
        }
      }

      // Cookies
      if (mergedOptions.cookies) {
        (reqOptions.headers as any)['Cookie'] = mergedOptions.cookies;
      }

      // SSL options
      if (mergedOptions.ssl) {
        reqOptions.rejectUnauthorized = mergedOptions.ssl.rejectUnauthorized;
        if (mergedOptions.ssl.ca) reqOptions.ca = mergedOptions.ssl.ca;
        if (mergedOptions.ssl.cert) reqOptions.cert = mergedOptions.ssl.cert;
        if (mergedOptions.ssl.key) reqOptions.key = mergedOptions.ssl.key;
      }

      // Proxy: Basic implementation; for full proxy support, consider using a proxy agent library
      // For now, skipping advanced proxy handling

      // TODO: Implement TLS JA3/JA4 fingerprinting for impersonation
      // May require external libraries like 'tls-ja3' or custom TLS socket handling

      // TODO: Implement TLS JA3/JA4 fingerprinting for impersonation
      // May require external libraries like 'tls-ja3' or custom TLS socket handling

      const req = (parsedUrl.protocol === 'https:' ? https : http).request(reqOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          const response = new Response(res.statusCode!, res.headers, body);
          resolve(response);
        });
      });

      req.on('error', (err) => {
        reject(new RequestError(err.message, undefined, reqOptions.headers as any));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new TimeoutError('Request timeout'));
      });

      if (data) {
        if (typeof data === 'string') {
          req.write(data);
        } else {
          (reqOptions.headers as any)['Content-Type'] = 'application/json';
          req.write(JSON.stringify(data));
        }
      }
      req.end();
    });
  }
}