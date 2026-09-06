'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllSessions } from '@/db/historyDb';
import { SessionResult } from '@/domain/math/types';
import { useWorksheetStore } from '@/stores/worksheetStore';
import { History, Calendar, Clock, Trophy, ChevronRight, Play, PlusCircle, ArrowLeft } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { setRule, generateNewProblems, startPractice } = useWorksheetStore();
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSessions()
      .then((data) => setSessions(data))
      .finally(() => setLoading(false));
  }, []);

  const handleRetryRule = (session: SessionResult) => {
    setRule(session.rule);
    const ok = generateNewProblems();
    if (ok) {
      startPractice();
      router.push('/practice');
    }
  };

  const formatMs = (ms: number) => {
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (m > 0) return `${m}분 ${s}초`;
    return `${s}초`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* 헤더 */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              나의 학습 기록
            </h1>
            <p className="text-xs text-slate-500">
              브라우저에 안전하게 보관된 최근 풀이 기록과 정답률입니다.
            </p>
          </div>
        </div>

        <Link
          href="/create"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          새 문제 만들기
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">학습 기록을 불러오는 중...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">아직 저장된 학습 기록이 없습니다.</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            문제를 만들고 온라인으로 풀면, 채점 결과와 시간 기록이 여기에 자동으로 쌓입니다.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md"
          >
            첫 문제 풀기 시작
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sessions.map((session) => {
            const dateStr = new Date(session.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={session.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      정답률 {session.accuracyRate}%
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {session.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span>
                      맞힌 수: <strong className="text-slate-800">{session.correctCount}</strong> / {session.totalCount}문제
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatMs(session.totalTimeSpentMs)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRetryRule(session)}
                    className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    이 규칙으로 다시 풀기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
