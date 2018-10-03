let targetDevice = null;
let ledMatrixStateCharacteristic = null;
let microbitServer = null;

// ACCELEROMETER
const ACCEL_SERVICE = 'E95D0753-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const ACCEL_DATA = 'E95DCA4B-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const ACCEL_PERIOD = 'E95DFB24-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// MAGNETIC SENSOR
const MAGNETO_SERVICE = 'E95DF2D8-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const MAGNETO_DATA = 'E95DFB11-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const MAGNETO_PERIOD = 'E95D386C-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const MAGNETO_BEARING = 'E95D9715-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// BUTTONS
const BTN_SERVICE = 'E95D9882-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const BTN_A_STATE = 'E95DDA90-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const BTN_B_STATE = 'E95DDA91-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// IO PINS
const IO_PIN_SERVICE = 'E95D127B-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const IO_PIN_DATA = 'E95D8D00-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const IO_AD_CONFIG = 'E95D5899-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const IO_PIN_CONFIG = 'E95DB9FE-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const IO_PIN_PWM = 'E95DD822-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// LEDS
const LED_SERVICE = 'E95DD91D-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_STATE = 'E95D7B77-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_TEXT = 'E95D93EE-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_SCROLL = 'E95D0D2D-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// TEMPERATURE SENSOR
const TEMP_SERVICE = 'E95D6100-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const TEMP_DATA = 'E95D9250-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const TEMP_PERIOD = 'E95D1B25-251D-470A-A062-FA1922DFA9A8'.toLowerCase();


const services = [ACCEL_SERVICE, BTN_SERVICE, LED_SERVICE, TEMP_SERVICE];

/*
BLE_NOTIFICATION_UUID = '00002902-0000-1000-8000-00805f9b34fb';
*/

const LED_MATRIX_STATE = "e95d7b77-251d-470a-a062-fa1922dfa9a8";

async function pair() {  
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported.")
    return;
  }
  // requestDevice();
  try{
    console.log('requesting bluetooth device...');
    document.getElementById('status').innerHTML = "requesting bluetooth device...";
    const uBitDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: services
    });
    document.getElementById('status-container').style.display = 'inline';
    document.getElementById('pair-btn').style.display = 'none';
    
    console.log('connecting to GATT server...');
    document.getElementById('status').innerHTML = 'connecting to GATT server...';
    const server = await uBitDevice.gatt.connect();
    
    console.log('getting service...');
    document.getElementById('status').innerHTML = 'getting service...';
    const service = await server.getPrimaryService(LED_SERVICE);
    
    console.log('getting characteristics...');
    document.getElementById('status').innerHTML = 'getting characteristics...';
    ledMatrixStateCharacteristic = await service.getCharacteristic(LED_MATRIX_STATE);
    
    // show UI
    document.getElementById('actions').style.visibility = 'visible';
    document.getElementById('checkboxes').style.display = 'inline-block';
    
    document.getElementById('status-container').style.display = 'none';
    ledMatrixStateCharacteristic.writeValue(new Uint8Array(5));
     
    
  }catch(error){
    showModal(error);
  }
  
}

function onClickStopButton() {
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported.")
    return;
  }

  disconnect();
}

//step 5
function onChangeCheckBox() {
  if (ledMatrixStateCharacteristic == null) {
    return;
  }
  
  ledMatrixStateCharacteristic.writeValue(generateUint8Array())
    .then(test => {
      // console.log('writing new LED matrix value');
    })
    .catch(error => {
    showModal(error);
    });
}

function generateUint8Array() {
  let array = new Uint8Array(5);

  for (let row = 0; row < 5; row++) {
    let value = 0;

    for (let index = 0; index < 5; index++) {
      value *= 2;
      if (document.getElementsByName("check" + row + index)[0].checked) {
        value += 1;
      }
    }

    array[row] = value;
  }


  return array;
}

function disconnect() {
  if (targetDevice == null) {
    showModal('target device is null.');
    return;
  }

  targetDevice.gatt.disconnect();
  targetDevice = null;
  ledMatrixStateCharacteristic = null;
}



function checkBtns(){
  console.log('Getting btn service...');
  findBtnService(microbitServer);
}

function checkTmp(){
  console.log('Getting temp service...');
  findTempService(microbitServer);
}
      


function findTempService(server){
  console.log('find temp service');
  server.getPrimaryService(TEMP_SERVICE)
    .then(service => {
      service.getCharacteristic(TEMP_DATA)
        .then(characteristic => {
          let tempCharacteristic = characteristic;
          console.log(tempCharacteristic);
        })
        .catch(error => {
          showModal(error);
      });
    ;
  })
  .catch(error => {
    showModal(error)
  });
}

function findBtnService(server){
  console.log('find button service');
  server.getPrimaryService(BTN_SERVICE)
    .then(service => {
      service.getCharacteristic(BTN_A_STATE)
        .then(characteristic => {
          let btnCharacteristic = characteristic;
          console.log(btnCharacteristic);
        })
        .catch(error => {
          showModal(error);
      });
    ;
  })
  .catch(error => {
    showModal(error)
  });
}


function showModal(message) {
  document.getElementsByName("modal-message")[0].innerHTML = message;
  $("#myModal").modal("show");
}
