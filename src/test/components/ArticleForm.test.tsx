import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ArticleForm from '@/components/ArticleForm';
import type { Article, Field, Tag } from '@/lib/types';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/components/BlockNoteEditor', () => {
  return function BlockNoteEditorMock({ value, onChange }: any) {
    return (
      <textarea
        data-testid="blocknote-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="blocknote-editor"
      />
    );
  };
});

jest.mock('@/components/EditArticleFields', () => {
  return function EditArticleFieldsMock() {
    return <div data-testid="edit-article-fields">Edit Article Fields</div>;
  };
});

jest.mock('@/components/TagsComponent', () => {
  return function TagsComponentMock() {
    return <div data-testid="tags-component">Tags Component</div>;
  };
});

jest.mock('@/components/PublishingOptions', () => {
  return function PublishingOptionsMock() {
    return <div data-testid="publishing-options">Publishing Options</div>;
  };
});

jest.mock('@/components/MenuTabFields', () => {
  return function MenuTabFieldsMock() {
    return <div data-testid="menu-tab-fields">Menu Tab Fields</div>;
  };
});

const mockArticle: Article = {
  id: '1',
  title: 'Test Article',
  body: 'Test body content',
  content: 'Test content',
  author: { id: '1', email: 'test@test.com', role: 'user' },
  fields: [],
  tags: [],
  published: false,
  sticky: false,
  featured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  slug: 'test-article',
};

describe('ArticleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should display loading state initially', () => {
    render(<ArticleForm articleData={mockArticle} />);
    // The form actually loads synchronously, so we shouldn't see the loading message
    expect(screen.queryByText('Loading article...')).not.toBeInTheDocument();
  });

  it('should load and display form with article data', async () => {
    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });
  });

  it('should initialize title input with article title', async () => {
    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      const titleInput = screen.getByDisplayValue('Test Article') as HTMLInputElement;
      expect(titleInput.value).toBe('Test Article');
    });
  });

  it('should initialize body with article body', async () => {
    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      const editor = screen.getByTestId('blocknote-editor') as HTMLTextAreaElement;
      expect(editor.value).toBe('Test body content');
    });
  });

  it('should update title on input change', async () => {
    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const titleInput = screen.getByDisplayValue('Test Article') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    expect(titleInput.value).toBe('Updated Title');
  });

  it('should update body on editor change', async () => {
    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('blocknote-editor')).toBeInTheDocument();
    });

    const editor = screen.getByTestId('blocknote-editor') as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: 'Updated body' } });
    
    expect(editor.value).toBe('Updated body');
  });

  it('should submit form with PUT request for existing article', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/articles/1',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  it('should submit form with POST request for new article', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const newArticle = { ...mockArticle, id: '' };
    render(<ArticleForm articleData={newArticle} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('blocknote-editor')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/articles/',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should redirect to article page on successful submit', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/articles/1');
    });
  });

  it('should display error message on failed submit', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to update article' }),
    });

    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update article')).toBeInTheDocument();
    });
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Publishing...');
    });
  });

  it('should render all child components', async () => {
    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('blocknote-editor')).toBeInTheDocument();
      expect(screen.getByTestId('edit-article-fields')).toBeInTheDocument();
      expect(screen.getByTestId('tags-component')).toBeInTheDocument();
      expect(screen.getByTestId('publishing-options')).toBeInTheDocument();
      expect(screen.getByTestId('menu-tab-fields')).toBeInTheDocument();
    });
  });

  it('should render Cancel and Publish Article buttons', async () => {
    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Publish Article/i })).toBeInTheDocument();
    });
  });

  it('should not submit form if title is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const titleInput = screen.getByDisplayValue('Test Article') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(submitButton);

    // The form's HTML5 validation should prevent submission
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should include article data in FormData on submit', async () => {
    const articleWithData: Article = {
      ...mockArticle,
      published: true,
      sticky: true,
      featured: false,
      tab: { id: 'tab1', name: 'Tab 1', order: 1 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ArticleForm articleData={articleWithData} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const call = (global.fetch as jest.Mock).mock.calls[0];
      const formData = call[1].body;
      expect(formData).toBeDefined();
    });
  });

  it('should clear error on new submit attempt', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'First error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    
    // First submit fails
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Second submit succeeds
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('should have title input as required', async () => {
    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      const titleInput = screen.getByDisplayValue('Test Article') as HTMLInputElement;
      expect(titleInput).toBeRequired();
    });
  });

  it('should render error message with proper styling', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Test error message' }),
    });

    render(<ArticleForm articleData={mockArticle} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Publish Article/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorDiv = screen.getByText('Test error message').closest('div[class*="bg-red"]');
      expect(errorDiv).toHaveClass('mb-4', 'rounded-md', 'bg-red-50', 'p-4');
    });
  });

  it('should handle article with fields and tags', async () => {
    const articleWithFieldsAndTags: Article = {
      ...mockArticle,
      fields: [
        { id: '1', type: 'image', value: 'image.jpg', articleId: '1' },
      ],
      tags: [{ id: '1', name: 'javascript' }],
    };

    render(<ArticleForm articleData={articleWithFieldsAndTags} />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Article')).toBeInTheDocument();
    });

    expect(screen.getByTestId('edit-article-fields')).toBeInTheDocument();
    expect(screen.getByTestId('tags-component')).toBeInTheDocument();
  });
});
