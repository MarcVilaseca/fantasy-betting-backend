import { useState, useEffect } from 'react';
import { bets as betsApi, users as usersApi } from '../utils/api';

function MyBets() {
  const [bets, setBets] = useState([]);
  const [parlays, setParlays] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('simple');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [betsRes, parlaysRes, transRes] = await Promise.all([
        betsApi.getMy(),
        betsApi.getMyParlays(),
        usersApi.getTransactions()
      ]);
      setBets(betsRes || []);
      setParlays(parlaysRes || []);
      setTransactions(transRes || []);
    } catch (err) {
      console.error('Error en carregar dades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBet = async (betId) => {
    if (!confirm('Estàs segur que vols cancel·lar aquesta aposta? Es retornaran les monedes.')) {
      return;
    }

    try {
      const response = await betsApi.cancel(betId);
      alert(`Aposta cancel·lada! ${response.data.refundAmount} monedes retornades.`);
      // Reload data to get updated balance and bets
      await loadData();
      // Reload user to update coins in navbar
      window.location.reload();
    } catch (err) {
      console.error('Error en cancel·lar aposta:', err);
      alert(err.response?.data?.error || 'Error en cancel·lar l\'aposta');
    }
  };

  const handleCancelParlay = async (parlayId) => {
    if (!confirm('Estàs segur que vols cancel·lar aquesta aposta combinada? Es retornaran les monedes.')) {
      return;
    }

    try {
      const response = await betsApi.cancelParlay(parlayId);
      alert(`Aposta combinada cancel·lada! ${response.data.refundAmount} monedes retornades.`);
      // Reload data to get updated balance and bets
      await loadData();
      // Reload user to update coins in navbar
      window.location.reload();
    } catch (err) {
      console.error('Error en cancel·lar aposta combinada:', err);
      alert(err.response?.data?.error || 'Error en cancel·lar l\'aposta combinada');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'won':
        return <span className="badge badge-success">Guanyada</span>;
      case 'lost':
        return <span className="badge badge-danger">Perduda</span>;
      case 'pending':
        return <span className="badge badge-warning">Pendent</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatSelection = (bet) => {
    switch (bet.bet_type) {
      case 'winner':
        return `${bet.selection} guanya`;
      case 'margin':
        const [team, margin] = bet.selection.split(':');
        return `${team} ${margin}`;
      case 'over_under':
        const [type, line] = bet.selection.split(':');
        return `${type === 'over' ? 'Over' : 'Under'} ${line}`;
      default:
        return bet.selection;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ca-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">Les meves apostes</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('simple')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 1rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: activeTab === 'simple' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'simple' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            Apostes simples ({bets.filter(b => b.amount > 0).length})
          </button>
          <button
            onClick={() => setActiveTab('parlay')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 1rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: activeTab === 'parlay' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'parlay' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            Combinades ({parlays.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 1rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            Historial
          </button>
        </div>

        {/* Apostes simples */}
        {activeTab === 'simple' && (
          <div>
            {bets.filter(b => b.amount > 0).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                Encara no has fet cap aposta simple
              </p>
            ) : (
              bets.filter(b => b.amount > 0).map(bet => (
                <div
                  key={bet.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <strong>{bet.round}</strong>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {bet.team1} vs {bet.team2}
                      </div>
                    </div>
                    {getStatusBadge(bet.status)}
                  </div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <strong>{formatSelection(bet)}</strong> @ {bet.odds}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span>Apostat: <strong>{bet.amount}</strong> monedes</span>
                    <span>Retorn: <strong>{bet.potential_return}</strong> monedes</span>
                  </div>
                  {bet.match_status === 'finished' && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Resultat: {bet.score_team1} - {bet.score_team2}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatDate(bet.created_at)}
                    </div>
                    {bet.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBet(bet.id)}
                        style={{
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Cancel·lar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Combinades */}
        {activeTab === 'parlay' && (
          <div>
            {parlays.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                Encara no has fet cap aposta combinada
              </p>
            ) : (
              parlays.map(parlay => (
                <div
                  key={parlay.id}
                  style={{
                    border: '2px solid var(--warning)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    background: 'rgba(245, 158, 11, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div className="badge badge-warning">
                      Combinada ({parlay.bets.length} apostes)
                    </div>
                    {getStatusBadge(parlay.status)}
                  </div>

                  {/* Apostes de la combinada */}
                  {parlay.bets.map((bet, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--white)',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{bet.team1} vs {bet.team2}</div>
                      <div>{formatSelection(bet)} @ {bet.odds}</div>
                    </div>
                  ))}

                  <div style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Cuota total: <strong>{parlay.total_odds}</strong>
                      </div>
                      <div style={{ fontSize: '0.875rem' }}>
                        Apostat: <strong>{parlay.amount}</strong> monedes
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Retorn potencial
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>
                        {parlay.potential_return} monedes
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatDate(parlay.created_at)}
                    </div>
                    {parlay.status === 'pending' && (
                      <button
                        onClick={() => handleCancelParlay(parlay.id)}
                        style={{
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Cancel·lar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Historial */}
        {activeTab === 'history' && (
          <div>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                No hi ha transaccions
              </p>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{tx.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {formatDate(tx.created_at)}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 700,
                      color: tx.amount > 0 ? 'var(--secondary)' : 'var(--danger)'
                    }}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBets;
