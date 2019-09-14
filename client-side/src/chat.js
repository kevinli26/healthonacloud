import React from 'react';
import './App.css';
import CanvasDraw from "react-canvas-draw";
import socketIOClient from "socket.io-client";
import { throws } from 'assert';
// RCE CSS
import 'react-chat-elements/dist/main.css';
// MessageBox component
import { MessageBox } from 'react-chat-elements';
import axios from 'axios';

let moment = require('moment');
var sdk = require("microsoft-cognitiveservices-speech-sdk");

class Chat extends React.Component {
  
  constructor() {
    super();
    this.state = {
      recognizer: null,
      text: "",
      stopped: true,
      response: 0,
      endpoint: "https://mysterious-savannah-03972.herokuapp.com/",
      socket: null,
      messages: [],
    }
  }

  componentDidMount() {
    const {endpoint} = this.state;
    let socket = socketIOClient(endpoint);
    this.setState({socket: socket});
    socket.on('textMessage', (msg) => {
      let temp = this.state.messages;
      let entry = { "id": temp.length + 1, "language": "en", "source": "received", "text": msg,  "time": moment().format('LT') };
      temp.push(entry)
      this.setState({messages: temp})
    });
  }

  textUpdate = (e) => {
    this.setState({
      text: e.target.value
    });
  }

  analyzeSentiment() {
    var url = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.1/sentiment';

    if (this.state.messages) {
      axios.post(url, this.state.messages, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Ocp-Apim-Subscription-Key': ''
        }
      }).then((response) => {
        var res = response.documents;
        for (var prop in res) {
          var mes = res[prop];
          var key = "score";
          this.state.messages[prop][key] = mes.score;
        }

        console.log(this.state.messages);
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  analyzeKeyPhrases(data) {
    var url = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.1/keyPhrases';

    axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': ''
      }
    }).then((response) => {
      
    }).catch((error) => {
      console.log(error);
    });
  }

  analyzeEntities(data) {
    var url = 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.1/entities';

    axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': ''
      }
    }).then((response) => {
      
    }).catch((error) => {
      console.log(error);
    });
  }

  record = (e) => {
    var subscriptionKey = "ad626843b6974b23b6f6e44bd288e5f0";
    var serviceRegion = "westus"; // e.g., "westus"
    var speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    speechConfig.speechRecognitionLanguage = "en-US";
    var audioConfig  = sdk.AudioConfig.fromDefaultMicrophoneInput();
    var recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    
    recognizer.recognized = this.recognized
    this.setState({
      recognizer: recognizer,
      stopped: false
    });
    recognizer.startContinuousRecognitionAsync(); 

    // DEBUG
    console.log(this.state.messages);
    console.log(this.state.text);
  }

  recognized = (s,e) => {
    let str = e.result.text.trim();
    if (str !== "") {
      let temp = this.state.messages;
      let entry = {"id": temp.length + 1, "language": "en", "source": "sent", "text": str,  "time": moment().format('LT') };
      temp.push(entry)
      this.setState({messages: temp})
      this.state.socket.emit('clientMessage', str);
      console.log(str);
    }
  }

  stop = (e) => {
    this.state.recognizer.stopContinuousRecognitionAsync();
    this.setState({
      stopped: true
    });
  }
  
  canvasStyle = {
    border: '1px solid #000000'
  }

  interpret = (e) => {
    let data = JSON.parse(this.saveableCanvas.getSaveData());
    let toAzure = {
      "language": "en-CA",
      "version": 1,
      "strokes": []
    };
    data['lines'].forEach((line, index) => {
      let stroke = {
        "id": index,
        "points": line['points'][0]['x'] + "," + line['points'][0]['y']
      };
      line['points'].shift();
      line['points'].forEach((points) => {
        stroke['points'] += "," + points['x'] + "," + points['y']
      });
      toAzure['strokes'].push(stroke);
    });
    var ENDPOINT_URL = "https://healthappink.cognitiveservices.azure.com/inkrecognizer/v1.0-preview/recognize"
    var SUBSCRIPTION_KEY = "4d91188d571d4d6c89601711c8bb44c3";
    fetch(ENDPOINT_URL, {
      method: "POST",
      headers : {
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
        "content-type": "application/json"
      },
      body: toAzure
    }).then((res) => {
      console.log(res.json())
    })
  }

  send = (e) => {
    e.preventDefault();

    if (this.state.text.trim() !== ""){
      let temp = this.state.messages;
      let entry = {"id": temp.length + 1, "language": "en", "source": "sent", "text": this.state.text, "time": moment().format('LT')};
      temp.push(entry)
      this.setState({messages: temp, text:""})
      this.state.socket.emit('clientMessage', this.state.text);
    }

  }

  render() {
    return (
      <div className="container chat">
        <button id="startRecognizeOnceAsyncButton" onClick={this.record} disabled={!this.state.stopped}>Start</button>
        <button id="stopRecognizeOnceAsyncButton" onClick={this.stop} disabled={this.state.stopped}>Stop</button>
        <br/>
        <div className="chatbox">
          <ul id="messages">
            {this.state.messages.map((msg, index) => {
              return (
                  msg['source'] === "received" ? 
                      // <li>{msg['source']+ " : "+msg['text']}</li>
                      //message I received
                      <MessageBox
                          position={'left'}
                          type={'text'}
                          text={msg['source'] + " : " + msg['text']}
                          dateString={
                              msg['time']
                          }
                      />
                          :
                      // <li>{msg['source']+" : "+msg['text']} </li>
                      <MessageBox
                          position={'right'}
                          type={'text'}
                          text={msg['source'] + " : " +msg['text']}
                          dateString={
                              msg['time']
                          }
                      />  
              );
            })}
          </ul>
          <form action="">
            <input id="msg" value={this.state.text} onChange={this.textUpdate} />
            <button id="send" onClick={this.send}>Send</button>
          </form>
        </div>
      </div>)
  }
}

export default Chat;
