import { useState, useEffect, useRef } from 'react';
import './CopaDelRei.css';
import { copa } from '../utils/api';

function CopaDelRei() {
  const [activeEdition, setActiveEdition] = useState('edition1');
  const [loading, setLoading] = useState(false);
  const fetchedEditions = useRef(new Set());
  const [brackets, setBrackets] = useState({
    edition1: {
      // Vuitens de final (Round of 16)
      round16: {
        left: [
          { id: 'r16-1', team1: 'Nottingham_Pressa', team2: 'SANCOTS 304', score1: 82, score2: 58, winner: 'Nottingham_Pressa' },
          { id: 'r16-2', team1: 'pepe rubianes', team2: 'Ruizinho F.C.', score1: 65, score2: 79, winner: 'Ruizinho F.C.' },
          { id: 'r16-3', team1: 'Esquadra Vilaseca', team2: 'AstoNitu F.C.', score1: 41, score2: 87, winner: 'AstoNitu F.C.' },
        ],
        right: [
          { id: 'r16-4', team1: 'Catllaneta', team2: 'CE FerranitoPito', score1: 65, score2: 86, winner: 'CE FerranitoPito' },
          { id: 'r16-5', team1: 'Jaume Creixell U.E.', team2: 'Laminyamal T\'FC', score1: 67, score2: 45, winner: 'Jaume Creixell U.E.' },
          { id: 'r16-6', team1: 'Arnau Babau F.C', team2: 'Babycots F.C', score1: 48, score2: 55, winner: 'Babycots F.C' },
        ],
        exempt: ['Ao Tat Kha FC', 'jaaavichu05']
      },
      quarters: {
        left: [
          { id: 'qf-1', team1: 'Nottingham_Pressa', team2: 'Ruizinho F.C.', score1: 64, score2: 76, winner: 'Ruizinho F.C.' },
          { id: 'qf-2', team1: 'AstoNitu F.C.', team2: 'Ao Tat Kha FC', score1: 88, score2: 75, winner: 'AstoNitu F.C.' },
        ],
        right: [
          { id: 'qf-3', team1: 'CE FerranitoPito', team2: 'Jaume Creixell U.E.', score1: 62, score2: 67, winner: 'Jaume Creixell U.E.' },
          { id: 'qf-4', team1: 'Babycots F.C', team2: 'jaaavichu05', score1: 61, score2: 63, winner: 'jaaavichu05' },
        ]
      },
      semis: {
        left: { id: 'sf-1', team1: 'AstoNitu F.C.', team2: 'Ruizinho F.C.', score1: 72, score2: 91, winner: 'Ruizinho F.C.' },
        right: { id: 'sf-2', team1: 'Jaume Creixell U.E.', team2: 'jaaavichu05', score1: 68, score2: 19, winner: 'Jaume Creixell U.E.' }
      },
      final: {
        id: 'final',
        team1: 'Jaume Creixell U.E.',
        team2: 'Ruizinho F.C.',
        score1: 110,
        score2: 82,
        winner: 'Jaume Creixell U.E.'
      }
    },
    edition2: {
      // Vuitens de final (Round of 16)
      round16: {
        left: [
          { id: 'r16-1', team1: 'TBD', team2: 'TBD', winner: null },
          { id: 'r16-2', team1: 'TBD', team2: 'TBD', winner: null },
          { id: 'r16-3', team1: 'TBD', team2: 'TBD', winner: null },
        ],
        right: [
          { id: 'r16-4', team1: 'TBD', team2: 'TBD', winner: null },
          { id: 'r16-5', team1: 'TBD', team2: 'TBD', winner: null },
          { id: 'r16-6', team1: 'TBD', team2: 'TBD', winner: null },
        ],
        exempt: ['TBD', 'TBD']
      },
      quarters: {
        left: [
          { id: 'qf-1', team1: 'TBD', team2: 'TBD', winner: null },
          { id: 'qf-2', team1: 'TBD', team2: 'TBD', winner: null },
        ],
        right: [
          { id: 'qf-3', team1: 'TBD', team2: 'TBD', winner: null },
          { id: 'qf-4', team1: 'TBD', team2: 'TBD', winner: null },
        ]
      },
      semis: {
        left: { id: 'sf-1', team1: 'TBD', team2: 'TBD', winner: null },
        right: { id: 'sf-2', team1: 'TBD', team2: 'TBD', winner: null }
      },
      final: {
        id: 'final',
        team1: 'TBD',
        team2: 'TBD',
        winner: null
      }
    }
  });

  // Carregar bracket de l'edició 2 des de l'API (només una vegada)
  useEffect(() => {
    const fetchBracket = async () => {
      // Només carregar si estem a edition2 i encara no s'ha carregat abans
      if (activeEdition === 'edition2' && !fetchedEditions.current.has('edition2')) {
        console.log('[Copa] Carregant bracket Edition 2 des de l\'API...');
        setLoading(true);
        fetchedEditions.current.add('edition2'); // Marcar com a carregant ABANS de fer la petició

        try {
          const bracketData = await copa.getBracket('edition2');
          console.log('[Copa] Bracket carregat:', bracketData);
          if (bracketData) {
            setBrackets(prev => ({ ...prev, edition2: bracketData }));
          }
        } catch (error) {
          console.error('[Copa] Error carregant bracket:', error);
          fetchedEditions.current.delete('edition2'); // Si falla, permetre reintent
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBracket();
  }, [activeEdition]);

  const bracket = brackets[activeEdition];

  // Funció per determinar si un equip és guanyador
  const getTeamClass = (teamName, winner) => {
    if (!winner) return '';
    return teamName === winner ? 'winner' : 'loser';
  };

  return (
    <div className="copa-del-rei-page">
      <h1>Copa del Rei Fantasy</h1>
      <p className="page-description">
        Torneig eliminatori entre els 14 clubs del fantasy
      </p>

      {/* Tabs per a les edicions */}
      <div className="editions-tabs">
        <button
          onClick={() => setActiveEdition('edition1')}
          className={`edition-tab ${activeEdition === 'edition1' ? 'active' : ''}`}
        >
          Edició 1
        </button>
        <button
          onClick={() => setActiveEdition('edition2')}
          className={`edition-tab ${activeEdition === 'edition2' ? 'active' : ''}`}
        >
          Edició 2
        </button>
      </div>

      <div className="bracket-container">
        {/* Bracket esquerra */}
        <div className="bracket-side bracket-left">
          {/* Vuitens esquerra */}
          <div className="round round-16">
            <div className="round-title">Vuitens</div>
            {bracket.round16.left.map((match, index) => (
              <div key={match.id || `r16-left-${index}`} className="match-box">
                <div className={`team ${getTeamClass(match.team1, match.winner)}`}>
                  <span className="team-name">{match.team1}</span>
                  <span className="team-score">{match.score1 ?? '-'}</span>
                </div>
                <div className={`team ${getTeamClass(match.team2, match.winner)}`}>
                  <span className="team-name">{match.team2}</span>
                  <span className="team-score">{match.score2 ?? '-'}</span>
                </div>
              </div>
            ))}
            {/* Equip exempt 1 */}
            <div className="match-box exempt">
              <div className="team exempt-team">{bracket.round16.exempt[0]}</div>
              <div className="exempt-label">Exempt</div>
            </div>
          </div>

          {/* Quarts esquerra */}
          <div className="round round-quarters">
            <div className="round-title">Quarts</div>
            {bracket.quarters.left.map((match, index) => (
              <div key={match.id || `q-left-${index}`} className="match-box">
                <div className={`team ${getTeamClass(match.team1, match.winner)}`}>
                  <span className="team-name">{match.team1}</span>
                  <span className="team-score">{match.score1 ?? '-'}</span>
                </div>
                <div className={`team ${getTeamClass(match.team2, match.winner)}`}>
                  <span className="team-name">{match.team2}</span>
                  <span className="team-score">{match.score2 ?? '-'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Semifinal esquerra */}
          <div className="round round-semis">
            <div className="round-title">Semifinal</div>
            <div className="match-box">
              <div className={`team ${getTeamClass(bracket.semis.left.team1, bracket.semis.left.winner)}`}>
                <span className="team-name">{bracket.semis.left.team1}</span>
                <span className="team-score">{bracket.semis.left.score1 ?? '-'}</span>
              </div>
              <div className={`team ${getTeamClass(bracket.semis.left.team2, bracket.semis.left.winner)}`}>
                <span className="team-name">{bracket.semis.left.team2}</span>
                <span className="team-score">{bracket.semis.left.score2 ?? '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Centre - Final */}
        <div className="bracket-center">
          <div className="round round-final">
            <div className="round-title">Final</div>
            <div className="match-box final-box">
              <div className={`team ${getTeamClass(bracket.final.team1, bracket.final.winner)}`}>
                <span className="team-name">{bracket.final.team1}</span>
                <span className="team-score">{bracket.final.score1 ?? '-'}</span>
              </div>
              <div className={`team ${getTeamClass(bracket.final.team2, bracket.final.winner)}`}>
                <span className="team-name">{bracket.final.team2}</span>
                <span className="team-score">{bracket.final.score2 ?? '-'}</span>
              </div>
            </div>
            <div className="trophy">🏆</div>
            {bracket.final.winner && (
              <div className="champion-name">
                🏆 {bracket.final.winner}
              </div>
            )}
          </div>
        </div>

        {/* Bracket dreta */}
        <div className="bracket-side bracket-right">
          {/* Vuitens dreta */}
          <div className="round round-16">
            <div className="round-title">Vuitens</div>
            {bracket.round16.right.map((match, index) => (
              <div key={match.id || `r16-right-${index}`} className="match-box">
                <div className={`team ${getTeamClass(match.team1, match.winner)}`}>
                  <span className="team-name">{match.team1}</span>
                  <span className="team-score">{match.score1 ?? '-'}</span>
                </div>
                <div className={`team ${getTeamClass(match.team2, match.winner)}`}>
                  <span className="team-name">{match.team2}</span>
                  <span className="team-score">{match.score2 ?? '-'}</span>
                </div>
              </div>
            ))}
            {/* Equip exempt 2 */}
            <div className="match-box exempt">
              <div className="team exempt-team">{bracket.round16.exempt[1]}</div>
              <div className="exempt-label">Exempt</div>
            </div>
          </div>

          {/* Quarts dreta */}
          <div className="round round-quarters">
            <div className="round-title">Quarts</div>
            {bracket.quarters.right.map((match, index) => (
              <div key={match.id || `q-right-${index}`} className="match-box">
                <div className={`team ${getTeamClass(match.team1, match.winner)}`}>
                  <span className="team-name">{match.team1}</span>
                  <span className="team-score">{match.score1 ?? '-'}</span>
                </div>
                <div className={`team ${getTeamClass(match.team2, match.winner)}`}>
                  <span className="team-name">{match.team2}</span>
                  <span className="team-score">{match.score2 ?? '-'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Semifinal dreta */}
          <div className="round round-semis">
            <div className="round-title">Semifinal</div>
            <div className="match-box">
              <div className={`team ${getTeamClass(bracket.semis.right.team1, bracket.semis.right.winner)}`}>
                <span className="team-name">{bracket.semis.right.team1}</span>
                <span className="team-score">{bracket.semis.right.score1 ?? '-'}</span>
              </div>
              <div className={`team ${getTeamClass(bracket.semis.right.team2, bracket.semis.right.winner)}`}>
                <span className="team-name">{bracket.semis.right.team2}</span>
                <span className="team-score">{bracket.semis.right.score2 ?? '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="legend">
        <h3>Informació</h3>
        <ul>
          <li>14 clubs participen en la Copa del Rei Fantasy</li>
          <li>2 clubs passen directament a quarts de final (exempts de vuitens)</li>
          <li>Format eliminatori: el perdedor queda eliminat</li>
          <li>Els emparellaments i resultats els gestiona l'administrador</li>
        </ul>
      </div>
    </div>
  );
}

export default CopaDelRei;
