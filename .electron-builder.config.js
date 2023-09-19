/**
 * TODO: Rewrite this config to ESM
 * But currently electron-builder doesn't support ESM configs
 * @see https://github.com/develar/read-config-file/issues/10
 */

/**
 * @type {() => import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = async function () {
  const {getVersion} = await import('./version/getVersion.mjs');

  return {
    directories: {
      output: 'dist',
      buildResources: 'buildResources',
    },
    files: ['packages/**/dist/**'],
    extraMetadata: {
      version: getVersion(),
    },

    // Specify linux target just for disabling snap compilation
    linux: {
      target: 'deb',
    },
    appId: "Tithree",
    win: {
      target: ["nsis"],
      icon: "buildResources/icon.ico"
    },
    nsis: {
      oneClick: true,
      artifactName: "Tithree_${version}_setup.${ext}",
      uninstallDisplayName: "Tithree",
      installerIcon: "buildResources/icon.ico",
      uninstallerIcon: "buildResources/icon.ico",
      license: "LICENSE",
      allowToChangeInstallationDirectory: false
    }
  };
};
