// @flow
import { doGetSync, selectGetSyncIsPending, selectSetSyncIsPending } from 'lbryinc';
import { selectWalletIsEncrypted, SETTINGS } from 'lbry-redux';
import { makeSelectClientSetting } from 'redux/selectors/settings';
import { doSetClientSetting, doPushSettingsToPrefs } from 'redux/actions/settings';
import { doToast } from 'redux/actions/notifications';
import { getSavedPassword } from 'util/saved-passwords';
import { doAnalyticsTagSync, doHandleSyncComplete } from 'redux/actions/app';

let syncTimer = null;
// const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutes
const SYNC_INTERVAL = 5000; // 5 minutes

export const doGetSyncDesktop = (cb?: () => void) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const syncEnabled = makeSelectClientSetting(SETTINGS.ENABLE_SYNC)(state);
  const getSyncPending = selectGetSyncIsPending(state);
  const setSyncPending = selectSetSyncIsPending(state);
  const walletIsEncrypted = selectWalletIsEncrypted(state);
  // prevent syncing every time syncEnabled changes on settings page resetting it
  // const isSettingsPage = pathname.includes(PAGES.SETTINGS);

  return getSavedPassword().then(password => {
    const passwordArgument = password === null ? '' : password;

    if (syncEnabled && !getSyncPending && !setSyncPending) {
      if (walletIsEncrypted && password === '') {
        dispatch(doSetClientSetting(SETTINGS.ENABLE_SYNC, false));
        dispatch(doPushSettingsToPrefs()); // update above
        dispatch(
          doToast({
            message: 'Something is wrong with your wallet encryption. Disabling remote sync for now.',
            isError: true,
          })
        );
      } else {
        return dispatch(doGetSync(passwordArgument, cb));
      }
    }
  });
};

export function doSyncSubscribe() {
  console.log('DSS');
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const syncEnabled = makeSelectClientSetting(SETTINGS.ENABLE_SYNC)(state);
    if (syncEnabled) {
      dispatch(doGetSyncDesktop(doHandleSyncComplete));
      dispatch(doAnalyticsTagSync());
      console.log('sync subscription running');
    }
    syncTimer = setInterval(() => {
      const state = getState();
      const syncEnabled = makeSelectClientSetting(SETTINGS.ENABLE_SYNC)(state);
      console.log('trying sync interval');
      if (syncEnabled) {
        dispatch(doGetSyncDesktop(doHandleSyncComplete));
        dispatch(doAnalyticsTagSync());
      }
    }, SYNC_INTERVAL);
  };
}

export function doSyncUnsubscribe() {
  return (dispatch: Dispatch) => {
    console.log('sync subscriptoin stopped');
    if (syncTimer) {
      clearInterval(syncTimer);
    }
  };
}
