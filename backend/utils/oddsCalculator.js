import { getTeamStats, getLeagueStandings } from '../data/teams.js';

// Constants
const HOUSE_MARGIN = 1.05; // 5% marge de casa
const CAPTAIN_THRESHOLD = 7; // Punts mínims per guanyar l'aposta del capità

function calculateWinProbability(team1Stats, team2Stats, pos1, pos2) {
  const avg1 = team1Stats.average;
  const avg2 = team2Stats.average;
  const positionBonus1 = 1 + ((14 - pos1) * 0.01);
  const positionBonus2 = 1 + ((14 - pos2) * 0.01);
  const strength1 = avg1 * positionBonus1;
  const strength2 = avg2 * positionBonus2;
  const totalStrength = strength1 + strength2;
  return strength1 / totalStrength;
}

function probabilityToOdds(probability) {
  if (probability <= 0 || probability >= 1) throw new Error('Probabilitat incorrecta');
  const oddsRaw = 1 / probability;
  return parseFloat((oddsRaw / HOUSE_MARGIN).toFixed(2));
}

function normalizeDualOdds(odds1, odds2) {
  const impliedProb1 = 1 / odds1;
  const impliedProb2 = 1 / odds2;
  const total = impliedProb1 + impliedProb2;
  const targetTotal = 1.05;
  if (Math.abs(total - targetTotal) > 0.01) {
    const adjustmentFactor = targetTotal / total;
    return {
      odds1: parseFloat((1 / (impliedProb1 * adjustmentFactor)).toFixed(2)),
      odds2: parseFloat((1 / (impliedProb2 * adjustmentFactor)).toFixed(2))
    };
  }
  return { odds1, odds2 };
}

export function calculateMatchOdds(team1, team2) {
  const stats1 = getTeamStats(team1);
  const stats2 = getTeamStats(team2);
  const standings = getLeagueStandings();
  const pos1 = standings.find(s => s.team === team1)?.position || 99;
  const pos2 = standings.find(s => s.team === team2)?.position || 99;
  const prob1 = calculateWinProbability(stats1, stats2, pos1, pos2);
  let odds1 = probabilityToOdds(prob1);
  let odds2 = probabilityToOdds(1 - prob1);
  const normalized = normalizeDualOdds(odds1, odds2);
  odds1 = Math.max(1.10, Math.min(10.00, normalized.odds1));
  odds2 = Math.max(1.10, Math.min(10.00, normalized.odds2));
  return {
    team1: { name: team1, odds: odds1, average: stats1.average, position: pos1 },
    team2: { name: team2, odds: odds2, average: stats2.average, position: pos2 }
  };
}

export function calculateCaptainOdds(teamName) {
  const stats = getTeamStats(teamName);
  const captainExpected = stats.average * 0.25;
  let probability;
  if (captainExpected >= 15) probability = Math.min(0.90, Math.max(0.70, 0.85 - ((captainExpected - 15) * 0.02)));
  else if (captainExpected >= 12) probability = 0.75;
  else if (captainExpected >= 10) probability = 0.60;
  else if (captainExpected >= 8) probability = 0.45;
  else probability = 0.30;
  let odds = Math.max(1.30, Math.min(6.00, parseFloat((1 / probability).toFixed(2))));
  return { team: teamName, threshold: CAPTAIN_THRESHOLD, odds, captainExpected: parseFloat(captainExpected.toFixed(1)) };
}

export function calculateOverUnderLine(team1, team2) {
  const stats1 = getTeamStats(team1);
  const stats2 = getTeamStats(team2);
  const expectedTotal = stats1.average + stats2.average;
  const line = Math.round(expectedTotal / 5) * 5;
  const lineDeviation = Math.abs(line - expectedTotal);
  let overOdds = 1.85, underOdds = 1.85;
  if (lineDeviation > 3) {
    if (line > expectedTotal) { overOdds = 1.90; underOdds = 1.80; }
    else { overOdds = 1.80; underOdds = 1.90; }
  }
  const normalized = normalizeDualOdds(overOdds, underOdds);
  return { line, expectedTotal: parseFloat(expectedTotal.toFixed(2)), overOdds: normalized.odds1, underOdds: normalized.odds2 };
}

export function generateBetOptions(team1, team2) {
  const matchOdds = calculateMatchOdds(team1, team2);
  const captain1Odds = calculateCaptainOdds(team1);
  const captain2Odds = calculateCaptainOdds(team2);
  const ouLine = calculateOverUnderLine(team1, team2);
  return { match: matchOdds, captain: { team1: captain1Odds, team2: captain2Odds }, overUnder: ouLine };
}

export function calculateParlayOdds(bets) {
  if (bets.length < 2 || bets.length > 4) throw new Error('Les combinades han de tenir entre 2 i 4 apostes');
  return parseFloat(bets.reduce((acc, bet) => acc * bet.odds, 1).toFixed(2));
}

export function calculateMarginOdds() {
  console.warn('calculateMarginOdds is deprecated');
  return null;
}