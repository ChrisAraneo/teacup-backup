import { FtpConfig, LogLevel } from '@teacup-backup/core';
import { Box, Text, useInput } from 'ink';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Action from '../shared/components/action.js';
import Breadcrumbs from '../shared/components/breadcrumbs.js';
import CheckBox from '../shared/components/checkbox.js';
import Input from '../shared/components/input.js';
import NumberInput from '../shared/components/number-input.js';
import PasswordInput from '../shared/components/password-input.js';
import Title from '../shared/components/title.js';
import { capitalize } from '../shared/functions/capitalize.js';
import { createBackup } from '../store/backup.slice.js';
import {
  setBackupDirectory,
  setFtpDirectory,
  setFtpEnabled,
  setFtpHost,
  setFtpPassword,
  setFtpUser,
  setInterval,
  setSecret,
} from '../store/config.slice.js';
import { moveDown, moveUp, reset, setLast } from '../store/cursor.slice.js';
import { setPage } from '../store/page.slice.js';
import { RootState } from '../store/store.js';

export default function Backup() {
  const cursor = useSelector<RootState>(
    (state) => state.cursor.value,
  ) as number;
  const files = useSelector<RootState>(
    (state) => state.config.data.files,
  ) as string[];
  const roots = useSelector<RootState>(
    (state) => state.config.data.roots,
  ) as string[];
  const backupDirectory = useSelector<RootState>(
    (state) => state.config.data.backupDirectory,
  ) as string;
  const ftp = useSelector<RootState>(
    (state) => state.config.data.ftp,
  ) as FtpConfig;
  const interval = useSelector<RootState>(
    (state) => state.config.data.interval,
  ) as number;
  const logLevel = useSelector<RootState>(
    (state) => state.config.data['log-level'],
  ) as LogLevel;
  const secret = useSelector<RootState>(
    (state) => state.config.data.secret,
  ) as string;

  const dispatch = useDispatch();

  useInput((_, key) => {
    if (key.upArrow) {
      dispatch(moveUp());
    } else if (key.downArrow) {
      dispatch(moveDown());
    }
  });

  useEffect(() => {
    dispatch(setLast(ftp.enabled ? 12 : 8));
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
          <Input
            index={2}
            value={backupDirectory}
            onChange={(value) => {
              dispatch(setBackupDirectory(value));
            }}></Input>
        </Text>
        <Text color={'grey'}>
          FTP upload:{' '}
          <CheckBox
            index={3}
            value={ftp.enabled}
            onChange={(enabled) => {
              dispatch(setFtpEnabled(enabled));
              dispatch(setLast(enabled ? 12 : 8));
            }}></CheckBox>
        </Text>
        {ftp.enabled ? (
          <>
            <Text color={'grey'}>
              {'  Address: '}
              <Input
                index={4}
                value={ftp.host}
                onChange={(value) => {
                  dispatch(setFtpHost(value));
                }}></Input>
            </Text>
            <Text color={'grey'}>
              {'  Username: '}
              <Input
                index={5}
                value={backupDirectory}
                onChange={(value) => {
                  dispatch(setFtpUser(value));
                }}></Input>
            </Text>
            <Text color={'grey'}>
              {'  Password: '}
              <Input
                index={6}
                value={backupDirectory}
                onChange={(value) => {
                  dispatch(setFtpPassword(value));
                }}></Input>
            </Text>
            <Text color={'grey'}>
              {'  Directory on FTP: '}
              <Input
                index={7}
                value={backupDirectory}
                onChange={(value) => {
                  dispatch(setFtpDirectory(value));
                }}></Input>
            </Text>
          </>
        ) : (
          <></>
        )}
        <Text color={'grey'}>
          Interval:{' '}
          <NumberInput
            index={ftp.enabled ? 8 : 4}
            value={interval}
            onChange={(value) => {
              dispatch(setInterval(value));
            }}></NumberInput>
        </Text>
        <Text color={'grey'}>
          Log level:{' '}
          <Action
            index={ftp.enabled ? 9 : 5}
            onSelect={() => {
              dispatch(setPage('backup/select-log-level'));
              dispatch(reset());
            }}>
            {capitalize(logLevel)}
          </Action>
        </Text>
        <Text color={'grey'}>
          Password:{' '}
          <PasswordInput
            index={ftp.enabled ? 10 : 6}
            value={secret}
            onChange={(value) => {
              dispatch(setSecret(value));
            }}></PasswordInput>
        </Text>
      </Box>
      <Box flexDirection='column'>
        <Action
          index={ftp.enabled ? 11 : 7}
          onSelect={() => {
            dispatch(createBackup());
            dispatch(setPage('backup/progress'));
          }}>
          Start
        </Action>
        <Action
          index={ftp.enabled ? 12 : 8}
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
