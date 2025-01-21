/* eslint-disable no-undef */

import { rename } from 'fs';
import { normalize } from 'path';

const oldName = normalize('./dist/prod/cli.js');
const newName = normalize('./dist/prod/teacup.js');

rename(oldName, newName, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`\n${oldName} was renamed to ${newName}\n`);
  }
});
