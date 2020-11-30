// https://teachablemachine.withgoogle.com/models/m3rMjtrvw/
let modelUrl; // for storing the model URL
const predict = false;
const options = {proabilityTheshold: 0.6};
// (note - when this becomes an input field, will need to remove the option of setting value)
let classifier; // the ml5 classifier
let labels; // the labels from the model
let checkLabel = {}; // store whether we're checking for labels via blocks

function modelReady(){
    console.log('model ready');

    // add models to page
    let container = document.getElementById('predictions');
    labels = classifier.model.allLabels;
    
    for(i=0; i<labels.length; i++){
        checkLabel[labels[i].toUpperCase()] = false; // by default, not checking on any predictions

        if(labels[i] !== 'Background Noise'){
            let div = document.createElement('div');
            let predictLabel = document.createElement('div');
            predictLabel.innerHTML = labels[i];
            predictLabel.classList += 'label ';
            predictLabel.id = labels[i].toLowerCase().trim();
            div.append(predictLabel);
            container.prepend(div);
        }
    }

    classifier.classify(gotResult);
}

function gotResult(error, result){
    if(error){
        console.log(error);
        return;
    }
    let currentLabel = result[0].label;
    for(i=0; i<labels.length; i++){
        if(labels[i] == currentLabel){
            checkLabel[currentLabel] = true;
        }else{
            checkLabel[labels[i]] = false;
        }
    }

    if(currentLabel !== 'Background Noise' && predict && paired){
        console.log(currentLabel, ' ', result[0].confidence*100);
        let prediction = currentLabel.toLowerCase();

        Array.from(document.getElementsByClassName('label')).forEach(
            (el) => {
                el.classList.remove('active');
            }
        )
        document.getElementById(prediction.trim()).classList += ' active ';

        if(prediction == 'goodnight'){
            goodnight();
        }else if(prediction == 'happy'){
            happy();
        }else if(prediction == 'hey!'){
            hey();
        }else if(prediction == 'sad'){
            sad();
        }
    }
}