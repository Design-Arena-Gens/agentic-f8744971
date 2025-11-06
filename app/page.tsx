'use client';

import { useMemo, useState } from 'react';

type Expense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
};

const CATEGORY_OPTIONS = [
  'Housing',
  'Food',
  'Transportation',
  'Utilities',
  'Health',
  'Entertainment',
  'Subscriptions',
  'Other'
];

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', description: 'Rent', category: 'Housing', amount: 1200, date: '2024-04-01' },
  { id: '2', description: 'Groceries', category: 'Food', amount: 164.25, date: '2024-04-06' },
  { id: '3', description: 'Gym Membership', category: 'Health', amount: 45, date: '2024-04-04' },
  { id: '4', description: 'Spotify', category: 'Subscriptions', amount: 10.99, date: '2024-03-24' },
  { id: '5', description: 'Dinner Out', category: 'Food', amount: 68.5, date: '2024-03-30' },
  { id: '6', description: 'Gas', category: 'Transportation', amount: 52.8, date: '2024-04-10' },
  { id: '7', description: 'Movie Night', category: 'Entertainment', amount: 32, date: '2024-04-12' },
  { id: '8', description: 'Electricity Bill', category: 'Utilities', amount: 86.3, date: '2024-03-18' },
  { id: '9', description: 'Coffee', category: 'Food', amount: 12.5, date: '2024-04-08' },
  { id: '10', description: 'Therapy Session', category: 'Health', amount: 120, date: '2024-03-12' }
];

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);

const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(isoDate));

const getMonthKey = (isoDate: string) => {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentMonthKey = () => getMonthKey(new Date().toISOString());

const buildMonthOptions = (expenses: Expense[]) => {
  const unique = new Set(expenses.map((expense) => getMonthKey(expense.date)));
  return Array.from(unique)
    .sort()
    .map((key) => {
      const [year, month] = key.split('-').map(Number);
      return { key, label: `${MONTH_LABELS[month - 1]} ${year}` };
    });
};

const StatCard = ({
  label,
  value,
  helper,
  tone = 'neutral'
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: 'neutral' | 'positive' | 'negative';
}) => (
  <article className={`stat-card stat-card--${tone}`}>
    <p className="stat-card__label">{label}</p>
    <p className="stat-card__value">{value}</p>
    {helper ? <p className="stat-card__helper">{helper}</p> : null}
  </article>
);

const CategoryBar = ({ label, value, percent }: { label: string; value: number; percent: number }) => (
  <div className="category-bar">
    <div className="category-bar__meta">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
    <div className="category-bar__track">
      <div className="category-bar__fill" style={{ width: `${percent}%` }} />
    </div>
  </div>
);

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formState, setFormState] = useState({
    description: '',
    category: CATEGORY_OPTIONS[0],
    amount: '',
    date: new Date().toISOString().slice(0, 10)
  });

  const monthOptions = useMemo(() => buildMonthOptions(expenses), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (filterMonth !== 'all' && getMonthKey(expense.date) !== filterMonth) {
        return false;
      }
      if (filterCategory !== 'all' && expense.category !== filterCategory) {
        return false;
      }
      return true;
    });
  }, [expenses, filterMonth, filterCategory]);

  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgPerExpense = filteredExpenses.length ? totalSpent / filteredExpenses.length : 0;
  const largestExpense = filteredExpenses.reduce((max, expense) => Math.max(max, expense.amount), 0);

  const currentMonthKey = filterMonth === 'all' ? getCurrentMonthKey() : filterMonth;
  const monthlyTotals = useMemo(() => {
    return expenses.reduce<Record<string, number>>((acc, expense) => {
      const key = getMonthKey(expense.date);
      acc[key] = (acc[key] ?? 0) + expense.amount;
      return acc;
    }, {});
  }, [expenses]);

  const currentMonthTotal = monthlyTotals[currentMonthKey] ?? 0;
  const [year, month] = currentMonthKey.split('-').map(Number);
  const previousMonthDate = new Date(year, month - 2, 1);
  const previousMonthKey = getMonthKey(previousMonthDate.toISOString());
  const previousMonthTotal = monthlyTotals[previousMonthKey] ?? 0;
  const monthDelta = previousMonthTotal ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : null;

  const categoryTotals = filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
    return acc;
  }, {});

  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.description.trim() || !formState.amount) {
      return;
    }

    const newExpense: Expense = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      description: formState.description.trim(),
      category: formState.category,
      amount: Number(formState.amount),
      date: formState.date
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setFormState((prev) => ({
      ...prev,
      description: '',
      amount: ''
    }));
  };

  const resetFilters = () => {
    setFilterMonth('all');
    setFilterCategory('all');
  };

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Expense Dashboard</h1>
          <p className="dashboard__subtitle">Track spending, spot trends, and stay on top of your budget.</p>
        </div>
        <div className="dashboard__actions">
          <select
            value={filterMonth}
            onChange={(event) => setFilterMonth(event.target.value)}
            className="select"
            aria-label="Filter by month"
          >
            <option value="all">All months</option>
            {monthOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="select"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button className="button button--ghost" type="button" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </header>

      <section className="dashboard__grid">
        <StatCard
          label="Total spent"
          value={formatCurrency(totalSpent)}
          helper={`Across ${filteredExpenses.length} expenses`}
        />
        <StatCard label="Average expense" value={formatCurrency(avgPerExpense)} helper="Per logged entry" />
        <StatCard
          label="Largest expense"
          value={filteredExpenses.length ? formatCurrency(largestExpense) : '-'}
          helper={highestCategory ? `Category: ${highestCategory[0]}` : 'No data'}
        />
        <StatCard
          label="Monthly trend"
          value={monthDelta === null ? 'N/A' : `${monthDelta > 0 ? '+' : ''}${monthDelta.toFixed(1)}%`}
          helper={
            monthDelta === null
              ? 'Add previous month data'
              : `${formatCurrency(previousMonthTotal)} → ${formatCurrency(currentMonthTotal)}`
          }
          tone={monthDelta !== null && monthDelta > 0 ? 'negative' : 'positive'}
        />
      </section>

      <section className="panel panel--wide">
        <header className="panel__header">
          <div>
            <h2>Expenses</h2>
            <p className="panel__subheader">Quickly capture a new expense or review past activity.</p>
          </div>
        </header>
        <form className="expense-form" onSubmit={handleSubmit}>
          <input
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description"
            required
          />
          <select
            value={formState.category}
            onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
            required
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formState.amount}
            onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
            placeholder="Amount"
            required
          />
          <input
            type="date"
            value={formState.date}
            onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
            required
          />
          <button className="button" type="submit">
            Add expense
          </button>
        </form>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th className="numeric">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td>{formatDate(expense.date)}</td>
                    <td className="numeric">{formatCurrency(expense.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="table__empty">
                    No expenses logged for this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel panel--side">
        <header className="panel__header">
          <h2>Category breakdown</h2>
        </header>
        <div className="panel__body">
          {Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([category, value]) => (
              <CategoryBar
                key={category}
                label={category}
                value={value}
                percent={totalSpent ? Math.round((value / totalSpent) * 100) : 0}
              />
            ))}
          {!filteredExpenses.length ? (
            <p className="panel__empty">Add expenses or adjust the filters to see category insights.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
