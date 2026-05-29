"use client";

import Image from "next/image";
import { useMemo, useReducer, useState } from "react";

export type PlayerCard = {
  id: string;
  skating: number;
  career: number;
  firstName: string;
  lastName: string;
  defense: number;
  nation: number;
  nationName: string;
  teamId: number;
  teamName: string;
  leagueName: string;
  positionId: number;
  checking: number;
  shooting: number;
  hands: number;
  trainingSlots: number;
  rare: boolean;
  rating: number;
  victory: boolean;
  legend: boolean;
  nhlPlayerId: number | null;
  headshotUrl: string | null;
};

const positions: Record<number, string> = {
  0: "C",
  1: "LW",
  2: "RW",
  3: "LD",
  4: "RD",
  5: "G",
};

const statKeys = [
  ["SKT", "skating"],
  ["SHT", "shooting"],
  ["HND", "hands"],
  ["CHK", "checking"],
  ["DEF", "defense"],
] as const;

const goalieStatLabels = {
  skating: "HGH",
  shooting: "LOW",
  hands: "QCK",
  checking: "POS",
  defense: "RBC",
} as const;

type DerivedSortKey = "potentialRating" | "salary";
type SortKey = "name" | "rating" | "career" | "trainingSlots" | DerivedSortKey | (typeof statKeys)[number][1];
type SortDirection = "asc" | "desc";

const pageSizeOptions = [25, 50, 100] as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const fontDisplay = "font-['Rajdhani','Barlow_Condensed','Oswald',var(--font-geist-sans),Arial,sans-serif]";
const clippedPanel = "[clip-path:polygon(18px_0,calc(100%_-_18px)_0,100%_18px,100%_calc(100%_-_18px),calc(100%_-_18px)_100%,18px_100%,0_calc(100%_-_18px),0_18px)]";
const panelChrome =
  "border border-white/55 bg-[linear-gradient(180deg,rgb(255_255_255/0.08),rgb(255_255_255/0.02)),rgb(0_0_0/0.78)] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.95),0_0_24px_rgb(255_255_255/0.12)] backdrop-blur-2xl";
const fieldChrome =
  "relative flex h-12 min-w-0 items-center border border-white/65 bg-[linear-gradient(180deg,rgb(255_255_255/0.12),rgb(255_255_255/0.02)),rgb(0_0_0/0.78)] text-[#c9cbd1] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.85),0_0_14px_rgb(255_255_255/0.08)] transition hover:border-white/85 hover:bg-[linear-gradient(180deg,rgb(255_255_255/0.16),rgb(255_255_255/0.04)),rgb(10_10_10/0.86)] focus-within:border-[#ffd200] focus-within:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.85),0_0_18px_rgb(255_210_0/0.18)]";
const selectChevron =
  "after:pointer-events-none after:absolute after:right-3.5 after:h-[9px] after:w-[9px] after:-translate-y-[3px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-white/80 after:content-[''] hover:after:border-slate-50 focus-within:after:border-slate-50";
const selectClass =
  "h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent py-0 pl-3.5 pr-10 text-[17px] font-bold uppercase tracking-[0.04em] text-slate-50 outline-0 text-ellipsis disabled:cursor-not-allowed disabled:text-[#8d929a]";
const tableColumns = "[--player-table-columns:minmax(240px,1fr)_repeat(10,minmax(56px,62px))] [--player-table-width:860px] max-[760px]:[--player-table-columns:minmax(260px,1fr)_repeat(10,74px)] max-[760px]:[--player-table-width:1000px]";

function fullName(player: PlayerCard) {
  return `${player.firstName} ${player.lastName}`.trim();
}

function shortCardName(player: PlayerCard) {
  const initial = player.firstName ? `${player.firstName[0]}. ` : "";
  return `${initial}${player.lastName}`;
}

function positionName(positionId: number) {
  return positions[positionId] ?? "F";
}

function statLabel(player: PlayerCard, label: string, key: (typeof statKeys)[number][1]) {
  if (player.positionId === 5) {
    return goalieStatLabels[key];
  }

  return label;
}

function listStatLabel(playerType: string, positionFilter: string, label: string, key: (typeof statKeys)[number][1]) {
  if (playerType === "goalies" || positionFilter === "G") {
    return goalieStatLabels[key];
  }

  return label;
}

function potentialRating(player: PlayerCard) {
  return Math.ceil(player.rating + player.trainingSlots * 1.5);
}

function salary(player: PlayerCard) {
  // formula for calculating salary
  const sum = player.skating + player.shooting + player.hands + player.checking + player.defense;

  return Math.round((sum * sum * sum) / 500000) * 10 - 50;
}

