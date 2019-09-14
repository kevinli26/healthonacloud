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

    style = {
        'width': "100%",
        'height': "500px"
    }

    render() {
        return (
            <div>
                <OTSession
                        apiKey={this.state.api_key}
                        sessionId={this.state.session_id}
                        token={this.state.token}
                        eventHandlers={this.sessionEvents}
                        onError={this.onError}
                        > 
                        <OTPublisher properties={this.style}/>    
                        <OTStreams>
                            <OTSubscriberWrapper />
                        </OTStreams>
                        {this.state.error ? <div id="error">{this.state.error}</div> : null}  
                        <ConnectionStatus connected={this.state.connected} /> 
                </OTSession>
            </div>
        );
    }
}

export default preloadScript(VideoApp);