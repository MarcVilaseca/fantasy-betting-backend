import { useState, useEffect } from 'react';
import { fantasy as fantasyApi } from '../utils/api';
import './FantasyClassification.css';

function FantasyClassification() {
  const [classification, setClassification] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassification();
  }, []);

  const fetchClassification = async () => {
    try {
      setLoading(true);
      const response = await fantasyApi.getClassification();
      setClassification(response || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="fantasy-classification-page">
        <h1>Classificació Fantasy</h1>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fantasy-classification-page">
        <h1>Classificació Fantasy</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="fantasy-classification-page">
      <h1>Classificació Fantasy</h1>
      <p className="page-description">
        Classificació general independent del sistema d'apostes. Els punts es calculen segons els resultats de cada jornada.
      </p>

      {classification.length === 0 ? (
        <div className="no-classification">
          <p>Encara no hi ha puntuacions registrades</p>
          <p className="info-text">L'administrador afegirà les puntuacions després de cada jornada</p>
        </div>
      ) : (
        <div className="classification-container">
          <div className="classification-table-wrapper">
            <table className="classification-table">
              <thead>
                <tr>
                  <th className="position-header">Posició</th>
                  <th className="team-header">Club</th>
                  <th className="matchdays-header">Jornades</th>
                  <th className="points-header">Punts</th>
                </tr>
              </thead>
              <tbody>
                {classification.map((team, index) => {
                  const position = index + 1;
                  const totalPoints = Math.round(parseFloat(team.total_points));
                  const average = Math.round(parseFloat(team.avg_points));
                  const medal = getMedalEmoji(position);

                  return (
                    <tr key={team.team} className={`team-row position-${position}`}>
                      <td className="position-cell">
                        <span className="position-number">{position}</span>
                        {medal && <span className="medal">{medal}</span>}
                      </td>
                      <td className="team-cell">
                        <span className="team-name">{team.team}</span>
                      </td>
                      <td className="matchdays-cell">{team.matches_played}</td>
                      <td className="points-cell">
                        <span className="total-points">{totalPoints}</span>
                        <span className="average-points" style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          (mitjana: {average})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="legend">
            <h3>Informació</h3>
            <ul>
              <li>Els punts fantasy són independents de les monedes d'apostes</li>
              <li>Les puntuacions s'afegeixen manualment després de cada jornada</li>
              <li>La mitjana es calcula dividint els punts totals entre les jornades jugades</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default FantasyClassification;
