import { Client, AsyncClient } from '../src/Client';
import * as https from 'https';

jest.mock('https');
jest.mock('http');

const mockedHttps = jest.mocked(https);

describe('AsyncClient', () => {
  let client: AsyncClient;

  beforeEach(() => {
    client = new AsyncClient();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const client = new Client();
      expect(client).toBeInstanceOf(Client);
    });

    it('should initialize with provided options', () => {
      const options = { timeout: 10000, headers: { 'User-Agent': 'test' } };
      const client = new Client(options);
      expect(client).toBeInstanceOf(Client);
    });
  });

  describe('get', () => {
    it('should call request with GET method', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'data') cb('test data');
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      const result = await client.get('https://example.com');
      expect(mockedHttps.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET' }),
        expect.any(Function)
      );
      expect(result).toEqual({
        status: 200,
        headers: {},
        data: 'test data',
      });
    });
  });

  describe('post', () => {
    it('should call request with POST method and data', async () => {
      const mockWrite = jest.fn();
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 201,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'data') cb('created');
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: mockWrite,
          end: jest.fn(),
        } as any;
      });

      const data = { key: 'value' };
      const result = await client.post('https://example.com', data);
      expect(mockedHttps.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST' }),
        expect.any(Function)
      );
      expect(mockWrite).toHaveBeenCalledWith(JSON.stringify(data));
      expect(result).toEqual({
        status: 201,
        headers: {},
        data: 'created',
      });
    });
  });

  // Add similar tests for put, patch, delete, head, options

  describe('put', () => {
    it('should call request with PUT method', async () => {
      const mockWrite = jest.fn();
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 204,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: mockWrite,
          end: jest.fn(),
        } as any;
      });

      const data = 'data';
      const result = await client.put('https://example.com', data);
      expect(mockedHttps.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PUT' }),
        expect.any(Function)
      );
      expect(mockWrite).toHaveBeenCalledWith(data);
      expect(result).toEqual({
        status: 204,
        headers: {},
        data: '',
      });
    });
  });

  describe('patch', () => {
    it('should call request with PATCH method', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      const result = await client.patch('https://example.com');
      expect(mockedHttps.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'PATCH' }),
        expect.any(Function)
      );
      expect(result.status).toBe(200);
    });
  });

  describe('delete', () => {
    it('should call request with DELETE method', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      const result = await client.delete('https://example.com');
      expect(mockedHttps.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'DELETE' }),
        expect.any(Function)
      );
      expect(result.status).toBe(200);
    });
  });

  describe('head', () => {
    it('should call request with HEAD method', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: { 'content-type': 'text/html' },
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      const result = await client.head('https://example.com');
      expect(mockedHttps.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'HEAD' }),
        expect.any(Function)
      );
      expect(result).toEqual({
        status: 200,
        headers: { 'content-type': 'text/html' },
        data: '',
      });
    });
  });

  describe('options', () => {
    it('should call request with OPTIONS method', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: { allow: 'GET, POST' },
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      const result = await client.options('https://example.com');
      expect(mockedHttps.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'OPTIONS' }),
        expect.any(Function)
      );
      expect(result).toEqual({
        status: 200,
        headers: { allow: 'GET, POST' },
        data: '',
      });
    });
  });

  describe('impersonation', () => {
    it('should set impersonation headers for Chrome on Windows', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const options = args[0];
        expect(options.headers['User-Agent']).toContain('Chrome');
        expect(options.headers['Sec-Ch-Ua']).toBeDefined();
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      await client.get('https://example.com', { impersonate: 'chrome', impersonate_os: 'windows' });
    });

    it('should set impersonation headers for Firefox on Linux', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const options = args[0];
        expect(options.headers['User-Agent']).toContain('Firefox');
        expect(options.headers['Sec-Fetch-Dest']).toBe('document');
        expect(options.headers['Sec-Ch-Ua']).toBeUndefined(); // Firefox doesn't have Sec-Ch-Ua
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      await client.get('https://example.com', { impersonate: 'firefox', impersonate_os: 'linux' });
    });

    it('should set impersonation headers for Safari on macOS', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const options = args[0];
        expect(options.headers['User-Agent']).toContain('Safari');
        expect(options.headers['Sec-Fetch-Dest']).toBeUndefined(); // Safari has fewer Sec-Fetch
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      await client.get('https://example.com', { impersonate: 'safari', impersonate_os: 'macos' });
    });

    it('should set default OS to windows if not specified', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const options = args[0];
        expect(options.headers['User-Agent']).toContain('Windows NT 10.0');
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      await client.get('https://example.com', { impersonate: 'chrome' });
    });

    it('should allow overriding impersonation headers', async () => {
      mockedHttps.request.mockImplementation((...args: any[]) => {
        const options = args[0];
        expect(options.headers['User-Agent']).toBe('Custom UA');
        const callback = args.find(arg => typeof arg === 'function');
        const mockRes = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'end') cb();
          }),
        };
        if (callback) callback(mockRes);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
        } as any;
      });

      await client.get('https://example.com', { impersonate: 'chrome', headers: { 'User-Agent': 'Custom UA' } });
    });
  });
});