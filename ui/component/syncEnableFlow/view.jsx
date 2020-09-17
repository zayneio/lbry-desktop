// @flow
import * as PAGES from 'constants/pages';
import React from 'react';
import Button from 'component/button';
import { FormField } from 'component/common/form';
import { getSavedPassword } from 'util/saved-passwords';
import Card from 'component/common/card';
import { withRouter } from 'react-router';
import Spinner from 'component/spinner';
import { Lbry } from 'lbry-redux';

type Props = {
  setSyncEnabled: boolean => void,
  syncEnabled: boolean,
  hasSyncedWallet: boolean,
  hasSyncChanged: boolean,
  verifiedEmail: ?string,
  history: { push: string => void },
  location: UrlLocation,
  getSyncError: ?string,
  getSyncPending: boolean,
  disabled: boolean,
  getSync: (cb: () => void) => void,
  checkSync: () => void,
  closeModal: () => void,
  mode: string,
};

function SyncEnableFlow(props: Props) {
  const {
    setSyncEnabled,
    syncEnabled,
    hasSyncedWallet,
    hasSyncChanged,
    verifiedEmail,
    getSyncError,
    getSyncPending,
    history,
    location: { pathname },
    disabled = false,
    getSync,
    checkSync,
    mode,
    closeModal,
  } = props;

  // phases for enable are: entry, warning, fetch, enable-options
  // phases for disable are: entry, fetch, disable-options
  const [phase, setPhase] = React.useState('entry');
  const [prefsets, setPrefsets] = React.useState();
  const [password, setPassword] = React.useState();
  const [error, setError] = React.useState();
  const [keySelected, setKeySelected] = React.useState();

  const handleSyncEnable = () => {};

  const handleSyncDisable = () => {};

  React.useEffect(() => {
    if (mode) {
      checkSync();
      if (mode === 'enable') {
        setPhase('enable-warning');
        // Warning screen
      } else {
        setPhase('fetch-for-disable');
        // Disable Option screen
      }
    }
  }, [mode]);

  React.useEffect(() => {
    getSavedPassword()
      .then(pw => setPassword(pw || ''))
      .catch(e => {
        setError(e && e.message ? e.message : e);
      });
  }, []);

  React.useEffect(() => {
    if (phase === 'fetch-for-enable') {
      getSync(password, (e, hasChanged) => {
        if (e) {
          setPhase('error');
          setError(e && e.message ? e.message : e);
        } else {
          Lbry.preference_get().then(result => {
            const prefs = {};
            if (result['shared']) prefs['shared'] = result['shared'];
            if (result['local']) prefs['local'] = result['local'];
            setPrefsets(prefs);
            // we're about to be switching to shared
            setPhase('enable-present-options');
          });
        }
      });
    }
    if (phase === 'fetch-for-disable') {
      Lbry.preference_get().then(result => {
        const prefs = {};
        if (result['shared']) prefs['shared'] = result['shared'];
        if (result['local']) prefs['local'] = result['local'];
        setPrefsets(prefs);
        // we're about to be switching to local
        setPhase('disable-present-options');
      });
    }
  }, [phase, setPrefsets, setPhase, password]);

  if (getSyncPending) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <Card
      title={'Sync Enable'}
      body={
        <>
          {phase === 'enable-warning' && (
            <>
              <h1>Sync allows you to have the same settings and subscriptions wherever you LBRY.</h1>
              <h1>Continuing will import the profile in your cloud wallet into your local wallet.</h1>
            </>
          )}
          {phase === 'entry' && (
            <>
              <h1>{`Please wait...`}</h1>
              <Spinner />
            </>
          )}
          {(phase === 'fetch-for-enable' || 'fetch-for-disable') && (
            <>
              <h1>{`Getting your profiles...`}</h1>
              <Spinner />
            </>
          )}
          {phase === 'enable-present-options' && (
            <>
              <h1>{`You are currently using your local profile. Which would you ?`}</h1>
              <ul>
                <li>{`remote: ${prefsets['shared'].value.subscriptions.length} follows`}</li>
                <li>{`current: ${prefsets['local'].value.subscriptions.length} follows`}</li>
              </ul>
            </>
          )}
        </>
      }
      actions={
        <>
          {phase === 'enable-warning' && (
            <>
              <Button
                button="primary"
                name={'understood'}
                label={__('Continue')}
                onClick={() => setPhase('fetch-for-enable')}
              />
              <Button button="link" name={'cancel'} label={__('Cancel')} onClick={() => closeModal()} />
            </>
          )}
          {phase === 'enable-present-options' && (
            <>
              <Button
                button="primary"
                name={'enablesync'}
                label={__('Enable Sync')}
                onClick={() => handleSyncEnable()}
              />
              <Button button="link" name={'cancel'} label={__('Cancel')} onClick={() => closeModal()} />
            </>
          )}
          {phase === 'disable-present-options' && (
            <>
              <Button
                button="primary"
                name={'disablesync'}
                label={__('Disable Sync')}
                onClick={() => handleSyncDisable()}
              />
              <Button button="link" name={'cancel'} label={__('Cancel')} onClick={() => closeModal()} />
            </>
          )}
          {phase === 'error' && (
            <>
              <Button button="primary" name={'cancel'} label={__('Close')} onClick={() => closeModal()} />
            </>
          )}
        </>
      }
    />
  );
}

export default withRouter(SyncEnableFlow);
