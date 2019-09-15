import React from 'react';
import Chat from './chat.js';
import preloadScript from './TokBox-Components/preloadScript';
import VideoApp from './TokBox-Components/VideoApp';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      started: false
    }
  }

  startSession() {
    this.setState({ started: true });
  }

  stopSession() {
    this.setState({ started: false });
  }
  
  render(){
    return(
      <div className="container">
        <div className="row">
          <div className="col">
            <Chat/>
          </div>
          <div className="col">
            <VideoApp 
              api_key={this.props.apiKey}
              session_id={this.props.sessionId}
              token={this.props.token}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default preloadScript(App);
