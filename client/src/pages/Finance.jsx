import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ChatWidget from "../components/ChatWidget";
import SourceChecklist from "../components/SourceChecklist";

export default function Finance() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["Food", "Utilities", "Entertainment", "Subscriptions"];

  useEffect(() => {
    api
      .get("/finance")
      .then(({ data }) => {
        setBalance(data.balance);
        setTransactions(data.transactions);
      })
      .catch((err) => console.error("Failed to load finance data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description || !amount || isNaN(amount)) return;

    try {
      const { data } = await api.post("/finance/transactions", {
        desc: description,
        amt: parseFloat(amount),
        category,
      });
      setTransactions([data.transaction, ...transactions]);
      setBalance(data.balance);
      setDescription("");
      setAmount("");
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  };

  const categoryTotals = categories.map((cat) =>
    transactions.filter((t) => t.category === cat).reduce((sum, t) => sum + t.amt, 0)
  );

  const maxExpense = Math.max(...categoryTotals, 1);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-violet-900/40 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">LifeOS Module</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">Finance & Spending Analytics</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-lg hover:bg-violet-900/50 transition-all cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <SourceChecklist module="finance" title="Finance Source Checklist" />

        {loading ? (
          <p className="text-slate-400 text-sm">Loading your finance data...</p>
        ) : (
          <>
            <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md mb-8">
              <h2 className="text-lg font-bold text-slate-100 mb-6">Monthly Expenses by Category</h2>
              <div className="grid grid-cols-4 gap-4 items-end h-40 pt-6 border-b border-violet-900/40">
                {categories.map((cat, idx) => {
                  const heightPercent = (categoryTotals[idx] / maxExpense) * 100;
                  return (
                    <div key={cat} className="flex flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-mono text-violet-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${categoryTotals[idx]}
                      </span>
                      <div
                        className="w-full max-w-[48px] bg-gradient-to-t from-violet-600 to-fuchsia-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                      ></div>
                      <span className="text-[11px] font-medium text-slate-400 mt-2 truncate w-full text-center">
                        {cat}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
                <h2 className="text-sm font-medium text-slate-400 mb-2">Total Balance</h2>
                <p className="text-4xl font-black text-white">${balance.toLocaleString()}</p>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md md:col-span-2">
                <h2 className="text-lg font-bold text-slate-100 mb-4">Add Category Expense</h2>
                <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-900 border border-violet-900/50 rounded-lg text-slate-100 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-lg hover:opacity-90 cursor-pointer"
                  >
                    + Add Record
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>

      <ChatWidget module="finance" label="Budget Assistant" context={{ balance, transactions }} />
    </div>
  );
}
