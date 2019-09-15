import React, { Component } from 'react';
import { Button, Card, Image } from 'semantic-ui-react';
import Editable from "react-editable-title";
import './Styles.css';

class RecogUI extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "Patient",
            imgData: "data:image/png;base64," + this.props.person.imgData,
            left: this.props.person.left,
            top: this.props.person.top,
            height: this.props.person.height,
            width: this.props.person.width,
        }
    }

    handleTitleChange = (data) => {
        this.setState({
            title: data
        });
    }

    render() {
        return (
            <div className="Card">
                <Card>
                    <Card.Content>
                    <Image
                        floated='right'
                        size='mini'
                        src={this.state.imgData}
                    />
                        <Card.Header>
                            <Editable
                                editControls
                                contentRefs={this.handleTitleChange.bind(this)}
                                name="Patient"
                            />
                        </Card.Header>
                        <Card.Meta>Blur: {this.props.person.blur}, Noise: {this.props.person.noise}</Card.Meta>
                        <Card.Description>{this.state.title} is a {this.props.person.age} year old {this.props.person.gender}, and is feeling {this.props.person.emotion}.</Card.Description>
                    </Card.Content>
                </Card>
            </div>
        );
    }
}

export default RecogUI;