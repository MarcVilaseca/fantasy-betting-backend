import { useState, useEffect } from 'react';
import { bets as betsApi } from '../utils/api';
import './PublicBets.css';

function PublicBets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicBets();
  }, []);

  const fetchPublicBets = async () => {
    try {
      setLoading(true);
      const response = await betsApi.getPublic();
      setBets(response || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBetTypeLabel = (betType) => {
    switch (betType) {
      case 'winner': return 'Guanyador';
      case 'over_under': return 'Més/Menys';
      case 'captain': return 'Capità 7+';
      default: return betType;
    }
  };

  if (loading) {
    return (
      <div className="public-bets-page">
        <h1>Apostes dels Demés Clubs</h1>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-bets-page">
        <h1>Apostes dels Demés Clubs</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="public-bets-page">
      <h1>Apostes dels Demés Clubs</h1>
      <p className="page-description">
        Aquí pots veure totes les apostes que han fet els altres clubs
      </p>

      {bets.length === 0 ? (
        <div className="no-bets">
          <p>Encara no hi ha apostes públiques</p>
        </div>
      ) : (
        <div className="bets-table-container">
          <table className="bets-table">
            <thead>
              <tr>
                <th>Club</th>
                <th>Partit</th>
                <th>Ronda</th>
                <th>Tipus</th>
                <th>Selecció</th>
                <th>Quota</th>
                <th>Import</th>
                <th>Retorn Potencial</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet.id} className="bet-row">
                  <td className="username-cell">{bet.username}</td>
                  <td className="match-cell">
                    {bet.team1} vs {bet.team2}
                  </td>
                  <td>{bet.round}</td>
                  <td>{getBetTypeLabel(bet.bet_type)}</td>
                  <td className="selection-cell">{bet.selection}</td>
                  <td className="odds-cell">{bet.odds}</td>
                  <td className="amount-cell">{bet.amount} 💰</td>
                  <td className="return-cell">{bet.potential_return} 💰</td>
                  <td className="date-cell">
                    {new Date(bet.created_at).toLocaleDateString('ca-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PublicBets;
