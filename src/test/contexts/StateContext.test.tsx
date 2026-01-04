import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StateProvider, useStateContext } from '@/contexts/StateContext'

function ShowSiteName() {
  const { siteName } = useStateContext()
  return <div data-testid="site-name">{siteName}</div>
}

function SetSiteName({ name = 'NewName' }: { name?: string }) {
  const { setSiteName } = useStateContext()
  return (
    <button data-testid="set-site" onClick={() => setSiteName(name)}>
      Set Site
    </button>
  )
}

function SetSetting({ settingKey, value }: { settingKey: string; value: any }) {
  const { setSetting } = useStateContext()
  return (
    <button data-testid={`set-${settingKey}`} onClick={() => setSetting(settingKey, value)}>
      Set {settingKey}
    </button>
  )
}

function ShowSetting({ settingKey }: { settingKey: string }) {
  const { getSetting } = useStateContext()
  const val = getSetting(settingKey)
  return <div data-testid={`show-${settingKey}`}>{JSON.stringify(val)}</div>
}

describe('StateProvider', () => {
  afterEach(() => {
    // ensure we don't leak env vars between tests
    delete process.env.NEXT_PUBLIC_SITE_NAME
  })

  it('provides initial siteName from env when present', () => {
    process.env.NEXT_PUBLIC_SITE_NAME = 'EnvSite'

    render(
      <StateProvider>
        <ShowSiteName />
      </StateProvider>
    )

    expect(screen.getByTestId('site-name')).toHaveTextContent('EnvSite')
  })

  it('defaults siteName to NoSoup when env is not set', () => {
    render(
      <StateProvider>
        <ShowSiteName />
      </StateProvider>
    )

    expect(screen.getByTestId('site-name')).toHaveTextContent('NoSoup')
  })

  it('setSiteName updates siteName for consumers', () => {
    render(
      <StateProvider>
        <ShowSiteName />
        <SetSiteName name="UpdatedSite" />
      </StateProvider>
    )

    expect(screen.getByTestId('site-name')).toHaveTextContent(/NoSoup|EnvSite/) // initial

    fireEvent.click(screen.getByTestId('set-site'))

    expect(screen.getByTestId('site-name')).toHaveTextContent('UpdatedSite')
  })

  it('setSetting and getSetting store and retrieve values across components', () => {
    render(
      <StateProvider>
        <SetSetting settingKey="foo" value={{ a: 1 }} />
        <ShowSetting settingKey="foo" />
      </StateProvider>
    )

    // initially empty (undefined serialized to nothing)
    expect(screen.getByTestId('show-foo')).toBeEmptyDOMElement()

    fireEvent.click(screen.getByTestId('set-foo'))

    expect(screen.getByTestId('show-foo')).toHaveTextContent(JSON.stringify({ a: 1 }))
  })

  it('getSetting returns undefined for missing keys', () => {
    render(
      <StateProvider>
        <ShowSetting settingKey="missing" />
      </StateProvider>
    )

    expect(screen.getByTestId('show-missing')).toBeEmptyDOMElement()
  })
})
