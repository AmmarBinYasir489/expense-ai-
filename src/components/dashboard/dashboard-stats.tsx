import { createClient } from "@/lib/supabase/server";


export default async function DashboardStats() {

  const supabase = await createClient();


  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();


  if (!user) {
    return null;
  }


  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id);



  if (!transactions || transactions.length === 0) {

    return (
      <div className="grid md:grid-cols-3 gap-6">

        <StatCard
          title="Total Spent"
          value="0 PKR"
        />

        <StatCard
          title="This Month"
          value="0 PKR"
        />

        <StatCard
          title="Top Category"
          value="No data"
        />

      </div>
    );

  }



  // Total expenses

  const totalSpent = transactions
    .filter(
      (item) => item.type === "expense"
    )
    .reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );



  // Current month

  const currentMonth =
    new Date().getMonth();


  const currentYear =
    new Date().getFullYear();



  const thisMonth = transactions
    .filter((item) => {

      const date =
        new Date(item.created_at);


      return (
        item.type === "expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );

    })
    .reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );



  // Top category

  const categories: Record<string, number> = {};


  transactions
    .filter(
      (item) => item.type === "expense"
    )
    .forEach((item) => {

      categories[item.category] =
        (categories[item.category] || 0)
        + Number(item.amount);

    });



  const topCategory =
    Object.entries(categories)
      .sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0]
      || "None";



  return (

    <div className="grid md:grid-cols-3 gap-6">

      <StatCard
        title="Total Spent"
        value={`${totalSpent} PKR`}
      />


      <StatCard
        title="This Month"
        value={`${thisMonth} PKR`}
      />


      <StatCard
        title="Top Category"
        value={topCategory}
      />


    </div>

  );

}



function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="bg-white rounded-2xl shadow p-6">

      <p className="text-gray-500">
        {title}
      </p>


      <h2 className="text-2xl font-bold mt-2">
        {value}
      </h2>


    </div>

  );

}