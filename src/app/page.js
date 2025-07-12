"use client";
import { useState } from "react";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import ExpenseTracker from "./components/ExpenseTracker";
import RecurringPayments from "./components/RecurringPayments";
import CreditCardOffers from "./components/CreditCardOffers";
import PaymentReminders from "./components/PaymentReminders";

export default function Home() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "expenses":
        return <ExpenseTracker />;
      case "recurring":
        return <RecurringPayments />;
      case "credit-cards":
        return <CreditCardOffers />;
      case "reminders":
        return <PaymentReminders />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{renderCurrentPage()}</div>
      </main>
    </div>
  );
}
