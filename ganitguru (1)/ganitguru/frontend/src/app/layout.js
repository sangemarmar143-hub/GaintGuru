import "./globals.css";

export const metadata = {
  title: "GanitGuru — AI Maths Tutor",
  description: "NCERT-aligned step-by-step maths help for Classes 6–12",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
