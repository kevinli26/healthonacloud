import React from 'react';
import Chat from './chat.js';
import preloadScript from './TokBox-Components/preloadScript';
import VideoApp from './TokBox-Components/VideoApp';
import Modal from 'react-modal';
import { runInThisContext } from 'vm';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      started: false,
      channel: "",
      modalIsOpen: true,
      un: "",
      pw: "",
      error: "",
      role: null
    }
    this.setChannel = this.setChannel.bind(this);
    this.startSession = this.startSession.bind(this);
    this.stopSession = this.stopSession.bind(this);
  }

  setChannel(chan) {
    console.log("Setting channel to " + chan);
    this.setState({channel: chan})
  }

  startSession() {
    console.log("Session Started!");
    this.setState({ started: true });
  }

  stopSession() {
    console.log("Session Ended!")
    this.setState({ started: false });
  }

  openModal = (e) => {
    this.setState({modalIsOpen: true});
  }
 
  closeModal = (e) => {
    this.setState({modalIsOpen: false});
  }

  login = (e) => {
    if (this.state.un === "franwu@gmail.com" && this.state.pw === "password"){
      this.setState({role: "patient", modalIsOpen: false});
    } else if (this.state.un === "kevli@gmail.com" && this.state.pw === "password"){
      this.setState({role: "patient", modalIsOpen: false});
    } else if (this.state.un === "billliu@gmail.com" && this.state.pw === "password"){
      this.setState({role: "doctor", modalIsOpen: false});
    } else if (this.state.un === "mtan@gmail.com" && this.state.pw === "password"){
      this.setState({role: "doctor", modalIsOpen: false});
    } else {
      this.setState({error: "Wrong username or password."});
    }
  }
  
  customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  };

  render(){
    return(
      <div className="container">
        {/* <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={this.customStyles}
          contentLabel="Log in Modal"
          shouldCloseOnOverlayClick={false}
        >
          <div className='row'>
            <label className="col-3">Username:</label>
            <input className="col-9" value={this.state.un} onChange={(e) => {this.setState({un: e.target.value})}}></input>
          </div>
          <div className='row'>
            <label className="col-3">Password:</label>
            <input className="col-9" type="password" value={this.state.pw} onChange={(e) => {this.setState({pw: e.target.value})}}></input>
          </div>
          <br />
          <p>{this.state.error}</p>
          <button className="btn btn-secondary" onClick={this.login}>Log In</button>
        </Modal> */}
        <div className="row">
          <div className="col" >
            <Chat
              setChannel={this.setChannel}
              startMethod={this.startSession}
              stopMethod={this.stopSession}
            />
          </div>

            {this.state.channel !== "" ?
            <div className="col">
              {this.state.started ? 
              <VideoApp 
                channel={this.state.channel}
                api_key={this.props.apiKey}
                session_id={this.props.sessionId}
                token={this.props.token}
              /> : null }
            </div>: null}
        </div>
      </div>
    );
  }
}

export default preloadScript(App);
