// @flow
import { doGetSync, selectGetSyncIsPending, selectSetSyncIsPending, selectGetSyncErrorMessage } from 'lbryinc';
import { selectWalletIsEncrypted, SETTINGS } from 'lbry-redux';
import { makeSelectClientSetting } from 'redux/selectors/settings';
import { doSetClientSetting, doPushSettingsToPrefs } from 'redux/actions/settings';
import { doToast } from 'redux/actions/notifications';
import { getSavedPassword } from 'util/saved-passwords';
import { doAnalyticsTagSync, doHandleSyncComplete } from 'redux/actions/app';
import { selectSyncIsLocked } from '../selectors/app';

let syncTimer = null;
// const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutes
const SYNC_INTERVAL = 30000; // 5 minutes

export const doGetSyncDesktop = (cb?: () => void, password?: string) => (dispatch: Dispatch, getState: GetState) => {
  dispatch({ type: 'DO_SYNC_DESK' }); // testing
  console.log('DGSD');
  const state = getState();
  const syncEnabled = makeSelectClientSetting(SETTINGS.ENABLE_SYNC)(state);
  const getSyncPending = selectGetSyncIsPending(state);
  const setSyncPending = selectSetSyncIsPending(state);
  const walletIsEncrypted = selectWalletIsEncrypted(state);
  const getSyncError = selectGetSyncErrorMessage(state);
  const syncLocked = selectSyncIsLocked(state);

  return getSavedPassword().then(savedPassword => {
    const passwordArgument = password || savedPassword === null ? '' : savedPassword;

    if (syncEnabled && !getSyncPending && !setSyncPending && !getSyncError && !syncLocked) {
      // && notlocked?
      if (walletIsEncrypted && savedPassword === '') {
        dispatch(doSetClientSetting(SETTINGS.ENABLE_SYNC, false));
        dispatch(doPushSettingsToPrefs()); // update above
        dispatch(
          doToast({
            message: 'Something is wrong with your wallet encryption. Disabling remote sync for now.',
            isError: true,
          })
        );
      } else {
        // LOCK
        return dispatch(doGetSync(passwordArgument, cb));
      }
    }
  });
};

// Redo?
export function doSyncSubscribe() {
  // start or restart sync interval
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch({ type: 'DO_SUB' });
    if (syncTimer) clearInterval(syncTimer);
    const state = getState();
    const syncEnabled = makeSelectClientSetting(SETTINGS.ENABLE_SYNC)(state);
    const syncLocked = selectSyncIsLocked(state);
    if (syncEnabled && !syncLocked) {
      dispatch(doGetSyncDesktop((error, hasNewData) => dispatch(doHandleSyncComplete(error, hasNewData))));
      dispatch(doAnalyticsTagSync());
      console.log('sync subscription running-');
      syncTimer = setInterval(() => {
        const state = getState();
        const syncEnabled = makeSelectClientSetting(SETTINGS.ENABLE_SYNC)(state);
        console.log('trying sync interval-');
        if (syncEnabled) {
          dispatch(doGetSyncDesktop((error, hasNewData) => dispatch(doHandleSyncComplete(error, hasNewData))));
          dispatch(doAnalyticsTagSync());
        }
      }, SYNC_INTERVAL);
    }
  };
}

export function doSyncUnsubscribe() {
  return (dispatch: Dispatch) => {
    dispatch({ type: 'DO_UNSUB' });
    console.log('sync subscriptoin stopped-');
    if (syncTimer) {
      clearInterval(syncTimer);
    }
  };
}
