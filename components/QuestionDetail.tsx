// "use client";

// import { IQuestion } from "@/models/Question";
// import {
//   FileText,
//   User,
//   BookOpen,
//   Tag,
//   Globe,
//   Gauge,
//   Calendar,
//   ExternalLink,
//   Eye,
// } from "lucide-react";

// // Convert Google Drive sharing URL to a proxy API URL (no CORS)
// function getProxyPdfUrl(driveUrl: string): string | null {
//   if (!driveUrl) return null;
//   const match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
//   if (match && match[1]) {
//     const fileId = match[1];
//     return `/api/pdf?id=${fileId}`;
//   }
//   return null;
// }

// export default function QuestionDetail({ question }: { question: IQuestion }) {
// //   const driveUrl = question.source?.drive_url || "";
// //   const pageNumber = question.source?.page;
// //   const proxyPdfUrl = getProxyPdfUrl(driveUrl);
// //   const viewerUrl = proxyPdfUrl
// //     ? `/pdf-viewer?url=${encodeURIComponent(proxyPdfUrl)}&page=${pageNumber || 1}`
// //     : null;

// const driveUrl = question.source?.drive_url || "";
// const pageNumber = question.source?.page;
// const fileId = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
// const viewerUrl = fileId 
//   ? `/pdf-viewer?id=${fileId}&page=${pageNumber || 1}`
//   : null;


//   return (
//     <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
//       {/* Title & file name */}
//       <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//         <h1 className="text-2xl font-bold text-gray-900 leading-tight">
//           {question.content.question_text}
//         </h1>
//         {question.source?.file_name && (
//           <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm flex-shrink-0">
//             <FileText size={16} />
//             <span className="font-medium">{question.source.file_name}</span>
//           </div>
//         )}
//       </div>

//       {/* Introduction */}
//       {question.content.introduction && (
//         <div className="mt-6 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
//           {question.content.introduction}
//         </div>
//       )}

//       {/* Thinkers */}
//       {question.content.thinkers && question.content.thinkers.length > 0 && (
//         <div className="mt-6">
//           <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//             <User size={18} /> Thinkers & Concepts
//           </h3>
//           <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
//             {question.content.thinkers.map((t, i) => (
//               <div
//                 key={i}
//                 className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md text-sm"
//               >
//                 <span className="font-medium text-gray-700">{t.name}</span>
//                 {t.concept && (
//                   <span className="text-gray-500">– {t.concept}</span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Classification */}
//       <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//         <DetailItem
//           icon={<BookOpen size={16} />}
//           label="Chapter"
//           value={question.classification.chapter || "—"}
//         />
//         <DetailItem
//           icon={<Tag size={16} />}
//           label="Subtopic"
//           value={question.classification.subtopic || "—"}
//         />
//         <DetailItem
//           icon={<Globe size={16} />}
//           label="Paper"
//           value={
//             question.classification.optional_paper
//               ? `Optional Paper ${question.classification.optional_paper}`
//               : question.classification.gs_paper || "—"
//           }
//         />
//         <DetailItem
//           icon={<Globe size={16} />}
//           label="Language"
//           value={question.classification.language || "—"}
//         />
//         {question.enrichment.year && (
//           <DetailItem
//             icon={<Calendar size={16} />}
//             label="Year"
//             value={question.enrichment.year}
//           />
//         )}
//         {question.enrichment.marks && (
//           <DetailItem
//             icon={<Gauge size={16} />}
//             label="Marks"
//             value={question.enrichment.marks}
//           />
//         )}
//         {question.enrichment.difficulty && (
//           <DetailItem
//             icon={<Gauge size={16} />}
//             label="Difficulty"
//             value={question.enrichment.difficulty}
//           />
//         )}
//       </div>

//       {/* PDF Viewing Options */}
//       {driveUrl && (
//         <div className="mt-8 pt-6 border-t">
//           <div className="flex flex-wrap gap-4 items-center">
//             {/* Custom Viewer Button (uses proxy API) */}
//             {viewerUrl && (
//               <a
//                 href={viewerUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
//               >
//                 <ExternalLink size={16} />
//                 Open in Advanced Viewer
//                 {pageNumber ? ` (jumps to page ${pageNumber})` : ""}
//               </a>
//             )}

