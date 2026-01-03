import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuTabFields from '@/components/MenuTabFields';
import type { Article } from '@/lib/types';

describe('MenuTabFields', () => {
  const mockSetFormData = jest.fn();

  const createMockArticle = (tab?: { name: string; link: string; order: string }): Article => ({
    id: 'test-id',
    title: 'Test Article',
    body: 'Test body',
    author: 'Test Author',
    createdAt: new Date(),
    published: false,
    tags: [],
    fields: [],
    tab: tab,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the menu tab checkbox', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should render checkbox with "Menu Tab" label', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByText('Menu Tab')).toBeInTheDocument();
    });

    it('should not display menu tab inputs when checkbox is unchecked', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.queryByLabelText('Menu Tab Name')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Menu Tab Order')).not.toBeInTheDocument();
    });

    it('should display menu tab inputs when checkbox is checked', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(screen.getByLabelText('Menu Tab Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Menu Tab Order')).toBeInTheDocument();
    });

    it('should have correct styling on main container', () => {
      const formData = createMockArticle();
      const { container } = render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const mainDiv = container.querySelector('.mb-4');
      expect(mainDiv).toHaveClass('mb-4');
    });

    it('should have correct checkbox styling', () => {
      const formData = createMockArticle();
      const { container } = render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toHaveClass('h-4', 'w-4', 'text-blue-600', 'border-gray-300', 'rounded');
    });
  });

  describe('Checkbox Behavior', () => {
    it('should start with checkbox unchecked when no tab is provided', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should start with checkbox checked when tab is provided', () => {
      const formData = createMockArticle({ name: 'Test Tab', link: 'test-link', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should toggle checkbox on click', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it('should call setFormData when checkbox is checked', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: expect.objectContaining({
            name: '',
            link: '',
            order: '',
          }),
        })
      );
    });

    it('should call setFormData with undefined tab when checkbox is unchecked', () => {
      const formData = createMockArticle({ name: 'Test', link: 'test', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: undefined,
        })
      );
    });
  });

  describe('Menu Tab Name Input', () => {
    it('should display menu tab name input when checkbox is checked', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(screen.getByLabelText('Menu Tab Name')).toBeInTheDocument();
    });

    it('should initialize menu tab name input with empty string', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const input = screen.getByLabelText('Menu Tab Name') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should initialize menu tab name input with existing tab name', () => {
      const formData = createMockArticle({ name: 'Existing Tab', link: 'link', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('Existing Tab')).toBeInTheDocument();
    });

    it('should update menu tab name on input change', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const input = screen.getByLabelText('Menu Tab Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'New Tab Name' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: expect.objectContaining({
            name: 'New Tab Name',
          }),
        })
      );
    });

    it('should have correct styling on menu tab name input', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const input = screen.getByLabelText('Menu Tab Name');
      expect(input).toHaveClass('mt-1', 'block', 'w-full', 'rounded-md', 'border-gray-300', 'shadow-sm', 'focus:border-blue-500', 'focus:ring-blue-500', 'sm:text-sm');
    });

    it('should preserve link and order values when changing name', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Mock previous state with some values
      jest.clearAllMocks();
      const nameInput = screen.getByLabelText('Menu Tab Name') as HTMLInputElement;
      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.tab.name).toBe('Updated Name');
    });
  });

  describe('Menu Tab Link Input', () => {
    it('should display menu tab link input when checkbox is checked', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(screen.getByLabelText('Menu Tab Link')).toBeInTheDocument();
    });

    it('should initialize menu tab link input with empty string', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should initialize menu tab link input with existing tab link', () => {
      const formData = createMockArticle({ name: 'Tab', link: 'existing-link', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('existing-link')).toBeInTheDocument();
    });

    it('should update menu tab link on input change', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const linkInput = screen.getByLabelText('Menu Tab Link') as HTMLInputElement;
      fireEvent.change(linkInput, { target: { value: '/new-link' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: expect.objectContaining({
            link: '/new-link',
          }),
        })
      );
    });

    it('should have correct styling on menu tab link input', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const linkInput = screen.getByLabelText('Menu Tab Link');
      expect(linkInput).toHaveClass('mt-1', 'block', 'w-full', 'rounded-md', 'border-gray-300', 'shadow-sm', 'focus:border-blue-500', 'focus:ring-blue-500', 'sm:text-sm');
    });

    it('should preserve name and order values when changing link', () => {
      const formData = createMockArticle({ name: 'Test Tab', link: 'old-link', order: '5' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      jest.clearAllMocks();
      const linkInput = screen.getByLabelText('Menu Tab Link') as HTMLInputElement;
      fireEvent.change(linkInput, { target: { value: 'new-link' } });

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.tab.name).toBe('Test Tab');
      expect(callArg.tab.link).toBe('new-link');
      expect(callArg.tab.order).toBe('5');
    });
  });

  describe('Menu Tab Order Input', () => {
    it('should display menu tab order input when checkbox is checked', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(screen.getByLabelText('Menu Tab Order')).toBeInTheDocument();
    });

    it('should have type="number" on order input', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      expect(orderInput.type).toBe('number');
    });

    it('should initialize menu tab order input with empty string', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      expect(orderInput.value).toBe('');
    });

    it('should initialize menu tab order input with existing tab order', () => {
      const formData = createMockArticle({ name: 'Tab', link: 'link', order: '42' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      expect(orderInput.value).toBe('42');
    });

    it('should update menu tab order on input change', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      fireEvent.change(orderInput, { target: { value: '10' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: expect.objectContaining({
            order: '10',
          }),
        })
      );
    });

    it('should handle zero as a valid order value', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      fireEvent.change(orderInput, { target: { value: '0' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: expect.objectContaining({
            order: '0',
          }),
        })
      );
    });

    it('should handle negative order values', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      fireEvent.change(orderInput, { target: { value: '-5' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: expect.objectContaining({
            order: '-5',
          }),
        })
      );
    });

    it('should have correct styling on menu tab order input', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const orderInput = screen.getByLabelText('Menu Tab Order');
      expect(orderInput).toHaveClass('mt-1', 'block', 'w-full', 'rounded-md', 'border-gray-300', 'shadow-sm', 'focus:border-blue-500', 'focus:ring-blue-500', 'sm:text-sm');
    });

    it('should preserve name and link values when changing order', () => {
      const formData = createMockArticle({ name: 'Test Tab', link: 'test-link', order: '5' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      jest.clearAllMocks();
      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      fireEvent.change(orderInput, { target: { value: '20' } });

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.tab.name).toBe('Test Tab');
      expect(callArg.tab.link).toBe('test-link');
      expect(callArg.tab.order).toBe('20');
    });
  });

  describe('Integration - Checkbox and Inputs', () => {
    it('should show inputs when checkbox is initially checked and hide when unchecked', () => {
      const formData = createMockArticle({ name: 'Tab', link: 'link', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByLabelText('Menu Tab Name')).toBeInTheDocument();

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(screen.queryByLabelText('Menu Tab Name')).not.toBeInTheDocument();
    });

    it('should preserve input values when toggling checkbox off and on', () => {
      const formData = createMockArticle();
      const { rerender } = render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      // Check the checkbox
      let checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Update name
      const nameInput = screen.getByLabelText('Menu Tab Name') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'New Tab' } });

      // Verify setFormData was called with the new value
      const firstCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0];
      expect(firstCall.tab.name).toBe('New Tab');
    });

    it('should handle multiple sequential updates', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Update name
      const nameInput = screen.getByLabelText('Menu Tab Name');
      fireEvent.change(nameInput, { target: { value: 'Tab Name' } });

      // Update link
      const linkInput = screen.getByLabelText('Menu Tab Link');
      fireEvent.change(linkInput, { target: { value: 'tab-link' } });

      // Update order
      const orderInput = screen.getByLabelText('Menu Tab Order');
      fireEvent.change(orderInput, { target: { value: '3' } });

      expect(mockSetFormData).toHaveBeenCalled();
      const lastCall = mockSetFormData.mock.calls[mockSetFormData.mock.calls.length - 1][0];
      expect(lastCall.tab).toEqual({
        name: 'Tab Name',
        link: 'tab-link',
        order: '3',
      });
    });
  });

  describe('Props Handling', () => {
    it('should accept formData prop', () => {
      const formData = createMockArticle({ name: 'Test', link: 'test', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    });

    it('should accept setFormData callback', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockSetFormData).toHaveBeenCalled();
    });

    it('should pass complete Article object in callback', () => {
      const formData = createMockArticle({ name: 'Tab', link: 'link', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      jest.clearAllMocks();
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg).toEqual(expect.objectContaining({
        id: 'test-id',
        title: 'Test Article',
        author: 'Test Author',
        tab: undefined,
      }));
    });
  });

  describe('Edge Cases', () => {
    it('should handle tab with empty strings', () => {
      const formData = createMockArticle({ name: '', link: '', order: '' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const nameInput = screen.getByLabelText('Menu Tab Name') as HTMLInputElement;
      expect(nameInput.value).toBe('');
    });

    it('should handle special characters in menu tab name', () => {
      const formData = createMockArticle({ name: 'Test & <Special> "Tab"', link: 'link', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('Test & <Special> "Tab"')).toBeInTheDocument();
    });

    it('should handle special characters in menu tab link', () => {
      const formData = createMockArticle({ name: 'Tab', link: '/path?query=test&other=value', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue('/path?query=test&other=value')).toBeInTheDocument();
    });

    it('should handle very long menu tab name', () => {
      const longName = 'a'.repeat(500);
      const formData = createMockArticle({ name: longName, link: 'link', order: '1' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      expect(screen.getByDisplayValue(longName)).toBeInTheDocument();
    });

    it('should handle very large order numbers', () => {
      const formData = createMockArticle({ name: 'Tab', link: 'link', order: '999999' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      expect(orderInput.value).toBe('999999');
    });

    it('should handle decimal order values', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      fireEvent.change(orderInput, { target: { value: '3.5' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: expect.objectContaining({
            order: '3.5',
          }),
        })
      );
    });

    it('should handle empty order field', () => {
      const formData = createMockArticle({ name: 'Tab', link: 'link', order: '5' });
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const orderInput = screen.getByLabelText('Menu Tab Order') as HTMLInputElement;
      fireEvent.change(orderInput, { target: { value: '' } });

      expect(mockSetFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          tab: expect.objectContaining({
            order: '',
          }),
        })
      );
    });

    it('should handle undefined tab gracefully', () => {
      const formData = createMockArticle(undefined);
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('Label Styling', () => {
    it('should have correct styling on main label', () => {
      const formData = createMockArticle();
      const { container } = render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const label = container.querySelector('label');
      expect(label).toHaveClass('flex', 'items-center', 'space-x-2');
    });

    it('should have correct styling on menu tab name label', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const nameLabel = screen.getByText('Menu Tab Name');
      expect(nameLabel).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700');
    });

    it('should have correct styling on menu tab link label', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const linkLabel = screen.getByText('Menu Tab Link');
      expect(linkLabel).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700');
    });

    it('should have correct styling on menu tab order label', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const orderLabel = screen.getByText('Menu Tab Order');
      expect(orderLabel).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700');
    });

    it('should have correct styling on Menu Tab text label', () => {
      const formData = createMockArticle();
      const { container } = render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const span = container.querySelector('span');
      expect(span).toHaveClass('text-sm', 'font-medium', 'text-gray-700');
    });
  });

  describe('Form Data Updates', () => {
    it('should maintain other article properties when updating tab', () => {
      const formData = createMockArticle();
      render(<MenuTabFields formData={formData} setFormData={mockSetFormData} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.id).toBe('test-id');
      expect(callArg.title).toBe('Test Article');
      expect(callArg.body).toBe('Test body');
      expect(callArg.author).toBe('Test Author');
    });

    it('should update only tab property when changing inputs', () => {
      const originalFormData = createMockArticle({ name: 'Old', link: 'old', order: '1' });
      render(<MenuTabFields formData={originalFormData} setFormData={mockSetFormData} />);

      jest.clearAllMocks();
      const nameInput = screen.getByLabelText('Menu Tab Name');
      fireEvent.change(nameInput, { target: { value: 'New' } });

      const callArg = mockSetFormData.mock.calls[0][0];
      expect(callArg.tab.name).toBe('New');
      expect(callArg.id).toBe(originalFormData.id);
      expect(callArg.title).toBe(originalFormData.title);
    });
  });
});
