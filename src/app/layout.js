import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BudgetProvider } from "./context/BudgetContext";
import { ThemeProvider } from "./context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Budget Manager",
  description:
    "Track your expenses, recurring payments, credit card offers, and payment reminders",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <BudgetProvider>{children}</BudgetProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
