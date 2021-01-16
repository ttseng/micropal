// https://teachablemachine.withgoogle.com/models/m3rMjtrvw/
let modelUrl; // for storing the model URL
let isPredicting = true;
const options = {proabilityTheshold: 0.6};
let classifier; // the ml5 classifier

/*
    used to store microbit responses to different inputs
    the syntax is
    gotClassName: servoSequence, writeDisplay
    where servoSequence and writeDisplay are functions for controlling the servos and displays respectively
*/

let predictFns = []; 


let modelUrlInput = document.querySelector('input#model');
let modelLoadBtn = document.getElementById('load-model-btn');

//TODO remove after testing
// let form = React.createElement(EventForm, { label: 'test', key: 0} );
// ReactDOM.render(form, document.getElementById('form-container'));

modelLoadBtn.addEventListener('click', ()=> {
    let url = modelUrlInput.value;
    // check that it's a valid URL
    let isValid = validURL(url);
    if(isValid){
        // add model.json to URL name
        url += "model.json";

        // clear all existing labels
        clearLabels();
        try{
            document.getElementById('form-test').remove();
        }catch(error){};

        // disable btn
        modelLoadBtn.disabled = true;
        modelLoadBtn.innerHTML = "Loading";
        modelLoadBtn.classList += 'loading';

        // load the new classifier
        classifier = ml5.soundClassifier(url, options, modelReady);
    }else{
        alert('Invalid URL -  please try pasting again');
    }
});

function modelReady(){
    console.log('model ready');
    loadLabels();


    document.getElementById('predictions').classList -= 'hidden';

    // re-enable load button
    modelLoadBtn.disabled = false;
    modelLoadBtn.innerHTML = "Load Model";
    modelLoadBtn.classList -= 'loading';

    classifier.classify(gotResult);
}

function gotResult(error, result){
    if(error){
        console.log(error);
        return;
    }

    // check if the result is from the most recently loaded model
    let latestModelLabels = classifier.model.allLabels;
    let resultLabels = Array.from(result, item => item.label);
    let isLatestModel = latestModelLabels.every(a => resultLabels.some(b => a===b)) 
        && latestModelLabels.length == resultLabels.length;
    // console.log(latestModelLabels, ' ', resultLabels);

    if(isLatestModel){
        let currentLabel = result[0].label;
        if(isPredicting){
            // console.log(currentLabel, ' ', result[0].confidence*100, '%');
    
            removeActiveLabels();
            setActiveLabel(formatLabel(currentLabel));
        }
    
        try{
            if(isPredicting){
                // run the script to control the microbit, as defined in programmingUI.js
                predictFns[`got${formatLabel(currentLabel)}`]();     
            }
        }catch(error){
            console.error(error);
        }
    }
}

function removeActiveLabels(){
    Array.from(document.getElementsByClassName('label')).forEach(
        (el) => {
            el.classList.remove('active');
        }
    );
    Array.from(document.querySelectorAll('form .header')).forEach(
        (el) => {
            el.classList.remove('active');
        }
    );
}

function formatLabel(label){
    return label.toLowerCase().replace(/\s/g, '');
}

function setActiveLabel(label){
    document.getElementById(label).classList += ' active '; 
    document.querySelector(`#form-${label} .header`).classList += ' active';
}

function clearLabels(){
    Array.from(document.querySelectorAll('#predictions .label')).forEach((el) => el.remove());

    let formContainer = document.getElementById('form-container');
    formContainer.innerHTML = '';
}

function loadLabels(){
    let container = document.getElementById('predictions');
    let labels = classifier.model.allLabels;
    
    for(i=0; i<labels.length; i++){
        let trimmedLabel = formatLabel(labels[i]);

        // add prediction labels
        let predictLabel = document.createElement('div');
        predictLabel.innerHTML = labels[i];
        predictLabel.classList += 'label ';
        predictLabel.id = trimmedLabel;
        container.prepend(predictLabel);    

        // create forms
        let form = React.createElement(EventForm, { label: labels[i], key: i} );
        let formContainer = document.createElement('div');
        formContainer.id = `form-${trimmedLabel}`;
        document.getElementById('form-container').prepend(formContainer);
        ReactDOM.render(form, document.getElementById(formContainer.id));

        // populate predictFns
        let fnName = `got${trimmedLabel}`;
        predictFns[fnName] = new Function([], null);
    }   
}

function togglePrediction(){
    console.log('toggle prediction');
    let togglePredictionBtn = document.getElementById('toggle-prediction-btn');
    togglePredictionBtn.classList.toggle('isPredicting');
    if(togglePredictionBtn.classList.contains('isPredicting')){
        togglePredictionBtn.innerHTML = 'Pause Prediction';
    }else{
        togglePredictionBtn.innerHTML = 'Restart Prediction';
    }
    isPredicting = !isPredicting;
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }