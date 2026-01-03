import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SiteName from '@/components/SiteName';
import { useSession } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react');

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

// Mock SkeletonLine component
jest.mock('@/components/SkeletonLine', () => {
  return function MockSkeletonLine() {
    return <div data-testid="skeleton-line">Loading...</div>;
  };
});

// Mock debounce utility
jest.mock('@/lib/debounce', () => ({
  useDebounce: (fn: any) => fn,
}));

// Mock fetch
global.fetch = jest.fn();

// Mock document.title
Object.defineProperty(document, 'title', {
  writable: true,
  value: 'Test',
});

describe('SiteName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    document.title = 'Test';
  });

  describe('Rendering and Loading', () => {
    it('should render SkeletonLine while loading', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<SiteName />);

      expect(screen.getByTestId('skeleton-line')).toBeInTheDocument();
    });

    it('should fetch site name on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/settings/site_name');
      });
    });

    it('should fetch site logo on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({ value: 'logo.png' }),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/settings/site_logo');
      });
    });

    it('should render site name after loading', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Custom Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(screen.getByText('My Custom Site')).toBeInTheDocument();
      });
    });

    it('should render site logo when available', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({ value: 'data:image/png;base64,iVBORw0KG' }),
      });

      render(<SiteName />);

      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'data:image/png;base64,iVBORw0KG');
      });
    });

    it('should display site name when logo is not available', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(screen.getByText('My Site')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when site name fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

      render(<SiteName />);

      await waitFor(() => {
        expect(screen.getByText('Error fetching site name')).toBeInTheDocument();
      });
    });

    it('should log error to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

      render(<SiteName />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching site name:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should not display error for logo fetch failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockRejectedValueOnce(new Error('Logo fetch failed'));

      render(<SiteName />);

      await waitFor(() => {
        expect(screen.getByText('My Site')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching site logo:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Site Name Editing', () => {
    it('should not show edit mode for unauthenticated users', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(screen.queryByDisplayValue('My Site')).not.toBeInTheDocument();
      });
    });

    it('should not show edit mode for non-admin authenticated users', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { name: 'User', role: 'user' } },
        status: 'authenticated',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(screen.queryByDisplayValue('My Site')).not.toBeInTheDocument();
      });
    });

    it('should show edit button for admin users', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { name: 'Admin', role: 'admin' } },
        status: 'authenticated',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        const button = screen.getByTitle('Edit Site Name');
        expect(button).toBeInTheDocument();
      });
    });

    it('should enter edit mode when edit button is clicked', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { name: 'Admin', role: 'admin' } },
        status: 'authenticated',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        const button = screen.getByTitle('Edit Site Name');
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('My Site')).toBeInTheDocument();
      });
    });

    it('should exit edit mode when blurred', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { name: 'Admin', role: 'admin' } },
        status: 'authenticated',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        const button = screen.getByTitle('Edit Site Name');
        fireEvent.click(button);
      });

      await waitFor(() => {
        const input = screen.getByDisplayValue('My Site');
        fireEvent.blur(input);
      });

      expect(screen.queryByDisplayValue('My Site')).not.toBeInTheDocument();
    });

    it('should use PUT method when site name exists', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { name: 'Admin', role: 'admin' } },
        status: 'authenticated',
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ value: 'My Site', key: 'site_name' }),
        })
        .mockResolvedValueOnce({
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ value: 'Updated Site' }),
        });

      render(<SiteName />);

      await waitFor(() => {
        const button = screen.getByTitle('Edit Site Name');
        fireEvent.click(button);
      });

      const input = await screen.findByDisplayValue('My Site');
      fireEvent.change(input, { target: { value: 'Updated Site' } });

      await waitFor(() => {
        const putCall = (global.fetch as jest.Mock).mock.calls.find(
          (call: any[]) => call[1]?.method === 'PUT'
        );
        expect(putCall).toBeDefined();
      });
    });

    it('should use POST method when site name does not exist', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { name: 'Admin', role: 'admin' } },
        status: 'authenticated',
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ value: 'New Site' }),
        });

      render(<SiteName />);

      await waitFor(() => {
        const button = screen.getByTitle('Edit Site Name');
        fireEvent.click(button);
      });

      const input = await screen.findByDisplayValue('NoSoup');
      fireEvent.change(input, { target: { value: 'New Site' } });

      await waitFor(() => {
        const postCall = (global.fetch as jest.Mock).mock.calls.find(
          (call: any[]) => call[1]?.method === 'POST'
        );
        expect(postCall).toBeDefined();
      });
    });

    it('should update document title when site name is fetched', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'New Title' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(document.title).toBe('New Title');
      });
    });
  });

  describe('Site Logo Editing', () => {
    it('should show logo upload input for admin users', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { name: 'Admin', role: 'admin' } },
        status: 'authenticated',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        const upload = document.querySelector('input[id="siteLogoUpload"]');
        expect(upload).toBeInTheDocument();
      });
    });

    it('should not show logo upload for non-admin users', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(document.querySelector('input[id="siteLogoUpload"]')).not.toBeInTheDocument();
      });
    });

    it('should handle file selection in logo upload', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { name: 'Admin', role: 'admin' } },
        status: 'authenticated',
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ value: 'My Site' }),
        })
        .mockResolvedValueOnce({
          json: async () => ({}),
        });

      render(<SiteName />);

      await waitFor(() => {
        const input = document.querySelector('input[id="siteLogoUpload"]') as HTMLInputElement;
        expect(input).toBeInTheDocument();
      });
    });
  });

  describe('Session Status', () => {
    it('should not show edit controls for unauthenticated users', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(screen.queryByTitle('Edit Site Name')).not.toBeInTheDocument();
      });
    });

    it('should show controls when user is authenticated admin', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { name: 'Admin', role: 'admin' } },
        status: 'authenticated',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        expect(screen.getByTitle('Edit Site Name')).toBeInTheDocument();
      });
    });
  });

  describe('Link Navigation', () => {
    it('should render link to home page', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'My Site' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      render(<SiteName />);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/');
      });
    });
  });

  describe('Props and State', () => {
    it('should render without props', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({ value: 'Default' }),
      }).mockResolvedValueOnce({
        json: async () => ({}),
      });

      expect(() => {
        render(<SiteName />);
      }).not.toThrow();
    });
  });
});
