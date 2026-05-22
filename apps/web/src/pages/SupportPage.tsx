import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const [category, setCategory] = useState('Complaint');
  const [complaintText, setComplaintText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!complaintText.trim()) {
      setStatusMessage({ type: 'error', text: 'Please write your complaint or message first.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const token = localStorage.getItem('fitsync_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch('http://localhost:3000/support/complain', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          complaint: `[Category: ${category}] ${complaintText}`,
          date: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit support request');
      }

      setStatusMessage({ type: 'success', text: 'Thank you! Your complaint/support request has been sent to our administrator.' });
      setComplaintText('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred while submitting.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-10 text-center text-on-surface-variant/50">
        Please log in to submit a support request.
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto py-10 px-6">
      <div className="flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary text-4xl">contact_support</span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Help & Support Portal</h1>
          <p className="text-sm text-on-surface-variant/60">Submit complaints, inquiries, or feedback directly to our administrators.</p>
        </div>
      </div>

      <div className="glass-card p-8 border border-outline-variant/20 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">Your Name</label>
              <input
                type="text"
                disabled
                value={user.fullName}
                className="w-full bg-surface-container-high/40 border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface-variant/60 outline-none text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                disabled
                value={user.username}
                className="w-full bg-surface-container-high/40 border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface-variant/60 outline-none text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full bg-surface-container-high/40 border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface-variant/60 outline-none text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary/60 text-sm cursor-pointer"
              >
                <option value="Complaint">Complaint</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Billing Inquiry">Billing Inquiry</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">Describe the Issue or Complaint</label>
            <textarea
              rows={6}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Please provide details about your issue, feedback, or complaint..."
              className="w-full bg-surface border border-outline-variant/30 rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/60 text-sm resize-none"
            ></textarea>
          </div>

          {statusMessage && (
            <div
              className={`p-4 rounded-2xl border text-sm flex items-start gap-3 ${
                statusMessage.type === 'success'
                  ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'bg-error/10 border-error/20 text-error'
              }`}
            >
              <span className="material-symbols-outlined shrink-0">
                {statusMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary mt-2 py-3.5 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Sending...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">send</span>
                Submit Support Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;
