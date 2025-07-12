"use client";
import { useBudget } from "../context/BudgetContext";
import { useMemo } from "react";

export default function Dashboard() {
  const { expenses, recurringPayments, creditCardOffers, paymentReminders } =
    useBudget();

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Monthly expenses
    const monthlyExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    const totalMonthlyExpenses = monthlyExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Category breakdown
    const categoryBreakdown = {};
    monthlyExpenses.forEach((expense) => {
      categoryBreakdown[expense.category] =
        (categoryBreakdown[expense.category] || 0) + expense.amount;
    });

    // Upcoming payments (next 7 days)
    const upcomingPayments = recurringPayments.filter((payment) => {
      const nextPaymentDate = new Date(payment.nextPayment);
      const diffTime = nextPaymentDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    });

    // Overdue reminders
    const overdueReminders = paymentReminders.filter(
      (reminder) => !reminder.completed && new Date(reminder.dueDate) < now
    );

    // Active credit card offers
    const activeCreditCardOffers = creditCardOffers.filter((offer) => {
      const expirationDate = new Date(offer.expirationDate);
      return expirationDate > now;
    });

    // Monthly recurring payments total
    const monthlyRecurringTotal = recurringPayments.reduce((sum, payment) => {
      if (payment.frequency === "monthly") return sum + payment.amount;
      if (payment.frequency === "weekly") return sum + payment.amount * 4.33;
      if (payment.frequency === "yearly") return sum + payment.amount / 12;
      return sum;
    }, 0);

    return {
      totalMonthlyExpenses,
      categoryBreakdown,
      upcomingPayments,
      overdueReminders,
      activeCreditCardOffers,
      monthlyRecurringTotal,
      expenseCount: monthlyExpenses.length,
    };
  }, [expenses, recurringPayments, creditCardOffers, paymentReminders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your financial activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Expenses */}
        <div className="card card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Monthly Expenses
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(dashboardStats.totalMonthlyExpenses)}
              </p>
              <p className="text-sm text-gray-500">
                {dashboardStats.expenseCount} transactions
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Recurring */}
        <div className="card card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">🔄</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Monthly Recurring
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(dashboardStats.monthlyRecurringTotal)}
              </p>
              <p className="text-sm text-gray-500">
                {recurringPayments.length} subscriptions
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="card card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Upcoming Payments
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.upcomingPayments.length}
              </p>
              <p className="text-sm text-gray-500">Next 7 days</p>
            </div>
          </div>
        </div>

        {/* Overdue Reminders */}
        <div className="card card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Overdue Reminders
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.overdueReminders.length}
              </p>
              <p className="text-sm text-gray-500">Need attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly Expenses by Category
            </h3>
          </div>
          {Object.keys(dashboardStats.categoryBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(dashboardStats.categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div
                    key={category}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600 capitalize">
                      {category}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No expenses recorded this month
            </p>
          )}
        </div>

        {/* Upcoming Payments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Payments
            </h3>
          </div>
          {dashboardStats.upcomingPayments.length > 0 ? (
            <div className="space-y-3">
              {dashboardStats.upcomingPayments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.nextPayment).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No upcoming payments in the next 7 days
            </p>
          )}
        </div>
      </div>

      {/* Alerts */}
      {dashboardStats.overdueReminders.length > 0 && (
        <div className="status-overdue rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Overdue Reminders
              </h3>
              <p className="text-sm text-red-700">
                You have {dashboardStats.overdueReminders.length} overdue
                payment reminder
                {dashboardStats.overdueReminders.length > 1 ? "s" : ""} that
                need attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Credit Card Offers */}
      {dashboardStats.activeCreditCardOffers.length > 0 && (
        <div className="status-upcoming rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-blue-600">💳</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Active Credit Card Offers
              </h3>
              <p className="text-sm text-blue-700">
                You have {dashboardStats.activeCreditCardOffers.length} active
                credit card offer
                {dashboardStats.activeCreditCardOffers.length > 1 ? "s" : ""} to
                track.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
