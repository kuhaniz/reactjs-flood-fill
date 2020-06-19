import React, { Component } from 'react';
import './App.css';

const ESCAPE_KEY = 81;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCmd: '',
      cmds: '',
      w: 0,
      h: 0,
      multiplier: 20,
      lines: [],
      rectangle: [],
      bucket: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.multiplierEffect = this.multiplierEffect.bind(this);
    this.handleQuit = this.handleQuit.bind(this);
  }

  handleQuit() {
    switch (event.keyCode) {
      case ESCAPE_KEY:
          this.setState({
              currentCmd: '',
              cmds: '',
              w: 0,
              h: 0,
              multiplier: 20,
              lines: [],
              rectangle: [],
              bucket: []
          })
          break;
      default:
          break;
      }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.handleQuit);
  }


  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleQuit);
  }

  multiplierEffect(num) {
    const { multiplier } = this.state;
    return num*multiplier;
  }

  multiplierEffectPos(num) {
    const { multiplier } = this.state;
    return num*multiplier-multiplier;
  }

  handleChange(event) {
    const commands = event.target.value;
    this.setState({currentCmd: commands, cmds: commands});
  }

  handleFill(bucket, x, y, oldChar, newChar) {
    const worldWidth = bucket.length;
    const worldHeight = bucket[0].length;
    if (oldChar === "false") {
      oldChar = bucket[x][y];
    }
    if (bucket[x][y] !== oldChar) {
      //Base case. If the current x, y character is not the oldChar,
      //then do nothing.
      return bucket;
    }
    //Change the character at world[x][y] to newChar
    bucket[x][y] = newChar;

    //Recursive calls.
    if (y < worldHeight-1) { //down
       this.handleFill(bucket, x, y+1, oldChar, newChar)
    }
    if (x < worldWidth-1) { //right
       this.handleFill(bucket, x+1, y, oldChar, newChar)
    }
    if (x > 0) { //left
       this.handleFill(bucket, x-1, y, oldChar, newChar);
    }
    if (y > 0) { //up
       this.handleFill(bucket, x, y-1, oldChar, newChar)
    }

    return bucket;
  }

  handleSubmit(event) {
    const { cmds, w, h, multiplier, lines, rectangle } = this.state;
    event.preventDefault();
    this.setState({currentCmd: ''});
    const res = cmds.trim().split(" ");
    const step = res[0].toLowerCase();
    switch(step) {
      case "c":
       const width = parseInt(this.multiplierEffect(res[1]), 10);
       const height = parseInt(this.multiplierEffect(res[2]), 10);
       this.setState({w: width, h: height});
      break;
      case "l":
        if (w === 0 || h === 0) {
          alert('Incomplete canvas. Please run create command');
          return false;
        }
        const x1 = parseInt(res[1], 10);
        const x2 = parseInt(res[3], 10);
        const y1 = parseInt(res[2], 10);
        const y2 = parseInt(res[4], 10);
        //HORIZONTAL LINE
        if (y1 === y2) {
          const arr = [];
          const max = Math.max(x1, x2);
          const min = Math.min(x1, x2);
          for (let i=min; i <= max; i++) {
            arr.push({x: i, y: y1});
          }
          this.setState({
            lines: [...this.state.lines, arr]
          })
        //VERTICAL LINE
        } else if (x1 === x2) {
          const arr = [];
          const max = Math.max(y1, y2);
          const min = Math.min(y1, y2);
          for (let i=min; i <= max; i++) {
            arr.push({x: x1, y: i});
          }
          this.setState({
            lines: [...this.state.lines, arr]
          })
        }
      break;
      case "r":
        if (w === 0 || h === 0) {
          alert('Incomplete canvas. Please run create command');
          return false;
        }
        const arr = [];
        const rx1 = parseInt(res[1], 10);
        const rx2 = parseInt(res[3], 10);
        const ry1 = parseInt(res[2], 10);
        const ry2 = parseInt(res[4], 10);

        const xmax = Math.max(rx1, rx2);
        const xmin = Math.min(rx1, rx2);
        const ymax = Math.max(ry1, ry2);
        const ymin = Math.min(ry1, ry2);
        // DRAW HORIZONTAL LINE
        for (let i=xmin; i <= xmax; i++) {
          arr.push({x: i, y: ry1});
          arr.push({x: i, y: ry2});
        }
        // DRAW VERTICAL LINE
        for (let i=ymin; i <= ymax; i++) {
          arr.push({x: rx1, y: i});
          arr.push({x: rx2, y: i});
        }
        this.setState({
          rectangle: [...this.state.rectangle, arr]
        })
      break;
      case "b":
        if (w === 0 || h === 0) {
          alert('Incomplete canvas. Please run create command');
          return false;
        }
        const bx = parseInt(res[1], 10);
        const by = parseInt(res[2], 10);
        const char = res[3];

        const gridWidth = w / multiplier;
        const gridHeight = h / multiplier;

        const wholeArray = [...Array(gridWidth)].map(elem => new Array(gridHeight).fill(0));
        lines.forEach((line, i) => {
          line.forEach((obj, j) => {
            wholeArray[obj.x-1][obj.y-1] = "x";
          });
        });
        rectangle.forEach((rect, i) => {
          rect.forEach((obj, j) => {
            wholeArray[obj.x-1][obj.y-1] = "x";
          });
        });
        const bucks = this.handleFill(wholeArray, bx, by, "false", char);
        this.setState({bucket: bucks});
      break;
      default:
        // code block
    }
    return false;
  }

  renderMap(bucket, char) {
    const { multiplier } = this.state;
    if (bucket.length > 0) {
      const arr = [];
      bucket.forEach((buck, i) => {
        buck.forEach((obj, j) => {
          if (obj === char) {
            let divStyle = {
              //background: '#000',
              //fontSize: '1px',
              width: 1*multiplier + 'px',
              height: 1*multiplier + 'px',
              position: 'absolute',
              top: this.multiplierEffectPos(j+1) + 'px',
              left: this.multiplierEffectPos(i+1) + 'px'
            };
            arr.push(<div key={`${i}-${j}`} style={divStyle}>{char}</div>);
          }
        });
      });
      return arr;
    }
  }

  renderLines(lines, char) {
    const { multiplier } = this.state;
    if (lines.length > 0) {
      const arr = [];
      lines.forEach((line, i) => {
        line.forEach((obj, j) => {
          //console.log(obj);
          let divStyle = {
            //background: '#000',
            //fontSize: '1px',
            width: 1*multiplier + 'px',
            height: 1*multiplier + 'px',
            position: 'absolute',
            top: this.multiplierEffectPos(obj.y) + 'px',
            left: this.multiplierEffectPos(obj.x) + 'px'
          };
          //console.log(divStyle);
          arr.push(<div key={`${i}-${j}`} style={divStyle}>{char}</div>);
        });
      });
      return arr;
    }
  }

  render() {
    const { w, h, multiplier, lines, rectangle, bucket } = this.state;
    const containerStyle = {
    }
    const divStyle = {
      background: '#fc0',
      width: w + 'px',
      height: h + 'px',
      position: 'relative',
    };
    return (
      <div className="App">
        <div className="input-container">
          <form onSubmit={this.handleSubmit}>
            <label>
              Enter command:
              <input type="text" value={this.state.currentCmd} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
            <p> Multiplier: {multiplier}</p>
          </form>
        </div>
        <div style={containerStyle} className="canvasContainer">
          <div style={divStyle} className="canvas">
            {this.renderLines(lines, "x")}
            {this.renderLines(rectangle, "x")}
            {this.renderMap(bucket, "o")}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
