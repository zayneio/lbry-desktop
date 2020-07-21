// @flow
import * as PAGES from 'constants/pages';
import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import analytics from 'analytics';
import { buildURI, parseURI } from 'lbry-redux';
import Router from 'component/router/index';
import ModalRouter from 'modal/modalRouter';
import ReactModal from 'react-modal';
import { openContextMenu } from 'util/context-menu';
import useKonamiListener from 'util/enhanced-layout';
import Yrbl from 'component/yrbl';
import FileRenderFloating from 'component/fileRenderFloating';
import { withRouter } from 'react-router';
import usePrevious from 'effects/use-previous';
import Nag from 'component/common/nag';
import REWARDS from 'rewards';
import usePersistedState from 'effects/use-persisted-state';
import FileDrop from 'component/fileDrop';
// @if TARGET='app'
import useZoom from 'effects/use-zoom';
// @endif
// @if TARGET='web'
import OpenInAppLink from 'web/component/openInAppLink';
import YoutubeWelcome from 'web/component/youtubeReferralWelcome';
import NagDegradedPerformance from 'web/component/nag-degraded-performance';
import NagDataCollection from 'web/component/nag-data-collection';

import {
  useDegradedPerformance,
  STATUS_OK,
  STATUS_DEGRADED,
  STATUS_FAILING,
  STATUS_DOWN,
} from 'web/effects/use-degraded-performance';
// @endif
export const MAIN_WRAPPER_CLASS = 'main-wrapper';
// @if TARGET='app'
export const IS_MAC = process.platform === 'darwin';
// @endif
const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutes

// button numbers pulled from https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const MOUSE_BACK_BTN = 3;
const MOUSE_FORWARD_BTN = 4;

type Props = {
  alertError: (string | {}) => void,
  pageTitle: ?string,
  language: string,
  languages: Array<string>,
  theme: string,
  user: ?{ id: string, has_verified_email: boolean, is_reward_approved: boolean },
  location: { pathname: string, hash: string, search: string },
  history: {
    goBack: () => void,
    goForward: () => void,
    index: number,
    length: number,
    push: string => void,
    listen: any => () => void,
  },
  fetchAccessToken: () => void,
  fetchChannelListMine: () => void,
  signIn: () => void,
  requestDownloadUpgrade: () => void,
  onSignedIn: () => void,
  setLanguage: string => void,
  isUpgradeAvailable: boolean,
  autoUpdateDownloaded: boolean,
  checkSync: () => void,
  updatePreferences: () => void,
  syncEnabled: boolean,
  uploadCount: number,
  balance: ?number,
  syncError: ?string,
  rewards: Array<Reward>,
  setReferrer: (string, boolean) => void,
  analyticsTagSync: () => void,
  isAuthenticated: boolean,
  hasNavigated: boolean,
  setHasNavigated: () => void,
};

