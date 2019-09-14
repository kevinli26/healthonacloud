import React, { Component } from 'react';
import PropTypes from 'prop-types';
import once from 'lodash/once';
import { omitBy, isNil } from 'lodash/fp';
import uuid from 'uuid';
import axios from 'axios';
import RecogUI from './RecogUI';

const OT = require('@opentok/client');

export default class OTPublisher extends Component {
  constructor(props, context) {
    super(props);

    this.state = {
      publisher: null,
      lastStreamId: '',
      session: props.session || context.session || null,
      people: null
    };

    this.sendImgBinary = this.sendImgBinary.bind(this);
    this.base64ToArrayBuffer = this.base64ToArrayBuffer.bind(this);
  }

  componentDidMount() {
    this.createPublisher();

    try {
      this.state.timer = setInterval( async () => {
        console.log("Timer tick")
        this.sendImgBinary();
      }, 4000);
    } catch(e) {
      console.log(e);
    }
  }

  sendImgBinary() {
    if (this.state.publisher) {
      var imgData = this.state.publisher.getImgData();
      var img = this.base64ToArrayBuffer(imgData);
      console.log(img);

      var url = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,glasses,emotion,blur,exposure,noise&recognitionModel=recognition_01&returnRecognitionModel=true&detectionModel=detection_01"
      axios.post(url, img, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key': '1f4e3409461743b7ae7136039bac1d93'
        }
      }).then((res) => {
        var peopleDict = {};
        var response = res.data;
        for (var res in response) {
          var responseData = response[res].faceAttributes;

          var maxProp = null;
          var maxValue = -1;
          var emotions = responseData.emotion;
          for (var prop in emotions) {
            var value = emotions[prop];
            if (value > maxValue && prop != "neutral") {
              maxProp = prop;
              maxValue = value;
            }
          }

          var personId = response[res].faceId;
          var singlePerson = {
            "age": responseData.age,
            "blur": responseData.blur.blurLevel,
            "emotion": maxProp,
            "glasses": responseData.glasses,
            "gender": responseData.gender,
            "noise": responseData.noise.noiseLevel,
            "smile": responseData.smile
          };

          peopleDict[personId] = singlePerson;
        }
        
        this.setState({people: peopleDict});
        console.log(this.state.people);
      }).catch((error) => {
        console.log(error);
      });
    } else {
      console.log("Publisher does not exist");
    }
  }

  base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  componentDidUpdate(prevProps, prevState) {
    const UseDefault = (value, defaultValue) => (value === undefined ? defaultValue : value);

    const shouldUpdate = (key, defaultValue) => {
      const previous = UseDefault(prevProps.properties[key], defaultValue);
      const current = UseDefault(this.props.properties[key], defaultValue);
      return previous !== current;
    };

    const updatePublisherProperty = (key, defaultValue) => {
      if (shouldUpdate(key, defaultValue)) {
        const value = UseDefault(this.props.properties[key], defaultValue);
        this.state.publisher[key](value);
      }
    };

    if (shouldUpdate('videoSource', undefined)) {
      this.destroyPublisher();
      this.createPublisher();
      return;
    }

    updatePublisherProperty('publishAudio', true);
    updatePublisherProperty('publishVideo', true);

    if (this.state.session !== prevState.session) {
      this.destroyPublisher(prevState.session);
      this.createPublisher();
    }
  }

  componentWillUnmount() {
    if (this.state.session) {
      this.state.session.off('sessionConnected', this.sessionConnectedHandler);
    }

    this.destroyPublisher();
  }

  getPublisher() {
    return this.state.publisher;
  }

  destroyPublisher(session = this.state.session) {
    delete this.publisherId;

    if (this.state.publisher) {
      this.state.publisher.off('streamCreated', this.streamCreatedHandler);

      if (
        this.props.eventHandlers &&
        typeof this.props.eventHandlers === 'object'
      ) {
        this.state.publisher.once('destroyed', () => {
          this.state.publisher.off(this.props.eventHandlers);
        });
      }

      if (session) {
        session.unpublish(this.state.publisher);
      }
      this.state.publisher.destroy();
    }
  }

  publishToSession(publisher) {
    const { publisherId } = this;

    this.state.session.publish(publisher, (err) => {
      if (publisherId !== this.publisherId) {
        // Either this publisher has been recreated or the
        // component unmounted so don't invoke any callbacks
        return;
      }
      if (err) {
        this.errorHandler(err);
      } else if (typeof this.props.onPublish === 'function') {
        this.props.onPublish();
      }
    });
  }

  createPublisher() {
    if (!this.state.session) {
      this.setState({ publisher: null, lastStreamId: '' });
      return;
    }

    const properties = this.props.properties || {};
    let container;

    if (properties.insertDefaultUI !== false) {
      container = document.createElement('div');
      container.setAttribute('class', 'OTPublisherContainer');
      this.node.appendChild(container);
    }

    this.publisherId = uuid();
    const { publisherId } = this;

    this.errorHandler = once((err) => {
      if (publisherId !== this.publisherId) {
        // Either this publisher has been recreated or the
        // component unmounted so don't invoke any callbacks
        return;
      }
      if (typeof this.props.onError === 'function') {
        this.props.onError(err);
      }
    });

    const publisher = OT.initPublisher(container, properties, (err) => {
      if (publisherId !== this.publisherId) {
        // Either this publisher has been recreated or the
        // component unmounted so don't invoke any callbacks
        return;
      }
      if (err) {
        this.errorHandler(err);
      } else if (typeof this.props.onInit === 'function') {
        this.props.onInit();
      }
    });
    publisher.on('streamCreated', this.streamCreatedHandler);

    if (
      this.props.eventHandlers &&
      typeof this.props.eventHandlers === 'object'
    ) {
      const handles = omitBy(isNil)(this.props.eventHandlers);
      publisher.on(handles);
    }

    if (this.state.session.connection) {
      this.publishToSession(publisher);
    } else {
      this.state.session.once('sessionConnected', this.sessionConnectedHandler);
    }

    this.setState({ publisher, lastStreamId: '' });
  }

  sessionConnectedHandler = () => {
    this.publishToSession(this.state.publisher);
  }

  streamCreatedHandler = (event) => {
    this.setState({ lastStreamId: event.stream.id });
  }

  render() {
    return (
    
      <view>
        {this.state.people ? 
          <RecogUI 
            people={this.state.people}
          />
        : null}

        <div ref={(node) => { this.node = node; }} />
        
      </view>
    
    )
  }
}

OTPublisher.propTypes = {
  session: PropTypes.shape({
    connection: PropTypes.shape({
      connectionId: PropTypes.string,
    }),
    once: PropTypes.func,
    off: PropTypes.func,
    publish: PropTypes.func,
    unpublish: PropTypes.func,
  }),
  properties: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  eventHandlers: PropTypes.objectOf(PropTypes.func),
  onInit: PropTypes.func,
  onPublish: PropTypes.func,
  onError: PropTypes.func,
};

OTPublisher.defaultProps = {
  session: null,
  properties: {},
  eventHandlers: null,
  onInit: null,
  onPublish: null,
  onError: null,
};

OTPublisher.contextTypes = {
  session: PropTypes.shape({
    connection: PropTypes.shape({
      connectionId: PropTypes.string,
    }),
    once: PropTypes.func,
    off: PropTypes.func,
    publish: PropTypes.func,
    unpublish: PropTypes.func,
  }),
};
