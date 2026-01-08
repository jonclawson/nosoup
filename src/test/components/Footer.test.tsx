import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'
import { StateProvider } from '@/contexts/StateContext'
import '@testing-library/jest-dom'

// Mock ContentEdit to avoid dynamic import/session complexity — render children directly
jest.mock('@/components/ContentEdit', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>
}))

// Mock next-auth/react to avoid session complications
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' }))
}))

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the footer element with correct class', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as unknown as Response)

    render(
      <StateProvider>
        <Footer />
      </StateProvider>
    )

    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('renders fallback children when the setting is missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as unknown as Response)

    render(
      <StateProvider>
        <Footer />
      </StateProvider>
    )

    const fallback = await screen.findByText(/NoSoup\. All rights reserved\./)
    expect(fallback).toBeInTheDocument()
  })

  it('fetches the footer_text setting from API', async () => {
    const fetchSpy = global.fetch as jest.Mock
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as unknown as Response)

    render(
      <StateProvider>
        <Footer />
      </StateProvider>
    )

    await screen.findByText(/NoSoup\. All rights reserved\./)
    expect(fetchSpy).toHaveBeenCalledWith('/api/settings/footer_text')
  })

  it('renders custom footer text when the setting is fetched successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ value: '© 2026 My Custom Site' }),
    } as unknown as Response)

    render(
      <StateProvider>
        <Footer />
      </StateProvider>
    )

    const customText = await screen.findByText(/My Custom Site/)
    expect(customText).toBeInTheDocument()
  })
})
