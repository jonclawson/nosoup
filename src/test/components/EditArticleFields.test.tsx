import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditArticleFields from '@/components/EditArticleFields';
import type { Article, Field } from '@/lib/types';

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn((file: Blob) => `blob:mock-url-${Math.random()}`);

describe('EditArticleFields', () => {
  const mockSetFormData = jest.fn();

  const createMockArticle = (fields: Field[] = []): Article => ({
    id: 'test-id',
    title: 'Test Article',
    body: 'Test body',
    author: 'Test Author',
    createdAt: new Date(),
    published: false,
    tags: [],
    fields: fields,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global.URL.createObjectURL as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should render the fields section with label', () => {
      const formData = createMockArticle([]);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('Fields')).toBeInTheDocument();
    });

    it('should display "No fields available" when fields array is empty', () => {
      const formData = createMockArticle([]);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('No fields available.')).toBeInTheDocument();
    });

    it('should render the add field select dropdown', () => {
      const formData = createMockArticle([]);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const select = screen.getByDisplayValue('Add Field');
      expect(select).toBeInTheDocument();
    });

    it('should have correct options in add field select', () => {
      const formData = createMockArticle([]);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('Add Field')).toBeInTheDocument();
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('Image')).toBeInTheDocument();
      expect(screen.getByText('Link')).toBeInTheDocument();
    });

    it('should have correct styling on main container', () => {
      const formData = createMockArticle([]);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const mainContainer = container.querySelector('.mt-1');
      expect(mainContainer).toHaveClass('block', 'w-full', 'rounded-md', 'border-gray-300', 'shadow-sm', 'p-4', 'bg-gray-50', 'text-sm', 'text-gray-500');
    });
  });

  describe('Field Types - Text', () => {
    it('should render text input for text field type', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Test text' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const input = screen.getByDisplayValue('Test text') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('text');
    });

    it('should display text field value', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Sample value' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('Sample value')).toBeInTheDocument();
    });

    it('should update text field value on input change', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Old value' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const input = screen.getByDisplayValue('Old value');
      fireEvent.change(input, { target: { value: 'New value' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({ value: 'New value' }),
          ]),
        })
      );
    });

    it('should render label for text field', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Test' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('Text Field')).toBeInTheDocument();
    });
  });

  describe('Field Types - Code', () => {
    it('should render textarea for code field type', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'code', value: 'const x = 1;' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const textarea = screen.getByDisplayValue('const x = 1;') as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should render textarea with 6 rows', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'code', value: 'code here' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const textarea = screen.getByDisplayValue('code here') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(6);
    });

    it('should update code field value on textarea change', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'code', value: 'old code' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const textarea = screen.getByDisplayValue('old code');
      fireEvent.change(textarea, { target: { value: 'new code' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({ value: 'new code' }),
          ]),
        })
      );
    });

    it('should render label for code field', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'code', value: '' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('Code Field')).toBeInTheDocument();
    });

    it('should preserve newlines in code field', () => {
      const codeWithNewlines = 'const x = 1;\nconst y = 2;\nreturn x + y;';
      const fields: Field[] = [
        { id: 'field-1', type: 'code', value: codeWithNewlines },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const textarea = screen.getByRole('textbox', { hidden: false }) as HTMLTextAreaElement;
      expect(textarea.value).toContain('const x = 1;');
      expect(textarea.value).toContain('const y = 2;');
      expect(textarea.value).toContain('return x + y;');
    });
  });

  describe('Field Types - Link', () => {
    it('should render text input for link field type', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'link', value: 'https://example.com' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const input = screen.getByDisplayValue('https://example.com') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('text');
    });

    it('should update link field value on input change', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'link', value: 'https://old.com' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const input = screen.getByDisplayValue('https://old.com');
      fireEvent.change(input, { target: { value: 'https://new.com' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({ value: 'https://new.com' }),
          ]),
        })
      );
    });

    it('should render label for link field', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'link', value: '' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('Link Field')).toBeInTheDocument();
    });
  });

  describe('Field Types - Image', () => {
    it('should render file input for image field type', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: '' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
    });

    it('should display "Click to upload image" when no image is provided', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: '' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('Click to upload image')).toBeInTheDocument();
    });

    it('should display image preview with existing image value', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: 'https://example.com/image.jpg' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const img = container.querySelector('img') as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toBe('https://example.com/image.jpg');
    });

    it('should display image preview with file object', () => {
      const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: '', meta: { file: mockFile } },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const img = container.querySelector('img') as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it('should display file name after upload', () => {
      const mockFile = new File(['image data'], 'myimage.jpg', { type: 'image/jpeg' });
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: '', meta: { file: mockFile } },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('myimage.jpg')).toBeInTheDocument();
    });

    it('should display file name from URL path', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: 'https://example.com/path/to/image.jpg' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('image.jpg')).toBeInTheDocument();
    });

    it('should handle file input change', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: '' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const mockFile = new File(['image'], 'upload.jpg', { type: 'image/jpeg' });
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({
              meta: expect.objectContaining({
                file: mockFile,
              }),
            }),
          ]),
        })
      );
    });

    it('should render label for image field', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: '' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('Image Field')).toBeInTheDocument();
    });

    it('should have hidden file input with opacity-0', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: '' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toHaveClass('opacity-0');
    });

    it('should handle file input with no file selected', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'image', value: '' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({
              type: 'image',
            }),
          ]),
        })
      );
    });
  });

  describe('Field Management', () => {
    it('should render remove button for each field', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Field 1' },
        { id: 'field-2', type: 'text', value: 'Field 2' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const removeButtons = container.querySelectorAll('button');
      expect(removeButtons.length).toBe(2);
    });

    it('should remove field when remove button is clicked', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Field 1' },
        { id: 'field-2', type: 'text', value: 'Field 2' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const removeButtons = container.querySelectorAll('button');
      fireEvent.click(removeButtons[0]);

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({ value: 'Field 2' }),
          ]),
        })
      );

      // Verify only 1 field remains
      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.fields).toHaveLength(1);
    });

    it('should render remove button with × symbol', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Test' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const removeButton = container.querySelector('button') as HTMLButtonElement;
      expect(removeButton.textContent).toContain('×');
    });

    it('should have correct styling on remove button', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Test' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const removeButton = container.querySelector('button') as HTMLButtonElement;
      expect(removeButton).toHaveClass('inline-flex', 'items-center', 'justify-center', 'w-5', 'h-5', 'rounded-full', 'border', 'border-gray-300', 'bg-white', 'text-gray-700', 'hover:bg-gray-50', 'shadow-sm', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Adding Fields', () => {
    it('should add text field when "text" is selected from dropdown', () => {
      const formData = createMockArticle([]);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const select = container.querySelector('select') as HTMLSelectElement;
      const option = container.querySelector('option[value="text"]') as HTMLOptionElement;
      
      // Set the value and dispatch change
      select.value = 'text';
      fireEvent.change(select);

      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should add code field when "code" is selected from dropdown', () => {
      const formData = createMockArticle([]);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const select = container.querySelector('select') as HTMLSelectElement;
      select.value = 'code';
      fireEvent.change(select);

      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should add image field when "image" is selected from dropdown', () => {
      const formData = createMockArticle([]);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const select = container.querySelector('select') as HTMLSelectElement;
      select.value = 'image';
      fireEvent.change(select);

      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should add link field when "link" is selected from dropdown', () => {
      const formData = createMockArticle([]);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const select = container.querySelector('select') as HTMLSelectElement;
      select.value = 'link';
      fireEvent.change(select);

      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should reset dropdown value after selection', () => {
      const formData = createMockArticle([]);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select.value).toBe('');

      select.value = 'text';
      fireEvent.change(select);

      // Value should be reset to empty by the component
      expect(select.value).toBe('');
    });

    it('should add new field to existing fields', () => {
      const existingFields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Existing' },
      ];
      const formData = createMockArticle(existingFields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const select = container.querySelector('select') as HTMLSelectElement;
      select.value = 'code';
      fireEvent.change(select);

      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should have correct styling on add field select', () => {
      const formData = createMockArticle([]);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select).toHaveClass('mt-2', 'inline-flex', 'items-center', 'px-3', 'py-1.5', 'border', 'border-gray-300', 'rounded-md', 'shadow-sm', 'text-sm', 'font-medium', 'text-gray-700', 'bg-white', 'hover:bg-gray-50');
    });
  });

  describe('Multiple Fields', () => {
    it('should render multiple fields correctly', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Text field' },
        { id: 'field-2', type: 'code', value: 'const x = 1;' },
        { id: 'field-3', type: 'link', value: 'https://example.com' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('Text field')).toBeInTheDocument();
      expect(screen.getByDisplayValue('const x = 1;')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    });

    it('should handle independent field updates', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'First' },
        { id: 'field-2', type: 'text', value: 'Second' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[1], { target: { value: 'Updated Second' } });

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.fields[0].value).toBe('First');
      expect(callArg.fields[1].value).toBe('Updated Second');
    });

    it('should maintain field order when removing from middle', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'First' },
        { id: 'field-2', type: 'text', value: 'Second' },
        { id: 'field-3', type: 'text', value: 'Third' },
      ];
      const formData = createMockArticle(fields);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const removeButtons = container.querySelectorAll('button');
      fireEvent.click(removeButtons[1]);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.fields).toHaveLength(2);
      expect(callArg.fields[0].value).toBe('First');
      expect(callArg.fields[1].value).toBe('Third');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined fields array', () => {
      const formData = { ...createMockArticle(), fields: undefined };
      render(<EditArticleFields formData={formData as any} setFormData={mockSetFormData} />);

      expect(screen.getByText('No fields available.')).toBeInTheDocument();
    });

    it('should handle field with empty id', () => {
      const fields: Field[] = [
        { id: '', type: 'text', value: 'Test' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    });

    it('should handle field with special characters in value', () => {
      const specialValue = '<script>alert("xss")</script>';
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: specialValue },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue(specialValue)).toBeInTheDocument();
    });

    it('should handle field with very long value', () => {
      const longValue = 'a'.repeat(1000);
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: longValue },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue(longValue)).toBeInTheDocument();
    });

    it('should handle field type capitalization correctly', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'code', value: '' },
        { id: 'field-2', type: 'link', value: '' },
        { id: 'field-3', type: 'image', value: '' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('Code Field')).toBeInTheDocument();
      expect(screen.getByText('Link Field')).toBeInTheDocument();
      expect(screen.getByText('Image Field')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should accept formData prop with fields', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Test' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    });

    it('should accept setFormData callback', () => {
      const formData = createMockArticle([]);
      const { container } = render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const select = container.querySelector('select') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'text' } });

      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should pass complete Article object in callback', () => {
      const fields: Field[] = [
        { id: 'field-1', type: 'text', value: 'Original' },
      ];
      const formData = createMockArticle(fields);
      render(<EditArticleFields formData={formData} setFormData={mockSetFormData} />);

      const input = screen.getByDisplayValue('Original');
      fireEvent.change(input, { target: { value: 'Modified' } });

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg).toEqual(expect.objectContaining({
        id: 'test-id',
        title: 'Test Article',
      }));
    });
  });
});
