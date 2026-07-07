// Canonical categories keep charts/analytics from fragmenting when the AI
// picks different-but-equivalent labels ("Food & Drink", "Dining", "Food").
// The AI still decides the category freely; we only collapse synonyms here.

const CATEGORY_MAP: Record<string, string> = {
  // Food (eating out / general food)
  food: "Food",
  foods: "Food",
  "food & drink": "Food",
  "food and drink": "Food",
  "food & beverage": "Food",
  "food and beverage": "Food",
  "food & beverages": "Food",
  "food and beverages": "Food",
  dining: "Food",
  "dining out": "Food",
  "eating out": "Food",
  restaurant: "Food",
  restaurants: "Food",
  cafe: "Food",
  coffee: "Food",
  snacks: "Food",
  "fast food": "Food",
  meal: "Food",
  meals: "Food",
  lunch: "Food",
  dinner: "Food",
  breakfast: "Food",

  // Groceries
  grocery: "Groceries",
  groceries: "Groceries",
  supermarket: "Groceries",
  "grocery shopping": "Groceries",

  // Transport
  transport: "Transport",
  transportation: "Transport",
  travel: "Transport",
  commute: "Transport",
  fuel: "Transport",
  petrol: "Transport",
  gas: "Transport",
  gasoline: "Transport",
  diesel: "Transport",
  uber: "Transport",
  careem: "Transport",
  taxi: "Transport",
  cab: "Transport",
  ride: "Transport",
  rickshaw: "Transport",
  bus: "Transport",
  train: "Transport",
  metro: "Transport",
  fare: "Transport",
  parking: "Transport",

  // Utilities
  utility: "Utilities",
  utilities: "Utilities",
  bill: "Utilities",
  bills: "Utilities",
  electricity: "Utilities",
  "electricity bill": "Utilities",
  "power bill": "Utilities",
  power: "Utilities",
  water: "Utilities",
  "water bill": "Utilities",
  gasbill: "Utilities",
  "gas bill": "Utilities",
  internet: "Utilities",
  wifi: "Utilities",
  broadband: "Utilities",
  phone: "Utilities",
  "phone bill": "Utilities",
  mobile: "Utilities",

  // Rent / Housing
  rent: "Rent",
  housing: "Rent",
  mortgage: "Rent",
  accommodation: "Rent",

  // Shopping
  shopping: "Shopping",
  clothes: "Shopping",
  clothing: "Shopping",
  apparel: "Shopping",
  fashion: "Shopping",
  electronics: "Shopping",
  gadgets: "Shopping",

  // Entertainment
  entertainment: "Entertainment",
  movie: "Entertainment",
  movies: "Entertainment",
  cinema: "Entertainment",
  games: "Entertainment",
  gaming: "Entertainment",

  // Subscriptions
  subscription: "Subscriptions",
  subscriptions: "Subscriptions",
  netflix: "Subscriptions",
  spotify: "Subscriptions",
  youtube: "Subscriptions",
  "youtube premium": "Subscriptions",
  streaming: "Subscriptions",

  // Health
  health: "Health",
  healthcare: "Health",
  medical: "Health",
  medicine: "Health",
  pharmacy: "Health",
  doctor: "Health",
  hospital: "Health",
  gym: "Health",
  fitness: "Health",

  // Education
  education: "Education",
  tuition: "Education",
  course: "Education",
  courses: "Education",
  books: "Education",
  book: "Education",
  stationery: "Education",

  // Personal care
  "personal care": "Personal Care",
  grooming: "Personal Care",
  salon: "Personal Care",
  haircut: "Personal Care",

  // Income
  salary: "Salary",
  wage: "Salary",
  wages: "Salary",
  income: "Salary",
  paycheck: "Salary",
  payroll: "Salary",
  bonus: "Salary",
  refund: "Refund",
  cashback: "Refund",

  // Fallback bucket the AI sometimes emits
  other: "Other",
  miscellaneous: "Other",
  misc: "Other",
};

// Title-case a free label so unmapped categories are at least casing-consistent.
function titleCase(label: string): string {
  return label
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

export function normalizeCategory(category: string): string {
  const key = (category ?? "").trim().toLowerCase();
  if (!key) return "Other";
  return CATEGORY_MAP[key] ?? titleCase(category);
}
