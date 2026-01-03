import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PublishingOptions from '@/components/PublishingOptions';
import type { Article } from '@/lib/types';

describe('PublishingOptions', () => {
  const mockSetFormData = jest.fn();

  const createMockArticle = (overrides?: Partial<Article>): Article => ({
    id: 'test-id',
    title: 'Test Article',
    body: 'Test body',
    author: 'Test Author',
    createdAt: new Date(),
    published: false,
    tags: [],
    fields: [],
    sticky: false,
    featured: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the publishing options section', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('Publishing Options')).toBeInTheDocument();
    });

    it('should render the section title with correct styling', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const title = screen.getByText('Publishing Options');
      expect(title).toHaveClass('text-lg', 'font-medium', 'leading-6', 'text-gray-900');
    });

    it('should render the description text', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText(/Here you can manage the publishing settings/)).toBeInTheDocument();
    });

    it('should have correct styling on description text', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const description = screen.getByText(/Here you can manage the publishing settings/);
      expect(description).toHaveClass('text-sm', 'text-gray-500');
    });

    it('should render all three checkboxes', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    it('should have correct main container styling', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const metaDiv = container.querySelector('.mt-4');
      expect(metaDiv).toHaveClass('mt-4', 'space-y-4');
    });
  });

  describe('Published Checkbox', () => {
    it('should render published checkbox', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByRole('checkbox', { name: 'Published' })).toBeInTheDocument();
    });

    it('should have correct label for published checkbox', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByLabelText('Published')).toBeInTheDocument();
    });

    it('should have correct styling on published checkbox', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = container.querySelector('input[id="published"]') as HTMLInputElement;
      expect(checkbox).toHaveClass('h-4', 'w-4', 'text-blue-600', 'border-gray-300', 'rounded');
    });

    it('should have correct styling on published label', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const label = container.querySelector('label[for="published"]') as HTMLLabelElement;
      expect(label).toHaveClass('ml-2', 'block', 'text-sm', 'text-gray-700');
    });

    it('should display unchecked when published is false', () => {
      const formData = createMockArticle({ published: false });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' }) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should display checked when published is true', () => {
      const formData = createMockArticle({ published: true });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' }) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should update published status when checkbox is toggled', () => {
      const formData = createMockArticle({ published: false });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' });
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          published: true,
        })
      );
    });

    it('should toggle published from true to false', () => {
      const formData = createMockArticle({ published: true });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' });
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          published: false,
        })
      );
    });

    it('should preserve other form data when updating published status', () => {
      const formData = createMockArticle({
        published: false,
        title: 'My Article',
        sticky: true,
      });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' });
      fireEvent.click(checkbox);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.title).toBe('My Article');
      expect(callArg.sticky).toBe(true);
    });
  });

  describe('Sticky Checkbox', () => {
    it('should render sticky checkbox', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByRole('checkbox', { name: /Keep this article at the top/ })).toBeInTheDocument();
    });

    it('should have correct label for sticky checkbox', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByLabelText(/Keep this article at the top/)).toBeInTheDocument();
    });

    it('should have correct styling on sticky checkbox', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = container.querySelector('input[id="sticky"]') as HTMLInputElement;
      expect(checkbox).toHaveClass('h-4', 'w-4', 'text-blue-600', 'border-gray-300', 'rounded');
    });

    it('should have correct styling on sticky label', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const label = container.querySelector('label[for="sticky"]') as HTMLLabelElement;
      expect(label).toHaveClass('ml-2', 'block', 'text-sm', 'text-gray-700');
    });

    it('should display unchecked when sticky is false', () => {
      const formData = createMockArticle({ sticky: false });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ }) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should display checked when sticky is true', () => {
      const formData = createMockArticle({ sticky: true });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ }) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should update sticky status when checkbox is toggled', () => {
      const formData = createMockArticle({ sticky: false });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ });
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          sticky: true,
        })
      );
    });

    it('should toggle sticky from true to false', () => {
      const formData = createMockArticle({ sticky: true });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ });
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          sticky: false,
        })
      );
    });

    it('should preserve other form data when updating sticky status', () => {
      const formData = createMockArticle({
        sticky: false,
        title: 'My Article',
        published: true,
      });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ });
      fireEvent.click(checkbox);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.title).toBe('My Article');
      expect(callArg.published).toBe(true);
    });
  });

  describe('Featured Checkbox', () => {
    it('should render featured checkbox', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByRole('checkbox', { name: /Highlight this article/ })).toBeInTheDocument();
    });

    it('should have correct label for featured checkbox', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByLabelText(/Highlight this article/)).toBeInTheDocument();
    });

    it('should have correct styling on featured checkbox', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = container.querySelector('input[id="featured"]') as HTMLInputElement;
      expect(checkbox).toHaveClass('h-4', 'w-4', 'text-blue-600', 'border-gray-300', 'rounded');
    });

    it('should have correct styling on featured label', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const label = container.querySelector('label[for="featured"]') as HTMLLabelElement;
      expect(label).toHaveClass('ml-2', 'block', 'text-sm', 'text-gray-700');
    });

    it('should display unchecked when featured is false', () => {
      const formData = createMockArticle({ featured: false });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Highlight this article/ }) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should display checked when featured is true', () => {
      const formData = createMockArticle({ featured: true });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Highlight this article/ }) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should update featured status when checkbox is toggled', () => {
      const formData = createMockArticle({ featured: false });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Highlight this article/ });
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          featured: true,
        })
      );
    });

    it('should toggle featured from true to false', () => {
      const formData = createMockArticle({ featured: true });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Highlight this article/ });
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          featured: false,
        })
      );
    });

    it('should preserve other form data when updating featured status', () => {
      const formData = createMockArticle({
        featured: false,
        title: 'My Article',
        published: true,
      });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: /Highlight this article/ });
      fireEvent.click(checkbox);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.title).toBe('My Article');
      expect(callArg.published).toBe(true);
    });
  });

  describe('Multiple Checkbox Interactions', () => {
    it('should allow toggling published and sticky independently', () => {
      const formData = createMockArticle({ published: false, sticky: false });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const publishedCheckbox = screen.getByRole('checkbox', { name: 'Published' });
      fireEvent.click(publishedCheckbox);

      expect(mockSetFormData).toHaveBeenCalledWith(expect.objectContaining({ published: true }));

      jest.clearAllMocks();
      
      const stickyCheckbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ });
      fireEvent.click(stickyCheckbox);

      expect(mockSetFormData).toHaveBeenCalledWith(expect.objectContaining({ sticky: true }));
    });

    it('should allow toggling published and featured independently', () => {
      const formData = createMockArticle({ published: false, featured: false });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const publishedCheckbox = screen.getByRole('checkbox', { name: 'Published' });
      fireEvent.click(publishedCheckbox);

      const callArg1 = mockSetFormData.mock.calls[0][0];
      expect(callArg1.published).toBe(true);
      expect(callArg1.featured).toBe(false);
    });

    it('should allow toggling sticky and featured independently', () => {
      const formData = createMockArticle({ sticky: false, featured: false });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const stickyCheckbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ });
      fireEvent.click(stickyCheckbox);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.sticky).toBe(true);
      expect(callArg.featured).toBe(false);
    });

    it('should handle all three checkboxes being toggled', () => {
      const formData = createMockArticle({
        published: false,
        sticky: false,
        featured: false,
      });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        fireEvent.click(checkbox);
      });

      expect(mockSetFormData).toHaveBeenCalledTimes(3);
    });

    it('should maintain independent state for each checkbox', () => {
      const formData = createMockArticle({
        published: true,
        sticky: false,
        featured: true,
      });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const publishedCheckbox = screen.getByRole('checkbox', { name: 'Published' }) as HTMLInputElement;
      const stickyCheckbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ }) as HTMLInputElement;
      const featuredCheckbox = screen.getByRole('checkbox', { name: /Highlight this article/ }) as HTMLInputElement;

      expect(publishedCheckbox.checked).toBe(true);
      expect(stickyCheckbox.checked).toBe(false);
      expect(featuredCheckbox.checked).toBe(true);
    });
  });

  describe('Props Handling', () => {
    it('should accept formData prop', () => {
      const formData = createMockArticle({ published: true });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' }) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should accept setFormData callback', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' });
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should pass complete Article object in callback', () => {
      const formData = createMockArticle({
        title: 'Complete Article',
        body: 'Body text',
        author: 'Author Name',
      });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' });
      fireEvent.click(checkbox);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg).toEqual(expect.objectContaining({
        title: 'Complete Article',
        body: 'Body text',
        author: 'Author Name',
        published: true,
      }));
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined boolean values', () => {
      const formData = createMockArticle() as any;
      formData.published = undefined;
      formData.sticky = undefined;
      formData.featured = undefined;

      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const publishedCheckbox = screen.getByRole('checkbox', { name: 'Published' }) as HTMLInputElement;
      expect(publishedCheckbox.checked).toBe(false);
    });

    it('should handle truthy values that are not boolean', () => {
      const formData = createMockArticle() as any;
      formData.published = 1;
      formData.sticky = 'yes';
      formData.featured = {};

      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const publishedCheckbox = screen.getByRole('checkbox', { name: 'Published' }) as HTMLInputElement;
      expect(publishedCheckbox.checked).toBe(true);
    });

    it('should handle falsy values correctly', () => {
      const formData = createMockArticle() as any;
      formData.published = 0;
      formData.sticky = null;
      formData.featured = '';

      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const publishedCheckbox = screen.getByRole('checkbox', { name: 'Published' }) as HTMLInputElement;
      const stickyCheckbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ }) as HTMLInputElement;
      const featuredCheckbox = screen.getByRole('checkbox', { name: /Highlight this article/ }) as HTMLInputElement;

      expect(publishedCheckbox.checked).toBe(false);
      expect(stickyCheckbox.checked).toBe(false);
      expect(featuredCheckbox.checked).toBe(false);
    });
  });

  describe('Checkbox Styling', () => {
    it('should have consistent styling across all checkboxes', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveClass('h-4', 'w-4', 'text-blue-600', 'border-gray-300', 'rounded');
      });
    });

    it('should have consistent styling across all labels', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const labels = container.querySelectorAll('label');
      labels.forEach(label => {
        expect(label).toHaveClass('ml-2', 'block', 'text-sm', 'text-gray-700');
      });
    });

    it('should have flex layout for each checkbox-label pair', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const flexContainers = container.querySelectorAll('.flex');
      expect(flexContainers.length).toBeGreaterThan(0);
      flexContainers.forEach(flex => {
        expect(flex).toHaveClass('items-center');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have checkboxes with associated labels', () => {
      const formData = createMockArticle();
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const publishedCheckbox = screen.getByRole('checkbox', { name: 'Published' });
      const stickyCheckbox = screen.getByRole('checkbox', { name: /Keep this article at the top/ });
      const featuredCheckbox = screen.getByRole('checkbox', { name: /Highlight this article/ });

      expect(publishedCheckbox).toHaveAccessibleName();
      expect(stickyCheckbox).toHaveAccessibleName();
      expect(featuredCheckbox).toHaveAccessibleName();
    });

    it('should have proper form structure with fieldset-like semantics', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes).toHaveLength(3);
    });

    it('should have unique ids for each checkbox', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const publishedCheckbox = container.querySelector('input[id="published"]');
      const stickyCheckbox = container.querySelector('input[id="sticky"]');
      const featuredCheckbox = container.querySelector('input[id="featured"]');

      expect(publishedCheckbox).toBeInTheDocument();
      expect(stickyCheckbox).toBeInTheDocument();
      expect(featuredCheckbox).toBeInTheDocument();
    });

    it('should have htmlFor attributes on all labels', () => {
      const formData = createMockArticle();
      const { container } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const publishedLabel = container.querySelector('label[for="published"]');
      const stickyLabel = container.querySelector('label[for="sticky"]');
      const featuredLabel = container.querySelector('label[for="featured"]');

      expect(publishedLabel).toBeInTheDocument();
      expect(stickyLabel).toBeInTheDocument();
      expect(featuredLabel).toBeInTheDocument();
    });
  });

  describe('Form Data Updates', () => {
    it('should maintain other article properties when updating published', () => {
      const formData = createMockArticle({
        id: 'article-1',
        title: 'My Article',
        body: 'Article content',
      });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' });
      fireEvent.click(checkbox);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.id).toBe('article-1');
      expect(callArg.title).toBe('My Article');
      expect(callArg.body).toBe('Article content');
    });

    it('should use spread operator to preserve all properties', () => {
      const formData = createMockArticle({
        tags: ['tag1', 'tag2'],
        fields: [{ id: 'f1', type: 'text', value: 'test' }],
      });
      render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox', { name: 'Published' });
      fireEvent.click(checkbox);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.tags).toEqual(['tag1', 'tag2']);
      expect(callArg.fields).toHaveLength(1);
    });
  });

  describe('Double Toggle', () => {
    it('should correctly toggle checkbox on and off multiple times', () => {
      const formData = createMockArticle({ published: false });
      const { unmount } = render(<PublishingOptions formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByLabelText('Published') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);
      expect(mockSetFormData).toHaveBeenLastCalledWith(expect.objectContaining({ published: true }));

      unmount();
      jest.clearAllMocks();
      
      const updatedFormData = createMockArticle({ published: true });
      render(<PublishingOptions formData={updatedFormData} setFormData={mockSetFormData} />);

      const updatedCheckbox = screen.getByLabelText('Published') as HTMLInputElement;
      expect(updatedCheckbox.checked).toBe(true);

      fireEvent.click(updatedCheckbox);
      expect(mockSetFormData).toHaveBeenCalledWith(expect.objectContaining({ published: false }));
    });
  });
});
