import React, { Component } from 'react';
import RecogUI from './RecogUI';

class RecogUIWrapper extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {Object.entries(this.props.people).map(([key, value]) => {
                    return (
                        <RecogUI
                            person={value}
                        />
                    )
                })}
            </div>
        );
    }
}

export default RecogUIWrapper;