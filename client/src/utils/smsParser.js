// SMS Parser utility for extracting transaction details from bank SMS

export const parseBankSMS = (smsText) => {
  // Clean the SMS text
  const cleanText = smsText.replace(/[^\w\s\-\.\,\₹\$\%\&\*\#\@\!\?\;\:\(\)\[\]\{\}\<\>\+\=\|\/]/gi, ' ').trim();
  
  // Common patterns for different banks
  const patterns = [
    // Pattern for debit transactions
    {
      type: 'debit',
      regex: /(?:debited|withdrawn|used|spent|charged|deducted|dr\.?|debit).*?([\d,]+\.?\d*)/i,
      amountIndex: 1
    },
    // Pattern for credit transactions  
    {
      type: 'credit',
      regex: /(?:credited|added|received|deposit|cr\.?|credit).*?([\d,]+\.?\d*)/i,
      amountIndex: 1
    },
    // Alternative debit pattern with INR
    {
      type: 'debit',
      regex: /(?:INR|Rs\.?)\s*([\d,]+\.?\d*)/i,
      amountIndex: 1
    },
    // Alternative credit pattern with INR
    {
      type: 'credit',
      regex: /(?:credited|deposited).*?INR\s*([\d,]+\.?\d*)/i,
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
  const merchantMatch = cleanText.match(/(?:at|to|from|on\s+)?([A-Z0-9\s&]{5,30})/i);
  let merchant = merchantMatch ? merchantMatch[1].trim() : 'Bank Transaction';
  
  // Enhanced merchant extraction for various formats
  if (!merchant || merchant === 'Bank Transaction') {
    // Look for merchant names after common phrases
    const merchantPatterns = [
      /(?:at|on|for)\s+([A-Z0-9\s&]{5,30})/i,
      /(?:at|on)\s+([A-Z0-9\s&]{5,30})/i,
      /(?:\s)([A-Z0-9&]{5,20})(?:\.in|\.com|\.co)/i,
      /([A-Z0-9&]{5,20})\s+(?:online|shopping|payment)/i
    ];
    
    for (const pattern of merchantPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        merchant = match[1].trim();
        break;
      }
    }
  }

  // Extract last 4 digits of account/card
  const accountMatch = cleanText.match(/(?:ACC|CARD|A\/C|XXXX).*?(?:\*{0,4})?(\d{4})/i);
  const lastFourDigits = accountMatch ? accountMatch[1] : null;
  
  // Extract last 4 digits with more variations
  if (!lastFourDigits) {
    const altAccountMatch = cleanText.match(/(?:XXXX-?|\*{2,4}-?)(\d{4})/);
    if (altAccountMatch) {
      lastFourDigits = altAccountMatch[1];
    }
  }

  // Extract category based on keywords
  const category = extractCategory(cleanText);

  // Extract date if present
  const dateMatch = cleanText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  let date = new Date().toISOString();
  if (dateMatch) {
    // Handle different date formats
    const dateString = dateMatch[0];
    const parts = dateString.split(/[\/-]/);
    if (parts.length === 3) {
      // Try to determine format and convert to ISO
      let day, month, year;
      if (parts[0].length === 4) { // YYYY-MM-DD
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[2].length === 4) { // DD/MM/YYYY or DD-MM-YYYY
        day = parts[0];
        month = parts[1];
        year = parts[2];
      } else { // Assume DD/MM/YY or MM/DD/YY
        // For Indian format, assume DD/MM
        day = parts[0];
        month = parts[1];
        year = parts[2];
        if (year.length === 2) year = '20' + year; // Convert YY to YYYY
      }
      
      const formattedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(formattedDate.getTime())) {
        date = formattedDate.toISOString();
      }
    }
  }

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
  
  // Define category keywords with more comprehensive list
  const categories = {
    'Food & Dining': ['food', 'restaurant', 'cafe', 'meal', 'eat', 'pizza', 'burger', 'coffee', 'dine', 'swiggy', 'zomato', 'dominos', 'starbucks', 'subway', 'kfc', 'mcdonald', 'burger king', 'jain', 'veg', 'non-veg', 'bar', 'pub', 'brewery'],
    'Transportation': ['uber', 'ola', 'cab', 'metro', 'bus', 'fuel', 'petrol', 'gas', 'travel', 'taxi', 'auto', 'rapido', 'bike rental', 'car rental', 'parking', 'railway', 'indian railways', 'irctc'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'shop', 'store', 'purchase', 'buy', 'retail', 'bigbasket', 'grofers', 'reliance', 'tata', 'dmart', 'walmart', 'aldi', 'costco', 'best buy', 'electronics', 'clothing', 'fashion', 'apparel', 'cosmetics', 'makeup'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'disney', 'spotify', 'music', 'game', 'stream', 'hotstar', 'sony', 'zee', 'movies', 'theater', 'concert', 'event', 'ticket', 'bookmyshow', 'inox', 'pvr', 'amc'],
    'Utilities': ['electricity', 'water', 'bill', 'power', 'gas', 'utility', 'broadband', 'internet', 'bsnl', 'jio', 'airtel', 'vi', 'reliance', 'tata', 'postpaid', 'prepaid', 'subscription'],
    'Healthcare': ['hospital', 'medicine', 'pharma', 'health', 'medical', 'doctor', 'clinic', 'apollo', 'fortis', 'max', 'kims', 'prescription', 'consultation', 'health check', 'insurance', 'medlife', '1mg'],
    'Education': ['school', 'college', 'course', 'book', 'education', 'tuition', 'fee', 'university', 'degree', 'certificate', 'udemy', 'coursera', 'edx', 'byjus', 'vedantu', 'class', 'tutor', 'learning'],
    'Travel': ['flight', 'hotel', 'airline', 'booking', 'trip', 'vacation', 'holiday', 'makemytrip', 'ixigo', 'oyo', 'airbnb', 'booking.com', 'expedia', 'goibibo', 'train', 'bus', 'cruise', 'resort', 'tour'],
    'Investment': ['mf', 'mutual', 'stock', 'investment', 'sip', 'equity', 'bond', 'share', 'trading', 'portfolio', 'wealth', 'finance', 'broker', 'zerodha', 'upstox', 'groww', 'coin', 'crypto', 'bitcoin'],
    'Insurance': ['insurance', 'premium', 'policy', 'claim', 'lic', 'hdfc life', 'max life', 'bajaj', 'icici pru', 'sbi life', 'health insurance', 'car insurance', 'bike insurance', 'term'],
    'Tax & Legal': ['tax', 'gst', 'itr', 'income tax', 'service tax', 'legal', 'advocate', 'lawyer', 'court', 'government', 'municipal', 'property tax', 'house tax', 'registration'],
    'Gifts & Charity': ['gift', 'donation', 'charity', 'ngo', 'temple', 'church', 'mosque', 'religious', 'festival', 'celebration', 'wedding', 'birthday', 'anniversary', 'occasion']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
};

// Email parsing function
export const parseEmailReceipt = (emailSubject, emailBody) => {
  // Combine subject and body for analysis
  const fullText = (emailSubject || '') + ' ' + (emailBody || '');
  const cleanText = fullText.replace(/[^\w\s\-\.\,\₹\$\%\&\*\#\@\!\?\;\:\(\)\[\]\{\}\<\>\+\=\|\/]/gi, ' ').trim().toLowerCase();
  
  // Patterns for extracting amount from email receipts
  const amountPatterns = [
    /(?:rs|inr|rupees|₹|\$|usd)\s*([\d,]+\.?\d*)/i,
    /(?:total|amount|balance|due)\s*[:\-]?\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:rs|inr|rupees|₹|\$|usd)/i,
    /(?:charged|paid|debited|credited)\s*[:\-]?\s*([\d,]+\.?\d*)/i
  ];
  
  let amount = null;
  for (const pattern of amountPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }
  
  // Determine transaction type
  let type = 'debit';
  if (cleanText.includes('credit') || cleanText.includes('refund') || cleanText.includes('return') || cleanText.includes('credited')) {
    type = 'credit';
  }
  
  // Extract merchant from email sender or content
  const merchantMatch = fullText.match(/(?:from|sender|merchant)\s*[:\-]?\s*([a-z0-9\s&]{3,30})/i);
  const senderMatch = emailSubject ? emailSubject.match(/^(?:re:|fw:)?\s*([^<]+)?/i) : null;
  
  let merchant = 'Email Transaction';
  if (senderMatch && senderMatch[1] && !senderMatch[1].includes('@')) {
    merchant = senderMatch[1].trim();
  } else if (merchantMatch) {
    merchant = merchantMatch[1].trim();
  } else {
    // Extract merchant from common e-commerce domains
    const domainMatch = fullText.match(/(?:from|via|powered by|processed by)\s*([a-z0-9\-]{3,20})/i);
    if (domainMatch) {
      merchant = domainMatch[1].replace(/\s+/g, '').trim();
    }
  }
  
  // Extract date from email
  const dateMatch = fullText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\-]\d{1,2}[\-]\d{1,2})/);
  let date = new Date().toISOString();
  if (dateMatch) {
    const dateString = dateMatch[0];
    const parts = dateString.split(/[\/-]/);
    if (parts.length === 3) {
      let year, month, day;
      if (parts[0].length === 4) { // YYYY-MM-DD
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[2].length === 4) { // DD/MM/YYYY
        day = parts[0];
        month = parts[1];
        year = parts[2];
      } else { // DD/MM/YY
        day = parts[0];
        month = parts[1];
        year = parts[2];
        if (year.length === 2) year = '20' + year;
      }
      
      const formattedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      if (!isNaN(formattedDate.getTime())) {
        date = formattedDate.toISOString();
      }
    }
  }
  
  // Extract category
  const category = extractCategory(fullText);
  
  if (amount) {
    return {
      amount: Math.abs(amount),
      type: type,
      merchant: merchant,
      category: category,
      date: date,
      originalEmail: emailSubject + '\n' + emailBody,
      source: 'email'
    };
  }
  
  return null;
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