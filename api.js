'use strict';

const api_key = "72fe700a04dddd31dcf3528f8112f7a2";

/*fetch api function with the callback function included*/
export const fetchData = function(URL,callback)
{
    fetch(`${URL}&appid=${api_key}`)
    .then(response => response.json())
    .then(data =>callback(data));
    
}

/*export the url object*/
/*to call the function use url.currentWeather(lat,lon)*/
export const url = {
    
    /*create respective api url functions in the url object*/

    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`
      },
      forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`
      },
      airPollution(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}`
      },
      reverseGeo(lat, lon) {
        return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`
      },
      /**
       * @param {string} query Search query e.g.: "London", "New York"
       */
      geo(query) {
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`
      }
}