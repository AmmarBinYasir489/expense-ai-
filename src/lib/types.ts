export type Transaction = {
  id: string;
  user_id: string;
  type: "expense" | "income";
  amount: number;
  category: string;
  description: string | null;
  date: string | null;
  confidence: number | null;
  created_at: string;
};
