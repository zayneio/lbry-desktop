// @flow
import * as MODALS from 'constants/modal_types';
import * as ICONS from 'constants/icons';
import React from 'react';
import classnames from 'classnames';
import Button from 'component/button';

type Props = {
  uri: string,
  doOpenModal: (string, {}) => void,
  fileAction?: boolean,
  disableSupport: boolean,
};

export default function ClaimSupportButton(props: Props) {
  const { doOpenModal, uri, fileAction, disableSupport } = props;
  if (disableSupport) {
    return null;
  }
  return (
    <Button
      button={fileAction ? undefined : 'alt'}
      className={classnames({ 'button--file-action': fileAction, 'button--highlighted': true })}
      icon={ICONS.LBC}
      iconSize={fileAction ? 22 : undefined}
      label={__('Support --[button to support a claim]--')}
      requiresAuth={IS_WEB}
      title={__('Support this claim')}
      onClick={() => doOpenModal(MODALS.SEND_TIP, { uri, isSupport: true })}
    >
      <div className="nudge">
        <div className="nudge__wrapper">
          <span className="nudge__text">Create an account to support this creator!</span>
          <Button
            className="nudge__close"
            button="close"
            icon={ICONS.REMOVE}
            onClick={e => {
              e.stopPropagation();
            }}
          />
        </div>
      </div>
    </Button>
  );
}
