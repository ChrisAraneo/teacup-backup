/* eslint-disable no-undef */

import { rename } from 'fs';
import { normalize } from 'path';

const oldName = normalize('./dist/cli.js');
const newName = normalize('./dist/cli.prod.js');

rename(oldName, newName, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`\n${oldName} was renamed to ${newName}\n`);
  }
});
