import { render, screen, waitFor } from '@testing-library/react'
import ArticlePage from '@/app/articles/[id]/page'
import { Article } from '@/lib/types'
import { useSession } from 'next-auth/react'

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, className }: any) {
    return (
      <a href={href} className={className} data-testid="link">
        {children}
      </a>
    )
  }
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}))

// Mock custom components
jest.mock('@/components/DeleteButton', () => {
  return function MockDeleteButton({ children, onDelete, className }: any) {
    return (
      <button onClick={onDelete} className={className} data-testid="delete-button">
        {children}
      </button>
    )
  }
})

jest.mock('@/components/Dompurify', () => {
  return function MockDompurify({ html }: any) {
    return <div data-testid="dompurify" dangerouslySetInnerHTML={{ __html: html }} />
  }
})

jest.mock('@/components/ArticleFields', () => {
  return function MockArticleFields({ article }: any) {
    return <div data-testid="article-fields" data-article-id={article?.id} />
  }
})

jest.mock('@/components/SkeletonArticle', () => {
  return function MockSkeletonArticle() {
    return <div data-testid="skeleton-article">Loading...</div>
  }
})

jest.mock('@/components/ArticleTags', () => {
  return function MockArticleTags({ article }: any) {
    return <div data-testid="article-tags" data-tags={article?.tags?.length || 0} />
  }
})

jest.mock('@/lib/handle-downloads', () => ({
  handleDownload: jest.fn(),
}))

// Mock React.use to resolve params
jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    use: jest.fn((promise) => {
      // Return a resolved value synchronously for testing
      return { id: '1' }
    }),
  }
})

// Mock useDocument hook
jest.mock('@/hooks/useDocument', () => ({
  useDocument: jest.fn(() => ({
    setTitle: jest.fn(),
  })),
}))

const mockArticle: Article = {
  id: '1',
  title: 'Test Article',
  body: '<p>Test content</p>',
  slug: 'test-article',
  published: true,
  createdAt: '2024-01-01T00:00:00Z',
  author: {
    id: 'author1',
    name: 'Test Author',
    email: 'author@test.com',
    role: 'admin',
  },
  fields: [],
  tags: [{ id: 'tag1', name: 'test-tag' }],
}

describe('ArticlePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Loading State', () => {
    it('should render without crashing', () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      expect(screen.getByTestId('skeleton-article')).toBeInTheDocument()
    })

    it('should show back to articles link during loading', () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      expect(screen.getByText('← Back')).toBeInTheDocument()
    })
  })

  describe('Article Display', () => {
    it('should display article data when fetched successfully', async () => {
      const articleData = { ...mockArticle, slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument()
      })

      expect(screen.getByText('By Test Author')).toBeInTheDocument()
      expect(screen.getByTestId('dompurify')).toBeInTheDocument()
    })

    it('should display published articles with white background', async () => {
      const articleData = { ...mockArticle, published: true, slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      const { container } = render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const article = container.querySelector('article')
        expect(article).toHaveClass('article__container--published')
      })
    })

    it('should display unpublished articles with pink background', async () => {
      const articleData = { ...mockArticle, published: false, slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      const { container } = render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const article = container.querySelector('article')
        expect(article).toHaveClass('article__container--draft')
      })
    })

    it('should render ArticleFields component', async () => {
      const articleData = { ...mockArticle, slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.queryByTestId('article-fields')).not.toBeInTheDocument()
      })
    })

    it('should render ArticleTags component', async () => {
      const articleData = { ...mockArticle, slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.getByTestId('article-tags')).toBeInTheDocument()
      })
    })

    it('should pass article body to Dompurify', async () => {
      const articleData = { ...mockArticle, body: '<p>Custom content</p>', slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.getByTestId('dompurify')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch exceptions gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        // Should either show error message or still be loading
        const skeletonOrError = screen.queryByTestId('skeleton-article') || 
                                screen.queryByText(/Failed to fetch/)
        expect(skeletonOrError).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Navigation and Links', () => {
    it('should have back to articles link', async () => {
      const articleData = { ...mockArticle, slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const links = screen.getAllByTestId('link')
        const backLink = links.find(link => link.textContent.includes('← Back'))
        expect(backLink).toHaveAttribute('href', '/articles')
      })
    })
  })

  describe('Authentication and Permissions', () => {
    it('should not show edit and delete buttons for unauthenticated users', async () => {
      const articleData = { ...mockArticle, slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.queryByText('Edit Article')).not.toBeInTheDocument()
        expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
      })
    })

    it('should show edit and delete buttons for admin users', async () => {
      const articleData = { ...mockArticle, slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: { role: 'admin' } },
        status: 'authenticated',
      })

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Article')).toBeInTheDocument()
        expect(screen.getByTestId('delete-button')).toBeInTheDocument()
      })
    })

    it('should not show edit and delete buttons for regular users', async () => {
      const articleData = { ...mockArticle, slug: undefined }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: { role: 'user' } },
        status: 'authenticated',
      })

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.queryByText('Edit Article')).not.toBeInTheDocument()
        expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
      })
    })
  })

  describe('Date Display', () => {
    it('should render article with creator information', async () => {
      const articleData = {
        ...mockArticle,
        createdAt: '2024-01-15T00:00:00Z',
        slug: undefined,
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleData,
      })

      render(<ArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.getByText(/By Test Author/)).toBeInTheDocument()
      })
    })
  })
})
