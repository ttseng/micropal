// Microbit Bluetooth documentation: https://lancaster-university.github.io/microbit-docs/resources/bluetooth/bluetooth_profile.html

let targetDevice = null;
let ledMatrixStateCharacteristic = null;
let ledTextCharacteristic = null;
let ledService = null;

// LEDS UUIDs
const LED_SERVICE = 'E95DD91D-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_STATE = 'E95D7B77-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_TEXT = 'E95D93EE-251D-470A-A062-FA1922DFA9A8'.toLowerCase();
const LED_SCROLL = 'E95D0D2D-251D-470A-A062-FA1922DFA9A8'.toLowerCase();

const services = [LED_SERVICE];

const LED_MATRIX_STATE = "e95d7b77-251d-470a-a062-fa1922dfa9a8";

async function pair() {  
  if (!navigator.bluetooth) {
    showModal("Web Bluetooth is not supported in this browser. Please try Chrome or Opera.")
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
    ledService = await server.getPrimaryService(LED_SERVICE);
    
    console.log('getting characteristics...');
    document.getElementById('status').innerHTML = 'getting characteristics...';
    ledMatrixStateCharacteristic = await ledService.getCharacteristic(LED_MATRIX_STATE);
    
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

async function sendText(){
  ledTextCharacteristic = await ledService.getCharacteristic(LED_TEXT);
  let text = document.getElementById('text').value;
  var textEncoder = new TextEncoder();
  ledTextCharacteristic.writeValue(textEncoder.encode(text));
}

function showModal(message) {
  document.getElementsByName("modal-message")[0].innerHTML = message;
  $("#myModal").modal("show");
  document.getElementById('pair-btn').style.display = 'block';
}
