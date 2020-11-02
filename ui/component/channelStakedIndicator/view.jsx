// @flow
import React from 'react';
import CreditAmount from 'component/common/credit-amount';
import { formatCredits, formatFullPrice } from 'lbry-redux';

type Props = {
  claim: ?StreamClaim,
};

export default function ChannelStakedIndicator(props: Props) {
  const { uri, claim } = props;

  if (!claim) {
    return null;
  }

  return <span className="channel__staked-amount">{formatCredits(claim.meta.effective_amount, 2, true)}</span>;
}
