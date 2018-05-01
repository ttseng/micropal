bluetooth.onBluetoothConnected(() => {
    basic.showString("C")
})
bluetooth.onBluetoothDisconnected(() => {
    basic.showString("D")
})
basic.showString("BLUE-NP")
bluetooth.startAccelerometerService()
bluetooth.startButtonService()
bluetooth.startLEDService()
