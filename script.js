let cityInput = document.querySelector('#city_input');
let searchBtn = document.querySelector('#searchBtn');
let locationBtn = document.querySelector('#locationBtn');

let api_key = 'f1896496ec0d4c2e7299064ed2867813';

let currentWeatherCard = document.querySelectorAll('.weather-left .card')[0];
let fiveDaysForecastCard = document.querySelector('.day-forecast');
let sunriseCard = document.querySelectorAll('.highlights .card')[1];
let aqiList = ['Good','Fair','Moderate','Poor','Very Poor'];
let humidityVal = document.querySelector('#humiditVal');
let pressureVal = document.querySelector('#pressureVal');
let visibilityVal = document.querySelector('#visibilityVal');
let windSpeedVal = document.querySelector('#windSpeedVal');
let feelsVal = document.querySelector('#feelsVal');
let hourlyForecastCard = document.querySelector('.hourly-forecast');

function getWeatherDetails(name, lat, lon, country, state){
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
    let WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months = ['jan','Feb','Mar','Apr','May','June','Jul','Aug','Sep','Oct','Nov','Dec'];

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        let date = new Date();
        currentWeatherCard.innerHTML = `
        <div class="current-weather">
            <div class="details">
                <p>Now</p>
                <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                <p>${data.weather[0].description}</p>
            </div>
            <div class="weather-icon">
                <img src="./images/cloud.png" style="max-width: 40%;" alt="">
            </div>
            </div>
            <hr>
            <div class="card-footer">
                <p><i class="fa-light fa-calendar"></i>${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()}</p>
                <p><i class="fa-light fa-location-dot"></i>${name}, ${country}</p>
            </div>`;
            let {sunrise,sunset} = data.sys;
            let {timezone, visibility} = data;
            let {humidity,pressure,feels_like} = data.main;
            let {speed} = data.wind;
            let sRiseTime = moment.utc(sunrise,'x').add(timezone,'seconds').format('hh:mm A');
            let sSetTime = moment.utc(sunset,'x').add(timezone,'seconds').format('hh:mm A');
            sunriseCard.innerHTML = `
            <div class="card-head">
                <p>Sunrise & Sunset</p>
            </div>
            <div class="sunrise-sunset">
                <div class="item">
                    <div class="icon">
                        <i class="fa-light fa-sunrise fa-4x"></i>
                    </div>
                    <div>
                        <p>Sunrise</p>
                        <h2>${sRiseTime}</h2>
                    </div>
                </div>
                <div class="item">
                    <div class="icon">
                        <i class="fa-light fa-sunset fa-4x"></i>
                    </div>
                    <div>
                        <p>Sunset</p>
                        <h2>${sSetTime}</h2>
                    </div>
                </div>
            </div>`;

            humidityVal.innerHTML = `${humidity}%`;
            pressureVal.innerHTML = `${pressure}hPa`;
            visibilityVal.innerHTML = `${visibility / 1000}km`;
            windSpeedVal.innerHTML = `${speed}m/s`;
            feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(2)}&deg;C`;
    }).catch(() => {
        alert('Failed to fetch current weather')
    })

    fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
        let hourlyForecast = data.list;
        hourlyForecastCard.innerHTML = '';
        for(i=0; i<=7; i++){
            let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
            let hr = hrForecastDate.getHours();
            let a = 'PM';
            if(hr < 12) a = 'AM';
            if(hr == 0) hr = 12;
            if(hr > 12) hr = hr - 12;
            hourlyForecastCard.innerHTML += `
            <div class="card">
                <p>${hr} ${a}</p>
                <img src="./images/cloud-2.png" style="max-width: 50%;" alt="">
                <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
            </div>`
        }
        let uniqueForecastDays = [];
        let fiveDaysForecast = data.list.filter(forecast => {
            let forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        })
        fiveDaysForecastCard.innerHTML = '';
        for(i=1; i<fiveDaysForecast.length; i++){
            let date = new Date(fiveDaysForecast[i].dt_txt);
            fiveDaysForecastCard.innerHTML += `
            <div class="forecast-item">
                <div class="icon-wrapper">
                    <img src="./images/cloud-2.png" style="max-width: 44%;" alt="">
                    <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                </div>
                <p>${date.getDate()} ${months[date.getMonth()]}</p>
                <p>${days[date.getDay()]}</p>
            </div>`
        }
    }).catch(()=>{
        alert('Failed to fetch weather forecast')
    })
}

function getCityCoordinates(){
    let cityName = cityInput.value.trim();
    cityInput.value = '';
    if(!cityName)return;
    let GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        let {name, lat, lon, country, state} = data[0];
        getWeatherDetails(name, lat, lon, country, state);
    }).catch(() => {
        alert(`Failed to fetch coordinates of ${cityName}`);
    })
}

function getUserCoordinates(){
    navigator.geolocation.getCurrentPosition(position => {
        let {latitude, longitude} = position.coords;
        let REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;

        fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
            let {name,country,state} = data[0];
            getWeatherDetails(name,latitude,longitude,country,state);
        }).catch(()=>{
            alert(`Failed to fetch user coordinates`);
        })
    }, error => {
        if(error.code === error.PERMISSION_DENIED){
            alert(`Geolocation permission denied. Please reset location permission to grant access again`);
        }
    })
}
searchBtn.addEventListener('click',getCityCoordinates);
locationBtn.addEventListener('click',getUserCoordinates);
cityInput.addEventListener('keyup',e => e.key === 'Enter' && getCityCoordinates());
window.addEventListener('load',getUserCoordinates);





