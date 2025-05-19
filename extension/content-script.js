console.log("[DEBUG] Content Script запущен");

const tokenMap = new Map();

const addTokensToMap = (data) => {
  data.forEach(({ tokenName, tokenAddress }) => {
    if (!tokenMap.has(tokenName)) {
      tokenMap.set(tokenName, tokenAddress);
      console.log(`[DEBUG] Добавлен новый токен: ${tokenName} => ${tokenAddress}`);
    }
  });
};

async function processTokenData() {
  const data = await fetchTokenData();
  if (data.length > 0) {
    addTokensToMap(data);
    
    const pairAddresses = data.map(item => item.pairAddress);
    const tokenAddresses = data.map(item => item.tokenAddress);
    
    console.log("[DEBUG] Получены pairAddresses:", pairAddresses);
    console.log("[DEBUG] Получены tokenAddresses:", tokenAddresses);
    console.log("[DEBUG] Текущая карта токенов:", Object.fromEntries(tokenMap));
    
    localStorage.setItem('pairAddresses', JSON.stringify(pairAddresses));
  }
}

async function fetchTokenData(limit = null) {
  try {
    console.log("[DEBUG] Запрос на fetch");
    
    const requestBody = {
      table: "newPairs",
      filters: {
        age: { max: null, min: null },
        txns: { max: null, min: null },
        bundle: { max: null, min: null },
        atLeastOneSocial: false,
        bondingCurve: { max: null, min: null },
        botUsers: { max: null, min: null },
        devHolding: { max: null, min: null },
        dexPaid: false,
        excludeKeywords: [],
        holders: { max: null, min: null },
        insiders: { max: null, min: null },
        liquidity: { max: null, min: null },
        marketCap: { max: null, min: null },
        mustEndInPump: false,
        numBuys: { max: null, min: null },
        numMigrations: { max: null, min: null },
        numSells: { max: null, min: null },
        protocols: {
          bonk: true, boop: true, pump: true, pumpAmm: false,
          raydium: false, moonshot: false, launchLab: true,
          meteoraAmm: false, meteoraAmmV2: false, virtualCurve: true
        },
        searchKeywords: [],
        snipers: { max: null, min: null },
        telegram: false,
        top10Holders: { max: null, min: null },
        twitter: { max: null, min: null },
        twitterExists: false,
        volume: { max: null, min: null },
        website: false               
      },
      usdPerSol: 150
    };
    
    if (limit) {
      requestBody.limit = limit;
    }

    const res = await fetch("https://api9.axiom.trade/pulse", {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    if (!Array.isArray(data)) {
      if (data.data && Array.isArray(data.data)) {
        
        return data.data;
      } else if (data.items && Array.isArray(data.items)) {
        
        return data.items;
      }
      throw new Error("Неподдерживаемый формат данных");
    }
    
    return data;
  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function modifyDivs() {
  const targetDivs = document.querySelectorAll('div.min-w-0.flex-1.overflow-hidden');
  
  targetDivs.forEach(div => {
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
  fetchTokenData();
  setTimeout(modifyDivs, 500);
  setTimeout(modifyDivs, 1500);
}

(async () => {
  if (document.readyState === 'complete') {
    init();
    await processTokenData();
  } else {
    document.addEventListener('DOMContentLoaded', async () => {
      init();
      await processTokenData();
    });
  }})

// Наблюдатель с фильтром для целевых элементов
const observer = new MutationObserver(async (mutations) => {
  if (mutations.some(m => m.addedNodes.length > 0)) {
    modifyDivs();
    
    const newData = await fetchTokenData(3);
    addTokensToMap(newData);
    
    console.log("[DEBUG] Обновленная карта токенов:", Object.fromEntries(tokenMap));
  }
});

observer.observe(document.body, { 
  childList: true, 
  subtree: true,
  attributes: false,
  characterData: false
});