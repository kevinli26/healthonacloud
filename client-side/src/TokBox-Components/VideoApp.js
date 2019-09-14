import React from 'react';
import ConnectionStatus from './ConnectionStatus';
import OTSubscriberWrapper from './OTSubscriberWrapper';
import { OTPublisher, OTSession, OTStreams, preloadScript } from 'opentok-react-data-clone';
import '../App.css';

class VideoApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            connected: false,
            api_key: props.api_key,
            session_id: props.session_id,
            token: props.token,
        };

        this.setAPIKey = this.setAPIKey.bind(this);
        this.setSessionId = this.setSessionId.bind(this);
        this.setToken = this.setToken.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.sessionEvents = {

            sessionConnected: () => {
                this.setState({
                    connected: true
                });
            },
            sessionDisconnected: () => {
                this.setState({
                    connected: false
                });
            }
      
         };
    }

    onError = (err) => {
        this.setState({
            error: `Failed to connect: ${err.message}`
        });
    }

    setAPIKey = (event) => {
        this.setState({ api_key: event.target.value });
    }

    setSessionId = (event) => {
        this.setState({ session_id: event.target.value });
    }

    setToken = (event) => {
        this.setState({ token: event.target.value });
    }

    handleSubmit = (event) => {
        console.log("Submitting keys!");
        this.setState({ connected: true })
        event.preventDefault();
    }

    render() {
        return (
            <view>
                {this.state.connected && this.state.api_key && this.state.session_id && this.state.token? 
                    <OTSession
                        apiKey={this.state.api_key}
                        sessionId={this.state.session_id}
                        token={this.state.token}
                        eventHandlers={this.sessionEvents}
                        onError={this.onError}
                        >
            
                        {this.state.error ? <div id="error">{this.state.error}</div> : null}
            
                        <ConnectionStatus connected={this.state.connected} />    

                        <OTPublisher />    
            
                        <OTStreams>
                            <OTSubscriberWrapper />
                        </OTStreams>

                    </OTSession>
                    : <form className="subscriber-form" onSubmit={this.handleSubmit}>
                    <h1>TokBox React Demo</h1>
                    <ul>
                        <li>
                            <label for="api_key">API Key</label>
                            <input name="api_key" type="text" value={this.state.api_key} onChange={this.setAPIKey} />
                            <span>Enter a valid TokBox API Key</span>
                        </li>
                        <li>
                            <label for="session_Id">Session ID</label>
                            <input name="session_Id" type="text" value={this.state.session_id} onChange={this.setSessionId} />
                            <span>Enter a valid Session ID for your TokBox Session</span>
                        </li>
                        <li>
                            <label for="token">Token</label>
                            <input name="token" type="text" value={this.state.token} onChange={this.setToken} />
                            <span>Enter a valid Token for your TokBox Session</span>
                        </li>
                        <li>
                            <input type="submit" value="submit" />
                        </li>
                    </ul>
                 </form>}
            </view>
        );
    }
}

export default preloadScript(VideoApp);