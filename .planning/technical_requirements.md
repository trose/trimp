# Technical Requirements for Trimp (TypeScript Port of Primp)

## Overview
Trimp is a TypeScript library that ports the functionality of the Python `primp` library, providing a high-performance HTTP client with browser impersonation capabilities to bypass anti-bot measures. It must mimic browser-specific headers, TLS fingerprints, and other characteristics.

## Core Functionality Requirements
- **HTTP Client Classes**:
  - `Client`: Synchronous HTTP client with methods: `get()`, `post()`, `put()`, `patch()`, `delete()`, `head()`, `options()`.
  - `AsyncClient`: Asynchronous version using Promises/async-await, with identical API.
  - Support for impersonation parameters: `impersonate` (browser version), `impersonate_os` (OS).

- **Impersonation Features**:
  - Mimic browsers: Chrome (versions 100–133), Safari (desktop/iOS/iPad), Edge, Firefox, OkHttp (Android).
  - OS support: Android, iOS, Linux, macOS, Windows.
  - Random impersonation option.
  - Spoof TLS JA3/JA4 fingerprints and HTTP/2 settings.

- **Request Handling**:
  - Parameters: auth (basic/Bearer), proxies, custom headers, cookies, timeouts, SSL verification.
  - Support for JSON, form data, multipart uploads, binary content.
  - Streaming responses.

- **Response Object**:
  - Attributes: `status`, `headers`, `cookies`, `url`, `encoding`, `content` (Uint8Array), `text` (string).
  - Methods: `json()`, `stream()`, `textMarkdown()`, `textPlain()`, `textRich()` (using HTML-to-text conversion).

- **Convenience Functions**:
  - Module-level functions: `get()`, `post()`, etc., using a default client.

- **Advanced Features**:
  - Persistent cookie stores.
  - Automatic Referer header.
  - Proxy support (HTTP/SOCKS5).
  - Custom CA certificates.
  - HTTP/1 or HTTP/2 only modes.
  - Environment variable support for proxies and CA bundles.

## Technical Specifications
- **Language**: TypeScript (ES2020+).
- **Runtime**: Node.js (primary), with potential browser support via fetch API.
- **Dependencies**:
  - Core: Node.js built-in `https`, `http`, `tls` modules or `fetch` polyfill.
  - For impersonation: Custom TLS fingerprinting library or integration with existing tools.
  - HTML-to-text: Library like `html-to-text`.
  - Proxies: `http-proxy-agent` or similar.
  - Cookies: `tough-cookie`.
  - Async: Native Promises.

- **Performance**: Aim for high performance, potentially using WebAssembly or native addons if needed, but start with pure JS/TS.

- **Type Safety**: Full TypeScript definitions for all APIs.

- **Error Handling**: Comprehensive error classes for network, SSL, timeout issues.

- **Testing**: Unit tests with Jest, integration tests for impersonation.

- **Build**: Use `tsc` for compilation, `npm` for packaging.

- **Compatibility**: Node.js 14+, browser environments with fetch support.

## Non-Functional Requirements
- **Security**: Handle sensitive data securely, no exposure of credentials.
- **Maintainability**: Modular code structure, clear separation of concerns.
- **Documentation**: Inline JSDoc, README with examples.
- **Licensing**: MIT, matching original.

## Dependencies and Ecosystem
- No runtime Python dependencies; all JS/TS native or npm packages.
- Build tools: `typescript`, `jest`, `eslint`.

## Edge Cases and Limitations
- Browser impersonation may require external fingerprinting data or libraries.
- Streaming and large responses handled efficiently.
- Respect rate limits and ethical use.