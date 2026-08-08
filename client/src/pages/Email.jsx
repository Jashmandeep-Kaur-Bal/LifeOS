import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ChatWidget from "../components/ChatWidget";
import SourceChecklist from "../components/SourceChecklist";

export default function Email() {
  const navigate = useNavigate();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/email")
      .then(({ data }) => setEmails(data))
      .catch((err) => console.error("Failed to load emails:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (email) => {
    setSelectedEmail(email);
    if (email.unread) {
      try {
        const { data } = await api.patch(`/email/${email._id}`);
        setEmails(emails.map((e) => (e._id === email._id ? data : e)));
        setSelectedEmail(data);
      } catch (err) {
        console.error("Failed to mark email as read:", err);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-violet-900/40 pb-6 mb-8 gap-4">
          <div>
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">LifeOS Module</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">Smart Inbox</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/50 rounded-lg hover:bg-violet-900/50 transition-all cursor-pointer self-start md:self-auto"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        <SourceChecklist module="email" title="Email Source Checklist" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Messages</h2>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading inbox...</p>
            ) : (
              <div className="space-y-2">
                {emails.map((mail) => (
                  <div
                    key={mail._id}
                    onClick={() => handleSelect(mail)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedEmail?._id === mail._id
                        ? "bg-violet-900/40 border-fuchsia-400"
                        : "bg-slate-900/60 border-violet-900/30 hover:border-violet-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{mail.sender}</span>
                      {mail.unread && <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span>}
                    </div>
                    <p className="text-xs text-slate-300 truncate mt-1">{mail.subject}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-violet-900/40 backdrop-blur-md md:col-span-2">
            {selectedEmail ? (
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{selectedEmail.subject}</h2>
                <p className="text-xs text-violet-400 mb-4">From: {selectedEmail.sender}</p>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-violet-900/30 text-sm text-slate-300 leading-relaxed">
                  {selectedEmail.body}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm py-12">
                Select an email from the inbox to read.
              </div>
            )}
          </div>
        </div>
      </main>

      <ChatWidget module="email" label="Inbox Assistant" context={{ emails }} />
    </div>
  );
}
