import React from 'react';
import Chat from './chat.js';
import { preloadScript } from 'opentok-react-data-clone';
import VideoApp from './TokBox-Components/VideoApp';

class App extends React.Component {
  
  render(){
    return(
      <div>
        <Chat/>
        <VideoApp 
          api_key={this.props.apiKey}
          session_id={this.props.sessionId}
          token={this.props.token}
        />
      </div>
    );
  }
}

export default preloadScript(App);
