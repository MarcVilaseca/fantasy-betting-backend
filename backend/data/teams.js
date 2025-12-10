// Dades dels equips i puntuacions per jornada
export const teamsData = {
  "Jaume Creixell U.E.": [85, 100, 60, 75, 64, 88, 73, 62, 68, 52, 80, 82, 67, 67],
  "L'ESQUADRA VILAS...": [69, 90, 65, 70, 71, 71, 85, 47, 64, 61, 85, 64, 65, 41],
  "CE FerranitoPito": [86, 51, 91, 35, 72, 61, 80, 38, 73, 49, 83, 80, 61, 86],
  "Nottingham_Pressa": [73, 64, 57, 72, 69, 48, 54, 34, 71, 53, 71, 82, 63, 82],
  "AstoNitu F.C": [63, 58, 44, 77, 57, 51, 53, 61, 70, 61, 60, 89, 41, 87],
  "Ruizinho F. C.": [47, 59, 51, 80, 52, 54, 70, 40, 86, 76, 44, 27, 65, 79],
  "Laminyamal T'FC": [52, 84, 73, 58, 74, 52, 60, 27, 60, 32, 80, 57, 46, 45],
  "SANCOTS 304": [53, 51, 69, 25, 56, 37, 47, 21, 67, 68, 77, 73, 81, 58],
  "pepe rubianes": [71, 43, 50, 59, 0, 83, 61, 53, 60, 83, 77, 55, 67, 65],
  "ArnauBabau F.C": [65, 31, 54, 49, 70, 43, 40, 42, 74, 59, 67, 60, 77, 48],
  "jaaavichu05": [60, 51, 80, 52, 45, 64, 55, 59, 74, 49, 34, 60, 33, 47],
  "Ao Tat Kha FC": [34, 47, 37, 43, 23, 39, 60, 56, 44, 70, 72, 40, 50, 62],
  "Catllaneta": [50, 68, 42, 20, 47, 63, 31, 46, 42, 40, 63, 53, 45, 65],
  "Babycots F.C": [47, 39, 35, 54, 52, 44, 21, 66, 70, 53, 64, 43, 57, 55],
  "COMPTA FANTASMA": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

// Funció per calcular estadístiques d'un equip
export function getTeamStats(teamName) {
  const scores = teamsData[teamName];
  if (!scores) return null;

  // Filtrar zeros per COMPTA FANTASMA i jornades sense punts
  const validScores = scores.filter(s => s > 0);

  if (validScores.length === 0) {
    return {
      average: 0,
      total: 0,
      max: 0,
      min: 0,
      gamesPlayed: 0
    };
  }

  const total = validScores.reduce((sum, score) => sum + score, 0);
  const average = total / validScores.length;
  const max = Math.max(...validScores);
  const min = Math.min(...validScores);

  return {
    average: parseFloat(average.toFixed(2)),
    total,
    max,
    min,
    gamesPlayed: validScores.length
  };
}

// Calcular rànking basat en punts totals
export function getLeagueStandings() {
  const standings = Object.keys(teamsData).map(team => {
    const stats = getTeamStats(team);
    return {
      team,
      ...stats
    };
  });

  // Ordenar per total de punts (descendent)
  standings.sort((a, b) => b.total - a.total);

  // Afegir posició
  standings.forEach((team, index) => {
    team.position = index + 1;
  });

  return standings;
}

// Obtenir tots els noms dels equips
export function getAllTeams() {
  return Object.keys(teamsData).filter(team => team !== "COMPTA FANTASMA");
}
