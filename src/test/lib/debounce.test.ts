import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from '@/lib/debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Debouncing', () => {
    it('should delay function execution', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 500));

      act(() => {
        result.current('test');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith('test');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should only execute callback once after delay', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 300));

      act(() => {
        result.current('arg1');
        result.current('arg2');
        result.current('arg3');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg3');
    });

    it('should use the latest arguments when executing', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 200));

      act(() => {
        result.current('first');
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        result.current('second');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second');
    });

    it('should reset timer on each call', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 500));

      act(() => {
        result.current('call1');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        result.current('call2');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('call2');
    });
  });

  describe('Multiple Arguments', () => {
    it('should pass multiple arguments to callback', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 100));

      act(() => {
        result.current('arg1', 'arg2', 'arg3');
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('should handle multiple arguments with multiple calls', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 200));

      act(() => {
        result.current('first', 1, true);
        result.current('second', 2, false);
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second', 2, false);
    });
  });

  describe('Delay Variations', () => {
    it('should respect custom delay values', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 1000));

      act(() => {
        result.current('test');
      });

      act(() => {
        jest.advanceTimersByTime(999);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle zero delay', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 0));

      act(() => {
        result.current('test');
      });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(callback).toHaveBeenCalledWith('test');
    });

    it('should handle very small delay', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 1));

      act(() => {
        result.current('test');
      });

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(callback).toHaveBeenCalledWith('test');
    });
  });

  describe('Hook Dependency Changes', () => {
    it('should update callback when dependency changes', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { result, rerender } = renderHook(
        ({ callback, delay }) => useDebounce(callback, delay),
        { initialProps: { callback: callback1, delay: 200 } }
      );

      act(() => {
        result.current('test1');
      });

      rerender({ callback: callback2, delay: 200 });

      act(() => {
        result.current('test2');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('test2');
    });

    it('should recreate function when delay changes', () => {
      const callback = jest.fn();
      let renderCount = 0;

      const { result, rerender } = renderHook(
        ({ delay }) => {
          renderCount++;
          return useDebounce(callback, delay);
        },
        { initialProps: { delay: 200 } }
      );

      const initialFunction = result.current;

      rerender({ delay: 300 });

      const newFunction = result.current;

      // Delay change should create new function
      expect(initialFunction).not.toBe(newFunction);
    });
  });

  describe('Object and Complex Arguments', () => {
    it('should handle object arguments', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 100));

      const testObj = { key: 'value', nested: { prop: 'test' } };

      act(() => {
        result.current(testObj);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledWith(testObj);
    });

    it('should handle array arguments', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 100));

      const testArray = [1, 2, 3, 'test'];

      act(() => {
        result.current(testArray);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledWith(testArray);
    });

    it('should handle function arguments', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 100));

      const testFunc = jest.fn();

      act(() => {
        result.current(testFunc);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledWith(testFunc);
    });

    it('should handle null and undefined arguments', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 100));

      act(() => {
        result.current(null, undefined);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledWith(null, undefined);
    });
  });

  describe('Rapid Calls', () => {
    it('should handle rapid successive calls', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 500));

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current(`call${i}`);
        }
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('call9');
    });

    it('should handle calls with incrementing values', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 100));

      act(() => {
        result.current(1);
      });

      act(() => {
        jest.advanceTimersByTime(50);
        result.current(2);
      });

      act(() => {
        jest.advanceTimersByTime(50);
        result.current(3);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined delay', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, undefined));

      act(() => {
        result.current('test');
      });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      // With undefined delay, setTimeout uses default 0
      expect(callback).toHaveBeenCalledWith('test');
    });

    it('should handle callback that throws error', () => {
      const error = new Error('Callback error');
      const callback = jest.fn(() => {
        throw error;
      });

      const { result } = renderHook(() => useDebounce(callback, 100));

      act(() => {
        result.current('test');
      });

      expect(() => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      }).toThrow('Callback error');
    });

    it('should clear previous timeout when new call is made', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 500));

      act(() => {
        result.current('first');
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      act(() => {
        jest.advanceTimersByTime(250);
      });

      act(() => {
        result.current('second');
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('should return a memoized function', () => {
      const callback = jest.fn();
      const { result, rerender } = renderHook(
        () => useDebounce(callback, 200),
        { initialProps: undefined }
      );

      const firstFunction = result.current;

      // Same delay should return same function (memoized)
      rerender();
      const secondFunction = result.current;

      expect(firstFunction).toBe(secondFunction);
    });

    it('should still create timeout on mount', () => {
      const callback = jest.fn();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const { result } = renderHook(() => useDebounce(callback, 500));

      act(() => {
        result.current('test');
      });

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500);

      setTimeoutSpy.mockRestore();
    });
  });

  describe('Real World Usage Patterns', () => {
    it('should handle search input debouncing', () => {
      const searchCallback = jest.fn();
      const { result } = renderHook(() => useDebounce(searchCallback, 300));

      // Simulate user typing
      act(() => {
        result.current('t');
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current('te');
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current('tes');
      });

      act(() => {
        jest.advanceTimersByTime(100);
        result.current('test');
      });

      expect(searchCallback).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(searchCallback).toHaveBeenCalledTimes(1);
      expect(searchCallback).toHaveBeenCalledWith('test');
    });

    it('should handle window resize debouncing', () => {
      const resizeCallback = jest.fn();
      const { result } = renderHook(() => useDebounce(resizeCallback, 200));

      // Simulate multiple resize events
      act(() => {
        result.current(1920);
        result.current(1800);
        result.current(1600);
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(resizeCallback).toHaveBeenCalledTimes(1);
      expect(resizeCallback).toHaveBeenCalledWith(1600);
    });

    it('should handle form input with multiple field updates', () => {
      const submitCallback = jest.fn();
      const { result } = renderHook(() => useDebounce(submitCallback, 500));

      const formData = { name: '', email: '' };

      act(() => {
        formData.name = 'John';
        result.current(formData);
      });

      act(() => {
        jest.advanceTimersByTime(250);
        formData.email = 'john@example.com';
        result.current(formData);
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(submitCallback).toHaveBeenCalledTimes(1);
      expect(submitCallback).toHaveBeenCalledWith({ name: 'John', email: 'john@example.com' });
    });
  });

  describe('Multiple Debounced Functions', () => {
    it('should handle multiple independent debounced functions', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { result: result1 } = renderHook(() => useDebounce(callback1, 200));
      const { result: result2 } = renderHook(() => useDebounce(callback2, 300));

      act(() => {
        result1.current('first');
        result2.current('second');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(callback1).toHaveBeenCalledWith('first');
      expect(callback2).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(callback2).toHaveBeenCalledWith('second');
    });
  });

  describe('Return Value', () => {
    it('should return a function', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => useDebounce(callback, 200));

      expect(typeof result.current).toBe('function');
    });

    it('should return the same function with same dependencies', () => {
      const callback = jest.fn();
      const { result, rerender } = renderHook(
        () => useDebounce(callback, 200),
        { initialProps: undefined }
      );

      const firstReturn = result.current;

      rerender();

      const secondReturn = result.current;

      expect(firstReturn).toBe(secondReturn);
    });
  });
});
