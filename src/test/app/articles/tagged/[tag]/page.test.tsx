import { render, screen } from '@testing-library/react'
import ArticlesPage from '@/app/articles/tagged/[tag]/page'

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock components
jest.mock('@/components/ArticleList', () => {
  return function MockArticleList({ tag }: { tag: string }) {
    return <div data-testid="article-list">ArticleList for {tag}</div>
  }
})

jest.mock('@/components/Setting', () => {
  return function MockSetting({ children, setting }: { children: React.ReactNode, setting: string }) {
    return <div data-testid={`setting-${setting}`}>{children}</div>
  }
})

// Mock React.use
jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    use: jest.fn(),
  }
})

describe('ArticlesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the page with the correct tag', async () => {
    const { useSession } = require('next-auth/react')
    const { use } = require('react')
    useSession.mockReturnValue({
      data: { user: { id: 1, name: 'Test User' } },
      status: 'authenticated',
    })

    use.mockReturnValue({ tag: 'test-tag' })

    const params = Promise.resolve({ tag: 'test-tag' })

    render(<ArticlesPage params={params} />)

    expect(screen.getByText('Articles tagged with test-tag')).toBeInTheDocument()
    expect(screen.getByText('A collection of articles tagged with test-tag from our community.')).toBeInTheDocument()
    expect(screen.getByTestId('article-list')).toHaveTextContent('ArticleList for test-tag')
    expect(screen.getByTestId('setting-articles_tagged_page_header')).toBeInTheDocument()
  })

  it('renders with a different tag', async () => {
    const { useSession } = require('next-auth/react')
    const { use } = require('react')
    useSession.mockReturnValue({
      data: { user: { id: 1, name: 'Test User' } },
      status: 'authenticated',
    })

    use.mockReturnValue({ tag: 'another-tag' })

    const params = Promise.resolve({ tag: 'another-tag' })

    render(<ArticlesPage params={params} />)

    expect(screen.getByText('Articles tagged with another-tag')).toBeInTheDocument()
    expect(screen.getByText('A collection of articles tagged with another-tag from our community.')).toBeInTheDocument()
    expect(screen.getByTestId('article-list')).toHaveTextContent('ArticleList for another-tag')
  })
})