function App(props: Props) {
  const {
    theme,
    user,
    fetchAccessToken,
    fetchChannelListMine,
    signIn,
    autoUpdateDownloaded,
    isUpgradeAvailable,
    requestDownloadUpgrade,
    syncEnabled,
    checkSync,
    uploadCount,
    history,
    syncError,
    language,
    languages,
    setLanguage,
    updatePreferences,
    rewards,
    setReferrer,
    analyticsTagSync,
    isAuthenticated,
    hasNavigated,
    setHasNavigated,
  } = props;

  const appRef = useRef();
  const isEnhancedLayout = useKonamiListener();
  const [hasSignedIn, setHasSignedIn] = useState(false);
  const hasVerifiedEmail = user && user.has_verified_email;
  const isRewardApproved = user && user.is_reward_approved;
  const previousHasVerifiedEmail = usePrevious(hasVerifiedEmail);
  const previousRewardApproved = usePrevious(isRewardApproved);
  // @if TARGET='web'
  const [showAnalyticsNag, setShowAnalyticsNag] = usePersistedState('analytics-nag', true);
  const [lbryTvApiStatus, setLbryTvApiStatus] = useState(STATUS_OK);
  // @endif
  const { pathname, hash, search } = props.location;
  const [upgradeNagClosed, setUpgradeNagClosed] = useState(false);
  const showUpgradeButton =
    (autoUpdateDownloaded || (process.platform === 'linux' && isUpgradeAvailable)) && !upgradeNagClosed;
  // referral claiming
  const referredRewardAvailable = rewards && rewards.some(reward => reward.reward_type === REWARDS.TYPE_REFEREE);
  const urlParams = new URLSearchParams(search);
  const rawReferrerParam = urlParams.get('r');
  const sanitizedReferrerParam = rawReferrerParam && rawReferrerParam.replace(':', '#');
  const shouldHideNag = pathname.startsWith(`/$/${PAGES.EMBED}`) || pathname.startsWith(`/$/${PAGES.AUTH_VERIFY}`);

  // const unlisten = history.listen((location, action) => {
  //   console.log(action, location.pathname, location.state);
  //   if (action === 'PUSH' && !hasNavigated) {
  //     setHasNavigated();
  //   }
  // });

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      if (action === 'PUSH' && !hasNavigated) {
        setHasNavigated();
      }
    });
    return unlisten();
  }, []);

  let uri;
  try {
    const newpath = buildURI(parseURI(pathname.slice(1).replace(/:/g, '#')));
    uri = newpath + hash;
  } catch (e) {}

  // @if TARGET='web'
  function handleAnalyticsDismiss() {
    setShowAnalyticsNag(false);
  }
  // @endif

  useEffect(() => {
    if (!uploadCount) return;
    const handleBeforeUnload = event => {
      event.preventDefault();
      event.returnValue = 'magic'; // without setting this to something it doesn't work
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploadCount]);

  // allows user to navigate history using the forward and backward buttons on a mouse
  useEffect(() => {
    const handleForwardAndBackButtons = e => {
      switch (e.button) {
        case MOUSE_BACK_BTN:
          history.index > 0 && history.goBack();
          break;
        case MOUSE_FORWARD_BTN:
          history.index < history.length - 1 && history.goForward();
          break;
      }
    };
    window.addEventListener('mouseup', handleForwardAndBackButtons);
    return () => window.removeEventListener('mouseup', handleForwardAndBackButtons);
  });

  // allows user to pause miniplayer using the spacebar without the page scrolling down
  useEffect(() => {
    const handleKeyPress = e => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Enable ctrl +/- zooming on Desktop.
  // @if TARGET='app'
  useZoom();
  // @endif

  useEffect(() => {
    if (referredRewardAvailable && sanitizedReferrerParam && isRewardApproved) {
      setReferrer(sanitizedReferrerParam, true);
    } else if (referredRewardAvailable && sanitizedReferrerParam) {
      setReferrer(sanitizedReferrerParam, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sanitizedReferrerParam, isRewardApproved, referredRewardAvailable]);

  useEffect(() => {
    const { current: wrapperElement } = appRef;
    if (wrapperElement) {
      ReactModal.setAppElement(wrapperElement);
    }
    fetchAccessToken();

    // @if TARGET='app'
    fetchChannelListMine(); // This needs to be done for web too...
    // @endif
  }, [appRef, fetchAccessToken, fetchChannelListMine]);

  useEffect(() => {
    // $FlowFixMe
    document.documentElement.setAttribute('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!languages.includes(language)) {
      setLanguage(language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, languages]);

  useEffect(() => {
    // Check that previousHasVerifiedEmail was not undefined instead of just not truthy
    // This ensures we don't fire the emailVerified event on the initial user fetch
    if (previousHasVerifiedEmail === false && hasVerifiedEmail) {
      analytics.emailVerifiedEvent();
    }
  }, [previousHasVerifiedEmail, hasVerifiedEmail, signIn]);

  useEffect(() => {
    if (previousRewardApproved === false && isRewardApproved) {
      analytics.rewardEligibleEvent();
    }
  }, [previousRewardApproved, isRewardApproved]);

  // Keep this at the end to ensure initial setup effects are run first
  useEffect(() => {
    if (!hasSignedIn && hasVerifiedEmail) {
      signIn();
      setHasSignedIn(true);
    }
  }, [hasVerifiedEmail, signIn, hasSignedIn]);

  // @if TARGET='app'
  useEffect(() => {
    updatePreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // @endif

  useEffect(() => {
    if (hasVerifiedEmail && syncEnabled) {
      checkSync();
      analyticsTagSync();
      let syncInterval = setInterval(() => {
        checkSync();
      }, SYNC_INTERVAL);

      return () => {
        clearInterval(syncInterval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVerifiedEmail, syncEnabled, checkSync]);

  useEffect(() => {
    if (syncError && isAuthenticated) {
      history.push(`/$/${PAGES.AUTH}?redirect=${pathname}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncError, pathname, isAuthenticated]);

  // @if TARGET='web'
  useDegradedPerformance(setLbryTvApiStatus);
  // @endif

  // @if TARGET='web'
  // Require an internal-api user on lbry.tv
  // This also prevents the site from loading in the un-authed state while we wait for internal-apis to return for the first time
  // It's not needed on desktop since there is no un-authed state
  if (!user) {
    return null;
  }
  // @endif

  return (
    <div
      className={classnames(MAIN_WRAPPER_CLASS, {
        // @if TARGET='app'
        [`${MAIN_WRAPPER_CLASS}--mac`]: IS_MAC,
        // @endif
      })}
      ref={appRef}
      onContextMenu={IS_WEB ? undefined : e => openContextMenu(e)}
    >
      {IS_WEB && lbryTvApiStatus === STATUS_DOWN ? (
        <Yrbl
          className="main--empty"
          title={__('lbry.tv is currently down')}
          subtitle={__('My wheel broke, but the good news is that someone from LBRY is working on it.')}
        />
      ) : (
        <React.Fragment>
          <Router />
          <ModalRouter />
          <FileDrop />
          <FileRenderFloating />
          {isEnhancedLayout && <Yrbl className="yrbl--enhanced" />}

          {/* @if TARGET='app' */}
          {showUpgradeButton && (
            <Nag
              message={__('An upgrade is available.')}
              actionText={__('Install Now')}
              onClick={requestDownloadUpgrade}
              onClose={() => setUpgradeNagClosed(true)}
            />
          )}
          {/* @endif */}

          {/* @if TARGET='web' */}
          <YoutubeWelcome />
          {!shouldHideNag && <OpenInAppLink uri={uri} />}
          {(lbryTvApiStatus === STATUS_DEGRADED || lbryTvApiStatus === STATUS_FAILING) && !shouldHideNag && (
            <NagDegradedPerformance onClose={() => setLbryTvApiStatus(STATUS_OK)} />
          )}
          {lbryTvApiStatus === STATUS_OK && showAnalyticsNag && !shouldHideNag && (
            <NagDataCollection onClose={handleAnalyticsDismiss} />
          )}
          {/* @endif */}
        </React.Fragment>
      )}
    </div>
  );
}

export default withRouter(App);
