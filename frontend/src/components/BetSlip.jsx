import { useState } from 'react';

function BetSlip({ selectedBets, onPlaceBet, onClear, userCoins }) {
  const [amount, setAmount] = useState('');

  const getTotalOdds = () => {
    if (selectedBets.length === 0) return 0;
    return selectedBets.reduce((acc, bet) => acc * bet.odds, 1);
  };

  const getPotentialReturn = () => {
    if (!amount || selectedBets.length === 0) return 0;
    return parseFloat(amount) * getTotalOdds();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const betAmount = parseFloat(amount);

    if (!betAmount || betAmount <= 0) {
      alert('Introdueix una quantitat vÃ lida');
      return;
    }

    if (betAmount > userCoins) {
      alert('No tens prou monedes');
      return;
    }

    const isParlay = selectedBets.length > 1;
    onPlaceBet(betAmount, isParlay);
    setAmount('');
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

  const removeBet = (index) => {
    const newBets = selectedBets.filter((_, i) => i !== index);
    if (selectedBets.length > 0) {
      onClear();
      newBets.forEach(bet => {
        // Re-seleccionar les apostes que no s'han eliminat
        // AixÃ² requereix cridar onSelectBet del pare, perÃ² no tenim accÃ©s
        // Alternativa: gestionar-ho al component pare
      });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        Paper d'apostes
        {selectedBets.length > 0 && (
          <button
            onClick={onClear}
            style={{
              float: 'right',
              background: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Netejar tot
          </button>
        )}
      </div>

      {selectedBets.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
          Selecciona apostes per comenÃ§ar
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Tipus d'aposta */}
          <div style={{ marginBottom: '1rem' }}>
            {selectedBets.length === 1 ? (
              <div className="badge badge-primary">Aposta simple</div>
            ) : (
              <div className="badge badge-warning">
                Combinada ({selectedBets.length} apostes)
              </div>
            )}
          </div>

          {/* Llista d'apostes seleccionades */}
          <div style={{ marginBottom: '1rem' }}>
            {selectedBets.map((bet, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--light)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong>{bet.round}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {bet.team1} vs {bet.team2}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{formatSelection(bet)}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {bet.odds}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Cuota total */}
          <div style={{
            background: 'var(--primary)',
            color: 'var(--white)',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Cuota total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {getTotalOdds().toFixed(2)}
            </div>
          </div>

          {/* Quantitat */}
          <div className="form-group">
            <label className="form-label">Quantitat a apostar</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              max={userCoins}
              step="1"
              required
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Disponible: {userCoins.toFixed(0)} monedes
            </div>
          </div>

          {/* Retorn potencial */}
          {amount && (
            <div style={{
              background: 'var(--secondary)',
              color: 'var(--white)',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Retorn potencial</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {getPotentialReturn().toFixed(2)} monedes
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                Benefici: {(getPotentialReturn() - parseFloat(amount)).toFixed(2)}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Confirmar aposta
          </button>
        </form>
      )}
    </div>
  );
}

export default BetSlip;


