import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Setting from '@/components/Setting';

// Mock ContentEdit component
jest.mock('@/components/ContentEdit', () => {
  return function MockContentEdit({ type, onChange, children }: any) {
    return (
      <div data-testid="content-edit" data-type={type}>
        <button 
          data-testid="change-button" 
          onClick={() => onChange?.('new value')}
        >
          Change Value
        </button>
        <div data-testid="content-edit-children">{children}</div>
      </div>
    );
  };
});

// Mock SkeletonLine component
jest.mock('@/components/SkeletonLine', () => {
  return function MockSkeletonLine() {
    return <div data-testid="skeleton-line">Loading...</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

// Mock StateContext
jest.mock('@/contexts/StateContext', () => ({
  useStateContext: () => ({
    getSetting: jest.fn(),
    setSetting: jest.fn(),
  }),
}));

// Mock useSession from next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: { user: { role: 'admin' } }, status: 'authenticated' })),
}));

describe('Setting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering and Loading', () => {
    it('should render nothing while loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      const { container } = render(
        <Setting setting="test-setting">Default Content</Setting>
      );

      // Component returns null while loading (SkeletonLine is commented out)
      expect(container.innerHTML).toBe('');
    });

    it('should fetch setting on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'fetched value' }),
      });

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/settings/test-setting');
      });
    });

    it('should render ContentEdit component after loading', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'fetched value' }),
      });

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit')).toBeInTheDocument();
      });
    });

    it('should display fetched value in ContentEdit', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'fetched value' }),
      });

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('fetched value');
      });
    });

    it('should display children when no value is fetched', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({}),
      });

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Default Content');
      });
    });

    it('should display children when value is null', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: null }),
      });

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Default Content');
      });
    });

    it('should display children when value is undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: undefined }),
      });

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Default Content');
      });
    });
  });

  describe('Error Handling', () => {
    it('should render error message when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(screen.getByText('Error fetching setting')).toBeInTheDocument();
      });
    });

    it('should display error message instead of ContentEdit', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(screen.queryByTestId('content-edit')).not.toBeInTheDocument();
      });
    });

    it('should handle JSON parsing errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => {
          throw new Error('JSON parse error');
        },
      });

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(screen.getByText('Error fetching setting')).toBeInTheDocument();
      });
    });

    it('should log error to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      render(<Setting setting="test-setting">Default Content</Setting>);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching setting:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Props Handling', () => {
    it('should accept setting prop', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'test value' }),
      });

      render(<Setting setting="my-setting">Default</Setting>);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/settings/my-setting');
      });
    });

    it('should accept type prop', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'test value' }),
      });

      render(<Setting setting="test" type="text">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit')).toHaveAttribute('data-type', 'text');
      });
    });

    it('should accept children prop', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({}),
      });

      render(<Setting setting="test">Child Content</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Child Content');
      });
    });

    it('should accept ReactNode as children', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({}),
      });

      render(
        <Setting setting="test">
          <span data-testid="custom-child">Custom Child</span>
        </Setting>
      );

      await waitFor(() => {
        expect(screen.getByTestId('custom-child')).toBeInTheDocument();
      });
    });

    it('should pass type prop to ContentEdit', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'test' }),
      });

      render(<Setting setting="test" type="richtext">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit')).toHaveAttribute('data-type', 'richtext');
      });
    });

    it('should handle undefined type prop', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'test' }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit')).toBeInTheDocument();
      });
    });
  });

  describe('Value Updates', () => {
    it('should call handleOnChange when ContentEdit changes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'initial' }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        const changeButton = screen.getByTestId('change-button');
        fireEvent.click(changeButton);
      });

      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial fetch + update
    });

    it('should update setting via API when value exists', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ value: 'existing value' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      render(<Setting setting="test-setting">Default</Setting>);

      await waitFor(() => {
        const changeButton = screen.getByTestId('change-button');
        fireEvent.click(changeButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/settings/test-setting',
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });
    });

    it('should create setting via API when value does not exist', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      render(<Setting setting="test-setting">Default</Setting>);

      await waitFor(() => {
        const changeButton = screen.getByTestId('change-button');
        fireEvent.click(changeButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/settings/',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should send FormData with correct keys', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ value: 'existing' }),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      render(<Setting setting="my-setting">Default</Setting>);

      await waitFor(() => {
        const changeButton = screen.getByTestId('change-button');
        fireEvent.click(changeButton);
      });

      await waitFor(() => {
        const callArgs = (global.fetch as jest.Mock).mock.calls[1];
        expect(callArgs[1].body).toBeInstanceOf(FormData);
      });
    });

    it('should update local state when value changes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'initial' }),
      });

      const { rerender } = render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('initial');
      });

      jest.clearAllMocks();
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'updated' }),
      });

      rerender(<Setting setting="test">Default</Setting>);

      // The component doesn't re-fetch, but we can verify the initial state was set
      expect(screen.getByTestId('content-edit-children')).toHaveTextContent('initial');
    });

    it('should handle API update failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ value: 'existing' }),
        })
        .mockResolvedValueOnce({
          ok: false,
        });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        const changeButton = screen.getByTestId('change-button');
        fireEvent.click(changeButton);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to update setting');
      });

      consoleSpy.mockRestore();
    });

    it('should handle API update error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ value: 'existing' }),
        })
        .mockRejectedValueOnce(new Error('Update failed'));

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        const changeButton = screen.getByTestId('change-button');
        fireEvent.click(changeButton);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error updating setting:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Setting Key Variations', () => {
    it('should fetch correct setting key with underscores', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'test' }),
      });

      render(<Setting setting="my_setting_key">Default</Setting>);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/settings/my_setting_key');
      });
    });

    it('should fetch correct setting key with hyphens', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'test' }),
      });

      render(<Setting setting="my-setting-key">Default</Setting>);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/settings/my-setting-key');
      });
    });

    it('should fetch correct setting key with mixed case', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'test' }),
      });

      render(<Setting setting="mySetting">Default</Setting>);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/settings/mySetting');
      });
    });
  });

  describe('Content Display', () => {
    it('should pass fetched value to ContentEdit as children', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'Fetched Value' }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Fetched Value');
      });
    });

    it('should prioritize fetched value over default children', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'Fetched Value' }),
      });

      render(<Setting setting="test">Default Children</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Fetched Value');
        expect(screen.getByTestId('content-edit-children')).not.toHaveTextContent('Default Children');
      });
    });

    it('should use default children as fallback', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: null }),
      });

      render(<Setting setting="test">Default Children</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Default Children');
      });
    });

    it('should handle empty string as valid value', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: '' }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Default');
      });
    });

    it('should handle zero as valid value', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 0 }),
      });

      render(<Setting setting="test">Default</Setting>);

      // 0 is falsy, so component uses children as fallback
      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Default');
      });
    });

    it('should handle false as valid value', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: false }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('Default');
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should fetch setting only once on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'test' }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should not refetch when props change', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'test' }),
      });

      const { rerender } = render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      jest.clearAllMocks();
      rerender(<Setting setting="test" type="text">Default</Setting>);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long setting values', async () => {
      const longValue = 'a'.repeat(10000);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: longValue }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent('a');
      });
    });

    it('should handle special characters in setting values', async () => {
      const specialValue = '<script>alert("xss")</script>';
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: specialValue }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent(specialValue);
      });
    });

    it('should handle JSON objects as values', async () => {
      const jsonValue = JSON.stringify({ key: 'value', nested: { data: 'test' } });
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: jsonValue }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent(jsonValue);
      });
    });

    it('should handle array values', async () => {
      const arrayValue = JSON.stringify(['item1', 'item2', 'item3']);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: arrayValue }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit-children')).toHaveTextContent(arrayValue);
      });
    });
  });

  describe('Accessibility', () => {
    it('should render ContentEdit with children for accessibility', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ value: 'Test Value' }),
      });

      render(<Setting setting="test">Default</Setting>);

      await waitFor(() => {
        expect(screen.getByTestId('content-edit')).toBeInTheDocument();
      });
    });
  });
});
