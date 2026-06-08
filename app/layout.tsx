import type { Metadata } from "next";
import "./globals.css";
import { ensureSubjectsSeeded, ensureQuestionsSeeded } from "@/lib/initDB";

export const metadata: Metadata = {
  title: "Topper Copies – UPSC Answer Library",
  description: "Browse topper answer copies for GS and Optional subjects.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //Seed subjects first (so they exist when we link questions)
//   await ensureSubjectsSeeded();
//   // Seed questions (links to subjects)
//   await ensureQuestionsSeeded();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow-sm py-4 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="/" className="text-xl font-bold text-blue-800">
              Topper Copies
            </a>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}