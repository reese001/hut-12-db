import { readFile } from "node:fs/promises";
import type { Metadata } from "next";
import path from "node:path";
import PlayerExplorer, { type PlayerCard } from "../components/PlayerExplorer";

const cardsPath = path.join(process.cwd(), "public", "assets", "cards.json");
const idMapsPath = path.join(process.cwd(), "public", "assets", "id-maps.json");

export const metadata: Metadata = {
  title: "NHL 12 HUT Player Database | Zamboni.gg",
  description: "Search, filter, sort, and preview NHL 12 Hockey Ultimate Team player cards.",
};

type RawPlayerCard = {
  card_db_id: number;
  skating: number;
  career: number;
  first_name: string;
  last_name: string;
  defense: number;
  nation: number;
  team_id: number;
  position: number;
  checking: number;
  shooting: number;
  hands: number;
  training_slots: number;
  rare_card: number;
  rating: number;
  is_victory_card: number;
  is_legend_card: number;
  nhl_player_id?: number | string | null;
  headshot_url?: string | null;
};

type TeamMapEntry = {
  name: string;
  league: string;
};

type IdMaps = {
  teams: Record<string, TeamMapEntry>;
  nations: Record<string, string>;
};

async function getPlayerCards(): Promise<PlayerCard[]> {
  const rawCards = JSON.parse(await readFile(cardsPath, "utf8")) as RawPlayerCard[];
  const idMaps = JSON.parse(await readFile(idMapsPath, "utf8")) as IdMaps;

  return rawCards.map((card) => ({
    ...(idMaps.teams[String(card.team_id)]
      ? {
          teamName: idMaps.teams[String(card.team_id)].name,
          leagueName: idMaps.teams[String(card.team_id)].league,
        }
      : {
          teamName: `Team ${card.team_id}`,
          leagueName: "",
        }),
    id: String(card.card_db_id),
    skating: card.skating,
    career: card.career,
    firstName: card.first_name,
    lastName: card.last_name,
    defense: card.defense,
    nation: card.nation,
    nationName: idMaps.nations[String(card.nation)] ?? `Nation ${card.nation}`,
    teamId: card.team_id,
    positionId: card.position,
    checking: card.checking,
    shooting: card.shooting,
    hands: card.hands,
    trainingSlots: card.training_slots,
    rare: card.rare_card === 1,
    rating: card.rating,
    victory: card.is_victory_card === 1,
    legend: card.is_legend_card === 1,
    nhlPlayerId: card.nhl_player_id ? Number(card.nhl_player_id) : null,
    headshotUrl: card.headshot_url ?? null,
  }));
}

export default async function Home() {
  const players = await getPlayerCards();

  return <PlayerExplorer players={players} />;
}
