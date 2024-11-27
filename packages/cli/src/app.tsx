import React from 'react';
import { useSelector } from 'react-redux';

import MainMenu from './main-menu/main-menu.js';
import { RootState } from './store/store.js';

export default function App() {
  const page = useSelector<RootState>((state) => state.page.value);

  return <>{page === 'main-menu' && <MainMenu></MainMenu>}</>;
}
