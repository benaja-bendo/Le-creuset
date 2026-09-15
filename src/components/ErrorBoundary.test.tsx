import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Bomb(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary fallback={<p>fallback</p>}>
        <p>children</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('children')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('renders the fallback instead of propagating when a child throws', () => {
    // React logs the caught error to the console by design; silence it so
    // the expected failure doesn't look like a broken test run.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      render(
        <ErrorBoundary fallback={<p>fallback</p>}>
          <Bomb />
        </ErrorBoundary>
      )
    ).not.toThrow();

    expect(screen.getByText('fallback')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('reports the caught error via onError', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <ErrorBoundary fallback={<p>fallback</p>} onError={onError}>
        <Bomb />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);

    consoleSpy.mockRestore();
  });
});