//             {/* Fallback Google Drive Link (original, no proxy) */}
//             <a
//               href={driveUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm"
//             >
//               <ExternalLink size={16} />
//               Open in Google Drive
//               {pageNumber ? ` (page ${pageNumber})` : ""}
//             </a>
//           </div>
//           <p className="mt-2 text-xs text-gray-400">
//             The advanced viewer opens the PDF in a new tab and automatically goes to the correct page.
//           </p>
//         </div>
//       )}

//       {/* Views */}
//       <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
//         <Eye size={14} />
//         {question.visitorCount || 0} views
//       </div>
//     </article>
//   );
// }

// function DetailItem({
//   icon,
//   label,
//   value,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: any;
// }) {
//   return (
//     <div className="flex items-center gap-2 text-gray-600">
//       <span className="text-gray-400">{icon}</span>
//       <div>
//         <div className="text-xs text-gray-400 uppercase">{label}</div>
//         <div className="font-medium text-gray-800">{value}</div>
//       </div>
//     </div>
//   );
// }

"use client";

import { IQuestion } from "@/models/Question";
import {
  FileText,
  User,
  BookOpen,
  Tag,
  Globe,
  Gauge,
  Calendar,
  ExternalLink,
  Eye,
} from "lucide-react";

// Extract file ID from Google Drive URL
function getFileId(driveUrl: string): string | null {
  if (!driveUrl) return null;
  const match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export default function QuestionDetail({ question }: { question: IQuestion }) {
  const driveUrl = question.source?.drive_url || "";
  const pageNumber = question.source?.page;
  const fileId = getFileId(driveUrl);
  const viewerUrl = fileId ? `/pdf-viewer?id=${fileId}&page=${pageNumber || 1}` : null;

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      {/* Title & file name */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {question.content.question_text}
        </h1>
        {question.source?.file_name && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm flex-shrink-0">
            <FileText size={16} />
            <span className="font-medium">{question.source.file_name}</span>
          </div>
        )}
      </div>

      {/* Introduction */}
      {question.content.introduction && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
          {question.content.introduction}
        </div>
      )}

      {/* Thinkers */}
      {question.content.thinkers && question.content.thinkers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User size={18} /> Thinkers & Concepts
          </h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.content.thinkers.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md text-sm"
              >
                <span className="font-medium text-gray-700">{t.name}</span>
                {t.concept && (
                  <span className="text-gray-500">– {t.concept}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classification */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <DetailItem
          icon={<BookOpen size={16} />}
          label="Chapter"
          value={question.classification.chapter || "—"}
        />
        <DetailItem
          icon={<Tag size={16} />}
          label="Subtopic"
          value={question.classification.subtopic || "—"}
        />
        <DetailItem
          icon={<Globe size={16} />}
          label="Paper"
          value={
            question.classification.optional_paper
              ? `Optional Paper ${question.classification.optional_paper}`
              : question.classification.gs_paper || "—"
          }
        />
        <DetailItem
          icon={<Globe size={16} />}
          label="Language"
          value={question.classification.language || "—"}
        />
        {question.enrichment.year && (
          <DetailItem
            icon={<Calendar size={16} />}
            label="Year"
            value={question.enrichment.year}
          />
        )}
        {question.enrichment.marks && (
          <DetailItem
            icon={<Gauge size={16} />}
            label="Marks"
            value={question.enrichment.marks}
          />
        )}
        {question.enrichment.difficulty && (
          <DetailItem
            icon={<Gauge size={16} />}
            label="Difficulty"
            value={question.enrichment.difficulty}
          />
        )}
      </div>

      {/* PDF Viewing Options */}
      {driveUrl && (
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Custom Viewer Button (uses file ID) */}
            {viewerUrl && (
              <a
                href={viewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                <ExternalLink size={16} />
                Open in Advanced Viewer
                {pageNumber ? ` (jumps to page ${pageNumber})` : ""}
              </a>
            )}

            {/* Fallback Google Drive Link */}
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm"
            >
              <ExternalLink size={16} />
              Open in Google Drive
              {pageNumber ? ` (page ${pageNumber})` : ""}
            </a>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            The advanced viewer opens the PDF in a new tab and automatically goes to the correct page.
          </p>
        </div>
      )}

      {/* Views */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
        <Eye size={14} />
        {question.visitorCount || 0} views
      </div>
    </article>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <span className="text-gray-400">{icon}</span>
      <div>
        <div className="text-xs text-gray-400 uppercase">{label}</div>
        <div className="font-medium text-gray-800">{value}</div>
      </div>
    </div>
  );
}