# TrimpTS

A TypeScript HTTP client library with browser impersonation capabilities for Node.js.

## Features

- **Browser Impersonation**: Mimic Chrome, Safari, Edge, Firefox, and OkHttp across different operating systems
- **TypeScript Support**: Full TypeScript definitions and type safety
- **Promise-based API**: Modern async/await support
- **Comprehensive HTTP Methods**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Authentication**: Support for Basic Auth and Bearer tokens
- **SSL/TLS**: Configurable SSL options including custom certificates
- **Cookies**: Automatic cookie handling
- **Timeouts**: Configurable request timeouts
- **Error Handling**: Robust error handling with custom error types

## Installation

```bash
npm install trimpts
```

## Quick Start

```typescript
import { AsyncClient } from 'trimpts';

// Create a client with browser impersonation
const client = new AsyncClient({
  impersonate: 'chrome',
  impersonate_os: 'windows'
});

// Make a simple GET request
const response = await client.get('https://api.example.com/users');
console.log(response.json());
```

## API Reference

### Client Classes

#### `AsyncClient`

Promise-based HTTP client with async/await support.

```typescript
const client = new AsyncClient(options);
```

#### `Client`

Callback-based HTTP client.

```typescript
const client = new Client(options);
```

### Client Options

```typescript
interface ClientOptions {
  timeout?: number;                    // Request timeout in milliseconds
  headers?: Record<string, string>;    // Custom headers
  auth?: {
    username?: string;
    password?: string;
    token?: string;
  };
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
  cookies?: string;                    // Cookie string
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
  userAgent?: string;                  // Custom User-Agent
  impersonate?: 'chrome' | 'safari' | 'edge' | 'firefox' | 'okhttp';
  impersonate_os?: 'android' | 'ios' | 'linux' | 'macos' | 'windows';
}
```

### HTTP Methods

All clients support the following methods:

- `get(url, options?)` - GET request
- `post(url, data?, options?)` - POST request
- `put(url, data?, options?)` - PUT request
- `patch(url, data?, options?)` - PATCH request
- `delete(url, options?)` - DELETE request
- `head(url, options?)` - HEAD request
- `options(url, options?)` - OPTIONS request

### Response Object

```typescript
interface Response {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  data: string;

  json<T = any>(): T;    // Parse JSON response
  text(): string;        // Get text response
}
```

### Error Types

- `RequestError` - General request errors
- `TimeoutError` - Request timeout errors

## Browser Impersonation

TrimpTS can impersonate various browsers and operating systems:

```typescript
// Chrome on Windows
const client = new AsyncClient({
  impersonate: 'chrome',
  impersonate_os: 'windows'
});

// Safari on macOS
const client = new AsyncClient({
  impersonate: 'safari',
  impersonate_os: 'macos'
});

// Firefox on Linux
const client = new AsyncClient({
  impersonate: 'firefox',
  impersonate_os: 'linux'
});
```

## Examples

### Basic Authentication

```typescript
const client = new AsyncClient({
  auth: {
    username: 'user',
    password: 'pass'
  }
});
```

### Bearer Token Authentication

```typescript
const client = new AsyncClient({
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Custom Headers and Timeout

```typescript
const response = await client.get('https://api.example.com/data', {
  headers: {
    'X-API-Key': 'your-api-key'
  },
  timeout: 10000
});
```

### POST with JSON Data

```typescript
const response = await client.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### SSL Configuration

```typescript
const client = new AsyncClient({
  ssl: {
    rejectUnauthorized: false,  // For self-signed certificates
    ca: fs.readFileSync('ca.pem'),
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem')
  }
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.