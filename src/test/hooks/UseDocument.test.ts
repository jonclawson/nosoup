import { renderHook, act, waitFor } from '@testing-library/react'
import { useStateContext } from '@/contexts/StateContext'
// Mock the StateContext before importing the hook
jest.mock('@/contexts/StateContext', () => ({
  useStateContext: jest.fn(),
}))

import { useDocument } from '@/hooks/useDocument'

describe('useDocument', () => {
  let originalTitleDescriptor: PropertyDescriptor | undefined

  beforeEach(() => {
    jest.clearAllMocks()

    // ensure document.title behaves normally
    originalTitleDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'title') as PropertyDescriptor | undefined
    if (originalTitleDescriptor) {
      // reset to original if it was mocked previously
      try {
        Object.defineProperty(document, 'title', originalTitleDescriptor)
      } catch (e) {
        // ignore
      }
    }
  })

  afterEach(() => {
    // restore original descriptor if we changed it
    if (originalTitleDescriptor) {
      Object.defineProperty(document, 'title', originalTitleDescriptor)
    }
  })

  it('sets document.title with initial title and siteName and toggles loading', async () => {
    ;(useStateContext as jest.Mock).mockReturnValue({ siteName: 'NoSoup' })

    const { result } = renderHook(() => useDocument({ title: 'Article' }))

    // loading should eventually become false and title should be set
    await waitFor(() => {
      expect(document.title).toBe('Article | NoSoup')
      expect(result.current.loading).toBeFalsy()
      expect(result.current.error).toBeNull()
    })
  })

  it('uses siteName alone if no initial title provided', async () => {
    ;(useStateContext as jest.Mock).mockReturnValue({ siteName: 'MySite' })

    const { result } = renderHook(() => useDocument())

    await waitFor(() => {
      expect(document.title).toBe('MySite')
      expect(result.current.loading).toBeFalsy()
    })
  })

  it('setTitle updates the document title combined with siteName', async () => {
    ;(useStateContext as jest.Mock).mockReturnValue({ siteName: 'NoSoup' })

    const { result } = renderHook(() => useDocument({ title: 'Article' }))

    await waitFor(() => expect(document.title).toBe('Article | NoSoup'))

    act(() => {
      result.current.setTitle('Updated')
    })

    await waitFor(() => {
      expect(document.title).toBe('Updated | NoSoup')
    })
  })

  it('updates document.title when siteName changes', async () => {
    // start with NoSoup
    ;(useStateContext as jest.Mock).mockReturnValue({ siteName: 'NoSoup' })
    const { result, rerender } = renderHook(
      ({ title }) => useDocument({ title }),
      { initialProps: { title: 'Article' } }
    )

    await waitFor(() => expect(document.title).toBe('Article | NoSoup'))

    // change siteName mock
    ;(useStateContext as jest.Mock).mockReturnValue({ siteName: 'NewSite' })

    // rerender to pick up new context value
    rerender({ title: 'Article' })

    await waitFor(() => expect(document.title).toBe('Article | NewSite'))
  })

  it('sets error if writing to document.title throws', async () => {
    ;(useStateContext as jest.Mock).mockReturnValue({ siteName: 'NoSoup' })

    // mock document.title setter to throw
    const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'title') || {}
    Object.defineProperty(document, 'title', {
      configurable: true,
      get: descriptor.get,
      set() {
        throw new Error('boom')
      },
    })

    const { result } = renderHook(() => useDocument({ title: 'Article' }))

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
      expect((result.current.error as string).toLowerCase()).toContain('boom')
    })
  })
})
