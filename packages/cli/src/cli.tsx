#!/usr/bin/env node
import { render } from 'ink';
import meow from 'meow';
import React from 'react';
import { Provider } from 'react-redux';

import App from './app.js';
import { MenuItem } from './interfaces/menu-item.js';
import store from './store/store.js';

const cli = meow(
  `
	Usage
	  $ node-ink-typescript-starter

	Options
		--name  Your name

	Examples
	  $ node-ink-typescript-starter --name=Jane
	  Hello, Jane
`,
  {
    importMeta: import.meta,
    flags: {
      name: {
        type: 'string',
      },
    },
  },
);

const root: MenuItem = {
  name: 'Main menu',
  description:
    'Do you want to create a new backup or restore files from previously created backup?',
  children: [
    {
      name: 'Backup files',
      description:
        'It is recommended to set up the desired configuration first and then start the process of searching for files and creating a backup.',
      children: [
        {
          name: 'Change configuration',
          description: '',
          onSelect: () => {
            console.log('Test 1');
          },
        },
        {
          name: 'Start backup process',
          description: '',
        },
      ],
    },
    {
      name: 'Restore files',
      description: '',
    },
  ],
} as const;

render(
  <Provider store={store}>
    <App root={root} />
  </Provider>,
);

// TODO Test
console.log(cli.flags.name);
