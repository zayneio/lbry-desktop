// @flow
import * as PAGES from 'constants/pages';
import * as MODALS from 'constants/modal_types';
import React from 'react';
import Button from 'component/button';
import { withRouter } from 'react-router';
import * as ICONS from '../../constants/icons';

type Props = {
  setSyncEnabled: boolean => void,
  syncEnabled: boolean,
  verifiedEmail: ?string,
  history: { push: string => void },
  location: UrlLocation,
  getSyncError: ?string,
  disabled: boolean,
  openModal: id => void,
};

function SyncToggle(props: Props) {
  const {
    verifiedEmail,
    getSyncError,
    history,
    location: { pathname },
    openModal,
    syncEnabled,
  } = props;

  if (getSyncError) {
    history.push(`/$/${PAGES.AUTH}?redirect=${pathname}&immediate=true`);
    return null;
  }

  return (
    <div>
      {!verifiedEmail ? (
        <div>
          <Button requiresAuth button="primary" label={__('Add Email')} />
          <p className="help">{__('An email address is required to sync your account.')}</p>
        </div>
      ) : (
        <Button
          button="secondary"
          label={__('Manage')}
          icon={ICONS.SETTINGS}
          onClick={() => openModal(MODALS.SYNC_ENABLE, { mode: syncEnabled ? 'disable' : 'enable' })}
        />
      )}
    </div>
  );
}

export default withRouter(SyncToggle);
