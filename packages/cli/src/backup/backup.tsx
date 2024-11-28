import { Box, useInput } from 'ink';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Action from '../shared/components/action.js';
import Breadcrumbs from '../shared/components/breadcrumbs.js';
import Title from '../shared/components/title.js';
import { moveDown, moveUp, setLast } from '../store/cursor.slice.js';
import { setPage } from '../store/page.slice.js';

export default function Backup() {
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
      <Breadcrumbs items={['Main menu', 'Backup']}></Breadcrumbs>
      <Box flexDirection='column'>
        <Action
          index={0}
          onSelect={() => {
            console.log('TODO');
          }}>
          Test 1
        </Action>
        <Action
          index={1}
          onSelect={() => {
            console.log('TODO');
          }}>
          Test 2
        </Action>
        <Action
          index={2}
          onSelect={() => {
            dispatch(setPage('main-menu'));
          }}>
          Back
        </Action>
      </Box>
    </Box>
  );
}
