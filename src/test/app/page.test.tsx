import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({ children, href, className }: any) {
    return (
      <a href={href} className={className} data-testid="link">
        {children}
      </a>
    )
  },
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock Setting component to render children
jest.mock('@/components/Setting', () => {
  const MockSetting = ({ children }: any) => <div data-testid="setting">{children}</div>
  MockSetting.displayName = 'MockSetting'
  return MockSetting
})

// Mock ArticleList to capture featured prop
jest.mock('@/components/ArticleList', () => {
  const MockArticleList = ({ featured }: any) => (
    <div data-testid="article-list" data-featured={String(featured)} />
  )
  MockArticleList.displayName = 'MockArticleList'
  return MockArticleList
})

// Mock useDocument hook
const mockUseDocument = jest.fn()
jest.mock('@/hooks/useDocument', () => ({ useDocument: (...args: any[]) => mockUseDocument(...args) }))

import HomePage from '@/app/page'
import { useSession } from 'next-auth/react'

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })
    mockUseDocument.mockReturnValue({ setTitle: jest.fn(), loading: false, error: null })
  })

  it('renders featured header, description and All Articles link', () => {
    render(<HomePage />)

    expect(screen.getByText('Featured Articles')).toBeInTheDocument()
    expect(screen.getByText(/A collection of/)).toBeInTheDocument()
    expect(screen.getByTestId('link')).toHaveAttribute('href', '/articles/')
  })

  it('renders ArticleList with featured=true', () => {
    render(<HomePage />)

    const list = screen.getByTestId('article-list')
    expect(list).toBeInTheDocument()
    expect(list).toHaveAttribute('data-featured', 'true')
  })

  it('calls useDocument with empty title', () => {
    render(<HomePage />)

    expect(mockUseDocument).toHaveBeenCalledWith({ title: '' })
  })
})