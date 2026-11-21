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
  loadDeepBest,
  saveDeepBest,
  loadProgress,
  loadTutorialStep,
  loadOrInitFirstDate,
  saveTutorialStep,
  TUTORIAL_STEPS,
} from "@/lib/storage";
import {
  getDeepFloorConfig,
  isSkillAvailable,
  newlyUnlocked,
  newlyEarnedTitles,
  DEEP_UNLOCK_FLOOR,
  UNLOCKS,
  type Progress,
  type TitleDef,
  type UnlockDef,
} from "@/lib/progress";
import {
  localDateKey,
  registerVisit,
  dailyRandom,
  dailyNumber,
  bucketStreak,
  daysBetween,
  MAX_LANTERNS,
  type StreakState,
  type VisitResult,
} from "@/lib/daily";
import { pastDailyKeys, dailyKeyFromSearch, isPlayableDailyKey } from "@/lib/dailyLinks";
import { trackEvent } from "@/lib/gtag";
import { EVENTS, bucketFloor, bucketMinutes, bucketDaysSinceFirst } from "@/lib/events";
import Header from "@/components/Header";
import Board from "@/components/Board";
import SkillBar from "@/components/SkillBar";
import SkillSelect from "@/components/SkillSelect";
import FloorClearScreen from "@/components/FloorClearScreen";
import GameOverScreen from "@/components/GameOverScreen";
import TitleScreen from "@/components/TitleScreen";
import StatsScreen from "@/components/StatsScreen";
import WelcomeModal from "@/components/WelcomeModal";
import CodexScreen from "@/components/CodexScreen";
import CoachTip from "@/components/CoachTip";

/** 初回の遊びながらの説明（3 つまで） */
const TIPS = [
  {
    title: "好きなマスをタップして掘ろう",
    text: "最初の 1 マスとその周りは必ず安全。地雷以外のマスを全部開けるとクリア！",
  },
  {
    title: "数字 = 周りの 8 マスにある地雷の数",
    text: "「1」の周りに地雷は 1 つ。地雷だと思うマスは下の「🚩 旗」に切り替えて印をつけよう。",
  },
  {
    title: "スキルを 1 つ選んで先へ",
    text: "3 つから 1 つ選べます。★が多いほどレア。選んだスキルは次のフロアから効きます。",
  },
];

/** モードごとのフロアの盤（ふつう・デイリーは基本の表、深層は別の表） */
function floorConfigFor(mode: RunMode, floor: number) {
  return mode === "deep" ? getDeepFloorConfig(floor) : getFloorConfig(floor);
}

/** モードごとのベスト（深層は別に保存） */
function loadBestFor(mode: RunMode): number {
  return mode === "deep" ? loadDeepBest() : loadBestFloor();
}

function saveBestFor(mode: RunMode, floor: number) {
  if (mode === "deep") saveDeepBest(floor);
  else saveBestFloor(floor);
}

