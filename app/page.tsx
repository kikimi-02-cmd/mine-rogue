"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, GamePhase, Skill, RunMode } from "@/lib/types";
import {
  createEmptyBoard,
  generateBoard,
  floodReveal,
  isCleared,
  countFlags,
  getFloorConfig,
} from "@/lib/board";
import {
  getRandomSkillChoices,
  applyDetector,
  applyDoubleFlag,
  getAutoRevealCells,
} from "@/lib/skills";
import {
  loadBestFloor,
  saveBestFloor,
  incrementPlayCount,
  addTotalRevealed,
  trackSkills,
  loadPlayCount,
  loadStreak,
  saveStreak,
  loadLanterns,
  saveLanterns,
  loadDailyRecord,
  saveDailyRecord,
  type DailyRecord,
} from "@/lib/storage";
import {
  localDateKey,
  registerVisit,
  dailyRandom,
  dailyNumber,
  bucketStreak,
  MAX_LANTERNS,
  type StreakState,
  type VisitResult,
} from "@/lib/daily";
import { trackEvent } from "@/lib/gtag";
import Header from "@/components/Header";
import Board from "@/components/Board";
import SkillBar from "@/components/SkillBar";
import SkillSelect from "@/components/SkillSelect";
import FloorClearScreen from "@/components/FloorClearScreen";
import GameOverScreen from "@/components/GameOverScreen";
import TitleScreen from "@/components/TitleScreen";
import StatsScreen from "@/components/StatsScreen";
import WelcomeModal from "@/components/WelcomeModal";

/** 毎日の挑戦の盤: 日付のたねで地雷を置き、真ん中を開けた状態で始める（全員同じ盤） */
function makeDailyBoard(
  dateKey: string,
  floor: number,
  size: number,
  mineCount: number,
) {
  const c = Math.floor(size / 2);
  const board = generateBoard(size, mineCount, c, c, dailyRandom(dateKey, floor, "board"));
  return floodReveal(board, c, c, size);
}

interface RunOptions {
  mode?: RunMode;
  dateKey?: string | null;
  lanterns?: number;
}

