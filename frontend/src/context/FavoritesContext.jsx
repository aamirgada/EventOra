import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoritesList, setFavoritesList] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavoriteIds(new Set());
      setFavoritesList([]);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites/');
      const list = res.data.results || res.data;
      setFavoritesList(list);
      setFavoriteIds(new Set(list.map((f) => f.event?.id || f.event_id)));
    } catch {
      // offline fallback
    }
  };

  const toggleFavorite = async (event) => {
    const eventId = event?.id || event;
    const isFav = favoriteIds.has(eventId);

    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });

    try {
      const res = await api.post(`/favorites/toggle/${eventId}/`);
      if (res.data.favorited) {
        toast.success(`Saved "${event.title || 'Event'}" to your favorites!`);
      } else {
        toast('Removed from saved events', { icon: '🗑️' });
      }
      fetchFavorites();
    } catch {
      // Revert if error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(eventId);
        else next.delete(eventId);
        return next;
      });
      toast.error('Unable to update favorite. Please check your connection.');
    }
  };

  const isFavorited = (eventId) => favoriteIds.has(eventId);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoritesList,
        favoritesCount: favoriteIds.size,
        toggleFavorite,
        isFavorited,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
