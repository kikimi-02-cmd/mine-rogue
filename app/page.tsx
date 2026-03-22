'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Skill } from '@/lib/types';
import { createEmptyBoard, generateBoard, floodReveal, isCleared, countFlags, getFloorConfig } from '@/lib/board';
import { getRandomSkillChoices, applyDetector, applyDoubleFlag, getAutoRevealCells } from '@/lib/skills';
import { loadBestFloor, saveBestFloor } from '@/lib/storage';
import Header from '@/components/Header';
import Board from '@/components/Board';
import SkillBar from '@/components/SkillBar';
import SkillSelect from '@/components/SkillSelect';
import FloorClearScreen from '@/components/FloorClearScreen';
import GameOverScreen from '@/components/GameOverScreen';

function createInitialState(bestFloor: number): GameState {
  const { size, mineCount } = getFloorConfig(1);
  return {
    floor: 1,
    board: createEmptyBoard(size),
    boardSize: size,
    mineCount,
    skills: [],
    gamePhase: 'playing',
    timer: 0,
    bestFloor,
    firstClick: true,
    pendingMineReduction: 0,
    pendingAutoReveal: 0,
  };
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<GameState>(() => createInitialState(1));
  const [skillChoices, setSkillChoices] = useState<Skill[]>([]);
  const [activeSkillId, setActiveSkillId] = useState<string | undefined>();
  const [xrayMode, setXrayMode] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const best = loadBestFloor();
    setState(createInitialState(best));
  }, []);

  // タイマー
  useEffect(() => {
    if (!mounted) return;
    if (state.gamePhase === 'playing') {
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mounted, state.gamePhase]);

  const handleReveal = useCallback((x: number, y: number) => {
    setState((prev) => {
      if (prev.gamePhase !== 'playing') return prev;
      const cell = prev.board[y][x];
      if (cell.state !== 'hidden') return prev;

      // xrayモード
      if (xrayMode) {
        setXrayMode(false);
        setActiveSkillId(undefined);
        // スキルを消費済みにする
        const updatedSkills = prev.skills.map((s) =>
          s.id === 'xray' && !s.used ? { ...s, used: true } : s
        );
        if (cell.isMine) {
          // 中身を表示するだけ（安全に確認 = 地雷でも死なない、でも開かない）
          return { ...prev, skills: updatedSkills };
        }
        const newBoard = floodReveal(prev.board, x, y, prev.boardSize);
        const cleared = isCleared(newBoard, prev.boardSize);
        return {
          ...prev,
          board: newBoard,
          skills: updatedSkills,
          gamePhase: cleared ? 'cleared' : 'playing',
        };
      }

      // 初回クリック: 盤面生成
      let board = prev.board;
      if (prev.firstClick) {
        board = generateBoard(prev.boardSize, prev.mineCount, x, y);
        // 数字の囁きスキルの処理
        if (prev.pendingAutoReveal > 0) {
          const autoRevealCells = getAutoRevealCells(board, prev.boardSize, prev.pendingAutoReveal);
          for (const [ax, ay] of autoRevealCells) {
            board = floodReveal(board, ax, ay, prev.boardSize);
          }
        }
      }

      const clickedCell = board[y][x];

      // 地雷を踏んだ
      if (clickedCell.isMine) {
        const hasShield = prev.skills.some((s) => s.id === 'shield' && !s.used);
        if (hasShield) {
          const updatedSkills = prev.skills.map((s) =>
            s.id === 'shield' && !s.used ? { ...s, used: true } : s
          );
          return { ...prev, board, firstClick: false, skills: updatedSkills };
        }

        const hasHourglass = prev.skills.some((s) => s.id === 'hourglass' && !s.used);
        if (hasHourglass) {
          const updatedSkills = prev.skills.map((s) =>
            s.id === 'hourglass' && !s.used ? { ...s, used: true } : s
          );
          return { ...prev, board, firstClick: false, skills: updatedSkills };
        }

        // ゲームオーバー
        const newBest = prev.floor > prev.bestFloor;
        if (newBest) {
          saveBestFloor(prev.floor);
          setIsNewRecord(true);
        }
        const revealedBoard = board.map((row) =>
          row.map((c) => (c.isMine ? { ...c, state: 'revealed' as const } : c))
        );
        return {
          ...prev,
          board: revealedBoard,
          firstClick: false,
          bestFloor: newBest ? prev.floor : prev.bestFloor,
          gamePhase: 'gameOver',
        };
      }

      const newBoard = floodReveal(board, x, y, prev.boardSize);
      const cleared = isCleared(newBoard, prev.boardSize);
      return {
        ...prev,
        board: newBoard,
        firstClick: false,
        gamePhase: cleared ? 'cleared' : 'playing',
      };
    });
  }, [xrayMode]);

  const handleFlag = useCallback((x: number, y: number) => {
    setState((prev) => {
      if (prev.gamePhase !== 'playing') return prev;
      const cell = prev.board[y][x];
      if (cell.state === 'revealed') return prev;

      const next = prev.board.map((row) => row.map((c) => ({ ...c })));
      if (cell.state === 'flagged') {
        next[y][x].state = 'hidden';
      } else {
        next[y][x].state = 'flagged';
        // ダブルフラグスキル
        const hasDoubleFlag = prev.skills.some((s) => s.id === 'doubleflag' && !s.used);
        if (hasDoubleFlag) {
          const dfBoard = applyDoubleFlag(next, x, y, prev.boardSize);
          const updatedSkills = prev.skills.map((s) =>
            s.id === 'doubleflag' && !s.used ? { ...s, used: true } : s
          );
          return { ...prev, board: dfBoard, skills: updatedSkills };
        }
      }
      return { ...prev, board: next };
    });
  }, []);

  const handleFloorClearContinue = useCallback(() => {
    setState((prev) => ({ ...prev, gamePhase: 'skillSelect' }));
    setSkillChoices(getRandomSkillChoices(3));
  }, []);

  const handleSkillSelect = useCallback((skill: Skill) => {
    setState((prev) => {
      const nextFloor = prev.floor + 1;
      const config = getFloorConfig(nextFloor);

      let mineCount = config.mineCount;
      let boardSize = config.size;
      let pendingAutoReveal = 0;

      // パッシブスキル効果の適用
      const newSkill = { ...skill, used: false };
      const allSkills = [...prev.skills, newSkill];

      // 幸運のお守り
      if (skill.id === 'amulet') {
        mineCount = Math.max(1, mineCount - 2);
      }
      // マップ縮小
      if (skill.id === 'shrink') {
        boardSize = Math.max(4, boardSize - 1);
        mineCount = Math.min(mineCount, boardSize * boardSize - 9);
      }
      // 数字の囁き
      if (skill.id === 'whisper') {
        pendingAutoReveal = 3;
      }

      // 既存の減少を引き継ぎ
      mineCount = Math.max(1, mineCount - prev.pendingMineReduction);

      return {
        ...prev,
        floor: nextFloor,
        board: createEmptyBoard(boardSize),
        boardSize,
        mineCount,
        skills: allSkills,
        gamePhase: 'playing',
        firstClick: true,
        pendingMineReduction: 0,
        pendingAutoReveal,
      };
    });
  }, []);

  const handleUseSkill = useCallback((skillId: string) => {
    if (skillId === 'xray') {
      setXrayMode((prev) => !prev);
      setActiveSkillId((prev) => (prev === skillId ? undefined : skillId));
    } else if (skillId === 'detector') {
      setState((prev) => {
        const newBoard = applyDetector(prev.board, prev.boardSize);
        const updatedSkills = prev.skills.map((s) =>
          s.id === 'detector' && !s.used ? { ...s, used: true } : s
        );
        return { ...prev, board: newBoard, skills: updatedSkills };
      });
    }
  }, []);

  const handleRestart = useCallback(() => {
    setIsNewRecord(false);
    setXrayMode(false);
    setActiveSkillId(undefined);
    setState((prev) => createInitialState(prev.bestFloor));
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#111827]" />;
  }

  const flagCount = countFlags(state.board, state.boardSize);

  return (
    <div className="min-h-screen bg-[#111827] text-white flex flex-col max-w-sm mx-auto">
      {state.gamePhase === 'gameOver' ? (
        <GameOverScreen
          floor={state.floor}
          skills={state.skills}
          timer={state.timer}
          bestFloor={state.bestFloor}
          isNewRecord={isNewRecord}
          onRestart={handleRestart}
        />
      ) : state.gamePhase === 'skillSelect' ? (
        <SkillSelect
          choices={skillChoices}
          onSelect={handleSkillSelect}
          floor={state.floor}
        />
      ) : (
        <>
          <Header
            floor={state.floor}
            mineCount={state.mineCount}
            flagCount={flagCount}
            timer={state.timer}
            bestFloor={state.bestFloor}
          />
          <SkillBar
            skills={state.skills}
            onUseSkill={handleUseSkill}
            activeSkillId={activeSkillId}
          />
          {state.gamePhase === 'cleared' ? (
            <FloorClearScreen
              floor={state.floor}
              timer={state.timer}
              onContinue={handleFloorClearContinue}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <Board
                board={state.board}
                boardSize={state.boardSize}
                onReveal={handleReveal}
                onFlag={handleFlag}
                xrayMode={xrayMode}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
