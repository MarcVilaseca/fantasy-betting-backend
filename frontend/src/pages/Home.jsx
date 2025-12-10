import { useState, useEffect } from 'react';
import { matches as matchesApi, bets as betsApi } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import MatchCard from '../components/MatchCard';
import BetSlip from '../components/BetSlip';

function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBets, setSelectedBets] = useState([]);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesApi.getOpen();
      setMatches(response || []);
      setError('');
    } catch (err) {
      setError('Error en carregar els partits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBet = (bet) => {
    // Verificar si ja està seleccionada aquesta aposta exacta
    const existingIndex = selectedBets.findIndex(
      b => b.match_id === bet.match_id && b.bet_type === bet.bet_type && b.selection === bet.selection
    );

    if (existingIndex >= 0) {
      // Deseleccionar
      setSelectedBets(selectedBets.filter((_, i) => i !== existingIndex));
    } else {
      // Si ja hi ha una aposta d'aquest partit i tipus, reemplaçar-la
      const matchTypeExists = selectedBets.findIndex(
        b => b.match_id === bet.match_id && b.bet_type === bet.bet_type
      );

      if (matchTypeExists >= 0) {
        const newBets = [...selectedBets];
        newBets[matchTypeExists] = bet;
        setSelectedBets(newBets);
      } else {
        // Afegir nova aposta (màxim 4 per combinada)
        if (selectedBets.length < 4) {
          setSelectedBets([...selectedBets, bet]);
        } else {
          alert('Màxim 4 apostes en una combinada');
        }
      }
    }
  };

  const handlePlaceBet = async (amount, isParlay) => {
    try {
      if (isParlay && selectedBets.length < 2) {
        alert('Una combinada necessita mínim 2 apostes');
        return;
      }

      if (amount > user.coins) {
        alert('No tens prou monedes');
        return;
      }

      if (isParlay) {
        const response = await betsApi.createParlay({
          bets: selectedBets,
          amount
        });
        updateUser({ coins: response.data.newBalance });
        alert(`Aposta combinada creada! Retorn potencial: ${response.data.potential_return.toFixed(2)} monedes`);
      } else {
        if (selectedBets.length !== 1) {
          alert('Selecciona una sola aposta per aposta simple');
          return;
        }
        const bet = selectedBets[0];
        const response = await betsApi.create({
          ...bet,
          amount
        });
        updateUser({ coins: response.data.newBalance });
        alert(`Aposta creada! Retorn potencial: ${response.data.bet.potential_return.toFixed(2)} monedes`);
      }

      setSelectedBets([]);
      loadMatches();
    } catch (err) {
      alert(err.response?.data?.error || 'Error en crear aposta');
      console.error(err);
    }
  };

  const clearBets = () => {
    setSelectedBets([]);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="card">
        <div className="card-header">Apostes disponibles</div>
        <p style={{ color: 'var(--text-secondary)' }}>
          No hi ha partits disponibles per apostar en aquest moment.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">Apostes disponibles</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Apostes obertes fins divendres 20:59. Resolució dimarts nit.
          </p>
        </div>

        {matches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            onSelectBet={handleSelectBet}
            selectedBets={selectedBets}
          />
        ))}
      </div>

      <div style={{ position: 'sticky', top: '1rem', height: 'fit-content' }}>
        <BetSlip
          selectedBets={selectedBets}
          onPlaceBet={handlePlaceBet}
          onClear={clearBets}
          userCoins={user.coins}
        />
      </div>
    </div>
  );
}

export default Home;
