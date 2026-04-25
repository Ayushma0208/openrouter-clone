import "./globals.css";

export const metadata = {
  title: "Auth Dashboard",
  description: "Login and dashboard example"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
