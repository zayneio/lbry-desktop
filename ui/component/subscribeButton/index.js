import { connect } from 'react-redux';
import {
  doChannelSubscribe,
  doChannelUnsubscribe,
  doToggleSubscriptionNotifications,
} from 'redux/actions/subscriptions';
import {
  makeSelectIsSubscribed,
  selectFirstRunCompleted,
  makeSelectIsNotificationsEnabled,
} from 'redux/selectors/subscriptions';
import { makeSelectPermanentUrlForUri } from 'lbry-redux';
import { doToast } from 'redux/actions/notifications';
import SubscribeButton from './view';

const select = (state, props) => ({
  isSubscribed: makeSelectIsSubscribed(props.uri, true)(state),
  hasNotificationsEnabled: makeSelectIsNotificationsEnabled(props.uri)(state),
  firstRunCompleted: selectFirstRunCompleted(state),
  permanentUrl: makeSelectPermanentUrlForUri(props.uri)(state),
});

export default connect(select, {
  doChannelSubscribe,
  doChannelUnsubscribe,
  doToast,
  doToggleSubscriptionNotifications,
})(SubscribeButton);
