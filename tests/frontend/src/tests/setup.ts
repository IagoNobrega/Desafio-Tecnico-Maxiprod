import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock de fetch global se necessário
global.fetch = vi.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock de window.location e window.history
delete (global as any).window.location;
(global as any).window.location = {
  pathname: '/',
  href: 'http://localhost:5173/',
  origin: 'http://localhost:5173',
  protocol: 'http:',
  host: 'localhost:5173',
  hostname: 'localhost',
  port: '5173',
};

delete (global as any).window.history;
(global as any).window.history = {
  pushState: vi.fn(),
  replaceState: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  go: vi.fn(),
};
