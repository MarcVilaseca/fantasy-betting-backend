import { getTeamStats, getLeagueStandings } from '../data/teams.js';

/**
 * Calcula les cuotes per un duel entre dos equips
 * Basades en mitjana de punts i posició a la lliga
 */
export function calculateMatchOdds(team1, team2) {
  const stats1 = getTeamStats(team1);
  const stats2 = getTeamStats(team2);
  const standings = getLeagueStandings();

  // Trobar posicions
  const pos1 = standings.find(s => s.team === team1)?.position || 99;
  const pos2 = standings.find(s => s.team === team2)?.position || 99;

  // Calcular probabilitats basades en mitjana i posició
  const avg1 = stats1.average;
  const avg2 = stats2.average;

  // Factor de posició (millor posició = bonus)
  const positionFactor1 = 1 + ((15 - pos1) * 0.02); // Màxim +28%
  const positionFactor2 = 1 + ((15 - pos2) * 0.02);

  // Força ajustada
  const strength1 = avg1 * positionFactor1;
  const strength2 = avg2 * positionFactor2;

  // Probabilitat de victòria (normalitzada)
  const totalStrength = strength1 + strength2;
  const prob1 = strength1 / totalStrength;
  const prob2 = strength2 / totalStrength;

  // Convertir a cuotes (amb marge de casa 5%)
  const margin = 1.05;
  let odds1 = (1 / prob1) * margin;
  let odds2 = (1 / prob2) * margin;

  // Assegurar que les cuotes estiguin dins els rangs esperats
  odds1 = Math.max(1.20, Math.min(4.00, odds1));
  odds2 = Math.max(1.20, Math.min(4.00, odds2));

  // Arrodonir a 2 decimals
  odds1 = parseFloat(odds1.toFixed(2));
  odds2 = parseFloat(odds2.toFixed(2));

  return {
    team1: {
      name: team1,
      odds: odds1,
      average: stats1.average,
      position: pos1
    },
    team2: {
      name: team2,
      odds: odds2,
      average: stats2.average,
      position: pos2
    }
  };
}

/**
 * Calcula cuotes per marge de victòria
 * +5, +10, +20 punts amb multiplicadors x1.8, x2.5, x5.0
 */
export function calculateMarginOdds(baseOdds, margin) {
  const multipliers = {
    5: 1.8,
    10: 2.5,
    20: 5.0
  };

  const multiplier = multipliers[margin] || 1.8;
  return parseFloat((baseOdds * multiplier).toFixed(2));
}

/**
 * Calcula la línia Over/Under basada en les mitjanes dels equips
 * La línia és la suma de les mitjanes més un petit ajust
 */
export function calculateOverUnderLine(team1, team2) {
  const stats1 = getTeamStats(team1);
  const stats2 = getTeamStats(team2);

  const expectedTotal = stats1.average + stats2.average;

  // Arrodonir a múltiple de 5 més proper
  const line = Math.round(expectedTotal / 5) * 5;

  return {
    line,
    overOdds: 1.85,
    underOdds: 1.85
  };
}

/**
 * Calcula la cuota total d'una aposta combinada
 * Multiplica totes les cuotes individuals
 */
export function calculateParlayOdds(bets) {
  if (bets.length < 2 || bets.length > 4) {
    throw new Error('Les combinades han de tenir entre 2 i 4 apostes');
  }

  const totalOdds = bets.reduce((acc, bet) => acc * bet.odds, 1);
  return parseFloat(totalOdds.toFixed(2));
}

/**
 * Genera totes les opcions d'aposta per un duel
 */
export function generateBetOptions(team1, team2) {
  const matchOdds = calculateMatchOdds(team1, team2);
  const ouLine = calculateOverUnderLine(team1, team2);

  return {
    match: {
      team1: matchOdds.team1,
      team2: matchOdds.team2
    },
    margins: {
      team1: {
        name: team1,
        plus5: calculateMarginOdds(matchOdds.team1.odds, 5),
        plus10: calculateMarginOdds(matchOdds.team1.odds, 10),
        plus20: calculateMarginOdds(matchOdds.team1.odds, 20)
      },
      team2: {
        name: team2,
        plus5: calculateMarginOdds(matchOdds.team2.odds, 5),
        plus10: calculateMarginOdds(matchOdds.team2.odds, 10),
        plus20: calculateMarginOdds(matchOdds.team2.odds, 20)
      }
    },
    overUnder: ouLine
  };
}
