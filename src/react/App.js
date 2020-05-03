import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar'
import CanvasDraw from "react-canvas-draw";
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import './App.css';

import Countdown from './Countdown';
import ChatBubble from './ChatBubble';

// import { channels } from '../shared/constants';
const { ipcRenderer } = window;

const COUNTDOWN_DURATION = 20;
const sketches = ['KEDİ', 'KÖPEK', 'ARABA', 'TREN', 'GEMİ', 'BİSİKLET', 'ÖRÜMCEK', 'ELMA', 'TAVŞAN', 'MAYMUN', 'EV', 'UYKU TULUMU', 'ROKET', 'YILAN', 'ZÜRAFA', 'BARDAK', 'KALEM', 'KİTAP', 'ANANAS', 'KAPLAN', 'TELEVİZYON', 'SANDALYE', 'CEKET', 'LAMBA', 'BİLGİSAYAR', 'SAAT'];
const randomSketch = sketches[Math.floor(Math.random()*sketches.length)];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      appName: '',
      appVersion: '',
      height: 512,
      width: 512,
      messages: 
        [{
          "type": 0, // receiver
          "text": "Hadi çizmeye başla!"
        }]
    };

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

    // ipcRenderer.send(channels.APP_INFO);
    // ipcRenderer.on(channels.APP_INFO, (event, arg) => {
    //   ipcRenderer.removeAllListeners(channels.APP_INFO);
    //   const { appName, appVersion } = arg;
    //   this.setState({ appName, appVersion });
    // });
  } 

  handleClick(event){
    switch(event.which) {
      case 1: {
        console.log('Left Mouse button pressed.');

        this.setState({
          messages: 
          [{
            "type": 0, // receiver
            "text": " ... "
          }]
        });
        setTimeout(() => {  
          this.setState({
            messages: 
            [{
              "type": 0, // receiver
              "text": sketches[Math.floor(Math.random()*sketches.length)] + " görüyorum"
            }]
          });
        }, 400);
        break;
      }
      case 2: {
        console.log('Middle Mouse button pressed.');
        break;
      }
      case 3: {
        console.log('Right Mouse button pressed.');
        break;
      }
      default: {
        console.log('You have a strange Mouse!');
      }
    }
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions.bind(this));

    // setting up an event listener to read data that background process
    // will send via the main process after processing the data we
    // send from visiable renderer process
    ipcRenderer.on('MESSAGE_FROM_BACKGROUND_VIA_MAIN', (event, args) => {  
      console.log(args.message);   
    });

    // trigger event to start background process
    // can be triggered pretty much from anywhere after
    // you have set up a listener to get the information
    // back from background process, as I have done in line 13
    console.log('ipcRenderer send', ipcRenderer)
    ipcRenderer.send('START_BACKGROUND_VIA_MAIN', {
      number: 25,
    });

  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions.bind(this));
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight - 160 });
  }

  render() {
    return (
      <div>
        <div>
          <AppBar position="static">
            <Grid container>
              <Grid item xs={5}>
                <Toolbar>
                      <IconButton edge="start" color="inherit" aria-label="menu">
                        <MenuIcon />
                      </IconButton>
                      <Typography variant="h6">
                        <i>{randomSketch}</i> çizer misin?
                      </Typography>
                </Toolbar>
              </Grid>
              <Grid item xs={2}>
                <Countdown saniye={COUNTDOWN_DURATION}/>
              </Grid>
              <Grid item xs={5}>
              </Grid>               
            </Grid>
          </AppBar>
        </div>
        <div 
          onClick={(e) =>{this.handleClick(e.nativeEvent)}}
          onContextMenu={(e) =>
            {this.handleClick(e.nativeEvent)}}>
          <CanvasDraw
            brushRadius={5}
            lazyRadius={0}
            canvasWidth={this.state.width}
            canvasHeight={this.state.height}
          />
        </div>
        <ChatBubble messages = {this.state.messages} />
      </div>
    );
  }
}

export default App;
