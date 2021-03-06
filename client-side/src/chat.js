import React from 'react';
import './App.css';
import socketIOClient from "socket.io-client";
import Highlighter from "react-highlight-words";
// import { throws } from 'assert';
// RCE CSS
import 'react-chat-elements/dist/main.css';
// MessageBox component
import { MessageBox } from 'react-chat-elements';
import { SystemMessage } from 'react-chat-elements'
import { FaMicrophone } from 'react-icons/fa';
import { FaMicrophoneSlash } from 'react-icons/fa';
import { FaPhone } from 'react-icons/fa'
import { FaPhoneSlash } from 'react-icons/fa'
import { FaExclamationCircle } from 'react-icons/fa'
import axios from 'axios';

let moment = require('moment');
var sdk = require("microsoft-cognitiveservices-speech-sdk");
class Chat extends React.Component {
  
  constructor() {
    super();
    this.state = {
      name: "Family Medicine",
      channel: "",
      recognizer: null,
      text: "",
      stopped: true,
      response: 0,
      endpoint: "https://mysterious-savannah-03972.herokuapp.com/",
      socket: null,
      messages: [],
      endSession: false,
      summary: null,
      sentiment: null,
      microphoneState: true
    }

    this.endChat = this.endChat.bind(this);
  }

  componentDidMount() {
    const {endpoint} = this.state;
    let socket = socketIOClient(endpoint);
    this.setState({socket: socket});
    socket.on('textMessage', (msg) => {

      // alert(msg.channel);
      if (msg.channel === this.state.channel) {
        let temp = this.state.messages;
        let entry = { "id": temp.length + 1, "language": "en", "source": "received", "text": msg.text,  "time": moment().format('LT') };
        let dataToAnalyze = { "id": 1, "language": "en", "text": msg.text};
        this.analyzeSentiment(dataToAnalyze);
        temp.push(entry)
        this.setState({messages: temp})
      }

      else if (msg.channel === "emergency") {
        let temp = this.state.messages;
        let entry = { "id": temp.length + 1, "language": "en", "source": "received", "text": msg.text,  "time": moment().format('LT') };
        let dataToAnalyze = { "id": 1, "language": "en", "text": msg.text};
        this.analyzeSentiment(dataToAnalyze);
        temp.push(entry)
        this.setState({messages: temp})
      }
      

    });
  }

  textUpdate = (e) => {
    this.setState({
      text: e.target.value
    });
  }

  nameUpdate = (e) => {
    this.setState({
      name: e.target.value
    }, () => {console.log(this.state.name)});
  }

