import "./globals.css";

export const metadata = {
  title: "Mihon",
  description: "Mihon • Müzik Oynatici",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="dark">
      <body className="bg-[#09090B] text-zinc-100 antialiased selection:bg-[#F06B3C]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

