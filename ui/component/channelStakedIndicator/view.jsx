// @flow
import * as ICONS from 'constants/icons';
import React from 'react';
import Icon from 'component/common/icon';
import LbcSymbol from 'component/common/lbc-symbol';
import { formatCredits, formatFullPrice } from 'lbry-redux';

type Props = {
  claim: ?ChannelClaim,
  title: ?string,
};

function ChannelStakedIndicator(props: Props) {
  const { title, claim } = props;

  if (!claim) {
    return null;
  }

  const amount = parseFloat(claim.amount) + parseFloat(claim.meta.support_amount);
  //   if (amount < 10) {
  //     return null;
  //   }

  return <div className="channel__staked-indicator">{formatCredits(amount, 1, true)}</div>;

  if (amount > 9 && amount < 99) {
    return <Icon icon={ICONS.STAKE_INDICATOR_LEVEL_1} size={14} className="channel__staked-indicator" />;
  } else if (amount > 99 && amount < 999) {
    return <Icon icon={ICONS.STAKE_INDICATOR_LEVEL_2} size={14} className="channel__staked-indicator" />;
  } else if (amount > 999 && amount < 9999) {
    // Fix this number
    return <Icon icon={ICONS.STAKE_INDICATOR_LEVEL_3} size={14} className="channel__staked-indicator" />;
  } else if (amount > 9999) {
    return <Icon icon={ICONS.STAKE_INDICATOR_LEVEL_4} size={14} className="channel__staked-indicator" />;
  }
}

export default ChannelStakedIndicator;
