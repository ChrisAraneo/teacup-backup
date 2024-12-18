import { Box, useInput } from 'ink';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Action from '../shared/components/action.js';
import Breadcrumbs from '../shared/components/breadcrumbs.js';
import Hint from '../shared/components/hint.js';
import Title from '../shared/components/title.js';
import { moveDown, moveUp, reset, setLast } from '../store/cursor.slice.js';
import { setPage } from '../store/page.slice.js';

export default function MainMenu() {
  const dispatch = useDispatch();

  useInput((_, key) => {
    if (key.upArrow) {
      dispatch(moveUp());
    } else if (key.downArrow) {
      dispatch(moveDown());
    }
  });

  useEffect(() => {
    dispatch(setLast(2));
  });

  return (
    <Box
      borderStyle={'single'}
      borderColor={'gray'}
      padding={1}
      flexDirection='column'
      rowGap={1}
      width={80}
      minHeight={30}>
      <Title></Title>
      <Breadcrumbs items={['Main menu']}></Breadcrumbs>
      <Hint></Hint>
      <Box flexDirection='column'>
        <Action
          index={0}
          onSelect={() => {
            dispatch(setPage('backup'));
            dispatch(reset());
          }}>
          Backup files
        </Action>
        <Action
          index={1}
          onSelect={() => {
            console.log('TODO');
          }}>
          Restore files
        </Action>
        <Action
          index={2}
          onSelect={() => {
            process.exit(0);
          }}>
          Exit
        </Action>
      </Box>
    </Box>
  );
}
