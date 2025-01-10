import { LogLevel } from '@teacup-backup/core';
import { Box, Text, useInput } from 'ink';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Action from '../../shared/components/action.js';
import Breadcrumbs from '../../shared/components/breadcrumbs.js';
import CheckBox from '../../shared/components/checkbox.js';
import Title from '../../shared/components/title.js';
import { capitalize } from '../../shared/functions/capitalize.js';
import { setLogLevel } from '../../store/config.slice.js';
import { moveDown, moveUp, reset, setLast } from '../../store/cursor.slice.js';
import { setPage } from '../../store/page.slice.js';
import { RootState } from '../../store/store.js';

export default function SelectLogLevel() {
  const logLevel = useSelector<RootState>(
    (state) => state.config['log-level'],
  ) as LogLevel;

  const dispatch = useDispatch();

  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

  useInput((_, key) => {
    if (key.upArrow) {
      dispatch(moveUp());
    } else if (key.downArrow) {
      dispatch(moveDown());
    }
  });

  useEffect(() => {
    dispatch(setLast(levels.length));
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
        items={['Main menu', 'Backup', 'Select log level']}></Breadcrumbs>
      <Box flexDirection='column' rowGap={0}>
        {levels.map((value, index) => (
          <Text key={value}>
            {`${capitalize(value)}: `}
            <CheckBox
              index={index}
              value={logLevel === value}
              onChange={() => {
                dispatch(setLogLevel(value));
              }}></CheckBox>
          </Text>
        ))}
      </Box>
      <Box flexDirection='column'>
        <Action
          index={levels.length}
          onSelect={() => {
            dispatch(setPage('backup'));
            dispatch(reset());
          }}>
          Back
        </Action>
      </Box>
    </Box>
  );
}
