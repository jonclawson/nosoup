import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '@/components/Navigation';
import { useSession } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock useStateContext
jest.mock('@/contexts/StateContext', () => ({
  useStateContext: jest.fn(() => ({
    getSetting: jest.fn((key: string) => {
      if (key === 'navigation_articles_link') return 'articles';
      return null;
    }),
  })),
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ href, children, className }: any) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

// Mock SkeletonLine component
jest.mock('@/components/SkeletonLine', () => {
  return function MockSkeletonLine() {
    return <div data-testid="skeleton-line">Loading...</div>;
  };
});

// Mock Setting component
jest.mock('@/components/Setting', () => {
  return function MockSetting({ type, setting, children }: any) {
    return <div data-testid={`setting-${setting}`}>{children}</div>;
  };
});

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading skeleton when session is loading', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByTestId('skeleton-line')).toBeInTheDocument();
    });

    it('should render navigation container after loading', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { container } = render(<Navigation />);
      expect(container.querySelector('.nav')).toBeInTheDocument();
    });

    it('should have correct styling on main container', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { container } = render(<Navigation />);
      const mainDiv = container.querySelector('.nav');
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveClass('nav');
    });

    it('should not render skeleton when session is not loading', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.queryByTestId('skeleton-line')).not.toBeInTheDocument();
    });
  });

  describe('Articles Link', () => {
    it('should render articles link', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      const articlesLink = screen.getByRole('link', { name: /Articles/i });
      expect(articlesLink).toBeInTheDocument();
    });

    it('should have correct href for articles link', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      const articlesLink = screen.getByRole('link', { name: /Articles/i }) as HTMLAnchorElement;
      expect(articlesLink.href).toContain('/articles');
    });

    it('should have correct styling on articles link', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      const articlesLink = screen.getByRole('link', { name: /Articles/i });
      expect(articlesLink).toHaveClass('nav__link');
    });

    it('should use Setting component for articles link text', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByTestId('setting-navigation_articles_link')).toBeInTheDocument();
    });

    it('should always render articles link regardless of auth status', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'user',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
    });

    it('should render articles link for non-admin users', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'user',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
    });
  });

  describe('Users Link - Admin Only', () => {
    it('should not render users link when not authenticated', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
    });

    it('should not render users link for non-admin users', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'user',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
    });

    it('should render users link for admin users', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    });

    it('should have correct href for users link', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      const usersLink = screen.getByRole('link', { name: 'Users' }) as HTMLAnchorElement;
      expect(usersLink.href).toContain('/users');
    });

    it('should have correct styling on users link', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      const usersLink = screen.getByRole('link', { name: 'Users' });
      expect(usersLink).toHaveClass('nav__link');
    });

    it('should render both articles and users links for admin', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    });
  });

  describe('Session Status Handling', () => {
    it('should handle loading status correctly', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByTestId('skeleton-line')).toBeInTheDocument();
    });

    it('should handle unauthenticated status correctly', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
    });

    it('should handle authenticated status correctly', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'user',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
    });
  });

  describe('useSession Hook', () => {
    it('should call useSession hook', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(useSession).toHaveBeenCalled();
    });

    it('should destructure data, status, and update from useSession', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: { id: 'user-123', email: 'user@example.com', role: 'user' },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(useSession).toHaveBeenCalled();
    });

    it('should handle missing user data', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
    });
  });

  describe('User Role Checking', () => {
    it('should check for admin role correctly', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'admin',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    });

    it('should not render users link for viewer role', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'viewer',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
    });

    it('should not render users link for moderator role', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'moderator',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
    });

    it('should handle undefined role gracefully', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
    });
  });

  describe('Session Data Variations', () => {
    it('should handle null session data', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
    });

    it('should handle session with minimal user data', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
    });

    it('should handle session with full user data', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            name: 'Admin User',
            image: 'https://example.com/image.jpg',
            role: 'admin',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    });

    it('should handle undefined user property in session', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          expires: '2024-12-31T23:59:59Z',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
    });
  });

  describe('Link Order', () => {
    it('should render articles link before users link for admin', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      const { container } = render(<Navigation />);
      const links = container.querySelectorAll('a');
      const articlesLink = Array.from(links).find(link => link.textContent?.includes('Articles'));
      const usersLink = Array.from(links).find(link => link.textContent?.includes('Users'));

      const articlesIndex = Array.from(links).indexOf(articlesLink as HTMLAnchorElement);
      const usersIndex = Array.from(links).indexOf(usersLink as HTMLAnchorElement);

      expect(articlesIndex).toBeLessThan(usersIndex);
    });
  });

  describe('Container Styling', () => {
    it('should have flex container with items-center class', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { container } = render(<Navigation />);
      const mainDiv = container.querySelector('.nav');
      expect(mainDiv).toHaveClass('nav');
    });

    it('should have flex container with space-x-4 class', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { container } = render(<Navigation />);
      const mainDiv = container.querySelector('.nav');
      expect(mainDiv).toHaveClass('nav');
    });
  });

  describe('Accessibility', () => {
    it('should have links with appropriate roles', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      const articlesLink = screen.getByRole('link', { name: /Articles/i });
      expect(articlesLink).toBeInTheDocument();
    });

    it('should have descriptive link text for accessibility', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toHaveAccessibleName();
      expect(screen.getByRole('link', { name: 'Users' })).toHaveAccessibleName();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user object', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {},
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
    });

    it('should handle session update function', () => {
      const mockUpdate = jest.fn();
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      });

      render(<Navigation />);
      expect(useSession).toHaveBeenCalled();
    });

    it('should render correctly with multiple re-renders', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { rerender } = render(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();

      rerender(<Navigation />);
      expect(screen.getByRole('link', { name: /Articles/i })).toBeInTheDocument();
    });
  });

  describe('Component Composition', () => {
    it('should use Setting component with correct props', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      const settingComponent = screen.getByTestId('setting-navigation_articles_link');
      expect(settingComponent).toBeInTheDocument();
      expect(settingComponent).toHaveTextContent('Articles');
    });

    it('should use SkeletonLine component during loading', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      render(<Navigation />);
      expect(screen.getByTestId('skeleton-line')).toBeInTheDocument();
    });

    it('should use Link component for articles navigation', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      const articlesLink = screen.getByRole('link', { name: /Articles/i }) as HTMLAnchorElement;
      expect(articlesLink.href).toContain('/articles');
    });

    it('should use Link component for users navigation when admin', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<Navigation />);
      const usersLink = screen.getByRole('link', { name: 'Users' }) as HTMLAnchorElement;
      expect(usersLink.href).toContain('/users');
    });
  });
});
