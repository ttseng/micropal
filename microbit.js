// Microbit Bluetooth documentation: https://lancaster-university.github.io/microbit-docs/resources/bluetooth/bluetooth_profile.html
// Sample: https://github.com/thegecko/microbit-web-bluetooth/blob/master/src/services/io-pin.ts

let targetDevice = null;
let ioService = null;
let pwmCharacteristic = null;
let ledService = null;
let ledCharacteristic = null;

let paired = false;
// let pinAdCharacteristic = null;

const IO_PIN_SERVICE = "E95D127B-251D-470A-A062-FA1922DFA9A8".toLowerCase();
const PWM_CHARACTERISTIC = "E95DD822-251D-470A-A062-FA1922DFA9A8".toLowerCase();

const LED_SERVICE = 'E95DD91D-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_STATE = 'E95D7B77-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
// const PIN_AD_CHARACTERISTIC = "e95d5899-251d-470a-a062-fa1922dfa9a8".toLowerCase();

const services = [IO_PIN_SERVICE, LED_SERVICE];

async function pair() {  
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported in this browser.")
    return;
  }
  
  try{
    console.log('requesting bluetooth device...');
    document.getElementById('status').innerHTML = "requesting bluetooth device...";
    const uBitDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: services
    });
    uBitDevice.addEventListener(
      "gattserverdisconnected",
      onMicrobitDisconnected
    )
    document.getElementById('status-container').style.display = 'inline';
    document.getElementById('pair-btn').style.display = 'none';
    
    console.log('connecting to GATT server...');
    document.getElementById('status').innerHTML = 'connecting to GATT server...';
    const server = await uBitDevice.gatt.connect();
    
    console.log('getting service...');
    document.getElementById('status').innerHTML = 'getting service...';
    ioService = await server.getPrimaryService(IO_PIN_SERVICE);
    ledService = await server.getPrimaryService(LED_SERVICE);
    
    console.log('getting characteristics...');
    document.getElementById('status').innerHTML = 'getting characteristics...';
    pwmCharacteristic = await ioService.getCharacteristic(PWM_CHARACTERISTIC);
    ledCharacteristic = await ledService.getCharacteristic(LED_STATE);
    
    // show UI
    document.getElementById('status-container').style.display = 'none';
    console.log('paired');
    paired = true;

    neutral();
    
  }catch(error){
    showModal(error);
  }
  
}

function goodnight(){
  servoSequence([[90, 90], [80, 100], [40, 140], [0, 180]]);
  seq1 =  [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 1, 1, 1, 0]
  ];

  seq2 = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0]
  ]

  let sequence = [seq1, seq2, seq1, seq2, seq1, seq2];
  for(let i =0; i<sequence.length; i++){
    setTimeout(() => {
      ledMatrixToView(sequence[i]);
    }, 500*i);
  }
}

function happy(){
  servoSequence([[0, 180], [90, 90], [0,180], [90, 90]]);
  ledMatrixToView([
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ]);
}

function hey(){
  servoSequence([[50, 40]]);
  ledMatrixToView([
    [0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 0, 0],
  ]);
}

function sad(){
  servoSequence([[0, 180], [30, 150], [0, 180], [30, 150], [0, 180]]);
  ledMatrixToView([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ]);
}

function neutral(){
  ledMatrixToView([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
}

function servoSequence(sequence){
  for(let i=0; i<sequence.length; i++){
    setTimeout(() => {
      setServoPosition(sequence[i]);
    }, 250*i);
  }
}

async function setServoPosition(angles){
  let pos1 = position(angles[0]);
  let pos2 = position(angles[1]);
  let val1 = new DataView(new ArrayBuffer(7));
  val1.setUint8(0, 1); // pin one
  val1.setUint16(1, pos1, true); // ranges from 250(left) to 53 (right)
  val1.setUint32(3, 10000, true); // period in microseconds

  let val2 = new DataView(new ArrayBuffer(7));
  val2.setUint8(0, 2); // pin one
  val2.setUint16(1, pos2, true); // ranges from 250(left) to 53 (right)
  val2.setUint32(3, 10000, true); // period in microseconds

  pwmCharacteristic.writeValue(val1);
  setTimeout(() => pwmCharacteristic.writeValue(val2), 100);
}

function ledMatrixToView(matrix){
  const view = new DataView(new ArrayBuffer(5));
  for (let i = 0; i < 5; i ++) {
      view.setUint8(i, this.boolArrayToByte(matrix[i]));
  }
  ledCharacteristic.writeValue(view);
}

function boolArrayToByte(bools) {
  return bools.reduce((byte, bool) => byte << 1 | (bool ? 1 : 0), 0);
}

function position(angle){
  return map(angle, 0, 180, 250, 54);
}

function map( x,  in_min,  in_max,  out_min,  out_max){
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

function showModal(message) {
  document.getElementsByName("modal-message")[0].innerHTML = message;
  $("#myModal").modal("show");
  document.getElementById('pair-btn').style.display = 'block';
}

function onMicrobitDisconnected(){
  document.getElementById('pair-btn').style.display = 'inline';
  paired = false;
}