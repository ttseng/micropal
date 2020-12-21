'use strict';

let motorCount = 2;

// default empty display to show for new led matrixes
let defaultDisplay = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0]
];

// the form created for every label in the moel
class EventForm extends React.Component {
  constructor(props) {
    super(props);
    this.saveFunction = this.saveFunction.bind(this);
    this.state = {
      servoSequence: [],
      display: [JSON.parse(JSON.stringify(defaultDisplay))],
      timeDelay: 250,
    }
    this.setServoSequence = this.setServoSequence.bind(this);
    this.addServoSequence = this.addServoSequence.bind(this);
    this.setDisplay = this.setDisplay.bind(this);
    this.testBtnOnClick = this.testBtnOnClick.bind(this);
    this.setTiming = this.setTiming.bind(this);
    this.addDisplayItem = this.addDisplayItem.bind(this);
    this.removeDisplayItem = this.removeDisplayItem.bind(this);
  }

  setDisplay(displayIndex, row, index, value) {
    let newDisplay = [...this.state.display];
    newDisplay[displayIndex][row][index] = value;
    this.setState({
      display: newDisplay
    });
  }

  addServoSequence(e) {
    // TODO
  }

  setServoSequence(e) {
    console.log('set servo sequence with e ', e.target);
    if (e.target) {
      this.setState({ servoSequence: e.target.value });
    }
  }

  setTiming(e) {
    this.setState({ timeDelay: e.target.value });
  }

  addDisplayItem(e) {
    e.preventDefault();
    let newDisplay = [...this.state.display];
    newDisplay.push(JSON.parse(JSON.stringify(defaultDisplay)));
    this.setState({
      display: newDisplay
    });
  }

  removeDisplayItem(e) {
    e.preventDefault();
    let indexToRemove = parseInt(e.target.getAttribute('index'));
    let newDisplay = [...this.state.display];
    // console.log('newDisplay before: ', [...newDisplay]);
    // console.log('indexToRemove: ', indexToRemove);
    newDisplay.splice(indexToRemove, 1);
    // console.log('newDisplay after: ', [...newDisplay]);
    this.setState({
      display: newDisplay
    });
  }

  testBtnOnClick(e) {
    e.preventDefault();
    if (paired) {
      let fn =
        ` servoSequence([${this.state.servoSequence}], ${this.state.timeDelay});
        writeDisplay(${JSON.stringify(this.state.display)}, ${this.state.timeDelay});
      `;
      // console.log('fn: ', fn);
      try {
        eval(fn);
      } catch (error) {
        console.error(error);
      }
    } else {
      alert('Please pair your Microbit first!');
    }
  }

  saveFunction(e) {
    e.preventDefault();
    let fnName = `got${formatLabel(this.props.label)}`;

    let newFunction =
      `servoSequence([${this.state.servoSequence}], ${this.state.timeDelay});
       writeDisplay(${JSON.stringify(this.state.display)}, ${this.state.timeDelay});
      `;

    predictFns[fnName] = new Function([], newFunction);
  }

  render() {
    return (
      <form>
        <div className="header">
          {this.props.label != 'test' ?
            <label>When I receive <span className="ml-label">{this.props.label}</span></label>
            : <label>Test your Microbit here!</label>
          }
          {this.props.label != 'test' && <button onClick={this.saveFunction} className="save-btn secondary">save</button>}

        </div>
        <div className="params">
          <div className="display-item-container">
            {
              this.state.display.map((item, index) => (
                <DisplayItem key={index} index={index} setDisplay={this.setDisplay} display={this.state.display[index]}
                  removeDisplay={this.removeDisplayItem}></DisplayItem>
              ))
            }
            <button className="add-led-btn" onClick={this.addDisplayItem}>+</button>
          </div>
          <div className="servo-ite-container">
            <ServoItem onChange={this.setServoSequence} value={this.state.servoSequence}></ServoItem>
            <button className="add-servo-sequence-btn" onClick={this.addServoSequence}>+</button>
          </div>
          <TimingItem onChange={this.setTiming} value={this.state.timeDelay}></TimingItem>
          <TestBtn onClick={this.testBtnOnClick}></TestBtn>
        </div>
      </form>
    );
  }
}

// control the servo with input syntax [motor1_angle, motor2_angle], ...
class ServoItem extends React.Component {
  constructor(props) {
    super(props);
    this.onUpdate = this.onUpdate.bind(this);
  }

  onUpdate(e) {
    console.log(e);
    this.props.onChange(e.target.value);
  }

  render() {
    let contents = [];
    for (let i = 0; i < motorCount; i++) {
      contents.push(
        <div className="servo-item item" key={i}>
          <div>
            <label>Servo {i + 1}:</label>
          </div>
          <input type="text"
            value={this.props.value}
            onChange={this.onUpdate}
            className="servo-input"
            placeholder="90"
            name="servo-input"
          />  <label>°</label>
          <div className="angle-input-item"></div>
        </div>
      );
    }

    return (
      <div className="servo-container">
        {contents}
      </div>
    );
  }
}

// the entire display item
class DisplayItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let matrix = [];
    for (let i = 0; i < 5; i++) {
      for (let k = 0; k < 5; k++) {
        matrix.push(
          <Led key={`${this.props.index}-${i}-${k}`}
            index={`${this.props.index}-${i}-${k}`}
            onChange={this.props.setDisplay}
            value={this.props.display[i][k]} />
        )
      }
    }

    return (
      <div className="item">
        <label className="display-label">LED Display: </label>
        <div className="display-input">
          {matrix}
        </div>
        {this.props.index !== 0 &&
          <button className="delete-display-btn secondary" index={this.props.index} onClick={this.props.removeDisplay}>x</button>
        }
      </div>
    );
  }
}

// individual LED pixels in the display array
class Led extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(e) {
    let displayIndex = this.props.index.split('-')[0]
    let row = this.props.index.split('-')[1];
    let column = this.props.index.split('-')[2];
    let value = !this.props.value ? 1 : 0;
    this.props.onChange(displayIndex, row, column, value);
  }

  render() {
    return (
      <input type="checkbox" className="checkbox"
        checked={this.props.value}
        onChange={this.handleClick}
        index={this.props.index} />
    )
  }
}

// adjust timing in milliseconds between sequences
class TimingItem extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="item">
        <label>Time Delay (ms): </label>
        <input type="text"
          value={this.props.value}
          onChange={this.props.onChange}
          placeholder="250"
        />
      </div>
    )
  }
}

// test display, servo, and timing live
class TestBtn extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <button className="test-btn secondary" onClick={this.props.onClick}>
        test
      </button>
    )
  }
}