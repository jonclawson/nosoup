import { render, screen } from '@testing-library/react'
import ArticlesPage from '@/app/articles/page'
import Link from 'next/link'
import ArticleList from '@/components/ArticleList'

// Mock next/link
jest.mock('next/link', () => {
  return function MockNextLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock ArticleList component
jest.mock('@/components/ArticleList', () => {
  return function MockArticleList() {
    return <div data-testid="article-list">Article List</div>
  }
})

// Mock Setting component
jest.mock('@/components/Setting', () => {
  return function MockSetting({children}: any) {
    return <div data-testid="setting">{children}</div>
  }
})

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: { user: { role: 'admin' } }, status: 'authenticated' })),
}))

// Mock useDocument hook
jest.mock('@/hooks/useDocument', () => ({
  useDocument: jest.fn(() => ({
    setTitle: jest.fn(),
  })),
}))

// Mock useStateContext
jest.mock('@/contexts/StateContext', () => ({
  useStateContext: jest.fn(() => ({
    getSetting: jest.fn(() => 'Articles'),
    setSetting: jest.fn(),
  })),
}))

describe('ArticlesPage', () => {
  it('should render the articles page correctly', () => {
    render(<ArticlesPage />)

    // Check the heading
    expect(screen.getByRole('heading', { name: /articles/i })).toBeInTheDocument()

    // Check the description
    expect(screen.getByText(/a collection of articles from our community/i)).toBeInTheDocument()

    // Check the link
    const link = screen.getByRole('link', { name: /\+/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/articles/new')

    // Check that ArticleList is rendered
    expect(screen.getByTestId('article-list')).toBeInTheDocument()
  })
})
