import React from 'react';
import { useSelector } from 'react-redux';

import Backup from './backup/backup.js';
import EditFiles from './backup/edit-files/edit-files.js';
import EditRoots from './backup/edit-roots/edit-roots.js';
import SelectLogLevel from './backup/select-log-level/select-log-level.js';
import MainMenu from './main-menu/main-menu.js';
import { RootState } from './store/store.js';

export default function App() {
  const page = useSelector<RootState>((state) => state.page.value);

  return (
    <>
      {page === 'main-menu' && <MainMenu></MainMenu>}
      {page === 'backup' && <Backup></Backup>}
      {page === 'backup/edit-files' && <EditFiles></EditFiles>}
      {page === 'backup/edit-roots' && <EditRoots></EditRoots>}
      {page === 'backup/select-log-level' && <SelectLogLevel></SelectLogLevel>}
    </>
  );
}
