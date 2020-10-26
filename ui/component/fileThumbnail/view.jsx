// @flow
import type { Node } from 'react';
import React from 'react';
import FreezeframeWrapper from './FreezeframeWrapper';
import Placeholder from './placeholder.png';
import classnames from 'classnames';

type Props = {
  uri: string,
  thumbnail: ?string, // externally sourced image
  children?: Node,
  allowGifs: boolean,
  claim: ?StreamClaim,
  doResolveUri: string => void,
  className?: string,
};

function FileThumbnail(props: Props) {
  const { claim, uri, doResolveUri, thumbnail: rawThumbnail, children, allowGifs = false, className } = props;
  const thumbnail =
    (rawThumbnail && rawThumbnail.trim().replace(/^http:\/\//i, 'https://')) ||
    (claim && claim.value && claim.value.thumbnail && claim.value.thumbnail.url);
  const hasResolvedClaim = claim !== undefined;

  React.useEffect(() => {
    if (!hasResolvedClaim) {
      doResolveUri(uri);
    }
  }, [hasResolvedClaim, uri, doResolveUri]);

  if (!allowGifs && thumbnail && thumbnail.endsWith('gif')) {
    return (
      <FreezeframeWrapper src={thumbnail} className={classnames('media__thumb', className)}>
        {children}
      </FreezeframeWrapper>
    );
  }

  let url;
  // @if TARGET='web'
  // Pass image urls through a compression proxy
  url = thumbnail || Placeholder;
  // url = thumbnail
  //   ? 'https://ext.thumbnails.lbry.com/400x,q55/' +
  //     // The image server will redirect if we don't remove the double slashes after http(s)
  //     thumbnail.replace('https://', 'https:/').replace('http://', 'http:/')
  //   : Placeholder;
  // @endif
  // @if TARGET='app'
  url = thumbnail || Placeholder;
  // @endif

  return (
    <div
      style={{ backgroundImage: `url('${url.replace(/'/g, "\\'")}')` }}
      className={classnames('media__thumb', className)}
    >
      {children}
    </div>
  );
}

export default FileThumbnail;
