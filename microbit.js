
let targetDevice = null;


let ledMatrixStateCharacteristic = null;

const LED_SERVICE = "e95dd91d-251d-470a-a062-fa1922dfa9a8";

const LED_MATRIX_STATE = "e95d7b77-251d-470a-a062-fa1922dfa9a8";

function onClickStartButton() {
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

function requestDevice() {
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

function connect(device) {
  device.gatt.connect()
    .then(server => {
      findLedService(server);
    })
    .catch(error => {
      showModal(error);
    });
}

function findLedService(server) {
  server.getPrimaryService(LED_SERVICE)
    .then(service => {
      findLedMatrixStateCharacteristic(service);
    })
    .catch(error => {
      showModal(error);
    });
}

function findLedMatrixStateCharacteristic(service) {
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