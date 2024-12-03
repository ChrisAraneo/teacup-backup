import React from 'react';
import { useSelector } from 'react-redux';

import Backup from './backup/backup.js';
import MainMenu from './main-menu/main-menu.js';
import { RootState } from './store/store.js';

export default function App() {
  const page = useSelector<RootState>((state) => state.page.value);

  return (
    <>
      {page === 'main-menu' && <MainMenu></MainMenu>}
      {page === 'backup' && <Backup></Backup>}
    </>
  );
}
