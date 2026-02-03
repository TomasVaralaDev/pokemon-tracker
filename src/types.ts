// --- API-DATA ---
// Tämä määrittelee, miltä Pokemonin perustiedot näyttävät listassa
export interface PokemonBasic {
  id: number;
  name: string;
  url: string;
}

// --- KÄYTTÄJÄN DATA ---

// Tämä on yhden yksittäisen Pokemonin tallennustiedot
export interface CollectionEntry {
  caught: boolean;  // Onko napattu? (Pakollinen)
  shiny?: boolean;  // Onko shiny? (? tarkoittaa vapaaehtoista, ei pakko olla olemassa)
}

// Tämä on koko varaston rakenne
// Se on "sanakirja" (Dictionary), jossa:
// - Avain (key) on Pokemonin ID (numero)
// - Arvo (value) on yllä määritelty CollectionEntry
export interface UserCollection {
  [id: number]: CollectionEntry;
}