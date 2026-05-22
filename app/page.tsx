"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, GamePhase, Skill } from "@/lib/types";
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
} from "@/lib/storage";
import Header from "@/components/Header";
import Board from "@/components/Board";
import SkillBar from "@/components/SkillBar";
import SkillSelect from "@/components/SkillSelect";
import FloorClearScreen from "@/components/FloorClearScreen";
import GameOverScreen from "@/components/GameOverScreen";
import TitleScreen from "@/components/TitleScreen";
import StatsScreen from "@/components/StatsScreen";

function createInitialState(
  bestFloor: number,
  phase: GamePhase = "playing",
): GameState {
  const { size, mineCount } = getFloorConfig(1);
  return {
    floor: 1,
    board: createEmptyBoard(size),
    boardSize: size,
    mineCount,
    skills: [],
    gamePhase: phase,
    timer: 0,
    bestFloor,
    firstClick: true,
    pendingMineReduction: 0,
    pendingAutoReveal: 0,
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

  useEffect(() => {
    setMounted(true);
    setState(createInitialState(loadBestFloor(), "title"));
    setTotalPlays(loadPlayCount());
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
      setTotalPlays(loadPlayCount());
    }
  }, [mounted, state.gamePhase, state.board, state.skills]);

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
    const hasMagnet = state.skills.some((s) => s.id === "magnet");
    const hasLucky = state.skills.some((s) => s.id === "lucky");
    const count = hasMagnet ? 4 : 3;
    setSkillChoices(getRandomSkillChoices(count, hasLucky));
    setState((prev) => ({ ...prev, gamePhase: "skillSelect" }));
  }, [state.skills]);

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
      return {
        ...prev,
        floor: nextFloor,
        board: createEmptyBoard(boardSize),
        boardSize,
        mineCount,
        skills: allSkills,
        gamePhase: "playing",
        firstClick: true,
        pendingMineReduction: 0,
        pendingAutoReveal,
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

  const handleStart = useCallback(() => {
    resetTransientState();
    setState((prev) => createInitialState(prev.bestFloor, "playing"));
  }, [resetTransientState]);

  const handleRestart = useCallback(() => {
    resetTransientState();
    setState((prev) => createInitialState(prev.bestFloor, "playing"));
  }, [resetTransientState]);

  const handleBackToTitle = useCallback(() => {
    resetTransientState();
    setState((prev) => createInitialState(prev.bestFloor, "title"));
    setTotalPlays(loadPlayCount());
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
        />
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
