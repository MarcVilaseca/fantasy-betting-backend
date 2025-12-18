import { useState, useEffect } from 'react';
import { bets as betsApi } from '../utils/api';
import './PublicBets.css';

function PublicBets() {
  const [bets, setBets] = useState([]);
  const [parlays, setParlays] = useState([]);
  const [historyBets, setHistoryBets] = useState([]);
  const [historyParlays, setHistoryParlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('simple');

  useEffect(() => {
    fetchPublicBets();
    fetchPublicHistory();
  }, []);

  const fetchPublicBets = async () => {
    try {
      setLoading(true);
      const response = await betsApi.getPublic();
      setBets(response.bets || []);
      setParlays(response.parlays || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicHistory = async () => {
    try {
      console.log('📜 Carregant històric...');
      const response = await betsApi.getPublicHistory();
      console.log('📜 Històric rebut:', response);
      console.log('  - Apostes simples:', response.bets?.length || 0);
      console.log('  - Combinades:', response.parlays?.length || 0);
      setHistoryBets(response.bets || []);
      setHistoryParlays(response.parlays || []);
    } catch (err) {
      console.error('❌ Error carregant històric:', err);
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

  const getStatusBadge = (status) => {
    if (status === 'won') {
      return <span className="status-badge won">✅ Guanyada</span>;
    } else if (status === 'lost') {
      return <span className="status-badge lost">❌ Perduda</span>;
    }
    return null;
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

      {/* Tabs */}
      <div className="tabs-container">
        <button
          onClick={() => setActiveTab('simple')}
          className={`tab-button ${activeTab === 'simple' ? 'active' : ''}`}
        >
          Apostes simples
          <span className="tab-count">{bets.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('parlay')}
          className={`tab-button ${activeTab === 'parlay' ? 'active' : ''}`}
        >
          Combinades
          <span className="tab-count">{parlays.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
        >
          Històric
          <span className="tab-count">{historyBets.length + historyParlays.length}</span>
        </button>
      </div>

      {/* Apostes simples */}
      {activeTab === 'simple' && (
        <>
          {bets.length === 0 ? (
            <div className="no-bets">
              <p>Encara no hi ha apostes simples públiques</p>
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
        </>
      )}

      {/* Apostes combinades */}
      {activeTab === 'parlay' && (
        <>
          {parlays.length === 0 ? (
            <div className="no-bets">
              <p>Encara no hi ha apostes combinades públiques</p>
            </div>
          ) : (
            <div className="bets-table-container">
              <table className="bets-table">
                <thead>
                  <tr>
                    <th>Club</th>
                    <th>Apostes</th>
                    <th>Quota Total</th>
                    <th>Import</th>
                    <th>Retorn Potencial</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {parlays.map((parlay) => (
                    <tr key={parlay.id} className="bet-row">
                      <td className="username-cell">{parlay.username}</td>
                      <td className="selection-cell">
                        <div style={{ fontSize: '0.875rem' }}>
                          {parlay.bets.map((bet, idx) => (
                            <div key={idx} style={{ marginBottom: '0.25rem' }}>
                              <strong>{bet.team1} vs {bet.team2}</strong>: {bet.selection} @ {bet.odds}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="odds-cell">{parlay.total_odds}</td>
                      <td className="amount-cell">{parlay.amount} 💰</td>
                      <td className="return-cell">{parlay.potential_return} 💰</td>
                      <td className="date-cell">
                        {new Date(parlay.created_at).toLocaleDateString('ca-ES', {
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
        </>
      )}

      {/* Històric */}
      {activeTab === 'history' && (
        <>
          {historyBets.length === 0 && historyParlays.length === 0 ? (
            <div className="no-bets">
              <p>Encara no hi ha apostes resoltes</p>
            </div>
          ) : (
            <>
              {/* Apostes simples resoltes */}
              {historyBets.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Apostes Simples Resoltes</h2>
                  <div className="bets-table-container">
                    <table className="bets-table">
                      <thead>
                        <tr>
                          <th>Estat</th>
                          <th>Club</th>
                          <th>Partit</th>
                          <th>Ronda</th>
                          <th>Tipus</th>
                          <th>Selecció</th>
                          <th>Quota</th>
                          <th>Import</th>
                          <th>Retorn</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyBets.map((bet) => (
                          <tr key={bet.id} className={`bet-row ${bet.status}`}>
                            <td>{getStatusBadge(bet.status)}</td>
                            <td className="username-cell">{bet.username}</td>
                            <td className="match-cell">
                              {bet.team1} vs {bet.team2}
                            </td>
                            <td>{bet.round}</td>
                            <td>{getBetTypeLabel(bet.bet_type)}</td>
                            <td className="selection-cell">{bet.selection}</td>
                            <td className="odds-cell">{bet.odds}</td>
                            <td className="amount-cell">{bet.amount} 💰</td>
                            <td className="return-cell">
                              {bet.status === 'won' ? `${bet.potential_return} 💰` : '0 💰'}
                            </td>
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
                </div>
              )}

              {/* Combinades resoltes */}
              {historyParlays.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Apostes Combinades Resoltes</h2>
                  <div className="bets-table-container">
                    <table className="bets-table">
                      <thead>
                        <tr>
                          <th>Estat</th>
                          <th>Club</th>
                          <th>Apostes</th>
                          <th>Quota Total</th>
                          <th>Import</th>
                          <th>Retorn</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyParlays.map((parlay) => (
                          <tr key={parlay.id} className={`bet-row ${parlay.status}`}>
                            <td>{getStatusBadge(parlay.status)}</td>
                            <td className="username-cell">{parlay.username}</td>
                            <td className="selection-cell">
                              <div style={{ fontSize: '0.875rem' }}>
                                {parlay.bets.map((bet, idx) => (
                                  <div key={idx} style={{ marginBottom: '0.25rem' }}>
                                    <strong>{bet.team1} vs {bet.team2}</strong>: {bet.selection} @ {bet.odds}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="odds-cell">{parlay.total_odds}</td>
                            <td className="amount-cell">{parlay.amount} 💰</td>
                            <td className="return-cell">
                              {parlay.status === 'won' ? `${parlay.potential_return} 💰` : '0 💰'}
                            </td>
                            <td className="date-cell">
                              {new Date(parlay.created_at).toLocaleDateString('ca-ES', {
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
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default PublicBets;
