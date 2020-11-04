import { SETTINGS, DAEMON_SETTINGS } from 'lbry-redux';
import { createSelector } from 'reselect';
import homepages from 'homepages';

const selectState = state => state.settings || {};

export const selectDaemonSettings = createSelector(selectState, state => state.daemonSettings);

export const selectDaemonStatus = createSelector(selectState, state => state.daemonStatus);

export const selectFfmpegStatus = createSelector(selectDaemonStatus, status => status.ffmpeg_status);

export const selectFindingFFmpeg = createSelector(selectState, state => state.findingFFmpeg || false);

export const selectClientSettings = createSelector(selectState, state => state.clientSettings || {});

export const selectLoadedLanguages = createSelector(selectState, state => state.loadedLanguages || {});

export const makeSelectClientSetting = setting =>
  createSelector(selectClientSettings, settings => (settings ? settings[setting] : undefined));

// refactor me
export const selectShowMatureContent = makeSelectClientSetting(SETTINGS.SHOW_MATURE);

// and me
export const selectShowRepostedContent = makeSelectClientSetting(SETTINGS.HIDE_REPOSTS);

export const selectTheme = makeSelectClientSetting(SETTINGS.THEME);
export const selectAutomaticDarkModeEnabled = makeSelectClientSetting(SETTINGS.AUTOMATIC_DARK_MODE_ENABLED);
export const selectIsNight = createSelector(selectState, state => state.isNight);

export const selectSavedWalletServers = createSelector(selectState, state => state.customWalletServers);

export const selectSharedPreferences = createSelector(selectState, state => state.sharedPreferences);

export const makeSelectSharedPreferencesForKey = key =>
  createSelector(selectSharedPreferences, prefs => (prefs ? prefs[key] : undefined));

export const selectHasWalletServerPrefs = createSelector(
  makeSelectSharedPreferencesForKey(DAEMON_SETTINGS.LBRYUM_SERVERS),
  servers => {
    return !!(servers && servers.length);
  }
);

export const selectThemePath = createSelector(
  selectTheme,
  selectAutomaticDarkModeEnabled,
  selectIsNight,
  (theme, automaticDarkModeEnabled, isNight) => {
    const dynamicTheme = automaticDarkModeEnabled && isNight ? 'dark' : theme;
    return dynamicTheme || 'light';
  }
);

export const selectHomepageCode = createSelector(makeSelectClientSetting(SETTINGS.HOMEPAGE), setting => {
  return setting || 'en';
});

export const selectHomepageData = createSelector(
  // using homepage setting,
  selectHomepageCode,
  homepageCode => {
    // homepages = { 'odysee-en': odyseeFile, ... }
    console.log('hpc', homepageCode);
    console.log('hompages', homepages);
    if (!homepageCode) {
      return homepages['en'];
    } else {
      // getHomepageForUser...
      return homepages[homepageCode];
    }
  }
);

export const selectosNotificationsEnabled = makeSelectClientSetting(SETTINGS.OS_NOTIFICATIONS_ENABLED);
