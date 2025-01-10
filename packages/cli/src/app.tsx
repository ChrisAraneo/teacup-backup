import React from 'react';
import { useSelector } from 'react-redux';

import EditFiles from './backup/edit-files/edit-files.js';
import EditRoots from './backup/edit-roots/edit-roots.js';
import SelectLogLevel from './backup/select-log-level/select-log-level.js';
import MainMenu from './main-menu/main-menu.js';
import { RootState } from './store/store.js';

export default function App() {
  const page = useSelector<RootState>((state) => state.page.value);

  switch (page) {
    case 'main-menu': {
      return <MainMenu></MainMenu>;
    }
    case 'backup': {
      return <MainMenu></MainMenu>;
    }
    case 'backup/edit-files': {
      return <EditFiles></EditFiles>;
    }
    case 'backup/edit-roots': {
      return <EditRoots></EditRoots>;
    }
    case 'backup/select-log-level': {
      return <SelectLogLevel></SelectLogLevel>;
    }
    default: {
      return <></>;
    }
  }
}
