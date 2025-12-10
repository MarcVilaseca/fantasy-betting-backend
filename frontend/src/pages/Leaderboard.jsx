import { useState, useEffect } from 'react';
import { users as usersApi } from '../utils/api';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getLeaderboard();
      setLeaderboard(response || []);
    } catch (err) {
      console.error('Error en carregar rànking:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
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
        <div className="card-header">Rànking de Jugadors</div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--light)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <strong>Objectiu:</strong> Aconseguir 10.000 monedes per convertir-les en 10.000.000€ de pressupost fantasy!
          </div>
        </div>

        <div>
          {leaderboard.map((user, index) => (
            <div key={user.username} className="leaderboard-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div className="leaderboard-rank">
                  {getRankEmoji(index) || `#${index + 1}`}
                </div>
                <div className="leaderboard-name">
                  {user.username}
                  {user.canCashOut && (
                    <span
                      className="badge badge-success"
                      style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}
                    >
                      Pot fer cash-out!
                    </span>
                  )}
                </div>
              </div>
              <div className="leaderboard-coins">
                {Number(user.coins).toFixed(0)} monedes
              </div>
              {user.canCashOut && (
                <div style={{ marginLeft: '1rem' }}>
                  <div className="badge badge-warning">
                    {Math.floor(user.coins / 10000)} x 10M€
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No hi ha jugadors registrats encara
          </p>
        )}
      </div>

      <div className="card">
        <div className="card-header">Com funciona?</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Cada jugador comença amb 1.000 monedes</li>
            <li>Pots apostar en els duels d'altres jugadors de la liga</li>
            <li>Hi ha diferents tipus d'apostes: guanyador, marge de victòria, over/under</li>
            <li>Pots fer apostes combinades (2-4 apostes) per multiplicar les cuotes</li>
            <li>Les apostes es tanquen els divendres a les 20:59</li>
            <li>Els resultats es resolen els dimarts a la nit</li>
            <li><strong>Quan aconsegueixis 10.000 monedes, podràs convertir-les en 10.000.000€ de pressupost fantasy!</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
