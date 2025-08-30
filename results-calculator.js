class ResultsCalculator {

    constructor(sectionID) {
        this.vata = 0;
        this.pitta = 0;
        this.kapha = 0;

        this.sectionID = sectionID;
        let sectionInputs = Array.from(document.querySelectorAll(`${sectionID} input`));

        this.vataInputs = sectionInputs.filter(input => input.name.includes('vata'));
        this.pittaInputs = sectionInputs.filter(input => input.name.includes('pitta'));
        this.kaphaInputs = sectionInputs.filter(input => input.name.includes('kapha'));

        this.result = document.querySelector(`${sectionID} output`);

        for (let input of sectionInputs) {
            input.addEventListener('change', this.calcResults.bind(this));
        }
    }

    isChecked(input) {
        return input.checked;
    }

    calcResults() {
        let vata = Math.round(this.vataInputs.filter(this.isChecked).length / this.vataInputs.length * 100);
        let pitta = Math.round(this.pittaInputs.filter(this.isChecked).length / this.pittaInputs.length * 100);
        let kapha = Math.round(this.kaphaInputs.filter(this.isChecked).length / this.kaphaInputs.length * 100);

        this.vata = vata;
        this.pitta = pitta;
        this.kapha = kapha;

        let resultTemplate = `<strong>Итог:</strong> Вата ${vata}%, Питта ${pitta}%, Капха ${kapha}%.`;
        this.result.innerHTML = resultTemplate;

        let cells = document.querySelectorAll(`${this.sectionID}-results td`);
        cells[0].textContent = `${vata}%`;
        cells[1].textContent = `${pitta}%`;
        cells[2].textContent = `${kapha}%`;
    }
}

class SummaryTotalCalculator {
    constructor(sectionCalculators) {
        this.sectionCalculators = sectionCalculators;

        let formInputs = document.querySelectorAll('form input');
        for (let input of formInputs) {
            input.addEventListener('change', this.calcResults.bind(this));
        }
    }

    calcResults() {
        let vata = 0;
        let pitta = 0;
        let kapha = 0;

        for (let calculator of this.sectionCalculators) {
            vata = vata + calculator.vata;
            pitta = pitta + calculator.pitta;
            kapha = kapha + calculator.kapha;
        }

        vata = Math.round(vata / this.sectionCalculators.length);
        pitta = Math.round(pitta / this.sectionCalculators.length);
        kapha = Math.round(kapha / this.sectionCalculators.length);

        let cells = document.querySelectorAll('#summary-totals td');
        cells[0].textContent = `${vata}%`;
        cells[1].textContent = `${pitta}%`;
        cells[2].textContent = `${kapha}%`;
    }
}

let prakritiCalc = new ResultsCalculator('#prakriti');
let vikritiCalc = new ResultsCalculator('#vikriti');
let intelligenceCalc = new ResultsCalculator('#intelligence');
let emotionsCalc = new ResultsCalculator('#emotions');

new SummaryTotalCalculator([vikritiCalc, intelligenceCalc, emotionsCalc]);


// let inputsState = {};

// for (input of document.querySelectorAll('form input')) {
//     if (input.checked === true) {
//         inputsState[input.name] = true;
//     }
// }

// localStorage.setItem('constitutionFormState', JSON.stringify(inputsState));

// let cfs = JSON.parse(localStorage.getItem('constitutionFormState'));