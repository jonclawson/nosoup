import { render, screen } from '@testing-library/react'
import NewArticle from '@/app/articles/new/NewArticle'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  )
})

// Mock ArticleForm component
jest.mock('@/components/ArticleForm', () => {
  return function MockArticleForm({ articleData }: { articleData: any }) {
    return <div data-testid="article-form" data-article-data={JSON.stringify(articleData)} />
  }
})

describe('NewArticle', () => {
  it('renders the component correctly', () => {
    render(<NewArticle />)

    // Check if the back link is present
    const backLink = screen.getByTestId('link')
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/articles')
    expect(backLink).toHaveTextContent('← Back to Articles')

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

    // Check main container classes
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('max-w-8xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8')

    // Check back link container
    const backLinkContainer = screen.getByText('← Back to Articles').parentElement
    expect(backLinkContainer).toHaveClass('mb-8')

    // Check heading classes
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('mt-2', 'text-2xl', 'font-semibold', 'text-gray-900')

    // Check form container classes
    const formContainer = screen.getByTestId('article-form').parentElement?.parentElement
    expect(formContainer).toHaveClass('bg-white', 'shadow', 'sm:rounded-lg')
  })
})