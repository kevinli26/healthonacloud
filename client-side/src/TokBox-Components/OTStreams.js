import React, { Children } from 'react';
import PropTypes from 'prop-types';
import OTSubscriberContext from './OTSubscriberContext';

export default function OTStreams(props, context) {
  const session = props.session || context.session || null;
  const streams = props.streams || context.streams || null;

  if (!session) {
    return <div />;
  }

  const child = Children.only(props.children);

  const childrenWithContextWrapper = Array.isArray(streams)
    ? streams.map(stream => (child
      ? <OTSubscriberContext stream={stream} key={stream.id} >
        { child }
      </OTSubscriberContext>
      : child))
    // ? <div>{child
    //   ? <OTSubscriberContext stream={streams[0]} key={streams[0].id} >
    //     { child }
    //   </OTSubscriberContext>
    //   : child }</div>
    : null;

  return <div>{childrenWithContextWrapper}</div>;
}

OTStreams.propTypes = {
  children: PropTypes.element.isRequired,
  session: PropTypes.shape({ publish: PropTypes.func, subscribe: PropTypes.func }),
  streams: PropTypes.arrayOf(PropTypes.object),
};

OTStreams.defaultProps = {
  session: null,
  streams: null,
};

OTStreams.contextTypes = {
  session: PropTypes.shape({ publish: PropTypes.func, subscribe: PropTypes.func }),
  streams: PropTypes.arrayOf(PropTypes.object),
};
