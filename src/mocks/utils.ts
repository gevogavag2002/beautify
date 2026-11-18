import type { AxiosRequestConfig } from 'axios';

// Reply tuple for axios-mock-adapter: [status, body]
export type Reply = [number, unknown];

export const ok = (body: unknown): Reply => [200, body];
export const created = (body: unknown): Reply => [201, body];
export const notFound = (message = 'Not found'): Reply => [404, { message }];
export const unauthorized = (): Reply => [401, { message: 'Unauthenticated' }];
export const validation = (errors: Record<string, string[]>): Reply => [
  422,
  { message: 'Validation failed', errors },
];

export const params = (config: AxiosRequestConfig) =>
  (config.params ?? {}) as Record<string, string | number | undefined>;

export const body = <T>(config: AxiosRequestConfig): T =>
  (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) as T;

// Path param from a URL matched by a RegExp route, e.g. /providers/([^/]+)
export const param = (config: AxiosRequestConfig, re: RegExp, index = 1) =>
  (config.url ?? '').match(re)?.[index] ?? '';

export { distanceKm } from '@/utils/geo';
