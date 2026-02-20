function detectAnomalies(transactions) {
  const avg =
    transactions.reduce((a,b)=>a+(b.amount||0),0) /
    (transactions.length || 1);

  return transactions.filter(t => (t.amount||0) > avg * 2);
}

module.exports = { detectAnomalies };
