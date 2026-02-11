// Format currency to Indonesian Rupiah
export const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format number with thousand separators
export const formatNumber = (number) => {
  return new Intl.NumberFormat("id-ID").format(number);
};

// Format date to Indonesian format
export const formatDate = (date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

// Format date to short format
export const formatDateShort = (date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

// Calculate percentage
export const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    Draft: "bg-gray-100 text-gray-600",
    "In Progress": "bg-blue-100 text-blue-600",
    "On Hold": "bg-orange-100 text-orange-600",
    Completed: "bg-emerald-100 text-emerald-600",
    Pending: "bg-orange-100 text-orange-600",
    Paid: "bg-emerald-100 text-emerald-600",
    Received: "bg-emerald-100 text-emerald-600",
    Unpaid: "bg-red-100 text-red-600",
    Done: "bg-green-100 text-green-600",
    "Waiting Approval": "bg-orange-100 text-orange-600",
    Scripting: "bg-gray-100 text-gray-600",
    Filming: "bg-blue-100 text-blue-600",
    Editing: "bg-purple-100 text-purple-600",
    "Preview Ready": "bg-orange-100 text-orange-700",
    "Master Ready": "bg-green-100 text-green-700",
  };

  return colors[status] || "bg-gray-100 text-gray-600";
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

// Check if date is past
export const isPastDeadline = (date) => {
  return new Date(date) < new Date();
};

// Get time remaining
export const getTimeRemaining = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;

  if (diff <= 0) {
    return "Overdue";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? "s" : ""} remaining`;
  }

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} remaining`;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
};

// Parse number input (remove formatting)
export const parseNumberInput = (value) => {
  if (!value) return 0;
  // Handle numeric values directly (including decimals like 10000.00 from database)
  if (typeof value === "number") {
    return Math.round(value);
  }
  // For strings with Indonesian thousand separator (.), remove all non-digits
  return parseInt(value.toString().replace(/[^0-9]/g, "")) || 0;
};

// Format number input (add thousand separator)
export const formatNumberInput = (value) => {
  if (!value) return "";
  const number = parseNumberInput(value);
  return number.toLocaleString("id-ID");
};
