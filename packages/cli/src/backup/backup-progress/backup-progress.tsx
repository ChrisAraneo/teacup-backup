import { Task } from '@teacup-backup/core';
import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Breadcrumbs from '../../shared/components/breadcrumbs.js';
import Title from '../../shared/components/title.js';
import { moveDown, moveUp } from '../../store/cursor.slice.js';
import { RootState } from '../../store/store.js';

export default function BackupProgress() {
  const tasks = useSelector<RootState>((state) => state.backup.tasks) as Task[];

  const dispatch = useDispatch();

  useInput((_, key) => {
    if (key.upArrow) {
      dispatch(moveUp());
    } else if (key.downArrow) {
      dispatch(moveDown());
    }
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
      <Breadcrumbs
        items={['Main menu', 'Backup', 'Creating backup']}></Breadcrumbs>
      <Box flexDirection='column'>
        {tasks.map((task) => {
          return (
            <>
              <Text>{task.id}</Text>
              <Text>{task.message}</Text>
              <Text>{task.status}</Text>
            </>
          );
        })}
      </Box>
    </Box>
  );
}
