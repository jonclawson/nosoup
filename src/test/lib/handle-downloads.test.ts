import { handleDownload } from '@/lib/handle-downloads';

describe('handleDownload', () => {
  let mockLink: HTMLAnchorElement;
  let mockEvent: Partial<React.MouseEvent<HTMLDivElement>>;
  let mockTarget: HTMLElement;

  beforeEach(() => {
    // Mock document.createElement
    mockLink = document.createElement('a');
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
    
    // Mock document.body methods
    jest.spyOn(document.body, 'appendChild');
    jest.spyOn(document.body, 'removeChild');
    
    // Mock link click
    mockLink.click = jest.fn();

    // Create mock target element
    mockTarget = document.createElement('div');
    mockTarget.setAttribute('data-content-type', 'file');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic File Download', () => {
    it('should create anchor element for file download', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should set href attribute to file URL', () => {
      const fileUrl = 'http://example.com/file.pdf';
      mockTarget.setAttribute('data-url', fileUrl);
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.href).toBe(fileUrl);
    });

    it('should set download attribute to file name', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'myfile.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.download).toBe('myfile.pdf');
    });

    it('should set target to _blank', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.target).toBe('_blank');
    });

    it('should append link to document body', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
    });

    it('should click the link', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should remove link from document body after click', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });
  });

  describe('File Names', () => {
    it('should use provided file name', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'custom-name.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.download).toBe('custom-name.pdf');
    });

    it('should use default download name when data-name is missing', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.removeAttribute('data-name');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.download).toBe('download');
    });

    it('should use default download name when data-name is empty string', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', '');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.download).toBe('download');
    });

    it('should handle file names with special characters', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'my-file_2024 (1).pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.download).toBe('my-file_2024 (1).pdf');
    });

    it('should handle file names with extensions', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.tar.gz');
      mockTarget.setAttribute('data-name', 'archive.tar.gz');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.download).toBe('archive.tar.gz');
    });
  });

  describe('File URLs', () => {
    it('should handle http URLs', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'file.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.href).toBe('http://example.com/file.pdf');
    });

    it('should handle https URLs', () => {
      mockTarget.setAttribute('data-url', 'https://secure.example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'file.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.href).toBe('https://secure.example.com/file.pdf');
    });

    it('should handle relative URLs', () => {
      mockTarget.setAttribute('data-url', '/files/document.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.href).toContain('/files/document.pdf');
    });

    it('should handle URLs with query parameters', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file?id=123&token=abc');
      mockTarget.setAttribute('data-name', 'file.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.href).toBe('http://example.com/file?id=123&token=abc');
    });

    it('should handle blob URLs', () => {
      const blobUrl = 'blob:http://example.com/12345';
      mockTarget.setAttribute('data-url', blobUrl);
      mockTarget.setAttribute('data-name', 'file.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.href).toBe(blobUrl);
    });
  });

  describe('Event Target Handling', () => {
    it('should work when target is file block directly', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should work when click target is child of file block', () => {
      const child = document.createElement('span');
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      // Mock closest to simulate child element behavior
      jest.spyOn(child, 'closest').mockReturnValue(mockTarget);

      mockEvent = {
        target: child,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should work when click target is deeply nested child', () => {
      const grandchild = document.createElement('strong');
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      // Mock closest to simulate nested element behavior
      jest.spyOn(grandchild, 'closest').mockReturnValue(mockTarget);

      mockEvent = {
        target: grandchild,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should not download when target is not file block', () => {
      const nonFileTarget = document.createElement('div');
      nonFileTarget.setAttribute('data-content-type', 'text');

      mockEvent = {
        target: nonFileTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it('should not download when target has no data-content-type', () => {
      const nonFileTarget = document.createElement('div');

      mockEvent = {
        target: nonFileTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.click).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should not download when data-url is missing', () => {
      mockTarget.setAttribute('data-content-type', 'file');
      mockTarget.setAttribute('data-name', 'document.pdf');
      mockTarget.removeAttribute('data-url');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it('should not download when data-url is empty string', () => {
      mockTarget.setAttribute('data-url', '');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it('should not download when data-url is null', () => {
      mockTarget.setAttribute('data-content-type', 'file');
      mockTarget.setAttribute('data-name', 'document.pdf');
      mockTarget.removeAttribute('data-url');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it('should handle multiple file downloads sequentially', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file1.pdf');
      mockTarget.setAttribute('data-name', 'file1.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);
      expect(mockLink.click).toHaveBeenCalledTimes(1);

      // Create new target and mock for second download
      const mockTarget2 = document.createElement('div');
      mockTarget2.setAttribute('data-content-type', 'file');
      mockTarget2.setAttribute('data-url', 'http://example.com/file2.pdf');
      mockTarget2.setAttribute('data-name', 'file2.pdf');

      mockEvent = {
        target: mockTarget2,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);
      expect(mockLink.click).toHaveBeenCalledTimes(2);
    });
  });

  describe('Different File Types', () => {
    const fileTypes = [
      { url: 'http://example.com/file.pdf', name: 'document.pdf' },
      { url: 'http://example.com/file.docx', name: 'document.docx' },
      { url: 'http://example.com/file.xlsx', name: 'spreadsheet.xlsx' },
      { url: 'http://example.com/file.zip', name: 'archive.zip' },
      { url: 'http://example.com/file.jpg', name: 'image.jpg' },
      { url: 'http://example.com/file.png', name: 'image.png' },
      { url: 'http://example.com/file.txt', name: 'text.txt' },
      { url: 'http://example.com/file.csv', name: 'data.csv' },
    ];

    fileTypes.forEach(({ url, name }) => {
      it(`should download ${name}`, () => {
        mockTarget.setAttribute('data-url', url);
        mockTarget.setAttribute('data-name', name);

        mockEvent = {
          target: mockTarget,
        } as Partial<React.MouseEvent<HTMLDivElement>>;

        handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

        expect(mockLink.href).toBe(url);
        expect(mockLink.download).toBe(name);
        expect(mockLink.click).toHaveBeenCalled();
      });
    });
  });

  describe('DOM Manipulation', () => {
    it('should always append then remove link in correct order', () => {
      const callOrder: string[] = [];

      (document.body.appendChild as jest.Mock).mockImplementation(() => {
        callOrder.push('append');
      });

      (document.body.removeChild as jest.Mock).mockImplementation(() => {
        callOrder.push('remove');
      });

      mockLink.click = jest.fn(() => {
        callOrder.push('click');
      });

      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(callOrder).toEqual(['append', 'click', 'remove']);
    });

    it('should create link with correct element type', () => {
      mockTarget.setAttribute('data-url', 'http://example.com/file.pdf');
      mockTarget.setAttribute('data-name', 'document.pdf');

      mockEvent = {
        target: mockTarget,
      } as Partial<React.MouseEvent<HTMLDivElement>>;

      handleDownload(mockEvent as React.MouseEvent<HTMLDivElement>);

      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });
});