/** デイリーは全員同じ並びにするため、解放で増えるスキルは入れない */
const UNLOCKABLE_IDS = new Set(UNLOCKS.map((u) => u.skillId));

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
  const mode = opts.mode ?? "normal";
  const { size, mineCount } = floorConfigFor(mode, 1);
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
  /** 逃した日のお題（まだ遊んでいないもの） */
  const [pastDailies, setPastDailies] = useState<string[]>([]);
  /** 招待のリンク（?d=）で来たお題 */
  const [inviteKey, setInviteKey] = useState<string | null>(null);
  const [deepBest, setDeepBest] = useState(0);
  const [progress, setProgress] = useState<Progress>({ best: 1, plays: 0 });
  const runStartProgressRef = useRef<Progress>({ best: 1, plays: 0 });
  const [runRewards, setRunRewards] = useState<{
    unlocks: UnlockDef[];
    titles: TitleDef[];
  }>({ unlocks: [], titles: [] });
  /** 深層モードの節目でもう 1 つ取れるスキル */
  const bonusPickRef = useRef(false);
  const [tutorialStep, setTutorialStep] = useState(TUTORIAL_STEPS);

  useEffect(() => {
    // localStorage（外の保存先）から読み込んで画面に反映する。初回の描画は SSR と揃えるため effect で行う
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setState(createInitialState(loadBestFloor(), "title"));
    setTotalPlays(loadPlayCount());

    // その日はじめて開いたら: 連続の日数を数え、ログイン報酬（灯り）を渡す
    const today = localDateKey();
    const prevStreak = loadStreak();
    const v = registerVisit(prevStreak, today);
    saveStreak(v.streak);
    // 継続率: 初回の日と今日の日付の組だけを送る（個人の ID は使わない）
    const firstDate = loadOrInitFirstDate(today);
    if (v.firstVisitToday) {
      trackEvent(EVENTS.visitDay, {
        first_date: firstDate,
        visit_date: today,
        since_first: bucketDaysSinceFirst(daysBetween(firstDate, today)),
        streak: bucketStreak(v.streak.count),
      });
    }
    let lanterns = loadLanterns();
    if (v.firstVisitToday && v.lanterns > 0) {
      lanterns = Math.min(MAX_LANTERNS, lanterns + v.lanterns);
      saveLanterns(lanterns);
      trackEvent(EVENTS.loginReward, {
        lanterns: v.lanterns,
        streak: bucketStreak(v.streak.count),
        welcome_back: v.welcomeBack,
      });
      // はじめて来た人には出さない（最初の 1 回目の遊びを邪魔しない）
      if (prevStreak.lastDate !== null) setVisit(v);
    }
    setStreak(v.streak);
    setPendingLanterns(lanterns);
    setTodayKey(today);
    setTodayDaily(loadDailyRecord(today));
    setPastDailies(pastDailyKeys(today).filter((k) => !loadDailyRecord(k)));
    setInviteKey(dailyKeyFromSearch(window.location.search, today));
    setDeepBest(loadDeepBest());
    setProgress(loadProgress());
    setTutorialStep(loadTutorialStep());
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
          trackEvent(EVENTS.dailyDone, { floor_bucket: bucketFloor(state.floor) });
          if (state.dateKey === localDateKey()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTodayDaily(loadDailyRecord(state.dateKey));
          }
        }
      }
      trackEvent(EVENTS.runEnd, {
        mode: state.mode,
        floor_bucket: bucketFloor(state.floor),
        minutes: bucketMinutes(state.timer),
        skill_count: state.skills.length,
      });
      // 以前からのイベント（既存の集計を壊さないため残す）
      trackEvent("game_over", {
        floor: state.floor,
        revealed,
        skill_count: state.skills.length,
        timer: state.timer,
      });
      // 保存した回数（localStorage）を読み戻す
      setTotalPlays(loadPlayCount());
      // ラン同士で残る解放・称号
      const after = loadProgress();
      const before = runStartProgressRef.current;
      setRunRewards({
        unlocks: newlyUnlocked(before, after),
        titles: newlyEarnedTitles(before.best, after.best),
      });
      setProgress(after);
      setDeepBest(loadDeepBest());
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
          const hasPhoenix = prev.skills.some(
            (s) => s.id === "phoenix" && !s.used,
          );
          if (hasPhoenix) {
            const updatedSkills = prev.skills.map((s) =>
              s.id === "phoenix" && !s.used ? { ...s, used: true } : s,
            );
            const flagged = board.map((row) => row.map((c) => ({ ...c })));
            flagged[y][x].state = "flagged";
            return { ...prev, board: flagged, firstClick: false, skills: updatedSkills };
          }
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
            saveBestFor(prev.mode, prev.floor);
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
    trackEvent(EVENTS.floorClear, { floor: state.floor, mode: state.mode });
    const hasMagnet = state.skills.some((s) => s.id === "magnet");
    const hasLucky = state.skills.some((s) => s.id === "lucky");
    const count = hasMagnet ? 4 : 3;
    const daily = state.mode === "daily" && state.dateKey !== null;
    const rand = daily
      ? dailyRandom(state.dateKey!, state.floor, "skills")
      : Math.random;
    const available = daily
      ? (id: string) => !UNLOCKABLE_IDS.has(id)
      : (id: string) => isSkillAvailable(id, progress);
    bonusPickRef.current =
      state.mode === "deep" && getDeepFloorConfig(state.floor).milestone;
    setSkillChoices(getRandomSkillChoices(count, hasLucky, rand, available));
    setState((prev) => ({ ...prev, gamePhase: "skillSelect" }));
  }, [state.floor, state.skills, state.mode, state.dateKey, progress]);

  const finishTip = useCallback((next: number) => {
    setTutorialStep(next);
    saveTutorialStep(next);
  }, []);

  const handleSkillSelect = useCallback((skill: Skill) => {
    if (tutorialStep < TUTORIAL_STEPS) finishTip(TUTORIAL_STEPS);
    // 深層モードの節目: もう 1 つ選べる（同じスキルは選択肢から外す）
    if (bonusPickRef.current) {
      bonusPickRef.current = false;
      setState((prev) => ({
        ...prev,
        skills: [...prev.skills, { ...skill, used: false }],
      }));
      setSkillChoices(
        getRandomSkillChoices(3, false, Math.random, (id) =>
          id !== skill.id && isSkillAvailable(id, progress),
        ),
      );
      return;
    }
    setState((prev) => {
      const nextFloor = prev.floor + 1;
      const config = floorConfigFor(prev.mode, nextFloor);
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
      if (allSkills.some((s) => s.id === "compass")) pendingAutoReveal += 2;
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
  }, [progress, tutorialStep, finishTip]);

  const handleUseSkill = useCallback((skillId: string) => {
    if (skillId === "xray") {
      setXrayMode((prev) => !prev);
      setActiveSkillId((prev) => (prev === skillId ? undefined : skillId));
    } else if (skillId === "radar") {
      setState((prev) => {
        if (prev.firstClick) return prev;
        let board = prev.board;
        for (let i = 0; i < 3; i++) board = applyDetector(board, prev.boardSize);
        const updatedSkills = prev.skills.map((s) =>
          s.id === "radar" && !s.used ? { ...s, used: true } : s,
        );
        return { ...prev, board, skills: updatedSkills };
      });
    } else if (skillId === "candle") {
      setState((prev) => {
        if (prev.firstClick) return prev;
        const [cell] = getAutoRevealCells(prev.board, prev.boardSize, 1);
        if (!cell) return prev;
        const board = floodReveal(prev.board, cell[0], cell[1], prev.boardSize);
        const updatedSkills = prev.skills.map((s) =>
          s.id === "candle" && !s.used ? { ...s, used: true } : s,
        );
        return {
          ...prev,
          board,
          skills: updatedSkills,
          gamePhase: isCleared(board, prev.boardSize) ? "cleared" : "playing",
        };
      });
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
    bonusPickRef.current = false;
    runStartProgressRef.current = loadProgress();
    setRunRewards({ unlocks: [], titles: [] });
  }, []);

  /** ふつう／深層のランを始める。ログイン報酬の灯りがあればこのランで使う */
  const startRun = useCallback(
    (source: string, mode: "normal" | "deep") => {
      resetTransientState();
      const lanterns = loadLanterns();
      trackEvent(EVENTS.runStart, { source, mode, lanterns });
      trackEvent("game_start", { source, mode });
      saveLanterns(0);
      setPendingLanterns(0);
      setState(createInitialState(loadBestFor(mode), "playing", { lanterns, mode }));
    },
    [resetTransientState],
  );

  const handleStart = useCallback(() => startRun("title", "normal"), [startRun]);
  const handleStartDeep = useCallback(() => startRun("title", "deep"), [startRun]);

  /** 毎日の挑戦を始める。dateKey を渡すと、逃した日・招待のお題（1 日 1 回は同じ） */
  const handleStartDaily = useCallback((key?: string) => {
    const today = localDateKey();
    const dateKey = key && isPlayableDailyKey(key, today) ? key : today;
    if (loadDailyRecord(dateKey)) return;
    resetTransientState();
    const source = dateKey === today ? "daily" : key === inviteKey ? "daily_invite" : "daily_past";
    trackEvent(EVENTS.runStart, { source, mode: "daily" });
    trackEvent("game_start", { source });
    setTodayKey(today);
    setState(
      createInitialState(loadBestFloor(), "playing", {
        mode: "daily",
        dateKey,
      }),
    );
  }, [resetTransientState, inviteKey]);

  const handleRestart = useCallback(
    () => startRun("restart", state.mode === "deep" ? "deep" : "normal"),
    [startRun, state.mode],
  );

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
    setState(createInitialState(loadBestFloor(), "title"));
    setTotalPlays(loadPlayCount());
    setPendingLanterns(loadLanterns());
    const today = localDateKey();
    setTodayDaily(loadDailyRecord(today));
    setPastDailies(pastDailyKeys(today).filter((k) => !loadDailyRecord(k)));
  }, [resetTransientState]);

  const handleShowStats = useCallback(() => {
    setState((prev) => ({ ...prev, gamePhase: "stats" }));
  }, []);

  const handleShowCodex = useCallback(() => {
    setProgress(loadProgress());
    setState((prev) => ({ ...prev, gamePhase: "codex" }));
  }, []);

  if (!mounted) {
    return <div className="h-[100dvh] bg-[#0A1628]" />;
  }

  // Title
  if (state.gamePhase === "title") {
    return (
      <div className="h-[100dvh] bg-arena text-[#E2E8F0] max-w-sm mx-auto overflow-y-auto">
        <TitleScreen
          bestFloor={state.bestFloor}
          totalPlays={totalPlays}
          onStart={handleStart}
          onShowStats={handleShowStats}
          streak={streak}
          lanterns={pendingLanterns}
          dailyNumber={todayKey ? dailyNumber(todayKey) : 1}
          todayDaily={todayDaily}
          onStartDaily={() => handleStartDaily()}
          pastDailies={pastDailies
            .filter((k) => k !== inviteKey)
            .map((k) => ({ key: k, number: dailyNumber(k) }))}
          onStartDailyFor={handleStartDaily}
          invite={
            inviteKey && inviteKey !== todayKey
              ? {
                  key: inviteKey,
                  number: dailyNumber(inviteKey),
                  record: loadDailyRecord(inviteKey),
                }
              : null
          }
          deepUnlocked={state.bestFloor >= DEEP_UNLOCK_FLOOR || deepBest > 0}
          deepBest={deepBest}
          onStartDeep={handleStartDeep}
          onShowCodex={handleShowCodex}
          bestOverall={progress.best}
          welcome={
            visit ? (
              <WelcomeModal visit={visit} lanterns={pendingLanterns} onClose={() => setVisit(null)} />
            ) : null
          }
        />
      </div>
    );
  }

  // 初回の説明: いまの場面に合うものを 1 つだけ出す（先へ進んだら前の説明は飛ばす）
  let tipIndex = -1;
  if (tutorialStep < TUTORIAL_STEPS && state.mode !== "daily") {
    if (state.gamePhase === "skillSelect") tipIndex = 2;
    else if (state.gamePhase === "playing" && state.floor === 1)
      tipIndex = state.firstClick ? 0 : 1;
    if (tipIndex < tutorialStep) tipIndex = -1;
  }
  const coach =
    tipIndex >= 0 ? (
      <CoachTip
        step={tipIndex + 1}
        total={TIPS.length}
        title={TIPS[tipIndex].title}
        text={TIPS[tipIndex].text}
        position={tipIndex === 2 ? "inline" : "bottom"}
        onNext={() => finishTip(tipIndex + 1)}
        onSkip={() => finishTip(TUTORIAL_STEPS)}
      />
    ) : null;

  // Codex
  if (state.gamePhase === "codex") {
    return (
      <div className="h-[100dvh] bg-arena text-[#E2E8F0] max-w-sm mx-auto overflow-y-auto">
        <CodexScreen progress={progress} onBack={handleBackToTitle} />
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
  const boardProgress =
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
              : state.mode === "deep"
                ? "深層モード"
                : undefined
          }
          isDaily={state.mode === "daily"}
          dateKey={state.mode === "daily" ? state.dateKey : null}
          newUnlocks={runRewards.unlocks}
          newTitles={runRewards.titles}
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
        {coach}
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
        progress={boardProgress}
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
          {state.mode === "deep" && (
            <p className="text-xs font-bold text-orange-300 text-center">
              🌋 深層モード
              {getDeepFloorConfig(state.floor).milestone && " ・ 節目のフロア（クリアでスキル2つ）"}
            </p>
          )}
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
              安全そうなマスをタップして開始{state.bestFloor > 0 && ` ・ ベスト B${state.bestFloor}F`}
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
      {coach}
    </div>
  );
}
