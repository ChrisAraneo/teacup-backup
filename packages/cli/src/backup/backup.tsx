import { Box, Text, useInput } from 'ink';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Action from '../shared/components/action.js';
import Breadcrumbs from '../shared/components/breadcrumbs.js';
import CheckBox from '../shared/components/checkbox.js';
import NumberInput from '../shared/components/number-input.js';
import Title from '../shared/components/title.js';
import { setInterval } from '../store/config.slice.js';
import { moveDown, moveUp, reset, setLast } from '../store/cursor.slice.js';
import { setPage } from '../store/page.slice.js';
import { RootState } from '../store/store.js';

export default function Backup() {
  const cursor = useSelector<RootState>(
    (state) => state.cursor.value,
  ) as number;
  const files = useSelector<RootState>(
    (state) => state.config.files,
  ) as string[];
  const roots = useSelector<RootState>(
    (state) => state.config.roots,
  ) as string[];
  const ftpEnabled = useSelector<RootState>(
    (state) => state.config.ftp?.enabled,
  ) as boolean;
  const interval = useSelector<RootState>(
    (state) => state.config.interval,
  ) as number;

  const dispatch = useDispatch();

  useInput((_, key) => {
    if (key.upArrow) {
      dispatch(moveUp());
    } else if (key.downArrow) {
      dispatch(moveDown());
    }
  });

  useEffect(() => {
    dispatch(setLast(8));
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
      <Box flexDirection='column' rowGap={0}>
        <Text color={'grey'}>
          {'Files to backup: '}
          <Action
            index={0}
            onSelect={() => {
              dispatch(setPage('backup/edit-files'));
              reset();
            }}>
            {files.length
              ? files.join(', ')
              : cursor === 0
                ? 'Enter to add files'
                : ''}
          </Action>
        </Text>
        <Text color={'grey'}>
          {'Discs to search: '}
          <Action
            index={1}
            onSelect={() => {
              dispatch(setPage('backup/edit-roots'));
              reset();
            }}>
            {roots.length
              ? roots.join(', ')
              : cursor === 1
                ? 'Enter to add discs'
                : ''}
          </Action>
        </Text>
        <Text color={'grey'}>
          Backup directory:{' '}
          <Action
            index={2}
            onSelect={() => {
              console.log('TODO');
            }}>
            Test 1
          </Action>
        </Text>
        <Text color={'grey'}>
          FTP upload:{' '}
          <CheckBox
            index={3}
            value={ftpEnabled}
            onChange={(v) => {
              console.log(v);
            }}></CheckBox>
        </Text>
        <Text color={'grey'}>
          Interval:{' '}
          <NumberInput
            index={4}
            value={interval}
            onChange={(value) => {
              dispatch(setInterval(value));
            }}></NumberInput>
        </Text>
        <Text color={'grey'}>
          Log level:{' '}
          <Action
            index={5}
            onSelect={() => {
              console.log('TODO');
            }}>
            Test 1
          </Action>
        </Text>
      </Box>
      <Box flexDirection='column'>
        <Action
          index={6}
          onSelect={() => {
            console.log('TODO');
          }}>
          Test 1
        </Action>
        <Action
          index={7}
          onSelect={() => {
            console.log('TODO');
          }}>
          Test 2
        </Action>
        <Action
          index={8}
          onSelect={() => {
            dispatch(setPage('main-menu'));
            dispatch(reset());
          }}>
          Back
        </Action>
      </Box>
    </Box>
  );
}
