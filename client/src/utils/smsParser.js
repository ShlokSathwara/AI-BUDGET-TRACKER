// SMS Parser utility for extracting transaction details from bank SMS

export const parseBankSMS = (smsText) => {
  // Clean the SMS text
  const cleanText = smsText.replace(/[^\w\s\-\.\,\₹\$\%\&\*\#\@\!\?\;\:\(\)\[\]\{\}\<\>\+\=\|\/]/gi, ' ').trim();
  
  // Common patterns for different banks
  const patterns = [
    // Pattern for debit transactions
    {
      type: 'debit',
      regex: /(?:debited|withdrawn|used|spent|charged|deducted).*?([\d,]+\.?\d*)/i,
      amountIndex: 1
    },
    // Pattern for credit transactions  
    {
      type: 'credit',
      regex: /(?:credited|added|received|deposit).*?([\d,]+\.?\d*)/i,
      amountIndex: 1
    },
    // Alternative debit pattern with INR
    {
      type: 'debit',
      regex: /(?:INR|Rs\.?)\s*([\d,]+\.?\d*)/i,
      amountIndex: 1
    }
  ];

  // Try to extract amount and type
  let amount = null;
  let type = null;
  
  for (const pattern of patterns) {
    const match = cleanText.match(pattern.regex);
    if (match && match[pattern.amountIndex]) {
      amount = parseFloat(match[pattern.amountIndex].replace(/,/g, ''));
      type = pattern.type;
      break;
    }
  }

  // Extract merchant/recipient information
  const merchantMatch = cleanText.match(/(?:at|to|from|on\s+)?([A-Z0-9\s]{5,30})/i);
  let merchant = merchantMatch ? merchantMatch[1].trim() : 'Bank Transaction';

  // Extract last 4 digits of account/card
  const accountMatch = cleanText.match(/(?:ACC|CARD|A\/C).*?(?:\*{0,4})?(\d{4})/i);
  const lastFourDigits = accountMatch ? accountMatch[1] : null;

  // Extract category based on keywords
  const category = extractCategory(cleanText);

  // Extract date if present
  const dateMatch = cleanText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  const date = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();

  if (amount && lastFourDigits) {
    return {
      amount: Math.abs(amount),
      type: type || 'debit',
      merchant: merchant,
      category: category,
      date: date,
      lastFourDigits: lastFourDigits,
      originalSMS: smsText
    };
  }

  return null;
};

const extractCategory = (text) => {
  const lowerText = text.toLowerCase();
  
  // Define category keywords
  const categories = {
    'Food & Dining': ['food', 'restaurant', 'cafe', 'meal', 'eat', 'pizza', 'burger', 'coffee', 'dine'],
    'Transportation': ['uber', 'ola', 'cab', 'metro', 'bus', 'fuel', 'petrol', 'gas', 'travel', 'taxi'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'shop', 'store', 'purchase', 'buy', 'retail'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'disney', 'spotify', 'music', 'game', 'stream'],
    'Utilities': ['electricity', 'water', 'bill', 'power', 'gas', 'utility', 'broadband', 'internet'],
    'Healthcare': ['hospital', 'medicine', 'pharma', 'health', 'medical', 'doctor', 'clinic'],
    'Education': ['school', 'college', 'course', 'book', 'education', 'tuition', 'fee'],
    'Travel': ['flight', 'hotel', 'airline', 'booking', 'trip', 'vacation', 'holiday'],
    'Investment': ['mf', 'mutual', 'stock', 'investment', 'sip', 'equity', 'bond']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
};

// Specific parser for different bank formats
export const parseSpecificBankSMS = (smsText, bankName = null) => {
  const lowerText = smsText.toLowerCase();
  
  // SBI format example: "INR 1,234.56 debited from A/C XXXX1234 on 01/01/2024. Available bal: INR 5,678.90"
  if (lowerText.includes('sbi') || lowerText.includes('state bank')) {
    const amountMatch = smsText.match(/INR\s+([\d,]+\.?\d*)/);
    const accountMatch = smsText.match(/A\/C.*?(\d{4})/);
    const dateMatch = smsText.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    
    if (amountMatch && accountMatch) {
      return {
        amount: parseFloat(amountMatch[1].replace(/,/g, '')),
        type: 'debit',
        merchant: 'SBI Transaction',
        category: extractCategory(smsText),
        date: dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString(),
        lastFourDigits: accountMatch[1],
        originalSMS: smsText
      };
    }
  }
  
  // HDFC format example: "Rs.1234.56 debited from A/C XXXX1234 on 01-Jan-2024. Avl Bal: Rs.5678.90"
  if (lowerText.includes('hdfc')) {
    const amountMatch = smsText.match(/Rs\.?([\d,]+\.?\d*)/);
    const accountMatch = smsText.match(/A\/C.*?(\d{4})/);
    
    if (amountMatch && accountMatch) {
      return {
        amount: parseFloat(amountMatch[1].replace(/,/g, '')),
        type: 'debit',
        merchant: 'HDFC Transaction',
        category: extractCategory(smsText),
        date: new Date().toISOString(),
        lastFourDigits: accountMatch[1],
        originalSMS: smsText
      };
    }
  }
  
  // ICICI format example: "Your A/C XX1234 is debited by Rs.1234.56 on 01-Jan-2024 for SOME MERCHANT"
  if (lowerText.includes('icici')) {
    const amountMatch = smsText.match(/by\s+Rs\.?([\d,]+\.?\d*)/);
    const accountMatch = smsText.match(/A\/C.*?(\d{4})/);
    const merchantMatch = smsText.match(/for\s+([A-Z\s]+)/);
    
    if (amountMatch && accountMatch) {
      return {
        amount: parseFloat(amountMatch[1].replace(/,/g, '')),
        type: 'debit',
        merchant: merchantMatch ? merchantMatch[1].trim() : 'ICICI Transaction',
        category: extractCategory(smsText),
        date: new Date().toISOString(),
        lastFourDigits: accountMatch[1],
        originalSMS: smsText
      };
    }
  }
  
  // Default parsing
  return parseBankSMS(smsText);
};

export default parseBankSMS;