import React from 'react';
import ConnectionStatus from './ConnectionStatus';
import OTSubscriberWrapper from './OTSubscriberWrapper';
import OTPublisher from './OTPublisher';
import OTSession from './OTSession';
import OTStreams from './OTStreams';
import preloadScript from './preloadScript';
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
        'width': "400px",
        'height': "500px"
    }

    render() {
        return (
            <div>
                <OTSession
                        apiKey={this.state.api_key}
                        sessionId={this.props.channel === "Family Medicine" ? this.state.session_id[0] : this.state.session_id[1]}
                        token={this.props.channel === "Family Medicine" ? this.state.token[0] : this.state.token[1]}
                        eventHandlers={this.sessionEvents}
                        onError={this.onError}
                        > 
                        <ConnectionStatus connected={this.state.connected} /> 
                        <div>
                            <div className="row">
                                <div className="col-6">
                                    <OTPublisher properties={this.style}/> 
                                </div>
                                <div className="col-6">
                                    <OTStreams>
                                        <OTSubscriberWrapper role={this.props.role} />
                                    </OTStreams>
                                </div>
                            </div>
                        </div>
                        {this.state.error ? <div id="error">{this.state.error}</div> : null}  
                </OTSession>
            </div>
        );
    }
}

export default preloadScript(VideoApp);