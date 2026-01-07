import "@testing-library/jest-dom";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Suppress warnings from Ant Design internal components immediately
// This must run before any test code executes
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = typeof args[0] === "string" ? args[0] : "";
  // Suppress act() warnings from Ant Design internal timers/effects
  if (message.includes("not wrapped in act")) {
    return;
  }
  // Suppress jsdom "Not implemented" for getComputedStyle (Ant Design Table scrollbar detection)
  if (message.includes("Not implemented: window.computedStyle")) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Configure React Testing Library for React 18
configure({
  // Increase async timeout for Ant Design components
  asyncUtilTimeout: 5000,
});

// Set React 18 act environment - this is required for proper act() behavior
// @ts-expect-error - global is not typed
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia for Ant Design components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo for Ant Design Anchor
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

// Mock window.getComputedStyle for Ant Design Table
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
  return originalGetComputedStyle(elt, pseudoElt);
};

// Mock ResizeObserver - prevents act() warnings from Ant Design's resize detection
class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver for lazy loading components
class IntersectionObserverMock {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}
window.IntersectionObserver = IntersectionObserverMock;
