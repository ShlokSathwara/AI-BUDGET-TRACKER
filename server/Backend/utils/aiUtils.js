function detectCategoryAndSub(text = "") {
  const t = text.toLowerCase();

  // 🍕 FOOD
  if (t.includes("pizza")) return { category: "Food", subcategory: "Pizza" };
  if (t.includes("burger")) return { category: "Food", subcategory: "Fast Food" };
  if (t.includes("dosa") || t.includes("idli"))
    return { category: "Food", subcategory: "South Indian" };
  if (t.includes("coffee") || t.includes("tea"))
    return { category: "Food", subcategory: "Beverages" };

  // 🚗 TRANSPORT
  if (t.includes("uber") || t.includes("ola"))
    return { category: "Transport", subcategory: "Cab" };
  if (t.includes("petrol") || t.includes("fuel"))
    return { category: "Transport", subcategory: "Fuel" };

  // 🛍 SHOPPING
  if (t.includes("amazon") || t.includes("flipkart"))
    return { category: "Shopping", subcategory: "Online" };

  // 📦 DEFAULT
  return { category: "Miscellaneous", subcategory: "Other" };
}

module.exports = { detectCategoryAndSub };
