import React, { useState } from 'react';

import MainMenu from './main-menu/main-menu.js';

export default function App() {
  const [page] = useState<string>('main-menu');

  return <>{page === 'main-menu' && <MainMenu></MainMenu>}</>;
}
