import { render, screen } from '@testing-library/react';
import ArticleFields from '@/components/ArticleFields';
import type { Article } from '@/lib/types';

jest.mock('@/components/Dompurify', () => {
  return function DompurifyMock({ html }: { html: string }) {
    return <div data-testid="dompurify">{html}</div>;
  };
});

describe('ArticleFields', () => {
  it('should render nothing when article is null', () => {
    const { container } = render(<ArticleFields article={null} />);
    const children = container.firstChild as any;
    expect(children?.childNodes.length || 0).toBe(0);
  });

  it('should render nothing when article has no fields', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleFields article={article} />);
    const children = container.firstChild as any;
    expect(children?.childNodes.length || 0).toBe(0);
  });

  it('should render nothing when article fields is undefined', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleFields article={article} />);
    const children = container.firstChild as any;
    expect(children?.childNodes.length || 0).toBe(0);
  });

  it('should render image field correctly', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [
        {
          id: '1',
          type: 'image',
          value: 'https://example.com/image.jpg',
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleFields article={article} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(img).toHaveClass('article-fields__image');
  });

  it('should not render image field when value is null or undefined', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [
        {
          id: '1',
          type: 'image',
          value: null,
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleFields article={article} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render code field with Dompurify for non-admin users', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [
        {
          id: '1',
          type: 'code',
          value: '<p>Test code</p>',
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleFields article={article} />);
    const dompurify = screen.getByTestId('dompurify');
    expect(dompurify).toBeInTheDocument();
    expect(dompurify).toHaveTextContent('<p>Test code</p>');
  });

  it('should render code field with dangerouslySetInnerHTML for admin users', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'admin' },
      fields: [
        {
          id: '1',
          type: 'code',
          value: '<p>Test code</p>',
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleFields article={article} />);
    expect(screen.queryByTestId('dompurify')).not.toBeInTheDocument();
  });

  it('should render code field with proper styling', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [
        {
          id: '1',
          type: 'code',
          value: '<code>console.log("test")</code>',
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleFields article={article} />);
    const codeContainer = screen.getByTestId('dompurify').parentElement;
    expect(codeContainer).toHaveClass('article-fields__code');
  });

  it('should render link field correctly', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [
        {
          id: '1',
          type: 'link',
          value: 'https://example.com',
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleFields article={article} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveTextContent('https://example.com');
    expect(link).toHaveClass('article-fields__link');
  });

  it('should render multiple fields', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [
        {
          id: '1',
          type: 'image',
          value: 'https://example.com/image.jpg',
          articleId: '1',
        },
        {
          id: '2',
          type: 'code',
          value: '<p>Test code</p>',
          articleId: '1',
        },
        {
          id: '3',
          type: 'link',
          value: 'https://example.com',
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleFields article={article} />);
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(screen.getByTestId('dompurify')).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('should use field id as key for each field', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [
        {
          id: 'field-1',
          type: 'image',
          value: 'https://example.com/image1.jpg',
          articleId: '1',
        },
        {
          id: 'field-2',
          type: 'image',
          value: 'https://example.com/image2.jpg',
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleFields article={article} />);
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
  });

  it('should render unknown field type as empty string', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: { id: '1', email: 'test@test.com', role: 'user' },
      fields: [
        {
          id: '1',
          type: 'unknown' as any,
          value: 'some value',
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    const { container } = render(<ArticleFields article={article} />);
    // Should have a div wrapper but no content for unknown type
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should check author role before rendering code field', () => {
    const article: Article = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      author: null,
      fields: [
        {
          id: '1',
          type: 'code',
          value: '<p>Test code</p>',
          articleId: '1',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: 'test-article',
    };

    render(<ArticleFields article={article} />);
    // Should use Dompurify when author is null (not admin)
    expect(screen.getByTestId('dompurify')).toBeInTheDocument();
  });
});
