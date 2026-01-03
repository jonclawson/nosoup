import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentEdit from '@/components/ContentEdit';
import { useSession } from 'next-auth/react';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('@/components/BlockNoteEditor', () => {
  return function DummyBlockNoteEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return (
      <div data-testid="mock-blocknote">
        <textarea
          data-testid="editor-textarea"
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  };
});

jest.mock('@/components/Dompurify', () => {
  return function DummyDompurify({ html }: { html: string }) {
    return <span data-testid="dompurify-content">{html}</span>;
  };
});

jest.mock('@/lib/debounce', () => ({
  useDebounce: (callback: (value: any) => void, delay: number) => {
    // For testing, execute immediately without debounce
    return (value: any) => callback(value);
  },
}));

describe('ContentEdit', () => {
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  describe('Display mode - Non-admin user', () => {
    it('should render content when not in edit mode', () => {
      render(
        <ContentEdit>
          <span>Test content</span>
        </ContentEdit>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should not show edit button for non-admin users', () => {
      render(
        <ContentEdit>
          <span>Test content</span>
        </ContentEdit>
      );

      const editButton = screen.queryByRole('button');
      expect(editButton).not.toBeInTheDocument();
    });

    it('should not display edit icon for non-admin users', () => {
      const { container } = render(
        <ContentEdit>
          <span>Test content</span>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should render paragraph content', () => {
      render(
        <ContentEdit>
          <p>HTML content</p>
        </ContentEdit>
      );

      expect(screen.getByText('HTML content')).toBeInTheDocument();
    });

    it('should render empty content when children is empty', () => {
      const { container } = render(<ContentEdit />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Display mode - Admin user', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'admin@test.com',
            role: 'admin',
            name: 'Admin User',
          },
        },
        status: 'authenticated',
      });
    });

    it('should display edit icon for admin users', () => {
      const { container } = render(
        <ContentEdit>
          <span>Test content</span>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-4', 'w-4', 'inline-block', 'text-blue-600');
    });

    it('should show content via Dompurify in display mode for admin', () => {
      render(
        <ContentEdit>
          <p>Test content</p>
        </ContentEdit>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should enter edit mode when edit icon is clicked', async () => {
      const { container } = render(
        <ContentEdit>
          <span>Test content</span>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        expect(screen.getByTestId('mock-blocknote')).toBeInTheDocument();
      });
    });

    it('should display Done button in edit mode', async () => {
      const { container } = render(
        <ContentEdit>
          <span>Test content</span>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
      });
    });

    it('should have Done button with correct styling', async () => {
      const { container } = render(
        <ContentEdit>
          <span>Test content</span>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Done' });
        expect(button).toHaveClass('ml-2', 'px-2', 'py-1', 'bg-blue-500', 'text-white', 'rounded');
      });
    });
  });

  describe('Edit mode - BlockNote editor (default)', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'admin@test.com',
            role: 'admin',
            name: 'Admin User',
          },
        },
        status: 'authenticated',
      });
    });

    it('should render BlockNoteEditor when edit icon is clicked', async () => {
      const { container } = render(
        <ContentEdit>
          Initial content
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        expect(screen.getByTestId('mock-blocknote')).toBeInTheDocument();
      });
    });

    it('should pass initial value to BlockNoteEditor', async () => {
      const { container } = render(
        <ContentEdit>
          Initial content
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea).toHaveValue('Initial content');
      });
    });

    it('should call onChange when editor value changes', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <ContentEdit onChange={onChange}>
          <p>Initial content</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea).toBeInTheDocument();
      });

      const textarea = screen.getByTestId('editor-textarea');
      fireEvent.change(textarea, { target: { value: 'Updated content' } });

      expect(onChange).toHaveBeenCalledWith('Updated content');
    });

    it('should exit edit mode when Done button is clicked', async () => {
      const { container } = render(
        <ContentEdit>
          Initial content
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
      });

      const doneButton = screen.getByRole('button', { name: 'Done' });
      fireEvent.click(doneButton);

      await waitFor(() => {
        expect(screen.getByText('Initial content')).toBeInTheDocument();
      });
    });

    it('should update content state when editor value changes', async () => {
      const { container } = render(
        <ContentEdit>
          Initial content
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea).toBeInTheDocument();
      });

      const textarea = screen.getByTestId('editor-textarea');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      const doneButton = screen.getByRole('button', { name: 'Done' });
      fireEvent.click(doneButton);

      await waitFor(() => {
        const content = screen.getByText('New content');
        expect(content).toBeInTheDocument();
      });
    });
  });

  describe('Edit mode - Text input (type="text")', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'admin@test.com',
            role: 'admin',
            name: 'Admin User',
          },
        },
        status: 'authenticated',
      });
    });

    it('should render text input when type is "text"', async () => {
      const { container } = render(
        <ContentEdit type="text">
          Initial content
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
      });
    });

    it('should render text input with correct initial value', async () => {
      const { container } = render(
        <ContentEdit type="text">
          Initial text
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('Initial text');
      });
    });

    it('should call onChange when text input value changes', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <ContentEdit type="text" onChange={onChange}>
          <p>Initial text</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Updated text' } });

      expect(onChange).toHaveBeenCalledWith('Updated text');
    });

    it('should not render BlockNoteEditor when type is "text"', async () => {
      const { container } = render(
        <ContentEdit type="text">
          <p>Initial text</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
      });

      expect(screen.queryByTestId('mock-blocknote')).not.toBeInTheDocument();
    });

    it('should exit text edit mode when Done button is clicked', async () => {
      const { container } = render(
        <ContentEdit type="text">
          Initial text
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
      });

      const doneButton = screen.getByRole('button', { name: 'Done' });
      fireEvent.click(doneButton);

      await waitFor(() => {
        expect(screen.getByText('Initial text')).toBeInTheDocument();
      });
    });
  });

  describe('Props handling', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'admin@test.com',
            role: 'admin',
            name: 'Admin User',
          },
        },
        status: 'authenticated',
      });
    });

    it('should handle optional onChange prop', () => {
      const { container } = render(
        <ContentEdit>
          <p>Content</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      expect(screen.getByTestId('mock-blocknote')).toBeInTheDocument();
    });

    it('should handle optional type prop', () => {
      render(
        <ContentEdit>
          Content
        </ContentEdit>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle optional children prop', () => {
      render(<ContentEdit />);

      const { container } = render(<ContentEdit />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should preserve object children in display mode', () => {
      const objectChild = <div data-testid="custom-object">Custom Object</div>;
      render(
        <ContentEdit>
          {objectChild}
        </ContentEdit>
      );

      expect(screen.getByTestId('custom-object')).toBeInTheDocument();
    });
  });

  describe('State management', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'admin@test.com',
            role: 'admin',
            name: 'Admin User',
          },
        },
        status: 'authenticated',
      });
    });

    it('should initialize state with children', () => {
      render(
        <ContentEdit>
          Initial value
        </ContentEdit>
      );

      expect(screen.getByText('Initial value')).toBeInTheDocument();
    });

    it('should toggle editing state when edit icon is clicked', async () => {
      const { container } = render(
        <ContentEdit>
          Content
        </ContentEdit>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        expect(screen.getByTestId('mock-blocknote')).toBeInTheDocument();
      });
    });

    it('should toggle editing state back when Done button is clicked', async () => {
      const { container } = render(
        <ContentEdit>
          Content
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
      });

      const doneButton = screen.getByRole('button', { name: 'Done' });
      fireEvent.click(doneButton);

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });
  });

  describe('Edit icon styling', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'admin@test.com',
            role: 'admin',
            name: 'Admin User',
          },
        },
        status: 'authenticated',
      });
    });

    it('should have correct SVG classes for edit icon', () => {
      const { container } = render(
        <ContentEdit>
          <p>Content</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4', 'inline-block', 'text-blue-600', 'hover:text-gray-900');
    });

    it('should be clickable', () => {
      const { container } = render(
        <ContentEdit>
          Content
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Content rendering with different content types', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
    });

    it('should render string content', () => {
      render(
        <ContentEdit>
          Plain text content
        </ContentEdit>
      );

      expect(screen.getByTestId('dompurify-content')).toBeInTheDocument();
    });

    it('should render HTML string content', () => {
      render(
        <ContentEdit>
          &lt;p&gt;HTML content&lt;/p&gt;
        </ContentEdit>
      );

      expect(screen.getByTestId('dompurify-content')).toBeInTheDocument();
    });

    it('should handle null content', () => {
      const { container } = render(
        <ContentEdit>
          {null}
        </ContentEdit>
      );

      // When content is null, container will have an empty fragment
      expect(container).toBeInTheDocument();
    });

    it('should handle empty string content', () => {
      render(
        <ContentEdit>
          
        </ContentEdit>
      );

      const { container } = render(<ContentEdit />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Authorization checks', () => {
    it('should not show edit UI for user without admin role', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'user@test.com',
            role: 'user',
            name: 'Regular User',
          },
        },
        status: 'authenticated',
      });

      const { container } = render(
        <ContentEdit>
          <p>Content</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should show edit UI only for admin role', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'admin@test.com',
            role: 'admin',
            name: 'Admin User',
          },
        },
        status: 'authenticated',
      });

      const { container } = render(
        <ContentEdit>
          <p>Content</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not show edit UI for unauthenticated users', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { container } = render(
        <ContentEdit>
          <p>Content</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });
  });

  describe('Debounce behavior', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            email: 'admin@test.com',
            role: 'admin',
            name: 'Admin User',
          },
        },
        status: 'authenticated',
      });
    });

    it('should call onChange through debounced handleChange in visual edit', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <ContentEdit onChange={onChange}>
          <p>Initial</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea).toBeInTheDocument();
      });

      const textarea = screen.getByTestId('editor-textarea');
      fireEvent.change(textarea, { target: { value: 'New content' } });

      expect(onChange).toHaveBeenCalledWith('New content');
    });

    it('should update state immediately without debounce in BlockNoteEditor onChange', async () => {
      const onChange = jest.fn();
      const { container } = render(
        <ContentEdit onChange={onChange}>
          <p>Initial</p>
        </ContentEdit>
      );

      const svg = container.querySelector('svg');
      fireEvent.click(svg!);

      await waitFor(() => {
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea).toBeInTheDocument();
      });

      const textarea = screen.getByTestId('editor-textarea');
      fireEvent.change(textarea, { target: { value: 'Content 1' } });
      fireEvent.change(textarea, { target: { value: 'Content 2' } });

      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });
});
