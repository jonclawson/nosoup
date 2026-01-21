import { render, fireEvent } from '@testing-library/react';
import ImageSlide from '@/components/ImageSlide';

describe('ImageSlide', () => {
  it('renders nothing when images is empty or undefined', () => {
    const { container } = render(<ImageSlide images={[]} />);
    expect(container).toBeEmptyDOMElement();

    const { container: c2 } = render(<ImageSlide images={undefined as any} />);
    expect(c2).toBeEmptyDOMElement();
  });

  it('renders images and swaps on click', () => {
    const images = [
      { value: 'https://example.com/image1.jpg' },
      { value: 'https://example.com/image2.jpg' },
    ];

    const { container } = render(<ImageSlide images={images} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveAttribute('src', expect.stringContaining('https%3A%2F%2Fexample.com%2Fimage1.jpg'));
    expect(imgs[1]).toHaveAttribute('src', expect.stringContaining('https%3A%2F%2Fexample.com%2Fimage2.jpg'));

    // Click second image to swap with first
    fireEvent.click(imgs[1]);

    const imgsAfter = container.querySelectorAll('img');
    expect(imgsAfter[0]).toHaveAttribute('src', expect.stringContaining('https%3A%2F%2Fexample.com%2Fimage2.jpg'));
    expect(imgsAfter[1]).toHaveAttribute('src', expect.stringContaining('https%3A%2F%2Fexample.com%2Fimage1.jpg'));
  });

  it('does not swap when only one image or when clicking the first image', () => {
    const single = [{ value: 'https://example.com/image1.jpg' }];
    const { container } = render(<ImageSlide images={single} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(1);

    fireEvent.click(imgs[0]);
    expect(container.querySelectorAll('img')[0]).toHaveAttribute('src', expect.stringContaining('image1.jpg'));

    // clicking first image of two images should not change order
    const images = [
      { value: 'https://example.com/image1.jpg' },
      { value: 'https://example.com/image2.jpg' },
    ];
    const { container: c2 } = render(<ImageSlide images={images} />);
    const imgs2 = c2.querySelectorAll('img');
    fireEvent.click(imgs2[0]);
    expect(c2.querySelectorAll('img')[0]).toHaveAttribute('src', expect.stringContaining('image1.jpg'));
    expect(c2.querySelectorAll('img')[1]).toHaveAttribute('src', expect.stringContaining('image2.jpg'));
  });
});
