import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TagsComponent from '@/components/TagsComponent';
import { Article, Tag } from '@/lib/types';

// Mock fetch
global.fetch = jest.fn();

describe('TagsComponent', () => {
  const mockArticle: Article = {
    id: '1',
    title: 'Test Article',
    content: 'Test content',
    tags: [{ name: 'React' }],
    published: false,
    sticky: false,
    featured: false,
    slug: 'test-article',
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: '1',
    menuTab: null,
  };

  const mockSetFormData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render tags label', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    });

    it('should render existing tags', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('should render input field for new tags', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render add button', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('should render multiple existing tags', () => {
      const articleWithMultipleTags: Article = {
        ...mockArticle,
        tags: [
          { name: 'React' },
          { name: 'TypeScript' },
          { name: 'Next.js' },
        ],
      };

      render(
        <TagsComponent formData={articleWithMultipleTags} setFormData={mockSetFormData} />
      );

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
    });

    it('should render with no tags initially', () => {
      const articleWithNoTags: Article = {
        ...mockArticle,
        tags: [],
      };

      render(
        <TagsComponent formData={articleWithNoTags} setFormData={mockSetFormData} />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });

    it('should render remove button for each tag', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const removeButtons = screen.getAllByText('×');
      expect(removeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Adding Tags', () => {
    it('should add tag when add button is clicked', async () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      const addButton = screen.getByRole('button', { name: /add/i });

      fireEvent.change(input, { target: { value: 'JavaScript' } });
      fireEvent.click(addButton);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockArticle,
        tags: [
          { name: 'React' },
          { name: 'JavaScript' },
        ],
      });
    });

    it('should clear input after adding tag', async () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      const addButton = screen.getByRole('button', { name: /add/i });

      fireEvent.change(input, { target: { value: 'JavaScript' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should not add empty tag', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const addButton = screen.getByRole('button', { name: /add/i });
      fireEvent.click(addButton);

      // setFormData should not be called for empty tag
      expect(mockSetFormData).not.toHaveBeenCalled();
    });

    it('should not add tag with only whitespace', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      const addButton = screen.getByRole('button', { name: /add/i });

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(addButton);

      expect(mockSetFormData).not.toHaveBeenCalled();
    });

    it('should trim whitespace from tag name', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      const addButton = screen.getByRole('button', { name: /add/i });

      fireEvent.change(input, { target: { value: '  JavaScript  ' } });
      fireEvent.click(addButton);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockArticle,
        tags: [
          { name: 'React' },
          { name: 'JavaScript' },
        ],
      });
    });

    it('should add multiple different tags', async () => {
      const { rerender } = render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      const addButton = screen.getByRole('button', { name: /add/i });

      // Add first tag
      fireEvent.change(input, { target: { value: 'JavaScript' } });
      fireEvent.click(addButton);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockArticle,
        tags: [{ name: 'React' }, { name: 'JavaScript' }],
      });

      // Simulate updated formData
      const updatedArticle = {
        ...mockArticle,
        tags: [{ name: 'React' }, { name: 'JavaScript' }],
      };

      rerender(
        <TagsComponent formData={updatedArticle} setFormData={mockSetFormData} />
      );

      // Add second tag
      fireEvent.change(input, { target: { value: 'TypeScript' } });
      fireEvent.click(addButton);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...updatedArticle,
        tags: [{ name: 'React' }, { name: 'JavaScript' }, { name: 'TypeScript' }],
      });
    });
  });

  describe('Removing Tags', () => {
    it('should remove tag when remove button is clicked', () => {
      const articleWithMultipleTags: Article = {
        ...mockArticle,
        tags: [
          { name: 'React' },
          { name: 'TypeScript' },
        ],
      };

      render(
        <TagsComponent formData={articleWithMultipleTags} setFormData={mockSetFormData} />
      );

      const removeButtons = screen.getAllByText('×');
      fireEvent.click(removeButtons[0]);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...articleWithMultipleTags,
        tags: [{ name: 'TypeScript' }],
      });
    });

    it('should remove specific tag by index', () => {
      const articleWithMultipleTags: Article = {
        ...mockArticle,
        tags: [
          { name: 'React' },
          { name: 'TypeScript' },
          { name: 'Next.js' },
        ],
      };

      render(
        <TagsComponent formData={articleWithMultipleTags} setFormData={mockSetFormData} />
      );

      const removeButtons = screen.getAllByText('×');
      // Remove middle tag (TypeScript)
      fireEvent.click(removeButtons[1]);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...articleWithMultipleTags,
        tags: [{ name: 'React' }, { name: 'Next.js' }],
      });
    });

    it('should handle removing all tags', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const removeButtons = screen.getAllByText('×');
      fireEvent.click(removeButtons[0]);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockArticle,
        tags: [],
      });
    });
  });

  describe('Available Tags Search', () => {
    it('should fetch available tags on input change', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { name: 'JavaScript' },
          { name: 'Java' },
        ],
      });

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Java' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/tags?search=Java');
      });
    });

    it('should display available tags matching search', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { name: 'JavaScript' },
          { name: 'Java' },
        ],
      });

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Java' } });

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
      });
    });

    it('should show available tags section when input has value', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ name: 'JavaScript' }],
      });

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Java' } });

      await waitFor(() => {
        expect(screen.getByText(/available tags:/i)).toBeInTheDocument();
      });
    });

    it('should not show available tags when input is empty', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      expect(screen.queryByText(/available tags:/i)).not.toBeInTheDocument();
    });

    it('should filter available tags case-insensitively', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { name: 'JavaScript' },
          { name: 'Java' },
          { name: 'TypeScript' },
        ],
      });

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'JAVA' } });

      await waitFor(() => {
        expect(screen.getByText('Java')).toBeInTheDocument();
      });
    });

    it('should not show already selected tags in available tags', async () => {
      const articleWithTag: Article = {
        ...mockArticle,
        tags: [{ name: 'React' }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { name: 'React' },
          { name: 'Vue' },
        ],
      });

      render(
        <TagsComponent formData={articleWithTag} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'e' } });

      await waitFor(() => {
        // React should not appear in available tags (it's already selected)
        const availableTagButtons = screen.queryAllByRole('button', { name: /React/ });
        // Should only find the existing React tag, not in available tags section
        expect(availableTagButtons.length).toBeLessThanOrEqual(1);
      });
    });

    it('should handle fetch error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Java' } });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching available tags:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle failed fetch response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Java' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Component still shows available tags section even on failed response
      // because it checks for non-empty input, not fetch success
      expect(screen.getByText(/available tags:/i)).toBeInTheDocument();
    });

    it('should display available tags section with space input', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ name: 'JavaScript' }],
      });

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: ' ' } });

      // Component calls fetch even with whitespace
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Selecting Available Tags', () => {
    it('should add selected available tag', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { name: 'JavaScript' },
          { name: 'Java' },
        ],
      });

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Java' } });

      await waitFor(() => {
        expect(screen.getByText('Java')).toBeInTheDocument();
      });

      // Click on JavaScript in available tags
      const availableTagButton = screen.getByRole('button', { name: /^JavaScript$/ });
      fireEvent.click(availableTagButton);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockArticle,
        tags: [
          { name: 'React' },
          { name: 'JavaScript' },
        ],
      });
    });

    it('should clear input after selecting available tag', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ name: 'JavaScript' }],
      });

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Java' } });

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
      });

      const availableTagButton = screen.getByRole('button', { name: /^JavaScript$/ });
      fireEvent.click(availableTagButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should add multiple tags from available tags', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { name: 'JavaScript' },
          { name: 'Java' },
          { name: 'TypeScript' },
        ],
      });

      const { rerender } = render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Java' } });

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
      });

      // Click JavaScript
      fireEvent.click(screen.getByRole('button', { name: /^JavaScript$/ }));

      // Update component with new tag
      const updatedArticle = {
        ...mockArticle,
        tags: [{ name: 'React' }, { name: 'JavaScript' }],
      };
      rerender(
        <TagsComponent formData={updatedArticle} setFormData={mockSetFormData} />
      );

      // Search again
      fireEvent.change(input, { target: { value: 'Type' } });

      await waitFor(() => {
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });

      // Click TypeScript
      fireEvent.click(screen.getByRole('button', { name: /^TypeScript$/ }));

      expect(mockSetFormData).toHaveBeenLastCalledWith({
        ...updatedArticle,
        tags: [
          { name: 'React' },
          { name: 'JavaScript' },
          { name: 'TypeScript' },
        ],
      });
    });
  });

  describe('Tag Display Styling', () => {
    it('should display tags with blue styling', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const reactText = screen.getByText('React');
      // The tag element is the span containing React text
      const tagSpan = reactText.closest('span[class*="bg-blue-100"]');
      expect(tagSpan).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should display available tags with green styling', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ name: 'JavaScript' }],
      });

      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Java' } });

      await waitFor(() => {
        const availableTag = screen.getByRole('button', { name: /^JavaScript$/ });
        expect(availableTag).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('should have remove button styling on tags', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const removeButton = screen.getByText('×');
      expect(removeButton).toHaveClass('ml-2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle article with undefined tags', () => {
      const articleWithUndefinedTags = {
        ...mockArticle,
        tags: undefined as any,
      };

      render(
        <TagsComponent formData={articleWithUndefinedTags} setFormData={mockSetFormData} />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle special characters in tag names', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      const addButton = screen.getByRole('button', { name: /add/i });

      fireEvent.change(input, { target: { value: 'C++' } });
      fireEvent.click(addButton);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockArticle,
        tags: [
          { name: 'React' },
          { name: 'C++' },
        ],
      });
    });

    it('should handle very long tag names', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      const addButton = screen.getByRole('button', { name: /add/i });

      const longTagName = 'VeryLongTagNameThatShouldStillWork'.repeat(3);
      fireEvent.change(input, { target: { value: longTagName } });
      fireEvent.click(addButton);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockArticle,
        tags: [
          { name: 'React' },
          { name: longTagName },
        ],
      });
    });

    it('should handle unicode characters in tag names', () => {
      render(
        <TagsComponent formData={mockArticle} setFormData={mockSetFormData} />
      );

      const input = screen.getByRole('textbox');
      const addButton = screen.getByRole('button', { name: /add/i });

      fireEvent.change(input, { target: { value: '日本語' } });
      fireEvent.click(addButton);

      expect(mockSetFormData).toHaveBeenCalledWith({
        ...mockArticle,
        tags: [
          { name: 'React' },
          { name: '日本語' },
        ],
      });
    });
  });
});
