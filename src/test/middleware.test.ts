import { withAuth as originalWithAuth } from 'next-auth/middleware'
import middleware from '@/middleware'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Mock withAuth to return the inner function and expose the options
jest.mock('next-auth/middleware', () => {
  return {
    withAuth: jest.fn((fn: any, opts: any) => {
      const wrapper: any = fn
      wrapper._authOptions = opts
      return wrapper
    }),
  }
})

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    rewrite: jest.fn(),
    next: jest.fn(() => ({ headers: { set: jest.fn() } })),
  },
}))



describe('middleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.R2_USE_R2
  })

  it('redirects /files to /api/files when R2_USE_R2 is true', () => {
    process.env.R2_USE_R2 = 'true'

    const req: any = {
      nextUrl: {
        pathname: '/files/some.png',
        origin: 'http://localhost',         // add origin
        clone() { return { pathname: '/files/some.png', origin: 'http://localhost' } }
      },
      url: 'http://localhost/files/some.png', // add full request URL
      method: 'GET',
    }

    // Call middleware
    middleware(req)

    expect(NextResponse.rewrite as jest.Mock).toHaveBeenCalled()
    const [url] = (NextResponse.rewrite as jest.Mock).mock.calls[0]
    expect(url.pathname).toBe('/api/files/some.png')
  })

  it('sets security headers when not redirecting', () => {
    const mockSet = jest.fn()
    ;(NextResponse.next as jest.Mock).mockReturnValueOnce({ headers: { set: mockSet } })

    const req: any = {
      nextUrl: {
        pathname: '/some/path',
      },
      method: 'GET',
    }

    const resp = middleware(req)

    expect(NextResponse.next).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(mockSet).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
    expect(mockSet).toHaveBeenCalledWith('Referrer-Policy', 'origin-when-cross-origin')
    expect(resp).toBeDefined()
  })

  describe('authorized callback', () => {
    const authorized = (middleware as any)._authOptions.callbacks.authorized

    it('allows GET to settings without a token', () => {
      const req: any = { method: 'GET', nextUrl: { pathname: '/api/settings' } }
      const result = authorized({ req, token: null })
      expect(result).toBe(true)
    })

    it('allows /auth callback path without a token', () => {
      const req: any = { method: 'GET', nextUrl: { pathname: '/auth/callback' } }
      const result = authorized({ req, token: null })
      expect(result).toBe(true)
    })

    it('denies non-admin access to other users when not own', () => {
      const req: any = { method: 'POST', nextUrl: { pathname: '/api/users' } }
      const token = { id: '2', role: 'user' }
      const result = authorized({ req, token })
      expect(result).toBe(false)
    })

    it('allows user to access their own path', () => {
      const req: any = { method: 'PATCH', nextUrl: { pathname: '/users/1/edit' } }
      const token = { id: '1', role: 'user' }
      const result = authorized({ req, token })
      expect(result).toBe(true)
    })

    it('returns true for any valid token by default', () => {
      const req: any = { method: 'GET', nextUrl: { pathname: '/some/other' } }
      const token = { id: '1', role: 'user' }
      const result = authorized({ req, token })
      expect(result).toBe(true)
    })
  })

  describe('rewrites', () => {
    afterEach(() => {
      global.fetch = undefined as any
    })

    it('rewrites alias path to /articles when navigation_articles_link matches', async () => {
      global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ value: 'News' }) })

      const req: any = {
        nextUrl: { pathname: '/news', origin: 'http://localhost' },
        url: 'http://localhost/news',
        method: 'GET',
      }

      await middleware(req)

      expect(NextResponse.rewrite as jest.Mock).toHaveBeenCalled()
      const [url] = (NextResponse.rewrite as jest.Mock).mock.calls[0]
      expect(url.pathname).toBe('/articles')
    })

    it('rewrites slug path to /articles/:id when API returns id', async () => {
      global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: false }) // navigation alias fetch
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: '123' }) })

      const req: any = {
        nextUrl: { pathname: '/test-slug', origin: 'http://localhost' },
        url: 'http://localhost/test-slug',
        method: 'GET',
        headers: { get: () => '' } // mock headers.get for cookies 
      }

      await middleware(req)

      expect(NextResponse.rewrite as jest.Mock).toHaveBeenCalled()
      const [url] = (NextResponse.rewrite as jest.Mock).mock.calls[0]
      expect(url.pathname).toBe('/articles/123')
    })
  })
})