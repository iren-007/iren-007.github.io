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
  // Находим все слайдеры по шаблону name="pr-qX-vata", "pr-qX-pitta", "pr-qX-kapha"
  const vataSliders = document.querySelectorAll('input[name^="pr-q"][name$="-vata"]');
  const pittaSliders = document.querySelectorAll('input[name^="pr-q"][name$="-pitta"]');
  const kaphaSliders = document.querySelectorAll('input[name^="pr-q"][name$="-kapha"]');

  const numQuestions = Math.max(vataSliders.length, pittaSliders.length, kaphaSliders.length);

  if (numQuestions === 0) {
    console.warn("Не найдено слайдеров для расчёта.");
    return;
  }

  // Максимальная сумма для каждой доши: 9 баллов за вопрос × количество вопросов
  const maxPossible = 9 * numQuestions;

  // Суммируем значения слайдеров
  const vataSum = Array.from(vataSliders).reduce((sum, slider) => sum + Number(slider.value), 0);
  const pittaSum = Array.from(pittaSliders).reduce((sum, slider) => sum + Number(slider.value), 0);
  const kaphaSum = Array.from(kaphaSliders).reduce((sum, slider) => sum + Number(slider.value), 0);

  // Рассчитываем проценты
  const vataPercent = Math.round((vataSum / maxPossible) * 100);
  const pittaPercent = Math.round((pittaSum / maxPossible) * 100);
  const kaphaPercent = Math.round((kaphaSum / maxPossible) * 100);

  // Сохраняем в объект (если используется)
  this.vata = vataPercent;
  this.pitta = pittaPercent;
  this.kapha = kaphaPercent;

  // Обновляем отображение результата
  const resultTemplate = `<strong>Итог:</strong> Вата ${vataPercent}%, Питта ${pittaPercent}%, Капха ${kaphaPercent}%.`;
  this.result.innerHTML = resultTemplate;

  // Обновляем таблицу (если используется)
  const cells = document.querySelectorAll(`${this.sectionID}-results td`);
  if (cells[0]) cells[0].textContent = `${vataPercent}%`;
  if (cells[1]) cells[1].textContent = `${pittaPercent}%`;
  if (cells[2]) cells[2].textContent = `${kaphaPercent}%`;
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


// dosha-sliders.js
// Управляет слайдерами: сумма vata+pitta+kapha = 9 для каждого вопроса

document.addEventListener('DOMContentLoaded', function () {
  // Находим все fieldset, содержащие слайдеры с именами по шаблону pr-qX-dosha
  const fieldsets = Array.from(document.querySelectorAll('fieldset')).filter(fs => {
    return (
      fs.querySelector('input[name*="-vata"]') &&
      fs.querySelector('input[name*="-pitta"]') &&
      fs.querySelector('input[name*="-kapha"]')
    );
  });

  const TOTAL = 9;

  // Функция: ограничение значения
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Функция: обновление отображаемого значения
  function updateValueDisplay(input) {
    const valueSpan = input.closest('label')?.querySelector('.slider-value');
    if (valueSpan) valueSpan.textContent = input.value;
  }

  // Функция: перераспределение значений
  function adjustSliders(changedInput) {
    const fieldset = changedInput.closest('fieldset');
    const vata = fieldset.querySelector('input[name*="-vata"]');
    const pitta = fieldset.querySelector('input[name*="-pitta"]');
    const kapha = fieldset.querySelector('input[name*="-kapha"]');

    // Проверяем, что все слайдеры найдены
    if (!vata || !pitta || !kapha) return;

    const sliders = { vata, pitta, kapha };
    const changedDosha = Object.keys(sliders).find(d => sliders[d] === changedInput);
    const others = Object.keys(sliders)
      .filter(d => d !== changedDosha)
      .map(d => sliders[d]);

    const sumOthers = others.reduce((sum, s) => sum + Number(s.value), 0);
    const newSumOthers = TOTAL - Number(changedInput.value);

    if (newSumOthers < 0) {
      changedInput.value = TOTAL;
      adjustSliders(changedInput);
      return;
    }

    // Пропорциональное распределение
    const val0 = Number(others[0].value);
    const val1 = Number(others[1].value);

    let newVal0, newVal1;

    if (val0 === 0 && val1 === 0) {
      newVal0 = Math.round(newSumOthers / 2);
      newVal1 = newSumOthers - newVal0;
    } else {
      const ratio0 = val0 / (val0 + val1 || 1);
      newVal0 = Math.round(ratio0 * newSumOthers);
      newVal1 = newSumOthers - newVal0;
    }

    // Коррекция и ограничение
    newVal0 = clamp(newVal0, 0, 9);
    newVal1 = clamp(newVal1, 0, 9);
    const diff = newSumOthers - (newVal0 + newVal1);
    if (diff !== 0) {
      if (newVal0 + diff >= 0 && newVal0 + diff <= 9) {
        newVal0 += diff;
      } else {
        newVal1 += diff;
      }
    }

    others[0].value = newVal0;
    others[1].value = newVal1;

    // Обновляем отображение
    updateValueDisplay(others[0]);
    updateValueDisplay(others[1]);
    updateValueDisplay(changedInput);
  }

  // Инициализация: пройти по всем fieldset и настроить слайдеры
  fieldsets.forEach(fieldset => {
    const vata = fieldset.querySelector('input[name*="-vata"]');
    const pitta = fieldset.querySelector('input[name*="-pitta"]');
    const kapha = fieldset.querySelector('input[name*="-kapha"]');

    if (!vata || !pitta || !kapha) return;

    // Установить начальные значения и отобразить
    [vata, pitta, kapha].forEach(input => {
      updateValueDisplay(input);
      input.addEventListener('input', () => adjustSliders(input));
    });
  });
});


// let inputsState = {};

// for (input of document.querySelectorAll('form input')) {
//     if (input.checked === true) {
//         inputsState[input.name] = true;
//     }
// }

// localStorage.setItem('constitutionFormState', JSON.stringify(inputsState));

// let cfs = JSON.parse(localStorage.getItem('constitutionFormState'));