function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function modifyDivs() {
  const targetDivs = document.querySelectorAll('div.min-w-0.flex-1.overflow-hidden');
  
  targetDivs.forEach(div => {
    // Проверяем, что это именно элемент с токеном (доп. проверка)
    if (div.textContent.trim() && !div.querySelector('.random-number')) {
      const randomNum = getRandomNumber(1, 100);
      const numberSpan = document.createElement('span');
      numberSpan.className = 'random-number';
	  numberSpan.style.marginLeft = '5px';
      numberSpan.textContent =  ` [${randomNum}%]`;
	  // Принудительно меняем направление flex для родителя, иначе проценты съезжают
	  div.style.cssText += 'display: inline-flex !important; flex-direction: row !important;';
      div.appendChild(numberSpan);
    }
  });
}

//Разные интервалы тут, чтобы не было проблем из-за динамической загрузки контента
function init() {
  modifyDivs();
  setTimeout(modifyDivs, 500);
  setTimeout(modifyDivs, 1500);
}

if (document.readyState === 'complete') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

// Наблюдатель с фильтром для целевых элементов
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      modifyDivs();
    }
  });
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true,
  attributes: false,
  characterData: false
});