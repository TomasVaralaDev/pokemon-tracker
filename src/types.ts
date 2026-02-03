// Rajapinta API:sta tulevalle listalle
export interface PokemonBasic {
    id: number;
    name: string;
    url: string;
  }
  
  // Yksittäisen tallennuksen tietotyyppi
  export interface CollectionEntry {
    caught: boolean;
    // Tänne on helppo lisätä myöhemmin:
    // isShiny?: boolean;
    // caughtInGame?: string;
  }
  
  // Koko varaston tietotyyppi (avain on ID)
  export interface UserCollection {
    [id: number]: {
      caught: boolean;
      shiny?: boolean; // <--- UUSI: Kysymysmerkki tarkoittaa "vapaaehtoinen"
    };
    }