:: Run on startup on Windows
::
:: 1) Build app (have dist directory)
:: 2) Update config.json
:: 3) Create shortcut to this bat file
:: 4) Place shortcut in startup directory
:: %AppData%\Microsoft\Windows\Start Menu\Programs\Startup
:: or %ProgramData%\Microsoft\Windows\Start Menu\Programs\Startup for all users
:: 5) Done
::
node ..\dist\teacup-backup.js