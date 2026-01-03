import React from 'react';
import { render, screen } from '@testing-library/react';

// Mocks must be declared before importing the module under test
jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter-class' }),
}));

jest.mock('@/components/Providers', () => ({ children }) => <div data-testid="providers">{children}</div>);
jest.mock('@/components/AuthStatus', () => () => <div data-testid="authstatus">AuthStatus</div>);
jest.mock('@/components/Navigation', () => () => <div data-testid="navigation">Navigation</div>);
jest.mock('@/components/MenuTabs', () => () => <div data-testid="menutabs">MenuTabs</div>);
jest.mock('@/components/SiteName', () => () => <span data-testid="sitename">SiteName</span>);
jest.mock('@/components/Search', () => () => <div data-testid="search">Search</div>);

import RootLayout from '@/app/layout';

describe('RootLayout', () => {
  it('renders nav components and children and applies font class to body', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child">Hello World</div>
      </RootLayout>
    );

    // Providers and nav components present
    expect(screen.getByTestId('providers')).toBeInTheDocument();
    expect(screen.getByTestId('authstatus')).toBeInTheDocument();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('menutabs')).toBeInTheDocument();
    expect(screen.getByTestId('sitename')).toBeInTheDocument();
    expect(screen.getByTestId('search')).toBeInTheDocument();

    // Child content rendered
    expect(screen.getByTestId('child')).toHaveTextContent('Hello World');

    // Nav element exists
    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
  });
});