"use client";
import { useState } from "react";
import { useBudget } from "../context/BudgetContext";

export default function RecurringPayments() {
  const {
    recurringPayments,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
  } = useBudget();
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    frequency: "",
    category: "",
    nextPayment: "",
    autoDeduct: false,
    isActive: true,
  });

  const frequencies = [
    { value: "weekly", label: "Weekly" },
    { value: "bi-weekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];

  const categories = [
    "Subscription Services",
    "Utilities",
    "Insurance",
    "Loan Payments",
    "Rent/Mortgage",
    "Internet/Phone",
    "Streaming Services",
    "Software",
    "Gym/Fitness",
    "Cloud Services",
    "Other",
  ];

  const calculateNextPayment = (lastPayment, frequency) => {
    const date = new Date(lastPayment);

    switch (frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "bi-weekly":
        date.setDate(date.getDate() + 14);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        break;
    }

    return date.toISOString().split("T")[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.description ||
      !formData.amount ||
      !formData.frequency ||
      !formData.nextPayment
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const paymentData = {
      ...formData,
      amount: parseFloat(formData.amount),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingPayment) {
      updateRecurringPayment({ ...paymentData, id: editingPayment.id });
      setEditingPayment(null);
    } else {
      addRecurringPayment(paymentData);
    }

    setFormData({
      description: "",
      amount: "",
      frequency: "",
      category: "",
      nextPayment: "",
      autoDeduct: false,
      isActive: true,
    });
    setShowForm(false);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      description: payment.description,
      amount: payment.amount.toString(),
      frequency: payment.frequency,
      category: payment.category,
      nextPayment: payment.nextPayment,
      autoDeduct: payment.autoDeduct,
      isActive: payment.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this recurring payment?")
    ) {
      deleteRecurringPayment(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPayment(null);
    setFormData({
      description: "",
      amount: "",
      frequency: "",
      category: "",
      nextPayment: "",
      autoDeduct: false,
      isActive: true,
    });
  };

  const processPayment = (payment) => {
    // Update next payment date
    const nextPayment = calculateNextPayment(
      payment.nextPayment,
      payment.frequency
    );
    updateRecurringPayment({
      ...payment,
      nextPayment,
      lastPayment: payment.nextPayment,
      updatedAt: new Date().toISOString(),
    });

    alert(
      `Payment processed! Next payment scheduled for ${new Date(
        nextPayment
      ).toLocaleDateString()}`
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getDaysUntilPayment = (nextPayment) => {
    const now = new Date();
    const paymentDate = new Date(nextPayment);
    const diffTime = paymentDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPaymentStatus = (nextPayment) => {
    const daysUntil = getDaysUntilPayment(nextPayment);

    if (daysUntil < 0)
      return { status: "overdue", color: "text-red-600 bg-red-50" };
    if (daysUntil === 0)
      return { status: "due-today", color: "text-orange-600 bg-orange-50" };
    if (daysUntil <= 7)
      return { status: "due-soon", color: "text-yellow-600 bg-yellow-50" };
    return { status: "upcoming", color: "text-green-600 bg-green-50" };
  };

  const sortedPayments = [...recurringPayments].sort(
    (a, b) => new Date(a.nextPayment) - new Date(b.nextPayment)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Recurring Payments
            </h1>
            <p className="text-gray-600">
              Track and manage your subscription and recurring payments
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Recurring Payment
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingPayment
              ? "Edit Recurring Payment"
              : "Add New Recurring Payment"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Netflix Subscription"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
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
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select frequency</option>
                  {frequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
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
                  Next Payment Date *
                </label>
                <input
                  type="date"
                  value={formData.nextPayment}
                  onChange={(e) =>
                    setFormData({ ...formData, nextPayment: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoDeduct}
                    onChange={(e) =>
                      setFormData({ ...formData, autoDeduct: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Auto-deduct
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
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
                {editingPayment ? "Update Payment" : "Add Payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recurring Payments List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Recurring Payments
          </h2>
          <p className="text-sm text-gray-600">
            Total: {recurringPayments.length} payments | Active:{" "}
            {recurringPayments.filter((p) => p.isActive).length}
          </p>
        </div>

        {sortedPayments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No recurring payments set up yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Add your first recurring payment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedPayments.map((payment) => {
              const paymentStatus = getPaymentStatus(payment.nextPayment);
              const daysUntil = getDaysUntilPayment(payment.nextPayment);

              return (
                <div key={payment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {payment.description}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatus.color}`}
                        >
                          {daysUntil < 0
                            ? "Overdue"
                            : daysUntil === 0
                            ? "Due Today"
                            : daysUntil <= 7
                            ? "Due Soon"
                            : "Upcoming"}
                        </span>
                        {!payment.isActive && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {formatCurrency(payment.amount)} • {payment.frequency}
                        </span>
                        {payment.category && <span>• {payment.category}</span>}
                        <span>
                          • Next:{" "}
                          {new Date(payment.nextPayment).toLocaleDateString()}
                        </span>
                        {payment.autoDeduct && <span>• Auto-deduct</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {payment.isActive && daysUntil <= 0 && (
                        <button
                          onClick={() => processPayment(payment)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Process Payment
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(payment)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(payment.id)}
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
