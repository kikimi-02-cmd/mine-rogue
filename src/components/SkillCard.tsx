import type { Skill } from "@/lib/types";

interface Props {
  skill: Skill;
  onClick?: () => void;
}

interface RarityTheme {
  label: string;
  text: string;
  border: string;
  glow: string;
  bg: string;
  chip: string;
}

const RARITY: Record<1 | 2 | 3, RarityTheme> = {
  1: {
    label: "コモン",
    text: "#34D399",
    border: "#10B981",
    glow: "rgba(16,185,129,0.32)",
    bg: "linear-gradient(155deg, #0F2A22 0%, #0C1A2E 65%)",
    chip: "#10B981",
  },
  2: {
    label: "レア",
    text: "#60A5FA",
    border: "#3B82F6",
    glow: "rgba(59,130,246,0.38)",
    bg: "linear-gradient(155deg, #102540 0%, #0C1A2E 65%)",
    chip: "#3B82F6",
  },
  3: {
    label: "エピック",
    text: "#C084FC",
    border: "#A855F7",
    glow: "rgba(168,85,247,0.5)",
    bg: "linear-gradient(155deg, #251040 0%, #0C1A2E 65%)",
    chip: "#A855F7",
  },
};

export default function SkillCard({ skill, onClick }: Props) {
  const t = RARITY[skill.rarity];
  const isEpic = skill.rarity === 3;

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left overflow-hidden rounded-2xl border-2 p-3.5 transition-transform active:scale-[0.97] hover:scale-[1.02] ${
        isEpic ? "animate-glow-pulse" : ""
      }`}
      style={{
        borderColor: t.border,
        background: t.bg,
        boxShadow: `0 6px 20px -8px ${t.glow}`,
      }}
    >
      {isEpic && (
        <span className="shimmer-overlay pointer-events-none absolute inset-0" />
      )}
      <div className="relative flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{
            background: "#0C1A2E",
            border: `1.5px solid ${t.border}`,
          }}
        >
          {skill.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] font-black tracking-wider"
              style={{ color: t.text }}
            >
              {"★".repeat(skill.rarity)} {t.label}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white/90"
              style={{ background: skill.type === "active" ? "#334155" : t.chip }}
            >
              {skill.type === "active" ? "発動" : "常時"}
            </span>
          </div>
          <p className="truncate text-base font-black text-white">
            {skill.name}
          </p>
        </div>
      </div>
      <p className="relative mt-2 text-xs leading-relaxed text-gray-300">
        {skill.description}
      </p>
    </button>
  );
}
