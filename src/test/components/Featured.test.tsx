import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Featured from '@/components/Featured';
import type { Article } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { handleDownload } from '@/lib/handle-downloads';

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

const mockArticle: Article = {
  id: '1',
  title: 'Test Article',
  body: 'Test body content',
  content: 'Test content',
  author: { id: '1', email: 'test@test.com', role: 'user', name: 'Test Author' },
  fields: [],
  tags: [],
  published: true,
  sticky: false,
  featured: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  slug: 'test-article',
};

describe('Featured', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  it('shows a single skeleton while loading', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    render(<Featured />);
    expect(screen.getAllByTestId('skeleton-article')).toHaveLength(1);
  });

  it('fetches articles with featured/tab and default filters', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 1, total: 1, totalPages: 1 },
      }),
    });

    render(<Featured />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/articles'));
      const params = new URL((global.fetch as jest.Mock).mock.calls[0][0], 'http://localhost').searchParams;
      expect(params.get('featured')).toBe('true');
      expect(params.get('tab')).toBe('false');
      expect(params.get('published')).toBe('true');
      expect(params.get('sticky')).toBe('true');
    });
  });

  it('renders article title, author, date and Read more link', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 1, total: 1, totalPages: 1 },
      }),
    });

    render(<Featured />);

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /more/i })).toHaveAttribute('href', '/articles/1');
    });
  });

  it('calls handleDownload when body wrapper is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 1, total: 1, totalPages: 1 },
      }),
    });

    render(<Featured />);

    await waitFor(() => {
      const dom = screen.getByTestId('dompurify');
      // Dompurify is wrapped in a clickable parent in the component
      fireEvent.click(dom.parentElement!);
      expect(handleDownload).toHaveBeenCalled();
    });
  });

  it('shows Edit and Delete for admin users', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'admin' } },
      status: 'authenticated',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 1, total: 1, totalPages: 1 },
      }),
    });

    render(<Featured />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Edit/i })).toBeInTheDocument();
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });
  });

  it('does not show Edit and Delete for regular users', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'user' } },
      status: 'authenticated',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 1, total: 1, totalPages: 1 },
      }),
    });

    render(<Featured />);

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /Edit/i })).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
    });
  });

  it('shows Next button and loads next page when clicked', async () => {
    const first = { ...mockArticle, id: '1', title: 'Article 1' };
    const second = { ...mockArticle, id: '2', title: 'Article 2' };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [first],
          pagination: { page: 1, size: 1, total: 2, totalPages: 2 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [second],
          pagination: { page: 2, size: 1, total: 2, totalPages: 2 },
        }),
      });

    render(<Featured />);

    await waitFor(() => {
      expect(screen.getByText('Article 1')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Article 2')).toBeInTheDocument();
    });
  });

  it('shows no articles message when list is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 1, size: 1, total: 0, totalPages: 0 },
      }),
    });

    render(<Featured />);

    await waitFor(() => {
      expect(screen.getByText('No articles yet.')).toBeInTheDocument();
      expect(screen.getByText(/Be the first to write an article/)).toBeInTheDocument();
    });
  });

  it('sends tag parameter when provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 1, total: 1, totalPages: 1 },
      }),
    });

    render(<Featured tag="javascript" />);

    await waitFor(() => {
      const params = new URL((global.fetch as jest.Mock).mock.calls[0][0], 'http://localhost').searchParams;
      expect(params.get('tag')).toBe('javascript');
    });
  });

  it('does not include filter params when set to null', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [mockArticle],
        pagination: { page: 1, size: 1, total: 1, totalPages: 1 },
      }),
    });

    render(<Featured published={null} sticky={null} />);

    await waitFor(() => {
      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      expect(url).not.toContain('published');
      expect(url).not.toContain('sticky');
    });
  });

  it('logs failure when response not ok', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    render(<Featured />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch articles:', 'Internal Server Error');
    });

    consoleSpy.mockRestore();
  });

  it('logs network error when fetch rejects', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Featured />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching articles:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
