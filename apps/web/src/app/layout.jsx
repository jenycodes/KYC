import "./globals.css";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import AuthBootstrap from "../components/AuthBootstrap.jsx";

export const metadata = {
  title: "Secure KYC — Identity Verification",
  description: "Secure sign in and account registration for the KYC Verification System.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthBootstrap />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