  analyzeSentiment(data) {
    var url = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.1/sentiment';
    var encoded = {
      documents: data,
    }

    axios.post(url, encoded, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': '4685b5d936f94879b6910e941f54a36a'
      }
    }).then((response) => {
      this.setState({ sentiment: response.data.documents });

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

    this.props.startMethod();
     
    recognizer.recognized = this.recognized
    this.setState({
      recognizer: recognizer,
      stopped: false
    });
    recognizer.startContinuousRecognitionAsync(); 
  }

  recognized = (s,e) => {
    if (this.state.microphoneState) {
      let str = e.result.text.trim();
      if (str !== "") {
        let temp = this.state.messages;
        let entry = {"id": temp.length + 1, "language": "en", "source": "sent", "text": str,  "time": moment().format('LT') };
        temp.push(entry)
        this.setState({messages: temp})
        let message  = {
          text: str,
          channel: this.state.channel,
        }
        this.state.socket.emit('clientMessage', message);
        console.log(str);
      }
    }
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
      let message  = {
        text: this.state.text,
        channel: this.state.channel,
      }
      this.state.socket.emit('clientMessage', message);
    }
  }

  enterCheck = (e) => {
    if (e.key === 'Enter') {
      if (this.state.text.trim() !== ""){
        let temp = this.state.messages;
        let entry = {"id": temp.length + 1, "language": "en", "source": "sent", "text": this.state.text, "time": moment().format('LT')};
        temp.push(entry)
        this.setState({messages: temp, text:""})
        let message  = {
          text: this.state.text,
          channel: this.state.channel,
        }
        this.state.socket.emit('clientMessage', message);
      }
    }
  }
  calcAverage(sentiment){
    if (sentiment && sentiment.length){
      let sumSentiment  = sentiment.reduce(function(a, b) { return a + b; });
      let avgSentiment = sumSentiment / sentiment.length;
    }
  }
  endChat(){
    this.props.stopMethod();
    this.state.recognizer.stopContinuousRecognitionAsync();
    this.setState({
      stopped: true
    });
    axios.all([
      axios({
        method: "POST",
        url: "https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.1/keyPhrases",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Ocp-Apim-Subscription-Key': '4685b5d936f94879b6910e941f54a36a',
        },
        data: {documents: this.state.messages},
      }),
      axios({
        method: "POST",
        url: "https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.1/sentiment",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Ocp-Apim-Subscription-Key': '4685b5d936f94879b6910e941f54a36a',
        },
        data: {documents: this.state.messages},
      })
    ]).then(axios.spread((keyPhrasesRes, sentimentRes) => {
        let temp = keyPhrasesRes.data.documents;
        console.log("DATA: " + temp);
        let summarized = [];
        temp.forEach( entry => {
          entry = entry.keyPhrases;
          if (typeof(entry) == 'string'){
            entry = [entry]
          }
          summarized.push(entry);
        });
        console.log("summary: " + summarized)

        let temp2 = sentimentRes.data.documents;
        let sentiments = [];
        temp2.forEach( entry => {
          entry = entry.score;
          sentiments.push(entry);
        });

        this.setState({summary: summarized});
        this.setState({sentiment: sentiments});
        
    })).catch((err) => {
      this.setState({summary:['none']});
      this.setState({sentiment:['none']});
      console.log(err);
    });
  }

  back = (e) => {
    this.props.setChannel("");
    this.setState({channel: ""})
  }

  microphoneState = (e) => {
    let state = !this.state.microphoneState;
    this.setState({
      microphoneState: state
    })
  }

  render() {
    return (
      this.state.channel === "" ? (
        <div style={{margin:"30px"}}>
            <div align="center" style={{"justifyContent": "center", "alignItems": "center"}}>
            <h1 className="display-4 center">Please select a Medical Service Channel to get started.</h1>
            <small>Channel selection will automatically match you with health care professionals specializing in that dedicated area.</small>
            <br/>
            <div style={{marginTop: "15px"}}>
              <div className="form-group">
                <select className="form-control" value={this.state.name} onChange={this.nameUpdate}>
                  <option>Family Medicine</option>
                  <option>Physiotherapy</option>
                  <option>Psychology</option>
                  <option>Dermatology</option>
                  <option>Allergy and Immunology</option>
                </select>
              </div>
              <br/>
              <button className="btn btn-primary" onClick={ () => {this.props.setChannel(this.state.name); this.setState({channel: this.state.name})}}>Submit</button>
            </div>
           
          </div>       
        </div>
          
      ) : (
      <div>     
        {this.state.summary != null && this.state.sentiment != null ? (
          <div className="row">
            <div className="col">
            <h1>Medical Dialogue Summary:</h1>
              {this.state.messages.map((x, index) => {
                return (x.source === "received" ? 
                <div>
                <Highlighter
                  highlightClassName="none"
                  searchWords={this.state.summary[index] ? this.state.summary[index] : [""]}
                  autoEscape={true}
                  textToHighlight={"Other: " + x.text}/>
                  <br />
                </div>  :
                <div>
                <Highlighter
                  highlightClassName="none"
                  searchWords={this.state.summary[index] ? this.state.summary[index] : [""]}
                  autoEscape={true}
                  textToHighlight={"You: " + x.text}/>
                  <br />
                </div>)
              })}
            <ul>
            </ul>
            </div>
            <div className="col">
              <button className="btn btn-lg btn-primary" onClick={()=>{this.setState({summary: null, sentiment: null, messages: [], microphoneState: true}); this.back()}}>Start a new session</button>
            </div>
          </div>
        ) : 
        <div>
          <div className="chat">
              <div className="container">
                <div className="row">
                  <button className="btn btn-primary" onClick={this.back} disabled={!this.state.stopped}>Back</button>
                  <h1 style={{"marginLeft": '1rem'}}>{this.state.channel} Channel</h1>
                </div>
              </div>
              <div className="msgs">
                <ul id="messages">
                    {this.state.stopped ? <h4 style={{textAlign: "right"}}>Start a conversation with a doctor to begin!</h4> : <div>
                    {this.state.messages.map((msg, index) => {
                      return (
                          msg['source'] === "received" ? 
                              <span>
                                  {msg['text'] === "An anonymous emergency contact has been submitted." ?
                                  ( 
                                    <SystemMessage
                                      text={msg['text']}
                                    />
                                    ): (  <MessageBox
                                    position={'left'}
                                    type={'text'}
                                    text={msg['source'] + " : " + msg['text']}
                                    dateString={
                                        msg['time']
                                    }
                                />)}
                                
                              </span>
                           
                                  :
                            
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
                    </div>}
                </ul>
              </div>
              <div className="input-group mb-3 input">
              <div className="input-group-append">
                  <button id="send" disabled={this.state.stopped} type="button" className="btn btn-secondary" onClick={this.microphoneState}>{this.state.microphoneState !== true ? <FaMicrophone /> : <FaMicrophoneSlash />}</button>
                </div>
                <input type="text" disabled={this.state.stopped} id="msg" className="form-control" style={{"textAlign": "right"}} value={this.state.text} onChange={this.textUpdate} onKeyPress={this.enterCheck}/>
                <div className="input-group-append">
                  <button id="send" type="button" className="btn btn-secondary" onClick={this.send}>Send</button>
                </div>
              </div>
          </div>
          <div style={{"textAlign": "right"}}>
            <button className="btn btn-primary btn-lg btn-danger button-left-space" onClick={ () => {
               let message  = {
                text: "An anonymous emergency contact has been submitted.",
                channel: "emergency",
              }
              this.state.socket.emit('clientMessage', message);
              alert("you have submitted an emergency alert");
            }}><h2><FaExclamationCircle/></h2></button>
            <button className="btn btn-primary btn-lg button-left-space" disabled={this.state.stopped} onClick={ () => {this.endChat();}}><h2><FaPhoneSlash /></h2></button>
            <button id="startRecognizeOnceAsyncButton" className="btn btn-primary btn-lg btn-success button-left-space" onClick={this.record} disabled={!this.state.stopped}><h2><FaPhone/></h2></button>
          </div>
        </div>}
    </div> ))
  }
}

export default Chat;
