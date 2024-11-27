#!/usr/bin/env node
import { render } from 'ink';
import meow from 'meow';
import React from 'react';
import { Provider } from 'react-redux';

import App from './app.js';
import store from './store/store.js';

const cli = meow(
  `
	Usage
	  $ teacup-backup

	Options
		--name  Your name

	Examples
	  $ teacup-backup --name=Jane
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

render(
  <Provider store={store}>
    <App />
  </Provider>,
);

// TODO Test
console.log(cli.flags.name);
