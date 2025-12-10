function MatchCard({ match, onSelectBet, selectedBets }) {
  const { team1, team2, round, betOptions, betting_closes_at } = match;

  const isSelected = (matchId, betType, selection) => {
    return selectedBets.some(
      b => b.match_id === matchId && b.bet_type === betType && b.selection === selection
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ca-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="match-card">
      <div className="match-header">
        <div className="match-round">{round}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Tanca: {formatDate(betting_closes_at)}
        </div>
      </div>

      {/* Aposta al guanyador */}
      <div className="match-teams">
        <div className="team">
          <div className="team-name">{betOptions.match.team1.name}</div>
          <div className="team-odds">{betOptions.match.team1.odds}</div>
          <button
            className={`bet-button ${isSelected(match.id, 'winner', team1) ? 'selected' : ''}`}
            onClick={() => onSelectBet({
              match_id: match.id,
              bet_type: 'winner',
              selection: team1,
              odds: betOptions.match.team1.odds,
              team1,
              team2,
              round
            })}
          >
            Apostar
          </button>
        </div>

        <div className="vs">VS</div>

        <div className="team">
          <div className="team-name">{betOptions.match.team2.name}</div>
          <div className="team-odds">{betOptions.match.team2.odds}</div>
          <button
            className={`bet-button ${isSelected(match.id, 'winner', team2) ? 'selected' : ''}`}
            onClick={() => onSelectBet({
              match_id: match.id,
              bet_type: 'winner',
              selection: team2,
              odds: betOptions.match.team2.odds,
              team1,
              team2,
              round
            })}
          >
            Apostar
          </button>
        </div>
      </div>

      {/* Capità 7+ punts */}
      <div className="bet-option-group">
        <div className="bet-option-title">Capità 7+ punts</div>
        <div className="bet-buttons">
          <button
            className={`bet-button ${isSelected(match.id, 'captain', team1) ? 'selected' : ''}`}
            onClick={() => onSelectBet({
              match_id: match.id,
              bet_type: 'captain',
              selection: team1,
              odds: betOptions.captain.team1.odds,
              team1,
              team2,
              round
            })}
          >
            <span className="bet-label">{team1}</span>
            <span className="bet-odds-display">{betOptions.captain.team1.odds}</span>
          </button>

          <button
            className={`bet-button ${isSelected(match.id, 'captain', team2) ? 'selected' : ''}`}
            onClick={() => onSelectBet({
              match_id: match.id,
              bet_type: 'captain',
              selection: team2,
              odds: betOptions.captain.team2.odds,
              team1,
              team2,
              round
            })}
          >
            <span className="bet-label">{team2}</span>
            <span className="bet-odds-display">{betOptions.captain.team2.odds}</span>
          </button>
        </div>
      </div>

      {/* Over/Under */}
      <div className="bet-option-group">
        <div className="bet-option-title">Total de punts</div>
        <div className="bet-buttons">
          <button
            className={`bet-button ${isSelected(match.id, 'over_under', `over:${betOptions.overUnder.line}`) ? 'selected' : ''}`}
            onClick={() => onSelectBet({
              match_id: match.id,
              bet_type: 'over_under',
              selection: `over:${betOptions.overUnder.line}`,
              odds: betOptions.overUnder.overOdds,
              team1,
              team2,
              round
            })}
          >
            <span className="bet-label">Over {betOptions.overUnder.line}</span>
            <span className="bet-odds-display">{betOptions.overUnder.overOdds}</span>
          </button>

          <button
            className={`bet-button ${isSelected(match.id, 'over_under', `under:${betOptions.overUnder.line}`) ? 'selected' : ''}`}
            onClick={() => onSelectBet({
              match_id: match.id,
              bet_type: 'over_under',
              selection: `under:${betOptions.overUnder.line}`,
              odds: betOptions.overUnder.underOdds,
              team1,
              team2,
              round
            })}
          >
            <span className="bet-label">Under {betOptions.overUnder.line}</span>
            <span className="bet-odds-display">{betOptions.overUnder.underOdds}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MatchCard;
