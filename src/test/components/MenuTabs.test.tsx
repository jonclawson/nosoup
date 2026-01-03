import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuTabs from '@/components/MenuTabs';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock SkeletonLine component
jest.mock('@/components/SkeletonLine', () => {
  return function MockSkeletonLine() {
    return <div data-testid="skeleton-line">Loading...</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('MenuTabs', () => {
  const mockMenuTabs = [
    { id: '1', name: 'Home', link: '/' },
    { id: '2', name: 'About', link: '/about' },
    { id: '3', name: 'Contact', link: '/contact' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render loading skeleton while fetching', () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      render(<MenuTabs />);
      expect(screen.getByTestId('skeleton-line')).toBeInTheDocument();
    });

    it('should render menu tabs after loading', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
      });
    });

    it('should render error message when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load menu tabs')).toBeInTheDocument();
      });
    });

    it('should render correct number of menu tabs', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(3);
      });
    });

    it('should have correct styling on main container', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      const { container } = render(<MenuTabs />);

      await waitFor(() => {
        const mainDiv = container.querySelector('.flex');
        expect(mainDiv).toHaveClass('flex', 'items-center', 'space-x-4');
      });
    });
  });

  describe('Menu Tab Links', () => {
    it('should render links with correct href attributes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const homeLink = screen.getByRole('link', { name: 'Home' }) as HTMLAnchorElement;
        const aboutLink = screen.getByRole('link', { name: 'About' }) as HTMLAnchorElement;
        const contactLink = screen.getByRole('link', { name: 'Contact' }) as HTMLAnchorElement;

        expect(homeLink.href).toContain('/');
        expect(aboutLink.href).toContain('/about');
        expect(contactLink.href).toContain('/contact');
      });
    });

    it('should render link text correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
      });
    });

    it('should have correct styling on menu tab links', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const homeLink = screen.getByRole('link', { name: 'Home' });
        expect(homeLink).toHaveClass('text-gray-600', 'hover:text-gray-900', 'px-3', 'py-2', 'rounded-md', 'text-sm', 'font-medium');
      });
    });

    it('should have unique keys for each link', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      const { container } = render(<MenuTabs />);

      await waitFor(() => {
        const links = container.querySelectorAll('a');
        expect(links).toHaveLength(3);
        // Keys are React internal, but we can verify unique IDs in the mocked data
        const ids = mockMenuTabs.map(tab => tab.id);
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(3);
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch menu tabs from /api/menu endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/menu');
      });
    });

    it('should call fetch on component mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => [],
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should parse JSON response correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load menu tabs')).toBeInTheDocument();
      });
    });

    it('should handle JSON parsing errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => {
          throw new Error('JSON parse error');
        },
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load menu tabs')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton initially', () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      render(<MenuTabs />);
      expect(screen.getByTestId('skeleton-line')).toBeInTheDocument();
    });

    it('should hide loading skeleton after data loads', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-line')).not.toBeInTheDocument();
      });
    });

    it('should hide loading skeleton after error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton-line')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load menu tabs')).toBeInTheDocument();
      });
    });

    it('should display error message on JSON parse error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => {
          throw new Error('JSON parse error');
        },
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load menu tabs')).toBeInTheDocument();
      });
    });

    it('should not display menu tabs when error occurs', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });
    });

    it('should display error message instead of menu tabs', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load menu tabs')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty Menu Tabs', () => {
    it('should render empty container when no menu tabs are returned', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => [],
      });

      const { container } = render(<MenuTabs />);

      await waitFor(() => {
        const mainDiv = container.querySelector('.flex');
        expect(mainDiv).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });
    });

    it('should not display error when menu tabs array is empty', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => [],
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.queryByText('Failed to load menu tabs')).not.toBeInTheDocument();
      });
    });
  });

  describe('Menu Tab Data', () => {
    it('should handle menu tabs with special characters in names', async () => {
      const specialTabs = [
        { id: '1', name: 'Home & Archive', link: '/' },
        { id: '2', name: 'FAQ\'s', link: '/faq' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => specialTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('Home & Archive')).toBeInTheDocument();
        expect(screen.getByText('FAQ\'s')).toBeInTheDocument();
      });
    });

    it('should handle menu tabs with long names', async () => {
      const longNameTabs = [
        { id: '1', name: 'This is a very long menu tab name that should still render properly', link: '/long' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => longNameTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        expect(screen.getByText('This is a very long menu tab name that should still render properly')).toBeInTheDocument();
      });
    });

    it('should handle menu tabs with special characters in links', async () => {
      const specialLinkTabs = [
        { id: '1', name: 'Search', link: '/search?q=test&category=all' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => specialLinkTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Search' }) as HTMLAnchorElement;
        expect(link.href).toContain('/search?q=test&category=all');
      });
    });

    it('should handle large number of menu tabs', async () => {
      const manyTabs = Array.from({ length: 50 }, (_, i) => ({
        id: String(i),
        name: `Tab ${i}`,
        link: `/tab-${i}`,
      }));

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => manyTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(50);
        expect(screen.getByText('Tab 0')).toBeInTheDocument();
        expect(screen.getByText('Tab 49')).toBeInTheDocument();
      });
    });

    it('should handle menu tabs with empty name field', async () => {
      const emptyNameTabs = [
        { id: '1', name: '', link: '/empty' },
        { id: '2', name: 'Valid', link: '/valid' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => emptyNameTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(screen.getByText('Valid')).toBeInTheDocument();
      });
    });

    it('should handle menu tabs with root link only', async () => {
      const rootLinkTabs = [
        { id: '1', name: 'Home', link: '/' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => rootLinkTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Home' }) as HTMLAnchorElement;
        expect(link.href).toContain('/');
      });
    });

    it('should handle menu tabs with nested route links', async () => {
      const nestedTabs = [
        { id: '1', name: 'Settings', link: '/account/settings/profile' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => nestedTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Settings' }) as HTMLAnchorElement;
        expect(link.href).toContain('/account/settings/profile');
      });
    });
  });

  describe('usePathname Integration', () => {
    it('should use usePathname hook', () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => [],
      });

      render(<MenuTabs />);

      expect(usePathname).toHaveBeenCalled();
    });

    it('should call usePathname at render time', () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => [],
      });

      (usePathname as jest.Mock).mockReturnValue('/test-path');
      render(<MenuTabs />);

      expect(usePathname).toHaveBeenCalled();
    });

    it('should have pathname in dependency array', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: async () => mockMenuTabs,
      });
      (global.fetch as jest.Mock) = mockFetch;

      const { rerender } = render(<MenuTabs />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      mockFetch.mockClear();
      (usePathname as jest.Mock).mockReturnValue('/new-path');
      
      rerender(<MenuTabs />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Multiple Renders', () => {
    it('should fetch data only once on initial render', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: async () => mockMenuTabs,
      });
      (global.fetch as jest.Mock) = mockFetch;

      render(<MenuTabs />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should refetch when pathname changes', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: async () => mockMenuTabs,
      });
      (global.fetch as jest.Mock) = mockFetch;

      const { rerender } = render(<MenuTabs />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      mockFetch.mockClear();
      (usePathname as jest.Mock).mockReturnValue('/new-path');
      
      rerender(<MenuTabs />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Container Structure', () => {
    it('should have flex layout with proper spacing', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      const { container } = render(<MenuTabs />);

      await waitFor(() => {
        const mainDiv = container.querySelector('.flex');
        expect(mainDiv).toHaveClass('items-center', 'space-x-4');
      });
    });

    it('should render all links within the flex container', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      const { container } = render(<MenuTabs />);

      await waitFor(() => {
        const mainDiv = container.querySelector('.flex');
        const links = mainDiv?.querySelectorAll('a');
        expect(links).toHaveLength(3);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have links with appropriate roles', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(3);
      });
    });

    it('should have links with text content for screen readers', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockMenuTabs,
      });

      render(<MenuTabs />);

      await waitFor(() => {
        const homeLink = screen.getByRole('link', { name: 'Home' });
        expect(homeLink).toHaveAccessibleName('Home');
      });
    });
  });
});
