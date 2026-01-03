import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteButton from '@/components/DeleteButton';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('DeleteButton', () => {
  const mockRouter = { refresh: jest.fn(), push: jest.fn() };
  const mockConfirm = jest.fn();
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    window.confirm = mockConfirm;
    global.fetch = mockFetch as any;
  });

  describe('Rendering', () => {
    it('should render button element', () => {
      mockConfirm.mockReturnValue(false);
      render(<DeleteButton userId="test-id" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with default text "Delete"', () => {
      mockConfirm.mockReturnValue(false);
      render(<DeleteButton userId="test-id" />);
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should render with custom children text', () => {
      mockConfirm.mockReturnValue(false);
      render(<DeleteButton userId="test-id">Remove Item</DeleteButton>);
      expect(screen.getByText('Remove Item')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      mockConfirm.mockReturnValue(false);
      render(<DeleteButton userId="test-id" className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should use default styling when no className provided', () => {
      mockConfirm.mockReturnValue(false);
      render(<DeleteButton userId="test-id" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-red-600', 'hover:text-red-900');
    });

    it('should have type="button"', () => {
      mockConfirm.mockReturnValue(false);
      render(<DeleteButton userId="test-id" />);
      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.type).toBe('button');
    });
  });

  describe('Delete functionality - User', () => {
    it('should show confirmation dialog for user deletion', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="user-123" resourceType="user" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
      });
    });

    it('should call DELETE endpoint for user', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="user-123" resourceType="user" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/users/user-123', { method: 'DELETE' });
      });
    });

    it('should call router.refresh() on success without onDelete', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="user-123" resourceType="user" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('should call onDelete callback on success', async () => {
      const onDelete = jest.fn();
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="user-123" resourceType="user" onDelete={onDelete} />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalled();
      });
    });

    it('should not make API call when cancelled', async () => {
      mockConfirm.mockReturnValue(false);

      render(<DeleteButton userId="user-123" resourceType="user" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalled();
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockConfirm.mockReturnValue(true);
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<DeleteButton userId="user-123" resourceType="user" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete user:', expect.any(Error));
      });
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Delete functionality - Article', () => {
    it('should show confirmation dialog for article deletion', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="article-456" resourceType="article" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this article?');
      });
    });

    it('should call DELETE endpoint for article', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="article-456" resourceType="article" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/articles/article-456', { method: 'DELETE' });
      });
    });

    it('should call router.refresh() on article delete success', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="article-456" resourceType="article" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('should call onDelete on article delete success', async () => {
      const onDelete = jest.fn();
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="article-456" resourceType="article" onDelete={onDelete} />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalled();
      });
    });

    it('should handle article delete errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockConfirm.mockReturnValue(true);
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<DeleteButton userId="article-456" resourceType="article" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete article:', expect.any(Error));
      });
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Default resourceType', () => {
    it('should default to user type when not specified', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="user-789" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/users/user-789', { method: 'DELETE' });
      });
    });

    it('should show user confirmation when resourceType not specified', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="user-789" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
      });
    });
  });

  describe('Props handling', () => {
    it('should accept various userId values', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="custom-id-123" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/users/custom-id-123', { method: 'DELETE' });
      });
    });

    it('should accept className prop', () => {
      mockConfirm.mockReturnValue(false);
      render(<DeleteButton userId="test-id" className="bg-red-500" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500');
      expect(button).not.toHaveClass('text-red-600');
    });

    it('should accept children prop', () => {
      mockConfirm.mockReturnValue(false);
      render(
        <DeleteButton userId="test-id">
          <span data-testid="custom">Custom Text</span>
        </DeleteButton>
      );
      expect(screen.getByTestId('custom')).toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('should be clickable', () => {
      mockConfirm.mockReturnValue(false);
      render(<DeleteButton userId="test-id" />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should trigger delete on click', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="test-id" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('should handle multiple clicks', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="test-id" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('API response handling', () => {
    it('should handle successful response', async () => {
      const onDelete = jest.fn();
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: true });

      render(<DeleteButton userId="test-id" onDelete={onDelete} />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalled();
      });
    });

    it('should not refresh on failed response', async () => {
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValue({ ok: false });

      render(<DeleteButton userId="test-id" />);
      fireEvent.click(screen.getByRole('button'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockRouter.refresh).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockConfirm.mockReturnValue(true);
      mockFetch.mockRejectedValue(new Error('Connection failed'));

      render(<DeleteButton userId="test-id" />);
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      mockConfirm.mockReturnValue(false);
      render(<DeleteButton userId="test-id" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should be visible to screen readers', () => {
      mockConfirm.mockReturnValue(false);
      const { container } = render(<DeleteButton userId="test-id">Delete</DeleteButton>);
      const button = container.querySelector('button');
      expect(button).toBeVisible();
    });
  });
});
