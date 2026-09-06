/**
 * IndexedDB 기반 MathLab Kids 로컬 학습 기록 저장소
 * 로그인 없이도 학생의 학습 기록, 오답, 진행 중 상태를 브라우저에 안전하게 보관합니다.
 */
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SessionResult, WorksheetRule, Problem, UserAnswer } from '../domain/math/types';

interface MathLabDB extends DBSchema {
  sessions: {
    key: string;
    value: SessionResult;
    indexes: { 'by-date': string };
  };
  inProgress: {
    key: string;
    value: {
      id: string;
      savedAt: string;
      rule: WorksheetRule;
      problems: Problem[];
      userAnswers: Record<string, UserAnswer>;
      currentIndex: number;
    };
  };
}

const DB_NAME = 'mathlab-kids-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MathLabDB>> | null = null;

function getDb() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<MathLabDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-date', 'createdAt');
        }
        if (!db.objectStoreNames.contains('inProgress')) {
          db.createObjectStore('inProgress', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

/** 완료된 학습 결과 저장 */
export async function saveSessionResult(result: SessionResult): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put('sessions', result);
  // 완료되면 진행 중 상태 삭제
  await db.delete('inProgress', 'current-session');
}

/** 전체 학습 이력 조회 (최신순) */
export async function getAllSessions(): Promise<SessionResult[]> {
  const db = await getDb();
  if (!db) return [];
  const sessions = await db.getAllFromIndex('sessions', 'by-date');
  return sessions.reverse();
}

/** 특정 세션 조회 */
export async function getSessionById(id: string): Promise<SessionResult | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  return db.get('sessions', id);
}

/** 진행 중인 학습 자동 임시 저장 */
export async function saveInProgressSession(
  rule: WorksheetRule,
  problems: Problem[],
  userAnswers: Record<string, UserAnswer>,
  currentIndex: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.put('inProgress', {
    id: 'current-session',
    savedAt: new Date().toISOString(),
    rule,
    problems,
    userAnswers,
    currentIndex,
  });
}

/** 진행 중인 학습 불러오기 */
export async function getInProgressSession() {
  const db = await getDb();
  if (!db) return null;
  return db.get('inProgress', 'current-session');
}

/** 진행 중인 임시 저장 데이터 삭제 */
export async function clearInProgressSession(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete('inProgress', 'current-session');
}
