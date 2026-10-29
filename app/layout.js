import "./globals.css";

export const metadata = {
  title: "SpendPace — Autonomous Spend Velocity & Smart Budgeting",
  description: "AI-Powered Personal Finance Manager with Real-Time Safe-to-Spend Velocity & Multimodal Ingestion",
};

export const viewport = {
  themeColor: "#121316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('spendpace_theme');
                  var isDark = saved ? saved === 'dark' : true;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#121316] text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
