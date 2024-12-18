import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Action from '../../shared/components/action.js';
import Breadcrumbs from '../../shared/components/breadcrumbs.js';
import Input from '../../shared/components/input.js';
import Title from '../../shared/components/title.js';
import { addFile, updateFile } from '../../store/config.slice.js';
import { moveDown, moveUp, reset, setLast } from '../../store/cursor.slice.js';
import { setPage } from '../../store/page.slice.js';
import { RootState } from '../../store/store.js';

export default function EditFiles() {
  const files = useSelector<RootState>(
    (state) => state.config.files,
  ) as string[];

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
        items={['Main menu', 'Backup', 'Edit files to backup']}></Breadcrumbs>
      {files.length ? (
        <Box flexDirection='column' rowGap={0}>
          {files.map((file: string, index: number) => {
            return (
              <Text key={index}>
                <Text color={'gray'}>{'• '}</Text>
                <Input
                  index={index}
                  value={file}
                  onChange={(file) => {
                    dispatch(updateFile({ index, file }));
                  }}></Input>
              </Text>
            );
          })}
        </Box>
      ) : (
        <></>
      )}
      <Box flexDirection='column'>
        <Action
          index={files.length}
          onSelect={() => {
            dispatch(addFile(''));
            dispatch(setLast(files.length + 2));
          }}>
          + Add file
        </Action>
        <Action
          index={files.length + 1}
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
