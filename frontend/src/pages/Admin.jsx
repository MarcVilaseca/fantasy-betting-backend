import { useState, useEffect } from 'react';
import { matches as matchesApi, users as usersApi } from '../utils/api';

function Admin() {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newMatch, setNewMatch] = useState({
    team1: '',
    team2: '',
    round: '',
    betting_closes_at: ''
  });

  useEffect(() => {
    loadData();
    loadTeams();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesRes, usersRes] = await Promise.all([
        matchesApi.getAll(),
        usersApi.getAll()
      ]);
      setMatches(matchesRes || []);
      setUsers(usersRes || []);
    } catch (err) {
      console.error('Error en carregar dades:', err);
      alert('Error en carregar dades');
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await matchesApi.getTeams();
      setTeams(response || []);
    } catch (err) {
      console.error('Error en carregar equips:', err);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      await matchesApi.create(newMatch);
      alert('Partit creat correctament!');
      setNewMatch({ team1: '', team2: '', round: '', betting_closes_at: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error en crear partit');
    }
  };

  const handleSetResult = async (matchId) => {
    const match = matches.find(m => m.id === matchId);
    const score1 = prompt(`PuntuaciÃ³ de ${match.team1}:`);
    const score2 = prompt(`PuntuaciÃ³ de ${match.team2}:`);

    if (score1 === null || score2 === null) return;

    const s1 = parseInt(score1);
    const s2 = parseInt(score2);

    if (isNaN(s1) || isNaN(s2)) {
      alert('Puntuacions invÃ lides');
      return;
    }

    try {
      await matchesApi.setResult(matchId, s1, s2);
      alert('Resultat establert i apostes resoltes!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error en establir resultat');
    }
  };

  const handleUpdateCoins = async (userId) => {
    const user = users.find(u => u.id === userId);
    const newCoins = prompt(`Noves monedes per ${user.username}:`, user.coins);
    const reason = prompt('Motiu de l\'ajust:');

    if (newCoins === null) return;

    const coins = parseFloat(newCoins);
    if (isNaN(coins) || coins < 0) {
      alert('Quantitat invÃ lida');
      return;
    }

    try {
      await usersApi.updateCoins(userId, coins, reason || 'Ajust manual');
      alert('Monedes actualitzades!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error en actualitzar monedes');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="badge badge-success">Obert</span>;
      case 'closed':
        return <span className="badge badge-warning">Tancat</span>;
      case 'finished':
        return <span className="badge badge-primary">Finalitzat</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ca-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && matches.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">Panell d'AdministraciÃ³</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('matches')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 1rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: activeTab === 'matches' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'matches' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            Gestionar Partits
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 1rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : 'none',
              color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            Gestionar Usuaris
          </button>
        </div>

        {/* GestiÃ³ de partits */}
        {activeTab === 'matches' && (
          <div>
            {/* Crear nou partit */}
            <div style={{
              background: 'var(--light)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Crear nou partit</h3>
              <form onSubmit={handleCreateMatch}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Equip 1</label>
                    <select
                      className="form-input"
                      value={newMatch.team1}
                      onChange={(e) => setNewMatch({ ...newMatch, team1: e.target.value })}
                      required
                    >
                      <option value="">Selecciona un equip</option>
                      {teams.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Equip 2</label>
                    <select
                      className="form-input"
                      value={newMatch.team2}
                      onChange={(e) => setNewMatch({ ...newMatch, team2: e.target.value })}
                      required
                    >
                      <option value="">Selecciona un equip</option>
                      {teams.filter(t => t !== newMatch.team1).map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Ronda</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Vuitens de final"
                      value={newMatch.round}
                      onChange={(e) => setNewMatch({ ...newMatch, round: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tancament apostes</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={newMatch.betting_closes_at}
                      onChange={(e) => setNewMatch({ ...newMatch, betting_closes_at: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Crear partit
                </button>
              </form>
            </div>

            {/* Llista de partits */}
            <h3 style={{ marginBottom: '1rem' }}>Partits</h3>
            {matches.map(match => (
              <div
                key={match.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <strong>{match.round}</strong>
                    {getStatusBadge(match.status)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Tanca: {formatDate(match.betting_closes_at)}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: '1rem',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{match.team1}</div>
                    {match.status === 'finished' && (
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{match.score_team1}</div>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>VS</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{match.team2}</div>
                    {match.status === 'finished' && (
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{match.score_team2}</div>
                    )}
                  </div>
                </div>

                {match.status !== 'finished' && (
                  <button
                    onClick={() => handleSetResult(match.id)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Establir resultat
                  </button>
                )}

                {match.status === 'finished' && match.result_date && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Resolt el {formatDate(match.result_date)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* GestiÃ³ d'usuaris */}
        {activeTab === 'users' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Usuaris</h3>
            {users.map(user => (
              <div
                key={user.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {user.username}
                    {user.is_admin && (
                      <span className="badge badge-danger" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                        Admin
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Monedes: <strong>{Number(user.coins).toFixed(2)}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Registrat: {formatDate(user.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => handleUpdateCoins(user.id)}
                  className="btn btn-outline"
                >
                  Ajustar monedes
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;

