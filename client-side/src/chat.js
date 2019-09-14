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
      let dataToAnalyze = { "id": 1, "language": "en", "text": msg };
      this.analyzeSentiment(dataToAnalyze);

      temp.push(entry)
      this.setState({messages: temp})
    });
  }

  textUpdate = (e) => {
    this.setState({
      text: e.target.value
    });
  }

  analyzeSentiment(data) {
    var url = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.1/sentiment';
    var encoded = {
      documents: [data],
    }

    axios.post(url, encoded, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': '4685b5d936f94879b6910e941f54a36a'
      }
    }).then((response) => {
      var res = response.data.documents[0];
      console.log("Sentiment score: " + res.score);
    }).catch((error) => {
      console.log(error);
    })
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
      let dataToAnalyze = { "id": 1, "language": "en", "text": str };
      this.analyzeSentiment(dataToAnalyze);

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
      let dataToAnalyze = { "id": 1, "language": "en", "text": this.state.text };
      this.analyzeSentiment(dataToAnalyze);

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
                        //  text={msg['source'] + " : " + msg['text']}
                          text={msg['text']} // get rid of sent and receive
                          dateString={
                              msg['time']
                          }
                      />
                          :
                      // <li>{msg['source']+" : "+msg['text']} </li>
                      <MessageBox
                          position={'right'}
                          type={'text'}
                      //    text={msg['source'] + " : " +msg['text']}
                          text={msg['text']}// get rid of sent and receive
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

//           <button onClick={ () => {
//             axios({
//                 method: 'post',
//                 url: '/endSession',
//                 data: {
//                     documents: this.state.messages,
//                 }
//             }).then( (res) => {
//                 //map the data
//                 let temp = res.data.documents;
//                 let result = "";
//                 temp.map((entry,index) => {
//                     result += entry.keyPhrases;
//                 })
//                 alert(result);

//             }).catch( (err) => {
//                 console.log('An error occured');
//             })
//         }}>end session</button>
        </div>
      </div>)

  }
}

export default Chat;
