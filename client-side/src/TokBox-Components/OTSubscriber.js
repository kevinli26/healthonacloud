import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import axios from 'axios';
import RecogUIWrapper from './RecogUIWrapper';

export default class OTSubscriber extends Component {
  constructor(props, context) {
    super(props);

    this.state = {
      subscriber: null,
      stream: props.stream || context.stream || null,
      session: props.session || context.session || null,
      people: null
    };

    this.sendImgBinary = this.sendImgBinary.bind(this);
    this.base64ToArrayBuffer = this.base64ToArrayBuffer.bind(this);
  }

  componentDidMount() {
    this.createSubscriber();

    try {
      this.setState({ timer: setInterval( async () => {
        this.sendImgBinary();
      }, 20000)});
    } catch(e) {
      console.log(e);
    }
  }

  sendImgBinary() {
    if (this.state.subscriber) {
      var imgData = this.state.subscriber.getImgData();
      var img = this.base64ToArrayBuffer(imgData);

      var url = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,smile,emotion,blur,exposure,noise&recognitionModel=recognition_02&returnRecognitionModel=true&detectionModel=detection_01"
      axios.post(url, img, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key': 'c2ee88fc1c884aa7b68bef241c730155'
        }
      }).then((res) => {
        var peopleDict = {};
        var response = res.data;

        for (var res in response) {
          var responseData = response[res].faceAttributes;
          var rectangleData = response[res].faceRectangle;
          var rectHeight = rectangleData.height;
          var rectLeft = rectangleData.left;
          var rectTop = rectangleData.top;
          var rectWidth = rectangleData.width;

          var maxProp = null;
          var maxValue = -1;
          var emotions = responseData.emotion;
          for (var prop in emotions) {
            var value = emotions[prop];
            if (value > maxValue && prop !== "neutral") {
              maxProp = prop;
              maxValue = value;
            }
          }

          var personId = response[res].faceId;
          var singlePerson = {
            "age": responseData.age,
            "blur": responseData.blur.blurLevel,
            "emotion": maxProp,
            "gender": responseData.gender,
            "noise": responseData.noise.noiseLevel,
            "smile": responseData.smile,
            "height": rectHeight,
            "left": rectLeft,
            "top": rectTop,
            "width": rectWidth,
            "imgData": imgData
          };

          peopleDict[personId] = singlePerson;
        }
        
        this.setState({people: peopleDict});
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
    const cast = (value, Type, defaultValue) => (value === undefined ? defaultValue : Type(value));

    const updateSubscriberProperty = (key) => {
      const previous = cast(prevProps.properties[key], Boolean, true);
      const current = cast(this.props.properties[key], Boolean, true);
      if (previous !== current) {
        this.state.subscriber[key](current);
      }
    };

    updateSubscriberProperty('subscribeToAudio');
    updateSubscriberProperty('subscribeToVideo');

    if (prevState.session !== this.state.session || prevState.stream !== this.state.stream) {
      this.destroySubscriber(prevState.session);
      this.createSubscriber();
    }
  }

  componentWillUnmount() {
    this.destroySubscriber();
  }

  getSubscriber() {
    return this.state.subscriber;
  }

  createSubscriber() {
    if (!this.state.session || !this.state.stream) {
      this.setState({ subscriber: null });
      return;
    }

    const container = document.createElement('div');
    container.setAttribute('class', 'OTSubscriberContainer');
    this.node.appendChild(container);

    this.subscriberId = uuid();
    const { subscriberId } = this;

    const subscriber = this.state.session.subscribe(
      this.state.stream,
      container,
      this.props.properties,
      (err) => {
        if (subscriberId !== this.subscriberId) {
          // Either this subscriber has been recreated or the
          // component unmounted so don't invoke any callbacks
          return;
        }
        if (err && typeof this.props.onError === 'function') {
          this.props.onError(err);
        } else if (!err && typeof this.props.onSubscribe === 'function') {
          this.props.onSubscribe();
        }
      },
    );

    if (
      this.props.eventHandlers &&
      typeof this.props.eventHandlers === 'object'
    ) {
      subscriber.on(this.props.eventHandlers);
    }

    this.setState({ subscriber });
  }

  destroySubscriber(session = this.props.session) {
    delete this.subscriberId;

    if (this.state.subscriber) {
      if (
        this.props.eventHandlers &&
        typeof this.props.eventHandlers === 'object'
      ) {
        this.state.subscriber.once('destroyed', () => {
          this.state.subscriber.off(this.props.eventHandlers);
        });
      }

      if (session) {
        session.unsubscribe(this.state.subscriber);
      }
    }
  }

  render() {
    return (
      <view>
        <div style={this.dStyle} ref={(node) => { this.node = node; }} />

        {this.state.people ? 
          <RecogUIWrapper 
            people={this.state.people}
          />
        : null}
      </view>
    
    )
  }
}

OTSubscriber.propTypes = {
  stream: PropTypes.shape({
    streamId: PropTypes.string,
  }),
  session: PropTypes.shape({
    subscribe: PropTypes.func,
    unsubscribe: PropTypes.func,
  }),
  properties: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  eventHandlers: PropTypes.objectOf(PropTypes.func),
  onSubscribe: PropTypes.func,
  onError: PropTypes.func,
};

OTSubscriber.defaultProps = {
  stream: null,
  session: null,
  properties: {},
  eventHandlers: null,
  onSubscribe: null,
  onError: null,
};

OTSubscriber.contextTypes = {
  stream: PropTypes.shape({
    streamId: PropTypes.string,
  }),
  session: PropTypes.shape({
    subscribe: PropTypes.func,
    unsubscribe: PropTypes.func,
  }),
};
