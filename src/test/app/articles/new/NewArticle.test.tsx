import { render, screen } from '@testing-library/react'
import NewArticle from '@/app/articles/new/NewArticle'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock ArticleForm component
jest.mock('@/components/ArticleForm', () => {
  return function MockArticleForm({ articleData }: { articleData: any }) {
    return <div data-testid="article-form" data-article-data={JSON.stringify(articleData)} />
  }
})

// Mock userDocument
jest.mock('@/hooks/useDocument', () => ({
  useDocument: jest.fn(),
}))

describe('NewArticle', () => {
  it('renders the component correctly', () => {
    render(<NewArticle />)

    // Check if the back link is present
    const backLink = screen.getByTestId('link')
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/articles')
    expect(backLink).toHaveTextContent('← Back')

    // Check if the heading is present
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Write New Article')

    // Check if ArticleForm is rendered
    const articleForm = screen.getByTestId('article-form')
    expect(articleForm).toBeInTheDocument()
  })

  it('passes correct default article data to ArticleForm', () => {
    render(<NewArticle />)

    const articleForm = screen.getByTestId('article-form')
    const articleData = JSON.parse(articleForm.getAttribute('data-article-data') || '{}')

    expect(articleData).toEqual({
      title: '',
      body: '',
      fields: [],
      tags: [],
      published: false,
      sticky: false,
      featured: false
    })
  })

  it('renders with proper styling classes', () => {
    const { container } = render(<NewArticle />)

    // Check main container uses module class
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('new-article')

    // Check heading uses module title class
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('new-article__title')

    // Check form container uses module card class
    const formContainer = screen.getByTestId('article-form').parentElement?.parentElement
    expect(formContainer).toHaveClass('new-article__card')
  })
})