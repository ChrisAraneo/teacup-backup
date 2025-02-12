import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Backup from './backup/backup.js';
import BackupProgress from './backup/backup-progress/backup-progress.js';
import EditFiles from './backup/edit-files/edit-files.js';
import EditRoots from './backup/edit-roots/edit-roots.js';
import SelectLogLevel from './backup/select-log-level/select-log-level.js';
import MainMenu from './main-menu/main-menu.js';
import { readConfig } from './store/config.slice.js';
import { RootState } from './store/store.js';

export default function App() {
  const page = useSelector<RootState>((state) => state.page.value);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(readConfig());
  });

  switch (page) {
    case 'main-menu': {
      return <MainMenu></MainMenu>;
    }
    case 'backup': {
      return <Backup></Backup>;
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
    case 'backup/progress': {
      return <BackupProgress></BackupProgress>;
    }
    default: {
      return <></>;
    }
  }
}
