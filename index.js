/*
This is the main JavaScript file for this app. It contains the following functions:

- saveThemeToLocalStorage(selectedTheme)
- handleCoinSelection(coin)
- getSelectedCoinFromLS()
- fetchCoinData(currency)
- displayCoinData(data)
- renderTheme()
- checkThemeFromLocalStorage()
- fetchSpaceData()
- fetchNatureData()
- applyThemeStyle(theme, image, imageInfo)
- getCurrentTime()
- navigator.geolocation.getCurrentPosition(async position)
- renderTheme()

The app uses the CoinGecko API to fetch cryptocurrency data, the NASA API to fetch space photos and the Unsplash API to fetch nature photos. 
The app also uses the OpenWeatherMap API to fetch weather data based on the user's location.

You can basically choose between two themes: space and nature. 
The space theme displays a space photo from the NASA API and the nature theme displays a nature photo from the Unsplash API.

When LS is used is just 'Local Storage'. 

*/
// Constants for the Coin API, space photos API and nature photos API
const coinAPI = 'https://api.coingecko.com/api/v3/coins/'
const spaceAPI = 'https://api.nasa.gov/planetary/apod?api_key=bvEmaD7bL4Je86OwdreEgi9yldIVy9sLAlZdgvhk'
const naturePhotosAPI = 'https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature'
// -----------------
const themeEl = document.getElementById('theme')
const themeFromLocalStorage = localStorage.getItem('theme')
const imgInfoEl = document.getElementById('img-info')
const keepImgDiv = document.getElementById('keep-img-div')
const keepImgCheck = document.getElementById('keep-img-check')
//Initialize Bootstrap tooltips:
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
//Variables for the currency section:
const selectedCoin = localStorage.getItem('coin')
const coinInfoTop = document.getElementById('coin-info-top')
const currentPriceEl = document.getElementById('current-price')
const highPriceEl = document.getElementById('high-price')
const lowPriceEl = document.getElementById('low-price')
const dropdownBtnGroup = document.getElementById('dropdown-btn-group')
const dropdownBtn = document.getElementById('dropdown-btn')
const dropdownMenu = document.getElementById('dropdown-menu')
const dropdownItems = document.getElementsByClassName('dropdown-item')
const accordionItem = document.getElementById('accordion-item')
const accordionBtn = document.getElementById('accordion-button')
const accordionBodyInner = document.getElementById('accordion-body-inner')

//This variable helps to identify if the user just wants to change the currency, so that the theme doesn't change.
let changeCurrency = false
//Variables for the space and nature images:
let natureImage = null
let spaceImage = null
let spaceImgTitle = null
let natureImgAuthor = null
//This variable helps to identify if the page has been loaded for the first time, so that it won't fetch images again when fetching the coin data. 
let pageLoaded = true

themeEl.addEventListener('click', (e) => {
    if(e.target.id === 'nature-btn') {
        changeCurrency = false
        saveThemeToLocalStorage('nature')
        renderTheme()
    } else if(e.target.id === 'space-btn') {
        saveThemeToLocalStorage('space')
        fetchSpaceData()
    } 
})

function saveThemeToLocalStorage(selectedTheme) {
    localStorage.setItem('theme', selectedTheme)
}

dropdownBtnGroup.addEventListener('click', (e) => {
    if(e.target.closest('#bitcoin-btn')) {
        handleCoinSelection('bitcoin')
    } else if(e.target.closest('#ethereum-btn')) {
        handleCoinSelection('ethereum')
    } else if(e.target.closest('#dogecoin-btn')) {
        handleCoinSelection('dogecoin')
    }
    else if(e.target.closest('#tether-btn')) {
        handleCoinSelection('tether')
    }
    else if(e.target.closest('#solana-btn')) {
        handleCoinSelection('solana')
    } 
})

function handleCoinSelection(coin) {
    fetchCoinData(coin)
    changeCurrency = true
    localStorage.setItem('coin', coin)
}

