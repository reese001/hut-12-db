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

function PlayerHeadshot({ player }: { player: PlayerCard }) {
  const [failed, setFailed] = useState(false);
  const src = failed ? "/assets/placeholder.png" : headshotUrl(player);

  return (
    <Image
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
    <svg className="control-icon" viewBox="0 0 24 24" aria-hidden="true">
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
    return <span className="sort-indicator inactive" aria-hidden="true" />;
  }

  return <span className={`sort-indicator ${direction}`} aria-hidden="true" />;
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
      className={`player-row ${selected ? "selected" : ""}`}
      onClick={() => onSelect(player)}
      aria-pressed={selected}
    >
      <span className="player-cell">
        <span className="avatar-wrap">
          <PlayerHeadshot player={player} />
        </span>
        <span className="player-copy">
          <strong>{fullName(player)}</strong>
          <small>{positionName(player.positionId)} / {player.teamName}</small>
        </span>
      </span>
      <b className="overall-cell">{player.rating}</b>
      {statKeys.map(([, key]) => (
        <b key={key}>{player[key]}</b>
      ))}
      <b>{player.trainingSlots}</b>
      <b>{potentialRating(player)}</b>
      <b>{player.career}</b>
      <b>{salary(player)}</b>
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
    <section className="franchise-header" aria-label="Zamboni player lookup">
      <div className="logo-block">
        <Image className="franchise-logo" src="/assets/zamboni.png" alt="" width={72} height={72} priority />
      </div>
      <div className="brand-block">
        <h1>Zamboni.gg</h1>
        <p>NHL 12 HUT DATABASE</p>
      </div>
      <div className="total-cards">
        <span>Total Cards</span>
        <strong>{totalCards.toLocaleString()}</strong>
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
    <div className="filters controls-row">
      <label className="search-field">
        <SearchIcon />
        <input
          value={state.query}
          onChange={(event) => dispatch({ type: "query", value: event.target.value })}
          placeholder="Search players..."
          aria-label="Search players"
        />
      </label>
      <label>
        <span className="sr-only">Player type</span>
        <select value={state.playerType} onChange={(event) => dispatch({ type: "playerType", value: event.target.value })}>
          <option value="skaters">Skaters</option>
          <option value="goalies">Goalies</option>
          <option value="all">All players</option>
        </select>
      </label>
      <label>
        <span className="sr-only">Card tier</span>
        <select value={state.tier} onChange={(event) => dispatch({ type: "tier", value: event.target.value })}>
          <option value="all">All cards</option>
          <option value="legend">Legends</option>
          <option value="rare">Rare</option>
          <option value="base">Base</option>
        </select>
      </label>
      <label>
        <span className="sr-only">Position</span>
        <select
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
      <label>
        <span className="sr-only">League</span>
        <select value={state.league} onChange={(event) => dispatch({ type: "league", value: event.target.value })}>
          <option value="all">All leagues</option>
          {leagues.map((leagueName) => (
            <option key={leagueName} value={leagueName}>
              {leagueName}
            </option>
          ))}
        </select>
      </label>
      {state.league !== "all" ? (
        <label>
          <span className="sr-only">Team</span>
          <select value={state.team} onChange={(event) => dispatch({ type: "team", value: event.target.value })}>
            <option value="all">All teams</option>
            {teams.map((teamName) => (
              <option key={teamName} value={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label>
        <span className="sr-only">Nation</span>
        <select value={state.nation} onChange={(event) => dispatch({ type: "nation", value: event.target.value })}>
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
    <section className="workspace-panel" aria-label="Player search and results">
      <div className="section-heading">
        <div>
          <h2>PLAYER CARDS</h2>
        </div>
      </div>

      <div className="player-table">
        <div className="table-head">
          <button type="button" onClick={() => dispatch({ type: "sort", value: "name" })}>
            Player
            <SortIndicator active={state.sortKey === "name"} direction={state.sortDirection} />
          </button>
          <button type="button" onClick={() => dispatch({ type: "sort", value: "rating" })}>
            OVR
            <SortIndicator active={state.sortKey === "rating"} direction={state.sortDirection} />
          </button>
          {statKeys.map(([label, key]) => (
            <button type="button" key={key} onClick={() => dispatch({ type: "sort", value: key })}>
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
            <button type="button" key={key} onClick={() => dispatch({ type: "sort", value: key as SortKey })}>
              {label}
              <SortIndicator active={state.sortKey === key} direction={state.sortDirection} />
            </button>
          ))}
        </div>
        <div className="player-list">
          {pagedPlayers.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              selected={activePlayer?.id === player.id}
              onSelect={(nextPlayer) => dispatch({ type: "select", player: nextPlayer })}
            />
          ))}
          {filteredCount === 0 ? (
            <div className="empty-state">
              <strong>No cards found</strong>
              <span>Try adjusting your search or filters.</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="pagination-bar">
        <div className="pagination-controls">
          <label>
            <span className="sr-only">Cards per page</span>
            <select
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
            type="button"
            onClick={() => dispatch({ type: "page", value: Math.max(1, currentPage - 1) })}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <strong>
            Page {currentPage} of {totalPages}
          </strong>
          <button
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
    <aside className="preview-panel" aria-label="Selected card details">
      {activePlayer ? (
        <>
          <div className="preview-heading">
            <div>
              <p>Selected card</p>
              <h2 className="player-name">{fullName(activePlayer)}</h2>
            </div>
            <span>{activePlayer.rating}</span>
          </div>
          <PlayerCardPreview player={activePlayer} />
          <div className="detail-grid">
            <div className="meta-row">
              <span>Card type</span>
              <strong>{cardTier(activePlayer)}</strong>
            </div>
            <div className="meta-row">
              <span>Position</span>
              <strong>{positionName(activePlayer.positionId)}</strong>
            </div>
            <div className="meta-row">
              <span>Team</span>
              <strong>{activePlayer.teamName}</strong>
            </div>
            <div className="meta-row">
              <span>League</span>
              <strong>{activePlayer.leagueName || "Unknown"}</strong>
            </div>
            <div className="meta-row">
              <span>Nation</span>
              <strong>{activePlayer.nationName}</strong>
            </div>
            <div className="meta-row">
              <span>Career</span>
              <strong>{activePlayer.career}</strong>
            </div>
            <div className="meta-row">
              <span>Training slots</span>
              <strong>{activePlayer.trainingSlots}</strong>
            </div>
            <div className="meta-row">
              <span>Potential OVR</span>
              <strong>{potentialRating(activePlayer)}</strong>
            </div>
            <div className="meta-row">
              <span>Base salary</span>
              <strong>{salary(activePlayer)}</strong>
            </div>
          </div>
        </>
      ) : (
        <div className="preview-empty">
          <strong>No card selected</strong>
          <span>Try adjusting your search or filters.</span>
        </div>
      )}
    </aside>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      made by{" "}
      <a href="https://x.com/9zamm" target="_blank" rel="noreferrer">
        @9zamm
      </a>{" "}
      for{" "}
      <a href="https://zamboni.gg" target="_blank" rel="noreferrer">
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
      <main className="app-shell">
        <p className="empty-state">No cards are available.</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <FranchiseHeader totalCards={players.length} />
        <Filters state={state} leagues={leagues} teams={teams} nations={nations} dispatch={dispatch} />

        <div className="content-grid">
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
