function generateInsights(transactions) {
  const insights = [];

  const foodSpent = transactions
    .filter(t => t.category === "Food")
    .reduce((a,b)=>a+(b.amount||0),0);

  if (foodSpent > 3000) {
    insights.push(
      "Your food spending is high this month. Consider reducing dining out."
    );
  }

  const transportSpent = transactions
    .filter(t => t.category === "Transport")
    .reduce((a,b)=>a+(b.amount||0),0);

  if (transportSpent > 2000) {
    insights.push(
      "Transport costs are rising. Try carpooling or public transport."
    );
  }

  if (insights.length === 0) {
    insights.push("Your spending is well balanced this month.");
  }

  return insights;
}

module.exports = { generateInsights };
