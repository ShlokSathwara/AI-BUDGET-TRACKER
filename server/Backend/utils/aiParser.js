const categories = {
  Food: ["pizza", "burger", "dosa", "idli", "coffee", "tea", "swiggy", "zomato"],
  Transport: ["uber", "ola", "metro", "fuel", "petrol", "diesel"],
  Shopping: ["amazon", "flipkart", "myntra"],
  Bills: ["electricity", "wifi", "rent", "recharge"]
};

function extractAmount(text) {
  const match = text.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : null;
}

function detectCategory(text) {
  const t = text.toLowerCase();

  for (const category in categories) {
    for (const keyword of categories[category]) {
      if (t.includes(keyword)) {
        return {
          category,
          subcategory: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          confidence: 0.9
        };
      }
    }
  }

  return {
    category: "Miscellaneous",
    subcategory: "Other",
    confidence: 0.4
  };
}

function parseTransaction(text) {
  const amount = extractAmount(text);
  const catData = detectCategory(text);

  return {
    amount,
    category: catData.category,
    subcategory: catData.subcategory,
    description: text,
    confidence: catData.confidence
  };
}

module.exports = { parseTransaction };
