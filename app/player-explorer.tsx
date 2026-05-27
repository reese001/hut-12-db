"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export type PlayerCard = {
  id: string;
  skating: number;
  career: number;
  firstName: string;
  lastName: string;
  defense: number;
  nation: number;
  teamId: number;
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

type SortKey = "name" | "rating" | "trainingSlots" | (typeof statKeys)[number][1];
type SortDirection = "asc" | "desc";

const pageSizeOptions = [25, 50, 100] as const;

function fullName(player: PlayerCard) {
  return `${player.firstName} ${player.lastName}`.trim();
}

function shortCardName(player: PlayerCard) {
  const initial = player.firstName ? `${player.firstName[0]}. ` : "";
  return `${initial}${player.lastName}`.toUpperCase();
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

  return (
    <span className="sort-indicator" aria-hidden="true">
      {direction === "desc" ? "v" : "^"}
    </span>
  );
}

function PlayerCardPreview({ player }: { player: PlayerCard }) {
  const rareClass = player.legend ? "legend" : player.rare ? "rare" : "base";

  return (
    <section className={`hut-card ${rareClass}`} aria-label={`${fullName(player)} card preview`}>
      <Image className="hut-card-base" src={cardBase(player)} alt="" fill sizes="340px" priority />
      <div className="card-photo">
        <PlayerHeadshot key={player.id} player={player} />
      </div>
      <div className="name-strip">{shortCardName(player)}</div>
      <div className="rating-stack">
        <strong>{player.rating}</strong>
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
          <small>
            {positionName(player.positionId)} / {cardTier(player)}
          </small>
        </span>
      </span>
      <b className="overall-cell">{player.rating}</b>
      {statKeys.map(([, key]) => (
        <b key={key}>{player[key]}</b>
      ))}
      <b>{player.trainingSlots}</b>
    </button>
  );
}

