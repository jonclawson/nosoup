import { render, screen } from '@testing-library/react'
import ArticlesPage from '@/app/articles/page'
import { prisma } from '@/lib/prisma'

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock the ArticleList component
jest.mock('@/components/ArticleList', () => {
  return function MockArticleList({ articles }: { articles: any[] }) {
    return (
      <div data-testid="article-list">
        {articles.map((article) => (
          <div key={article.id} data-testid={`article-${article.id}`}>
            {article.title}
          </div>
        ))}
      </div>
    )
  }
})

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findMany: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('ArticlesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the page with articles', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Test Article 1',
        body: 'Test body 1',
        authorId: 'user1',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        author: {
          id: 'user1',
          name: 'Test User 1',
          email: 'test1@example.com'
        }
      },
      {
        id: '2',
        title: 'Test Article 2',
        body: 'Test body 2',
        authorId: 'user2',
        createdAt: new Date('2023-01-02T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        author: {
          id: 'user2',
          name: 'Test User 2',
          email: 'test2@example.com'
        }
      }
    ]

    mockPrisma.article.findMany.mockResolvedValue(mockArticles)

    const { container } = render(await ArticlesPage())

    // Check if the page title is rendered
    expect(screen.getByText('Articles')).toBeInTheDocument()
    
    // Check if the description is rendered
    expect(screen.getByText('A collection of articles from our community.')).toBeInTheDocument()
    
    // Check if the "Write Article" link is rendered
    const writeArticleLink = screen.getByText('Write Article')
    expect(writeArticleLink).toBeInTheDocument()
    expect(writeArticleLink.closest('a')).toHaveAttribute('href', '/articles/new')
    
    // Check if the ArticleList component is rendered with articles
    expect(screen.getByTestId('article-list')).toBeInTheDocument()
    expect(screen.getByTestId('article-1')).toBeInTheDocument()
    expect(screen.getByTestId('article-2')).toBeInTheDocument()
    
    // Verify Prisma was called with correct parameters
    expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  })

  it('should render the page with empty articles list', async () => {
    mockPrisma.article.findMany.mockResolvedValue([])

    const { container } = render(await ArticlesPage())

    // Check if the page title is rendered
    expect(screen.getByText('Articles')).toBeInTheDocument()
    
    // Check if the description is rendered
    expect(screen.getByText('A collection of articles from our community.')).toBeInTheDocument()
    
    // Check if the "Write Article" link is rendered
    expect(screen.getByText('Write Article')).toBeInTheDocument()
    
    // Check if the ArticleList component is rendered (even with empty articles)
    expect(screen.getByTestId('article-list')).toBeInTheDocument()
    
    // Verify Prisma was called
    expect(mockPrisma.article.findMany).toHaveBeenCalledTimes(1)
  })

  it('should handle database errors gracefully', async () => {
    mockPrisma.article.findMany.mockRejectedValue(new Error('Database error'))

    // The component should still render even if there's a database error
    // In a real scenario, you might want to add error handling
    await expect(ArticlesPage()).rejects.toThrow('Database error')
  })

  it('should serialize dates correctly', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Test Article',
        body: 'Test body',
        authorId: 'user1',
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z'),
        author: {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    ]

    mockPrisma.article.findMany.mockResolvedValue(mockArticles)

    const { container } = render(await ArticlesPage())

    // The ArticleList component should receive serialized articles
    expect(screen.getByTestId('article-list')).toBeInTheDocument()
    expect(screen.getByTestId('article-1')).toBeInTheDocument()
    
    // Verify the component renders without hydration issues
    expect(container).toMatchSnapshot()
  })

  it('should have correct styling classes', async () => {
    mockPrisma.article.findMany.mockResolvedValue([])

    const { container } = render(await ArticlesPage())

    // Check if the main container has the correct classes
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8')
    
    // Check if the header section has correct classes
    const headerSection = mainContainer.querySelector('.sm\\:flex.sm\\:items-center')
    expect(headerSection).toBeInTheDocument()
    
    // Check if the title has correct classes
    const title = screen.getByText('Articles')
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'text-gray-900')
    
    // Check if the description has correct classes
    const description = screen.getByText('A collection of articles from our community.')
    expect(description).toHaveClass('mt-2', 'text-sm', 'text-gray-700')
    
    // Check if the "Write Article" button has correct classes
    const writeArticleButton = screen.getByText('Write Article')
    expect(writeArticleButton.closest('a')).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'border',
      'border-transparent',
      'bg-blue-600',
      'px-4',
      'py-2',
      'text-sm',
      'font-medium',
      'text-white',
      'shadow-sm',
      'hover:bg-blue-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-2',
      'sm:w-auto'
    )
  })

  it('should pass correct props to ArticleList component', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Test Article',
        body: 'Test body',
        authorId: 'user1',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        author: {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    ]

    mockPrisma.article.findMany.mockResolvedValue(mockArticles)

    render(await ArticlesPage())

    // The ArticleList component should be rendered
    expect(screen.getByTestId('article-list')).toBeInTheDocument()
    
    // The article should be rendered within the ArticleList
    expect(screen.getByTestId('article-1')).toBeInTheDocument()
    expect(screen.getByText('Test Article')).toBeInTheDocument()
  })
}) 