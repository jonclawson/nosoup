import { render, screen } from '@testing-library/react';
import ArticleTags from '@/components/ArticleTags';
import type { Article, Tag } from '@/lib/types';

describe('ArticleTags', () => {
  it('should return null when article is null', () => {
    const { container } = render(<ArticleTags article={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when article has no tags', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleTags article={article} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when article tags is undefined', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleTags article={article} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render tags when article has tags', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [
        { id: '1', name: 'javascript' },
        { id: '2', name: 'react' },
      ],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleTags article={article} />);

    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('should render tag links with correct href', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [{ id: '1', name: 'typescript' }],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleTags article={article} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/articles/tagged/typescript');
  });

  it('should render multiple tags with correct links', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [
        { id: '1', name: 'javascript' },
        { id: '2', name: 'react' },
        { id: '3', name: 'typescript' },
      ],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleTags article={article} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', '/articles/tagged/javascript');
    expect(links[1]).toHaveAttribute('href', '/articles/tagged/react');
    expect(links[2]).toHaveAttribute('href', '/articles/tagged/typescript');
  });

  it('should render tags with proper styling classes', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [{ id: '1', name: 'nodejs' }],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleTags article={article} />);

    const tagSpan = container.querySelector('span');
    expect(tagSpan).toHaveClass('inline-flex', 'items-center', 'px-3', 'py-1', 'rounded-full', 'text-sm', 'font-medium', 'bg-green-100', 'text-green-800');
  });

  it('should render tags in a flex container with gap', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [
        { id: '1', name: 'tag1' },
        { id: '2', name: 'tag2' },
      ],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleTags article={article} />);

    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toHaveClass('flex', 'flex-wrap', 'gap-2');
  });

  it('should use tag id as key for rendering', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [
        { id: 'tag-1', name: 'first' },
        { id: 'tag-2', name: 'second' },
        { id: 'tag-3', name: 'third' },
      ],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleTags article={article} />);

    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
    expect(screen.getByText('third')).toBeInTheDocument();
  });

  it('should wrap tags in a mt-4 div', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [{ id: '1', name: 'test' }],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleTags article={article} />);

    const wrapper = container.querySelector('.mt-4');
    expect(wrapper).toBeInTheDocument();
  });

  it('should handle single tag', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [{ id: '1', name: 'solo' }],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleTags article={article} />);

    expect(screen.getByText('solo')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
  });

  it('should handle tags with special characters in names', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [
        { id: '1', name: 'c++' },
        { id: '2', name: 'c#' },
        { id: '3', name: 'node.js' },
      ],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleTags article={article} />);

    expect(screen.getByText('c++')).toBeInTheDocument();
    expect(screen.getByText('c#')).toBeInTheDocument();
    expect(screen.getByText('node.js')).toBeInTheDocument();
  });

  it('should handle tags with spaces in names', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      body: 'Test body',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      tags: [{ id: '1', name: 'web development' }],
      fields: [],
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleTags article={article} />);

    expect(screen.getByText('web development')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/articles/tagged/web development');
  });
});
