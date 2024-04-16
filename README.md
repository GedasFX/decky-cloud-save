# Decky Cloud Save

A plugin based on [rclone](https://rclone.org/), which allows users to back-up game saves to the cloud. Supports [OneDrive](https://onedrive.live.com/), [Google Drive](https://drive.google.com/), [Dropbox](https://www.dropbox.com/), and [many more](#backend-support)!

Support: **[SteamDeckHomebrew Discord](https://deckbrew.xyz/discord)**.

## Troubleshooting

To find plugin logs, use `journalctl -f -n 100 -eu plugin_loader` (close with `q`) command in console. You may be asked to provide them in discord when asking for help.

## Features

* Ability to sync game saves or arbitrary files to the cloud.
* A high variety of supported cloud providers, courtesy of [rclone](https://rclone.org/).
* Ability to back up files automatically after a game is closed.
* File counter, which estimates the number of files a sync path would pick up. Prevents accidental backing up of the entire steam deck.
* Advanced filtering, allowing users to set up custom filtering rules with includes and excludes.
* Ability to customize destination folder name.
* Bidirectional sync (alpha, use at own risk!)

**NOTE!** This plugin **does not** delete files from the remote, even if files get deleted locally. This is intentional to protect against accidents. This, however, may cause issues. If you have a concrete example, let me know by opening an [issue](https://github.com/GedasFX/decky-cloud-save/issues).

## Installation

Find it on the [decky plugin store]() or download it from [releases page](https://github.com/GedasFX/decky-cloud-save/releases/) (extract the contents to `/home/deck/homebrew/plugins`).


## Usage

### Authentication

To sync files, you must first authenticate with a cloud provider. 

Navigate to `Configuration - Cloud Provider` and select one of the three providers. A website will open requesting you to authenticate. After putting in the credentials, the page will close by itself and `Currently using: X` should be updated to the new provider.

### Paths

The second step of setup is specifying the sync paths.

Navigate to `Configuration - Sync Paths` and click a button to `Add new Path to Sync`. You can sync individual files or folders. After selecting a path, an estimation of the number of files to be synced will be presented. If the count is greater than 9000, be extra cautious, as you may have selected an incorrect path (for a game, the number of save files should not be more than 10).

**IMPORTANT!** Deck respects symlinks in the sync paths. If a shortcut gets created, the destination would get backed up as well.

### Other providers

For one or another reason, a provider may not be able to be configured from the Big Picture mode. For these cases, we have provided install scripts for other common providers in [/quickstart](/defaults/quickstart/) directory. Just navigate there with explorer and run one of the install scripts.

When running an installer, a web browser will appear and allow you to finish the configuration. Once you see the **Success!** message, feel free to go back to the Big Picture mode - the configuration is over.

**NOTE**: If when running installer a store page opens to download a browser, download it, and restart the device to try again. Sorry for the inconvenience.

## Usage (Advanced)

If you wish to use another provider other than OneDrive, Google Drive, or Dropbox, you will have to go to desktop mode and configure the provider manually.

Manual configuration would require the use of a console, but following the interactive steps should be enough to create any of the [many supported providers](https://rclone.org/docs/).

<u>**SECURITY WARNING: some rclone-providers will save passwords unencrypted on the SteamDeck filesystem**</u>. This is Rclone related and the plugin cannot handle encrypted credentials.

### Configuration Steps

1. Navigate to the plugin installation directory (default - `/home/deck/homebrew/plugins/decky-cloud-save`).
2. Run `./rclone config` in a console:
   
   1. In the first menu select `New remote` (enter `n`).
   2. When asked for `name`, enter `backend` - **IMPORTANT**!

      > If remote already exists, delete previous one before creating the new one.

   3. When asked for `Storage`, select a provider by typing one of the listed numbers or values in parentheses.

   4. Follow the steps for each provider. If stumped, use the [rclone docs](https://rclone.org/docs/) for reference.

      > If you supsect a provider is not supported or are still stuck setting up, open an [issue](https://github.com/GedasFX/decky-cloud-save/issues) or visit the [SteamDeckHomebrew Discord](https://discord.gg/ZU74G2NJzk).

3. Verify the sync works by going to gaming mode and clicking `Sync now`. If files start appearing in the cloud, everything works as expected.

### Filtering (Advanced)

By default, the filters defined in the UI can be set to include some paths and to exclude others (excludes takes priority over includes). If a more complex solution is needed, you can edit the filter file (by default: `/home/deck/homebrew/settings/decky-cloud-save/sync_paths_filter.txt`) to meet your needs.

Important note: UI edits overwrite this file, so make sure you do not use the built-in editor afterward and make constant backups of the configuration (heh). Additionally, we cannot check for the validity of the configuration after it was done manually. If needed, a dry-run can be performed to check which files would have been synced after the edit. I would highly recommend you do it before you sync your entire file system.

Command (in `/home/deck/homebrew/plugins/decky-cloud-save/`):
```bash
./rclone copy --filter-from ../../settings/decky-cloud-save/sync_paths_filter.txt / backend:decky-cloud-save --copy-links --dry-run
```


## Other (Advanced)

### Change destination folder name

If you wish to change the folder on how it appears on the remote, edit `~/homebrew/settings/decky-cloud-save/plugin.properties` file and replace `decky-cloud-save` with whichever name you wish. Be wary of path limitations unique to each provider.

### Experimental features

Some features were asked to be added, but they are in the experimentatl state. To access this menu, go to `plugin.properties`, and set `experimental_menu=true`.

### Experimental feature - bidirectional sync

On the plugin sidebar there is a new option to change behavior of plugin to not only backup files, but to sync them with remote. This is an operation that is able to delete your files, so use it with extreme caution.

Before your first sync, first you will need to manually run the following command in console:

```
/home/deck/homebrew/plugins/decky-cloud-save/rclone bisync --filter-from /home/deck/homebrew/settings/decky-cloud-save/sync_paths_filter.txt / backend:decky-cloud-save --copy-links --resync

# If you have changed the install decky install directory, change /home/deck/homebrew/ with the appropriate install location
# If you changed default destination folder, change backend:decky-cloud-save to backend:[MY_DESTINATION_FOLDER]
```

**IMPORTANT!** This plugin does not provide support for if you use bidirectional sync. It is not the plugin's primary use case and is in the experimental state. USE AT YOUR OWN RISK!
