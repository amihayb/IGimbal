let serialPort;
let motorOn = false;
let joystickTr = 0;
let joystickEl = 0;


function openClosePort(event) {
    const button = document.getElementById('connectButton');
    if (button.textContent === 'Connect') {
        requestSerialPort()
        //if (serialPort) {
        button.textContent = 'Disconnect';
        button.style.background = "#008080";
        /*} else {
            button.textContent = 'Nope';
            button.style.background="#108080";
        }*/
    } else {
        closeSerialPort();
        button.textContent = 'Connect';
        button.style.background = "#5898d4";
    }
}

async function requestSerialPort() {
    try {
        serialPort = await navigator.serial.requestPort();
        await serialPort.open({ baudRate: 115200 });
        console.log('Serial port opened successfully!');
        return true;
    } catch (error) {
        console.error('Error connecting to serial port:', error);
        return false;
    }
}

async function sendMsg(message) {
    if (!serialPort) {
        console.error('Serial port not opened. Click "Open Serial Port" first.');
        return;
    }
    //let message = 'Yes!';
    message = message + '\r';
    const writer = serialPort.writable.getWriter();
    await writer.write(new TextEncoder().encode(message));
    writer.releaseLock();
    console.log(`Sent: ${message}`);
}

async function closeSerialPort() {
    if (serialPort) {
        await serialPort.close();
        console.log('Serial port closed.');
    }
}

function motorState() {
    const button = document.getElementById('motorOnButton');
    if (motorOn) {
        // Turn Motors Off
        sendMsg("R1[1]=0\r");
        button.style.background = "#5898d4";
        button.textContent = 'Motor On';
    } else { // Turn Motors On
        if (!serialPort) {
            alert('Please connect to driver first');
        } else {
            sendMsg("R1[1]=1\r");
            button.style.background = "#008080";
            button.textContent = 'Motor Off';
        }
    }
    motorOn = !motorOn;
}

function goToAngle() {

    if (motorOn) {
        const trAngInput = document.getElementById('angTr-input');
        const elAngInput = document.getElementById('angEl-input');
        const trAngValue = trAngInput.value;
        const elAngValue = elAngInput.value;
        
        let message = `R1[11]=${trAngValue}; R1[21]=${elAngValue}`;
        console.log(message);
        sendMsg(message);
        //message = 'R1[1]=1';
        //sendMsg(message);
    } else {
        alert('Motors are off, \nPlease turn on motors first');
    }
}

function startScenario(scenarioNumber) {

    let message = '';

    if (motorOn) {
        joystickTr = 0;
        joystickEl = 0;

        switch (scenarioNumber) {

            case 1:  // Relative
                message = 'R1[12]=0; R1[22]=0; R1[1]=1;';
                break;

            case 2:   // Stab
                message = 'R1[12]=0; R1[22]=0; R1[1]=2;';
                break

            case 3:   // Drift Calib
                message = 'R1[12]=0; R1[22]=0; R1[1]=1; R1[100]=1';
                break
            case 4:   // Restart
                message = 'R1[12]=0; R1[22]=0; R1[1]=9;';
                break                
        }

        console.log(message);
        sendMsg(message);
    } else {
        alert('Please turn on motors first');
    }
}


function playTune() {

    if (motorOn) {
        let message = 'R1[1]=8';
        sendMsg(message);
    } else {
        alert('Motors are off, \nPlease turn on motors first');
    }
}

function joystickCmd(direction) {
    playLocalTone();
    console.log(direction);

    switch (direction) {
        case "UP":
            joystickEl++;
            break;

        case "DOWN":
            joystickEl--;
            break;

        case "RIGHT":
            joystickTr++;
            break;

        case "LEFT":
            joystickTr--;
            break;

        case "CENTER":
            joystickTr = 0;
            joystickEl = 0;
    }
    //console.log(`Joystick TR = ${joystickTr}, EL = ${joystickEl}`);
    let message = `R1[12]=${1000*joystickTr}; R1[22]=${1000*joystickEl}`;
    console.log(message);
    sendMsg(message);
}


function playLocalTone() {
    const audioElement = document.getElementById('localAudio');
    audioElement.play();
}