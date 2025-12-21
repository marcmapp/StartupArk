import React from 'react';
import StartupList from '../users/startups/startup-list/StartupList';

const FavoritesPage = () => {
  return (
    <div className="flex-1">
      <StartupList showOnlyFavorites={true} />
    </div>
  );
};

export default FavoritesPage;