import { connect } from 'react-redux';
import { selectBalance, selectClaimsBalance, selectSupportsBalance, selectTipsBalance } from 'lbry-redux';
import { doOpenModal } from 'redux/actions/app';
import { selectSyncHash } from 'redux/selectors/sync';
import { selectClaimedRewards } from 'redux/selectors/rewards';
import WalletBalance from './view';

const select = state => ({
  balance: selectBalance(state),
  claimsBalance: selectClaimsBalance(state) || 0,
  supportsBalance: selectSupportsBalance(state) || 0,
  tipsBalance: selectTipsBalance(state) || 0,
  rewards: selectClaimedRewards(state),
  hasSynced: Boolean(selectSyncHash(state)),
});

export default connect(select, {
  doOpenModal,
})(WalletBalance);
