import React, { Component } from 'react';

class RecogUI extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {Object.entries(this.props.people).map(([key, value]) => {
                    return (
                        <div>
                            <b>{key}:</b>
                            {Object.entries(this.props.people[key]).map(([innerKey, innerValue]) => {
                                return <li>
                                    <b>{innerKey}: </b> {innerValue}
                                </li>
                            })}   
                        </div>
                    )
                })}
            </div>
        );
    }
}

export default RecogUI;