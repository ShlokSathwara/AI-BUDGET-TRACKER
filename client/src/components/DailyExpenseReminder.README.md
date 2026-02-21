# Daily Expense Reminder Feature

## Overview
This feature adds automated daily notifications at 9 PM to remind users to track their expenses and provides a summary of their daily spending.

## Features

### 1. Automated Daily Reminders
- Sends notifications every day at 9:00 PM
- Reminds users to enter their daily expenses
- Shows a summary of today's spending if transactions exist

### 2. Smart Notification Content
- **No transactions**: "You haven't added any expenses today. Don't forget to track your spending! 💰"
- **With transactions**: "Today's summary: ₹X,XXX in expenses, ₹Y,YYY income. Net: ₹Z,ZZZ. Keep up the good work! 📊"

### 3. Multiple Notification Channels
- In-app notifications through NotificationContext
- Browser notifications (if permission granted)
- Console logging for debugging

### 4. User Control
- Toggle available in Settings → Notification Settings
- Default: Enabled
- Users can enable/disable the feature

## Implementation Details

### Components
- **DailyExpenseReminder.jsx**: Main component handling scheduling and notifications
- **Settings.jsx**: UI toggle for enabling/disabling the feature
- **NotificationDisplay.jsx**: Updated to support 'reminder' notification type

### How It Works
1. Component calculates time until next 9 PM
2. Uses setTimeout to schedule the exact notification time
3. Automatically reschedules for the next day after each notification
4. Calculates daily expenses by filtering today's transactions
5. Sends appropriate message based on transaction data

### Data Structure
```javascript
{
  totalExpenses: number,
  totalIncome: number,
  netBalance: number,
  transactionCount: number,
  categories: { categoryName: amount },
  hasTransactions: boolean
}
```

## Usage

### For Users
1. Navigate to Settings
2. Find "Daily Expense Reminder" toggle
3. Enable/disable as preferred
4. Receive daily notifications at 9 PM

### For Developers
```javascript
// Component usage
<DailyExpenseReminder 
  user={user} 
  transactions={transactions} 
  settings={userSettings.notifications} 
/>
```

## Customization Options

### Change Reminder Time
Modify the `scheduleNextReminder` function:
```javascript
next9PM.setHours(21, 0, 0, 0); // Change 21 to desired hour (0-23)
```

### Modify Notification Content
Edit the `sendDailyReminder` function message generation logic.

### Add More Notification Types
Extend the notification type handling in NotificationDisplay.jsx.

## Testing
The feature includes a demo mode that sends a reminder 2 seconds after component mount for immediate testing.

## Dependencies
- React hooks (useEffect, useRef)
- NotificationContext for in-app notifications
- Browser Notification API for system notifications
- User settings stored in localStorage