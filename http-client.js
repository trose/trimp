const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

class Client {
  constructor(options = {}) {
    this.defaultHeaders = options.headers || {};
  }

  _request(method, urlStr, options = {}, callback) {
    const parsedUrl = url.parse(urlStr);
    const isHttps = parsedUrl.protocol === 'https:';
    const module = isHttps ? https : http;

    const params = options.params || {};
    const query = querystring.stringify(params);
    const path = parsedUrl.pathname + (query ? '?' + query : '');

    const headers = { ...this.defaultHeaders, ...options.headers };

    let body = options.body;
    if (body && typeof body === 'object') {
      body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: path,
      method: method.toUpperCase(),
      headers: headers
    };

    const req = module.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const response = {
          status: res.statusCode,
          headers: res.headers,
          content: data
        };
        callback(null, response);
      });
    });

    req.on('error', (err) => {
      callback(err, null);
    });

    if (body) {
      req.write(body);
    }

    req.end();
  }

  get(url, options, callback) {
    this._request('GET', url, options, callback);
  }

  post(url, options, callback) {
    this._request('POST', url, options, callback);
  }

  put(url, options, callback) {
    this._request('PUT', url, options, callback);
  }

  patch(url, options, callback) {
    this._request('PATCH', url, options, callback);
  }

  delete(url, options, callback) {
    this._request('DELETE', url, options, callback);
  }

  head(url, options, callback) {
    this._request('HEAD', url, options, callback);
  }

  options(url, options, callback) {
    this._request('OPTIONS', url, options, callback);
  }
}

class AsyncClient extends Client {
  constructor(options) {
    super(options);
  }

  _requestAsync(method, url, options) {
    return new Promise((resolve, reject) => {
      this._request(method, url, options, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }

  get(url, options) {
    return this._requestAsync('GET', url, options);
  }

  post(url, options) {
    return this._requestAsync('POST', url, options);
  }

  put(url, options) {
    return this._requestAsync('PUT', url, options);
  }

  patch(url, options) {
    return this._requestAsync('PATCH', url, options);
  }

  delete(url, options) {
    return this._requestAsync('DELETE', url, options);
  }

  head(url, options) {
    return this._requestAsync('HEAD', url, options);
  }

  options(url, options) {
    return this._requestAsync('OPTIONS', url, options);
  }
}

module.exports = { Client, AsyncClient };