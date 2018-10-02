let targetDevice = null;

let ledMatrixStateCharacteristic = null;

// ACCELEROMETER
const ACCEL_SRV = 'E95D0753-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const ACCEL_DATA = 'E95DCA4B-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const ACCEL_PERIOD = 'E95DFB24-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// MAGNETIC SENSOR
const MAGNETO_SRV = 'E95DF2D8-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const MAGNETO_DATA = 'E95DFB11-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const MAGNETO_PERIOD = 'E95D386C-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const MAGNETO_BEARING = 'E95D9715-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// BUTTONS
const BTN_SRV = 'E95D9882-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const BTN_A_STATE = 'E95DDA90-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const BTN_B_STATE = 'E95DDA91-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// IO PINS
const IO_PIN_SRV = 'E95D127B-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const IO_PIN_DATA = 'E95D8D00-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const IO_AD_CONFIG = 'E95D5899-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const IO_PIN_CONFIG = 'E95DB9FE-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const IO_PIN_PWM = 'E95DD822-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// LEDS
const LED_SRV = 'E95DD91D-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_STATE = 'E95D7B77-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_TEXT = 'E95D93EE-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_SCROLL = 'E95D0D2D-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

// TEMPERATURE SENSOR
const TEMP_SRV = 'E95D6100-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const TEMP_DATA = 'E95D9250-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const TEMP_PERIOD = 'E95D1B25-251D-470A-A062-FA1922DFA9A8'.toLowerCase();


const services = [ACCEL_SRV, BTN_SRV, LED_SRV, TEMP_SRV];

/*
BLE_NOTIFICATION_UUID = '00002902-0000-1000-8000-00805f9b34fb';
*/

const LED_MATRIX_STATE = "e95d7b77-251d-470a-a062-fa1922dfa9a8";

function onClickStartButton() {
  console.log('onClickStartButton');
  
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported.")
    return;
  }

  requestDevice();
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

//step1
function requestDevice() {
  console.log('request device');
  navigator.bluetooth.requestDevice({
    filters: [
    { services: services },
    { namePrefix: "BBC micro:bit" }
    ],
    optionalServices: services
  })
    .then(device => {
    targetDevice = device;
    connect(targetDevice);
    })
    .catch(error => {
    console.log('error in request device');
    showModal(error);
    targetDevice = null;
    });
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

//step2
function connect(device) {
  console.log('connect');
  device.gatt.connect()
  .then(server => {
    console.log('Getting LED service...');
    findLedService(server);
    })
  .catch(error => {
    showModal(error);
    });
  }
      
//step3
function findLedService(server) {
  console.log('find LED service');  
  server.getPrimaryService(LED_SERVICE)
    .then(service => {
      findLedMatrixStateCharacteristic(service);
    })
    .catch(error => {
      showModal(error);
    });
}

//step4
function findLedMatrixStateCharacteristic(service) {
  console.log('find LED Matrix State Characteristic');
  service.getCharacteristic(LED_MATRIX_STATE)
  .then(characteristic => {
    ledMatrixStateCharacteristic = characteristic;
    ledMatrixStateCharacteristic.writeValue(new Uint8Array(5))
  .catch(error => {
    showModal(error);
    });
  })
  .catch(error => {
    showModal('LED Matrix State characteristic not found.');
  });
}


function showModal(message) {
  document.getElementsByName("modal-message")[0].innerHTML = message;
  $("#myModal").modal("show");
}
