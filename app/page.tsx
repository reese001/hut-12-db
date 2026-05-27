import { readFile } from "node:fs/promises";
import path from "node:path";
import PlayerExplorer, { type PlayerCard } from "./player-explorer";

const cardsPath = path.join(process.cwd(), "public", "assets", "cards.json");

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

async function getPlayerCards(): Promise<PlayerCard[]> {
  const rawCards = JSON.parse(await readFile(cardsPath, "utf8")) as RawPlayerCard[];

  return rawCards.map((card) => ({
    id: String(card.card_db_id),
    skating: card.skating,
    career: card.career,
    firstName: card.first_name,
    lastName: card.last_name,
    defense: card.defense,
    nation: card.nation,
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
