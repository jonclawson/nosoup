import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthStatus from '@/components/AuthStatus';
import { useSession, signOut } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('next/link', () => {
  return function LinkMock({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('@/components/SkeletonLine', () => {
  return function SkeletonLineMock() {
    return <div data-testid="skeleton-line">Loading...</div>;
  };
});

describe('AuthStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display skeleton loader when status is loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<AuthStatus />);
    expect(screen.getByTestId('skeleton-line')).toBeInTheDocument();
  });

  it('should display Profile link when user is authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    const profileLink = screen.getByRole('link', { name: /Profile/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/users/user-1');
  });

  it('should display Sign Out link when user is authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    expect(screen.getByRole('link', { name: /Sign Out/i })).toBeInTheDocument();
  });

  it('should have correct title attribute on Profile link', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    const profileLink = screen.getByRole('link', { name: /Profile/i });
    expect(profileLink).toHaveAttribute('title', 'John Doe');
  });

  it('should call signOut with correct callback when Sign Out link is clicked', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    const signOutLink = screen.getByRole('link', { name: /Sign Out/i });
    
    fireEvent.click(signOutLink);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/auth/login' });
    });
  });

  it('should display Sign In link when user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AuthStatus />);
    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should display Sign Up link when user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AuthStatus />);
    expect(screen.getByRole('link', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('should have correct href on Sign In link', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AuthStatus />);
    const signInLink = screen.getByRole('link', { name: /Sign In/i });
    expect(signInLink).toHaveAttribute('href', '/auth/login');
  });

  it('should have correct href on Sign Up link', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AuthStatus />);
    const signUpLink = screen.getByRole('link', { name: /Sign Up/i });
    expect(signUpLink).toHaveAttribute('href', '/auth/register');
  });

  it('should have correct styling classes on Profile link', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    const profileLink = screen.getByRole('link', { name: /Profile/i });
    expect(profileLink).toHaveClass('text-sm', 'text-gray-700', 'hover:text-gray-900');
  });

  it('should have correct styling classes on Sign Out link', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    const signOutLink = screen.getByRole('link', { name: /Sign Out/i });
    expect(signOutLink).toHaveClass('text-gray-600', 'hover:text-gray-900', 'px-3', 'py-2', 'rounded-md', 'text-sm', 'font-medium');
  });

  it('should have correct styling classes on Sign In link', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AuthStatus />);
    const signInLink = screen.getByRole('link', { name: /Sign In/i });
    expect(signInLink).toHaveClass('text-gray-600', 'hover:text-gray-900', 'px-3', 'py-2', 'rounded-md', 'text-sm', 'font-medium');
  });

  it('should have correct styling classes on Sign Up link', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AuthStatus />);
    const signUpLink = screen.getByRole('link', { name: /Sign Up/i });
    expect(signUpLink).toHaveClass('bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded-md', 'text-sm', 'font-medium', 'hover:bg-blue-700');
  });

  it('should display Profile and Sign Out links in a flex container when authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    const { container } = render(<AuthStatus />);
    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toHaveClass('flex', 'items-center', 'space-x-4');
  });

  it('should display Sign In and Sign Up links in a flex container when not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { container } = render(<AuthStatus />);
    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toHaveClass('flex', 'items-center', 'space-x-4');
  });

  it('should not display authenticated links when user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AuthStatus />);
    expect(screen.queryByRole('link', { name: /Profile/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Sign Out/i })).not.toBeInTheDocument();
  });

  it('should not display unauthenticated links when user is authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    expect(screen.queryByRole('link', { name: /Sign In/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Sign Up/i })).not.toBeInTheDocument();
  });

  it('should handle user with different id formats', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'uuid-with-dashes-12345',
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    const profileLink = screen.getByRole('link', { name: /Profile/i });
    expect(profileLink).toHaveAttribute('href', '/users/uuid-with-dashes-12345');
  });

  it('should handle user with special characters in name', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: "O'Brien-Smith",
          email: 'obrien@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    const profileLink = screen.getByRole('link', { name: /Profile/i });
    expect(profileLink).toHaveAttribute('title', "O'Brien-Smith");
  });

  it('should have href with # on Sign Out link', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<AuthStatus />);
    const signOutLink = screen.getByRole('link', { name: /Sign Out/i });
    expect(signOutLink).toHaveAttribute('href', '#');
  });

  it('should use useSession hook', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<AuthStatus />);
    expect(useSession).toHaveBeenCalled();
  });
});
