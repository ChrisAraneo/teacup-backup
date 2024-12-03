import { Box, Text, useInput } from 'ink';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Action from '../shared/components/action.js';
import Breadcrumbs from '../shared/components/breadcrumbs.js';
import Title from '../shared/components/title.js';
import { moveDown, moveUp, reset, setLast } from '../store/cursor.slice.js';
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
    dispatch(setLast(8));
    dispatch(reset());
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
      <Text color={'white'}>Configuration</Text>
      <Box flexDirection='column' rowGap={0}>
        <Text color={'grey'}>
          Files to backup:{' '}
          <Action
            index={0}
            onSelect={() => {
              console.log('TODO');
            }}>
            Test 1
          </Action>
        </Text>
        <Text color={'grey'}>
          Discs to search:{' '}
          <Action
            index={1}
            onSelect={() => {
              console.log('TODO');
            }}>
            Test 1
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
          <Action
            index={3}
            onSelect={() => {
              console.log('TODO');
            }}>
            Test 1
          </Action>
        </Text>
        <Text color={'grey'}>
          Interval:{' '}
          <Action
            index={4}
            onSelect={() => {
              console.log('TODO');
            }}>
            Test 1
          </Action>
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
          }}>
          Back
        </Action>
      </Box>
    </Box>
  );
}