function createInitialState(
  bestFloor: number,
  phase: GamePhase = "playing",
  opts: RunOptions = {},
): GameState {
  const { size, mineCount } = getFloorConfig(1);
  const mode = opts.mode ?? "normal";
  const dateKey = mode === "daily" ? (opts.dateKey ?? localDateKey()) : null;
  const daily = mode === "daily" && dateKey !== null;
  return {
    floor: 1,
    board: daily
      ? makeDailyBoard(dateKey, 1, size, mineCount)
      : createEmptyBoard(size),
    boardSize: size,
    mineCount,
    skills: [],
    gamePhase: phase,
    timer: 0,
    bestFloor,
    firstClick: !daily,
    pendingMineReduction: 0,
    pendingAutoReveal: 0,
    mode,
    dateKey,
    lanterns: daily ? 0 : (opts.lanterns ?? 0),
  };
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<GameState>(() =>
    createInitialState(1, "title"),
  );
  const [skillChoices, setSkillChoices] = useState<Skill[]>([]);
  const [activeSkillId, setActiveSkillId] = useState<string | undefined>();
  const [xrayMode, setXrayMode] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [totalPlays, setTotalPlays] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSpeedRef = useRef(false);
  const gameOverTrackedRef = useRef(false);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [visit, setVisit] = useState<VisitResult | null>(null);
  const [pendingLanterns, setPendingLanterns] = useState(0);
  const [todayKey, setTodayKey] = useState("");
  const [todayDaily, setTodayDaily] = useState<DailyRecord | null>(null);

  useEffect(() => {
    // localStorage（外の保存先）から読み込んで画面に反映する。初回の描画は SSR と揃えるため effect で行う
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setState(createInitialState(loadBestFloor(), "title"));
    setTotalPlays(loadPlayCount());

    // その日はじめて開いたら: 連続の日数を数え、ログイン報酬（灯り）を渡す
    const today = localDateKey();
    const v = registerVisit(loadStreak(), today);
    saveStreak(v.streak);
    let lanterns = loadLanterns();
    if (v.firstVisitToday && v.lanterns > 0) {
      lanterns = Math.min(MAX_LANTERNS, lanterns + v.lanterns);
      saveLanterns(lanterns);
      trackEvent("login_reward", {
        lanterns: v.lanterns,
        streak: bucketStreak(v.streak.count),
        welcome_back: v.welcomeBack,
      });
      setVisit(v);
    }
    setStreak(v.streak);
    setPendingLanterns(lanterns);
    setTodayKey(today);
    setTodayDaily(loadDailyRecord(today));
  }, []);

  // Keep hasSpeedRef in sync for use in the timer effect
  useEffect(() => {
    hasSpeedRef.current = state.skills.some((s) => s.id === "speed");
  }, [state.skills]);

  // Track stats once per game over
  useEffect(() => {
    if (!mounted) return;
    if (state.gamePhase === "gameOver" && !gameOverTrackedRef.current) {
      gameOverTrackedRef.current = true;
      incrementPlayCount();
      const revealed = state.board
        .flat()
        .filter((c) => c.state === "revealed" && !c.isMine).length;
      addTotalRevealed(revealed);
      trackSkills(state.skills);
      if (state.mode === "daily" && state.dateKey) {
        const saved = saveDailyRecord({
          date: state.dateKey,
          floor: state.floor,
          timer: state.timer,
        });
        if (saved) {
          trackEvent("daily_done", { floor: state.floor });
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setTodayDaily(loadDailyRecord(state.dateKey));
        }
      }
      trackEvent("game_over", {
        floor: state.floor,
        revealed,
        skill_count: state.skills.length,
        timer: state.timer,
      });
      // 保存した回数（localStorage）を読み戻す
      setTotalPlays(loadPlayCount());
    }
  }, [
    mounted,
    state.gamePhase,
    state.board,
    state.skills,
    state.floor,
    state.timer,
    state.mode,
    state.dateKey,
  ]);

  useEffect(() => {
    if (!mounted) return;
    if (state.gamePhase === "playing") {
      const interval = hasSpeedRef.current ? 2000 : 1000;
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, timer: prev.timer + 1 }));
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mounted, state.gamePhase]);

  const handleReveal = useCallback(
    (x: number, y: number) => {
      setState((prev) => {
        if (prev.gamePhase !== "playing") return prev;
        const cell = prev.board[y][x];
        if (cell.state !== "hidden") return prev;

        if (xrayMode) {
          setXrayMode(false);
          setActiveSkillId(undefined);
          const updatedSkills = prev.skills.map((s) =>
            s.id === "xray" && !s.used ? { ...s, used: true } : s,
          );
          if (cell.isMine) return { ...prev, skills: updatedSkills };
          const newBoard = floodReveal(prev.board, x, y, prev.boardSize);
          const cleared = isCleared(newBoard, prev.boardSize);
          return {
            ...prev,
            board: newBoard,
            skills: updatedSkills,
            gamePhase: cleared ? "cleared" : "playing",
          };
        }

        let board = prev.board;
        if (prev.firstClick) {
          board = generateBoard(prev.boardSize, prev.mineCount, x, y);
          if (prev.pendingAutoReveal > 0) {
            const autoRevealCells = getAutoRevealCells(
              board,
              prev.boardSize,
              prev.pendingAutoReveal,
            );
            for (const [ax, ay] of autoRevealCells) {
              board = floodReveal(board, ax, ay, prev.boardSize);
            }
          }
        }

        const clickedCell = board[y][x];

        if (clickedCell.isMine) {
          const hasShield = prev.skills.some(
            (s) => s.id === "shield" && !s.used,
          );
          if (hasShield) {
            const updatedSkills = prev.skills.map((s) =>
              s.id === "shield" && !s.used ? { ...s, used: true } : s,
            );
            return { ...prev, board, firstClick: false, skills: updatedSkills };
          }
          const hasHourglass = prev.skills.some(
            (s) => s.id === "hourglass" && !s.used,
          );
          if (hasHourglass) {
            const updatedSkills = prev.skills.map((s) =>
              s.id === "hourglass" && !s.used ? { ...s, used: true } : s,
            );
            return { ...prev, board, firstClick: false, skills: updatedSkills };
          }
          const newBest = prev.floor > prev.bestFloor;
          if (newBest) {
            saveBestFloor(prev.floor);
            setIsNewRecord(true);
          }
          const revealedBoard = board.map((row) =>
            row.map((c) =>
              c.isMine ? { ...c, state: "revealed" as const } : c,
            ),
          );
          return {
            ...prev,
            board: revealedBoard,
            firstClick: false,
            bestFloor: newBest ? prev.floor : prev.bestFloor,
            gamePhase: "gameOver",
          };
        }

        const newBoard = floodReveal(board, x, y, prev.boardSize);
        const cleared = isCleared(newBoard, prev.boardSize);
        return {
          ...prev,
          board: newBoard,
          firstClick: false,
          gamePhase: cleared ? "cleared" : "playing",
        };
      });
    },
    [xrayMode],
  );

  const handleFlag = useCallback((x: number, y: number) => {
    setState((prev) => {
      if (prev.gamePhase !== "playing") return prev;
      const cell = prev.board[y][x];
      if (cell.state === "revealed") return prev;
      const next = prev.board.map((row) => row.map((c) => ({ ...c })));
      if (cell.state === "flagged") {
        next[y][x].state = "hidden";
      } else {
        next[y][x].state = "flagged";
        const hasDoubleFlag = prev.skills.some(
          (s) => s.id === "doubleflag" && !s.used,
        );
        if (hasDoubleFlag) {
          const dfBoard = applyDoubleFlag(next, x, y, prev.boardSize);
          const updatedSkills = prev.skills.map((s) =>
            s.id === "doubleflag" && !s.used ? { ...s, used: true } : s,
          );
          return { ...prev, board: dfBoard, skills: updatedSkills };
        }
      }
      return { ...prev, board: next };
    });
  }, []);

  const handleFloorClearContinue = useCallback(() => {
    trackEvent("floor_clear", { floor: state.floor });
    const hasMagnet = state.skills.some((s) => s.id === "magnet");
    const hasLucky = state.skills.some((s) => s.id === "lucky");
    const count = hasMagnet ? 4 : 3;
    const rand =
      state.mode === "daily" && state.dateKey
        ? dailyRandom(state.dateKey, state.floor, "skills")
        : Math.random;
    setSkillChoices(getRandomSkillChoices(count, hasLucky, rand));
    setState((prev) => ({ ...prev, gamePhase: "skillSelect" }));
  }, [state.floor, state.skills, state.mode, state.dateKey]);

  const handleSkillSelect = useCallback((skill: Skill) => {
    setState((prev) => {
      const nextFloor = prev.floor + 1;
      const config = getFloorConfig(nextFloor);
      let mineCount = config.mineCount;
      let boardSize = config.size;
      let pendingAutoReveal = 0;
      const newSkill = { ...skill, used: false };
      const allSkills = [...prev.skills, newSkill];
      if (skill.id === "amulet") mineCount = Math.max(1, mineCount - 2);
      if (skill.id === "shrink") {
        boardSize = Math.max(4, boardSize - 1);
        mineCount = Math.min(mineCount, boardSize * boardSize - 9);
      }
      if (skill.id === "whisper") pendingAutoReveal = 3;
      mineCount = Math.max(1, mineCount - prev.pendingMineReduction);
      const daily = prev.mode === "daily" && prev.dateKey !== null;
      let board = daily
        ? makeDailyBoard(prev.dateKey!, nextFloor, boardSize, mineCount)
        : createEmptyBoard(boardSize);
      if (daily && pendingAutoReveal > 0) {
        for (const [ax, ay] of getAutoRevealCells(board, boardSize, pendingAutoReveal)) {
          board = floodReveal(board, ax, ay, boardSize);
        }
        pendingAutoReveal = 0;
      }
      return {
        ...prev,
        floor: nextFloor,
        board,
        boardSize,
        mineCount,
        skills: allSkills,
        gamePhase: isCleared(board, boardSize) ? "cleared" : "playing",
        firstClick: !daily,
        pendingMineReduction: 0,
        pendingAutoReveal,
        lanterns: 0,
      };
    });
  }, []);

  const handleUseSkill = useCallback((skillId: string) => {
    if (skillId === "xray") {
      setXrayMode((prev) => !prev);
      setActiveSkillId((prev) => (prev === skillId ? undefined : skillId));
    } else if (skillId === "detector") {
      setState((prev) => {
        const newBoard = applyDetector(prev.board, prev.boardSize);
        const updatedSkills = prev.skills.map((s) =>
          s.id === "detector" && !s.used ? { ...s, used: true } : s,
        );
        return { ...prev, board: newBoard, skills: updatedSkills };
      });
    }
  }, []);

  const resetTransientState = useCallback(() => {
    setIsNewRecord(false);
    setXrayMode(false);
    setFlagMode(false);
    setActiveSkillId(undefined);
    gameOverTrackedRef.current = false;
  }, []);

  /** ふつうのランを始める。ログイン報酬の灯りがあればこのランで使う */
  const startNormalRun = useCallback(
    (source: string) => {
      resetTransientState();
      trackEvent("game_start", { source });
      const lanterns = loadLanterns();
      saveLanterns(0);
      setPendingLanterns(0);
      setState((prev) =>
        createInitialState(prev.bestFloor, "playing", { lanterns }),
      );
    },
    [resetTransientState],
  );

  const handleStart = useCallback(() => startNormalRun("title"), [startNormalRun]);

  const handleStartDaily = useCallback(() => {
    const today = localDateKey();
    if (loadDailyRecord(today)) return;
    resetTransientState();
    trackEvent("game_start", { source: "daily" });
    setTodayKey(today);
    setState((prev) =>
      createInitialState(prev.bestFloor, "playing", {
        mode: "daily",
        dateKey: today,
      }),
    );
  }, [resetTransientState]);

  const handleRestart = useCallback(() => startNormalRun("restart"), [startNormalRun]);

  /** 灯り: 安全なマスを 1 つ開ける（最初のフロアだけ） */
  const handleLantern = useCallback(() => {
    if (state.lanterns <= 0 || state.gamePhase !== "playing") return;
    if (state.firstClick) {
      // まだ盤が無いときは真ん中を最初のマスとして開ける（周りは必ず安全）
      const c = Math.floor(state.boardSize / 2);
      setState((prev) => ({ ...prev, lanterns: prev.lanterns - 1 }));
      handleReveal(c, c);
      return;
    }
    setState((prev) => {
      if (prev.lanterns <= 0) return prev;
      const [cell] = getAutoRevealCells(prev.board, prev.boardSize, 1);
      if (!cell) return prev;
      const board = floodReveal(prev.board, cell[0], cell[1], prev.boardSize);
      return {
        ...prev,
        board,
        lanterns: prev.lanterns - 1,
        gamePhase: isCleared(board, prev.boardSize) ? "cleared" : "playing",
      };
    });
  }, [state.lanterns, state.gamePhase, state.firstClick, state.boardSize, handleReveal]);

  const handleBackToTitle = useCallback(() => {
    resetTransientState();
    setState((prev) => createInitialState(prev.bestFloor, "title"));
    setTotalPlays(loadPlayCount());
    setPendingLanterns(loadLanterns());
    setTodayDaily(loadDailyRecord(localDateKey()));
  }, [resetTransientState]);

  const handleShowStats = useCallback(() => {
    setState((prev) => ({ ...prev, gamePhase: "stats" }));
  }, []);

  if (!mounted) {
    return <div className="h-[100dvh] bg-[#0A1628]" />;
  }

  // Title
  if (state.gamePhase === "title") {
    return (
      <div className="h-[100dvh] bg-arena text-[#E2E8F0] max-w-sm mx-auto">
        <TitleScreen
          bestFloor={state.bestFloor}
          totalPlays={totalPlays}
          onStart={handleStart}
          onShowStats={handleShowStats}
          streak={streak}
          lanterns={pendingLanterns}
          dailyNumber={todayKey ? dailyNumber(todayKey) : 1}
          todayDaily={todayDaily}
          onStartDaily={handleStartDaily}
        />
        {visit && (
          <WelcomeModal visit={visit} lanterns={pendingLanterns} onClose={() => setVisit(null)} />
        )}
      </div>
    );
  }

  // Stats
  if (state.gamePhase === "stats") {
    return (
      <div className="h-[100dvh] bg-arena text-[#E2E8F0] max-w-sm mx-auto overflow-y-auto">
        <StatsScreen onBack={handleBackToTitle} />
      </div>
    );
  }

  const flagCount = countFlags(state.board, state.boardSize);
  const revealedCount = state.board
    .flat()
    .filter((c) => c.state === "revealed" && !c.isMine).length;
  const safeTotal = state.boardSize * state.boardSize - state.mineCount;
  const progress =
    state.firstClick || safeTotal <= 0 ? 0 : revealedCount / safeTotal;

  // Game Over
  if (state.gamePhase === "gameOver") {
    return (
      <div className="h-[100dvh] bg-arena text-[#E2E8F0] max-w-sm mx-auto overflow-y-auto">
        <GameOverScreen
          floor={state.floor}
          skills={state.skills}
          timer={state.timer}
          bestFloor={state.bestFloor}
          isNewRecord={isNewRecord}
          revealedCount={revealedCount}
          totalPlays={totalPlays}
          dailyLabel={
            state.mode === "daily" && state.dateKey
              ? `デイリー #${dailyNumber(state.dateKey)}`
              : undefined
          }
          onRestart={handleRestart}
          onBackToTitle={handleBackToTitle}
        />
      </div>
    );
  }

  // Skill Select
  if (state.gamePhase === "skillSelect") {
    return (
      <div className="h-[100dvh] bg-arena text-[#E2E8F0] max-w-sm mx-auto overflow-y-auto">
        <SkillSelect
          choices={skillChoices}
          onSelect={handleSkillSelect}
          floor={state.floor}
        />
      </div>
    );
  }

  // Playing / Cleared
  return (
    <div className="h-[100dvh] flex flex-col bg-arena text-[#E2E8F0] max-w-sm mx-auto overflow-hidden">
      <Header
        floor={state.floor}
        mineCount={state.mineCount}
        flagCount={flagCount}
        timer={state.timer}
        progress={progress}
      />
      <SkillBar
        skills={state.skills}
        onUseSkill={handleUseSkill}
        activeSkillId={activeSkillId}
      />

      {/* Board + mode buttons centered as one unit */}
      <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        {state.gamePhase === "cleared" && (
          <FloorClearScreen
            floor={state.floor}
            onContinue={handleFloorClearContinue}
          />
        )}
        <div className="flex flex-col items-center" style={{ gap: "10px" }}>
          <div
            className="rounded-xl p-1.5"
            style={{
              background: "#15233A",
              border: "1px solid rgba(30,58,95,0.7)",
              boxShadow:
                "0 8px 24px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <Board
              board={state.board}
              boardSize={state.boardSize}
              onReveal={handleReveal}
              onFlag={handleFlag}
              flagMode={flagMode}
              xrayMode={xrayMode}
            />
          </div>
          {state.mode === "daily" && state.floor === 1 && (
            <p className="text-xs font-bold text-sky-300 text-center">
              📅 デイリー #{dailyNumber(state.dateKey ?? todayKey)} ・ 全員同じ盤
            </p>
          )}
          {state.lanterns > 0 && state.floor === 1 && (
            <button
              data-lantern
              onClick={handleLantern}
              className="rounded-xl border border-amber-400/50 bg-[#2A2410] px-4 py-1.5 text-sm font-black text-amber-300 active:scale-95"
            >
              🔦 灯りで安全なマスを開ける ×{state.lanterns}
            </button>
          )}
          {state.firstClick && state.floor === 1 && (
            <p className="text-xs text-[#5B7799] text-center">
              安全そうなマスをタップして開始 ・ ベスト B{state.bestFloor}F
            </p>
          )}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setFlagMode(false)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-base transition-all ${
                !flagMode
                  ? "bg-[#10B981] text-white shadow-lg shadow-emerald-500/30 scale-105"
                  : "bg-[#16243A] text-[#64748B] hover:bg-[#1E3350] hover:text-gray-300"
              }`}
            >
              ⛏ 掘る
            </button>
            <button
              onClick={() => setFlagMode(true)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-base transition-all ${
                flagMode
                  ? "bg-[#10B981] text-white shadow-lg shadow-emerald-500/30 scale-105"
                  : "bg-[#16243A] text-[#64748B] hover:bg-[#1E3350] hover:text-gray-300"
              }`}
            >
              🚩 旗
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