function sortValue(player: PlayerCard, key: Exclude<SortKey, "name">) {
  if (key === "potentialRating") {
    return potentialRating(player);
  }

  if (key === "salary") {
    return salary(player);
  }

  return player[key];
}

function cardTier(player: PlayerCard) {
  if (player.victory) {
    return "Victory";
  }

  if (player.legend) {
    return "Legend";
  }

  if (player.rare) {
    return "Rare";
  }

  return "Base";
}

function cardBase(player: PlayerCard) {
  if (player.legend) {
    return "/assets/base-legend.jpg";
  }

  if (player.rare) {
    return "/assets/base-rare.jpg";
  }

  return "/assets/base-nonrare.jpg";
}

function headshotUrl(player: PlayerCard) {
  return player.headshotUrl || "/assets/placeholder.png";
}

function PlayerHeadshot({ player, className }: { player: PlayerCard; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = failed ? "/assets/placeholder.png" : headshotUrl(player);

  return (
    <Image
      className={className}
      src={src}
      alt=""
      fill
      sizes="210px"
      unoptimized
      loading="eager"
      onError={() => setFailed(true)}
    />
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3.5 h-[18px] w-[18px] fill-none stroke-[#7c879a] stroke-[1.75] [stroke-linecap:round] [stroke-linejoin:round]"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) {
    return <span className="inline-grid h-3.5 w-3.5 place-items-center opacity-0" aria-hidden="true" />;
  }

  return (
    <span
      className={cx(
        "inline-grid h-3.5 w-3.5 place-items-center before:h-1.5 before:w-1.5 before:border-b-[1.75px] before:border-r-[1.75px] before:border-[#ffd200] before:content-['']",
        direction === "asc" ? "before:translate-y-0.5 before:rotate-[225deg]" : "before:-translate-y-px before:rotate-45",
      )}
      aria-hidden="true"
    />
  );
}

function PlayerCardPreview({ player }: { player: PlayerCard }) {
  const rareClass = player.legend ? "legend" : player.rare ? "rare" : "base";
  const displayName = shortCardName(player);
  const verticalName = rareClass === "rare" || rareClass === "base";
  // vertical card names have much less room than legend names
  const nameLengthClass = verticalName
    ? displayName.length > 10
      ? "extra-long"
      : displayName.length > 8
        ? "long"
        : ""
    : displayName.length > 22
      ? "extra-long"
      : displayName.length > 16
        ? "long"
      : "";

  return (
    <section className={`hut-card ${rareClass}`} aria-label={`${fullName(player)} card preview`}>
      <Image className="hut-card-base" src={cardBase(player)} alt="" fill sizes="340px" priority />
      <div className="card-photo">
        <Image className="portrait-watermark" src="/assets/hut-logo.png" alt="" fill sizes="220px" />
        <PlayerHeadshot key={player.id} player={player} />
      </div>
      <div className={`name-strip ${nameLengthClass}`}>{displayName.toUpperCase()}</div>
      <div className="rating-stack">
        <strong>{player.rating}</strong>
        <span>{potentialRating(player)}</span>
      </div>
      <div className="position-stack">
        <strong>{positionName(player.positionId)}</strong>
      </div>
      <div className="stat-stack">
        {statKeys.map(([label, key]) => (
          <div key={label}>
            <strong>{player[key]}</strong>
            <span>{statLabel(player, label, key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlayerRow({
  player,
  selected,
  onSelect,
}: {
  player: PlayerCard;
  selected: boolean;
  onSelect: (player: PlayerCard) => void;
}) {
  return (
    <button
      type="button"
      className={cx(
        "grid w-full grid-cols-[var(--player-table-columns)] items-center border-0 border-b border-white/10 bg-[linear-gradient(90deg,rgb(255_255_255/0.035),transparent),rgb(10_10_10/0.82)] p-0 text-left text-[#f5f5f5] transition hover:bg-[linear-gradient(90deg,rgb(255_255_255/0.12),rgb(255_255_255/0.03)),rgb(20_20_20/0.9)] min-h-[54px] max-[760px]:bg-transparent max-[760px]:border-slate-400/10",
        selected &&
          "border-white/95 bg-[linear-gradient(90deg,rgb(255_255_255/0.22),rgb(255_255_255/0.07)),rgb(25_25_25/0.95)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.95),inset_0_0_18px_rgb(255_255_255/0.22),0_0_18px_rgb(255_255_255/0.28)]",
      )}
      onClick={() => onSelect(player)}
      aria-pressed={selected}
    >
      <span className="flex min-w-0 items-center gap-3 px-3.5 py-2 pl-[18px] max-[760px]:pl-3.5">
        <span className="relative h-[34px] w-[34px] flex-none overflow-hidden rounded-[2px] border border-white/45 bg-white/10">
          <PlayerHeadshot className="object-cover object-top" player={player} />
        </span>
        <span className="min-w-0">
          <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-lg font-extrabold leading-tight tracking-[0.03em] text-[#f5f5f5]">
            {fullName(player)}
          </strong>
          <small className="mt-1 block text-base font-bold leading-tight text-[#c9cbd1]">{positionName(player.positionId)} / {player.teamName}</small>
        </span>
      </span>
      <b className="px-1.5 text-center text-xl font-black tabular-nums text-[#ffd200] [text-shadow:0_0_14px_rgb(255_210_0/0.24)]">{player.rating}</b>
      {statKeys.map(([, key]) => (
        <b className="px-1.5 text-center text-xl font-semibold tabular-nums text-[#c9cbd1]" key={key}>{player[key]}</b>
      ))}
      <b className="px-1.5 text-center text-xl font-semibold tabular-nums text-[#c9cbd1]">{player.trainingSlots}</b>
      <b className="px-1.5 text-center text-xl font-semibold tabular-nums text-[#c9cbd1]">{potentialRating(player)}</b>
      <b className="px-1.5 text-center text-xl font-semibold tabular-nums text-[#c9cbd1]">{player.career}</b>
      <b className="px-1.5 pr-2.5 text-center text-xl font-semibold tabular-nums text-[#c9cbd1]">{salary(player)}</b>
    </button>
  );
}

type PageSize = (typeof pageSizeOptions)[number];

type ExplorerState = {
  selected: PlayerCard | null;
  query: string;
  playerType: string;
  tier: string;
  position: string;
  league: string;
  team: string;
  nation: string;
  sortKey: SortKey;
  sortDirection: SortDirection;
  page: number;
  pageSize: PageSize;
};

type ExplorerAction =
  | { type: "select"; player: PlayerCard }
  | { type: "query"; value: string }
  | { type: "playerType"; value: string }
  | { type: "tier"; value: string }
  | { type: "position"; value: string }
  | { type: "league"; value: string }
  | { type: "team"; value: string }
  | { type: "nation"; value: string }
  | { type: "sort"; value: SortKey }
  | { type: "page"; value: number }
  | { type: "pageSize"; value: PageSize };

const initialExplorerState: ExplorerState = {
  selected: null,
  query: "",
  playerType: "skaters",
  tier: "all",
  position: "all",
  league: "all",
  team: "all",
  nation: "all",
  sortKey: "rating",
  sortDirection: "desc",
  page: 1,
  pageSize: 50,
};

function explorerReducer(state: ExplorerState, action: ExplorerAction): ExplorerState {
  switch (action.type) {
    case "select":
      return { ...state, selected: action.player };
    case "query":
      return { ...state, query: action.value, page: 1 };
    case "playerType":
      // changing skater/goalie scope can make position and nation filters invalid
      return { ...state, playerType: action.value, position: "all", nation: "all", page: 1 };
    case "tier":
      return { ...state, tier: action.value, page: 1 };
    case "position":
      return { ...state, position: action.value, page: 1 };
    case "league":
      // teams are scoped to the selected league, so reset the team picker when it changes
      return { ...state, league: action.value, team: "all", page: 1 };
    case "team":
      return { ...state, team: action.value, page: 1 };
    case "nation":
      return { ...state, nation: action.value, page: 1 };
    case "sort":
      if (action.value === state.sortKey) {
        return {
          ...state,
          sortDirection: state.sortDirection === "desc" ? "asc" : "desc",
          page: 1,
        };
      }

      return {
        ...state,
        sortKey: action.value,
        sortDirection: action.value === "name" ? "asc" : "desc",
        page: 1,
      };
    case "page":
      return { ...state, page: action.value };
    case "pageSize":
      return { ...state, pageSize: action.value, page: 1 };
    default:
      return state;
  }
}

function FranchiseHeader({ totalCards }: { totalCards: number }) {
  return (
    <section
      className={cx(
        "grid min-h-28 grid-cols-[220px_1fr_260px] overflow-hidden border-2 border-white/70 bg-[linear-gradient(180deg,rgb(255_255_255/0.12),transparent_20%),linear-gradient(90deg,rgb(255_255_255/0.08),transparent_35%),repeating-linear-gradient(45deg,rgb(255_255_255/0.035)_0,rgb(255_255_255/0.035)_2px,transparent_2px,transparent_7px),rgb(5_5_5/0.88)] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.9),0_0_28px_rgb(255_255_255/0.22)] max-[1180px]:grid-cols-[170px_1fr_220px] max-[960px]:grid-cols-[140px_1fr] max-[760px]:grid-cols-1",
        clippedPanel,
      )}
      aria-label="Zamboni player lookup"
    >
      <div className="grid place-items-center border-r-2 border-white/40 bg-[radial-gradient(circle,rgb(255_255_255/0.1),transparent_55%),repeating-linear-gradient(45deg,rgb(255_255_255/0.04)_0,rgb(255_255_255/0.04)_2px,transparent_2px,transparent_6px)] max-[760px]:min-h-[92px] max-[760px]:border-x-0">
        <Image className="h-[72px] w-[72px] object-contain drop-shadow-[0_8px_18px_rgb(0_0_0/0.6)]" src="/assets/zamboni.png" alt="" width={72} height={72} priority />
      </div>
      <div className="grid min-w-0 content-center px-7 py-[22px] max-[760px]:min-h-[116px] max-[760px]:border-t-2 max-[760px]:border-white/40 max-[760px]:text-center">
        <h1 className={cx("m-0 text-[44px] font-black leading-none tracking-[0.04em] text-[#f5f5f5] [text-shadow:0_0_18px_rgb(255_255_255/0.22)] max-[1180px]:text-[38px] max-[760px]:text-4xl", fontDisplay)}>
          Zamboni.gg
        </h1>
        <p className="m-0 mt-2 text-xl font-bold uppercase tracking-[0.04em] text-[#c9cbd1] max-[1180px]:text-[17px] max-[760px]:text-[15px]">NHL 12 HUT DATABASE</p>
      </div>
      <div className="grid place-content-center border-l-2 border-white/40 text-center max-[960px]:col-span-full max-[960px]:min-h-[84px] max-[960px]:border-l-0 max-[960px]:border-t-2 max-[760px]:min-h-[92px] max-[760px]:border-x-0">
        <span className="text-lg font-extrabold uppercase text-[#c9cbd1]">Total Cards</span>
        <strong className="text-[42px] font-extrabold leading-none tabular-nums text-[#f5f5f5]">{totalCards.toLocaleString()}</strong>
      </div>
    </section>
  );
}

function Filters({
  state,
  leagues,
  teams,
  nations,
  dispatch,
}: {
  state: ExplorerState;
  leagues: string[];
  teams: string[];
  nations: string[];
  dispatch: React.Dispatch<ExplorerAction>;
}) {
  return (
    <div className="my-7 mb-4 grid grid-cols-[320px_repeat(auto-fit,minmax(170px,1fr))] items-center gap-[18px] max-[760px]:grid-cols-2 max-[520px]:grid-cols-1">
      <label className={cx(fieldChrome, "max-[760px]:col-span-full max-[520px]:col-auto")}>
        <SearchIcon />
        <input
          className="h-full w-full min-w-0 border-0 bg-transparent py-0 pl-[42px] pr-3.5 text-[#f5f5f5] outline-0 placeholder:text-[#7c879a]"
          value={state.query}
          onChange={(event) => dispatch({ type: "query", value: event.target.value })}
          placeholder="Search players..."
          aria-label="Search players"
        />
      </label>
      <label className={cx(fieldChrome, selectChevron)}>
        <span className="sr-only">Player type</span>
        <select className={selectClass} value={state.playerType} onChange={(event) => dispatch({ type: "playerType", value: event.target.value })}>
          <option value="skaters">Skaters</option>
          <option value="goalies">Goalies</option>
          <option value="all">All players</option>
        </select>
      </label>
      <label className={cx(fieldChrome, selectChevron)}>
        <span className="sr-only">Card tier</span>
        <select className={selectClass} value={state.tier} onChange={(event) => dispatch({ type: "tier", value: event.target.value })}>
          <option value="all">All cards</option>
          <option value="legend">Legends</option>
          <option value="rare">Rare</option>
          <option value="base">Base</option>
        </select>
      </label>
      <label className={cx(fieldChrome, selectChevron)}>
        <span className="sr-only">Position</span>
        <select
          className={selectClass}
          value={state.playerType === "goalies" ? "G" : state.position}
          onChange={(event) => dispatch({ type: "position", value: event.target.value })}
          disabled={state.playerType === "goalies"}
        >
          <option value="all">All positions</option>
          <option value="C">C</option>
          <option value="LW">LW</option>
          <option value="RW">RW</option>
          <option value="LD">LD</option>
          <option value="RD">RD</option>
          <option value="G">G</option>
        </select>
      </label>
      <label className={cx(fieldChrome, selectChevron)}>
        <span className="sr-only">League</span>
        <select className={selectClass} value={state.league} onChange={(event) => dispatch({ type: "league", value: event.target.value })}>
          <option value="all">All leagues</option>
          {leagues.map((leagueName) => (
            <option key={leagueName} value={leagueName}>
              {leagueName}
            </option>
          ))}
        </select>
      </label>
      {state.league !== "all" ? (
        <label className={cx(fieldChrome, selectChevron)}>
          <span className="sr-only">Team</span>
          <select className={selectClass} value={state.team} onChange={(event) => dispatch({ type: "team", value: event.target.value })}>
            <option value="all">All teams</option>
            {teams.map((teamName) => (
              <option key={teamName} value={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className={cx(fieldChrome, selectChevron)}>
        <span className="sr-only">Nation</span>
        <select className={selectClass} value={state.nation} onChange={(event) => dispatch({ type: "nation", value: event.target.value })}>
          <option value="all">All nations</option>
          {nations.map((nationName) => (
            <option key={nationName} value={nationName}>
              {nationName}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function PlayerTable({
  state,
  activePlayer,
  filteredCount,
  pagedPlayers,
  totalPages,
  currentPage,
  dispatch,
}: {
  state: ExplorerState;
  activePlayer: PlayerCard | null;
  filteredCount: number;
  pagedPlayers: PlayerCard[];
  totalPages: number;
  currentPage: number;
  dispatch: React.Dispatch<ExplorerAction>;
}) {
  return (
    <section className={cx(panelChrome, "min-w-0 p-[18px] max-[1180px]:p-[22px] max-[760px]:p-4")} aria-label="Player search and results">
      <div className="mb-[18px] flex items-start justify-between gap-[18px] max-[520px]:flex-col max-[520px]:items-stretch max-[520px]:gap-3">
        <div>
          <h2 className={cx("m-0 text-[32px] font-black leading-none text-[#f5f5f5]", fontDisplay)}>PLAYER CARDS</h2>
        </div>
      </div>

      <div className={cx(tableColumns, "min-w-0 overflow-x-auto overflow-y-hidden border border-white/55 bg-black/80 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.95),0_0_24px_rgb(255_255_255/0.12)] [scrollbar-color:rgb(148_163_184/0.18)_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] max-[760px]:max-h-[62vh] max-[760px]:overflow-auto")}>
        <div className="grid min-h-11 min-w-[var(--player-table-width)] grid-cols-[var(--player-table-columns)] border-b border-white/20 bg-[linear-gradient(180deg,rgb(255_255_255/0.16),rgb(255_255_255/0.04)),rgb(22_22_22/0.94)] text-[15px] font-extrabold uppercase tracking-[0.06em] text-[#c9cbd1]">
          <button className="flex min-h-11 items-center justify-start gap-1.5 border-0 bg-transparent px-1.5 pl-[18px] font-[inherit] uppercase tracking-[inherit] text-inherit hover:bg-white/10 hover:text-[#f5f5f5]" type="button" onClick={() => dispatch({ type: "sort", value: "name" })}>
            Player
            <SortIndicator active={state.sortKey === "name"} direction={state.sortDirection} />
          </button>
          <button className="flex min-h-11 items-center justify-center gap-1.5 border-0 border-l border-white/10 bg-transparent px-1.5 font-[inherit] uppercase tracking-[inherit] text-inherit hover:bg-white/10 hover:text-[#f5f5f5]" type="button" onClick={() => dispatch({ type: "sort", value: "rating" })}>
            OVR
            <SortIndicator active={state.sortKey === "rating"} direction={state.sortDirection} />
          </button>
          {statKeys.map(([label, key]) => (
            <button className="flex min-h-11 items-center justify-center gap-1.5 border-0 border-l border-white/10 bg-transparent px-1.5 font-[inherit] uppercase tracking-[inherit] text-inherit hover:bg-white/10 hover:text-[#f5f5f5]" type="button" key={key} onClick={() => dispatch({ type: "sort", value: key })}>
              {listStatLabel(state.playerType, state.position, label, key)}
              <SortIndicator active={state.sortKey === key} direction={state.sortDirection} />
            </button>
          ))}
          {[
            ["trainingSlots", "TRN"],
            ["potentialRating", "POT"],
            ["career", "CAR"],
            ["salary", "SAL"],
          ].map(([key, label]) => (
            <button className="flex min-h-11 items-center justify-center gap-1.5 border-0 border-l border-white/10 bg-transparent px-1.5 font-[inherit] uppercase tracking-[inherit] text-inherit last:pr-2.5 hover:bg-white/10 hover:text-[#f5f5f5]" type="button" key={key} onClick={() => dispatch({ type: "sort", value: key as SortKey })}>
              {label}
              <SortIndicator active={state.sortKey === key} direction={state.sortDirection} />
            </button>
          ))}
        </div>
        <div className="grid min-h-0 min-w-[var(--player-table-width)] auto-rows-[minmax(54px,max-content)] overflow-x-visible overflow-y-auto [scrollbar-color:rgb(148_163_184/0.18)_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] max-h-[calc(100vh-340px)] max-[960px]:max-h-[58vh] max-[760px]:max-h-none max-[760px]:overflow-visible">
          {pagedPlayers.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              selected={activePlayer?.id === player.id}
              onSelect={(nextPlayer) => dispatch({ type: "select", player: nextPlayer })}
            />
          ))}
          {filteredCount === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-4 py-8 text-center text-[#c9cbd1]">
              <strong className="text-lg text-[#f5f5f5]">No cards found</strong>
              <span className="mt-1.5">Try adjusting your search or filters.</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-lg text-[#c9cbd1] max-[760px]:items-stretch max-[760px]:flex-col">
        <div className="flex items-center gap-2.5 max-[760px]:grid max-[760px]:w-full max-[760px]:grid-cols-[minmax(120px,1fr)_repeat(3,auto)] max-[760px]:gap-2.5 max-[520px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] max-[520px]:gap-2 max-[520px]:text-[15px]">
          <label className="relative flex h-[38px] items-center border border-white/45 bg-[linear-gradient(180deg,rgb(255_255_255/0.12),rgb(255_255_255/0.02)),rgb(0_0_0/0.78)] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] after:pointer-events-none after:absolute after:right-3 after:h-[7px] after:w-[7px] after:-translate-y-0.5 after:rotate-45 after:border-b-[1.75px] after:border-r-[1.75px] after:border-[rgb(186_195_211/0.9)] after:content-[''] max-[520px]:col-span-full max-[520px]:h-[34px] max-[520px]:after:right-2.5">
            <span className="sr-only">Cards per page</span>
            <select
              className="h-full min-w-28 appearance-none border-0 bg-transparent py-0 pl-3 pr-8 font-bold text-slate-50 outline-0 max-[520px]:w-full max-[520px]:min-w-0 max-[520px]:pl-2.5 max-[520px]:pr-7"
              value={state.pageSize}
              onChange={(event) => dispatch({ type: "pageSize", value: Number(event.target.value) as PageSize })}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </label>
          <button
            className="min-h-[38px] border border-white/45 bg-[linear-gradient(180deg,rgb(255_255_255/0.08),rgb(255_255_255/0.02)),rgb(0_0_0/0.72)] px-[13px] font-extrabold text-[#c9cbd1] hover:not-disabled:border-white/70 hover:not-disabled:bg-white/10 hover:not-disabled:text-[#f5f5f5] disabled:cursor-not-allowed disabled:text-[#8d929a] disabled:opacity-70 max-[520px]:min-h-[34px] max-[520px]:min-w-0 max-[520px]:px-2 max-[520px]:text-[15px]"
            type="button"
            onClick={() => dispatch({ type: "page", value: Math.max(1, currentPage - 1) })}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <strong className="min-w-[92px] text-center text-lg font-extrabold tabular-nums text-[#f5f5f5] max-[520px]:min-w-16 max-[520px]:whitespace-nowrap max-[520px]:text-[15px]">
            Page {currentPage} of {totalPages}
          </strong>
          <button
            className="min-h-[38px] border border-white/45 bg-[linear-gradient(180deg,rgb(255_255_255/0.08),rgb(255_255_255/0.02)),rgb(0_0_0/0.72)] px-[13px] font-extrabold text-[#c9cbd1] hover:not-disabled:border-white/70 hover:not-disabled:bg-white/10 hover:not-disabled:text-[#f5f5f5] disabled:cursor-not-allowed disabled:text-[#8d929a] disabled:opacity-70 max-[520px]:min-h-[34px] max-[520px]:min-w-0 max-[520px]:px-2 max-[520px]:text-[15px]"
            type="button"
            onClick={() => dispatch({ type: "page", value: Math.min(totalPages, currentPage + 1) })}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function PreviewPanel({ activePlayer }: { activePlayer: PlayerCard | null }) {
  return (
    <aside
      className={cx(
        panelChrome,
        "sticky top-8 grid min-h-[660px] justify-items-center gap-6 p-5 max-[1180px]:p-[22px] max-[960px]:static max-[960px]:order-first max-[960px]:min-h-0 max-[960px]:grid-cols-[minmax(220px,300px)_minmax(220px,1fr)] max-[960px]:items-center max-[760px]:order-none max-[760px]:grid-cols-1 max-[760px]:p-4",
      )}
      aria-label="Selected card details"
    >
      {activePlayer ? (
        <>
          <div className="flex w-full items-start justify-between gap-[18px] max-[960px]:col-start-2 max-[760px]:col-auto max-[520px]:flex-row max-[520px]:text-left">
            <div className="min-w-0">
              <p className="m-0 mb-[7px] text-xl font-extrabold uppercase tracking-[0.08em] text-[#8390a7]">Selected card</p>
              <h2 className={cx("m-0 text-4xl font-black leading-none text-[#f5f5f5] max-[960px]:text-[28px]", fontDisplay)}>{fullName(activePlayer)}</h2>
            </div>
            <span className="grid h-[54px] w-[54px] min-w-[54px] flex-none place-items-center border border-white/55 bg-[linear-gradient(180deg,rgb(255_255_255/0.14),rgb(255_255_255/0.04)),rgb(0_0_0/0.78)] text-[25px] font-black tabular-nums text-[#ffd200] shadow-[0_0_18px_rgb(255_255_255/0.18)] max-[520px]:p-0">{activePlayer.rating}</span>
          </div>
          <PlayerCardPreview player={activePlayer} />
          <div className="w-full overflow-hidden border border-white/30 bg-black/60 max-[960px]:col-start-2 max-[760px]:col-auto">
            {[
              ["Card type", cardTier(activePlayer)],
              ["Position", positionName(activePlayer.positionId)],
              ["Team", activePlayer.teamName],
              ["League", activePlayer.leagueName || "Unknown"],
              ["Nation", activePlayer.nationName],
              ["Career", activePlayer.career],
              ["Training slots", activePlayer.trainingSlots],
              ["Potential OVR", potentialRating(activePlayer)],
              ["Base salary", salary(activePlayer)],
            ].map(([label, value], index) => (
              <div className="flex min-h-[58px] items-center justify-between gap-[18px] border-b border-white/10 px-[18px] last:border-b-0" key={label}>
                <span className="text-2xl font-extrabold uppercase text-[#c9cbd1]">{label}</span>
                <strong className={cx("text-right text-xl font-extrabold uppercase tabular-nums text-[#f5f5f5]", index === 0 && "text-[#ffd200]")}>{value}</strong>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex min-h-[360px] w-full flex-col items-center justify-center text-center text-[#c9cbd1]">
          <strong className="text-lg text-[#f5f5f5]">No card selected</strong>
          <span className="mt-1.5">Try adjusting your search or filters.</span>
        </div>
      )}
    </aside>
  );
}

function SiteFooter() {
  return (
    <footer className="mx-auto mt-[42px] w-full text-center text-xs font-light text-[rgb(168_179_199/0.52)]">
      made by{" "}
      <a className="font-normal underline decoration-1 underline-offset-4 hover:text-slate-50/75" href="https://x.com/9zamm" target="_blank" rel="noreferrer">
        @9zamm
      </a>{" "}
      for{" "}
      <a className="font-normal underline decoration-1 underline-offset-4 hover:text-slate-50/75" href="https://zamboni.gg" target="_blank" rel="noreferrer">
        zamboni.gg
      </a>
    </footer>
  );
}

export default function PlayerExplorer({ players }: { players: PlayerCard[] }) {
  const [state, dispatch] = useReducer(explorerReducer, initialExplorerState);

  const leagues = useMemo(
    () =>
      // keep option lists unique without mutating the source card array
      players
        .flatMap((player) => (player.leagueName ? [player.leagueName] : []))
        .toSorted()
        .filter((leagueName, index, leagueNames) => leagueNames.indexOf(leagueName) === index)
        .toSorted((a, b) => {
          if (a === "NHL") {
            return -1;
          }

          if (b === "NHL") {
            return 1;
          }

          return a.localeCompare(b);
        }),
    [players],
  );
  const teams = useMemo(
    () =>
      players
        .flatMap((player) => (state.league !== "all" && player.leagueName === state.league ? [player.teamName] : []))
        .toSorted()
        .filter((teamName, index, teamNames) => teamNames.indexOf(teamName) === index),
    [players, state.league],
  );
  const nations = useMemo(
    () =>
      players
        .flatMap((player) =>
          (state.playerType === "all" ||
            (state.playerType === "skaters" && player.positionId !== 5) ||
            (state.playerType === "goalies" && player.positionId === 5)) &&
          player.nationName
            ? [player.nationName]
            : [],
        )
        .toSorted()
        .filter((nationName, index, nationNames) => nationNames.indexOf(nationName) === index),
    [players, state.playerType],
  );

  const filtered = useMemo(() => {
    const normalized = state.query.trim().toLowerCase();

    return players
      .filter((player) => {
        const text = fullName(player).toLowerCase();
        const matchesText = !normalized || text.includes(normalized);
        const matchesTier =
          state.tier === "all" ||
          (state.tier === "legend" && player.legend) ||
          (state.tier === "rare" && player.rare && !player.legend) ||
          (state.tier === "base" && !player.rare && !player.legend);
        const matchesType =
          state.playerType === "all" ||
          (state.playerType === "skaters" && player.positionId !== 5) ||
          (state.playerType === "goalies" && player.positionId === 5);
        const matchesPosition =
          state.playerType === "goalies" || state.position === "all" || positionName(player.positionId) === state.position;
        const matchesLeague = state.league === "all" || player.leagueName === state.league;
        const matchesTeam = state.team === "all" || player.teamName === state.team;
        const matchesNation = state.nation === "all" || player.nationName === state.nation;

        return matchesText && matchesTier && matchesType && matchesPosition && matchesLeague && matchesTeam && matchesNation;
      })
      .toSorted((a, b) => {
        // every sort falls back to rating and then name
        const direction = state.sortDirection === "asc" ? 1 : -1;

        if (state.sortKey === "name") {
          const nameDifference = fullName(a).localeCompare(fullName(b)) * direction;

          if (nameDifference !== 0) {
            return nameDifference;
          }

          return b.rating - a.rating;
        }

        const statDifference = (sortValue(a, state.sortKey) - sortValue(b, state.sortKey)) * direction;

        if (statDifference !== 0) {
          return statDifference;
        }

        if (state.sortKey !== "rating" && b.rating !== a.rating) {
          return b.rating - a.rating;
        }

        return fullName(a).localeCompare(fullName(b));
      });
  }, [players, state]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  const currentPage = Math.min(state.page, totalPages);
  const pagedPlayers = useMemo(() => {
    const start = (currentPage - 1) * state.pageSize;

    return filtered.slice(start, start + state.pageSize);
  }, [currentPage, filtered, state.pageSize]);

  // keep the selected card if it is still on this page, otherwise preview the first visible result
  const selectedIsVisible = state.selected ? pagedPlayers.some((player) => player.id === state.selected?.id) : false;
  const activePlayer = selectedIsVisible ? state.selected : pagedPlayers[0] ?? null;

  if (players.length === 0) {
    return (
      <main className="relative isolate min-h-screen overflow-x-hidden bg-[linear-gradient(to_bottom,rgb(0_0_0/0.24),rgb(0_0_0/0.86)),url('/assets/rink-bg.jpg'),linear-gradient(to_bottom,#020202,#1b252d)] bg-cover bg-center text-[#f5f5f5]">
        <p className="flex min-h-[260px] flex-col items-center justify-center px-4 py-8 text-center text-[#c9cbd1]">No cards are available.</p>
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-[linear-gradient(to_bottom,rgb(0_0_0/0.24),rgb(0_0_0/0.86)),url('/assets/rink-bg.jpg'),linear-gradient(to_bottom,rgb(0_0_0/0.18),rgb(0_0_0/0.86)),linear-gradient(to_bottom,#020202,#1b252d)] bg-cover bg-center text-[#f5f5f5] before:pointer-events-none before:fixed before:inset-0 before:z-0 before:bg-[radial-gradient(circle_at_10%_0%,rgb(255_255_255/0.26),transparent_12%),radial-gradient(circle_at_90%_0%,rgb(255_255_255/0.22),transparent_12%),linear-gradient(180deg,rgb(0_0_0/0.04),transparent_34%,rgb(0_0_0/0.42))] before:content-['']">
      <div className="relative z-[1] mx-auto w-[min(100%,1440px)] px-12 pb-10 pt-16 max-[1180px]:px-6 max-[1180px]:py-14 max-[760px]:px-4 max-[760px]:pb-[34px] max-[760px]:pt-7">
        <FranchiseHeader totalCards={players.length} />
        <Filters state={state} leagues={leagues} teams={teams} nations={nations} dispatch={dispatch} />

        <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-7 max-[1180px]:gap-[26px] max-[960px]:grid-cols-1">
          <PlayerTable
            state={state}
            activePlayer={activePlayer}
            filteredCount={filtered.length}
            pagedPlayers={pagedPlayers}
            totalPages={totalPages}
            currentPage={currentPage}
            dispatch={dispatch}
          />
          <PreviewPanel activePlayer={activePlayer} />
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
