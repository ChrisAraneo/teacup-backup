# Teacup Backup (v0.5.0)

![Teacup backup logo](logo.png?raw=true)

# Introduction

I needed a simple utility script to search for files and then make copies of those files.

Teacup Backup works in two modes: "backup" and "restore". In the case of backup mode the script searches for files with given name and then encrypts found files and saves them to selected directory. In restore mode the script decrypts all previously saved files.

Teacup Backup also has the functionality of uploading files to an FTP server.

To run Teacup Backup you need software listed in section *Technologies*. Then you can modify the configuration file as needed (`src/config.json`) and run the command:

```bash
/teacup-backup$ npm run start
```

More details below.

# Configuration file

Before running the application fill the values in the `src/config.json` configuration file according to your needs (this file will be then also copied into `dist/config.json`).

### Example `config.json`

```json
{
  "backupDirectory": "./backups",
  "files": ["index.ts"],
  "interval": 3600,
  "log-level": "debug",
  "mode": "backup",
  "roots": ["C:\\"]
}
```

If you would like to send the backup to an FTP server, you can provide credentials and path to backup directory, for example:

```json
{
  "backupDirectory": "./backups",
  "files": ["index.ts"],
  "ftp": {
    "directory": "backups/teacup-backup",
    "enabled": true,
    "host": "192.168.50.1",
    "password": "Qwerty123/",
    "user": "user"
  },
  "interval": 3600,
  "log-level": "debug",
  "mode": "backup",
  "roots": ["D:\\"]
}
```

### Configuration parameters explained

- `mode` - either `"backup"` or `"restore"`
- `backupDirectory` - (relative) directory for storing backup files, recommended `"./backups"`
- `interval` - time interval in seconds, how often backups are to be performed, for example `3600`
- `roots` - root directories where to search for files to back up
- `files` - array of files to find and backup; each element of array should be a filename or regex to file
- `log-level` - level of detail of displayed logs (severity of errors); recommended `"info"`
- `ftp` - contains object with credentials to the FTP server and the name of the directory:
    - `directory` - path to backup directory on FTP
    - `enabled` - `true` to enable sending to FTP, `false` otherwise
    - `host` - IP to the FTP server
    - `user` - username
    - `password` - password

# Creating backup

Once you have filled the `config.json`, you can install the required dependencies and then run the script.

Install dependencies:
```bash
/teacup-backup$ npm install
```

Run the script:
```bash
/teacup-backup$ npm run start
```

# Restoring files

If `"restore"` mode is set in the configuration file, then all encrypted files in the `"backupDirectory"` directory will be decrypted and restored.

Run the script:
```bash
/teacup-backup$ npm run start
```

# Technologies

Developing and running the script requires following technologies:

- [Node.js](https://nodejs.org/en) (recommended v18.16.0) - used for running & building the project
- [TypeScript](https://www.typescriptlang.org/) - used as a development tool, it is not required to download any compilers besides project dependencies.

# License

Project is [MIT licensed](LICENSE).