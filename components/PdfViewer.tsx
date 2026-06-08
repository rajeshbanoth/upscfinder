// components/PdfViewer.tsx
"use client";

export default function PdfViewer({
  driveUrl,
  pageNumber,
}: {
  driveUrl: string;
  pageNumber?: number | null;
}) {
  // Convert Google Drive sharing URL to embed preview URL with page parameter
  const getPreviewUrl = (url: string, page?: number | null): string => {
    if (!url) return "";
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) return url;
    const fileId = match[1];
    let preview = `https://drive.google.com/file/d/${fileId}/preview`;
    if (page) {
      preview += `?page=${page}`;
    }
    return preview;
  };

  const previewUrl = getPreviewUrl(driveUrl, pageNumber);

  if (!previewUrl) return <div className="text-red-500">Invalid PDF URL</div>;

  return (
    <div className="w-full h-[80vh] border rounded-lg overflow-hidden bg-gray-100">
      <iframe
        src={previewUrl}
        className="w-full h-full"
        allow="autoplay"
        title="PDF Viewer"
      />
    </div>
  );
}