keepImgCheck.addEventListener('change', () => {
    if(keepImgCheck.checked) {
        localStorage.setItem('natureImage', JSON.stringify({
            img: natureImage,
            author: natureImgAuthor
        }))
        localStorage.setItem('isChecked', 'true')
    } else {
        localStorage.setItem('natureImage', null)
        localStorage.setItem('isChecked', 'false')
        renderTheme()
    }
})

function getSelectedCoinFromLS() {
    if(selectedCoin) {
        fetchCoinData(selectedCoin) 
    } else {
        fetchCoinData('bitcoin')
    }
}

getSelectedCoinFromLS()

async function fetchCoinData(currency) {
    try {
        const response = await fetch(`${coinAPI}${currency}`)
        if(!response.ok) {
            throw new Error('Network response was not ok')
        }
        const data = await response.json()
        displayCoinData(data)
    }
    catch (error) {
        console.error('Error fetching data', error.message)
        alert('There was an error fetching the coin data. Please try again in a few moments.')
    }
}

function displayCoinData(data) {
    const coinName = data.name
    const imgUrl = data.image.large
    const currentPrice = data.market_data.current_price.usd
    const highPrice = data.market_data.high_24h.usd
    const lowPrice = data.market_data.low_24h.usd
    const description = data.description.en

    let sentences = description.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/g);
    let firstTwoSentences = sentences.slice(0, 2)
    let shortDescription = firstTwoSentences.join(' ')

    coinInfoTop.innerHTML = `<img class="coin-logo" src='${imgUrl}' alt='logo of ${coinName}'/>`
    currentPriceEl.textContent = `🎯: $ ${currentPrice}`
    highPriceEl.textContent = `📈: $ ${highPrice}`
    lowPriceEl.textContent = `📉: $ ${lowPrice}`

    accordionBtn.textContent = `About ${coinName}`
    accordionBodyInner.innerHTML = `${shortDescription}`

    if(!pageLoaded) {
        renderTheme()
    }

    pageLoaded = false
}

//This function checks if the user has a theme saved in LS and if so, it renders the theme. 
//When the 'nature' theme is chosen, it checks if the user has chosen to keep the image and if so, 
//it renders the theme with the image and author saved in LS.
function renderTheme() {
    const updatedThemeFromLocalStorage = localStorage.getItem('theme')

    if(!changeCurrency) {
        if(updatedThemeFromLocalStorage === 'space') {
            fetchSpaceData()
        } 
        else if(updatedThemeFromLocalStorage === 'nature') {
            let natureImgFromLS = localStorage.getItem('natureImage')

            if(natureImgFromLS !== 'null' && natureImgFromLS !== null) {
                natureImgFromLS = JSON.parse(natureImgFromLS)
                applyThemeStyle('nature', natureImgFromLS.img, natureImgFromLS.author)
            } else {
                fetchNatureData()
            }
        } else {
            checkThemeFromLocalStorage()
        }
    } 
}

function checkThemeFromLocalStorage() {
    if(themeFromLocalStorage === 'space') {
        fetchSpaceData()
    } 
    else {
        fetchNatureData()
    }
}

async function fetchSpaceData() {
    try {
        const response = await fetch(spaceAPI)
        const data = await response.json()

        if(data.media_type === 'video') {
            spaceImage = './img/greenmonster.jpg'
            spaceImgTitle = `Title: supernova remnant Cassiopeia A (Cas A) shows unusual structure called the “Green Monster.`
        } else {
            spaceImage = data.url
            spaceImgTitle = data.title
        }
        applyThemeStyle('space', spaceImage, spaceImgTitle)
    }
    catch(error) {
        console.error(error)
        alert('There was an error fetching data from NASA. A default space image will be displayed.')
        document.body.style.backgroundImage = `url('https://apod.nasa.gov/apod/image/2402/NGC2736_Helge_Buesing1024.jpg')`
        imgInfoEl.textContent = `Title: The Pencil Nebula Supernova Shock Wave`
    }
}

