import React from 'react';
import Chat from './chat.js';
import preloadScript from './TokBox-Components/preloadScript';
import VideoApp from './TokBox-Components/VideoApp';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      started: false,
      channel: ""
    }
    this.setChannel = this.setChannel.bind(this);
    this.startSession = this.startSession.bind(this);
    this.stopSession = this.stopSession.bind(this);
  }

  setChannel(chan) {
    console.log("Setting channel to " + chan);
    this.setState({channel: chan})
  }

  startSession() {
    console.log("Session Started!");
    this.setState({ started: true });
  }

  stopSession() {
    console.log("Session Ended!")
    this.setState({ started: false });
  }
  
  render(){
    return(
      <div className="container">
        <div className="row">
          <div className="col" >
            <Chat
              setChannel={this.setChannel}
              startMethod={this.startSession}
              stopMethod={this.stopSession}
            />
          </div>

            {this.state.channel !== "" ?
            <div className="col">
              {this.state.started ? 
              <VideoApp 
                api_key={this.props.apiKey}
                session_id={this.props.sessionId}
                token={this.props.token}
              /> : null }
            </div>: null}
        </div>
      </div>
    );
  }
}

export default preloadScript(App);
