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
export declare class Response {
    status: number;
    headers: Record<string, string | string[] | undefined>;
    data: string;
    constructor(status: number, headers: Record<string, string | string[] | undefined>, data: string);
    json<T = any>(): T;
    text(): string;
}
export declare class RequestError extends Error {
    status?: number | undefined;
    headers?: Record<string, string | string[] | undefined> | undefined;
    constructor(message: string, status?: number | undefined, headers?: Record<string, string | string[] | undefined> | undefined);
}
export declare class TimeoutError extends Error {
    constructor(message: string);
}
export declare class Client {
    private defaultOptions;
    constructor(options?: ClientOptions);
    private static getImpersonationHeaders;
    get(url: string, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void;
    post(url: string, data?: any, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void;
    put(url: string, data?: any, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void;
    patch(url: string, data?: any, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void;
    delete(url: string, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void;
    head(url: string, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void;
    options(url: string, options?: ClientOptions, callback?: (err: Error | null, response?: Response) => void): void;
    private request;
}
export declare class AsyncClient {
    private defaultOptions;
    constructor(options?: ClientOptions);
    private static getImpersonationHeaders;
    get(url: string, options?: ClientOptions): Promise<Response>;
    post(url: string, data?: any, options?: ClientOptions): Promise<Response>;
    put(url: string, data?: any, options?: ClientOptions): Promise<Response>;
    patch(url: string, data?: any, options?: ClientOptions): Promise<Response>;
    delete(url: string, options?: ClientOptions): Promise<Response>;
    head(url: string, options?: ClientOptions): Promise<Response>;
    options(url: string, options?: ClientOptions): Promise<Response>;
    private request;
}
//# sourceMappingURL=Client.d.ts.map