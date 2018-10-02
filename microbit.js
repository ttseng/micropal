
let targetDevice = null;

let ledMatrixStateCharacteristic = null;

const LED_SERVICE = "e95dd91d-251d-470a-a062-fa1922dfa9a8";

/*
LED_SERVICE = 'e95dd91d-251d-470a-a062-fa1922dfa9a8';
LED_BITMAP = 'e95d7b77-251d-470a-a062-fa1922dfa9a8';
LED_TEXT = 'e95d93ee-251d-470a-a062-fa1922dfa9a8';
LED_TEXT_SPEED = 'e95d0d2d-251d-470a-a062-fa1922dfa9a8';
LED_SCROLL = 'E95D0D2D-251D-470A-A062-FA1922DFA9A8'
ACCEL_SRV = 'E95D0753-251D-470A-A062-FA1922DFA9A8'
ACCEL_DATA = 'E95DCA4B-251D-470A-A062-FA1922DFA9A8'
ACCEL_PERIOD = 'E95DFB24-251D-470A-A062-FA1922DFA9A8'

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
    { services: [LED_SERVICE] },
    { namePrefix: "BBC micro:bit" }
    ]
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
    console.log('Getting Services...');
    return server.getPrimaryServices();
    // findLedService(server);
    })
  .then(services => {
    console.log('Getting characteristics...');
    let queue = Promise.resolve();
    services.forEach(service =>{
      queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
        console.log('> Service: ' + service.uuid);
        characteristics.forEach(characteristic => {
          console.log('>> Characteristic: ' + characteristic.uuid + ' ' +
              getSupportedProperties(characteristic));
        });
    }));
   })
  })
  .catch(error => {
    showModal(error);
    });
  }
        
function getSupportedProperties(characteristic) {
  let supportedProperties = [];
  for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
      supportedProperties.push(p.toUpperCase());
    }
  }
  return '[' + supportedProperties.join(', ') + ']';
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
