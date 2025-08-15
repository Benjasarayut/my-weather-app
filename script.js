const apiKey = 'a0602a20cc7569820c999e06fe0a2467';
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');
const forecastContainer = document.querySelector('#forecast-container');
const forecastGrid = document.querySelector('#forecast-grid');
const searchHistory = document.querySelector('#search-history');

// Search history management (using in-memory storage for Claude.ai)
let searchHistoryData = [];

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeather(cityName);
        addToSearchHistory(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

// Show/hide search history
cityInput.addEventListener('focus', showSearchHistory);
cityInput.addEventListener('blur', () => {
    setTimeout(hideSearchHistory, 200);
});

cityInput.addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
        showSearchHistory();
    } else {
        hideSearchHistory();
    }
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล... <span class="loading"></span></p>`;
    forecastContainer.style.display = 'none';

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const data = await response.json();
        displayWeather(data);
        getForecast(city);
        updateBackground(data);
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
        forecastContainer.style.display = 'none';
    }
}

async function getForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(forecastUrl);
        if (!response.ok) throw new Error('ไม่สามารถโหลดพยากรณ์อากาศได้');

        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

function displayWeather(data) {
    const { name, main, weather, wind } = data;
    const { temp, humidity, feels_like } = main;
    const { description, icon } = weather[0];
    const windSpeed = wind ? wind.speed : 0;

    const weatherHtml = `
                <h2>${name}</h2>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
                <p class="temp">${temp.toFixed(1)}°C</p>
                <p>${description}</p>
                <p>รู้สึกเหมือน: ${feels_like.toFixed(1)}°C</p>
                <p>ความชื้น: ${humidity}%</p>
                <p>ความเร็วลม: ${windSpeed.toFixed(1)} m/s</p>
            `;
    weatherInfoContainer.innerHTML = weatherHtml;
}

function displayForecast(data) {
    const forecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    let forecastHtml = '';
    forecasts.forEach((forecast, index) => {
        const date = new Date(forecast.dt * 1000);
        const dayName = index === 0 ? 'วันนี้' : date.toLocaleDateString('th-TH', { weekday: 'short' });
        const temp = forecast.main.temp.toFixed(1);
        const icon = forecast.weather[0].icon;
        const description = forecast.weather[0].description;

        forecastHtml += `
                    <div class="forecast-item">
                        <div class="forecast-day">${dayName}</div>
                        <img class="forecast-icon" src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                        <div class="forecast-temp">${temp}°C</div>
                        <div class="forecast-desc">${description}</div>
                    </div>
                `;
    });

    forecastGrid.innerHTML = forecastHtml;
    forecastContainer.style.display = 'block';
}

function updateBackground(data) {
    const now = new Date();
    const hour = now.getHours();
    const isDaytime = hour >= 6 && hour <= 18;
    const temp = data.main.temp;
    const weatherMain = data.weather[0].main.toLowerCase();

    document.body.className = '';

    if (weatherMain.includes('rain')) {
        document.body.classList.add('rainy');
    } else if (weatherMain.includes('snow')) {
        document.body.classList.add('snowy');
    } else if (weatherMain.includes('cloud')) {
        document.body.classList.add(isDaytime ? 'cloudy-day' : 'cloudy-night');
    } else if (weatherMain.includes('clear')) {
        document.body.classList.add(isDaytime ? 'sunny-day' : 'sunny-night');
    }

    if (temp > 35) {
        document.body.classList.add('hot');
    } else if (temp < 10) {
        document.body.classList.add('cold');
    }
}

function addToSearchHistory(city) {
    searchHistoryData = searchHistoryData.filter(item => item.toLowerCase() !== city.toLowerCase());
    searchHistoryData.unshift(city);
    searchHistoryData = searchHistoryData.slice(0, 5);
}

function showSearchHistory() {
    if (searchHistoryData.length === 0) {
        searchHistory.style.display = 'none';
        return;
    }

    const historyHtml = searchHistoryData
        .filter(city => city.toLowerCase().includes(cityInput.value.toLowerCase()))
        .map(city => `<div class="search-history-item" onclick="selectHistoryItem('${city}')">${city}</div>`)
        .join('');

    if (historyHtml) {
        searchHistory.innerHTML = historyHtml;
        searchHistory.style.display = 'block';
    } else {
        searchHistory.style.display = 'none';
    }
}

function hideSearchHistory() {
    searchHistory.style.display = 'none';
}

function selectHistoryItem(city) {
    cityInput.value = city;
    hideSearchHistory();
    getWeather(city);
}

// Close search history when clicking outside
document.addEventListener('click', (e) => {
    if (!searchForm.contains(e.target)) {
        hideSearchHistory();
    }
});

// Default weather display
window.addEventListener('DOMContentLoaded', () => {
    // You can set a default city here if desired
    // getWeather('Bangkok');
});