'use client';

import { useState } from 'react';
import type { Submission } from '@/lib/fields';
import { btnSecondary } from '../buttonStyles';
import { formatTimestamp } from '@/lib/utils';

const RANK_COLORS = ['text-(--color-accent-gold)', 'text-[#C0C0C0]', 'text-[#CD7F32]'];

interface LeaderboardTableProps {
  submissions: Submission[];
  onSelect: (submission: Submission) => void;
}

export default function LeaderboardTable({
  submissions,
  onSelect,
}: Readonly<LeaderboardTableProps>) {
  const [query, setQuery] = useState('');

  const filtered = submissions.filter((s) => {
    const q = query.toLowerCase().trim();
    return (
      s.Full_Name.toLowerCase().includes(q) ||
      s.Email_Address.toLowerCase().includes(q) ||
      s.Mobile_Number.includes(q) ||
      s.Submission_ID.toLowerCase().includes(q)
    );
  });

  return (
    <section className="glass-card p-8 w-full">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-(family-name:--font-heading) font-bold text-[1.8rem] mb-1.5 bg-gradient-to-r from-white to-(--color-accent-blue) bg-clip-text text-transparent">
            Participant Leaderboard
          </h2>
          <p className="text-(--color-text-secondary) text-[0.95rem]">
            Real-time standings based on tiebreaker priorities
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/api/admin/export" className={`${btnSecondary} text-[0.95rem] px-5 py-2.5`}>
            📥 Export to Excel
          </a>
        </div>
      </div>

      <div className="relative w-full mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary)">🔍</span>
        <input
          type="text"
          placeholder="Search by name, email, or mobile..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-[rgba(10,10,15,0.5)] border border-(--color-border-subtle) rounded-xl outline-none font-(family-name:--font-body) text-[0.95rem] text-white transition-all focus:border-(--color-accent-blue) focus:bg-[rgba(10,10,15,0.7)]"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-(--color-border-subtle) bg-[rgba(10,10,15,0.2)]">
        <table className="w-full border-collapse text-left text-[0.95rem] min-w-[800px]">
          <thead>
            <tr>
              {['Rank', 'Submission ID', 'Name', 'Email', 'Mobile', 'Submitted', 'Score', 'Predictions Detail'].map((h) => (
                <th
                  key={h}
                  className="bg-[rgba(16,24,39,0.8)] font-(family-name:--font-heading) font-bold text-white p-4 border-b border-(--color-border-subtle) uppercase text-[0.8rem] tracking-[0.5px]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-10 text-(--color-text-secondary) italic">
                  No matching participant predictions found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                let rankText: string | number = s.Rank || '-';
                if (s.Rank === 1) rankText = '🥇 1';
                else if (s.Rank === 2) rankText = '🥈 2';
                else if (s.Rank === 3) rankText = '🥉 3';

                // Colour by actual rank, not row position - otherwise the
                // medal colours land on the wrong rows once the list is
                // searched/filtered or arrives unsorted.
                const rankNum = typeof s.Rank === 'number' ? s.Rank : Number(s.Rank);
                const rankColor =
                  rankNum >= 1 && rankNum <= 3 ? RANK_COLORS[rankNum - 1] : 'text-white';

                return (
                  <tr
                    key={s.Submission_ID}
                    onClick={() => onSelect(s)}
                    className="cursor-pointer transition-colors hover:bg-(--color-accent-blue)/[0.04] border-b border-white/[0.03] last:border-b-0"
                  >
                    <td className={`p-4 font-bold ${rankColor}`}>{rankText}</td>
                    <td className="p-4 text-(--color-text-secondary)">
                      <span className="bg-white/5 px-2 py-1 rounded-md font-(family-name:--font-heading) text-white border border-white/5">
                        {s.Submission_ID}
                      </span>
                    </td>
                    <td className="p-4 text-white">{s.Full_Name}</td>
                    <td className="p-4 text-(--color-text-secondary)">{s.Email_Address}</td>
                    <td className="p-4 text-(--color-text-secondary)">{s.Mobile_Number}</td>
                    <td className="p-4 text-(--color-text-secondary) whitespace-nowrap">{formatTimestamp(s.Timestamp)}</td>
                    <td className="p-4 text-(--color-text-secondary)">
                      <span className="bg-(--color-accent-blue)/10 text-(--color-accent-blue) px-2.5 py-1 rounded-lg font-bold font-(family-name:--font-heading) text-[1.05rem] inline-block">
                        {s.Total_Score !== undefined ? s.Total_Score : 0}
                      </span>
                    </td>
                    <td className="p-4 text-(--color-text-secondary)">
                      <button className={`${btnSecondary} px-3 py-1.5 text-[0.8rem]`}>View Predictions</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
