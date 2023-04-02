# Decky Cloud Save

A plugin based on [rclone](https://rclone.org/), which allows users to back-up game saves to the cloud. Supports [OneDrive](https://onedrive.live.com/), [Google Drive](https://drive.google.com/), [Dropbox](https://www.dropbox.com/), and [many more](#backend-support)!

Support: **[SteamDeckHomebrew Discord](https://discord.gg/ZU74G2NJzk)**.

## Known Issues

* The file picker does not work after a fresh installation. [Issue tracker](https://github.com/GedasFX/decky-cloud-save/issues/7).

> Workaround: restart Steam and or Steam Deck.

## Features

* Ability to sync game saves or arbitrary files to the cloud.
* A high variety of supported cloud providers, courtesy of [rclone](https://rclone.org/).
* Ability to back up files automatically after a game is closed.
* File counter, which estimates the number of files a sync path would pick up. Prevents accidental backing up of the entire steam deck.

**IMPORTANT!** This plugin does not support bidirectional sync. In other words, this plugin is not intended for use cases to sync saves between devices, but rather just to keep your game progress safe in case of data loss.

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

## Usage (Advanced)

If you wish to use another provider other than OneDrive, Google Drive, or Dropbox, you will have to go to desktop mode and configure the provider manually.

Manual configuration would require the use of a console, but following the interactive steps should be enough to create any of the [many supported providers](https://rclone.org/docs/).

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

