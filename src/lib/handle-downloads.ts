export const handleDownload = (e: React.MouseEvent<HTMLDivElement>) => {
    // Find if the click originated from a file block or its children
    const target = (e.target as HTMLElement).closest('[data-content-type="file"]');
    
    if (target) {
      const fileUrl = target.getAttribute('data-url');
      const fileName = target.getAttribute('data-name') || 'download';

      if (fileUrl) {
        // Create a temporary anchor element to trigger the "Save As" dialog
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };