import type { Config } from '../../types/config';
import { serializeConfig } from './serialize-config';

const CONFIG: Config = {
  roots: ['D:\\'],
  files: ['notes.txt'],
  mode: 'backup',
  backupDirectory: './backup',
  interval: 3600,
  'log-level': 'info',
  ftp: { enabled: false, host: '', user: '', password: '', directory: '' },
};

describe('serializeConfig', () => {
  it('should keep the text as it is when it gets a text', () => {
    const text = serializeConfig('plain text');

    expect(text).toBe('plain text');
  });

  it('should give compact JSON when it gets a config', () => {
    const text = serializeConfig(CONFIG);

    expect(text).toBe(
      '{"roots":["D:\\\\"],"files":["notes.txt"],"mode":"backup","backupDirectory":"./backup","interval":3600,"log-level":"info","ftp":{"enabled":false,"host":"","user":"","password":"","directory":""}}',
    );
  });
});
