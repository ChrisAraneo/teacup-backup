#!/usr/bin/env node
import { render } from 'ink';
import meow from 'meow';
import React from 'react';

import App from './app.js';
import { MenuItem } from './interfaces/menu-item.js';

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
  children: [
    {
      name: 'Backup files',
      children: [
        {
          name: 'Test1',
          onSelect: () => {
            console.log('Test 1');
          },
        },
        {
          name: 'Test2',
        },
      ],
    },
    {
      name: 'Restore files',
    },
  ],
} as const;

render(<App root={root} />);

// TODO Test
console.log(cli.flags.name);