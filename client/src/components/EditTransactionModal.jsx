import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Store, FileText, Tag, CreditCard, Wallet, X, Edit3, Trash2 } from 'lucide-react';

const EditTransactionModal = ({ transaction, isOpen, onClose, onSave, onDelete, accounts = [] }) => {
  const [formData, setFormData] = useState({
    amount: transaction?.amount?.toString() || '',
    merchant: transaction?.merchant || '',
    description: transaction?.description || '',
    category: transaction?.category || '',
    bankAccount: transaction?.bankAccountId || '',
    paymentMethod: transaction?.paymentMethod || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount?.toString() || '',
        merchant: transaction.merchant || '',
        description: transaction.description || '',
        category: transaction.category || '',
        bankAccount: transaction.bankAccountId || '',
        paymentMethod: transaction.paymentMethod || ''
      });
    }
  }, [transaction]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.merchant.trim()) {
      newErrors.merchant = 'Merchant is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.bankAccount) {
      newErrors.bankAccount = 'Bank account is required';
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updatedTransaction = {
        ...transaction,
        amount: parseFloat(formData.amount),
        merchant: formData.merchant.trim(),
        description: formData.description.trim(),
        category: formData.category.trim() || 'Other',
        bankAccountId: formData.bankAccount || null,
        paymentMethod: formData.paymentMethod,
        updatedAt: new Date().toISOString()
      };
      
      await onSave(updatedTransaction);
      onClose();
    } catch (err) {
      console.error('Error updating transaction:', err);
      setErrors({ submit: err.message || 'Failed to update transaction' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        await onDelete(transaction._id);
        onClose();
      } catch (err) {
        console.error('Error deleting transaction:', err);
        alert('Failed to delete transaction: ' + err.message);
      }
    }
  };

  const getAccountOptions = () => {
    if (!Array.isArray(accounts)) return [];
    return accounts
      .filter(acc => acc && acc.id && acc.name)
      .map(acc => ({
        value: acc.id,
        label: `${acc.name} ${acc.lastFourDigits ? `(****${acc.lastFourDigits})` : ''}`
      }));
  };

  const inputFields = [
    {
      id: 'amount',
      label: 'Amount (₹)',
      value: formData.amount,
      onChange: (value) => setFormData(prev => ({ ...prev, amount: value })),
      placeholder: '0.00',
      icon: IndianRupee,
      type: 'number',
      error: errors.amount
    },
    {
      id: 'merchant',
      label: 'Merchant/Place',
      value: formData.merchant,
      onChange: (value) => setFormData(prev => ({ ...prev, merchant: value })),
      placeholder: 'Where did you spend?',
      icon: Store,
      error: errors.merchant
    },
    {
      id: 'description',
      label: 'Description',
      value: formData.description,
      onChange: (value) => setFormData(prev => ({ ...prev, description: value })),
      placeholder: 'What did you buy?',
      icon: FileText,
      error: errors.description
    },
    {
      id: 'category',
      label: 'Category',
      value: formData.category,
      onChange: (value) => setFormData(prev => ({ ...prev, category: value })),
      placeholder: 'Food, Transport, Shopping, etc.',
      icon: Tag
    },
    {
      id: 'bankAccount',
      label: 'Bank Account',
      value: formData.bankAccount,
      onChange: (value) => setFormData(prev => ({ ...prev, bankAccount: value })),
      icon: Wallet,
      type: 'select',
      error: errors.bankAccount,
      options: [{ value: '', label: 'Select Account' }, ...getAccountOptions()]
    },
    {
      id: 'paymentMethod',
      label: 'Payment Method',
      value: formData.paymentMethod,
      onChange: (value) => setFormData(prev => ({ ...prev, paymentMethod: value })),
      icon: CreditCard,
      error: errors.paymentMethod,
      type: 'select',
      options: [
        { value: '', label: 'Select Payment Method' },
        { value: 'net_banking', label: 'Net Banking' },
        { value: 'upi', label: 'UPI' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'debit_card', label: 'Debit Card' },
        { value: 'cash', label: 'Cash' }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Edit3 className="w-5 h-5" />
              <span>Edit Transaction</span>
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {inputFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="text-sm text-gray-300 flex items-center space-x-2">
                    <field.icon className="h-4 w-4" />
                    <span>{field.label}</span>
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={`w-full px-4 py-3 bg-black/30 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                        field.error ? 'border-red-500' : 'border-white/20'
                      }`}
                    >
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                        field.error ? 'border-red-500' : 'border-white/10'
                      }`}
                    />
                  )}
                  {field.error && (
                    <p className="text-red-400 text-sm">{field.error}</p>
                  )}
                </div>
              ))}
              {errors.submit && (
                <div>
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Trash2 className="h-5 w-5" />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Edit3 className="h-5 w-5" />
                )}
                <span>Save</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditTransactionModal;