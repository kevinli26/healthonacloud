import React, { Component } from 'react';
import { Button, Card, Image } from 'semantic-ui-react';

class RecogUI extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
                {Object.entries(this.props.people).map(([key, value]) => {
                    return (
                        <Card>
                            <Card.Content>
                                {key == "Bill" ? 
                                    <Image 
                                        floated='right'
                                        size='mini'
                                        src='https://i.imgur.com/G7i06Fh.jpg'
                                    />
                                : key == "Michael" ? 
                                    <Image 
                                        floated='right'
                                        size='mini'
                                        src='https://i.imgur.com/Z0UIKCp.jpg'
                                    />
                                : null}
                                <Card.Header>{key}</Card.Header>
                                <Card.Meta>Meta</Card.Meta>
                                <Card.Description>Description</Card.Description>
                            </Card.Content>
                        </Card>
                        

                        // <div>
                        //     <b>{key}:</b>
                        //     {Object.entries(this.props.people[key]).map(([innerKey, innerValue]) => {
                        //         return <li>
                        //             <b>{innerKey}: </b> {innerValue}
                        //         </li>
                        //     })}   
                        // </div>
                    )
                })}
            </div>
        );
    }
}

export default RecogUI;