"use client";
import { useState } from "react";
import { useBudget } from "../context/BudgetContext";

export default function PaymentReminders() {
  const {
    paymentReminders,
    addPaymentReminder,
    updatePaymentReminder,
    deletePaymentReminder,
    markReminderComplete,
  } = useBudget();
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    dueDate: "",
    reminderDate: "",
    priority: "medium",
    category: "",
    isRecurring: false,
    recurringFrequency: "",
    paymentMethod: "",
    payeeName: "",
    accountNumber: "",
    notes: "",
  });

  const priorities = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    {
      value: "medium",
      label: "Medium",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "high", label: "High", color: "bg-red-100 text-red-800" },
  ];

  const frequencies = [
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];

  const categories = [
    "Credit Card",
    "Loan Payment",
    "Utility Bills",
    "Insurance",
    "Subscription",
    "Rent/Mortgage",
    "Tax Payment",
    "Medical Bills",
    "Other",
  ];

  const paymentMethods = [
    "Bank Transfer",
    "Credit Card",
    "Debit Card",
    "Check",
    "Cash",
    "Online Payment",
    "Auto-pay",
    "Other",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    const reminderData = {
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingReminder) {
      updatePaymentReminder({ ...reminderData, id: editingReminder.id });
      setEditingReminder(null);
    } else {
      addPaymentReminder(reminderData);
    }

    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      dueDate: "",
      reminderDate: "",
      priority: "medium",
      category: "",
      isRecurring: false,
      recurringFrequency: "",
      paymentMethod: "",
      payeeName: "",
      accountNumber: "",
      notes: "",
    });
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      amount: reminder.amount?.toString() || "",
      dueDate: reminder.dueDate,
      reminderDate: reminder.reminderDate || "",
      priority: reminder.priority,
      category: reminder.category || "",
      isRecurring: reminder.isRecurring || false,
      recurringFrequency: reminder.recurringFrequency || "",
      paymentMethod: reminder.paymentMethod || "",
      payeeName: reminder.payeeName || "",
      accountNumber: reminder.accountNumber || "",
      notes: reminder.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this payment reminder?")
    ) {
      deletePaymentReminder(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReminder(null);
    resetForm();
  };

  const handleCompleteReminder = (id) => {
    markReminderComplete(id);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getReminderStatus = (dueDate, completed) => {
    if (completed)
      return { status: "completed", color: "text-green-600 bg-green-50" };

    const daysUntil = getDaysUntilDue(dueDate);

    if (daysUntil < 0)
      return { status: "overdue", color: "text-red-600 bg-red-50" };
    if (daysUntil === 0)
      return { status: "due-today", color: "text-orange-600 bg-orange-50" };
    if (daysUntil <= 3)
      return { status: "due-soon", color: "text-yellow-600 bg-yellow-50" };
    return { status: "upcoming", color: "text-blue-600 bg-blue-50" };
  };

  const getPriorityColor = (priority) => {
    return (
      priorities.find((p) => p.value === priority)?.color ||
      "bg-gray-100 text-gray-800"
    );
  };

  // Sort reminders: overdue first, then by due date
  const sortedReminders = [...paymentReminders].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    if (a.completed && b.completed)
      return new Date(b.completedAt) - new Date(a.completedAt);

    const aDays = getDaysUntilDue(a.dueDate);
    const bDays = getDaysUntilDue(b.dueDate);

    if (aDays < 0 && bDays >= 0) return -1;
    if (aDays >= 0 && bDays < 0) return 1;

    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const activeReminders = paymentReminders.filter((r) => !r.completed);
  const overdueReminders = activeReminders.filter(
    (r) => getDaysUntilDue(r.dueDate) < 0
  );
  const todayReminders = activeReminders.filter(
    (r) => getDaysUntilDue(r.dueDate) === 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Reminders
            </h1>
            <p className="text-gray-600">
              Track due dates and never miss a payment
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Reminder
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">!</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {overdueReminders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Due Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {todayReminders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">⏰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {activeReminders.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {overdueReminders.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-600">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Overdue Payments
              </h3>
              <p className="text-sm text-red-700">
                You have {overdueReminders.length} overdue payment
                {overdueReminders.length > 1 ? "s" : ""} that need immediate
                attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingReminder
              ? "Edit Payment Reminder"
              : "Add New Payment Reminder"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Credit Card Payment"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Date
                </label>
                <input
                  type="date"
                  value={formData.reminderDate}
                  onChange={(e) =>
                    setFormData({ ...formData, reminderDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payee Name
                </label>
                <input
                  type="text"
                  value={formData.payeeName}
                  onChange={(e) =>
                    setFormData({ ...formData, payeeName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Who to pay"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional details about this payment..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Recurring Payment
                </span>
              </label>
              {formData.isRecurring && (
                <select
                  value={formData.recurringFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurringFrequency: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select frequency</option>
                  {frequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {editingReminder ? "Update Reminder" : "Add Reminder"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Reminders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Payment Reminders
          </h2>
          <p className="text-sm text-gray-600">
            Total: {paymentReminders.length} reminders | Active:{" "}
            {activeReminders.length} | Completed:{" "}
            {paymentReminders.filter((r) => r.completed).length}
          </p>
        </div>

        {sortedReminders.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No payment reminders set yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Add your first payment reminder
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedReminders.map((reminder) => {
              const reminderStatus = getReminderStatus(
                reminder.dueDate,
                reminder.completed
              );
              const daysUntilDue = getDaysUntilDue(reminder.dueDate);

              return (
                <div
                  key={reminder.id}
                  className={`p-6 hover:bg-gray-50 ${
                    reminder.completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3
                          className={`text-lg font-medium ${
                            reminder.completed
                              ? "line-through text-gray-500"
                              : "text-gray-900"
                          }`}
                        >
                          {reminder.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            reminder.priority
                          )}`}
                        >
                          {
                            priorities.find(
                              (p) => p.value === reminder.priority
                            )?.label
                          }
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${reminderStatus.color}`}
                        >
                          {reminder.completed
                            ? "Completed"
                            : daysUntilDue < 0
                            ? "Overdue"
                            : daysUntilDue === 0
                            ? "Due Today"
                            : daysUntilDue <= 3
                            ? "Due Soon"
                            : "Upcoming"}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <span>
                            <strong>Due:</strong>{" "}
                            {new Date(reminder.dueDate).toLocaleDateString()}
                          </span>
                          {reminder.amount && (
                            <span>
                              <strong>Amount:</strong>{" "}
                              {formatCurrency(reminder.amount)}
                            </span>
                          )}
                          {reminder.payeeName && (
                            <span>
                              <strong>Payee:</strong> {reminder.payeeName}
                            </span>
                          )}
                        </div>
                        {reminder.category && (
                          <p>
                            <strong>Category:</strong> {reminder.category}
                          </p>
                        )}
                        {reminder.description && (
                          <p>
                            <strong>Description:</strong> {reminder.description}
                          </p>
                        )}
                        {reminder.completed && (
                          <p>
                            <strong>Completed:</strong>{" "}
                            {new Date(
                              reminder.completedAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!reminder.completed && (
                        <button
                          onClick={() => handleCompleteReminder(reminder.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Mark Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(reminder)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
