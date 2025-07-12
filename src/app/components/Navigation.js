"use client";
import { useState } from "react";
import { useBudget } from "../context/BudgetContext";

export default function Navigation({ currentPage, setCurrentPage }) {
  const { paymentReminders } = useBudget();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Count pending reminders
  const pendingReminders = paymentReminders.filter(
    (reminder) =>
      !reminder.completed && new Date(reminder.dueDate) <= new Date()
  ).length;

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "expenses", name: "Expenses", icon: "💰" },
    { id: "recurring", name: "Recurring Payments", icon: "🔄" },
    { id: "credit-cards", name: "Credit Card Offers", icon: "💳" },
    {
      id: "reminders",
      name: "Payment Reminders",
      icon: "⏰",
      badge: pendingReminders > 0 ? pendingReminders : null,
    },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">💰</span>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Budget Manager
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`nav-link relative ${
                  currentPage === item.id
                    ? "nav-link-active"
                    : "nav-link-inactive"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMenuOpen(false);
                }}
                className={`nav-link relative block w-full text-left ${
                  currentPage === item.id
                    ? "nav-link-active"
                    : "nav-link-inactive"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
                {item.badge && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
