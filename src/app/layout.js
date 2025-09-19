import { Figtree, Geist_Mono, Pacifico, EB_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const figtreeSans = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const pacificoHand = Pacifico({
  variable: "--font-pacifico",
  weight: ["400"],
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  weight: ["400"],
  style: ["italic"],
  subsets: ["latin"],
});

export const metadata = {
  title: "RavenAI — Transform your meetings into actionable tasks",
  description: "AI-powered meeting transcription and note-taking. Fully open-source. Powered by AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${figtreeSans.variable} ${pacificoHand.variable} ${ebGaramond.variable} antialiased bg-black`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
