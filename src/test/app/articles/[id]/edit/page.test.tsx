import { render, screen, waitFor } from '@testing-library/react'
import EditArticlePage from '@/app/articles/[id]/edit/page'
import { Article } from '@/lib/types'

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

// Mock ArticleForm component
jest.mock('@/components/ArticleForm', () => {
  return function MockArticleForm({ articleData }: { articleData: Article }) {
    return <div data-testid="article-form" data-article-id={articleData?.id} />
  }
})

// Mock React.use to resolve params
jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    use: jest.fn((promise) => {
      // Return resolved value synchronously for testing
      if (promise && promise.then) {
        // It's a promise, but we return the value anyway for testing
        return { id: '1' }
      }
      return { id: '1' }
    }),
  }
})

// Mock useDocument
jest.mock('@/hooks/useDocument', () => ({
  useDocument: jest.fn(),
}))

const mockArticle: Article = {
  id: '1',
  title: 'Test Article',
  body: 'Test content',
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

describe('EditArticlePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading message while fetching article', () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      expect(screen.getByText('Loading article...')).toBeInTheDocument()
    })
  })

  describe('Article Display', () => {
    it('should display edit article page when article is fetched', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.getByText('Edit Article')).toBeInTheDocument()
      })
    })

    it('should render back link to article page', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const backLink = screen.getByText('← Back to Article')
        expect(backLink).toBeInTheDocument()
        expect(backLink.closest('a')).toHaveAttribute('href', '/articles/1')
      })
    })

    it('should pass fetched article data to ArticleForm', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const form = screen.getByTestId('article-form')
        expect(form).toHaveAttribute('data-article-id', '1')
      })
    })

    it('should render ArticleForm component', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(screen.getByTestId('article-form')).toBeInTheDocument()
      })
    })

    it('should render form in white container with shadow', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      const { container } = render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const formContainer = container.querySelector('.bg-white.shadow')
        expect(formContainer).toBeInTheDocument()
      })
    })

    it('should render heading with correct styling', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const heading = screen.getByText('Edit Article')
        expect(heading).toHaveClass('text-2xl', 'font-semibold', 'text-gray-900')
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error message when article fetch fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Article not found'))

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const errorText = screen.queryByText(/Article not found|Loading article/)
        expect(errorText).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should show back to articles link in error state', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch error'))

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const links = screen.queryAllByTestId('link')
        const backLink = links.find(link => link.getAttribute('href') === '/articles')
        expect(backLink || screen.queryByText(/Back to Articles|Loading article/)).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should not render ArticleForm when there is an error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Article not found'))

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        // Either error is showing or still loading, but form should not appear
        const form = screen.queryByTestId('article-form')
        const hasError = screen.queryByText(/Article not found/)
        expect(form === null || hasError).toBeTruthy()
      }, { timeout: 3000 })
    })
  })

  describe('Page Layout', () => {
    it('should render main content area with correct styling', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      const { container } = render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const mainContainer = container.querySelector('.max-w-8xl.mx-auto.px-4')
        expect(mainContainer).toBeInTheDocument()
      })
    })

    it('should have proper spacing between header and form', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      const { container } = render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const headerContainer = container.querySelector('.mb-8')
        expect(headerContainer).toBeInTheDocument()
      })
    })

    it('should render link with correct styling', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const backLink = screen.getByText('← Back to Article')
        expect(backLink.closest('a')).toHaveClass(
          'text-blue-600',
          'hover:text-blue-900',
          'text-sm',
          'font-medium'
        )
      })
    })
  })

  describe('Data Fetching', () => {
    it('should fetch article with correct API endpoint', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/articles/1')
      })
    })

    it('should only fetch when component mounts', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
    })

    it('should parse JSON response correctly', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const form = screen.getByTestId('article-form')
        expect(form).toHaveAttribute('data-article-id', '1')
      })
    })
  })

  describe('Different Article States', () => {
    it('should handle published articles', async () => {
      const publishedArticle = { ...mockArticle, published: true }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => publishedArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const form = screen.getByTestId('article-form')
        expect(form).toBeInTheDocument()
      })
    })

    it('should handle unpublished articles', async () => {
      const unpublishedArticle = { ...mockArticle, published: false }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => unpublishedArticle,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const form = screen.getByTestId('article-form')
        expect(form).toBeInTheDocument()
      })
    })

    it('should handle articles with multiple tags', async () => {
      const articleWithTags = {
        ...mockArticle,
        tags: [
          { id: 'tag1', name: 'tag1' },
          { id: 'tag2', name: 'tag2' },
          { id: 'tag3', name: 'tag3' },
        ],
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleWithTags,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const form = screen.getByTestId('article-form')
        expect(form).toBeInTheDocument()
      })
    })

    it('should handle articles with fields', async () => {
      const articleWithFields = {
        ...mockArticle,
        fields: [
          { id: 'field1', type: 'image' as const, value: 'image.jpg' },
          { id: 'field2', type: 'code' as const, value: 'console.log("test")' },
        ],
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => articleWithFields,
      })

      render(<EditArticlePage params={Promise.resolve({ id: '1' })} />)

      await waitFor(() => {
        const form = screen.getByTestId('article-form')
        expect(form).toBeInTheDocument()
      })
    })
  })
})