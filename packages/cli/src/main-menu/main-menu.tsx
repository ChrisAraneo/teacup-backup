import { Box, Text, useInput } from 'ink';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Action from '../shared/action.js';
import Breadcrumbs from '../shared/breadcrumbs.js';
import Hint from '../shared/hint.js';
import { moveDown, moveUp, setMax } from '../store/cursor.slice.js';

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
    dispatch(setMax(3));
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
      <Text>
        🍵 Teacup Backup <Text color='gray'>(v0.5.3)</Text>
      </Text>
      <Hint></Hint>
      <Breadcrumbs items={['Main menu']}></Breadcrumbs>
      <Box flexDirection='column'>
        <Action index={0}>Test 0</Action>
        <Action index={1}>Test 1</Action>
        <Action index={2}>Test 2</Action>
        <Action index={3}>Test 3</Action>
      </Box>
    </Box>
  );
}
