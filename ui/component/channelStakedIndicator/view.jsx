// @flow
import * as ICONS from 'constants/icons';
import React from 'react';
import Icon from 'component/common/icon';
import LbcSymbol from 'component/common/lbc-symbol';

type Props = {
  claim: ?ChannelClaim,
  title: ?string,
};

function ChannelTitle(props: Props) {
  const { title, claim } = props;

  if (!claim) {
    return null;
  }

  const amount = parseFloat(claim.amount) + parseFloat(claim.meta.support_amount);
  if (amount > 10) {
    return <Icon icon={ICONS.PLANT} size={14} className="channel__staked-indicator" />;
  } else {
    return null;
  }
}

export default ChannelTitle;
