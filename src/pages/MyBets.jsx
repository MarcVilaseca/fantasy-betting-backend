import { useState, useEffect } from 'react';
import { bets as betsApi, users as usersApi } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function MyBets() {
  const { updateUser } = useAuth();
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
      console.log('📊 Apostes carregades:', betsRes);
      console.log('📊 Status de cada aposta:', betsRes?.map(b => ({ id: b.id, status: b.status, amount: b.amount })));
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
    console.log('🔴 handleCancelBet called with betId:', betId);

    if (!confirm('Estàs segur que vols cancel·lar aquesta aposta? Es retornaran les monedes.')) {
      console.log('🔴 User cancelled confirmation');
      return;
    }

    console.log('🔴 Calling API to cancel bet...');
    try {
      const response = await betsApi.cancel(betId);
      console.log('🔴 API response:', response);

      // Actualitzar saldo a la navbar sense recarregar
      if (response.data?.newBalance !== undefined) {
        updateUser({ coins: response.data.newBalance });
      }

      // Recarregar dades - l'aposta desapareixerà perquè està filtrada
      await loadData();
    } catch (err) {
      console.error('🔴 Error en cancel·lar aposta:', err);
      alert(err.response?.data?.error || 'Error en cancel·lar l\'aposta');
    }
  };

  const handleCancelParlay = async (parlayId) => {
    if (!confirm('Estàs segur que vols cancel·lar aquesta aposta combinada? Es retornaran les monedes.')) {
      return;
    }

    try {
      const response = await betsApi.cancelParlay(parlayId);

      // Actualitzar saldo a la navbar sense recarregar
      if (response.data?.newBalance !== undefined) {
        updateUser({ coins: response.data.newBalance });
      }

      // Recarregar dades - l'aposta desapareixerà perquè està filtrada
      await loadData();
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
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border)' }}>
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
            Apostes simples ({bets.filter(b => b.amount > 0 && b.status !== 'cancelled').length})
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
            Combinades ({parlays.filter(p => p.status !== 'cancelled').length})
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

        {/* Tab Content */}
        <div style={{ paddingTop: '1.5rem' }}>
          {/* Apostes simples */}
          {activeTab === 'simple' && (
          <div>
            {bets.filter(b => b.amount > 0 && b.status !== 'cancelled').length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                Encara no has fet cap aposta simple
              </p>
            ) : (
              bets.filter(b => b.amount > 0 && b.status !== 'cancelled').map(bet => (
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
                        onClick={() => {
                          alert('BOTÓ CLICAT! ID: ' + bet.id);
                          handleCancelBet(bet.id);
                        }}
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
            {parlays.filter(p => p.status !== 'cancelled').length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                Encara no has fet cap aposta combinada
              </p>
            ) : (
              parlays.filter(p => p.status !== 'cancelled').map(parlay => (
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
                      color: parseFloat(tx.amount) > 0 ? 'var(--secondary)' : 'var(--danger)'
                    }}>
                      {parseFloat(tx.amount) > 0 ? '+' : ''}{parseFloat(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default MyBets;
