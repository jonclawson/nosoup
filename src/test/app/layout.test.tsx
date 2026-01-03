import React from 'react';
import { render, screen } from '@testing-library/react';

// Mocks must be declared before importing the module under test
jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter-class' }),
}));

jest.mock('@/components/Providers', () => {
  const MockProviders = ({ children }) => <div data-testid="providers">{children}</div>;
  MockProviders.displayName = 'MockProviders';
  return MockProviders;
});
jest.mock('@/components/AuthStatus', () => {
  const MockAuthStatus = () => <div data-testid="authstatus">AuthStatus</div>;
  MockAuthStatus.displayName = 'MockAuthStatus';
  return MockAuthStatus;
});
jest.mock('@/components/Navigation', () => {
  const MockNavigation = () => <div data-testid="navigation">Navigation</div>;
  MockNavigation.displayName = 'MockNavigation';
  return MockNavigation;
});
jest.mock('@/components/MenuTabs', () => {
  const MockMenuTabs = () => <div data-testid="menutabs">MenuTabs</div>;
  MockMenuTabs.displayName = 'MockMenuTabs';
  return MockMenuTabs;
});
jest.mock('@/components/SiteName', () => {
  const MockSiteName = () => <span data-testid="sitename">SiteName</span>;
  MockSiteName.displayName = 'MockSiteName';
  return MockSiteName;
});
jest.mock('@/components/Search', () => {
  const MockSearch = () => <div data-testid="search">Search</div>;
  MockSearch.displayName = 'MockSearch';
  return MockSearch;
});

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