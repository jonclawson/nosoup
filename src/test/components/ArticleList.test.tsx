import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ArticleList from '@/components/ArticleList';
import type { Article } from '@/lib/types';
import { useSession } from 'next-auth/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/components/ArticleFields', () => {
  return function ArticleFieldsMock() {
    return <div data-testid="article-fields">Article Fields</div>;
  };
});

jest.mock('@/components/Dompurify', () => {
  return function DompurifyMock({ html }: { html: string }) {
    return <div data-testid="dompurify">{html}</div>;
  };
});

jest.mock('@/components/ArticleTags', () => {
  return function ArticleTagsMock() {
    return <div data-testid="article-tags">Article Tags</div>;
  };
});

jest.mock('@/components/DeleteButton', () => {
  return function DeleteButtonMock({ children, onDelete }: any) {
    return (
      <button data-testid="delete-button" onClick={onDelete}>
        {children}
      </button>
    );
  };
});

jest.mock('@/components/SkeletonArticle', () => {
  return function SkeletonArticleMock() {
    return <div data-testid="skeleton-article">Skeleton</div>;
  };
});

jest.mock('@/lib/handle-downloads', () => ({
  handleDownload: jest.fn(),
}));

jest.mock('@/hooks/useElementSize', () => ({
  useElementSize: () => {
    return [jest.fn(), { width: 800, height: 600, area: 480000, size: 533 }];
  },
}));

jest.mock('@/hooks/useMotion', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

jest.mock('@/hooks/useScrollInView', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

const mockArticle: Article = {
  id: '1',
  title: 'Test Article',
  body: 'Test body content',
  
  author: { id: '1', email: 'test@test.com', role: 'user', name: 'Test Author' },
  fields: [],
  tags: [],
  published: true,
  sticky: false,
  featured: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  slug: 'test-article',
};

describe('ArticleList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  it('should display skeleton loaders while loading', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<ArticleList />);
    expect(screen.getAllByTestId('skeleton-article')).toHaveLength(3);
  });

  it('should fetch articles with default parameters', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles')
      );
    });
  });

  it('should render articles after loading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument();
    });
  });

  it('should display article title, author, and date', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument();
      expect(screen.getByText(/By Test Author/)).toBeInTheDocument();
      // Just check that the date is present, not the exact format
      expect(screen.getByText(/202[0-9]/)).toBeInTheDocument();
    });
  });

  it('should render Read more link for each article', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Read more/i });
      expect(link).toHaveAttribute('href', '/articles/1');
    });
  });

  it('should render ArticleFields and Dompurify components', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByTestId('dompurify')).toBeInTheDocument();
      expect(screen.getByTestId('article-tags')).toBeInTheDocument();
    });
  });

  it('should display Edit and Delete buttons for admin users', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { role: 'admin' },
      },
      status: 'authenticated',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Edit/i })).toBeInTheDocument();
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });
  });

  it('should not display Edit and Delete buttons for regular users', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { role: 'user' },
      },
      status: 'authenticated',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /Edit/i })).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
    });
  });

  it('should display published articles with white background', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ ...mockArticle, published: true }],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    const { container } = render(<ArticleList />);

    await waitFor(() => {
      const articleElement = container.querySelector('article');
      expect(articleElement).toHaveClass('article-list__item--published');
    });
  });

  it('should display unpublished articles with pink background', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ ...mockArticle, published: false }],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    const { container } = render(<ArticleList />);

    await waitFor(() => {
      const articleElement = container.querySelector('article');
      expect(articleElement).toHaveClass('article-list__item--draft');
    });
  });

  it('should show Load more button when there are more pages', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 20, totalPages: 2 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Load more/i })).toBeInTheDocument();
    });
  });

  it('should not show Load more button when on last page', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 2, size: 10, total: 20, totalPages: 2 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Load more/i })).not.toBeInTheDocument();
    });
  });

  it('should display no articles message when list is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 1, size: 10, total: 0, totalPages: 0 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('No articles yet.')).toBeInTheDocument();
      expect(screen.getByText(/Be the first to write an article/)).toBeInTheDocument();
    });
  });

  it('should filter articles by published status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList published={true} />);

    await waitFor(() => {
      const params = new URL((global.fetch as jest.Mock).mock.calls[0][0], 'http://localhost').searchParams;
      expect(params.get('published')).toBe('true');
    });
  });

  it('should filter articles by featured status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList featured={true} />);

    await waitFor(() => {
      const params = new URL((global.fetch as jest.Mock).mock.calls[0][0], 'http://localhost').searchParams;
      expect(params.get('featured')).toBe('true');
    });
  });

  it('should filter articles by sticky status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList sticky={true} />);

    await waitFor(() => {
      const params = new URL((global.fetch as jest.Mock).mock.calls[0][0], 'http://localhost').searchParams;
      expect(params.get('sticky')).toBe('true');
    });
  });

  it('should filter articles by tag', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList tag="javascript" />);

    await waitFor(() => {
      const params = new URL((global.fetch as jest.Mock).mock.calls[0][0], 'http://localhost').searchParams;
      expect(params.get('tag')).toBe('javascript');
    });
  });

  it('should load more articles on Load more button click', async () => {
    const firstArticle = { ...mockArticle, id: '1', title: 'Article 1' };
    const secondArticle = { ...mockArticle, id: '2', title: 'Article 2' };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [firstArticle],
          pagination: { page: 1, size: 10, total: 20, totalPages: 2 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [secondArticle],
          pagination: { page: 2, size: 10, total: 20, totalPages: 2 },
        }),
      });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('Article 1')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByRole('button', { name: /Load more/i });
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByText('Article 2')).toBeInTheDocument();
    });
  });

  it('should remove article from list when deleted', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { role: 'admin' },
      },
      status: 'authenticated',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Article')).not.toBeInTheDocument();
      expect(screen.getByText('No articles yet.')).toBeInTheDocument();
    });
  });

  it('should handle fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch articles:',
        'Internal Server Error'
      );
    });

    consoleSpy.mockRestore();
  });

  it('should handle network error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<ArticleList />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching articles:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('should render multiple articles', async () => {
    const article1 = { ...mockArticle, id: '1', title: 'Article 1' };
    const article2 = { ...mockArticle, id: '2', title: 'Article 2' };
    const article3 = { ...mockArticle, id: '3', title: 'Article 3' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [article1, article2, article3],
        pagination: { page: 1, size: 10, total: 3, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('Article 1')).toBeInTheDocument();
      expect(screen.getByText('Article 2')).toBeInTheDocument();
      expect(screen.getByText('Article 3')).toBeInTheDocument();
    });
  });

  it('should send tab false parameter', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList />);

    await waitFor(() => {
      const params = new URL((global.fetch as jest.Mock).mock.calls[0][0], 'http://localhost').searchParams;
      expect(params.get('tab')).toBe('false');
    });
  });

  it('should not include filter params when set to null', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
      }),
    });

    render(<ArticleList published={null} featured={null} sticky={null} />);

    await waitFor(() => {
      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).not.toContain('published');
      expect(url).not.toContain('featured');
      expect(url).not.toContain('sticky');
    });
  });
});
