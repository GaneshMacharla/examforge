import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'ExamForge — Competitive Exam Practice Question Bundles',
  description: 'High-quality practice question bundles for SSC, Banking, RRB, and State PSC exams with step-by-step solutions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">ExamForge</span>
              <span>— Affordable Question Bundles for Serious Aspirants</span>
            </div>
            <div className="text-xs text-slate-400">
              Pay-per-bundle model • Razorpay Verified • Instant Practice
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