export default function PlayerExplorer({ players }: { players: PlayerCard[] }) {
  const [selected, setSelected] = useState<PlayerCard | null>(null);
  const [query, setQuery] = useState("");
  const [playerType, setPlayerType] = useState("skaters");
  const [tier, setTier] = useState("all");
  const [position, setPosition] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(50);

  function changeSort(nextSortKey: SortKey) {
    setPage(1);

    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === "name" ? "asc" : "desc");
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return players
      .filter((player) => {
        const text = fullName(player).toLowerCase();
        const matchesText = !normalized || text.includes(normalized);
        const matchesTier =
          tier === "all" ||
          (tier === "legend" && player.legend) ||
          (tier === "rare" && player.rare && !player.legend) ||
          (tier === "base" && !player.rare && !player.legend);
        const matchesType =
          playerType === "all" ||
          (playerType === "skaters" && player.positionId !== 5) ||
          (playerType === "goalies" && player.positionId === 5);
        const matchesPosition =
          playerType === "goalies" || position === "all" || positionName(player.positionId) === position;

        return matchesText && matchesTier && matchesType && matchesPosition;
      })
      .sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;

        if (sortKey === "name") {
          const nameDifference = fullName(a).localeCompare(fullName(b)) * direction;

          if (nameDifference !== 0) {
            return nameDifference;
          }

          return b.rating - a.rating;
        }

        const statDifference = (a[sortKey] - b[sortKey]) * direction;

        if (statDifference !== 0) {
          return statDifference;
        }

        if (sortKey !== "rating" && b.rating !== a.rating) {
          return b.rating - a.rating;
        }

        return fullName(a).localeCompare(fullName(b));
      });
  }, [playerType, players, position, query, sortDirection, sortKey, tier]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, filtered.length);
  const pagedPlayers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, pageSize]);

  const selectedIsVisible = selected ? pagedPlayers.some((player) => player.id === selected.id) : false;
  const activePlayer = selectedIsVisible ? selected : pagedPlayers[0] ?? null;

  if (players.length === 0) {
    return (
      <main className="min-h-screen bg-[#eef1f4] p-8 text-[#151515]">
        <p className="empty-state">No cards are available.</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand-lockup">
            <Image
              className="brand-logo"
              src="/assets/hut-logo.png"
              alt=""
              width={34}
              height={34}
              priority
            />
            <span>NHL 12 HUT Database</span>
          </div>
        </div>
      </header>

      <div className="page-wrap">
        <section className="hero-copy">
          <h1>Player Card Lookup</h1>
          <span>
            Search and explore NHL 12 HUT player cards
          </span>
        </section>

        <div className="content-grid">
          <section className="workspace-panel" aria-label="Player search and results">
            <div className="section-heading">
              <div>
                <h2>Player cards</h2>
              </div>
            </div>

            <div className="filters">
              <label className="search-field">
                <SearchIcon />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search players..."
                  aria-label="Search players"
                />
              </label>
              <label>
                <span className="sr-only">Player type</span>
                <select
                  value={playerType}
                  onChange={(event) => {
                    setPlayerType(event.target.value);
                    setPosition("all");
                    setPage(1);
                  }}
                >
                  <option value="skaters">Skaters</option>
                  <option value="goalies">Goalies</option>
                  <option value="all">All players</option>
                </select>
              </label>
              <label>
                <span className="sr-only">Card tier</span>
                <select
                  value={tier}
                  onChange={(event) => {
                    setTier(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All cards</option>
                  <option value="legend">Legends</option>
                  <option value="rare">Rare</option>
                  <option value="base">Base</option>
                </select>
              </label>
              <label>
                <span className="sr-only">Position</span>
                <select
                  value={playerType === "goalies" ? "G" : position}
                  onChange={(event) => {
                    setPosition(event.target.value);
                    setPage(1);
                  }}
                  disabled={playerType === "goalies"}
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
            </div>

            <div className="player-table">
              <div className="table-head">
                <button onClick={() => changeSort("name")}>
                  Player
                  <SortIndicator active={sortKey === "name"} direction={sortDirection} />
                </button>
                <button onClick={() => changeSort("rating")}>
                  OVR
                  <SortIndicator active={sortKey === "rating"} direction={sortDirection} />
                </button>
                {statKeys.map(([label, key]) => (
                  <button key={key} onClick={() => changeSort(key)}>
                    {listStatLabel(playerType, position, label, key)}
                    <SortIndicator active={sortKey === key} direction={sortDirection} />
                  </button>
                ))}
                <button onClick={() => changeSort("trainingSlots")}>
                  TRN
                  <SortIndicator active={sortKey === "trainingSlots"} direction={sortDirection} />
                </button>
              </div>
              <div className="player-list">
                {pagedPlayers.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    selected={activePlayer?.id === player.id}
                    onSelect={setSelected}
                  />
                ))}
                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <strong>No cards found</strong>
                    <span>Try adjusting your search or filters.</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pagination-bar">
              <span>
                {pageStart.toLocaleString()}-{pageEnd.toLocaleString()} of {filtered.length.toLocaleString()}
              </span>
              <div className="pagination-controls">
                <label>
                  <span className="sr-only">Cards per page</span>
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value) as (typeof pageSizeOptions)[number]);
                      setPage(1);
                    }}
                  >
                    {pageSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} / page
                      </option>
                    ))}
                  </select>
                </label>
                <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1}>
                  Previous
                </button>
                <strong>
                  Page {currentPage} of {totalPages}
                </strong>
                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <aside className="preview-panel" aria-label="Selected card details">
            {activePlayer ? (
              <>
                <div className="preview-heading">
                  <div>
                    <p>Selected card</p>
                    <h2>{fullName(activePlayer)}</h2>
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
                    <span>Training slots</span>
                    <strong>{activePlayer.trainingSlots}</strong>
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
        </div>
      </div>
    </main>
  );
}
