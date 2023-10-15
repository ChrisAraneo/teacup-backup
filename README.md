# Mini Backup

![Mini backup logo](logo.png?raw=true)

# Set the config.json file

Before running the application fill the values in the config.json configuration file according to your needs.

### Example config.json

```json
{
  "mode": "backup",
  "backupDirectory": "./backups",
  "interval": 3600,
  "roots": ["C:\\", "D:\\", "E:\\"],
  "files": [
    {
      "filename": "this-is-example-filename.txt"
    }
  ]
}
```

### Configuration parameters explained

- `mode` - either `"backup"` or `"restore"`
- `backupDirectory` - (relative) directory for storing backup files, recommended `"./backups"`
- `interval` - time interval in seconds, how often backups are to be performed, for example `3600`
- `roots` - root directories where to search for files to back up
- `files` - array of files to find and backup; each element o array should be an object with filename property

# Executing backup

Once you have filled the `config.json`, you can install the required dependencies and then run the script.

Install dependencies:
```bash
/mini-backup$ npm install
```

Run the script:
```bash
/mini-backup$ npm run start
```

# Restoring files

If `"restore"` mode is set in the configuration file, then all encrypted files in the `"backupDirectory"` directory will be decrypted and restored.

Run the script:
```bash
/mini-backup$ npm run start
```

# License

Project is [MIT licensed](LICENSE).
Project logo is [CC BY-SA 4.0 licensed to Krzysztof Pająk (Chris Araneo)](https://creativecommons.org/licenses/by-sa/4.0/).