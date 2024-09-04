# Decky Cloud Save

A plugin based on [rclone](https://rclone.org/), which allows users to back-up game saves to the cloud. Supports [OneDrive](https://onedrive.live.com/), [Google Drive](https://drive.google.com/), [Dropbox](https://www.dropbox.com/), and [many more](#other-providers)!

Support: **[SteamDeckHomebrew Discord](https://deckbrew.xyz/discord)**, or open an issue on here (preferred).

## Troubleshooting

If you are having issues with sync, more often than not, logs will tell you all you need to know to resolve the issue. You can find them in the plugin panel, or `~/homebrew/logs/decky-cloud-save/`. You may be asked to provide them when asking for help.

To see more detailed logs, you will have to modify the `log_level` in `~/homebrew/settings/decky-cloud-save/plugin.properties` to use `DEBUG`. Make sure to change it back to `INFO` or higher, when done.

## Features

* Ability to sync game saves or arbitrary files to the cloud.
* A high variety of supported cloud providers, courtesy of [rclone](https://rclone.org/).
* Ability to back up files automatically after a game is closed.
* File counter, which estimates the number of files a sync path would pick up. Prevents accidental backing up of the entire steam deck.
* Advanced filtering, allowing users to set up custom filtering rules with includes and excludes.
* Ability to customize destination folder name.
* Automatically sync files on game startup (if feature enabled, and game does not support native steam cloud).
* Easily accessable sync logs.
* Bidirectional sync (beta, use at own risk!).

**NOTE!** This plugin **does not** delete files from the remote (**when in regular sync mode only**), even if files get deleted locally. This is intentional to protect against accidents. This, however, may cause issues. If you have a concrete example, let me know by opening an [issue](https://github.com/GedasFX/decky-cloud-save/issues).

## Installation

Find it on the [decky plugin store](https://plugins.deckbrew.xyz/) or download it from [releases page](https://github.com/GedasFX/decky-cloud-save/releases/) (use the built-in installer).


## Usage

### Authentication

To sync files, you must first authenticate with a cloud provider. 

Navigate to `Configuration - Cloud Provider` and select one of the three providers. A website will open requesting you to authenticate. After putting in the credentials, the page will close by itself and `Currently using: X` should be updated to the new provider.

Dropbox and OneDrive seem to work okay with this, other providers would need to be installed using the steps outlined [here](#other-providers).

### Paths

The second step of setup is specifying the sync paths.

Navigate to `Configuration - Sync Paths` and click a button to `Add new Path to Sync`. You can sync individual files or folders. After selecting a path, an estimation of the number of files to be synced will be presented. If the count is greater than 9000, be extra cautious, as you may have selected an incorrect path (for a game, the number of save files usually is not be more than 10).

**IMPORTANT!** The plugin respects symlinks in the sync paths. If a shortcut gets created, the destination would get backed up as well. This will be visible in the estimated files count.

### Other providers

For one or another reason, a provider may not be able to be configured from the Big Picture mode. For these cases, we have provided install scripts for other common providers in [/quickstart](/defaults/quickstart/) directory. Just navigate there with explorer and run one of the install scripts.

When running an installer, a web browser will appear and allow you to finish the configuration. Once you see the **Success!** message, feel free to go back to the Big Picture mode - the configuration is over.

**NOTE**: If when running installer a store page opens to download a browser, download it, and restart the device to try again. Sorry for the inconvenience.

**NOTE**: You may need to run the script with `bash ./provider_script.sh`, or manually `chmod +x` the file, due to changes in build pipeline.

## Usage (Advanced)

If you wish to use another provider other than OneDrive, Google Drive, or Dropbox, you will have to go to desktop mode and configure the provider manually.

Manual configuration would require the use of a console, but following the interactive steps should be enough to create any of the [many supported providers](https://rclone.org/docs/).

<u>**SECURITY WARNING: some rclone-providers will save passwords unencrypted on the SteamDeck filesystem**</u>. This is Rclone related and the plugin cannot handle encrypted credentials.

### Configuration Steps

1. Navigate to the plugin installation directory (default - `~/homebrew/plugins/decky-cloud-save`).
2. Run `./bin/rcloneLauncher config` in a console:
   
   1. In the first menu select `New remote` (enter `n`).
   2. When asked for `name`, enter `backend` - **IMPORTANT**!

      > If remote already exists, delete previous one before creating the new one.

   3. When asked for `Storage`, select a provider by typing one of the listed numbers or values in parentheses.

   4. Follow the steps for each provider. If stumped, use the [rclone docs](https://rclone.org/docs/) for reference.

      > If you supsect a provider is not supported or are still stuck setting up, open an [issue](https://github.com/GedasFX/decky-cloud-save/issues) or visit the [SteamDeckHomebrew Discord](https://deckbrew.xyz/discord).

3. Verify the sync works by going to gaming mode and clicking `Sync now`. If files start appearing in the cloud, everything works as expected.

### Filtering (Advanced)

By default, the filters defined in the UI can be set to include some paths and to exclude others (excludes takes priority over includes). If a more complex solution is needed, you can edit the filter file (by default: `~/homebrew/settings/decky-cloud-save/sync_paths_filter.txt`) to meet your needs.

Important note: UI edits overwrite this file, so make sure you do not use the built-in editor afterward and make constant backups of the configuration (heh). Additionally, we cannot check for the validity of the configuration after it was done manually. If needed, a dry-run can be performed to check which files would have been synced after the edit. I would highly recommend you do it before you sync your entire file system.

Command (in `~/homebrew/plugins/decky-cloud-save/`):
```bash
./rcloneLauncher copy --filter-from ../../settings/decky-cloud-save/sync_paths_filter.txt / backend:decky-cloud-save --copy-links --dry-run
```

## Bi-directional Sync

This much requested feature allows for two-way file transfers, rather than the default one-way.

**IMPORTANT!** Bisync is, while stable, still experimental. USE AT YOUR OWN RISK!

### Flow

Sync can be initiated in one of two ways: manually by clicking the `Sync Now` button, or automatically, whenever a game which does not support native Steam Cloud is opened or closed (and the auto-sync feature is enabled in the plugin panel).

When clicking `Sync Now` button or when the game closes, the game automatically pushes files from the Steam Deck to remote. In case of conflict, the files on the Steam Deck will be treated as canon.

When a game is opened, which does not support native Steam Cloud, and automatic sync is enabled, a small syncing process is started. First the game startup is temporarily suspended to pull files from remote. These files will be treated as canon. Then once the sync is complete, game startup is resumed.

#### Caveats:

1. Whenever the game is starting with auto-sync enabled, the start will be delayed until sync completes. This is obviously undesirable when there is no internet conectivity, so as a workaround, just disable the auto-sync until you get back to civilization.

2. Although the halting process is quick, its not instantanious. This means that for some games, there is a possibility where files already get read. In testing we have not encountered such games, however the possibility is real. Please open an issue if you uncover such case.

### Conflict Resolution

It is entirely possible that at some point file conflicts occur. You will be warned with a toast notification whenever such case occurs. Thankfully, rclone offers great conflict resolution methods.

Whenever a sync occurs which leads to a conflict, one of the 2 file states will be taken as canon (in context for conflict resolutions). For example, if you click `Sync Now`, the canonical files are the ones on the Steam Deck, which means, that if we have a file `a.txt` that was updated on deck (and not synced), and on the remote, the one on the Deck will take priority. Conversely, if its part of autosync on game start, the remote file would take priority instead.

The loser file, will not be deleted, however it will be renamed to `a.txt.conflict1`. If futher conflicts occur, the number at the end just gets incremented. It's up to the user to delete the file that is not up to date.

#### Note on resync

If the bisync is used for the first time, and or data corruption occurs, you may be asked to run resync. This is just like sync, except it would completely reset either local files, or destination files. You will be prompted to select which ones should be treated as canon.


## Other (Advanced)

### Change destination folder name

If you wish to change the folder on how it appears on the remote, edit `~/homebrew/settings/decky-cloud-save/plugin.properties` file and replace `decky-cloud-save` with whichever name you wish. Be wary of path limitations unique to each provider.

### Additional rclone arguments

If you want to have additional arguments passed to rsync for your provider, you can specify them in `plugin.properties` with:

```
additional_sync_args=<Args>

example:
additional_sync_args=--onedrive-av-override
```

### Custom sync root

By default the sync root is `/` for simplicity. If having it causes issues, you can change it to another place and create symlinks. Set `plugin.properties` value `sync_root` to be whatever you wish (e.g. `/home/deck/`). **IMPORTANT: This path must be absolute, and must end with a trailing `/`**

Example, where 2 symlinks are created:

```bash
cd /home/deck/syncs
ln -s /run/media/mmcblk0p1/Emulation/saves/ "$(pwd)/emulation-saves"
ln -s "/home/deck/homebrew/settings/decky-cloud-save/" "$(pwd)/dcs-config"
```

In `plugin.properties`, when root is set to `/home/deck/`, we can sync the folder `syncs`, and it would show up as `emulation-saves`, and `dcs-config` on the configured cloud provider.

If you had paths defined earlier, you will have to adjust them accordingly.

## Acknowledgments

Thank you to:
* [Emiliopg91](https://github.com/Emiliopg91), [NL-TCH](https://github.com/NL-TCH) for bi-sync support!
* [AkazaRenn](https://github.com/AkazaRenn), for various support!
* [Decky Homebrew Community](https://github.com/SteamDeckHomebrew) for assistance with development!
* [rclone](https://rclone.org/) for making this plugin possible!
