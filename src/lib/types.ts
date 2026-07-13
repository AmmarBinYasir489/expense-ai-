export type Loan = {
  id: string;
  user_id: string;
  direction: "lent" | "borrowed";
  person: string;
  amount: number;
  currency: string | null;
  due_date: string | null;
  description: string | null;
  status: "outstanding" | "repaid";
  repaid_at: string | null;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: "expense" | "income";
  amount: number;
  category: string;
  currency: string | null;
  description: string | null;
  date: string | null;
  confidence: number | null;
  created_at: string;
};
