"use client";
import { useState } from "react";
import { useBudget } from "../context/BudgetContext";

export default function CreditCardOffers() {
  const {
    creditCardOffers,
    addCreditCardOffer,
    updateCreditCardOffer,
    deleteCreditCardOffer,
  } = useBudget();
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    cardName: "",
    bankName: "",
    offerType: "",
    rewardAmount: "",
    requirementAmount: "",
    expirationDate: "",
    annualFee: "",
    description: "",
    status: "active",
    applicationDate: "",
    approvalDate: "",
    completionDate: "",
    notes: "",
  });

  const offerTypes = [
    { value: "signup-bonus", label: "Sign-up Bonus" },
    { value: "cashback", label: "Cashback Offer" },
    { value: "points", label: "Points/Miles" },
    { value: "balance-transfer", label: "Balance Transfer" },
    { value: "no-annual-fee", label: "No Annual Fee" },
    { value: "intro-apr", label: "Intro APR" },
    { value: "other", label: "Other" },
  ];

  const statuses = [
    { value: "active", label: "Active" },
    { value: "applied", label: "Applied" },
    { value: "approved", label: "Approved" },
    { value: "completed", label: "Completed" },
    { value: "expired", label: "Expired" },
    { value: "declined", label: "Declined" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.cardName ||
      !formData.bankName ||
      !formData.offerType ||
      !formData.expirationDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const offerData = {
      ...formData,
      rewardAmount: formData.rewardAmount
        ? parseFloat(formData.rewardAmount)
        : null,
      requirementAmount: formData.requirementAmount
        ? parseFloat(formData.requirementAmount)
        : null,
      annualFee: formData.annualFee ? parseFloat(formData.annualFee) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingOffer) {
      updateCreditCardOffer({ ...offerData, id: editingOffer.id });
      setEditingOffer(null);
    } else {
      addCreditCardOffer(offerData);
    }

    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      cardName: "",
      bankName: "",
      offerType: "",
      rewardAmount: "",
      requirementAmount: "",
      expirationDate: "",
      annualFee: "",
      description: "",
      status: "active",
      applicationDate: "",
      approvalDate: "",
      completionDate: "",
      notes: "",
    });
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      cardName: offer.cardName,
      bankName: offer.bankName,
      offerType: offer.offerType,
      rewardAmount: offer.rewardAmount?.toString() || "",
      requirementAmount: offer.requirementAmount?.toString() || "",
      expirationDate: offer.expirationDate,
      annualFee: offer.annualFee?.toString() || "",
      description: offer.description || "",
      status: offer.status,
      applicationDate: offer.applicationDate || "",
      approvalDate: offer.approvalDate || "",
      completionDate: offer.completionDate || "",
      notes: offer.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this credit card offer?")
    ) {
      deleteCreditCardOffer(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOffer(null);
    resetForm();
  };

  const updateOfferStatus = (id, newStatus) => {
    const offer = creditCardOffers.find((o) => o.id === id);
    if (offer) {
      const updatedOffer = {
        ...offer,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      // Set completion date if status is completed
      if (newStatus === "completed") {
        updatedOffer.completionDate = new Date().toISOString().split("T")[0];
      }

      updateCreditCardOffer(updatedOffer);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getDaysUntilExpiration = (expirationDate) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationStatus = (expirationDate) => {
    const daysUntil = getDaysUntilExpiration(expirationDate);

    if (daysUntil < 0)
      return { status: "expired", color: "text-red-600 bg-red-50" };
    if (daysUntil <= 7)
      return { status: "expiring-soon", color: "text-orange-600 bg-orange-50" };
    if (daysUntil <= 30)
      return {
        status: "expiring-month",
        color: "text-yellow-600 bg-yellow-50",
      };
    return { status: "active", color: "text-green-600 bg-green-50" };
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sortedOffers = [...creditCardOffers].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (a.status !== "active" && b.status === "active") return 1;
    return new Date(a.expirationDate) - new Date(b.expirationDate);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Credit Card Offers
            </h1>
            <p className="text-gray-600">
              Track and manage your credit card offers and rewards
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Credit Card Offer
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingOffer
              ? "Edit Credit Card Offer"
              : "Add New Credit Card Offer"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Name *
                </label>
                <input
                  type="text"
                  value={formData.cardName}
                  onChange={(e) =>
                    setFormData({ ...formData, cardName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Chase Sapphire Preferred"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Chase Bank"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Type *
                </label>
                <select
                  value={formData.offerType}
                  onChange={(e) =>
                    setFormData({ ...formData, offerType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select offer type</option>
                  {offerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reward Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rewardAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, rewardAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 60000 (points) or 200 (dollars)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirement Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.requirementAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirementAmount: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum spending requirement"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Fee
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.annualFee}
                  onChange={(e) =>
                    setFormData({ ...formData, annualFee: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date *
                </label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
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
                placeholder="Additional details about the offer..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Date
                </label>
                <input
                  type="date"
                  value={formData.applicationDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicationDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Date
                </label>
                <input
                  type="date"
                  value={formData.approvalDate}
                  onChange={(e) =>
                    setFormData({ ...formData, approvalDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completion Date
                </label>
                <input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) =>
                    setFormData({ ...formData, completionDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Personal notes about this offer..."
              />
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
                {editingOffer ? "Update Offer" : "Add Offer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credit Card Offers List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Credit Card Offers
          </h2>
          <p className="text-sm text-gray-600">
            Total: {creditCardOffers.length} offers | Active:{" "}
            {creditCardOffers.filter((o) => o.status === "active").length} |
            Completed:{" "}
            {creditCardOffers.filter((o) => o.status === "completed").length}
          </p>
        </div>

        {sortedOffers.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No credit card offers tracked yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Add your first credit card offer
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedOffers.map((offer) => {
              const expirationStatus = getExpirationStatus(
                offer.expirationDate
              );
              const daysUntilExpiration = getDaysUntilExpiration(
                offer.expirationDate
              );

              return (
                <div key={offer.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {offer.cardName}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                            offer.status
                          )}`}
                        >
                          {
                            statuses.find((s) => s.value === offer.status)
                              ?.label
                          }
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${expirationStatus.color}`}
                        >
                          {daysUntilExpiration < 0
                            ? "Expired"
                            : daysUntilExpiration <= 7
                            ? "Expiring Soon"
                            : "Active"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {offer.bankName}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>
                            <span className="font-medium">Offer Type:</span>{" "}
                            {
                              offerTypes.find(
                                (t) => t.value === offer.offerType
                              )?.label
                            }
                          </p>
                          {offer.rewardAmount && (
                            <p>
                              <span className="font-medium">Reward:</span>{" "}
                              {offer.rewardAmount.toLocaleString()}
                            </p>
                          )}
                          {offer.requirementAmount && (
                            <p>
                              <span className="font-medium">Requirement:</span>{" "}
                              {formatCurrency(offer.requirementAmount)}
                            </p>
                          )}
                        </div>
                        <div>
                          <p>
                            <span className="font-medium">Expires:</span>{" "}
                            {new Date(
                              offer.expirationDate
                            ).toLocaleDateString()}
                          </p>
                          {offer.annualFee !== null && (
                            <p>
                              <span className="font-medium">Annual Fee:</span>{" "}
                              {formatCurrency(offer.annualFee)}
                            </p>
                          )}
                          {offer.applicationDate && (
                            <p>
                              <span className="font-medium">Applied:</span>{" "}
                              {new Date(
                                offer.applicationDate
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {offer.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {offer.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={offer.status}
                        onChange={(e) =>
                          updateOfferStatus(offer.id, e.target.value)
                        }
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {statuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleEdit(offer)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
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
