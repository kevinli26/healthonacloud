import React from 'react';
import OTSubscriber from './OTSubscriber';
import '../App.css';

class Subscriber extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            audio: true,
            video: true,
        };        
    }

    setAudio = (audio) => {
        this.setState({ audio });
    }
    setVideo = (video) => {
        this.setState({ video });
    }
    onError = (err) => {
        this.setState({ error: `Failed to subscribe: ${err.message}` });
    }

    render() {
        return (
            <div className="subscriber">
                {this.state.error ? <div id="error">{this.state.error}</div> : null}

                <OTSubscriber
                    properties={{
                        subscribeToAudio: this.state.audio,
                        subscribeToVideo: this.state.video,
                        height: "500px",
                        width: "400px",
                        role: this.props.role
                    }}
                    onError={this.onError}
                />
            </div>
        );
    }
}
export default Subscriber;