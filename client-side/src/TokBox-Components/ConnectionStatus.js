import React from 'react';

class ConnectionStatus extends React.Component {
    render() {
        let status = this.props.connected ? 'Connected' : 'Disconnected';
        return (
            <div className="ConnectionStatus">
                <strong>Status:</strong> {status}
            </div>
        );
    }
}

export default ConnectionStatus;