async function fetchNatureData() {
    try {
        const response = await fetch(naturePhotosAPI)
        const data = await response.json()
        natureImage = data.urls.full 
        natureImgAuthor = data.user.name

        applyThemeStyle('nature', natureImage, natureImgAuthor)
    }
    catch(error) {
        console.error(error)
        alert('There was an error fetching data from Unsplash. A default nature image will be displayed.')
        document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1531756716853-09a60d38d820?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxNDI0NzB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDg2NzY4OTF8&ixlib=rb-4.0.3&q=85)`
		document.getElementById("img-info").textContent = `Photo by: Lucie Hošová`
    } 
}

// This functoin changes the style of the page based on the theme selected, like the type of font, the colors of the buttons and the background image.
function applyThemeStyle(theme, image, imageInfo) {
    if(theme === 'space') {
        document.body.style.backgroundImage = `url(${image})`
        imgInfoEl.textContent = `Title: ${imageInfo}`

        document.body.style.fontFamily = 'Orbitron'

        dropdownBtnGroup.classList.add('blue-style')
        dropdownMenu.classList.add('blue-style')
        dropdownBtn.classList.add('blue-style')
        dropdownBtnGroup.classList.remove('green-style')
        dropdownMenu.classList.remove('green-style')
        dropdownBtn.classList.remove('green-style')

        for(let dropdownItem of dropdownItems) {
            dropdownItem.classList.add('blue-style')
            dropdownItem.classList.remove('green-style')
        }

        accordionItem.classList.add('blue-style')
        accordionBtn.classList.add('blue-style')
        accordionItem.classList.remove('green-style')
        accordionBtn.classList.remove('green-style')

        keepImgDiv.classList.add('hidden')
    } 
        
    else {
        document.body.style.backgroundImage = `url(${image})` 
        imgInfoEl.textContent = `Photo by: ${imageInfo}`

        document.body.style.fontFamily = "Noto Serif"

        dropdownBtnGroup.classList.add('green-style')
        dropdownMenu.classList.add('green-style')
        dropdownBtn.classList.add('green-style')
        dropdownBtnGroup.classList.remove('blue-style')
        dropdownMenu.classList.remove('blue-style')
        dropdownBtn.classList.remove('blue-style')

        for(let dropdownItem of dropdownItems) {
            dropdownItem.classList.add('green-style')
            dropdownItem.classList.remove('blue-style')
        }
        accordionItem.classList.add('green-style')
        accordionBtn.classList.add('green-style')
        accordionItem.classList.remove('blue-style')
        accordionBtn.classList.remove('blue-style')

        keepImgDiv.classList.remove('hidden')

        const isCheckedFromLS = localStorage.getItem('isChecked')

        if(isCheckedFromLS === 'true') {
            keepImgCheck.checked = true
        }
    }
}

function getCurrentTime() {
    const date = new Date()
    document.getElementById('time').textContent = date.toLocaleTimeString("en-us", {timeStyle: "short"})
}

getCurrentTime()

navigator.geolocation.getCurrentPosition(async position => {
    try {
        const res = await fetch(`https://apis.scrimba.com/openweathermap/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric`)
        if (!res.ok) {
            throw Error("Weather data not available")
        }

        const data = await res.json()
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        document.getElementById("weather").innerHTML = `
            <img class="weather-icon" src=${iconUrl} />
            <div class="weather-text">
                <p class="weather-temp">${Math.round(data.main.temp)}º</p>
                <p class="weather-city">${data.name}</p>
            </div>
        `
    }
    catch(error) {
        alert("Failed to fetch weather data, please try again in a few moments or check your location settings.")
        console.error(error)
    }
});

if(pageLoaded) {
    renderTheme()
}