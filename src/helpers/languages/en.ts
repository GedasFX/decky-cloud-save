export const dictionary = {
    "sync": "Sync",
    "sync.now": "Sync Now",
    "provider.not.configured": "Cloud Storage Provider is not configured. Please configure it in 'Cloud Provider'",
    "sync.start.stop": "Sync on game start & stop",
    "toast.auto.sync": "Toast after auto sync",
    "configuration": "Configuration",
    "sync.paths": "Sync Paths",
    "cloud.provider": "Cloud Provider",
    "experimental.use.risk": "Experimental USE AT OWN RISK",
    "bidirectional.sync": "Bidirectional Sync",
    "you.mad": "Are you mad??",
    "warning.root": "For your own safety, ability to sync the whole file system is disabled",
    "confirm.add": "Confirm Add",
    "path": "Path",
    "matches": "matches",
    "files.proceed": "file(s). Proceed?",
    "select.path": "Select Path to Sync",
    "file": "File",
    "folder": "Folder",
    "folder.exclude": "Folder (exclude subfolders)",
    "add.to.sync": "Add Path to Sync",
    "exclude.from.sync": "Exclude Path from Sync",
    "confirm.remove": "Confirm Remove",
    "removing.path": "Removing Path",
    "proceed": "Proceed?",
    "includes.vs.exclude": "Includes vs Excludes",
    "help.exclude": "As of v1.2.0, it is possible to exclude certain folders from sync.\n\nDuring sync, the plugin first looks at the excludes list to see if a file (or folder) is not excluded, and only then it checks for files in the included list.\n\nFor example, if folder /a/** is included, but file /a/b is excluded, all files except for b would be backed up.",
    "include.or.exclude.subf": "Include or exclude subfolders",
    "help.include.or.exclude.subf": "There may be cases where it is necessary to only back up a folder without recursively digging deeper into subfolders. For those cases you can use option 'Folder (exclude subfolders)'.\n\nSuch cases are quite niche; in general the 'Folder' option should be used instead.",
    "bug.file.picker": "Bug: File Picker loads indefinitely",
    "help.file.picker.fail": "After a fresh install, the file picker sometimes fails to load. Restarting Steam fixes this.\nSee more details for the discussion",
    "cloud.save.path": "Cloud Save Path",
    "configure.provider": "Configure Cloud Storage Provider",
    "currently.using": "Currently using",
    "click.providers": "Click one of the providers below to configure the backup destination.",
    "other.providers": "Adding other providers",
    "manually.desktop": "In addition to the 2 providers listed above, others can also be configured. Unfortunately, setup for them can only be done in desktop mode.\n\nSome providers (such as Google Drive) will have install scripts ready for your convenience. For those, simply run the install script found in the plugin install directory (default: /home/deck/homebrew/plugins/decky-cloud-save/quickstart/).\n\nFor all other providers read instructions found in the README.md.",
    "other.advanced": "Other (Advanced)",
    "includes": "Includes",
    "excludes": "Excludes",
    "waiting.previous": "Waiting for previous sync",
    "synchronizing.savedata": "Synchronizing savedata",
    "sync.failed": "Sync failed. Run journalctl -u plugin_loader.service to see the errors.",
    "sync.completed": "Sync completed in"
}