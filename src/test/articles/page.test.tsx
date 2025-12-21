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

describe('ArticlesPage', () => {
  it('should render the articles page correctly', async () => {
    render(await ArticlesPage())

    // Check the heading
    expect(screen.getByRole('heading', { name: /articles/i })).toBeInTheDocument()

    // Check the description
    expect(screen.getByText(/a collection of articles from our community/i)).toBeInTheDocument()

    // Check the link
    const link = screen.getByRole('link', { name: /write article/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/articles/new')

    // Check that ArticleList is rendered
    expect(screen.getByTestId('article-list')).toBeInTheDocument()
  })
})
