// https://teachablemachine.withgoogle.com/models/m3rMjtrvw/

const predict = false;
const options = {proabilityTheshold: 0.6};
// (note - when this becomes an input field, will need to remove the option of setting value)
let classifier; // the ml5 classifier
let labels; // the labels from the model

function modelReady(){
    console.log('model ready');

    // add models to page
    let container = document.getElementById('predictions');
    labels = classifier.model.allLabels;
    for(i=0; i<labels.length; i++){
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
    if(result[0].label !== 'Background Noise' && predict && paired){
        console.log(result[0].label, ' ', result[0].confidence*100);
        let prediction = result[0].label.toLowerCase();

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