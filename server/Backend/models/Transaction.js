const mongoose = require('mongoose');

const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['debit', 'credit'], default: 'debit' },
    merchant: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    subcategory: { type: String, trim: true },
    confidence: { type: Number, default: 1 },
    date: { type: Date, default: Date.now, index: true },
    bankAccountId: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
    meta: { type: Schema.Types.Mixed } // store raw provider payload or extra fields
  },
  {
    timestamps: true
  }
);

// Convenience virtual to get signed amount (negative for debits)
TransactionSchema.virtual('signedAmount').get(function () {
  if (this.type === 'debit') return -Math.abs(this.amount || 0);
  return Math.abs(this.amount || 0);
});

// Basic text index for simple search over merchant/description
TransactionSchema.index({ merchant: 'text', description: 'text' });

module.exports = mongoose.model('Transaction', TransactionSchema);