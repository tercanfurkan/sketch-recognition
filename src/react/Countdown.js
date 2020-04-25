import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';

import './Countdown.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class Countdown extends React.Component {
	state = {
		seconds: undefined
	}
	
	componentDidMount() {
		let seconds = this.props.saniye;
		this.interval = setInterval(() => {
			if (seconds !== 0) {
				seconds--;
			}
			this.setState({ seconds });
		}, 1000);
	}

	componentWillUnmount() {
		if(this.interval) {
			clearInterval(this.interval);
		}
	}

	refreshPage() {
    window.location.reload(false);
  }
	
	render() {
		const { seconds } = this.state;
		const secondsRadius = mapNumber(seconds, this.props.saniye, 0, 0, 360);

		if(seconds === 0) {
			return (
			    <div>
			      <Dialog fullScreen open={true} TransitionComponent={Transition}>
			        <AppBar>
			          <Toolbar>
			            <Typography variant="h6">
			              Süre doldu. Tekrar denemek ister misin?
			            </Typography>
			            <Button color="inherit" id="ok-button" onClick={this.refreshPage}>
			              Tamam
			            </Button>
			          </Toolbar>
			        </AppBar>
			      </Dialog>
			    </div>
			);
		}
		
		return (
			<div>
				<div className='countdown-wrapper'>
					{seconds && (
						<div className='countdown-item'>
							<SVGCircle radius={secondsRadius} />
							{seconds} 
							<span>SN</span>
						</div>
					)}
				</div>
			</div>
		);
	}
}

const SVGCircle = ({ radius }) => (
	<svg className='countdown-svg'>
		<path fill="none" stroke="#fff" strokeWidth="4" d={describeArc(30, 30, 28, 0, radius)}/>
	</svg>
);

// From stackoverflow: https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
}

// Stackoverflow: https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
function mapNumber(number, in_min, in_max, out_min, out_max) {
  return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

export default Countdown;