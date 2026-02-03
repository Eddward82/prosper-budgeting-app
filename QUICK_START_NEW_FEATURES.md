# Quick Start Guide - New Features

## Run the App

```bash
npm install
npx expo start
```

---

## What's New - Quick Tour

### 1. Savings Goals (New Tab)
- Tap **"Goals"** tab at bottom
- Click **"+ Create New Goal"**
- Enter goal name and target amount
- Add contributions as you save

### 2. Spending Limits (Home Screen)
- Go to **Settings → Spending Limits**
- Set daily and weekly limits
- Return to **Home** to see widget
- Widget shows spending vs limit with color indicators

### 3. Transaction History (New Tab)
- Tap **"History"** tab
- Use filters: Type, Date Range, Category, Tags
- See all your transactions organized

### 4. Quick-Add Buttons (Home Screen)
- Scroll down on Home screen
- See "Quick Add" section
- Tap preset buttons: ₦500 Food, ₦200 Transport, etc.
- Transaction added instantly!

### 5. Premium Features (Settings)
- Go to **Settings → Premium Features**
- Tap **"Activate Premium (Demo)"**
- Now tap **"View Insights"**
- See charts, trends, and analytics!

---

## Navigation Map

```
Bottom Tabs:
├── Home (🏠)
│   ├── Spending Limit Widget
│   ├── Budget Cards
│   ├── Pie Chart
│   ├── Recent Transactions
│   └── Quick-Add Buttons
│
├── Goals (🎯)
│   ├── Savings Goals List
│   └── Create/Edit Goals
│
├── History (📜)
│   ├── All Transactions
│   └── Advanced Filters
│
├── Categories (📊)
│   └── Manage Budgets
│
└── Settings (⚙️)
    ├── Currency
    ├── Spending Limits ⭐NEW
    ├── Premium Features ⭐NEW
    ├── Data Management
    └── About

Stack Screens:
├── Add Transaction
└── Insights (Premium)
```

---

## Key Features at a Glance

| Feature | Location | Premium? |
|---------|----------|----------|
| Savings Goals | Goals tab | No |
| Spending Limits | Settings + Home widget | No |
| Transaction Filters | History tab | No |
| Quick-Add Buttons | Home screen | No |
| Expense Tags | History search | No |
| Advanced Insights | Settings → Insights | **Yes** |
| Recurring Transactions | Add Transaction | **Yes** |
| Receipt Attachments | Add Transaction | **Yes** |
| CSV Export | Settings | **Yes** |
| Unlimited Categories | Categories | **Yes** |

---

## Test Scenarios

### Scenario 1: Set Up Spending Limits
1. Settings → Spending Limits
2. Daily Limit: 1000, tap Save
3. Weekly Limit: 5000, tap Save
4. Go to Home
5. See widget appear

### Scenario 2: Create Savings Goal
1. Goals tab → Create New Goal
2. Name: "Vacation Fund"
3. Target: 5000
4. Tap Create
5. Tap "Add Contribution"
6. Amount: 1000
7. See 20% progress!

### Scenario 3: Use Quick-Add
1. Home screen → Quick Add section
2. Tap "₦500 Food"
3. See success alert
4. Check Recent Transactions

### Scenario 4: Filter Transactions
1. History tab
2. Tap "Expense" filter
3. Select date: "This Month"
4. Pick a category
5. See filtered results

### Scenario 5: Activate Premium
1. Settings → Premium Features
2. Tap "Activate Premium (Demo)"
3. Tap "View Insights"
4. Explore charts and trends
5. Try deactivating to see paywall

---

## Premium Demo Mode

Toggle Premium status to test features:

**Settings → Premium Features → Activate/Deactivate**

When Premium is **ON**:
- ✅ Insights screen accessible
- ✅ Can add unlimited categories
- ✅ (When implemented) Can add receipts and recurring transactions

When Premium is **OFF**:
- ❌ Insights shows paywall
- ❌ Category limit enforced (max 5)
- ❌ Premium features blocked

---

## Troubleshooting

**Widget not showing on Home?**
- Set limits in Settings first
- If limits are 0, widget hides automatically

**Can't add 6th category?**
- You're on Free plan (max 5 categories)
- Activate Premium to add more

**Insights showing paywall?**
- Premium is deactivated
- Go to Settings → Activate Premium

**No transactions in History?**
- Add some transactions first
- Use Quick-Add for fast testing

---

## File Structure Reference

```
budget-planner/
├── screens/
│   ├── HomeScreen.js ⭐UPDATED
│   ├── AddTransactionScreen.js
│   ├── CategoriesScreen.js
│   ├── SettingsScreen.js ⭐UPDATED
│   ├── SavingsGoalsScreen.js ⭐NEW
│   ├── TransactionHistoryScreen.js ⭐NEW
│   └── InsightsScreen.js ⭐NEW
│
├── components/
│   ├── BudgetCard/
│   ├── CategoryItem/
│   ├── TransactionItem/
│   └── SpendingLimitWidget/ ⭐NEW
│
├── store/
│   └── useBudgetStore.js ⭐UPDATED
│
├── database/
│   ├── schema.js ⭐UPDATED
│   └── db.js ⭐UPDATED
│
├── App.js ⭐UPDATED
├── FEATURES_IMPLEMENTATION.md ⭐NEW
├── NEW_FEATURES_SUMMARY.md ⭐NEW
└── QUICK_START_NEW_FEATURES.md ⭐NEW (this file)
```

---

## Database Quick Reference

**New Tables:**
- `savings_goals` - Your savings goals
- `app_settings` - App configuration (limits, premium status)

**Enhanced transactions:**
- `tags` - #work, #kids, etc.
- `receipt_uri` - Photo attachment path
- `is_recurring` - 1 if recurring
- `frequency` - daily/weekly/monthly
- `next_run_date` - Next scheduled date

---

## Common Tasks

### Add a Savings Goal
`Goals tab → + Create New Goal → Fill form → Create`

### Set Spending Limit
`Settings → Spending Limits → Enter amount → Save`

### Quick Add Transaction
`Home → Quick Add section → Tap button`

### Filter Transactions
`History tab → Apply filters → View results`

### Toggle Premium
`Settings → Premium Features → Activate/Deactivate`

### View Analytics
`Settings → View Insights (Premium required)`

---

## What's Still Pending?

1. **Add Transaction enhancements:**
   - Tags input field
   - Receipt photo picker (Premium)
   - Recurring transaction toggle (Premium)

2. **CSV Export button** in Settings (Premium)

3. **Transaction Detail View** to show receipts

See `FEATURES_IMPLEMENTATION.md` for implementation details.

---

## Tips

- **Start with Spending Limits** - Set realistic daily/weekly limits
- **Use Quick-Add** - Fastest way to log common expenses
- **Create Savings Goals** - Stay motivated to save
- **Filter Smartly** - Use History filters to analyze spending
- **Try Premium** - Toggle it on to see advanced features

---

**Happy Budgeting!** 🎉
