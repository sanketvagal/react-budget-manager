"use client";
import { createContext, useContext, useReducer, useEffect } from "react";

// Action types
const ACTIONS = {
  // Expenses
  ADD_EXPENSE: "ADD_EXPENSE",
  UPDATE_EXPENSE: "UPDATE_EXPENSE",
  DELETE_EXPENSE: "DELETE_EXPENSE",

  // Recurring payments
  ADD_RECURRING_PAYMENT: "ADD_RECURRING_PAYMENT",
  UPDATE_RECURRING_PAYMENT: "UPDATE_RECURRING_PAYMENT",
  DELETE_RECURRING_PAYMENT: "DELETE_RECURRING_PAYMENT",

  // Credit card offers
  ADD_CREDIT_CARD_OFFER: "ADD_CREDIT_CARD_OFFER",
  UPDATE_CREDIT_CARD_OFFER: "UPDATE_CREDIT_CARD_OFFER",
  DELETE_CREDIT_CARD_OFFER: "DELETE_CREDIT_CARD_OFFER",

  // Payment reminders
  ADD_PAYMENT_REMINDER: "ADD_PAYMENT_REMINDER",
  UPDATE_PAYMENT_REMINDER: "UPDATE_PAYMENT_REMINDER",
  DELETE_PAYMENT_REMINDER: "DELETE_PAYMENT_REMINDER",
  MARK_REMINDER_COMPLETE: "MARK_REMINDER_COMPLETE",

  // Load data
  LOAD_DATA: "LOAD_DATA",
};

// Initial state
const initialState = {
  expenses: [],
  recurringPayments: [],
  creditCardOffers: [],
  paymentReminders: [],
  loading: false,
  error: null,
};

// Reducer function
function budgetReducer(state, action) {
  switch (action.type) {
    // Expenses
    case ACTIONS.ADD_EXPENSE:
      return {
        ...state,
        expenses: [
          ...state.expenses,
          { ...action.payload, id: Date.now().toString() },
        ],
      };
    case ACTIONS.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case ACTIONS.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(
          (expense) => expense.id !== action.payload
        ),
      };

    // Recurring payments
    case ACTIONS.ADD_RECURRING_PAYMENT:
      return {
        ...state,
        recurringPayments: [
          ...state.recurringPayments,
          { ...action.payload, id: Date.now().toString() },
        ],
      };
    case ACTIONS.UPDATE_RECURRING_PAYMENT:
      return {
        ...state,
        recurringPayments: state.recurringPayments.map((payment) =>
          payment.id === action.payload.id ? action.payload : payment
        ),
      };
    case ACTIONS.DELETE_RECURRING_PAYMENT:
      return {
        ...state,
        recurringPayments: state.recurringPayments.filter(
          (payment) => payment.id !== action.payload
        ),
      };

    // Credit card offers
    case ACTIONS.ADD_CREDIT_CARD_OFFER:
      return {
        ...state,
        creditCardOffers: [
          ...state.creditCardOffers,
          { ...action.payload, id: Date.now().toString() },
        ],
      };
    case ACTIONS.UPDATE_CREDIT_CARD_OFFER:
      return {
        ...state,
        creditCardOffers: state.creditCardOffers.map((offer) =>
          offer.id === action.payload.id ? action.payload : offer
        ),
      };
    case ACTIONS.DELETE_CREDIT_CARD_OFFER:
      return {
        ...state,
        creditCardOffers: state.creditCardOffers.filter(
          (offer) => offer.id !== action.payload
        ),
      };

    // Payment reminders
    case ACTIONS.ADD_PAYMENT_REMINDER:
      return {
        ...state,
        paymentReminders: [
          ...state.paymentReminders,
          { ...action.payload, id: Date.now().toString() },
        ],
      };
    case ACTIONS.UPDATE_PAYMENT_REMINDER:
      return {
        ...state,
        paymentReminders: state.paymentReminders.map((reminder) =>
          reminder.id === action.payload.id ? action.payload : reminder
        ),
      };
    case ACTIONS.DELETE_PAYMENT_REMINDER:
      return {
        ...state,
        paymentReminders: state.paymentReminders.filter(
          (reminder) => reminder.id !== action.payload
        ),
      };
    case ACTIONS.MARK_REMINDER_COMPLETE:
      return {
        ...state,
        paymentReminders: state.paymentReminders.map((reminder) =>
          reminder.id === action.payload
            ? {
                ...reminder,
                completed: true,
                completedAt: new Date().toISOString(),
              }
            : reminder
        ),
      };

    // Load data
    case ACTIONS.LOAD_DATA:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

// Create context
const BudgetContext = createContext();

// Provider component
export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("budget-app-data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ACTIONS.LOAD_DATA, payload: parsedData });
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("budget-app-data", JSON.stringify(state));
  }, [state]);

  // Action creators
  const actions = {
    // Expenses
    addExpense: (expense) =>
      dispatch({ type: ACTIONS.ADD_EXPENSE, payload: expense }),
    updateExpense: (expense) =>
      dispatch({ type: ACTIONS.UPDATE_EXPENSE, payload: expense }),
    deleteExpense: (id) =>
      dispatch({ type: ACTIONS.DELETE_EXPENSE, payload: id }),

    // Recurring payments
    addRecurringPayment: (payment) =>
      dispatch({ type: ACTIONS.ADD_RECURRING_PAYMENT, payload: payment }),
    updateRecurringPayment: (payment) =>
      dispatch({ type: ACTIONS.UPDATE_RECURRING_PAYMENT, payload: payment }),
    deleteRecurringPayment: (id) =>
      dispatch({ type: ACTIONS.DELETE_RECURRING_PAYMENT, payload: id }),

    // Credit card offers
    addCreditCardOffer: (offer) =>
      dispatch({ type: ACTIONS.ADD_CREDIT_CARD_OFFER, payload: offer }),
    updateCreditCardOffer: (offer) =>
      dispatch({ type: ACTIONS.UPDATE_CREDIT_CARD_OFFER, payload: offer }),
    deleteCreditCardOffer: (id) =>
      dispatch({ type: ACTIONS.DELETE_CREDIT_CARD_OFFER, payload: id }),

    // Payment reminders
    addPaymentReminder: (reminder) =>
      dispatch({ type: ACTIONS.ADD_PAYMENT_REMINDER, payload: reminder }),
    updatePaymentReminder: (reminder) =>
      dispatch({ type: ACTIONS.UPDATE_PAYMENT_REMINDER, payload: reminder }),
    deletePaymentReminder: (id) =>
      dispatch({ type: ACTIONS.DELETE_PAYMENT_REMINDER, payload: id }),
    markReminderComplete: (id) =>
      dispatch({ type: ACTIONS.MARK_REMINDER_COMPLETE, payload: id }),
  };

  return (
    <BudgetContext.Provider value={{ ...state, ...actions }}>
      {children}
    </BudgetContext.Provider>
  );
}

// Custom hook to use the budget context
export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}

export { ACTIONS };
