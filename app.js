'use-strict'

import { fetchData,url } from "./api.js";
/*imports all the exported members from the module.js file using the * as module syntax. This means that all the exports 
from module.js will be accessible through the module object.*/
import * as module from "./module.js";

const addEventonElements = function(elements,eventType,callback)
{
     for( const element of elements)
     {
         element.addEventListener(eventType,callback);
     }
}

/*Toggle search for mobile device*/
const searchBox = document.querySelector("[data-search-box]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");

/*adds or remove active on search box when we click the search button or arrow button*/
const toggleSearch = ()=> searchBox.classList.toggle("active");
addEventonElements(searchTogglers,"click",toggleSearch);

/*SEARCH API INTEGRATION*/
const searchfield = document.querySelector("[data-search-field]");
const searchresult = document.querySelector("[data-search-result]");

let searchTimeout = null;
const searchTimeoutDuration = 500;

/*this code here is for the inputs into the searchfield where it will
display the searchresults based on our inputs*/
searchfield.addEventListener("input",function()
{
    /*check if searchtimeout is null*/
    /*if searchtimeout is not null we will clear the timeout*/
     searchTimeout ?? clearTimeout(searchTimeout);

     /*if the searchfield has no input and is empty*/
     if(!searchfield.value)
     {
         searchresult.classList.remove("active");
         /*clear the innerHTML of the search results*/
         searchresult.innerHTML = "";
         searchfield.classList.remove("searching");

     }
     else /*if there is input*/
     {
        searchfield.classList.add("searching");
     }

     /*if there is input value in search field*/
     if(searchfield.value)
     {
        /*The setTimeout function is used in this code to 
        introduce a delay before making an 
        API call to fetch data based on the user's input in the search field.*/
        searchTimeout = setTimeout(()=>
        {
            /*locations contains the geo data from fetchData api*/
            fetchData(url.geo(searchfield.value),function(locations)
            {
                searchfield.classList.remove("searching");
                searchresult.classList.add("active");
                /*we are redefining the searchresult innerHTML 
                every time time input changes so no need to clear the innerHTML again*/
                searchresult.innerHTML = 
                `
                <ul class = "view-list" data-search-list>
                </ul>
                `;

                const /** {NodeList} | [] */ items = [];

                for(const {name, lat , lon , country ,state } of locations)
                {
                    const searchitem = document.createElement("li");
                    searchitem.classList.add("view-item");

                    searchitem.innerHTML = `

                    <span class = "m-icon">location_on</span>
            
                        <div>
                            <p class = "item-title">${name}</p>
            
                            <p class = "item-subtitle">${state || ""} ${country}</p>
                        </div>

                        <a href = "#/weather?lat=${lat}&lon=${lon}" class = "item-link has-state" 
                        aria-label = "${name} weather"data-search-toggler>
                        </a>
                    
                    `;

                    searchresult.querySelector("[data-search-list]").appendChild(searchitem);
                    /*push the a element tag into our items array*/
                    items.push(searchitem.querySelector("[data-search-toggler]"));
                }

                addEventonElements(items,"click",function(){
                    toggleSearch();
                    searchresult.classList.remove("active");
                })


            });

            

        },searchTimeoutDuration)

     }
});

const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const errorContent = document.querySelector("[data-error-content]");


export const updateWeather = function(lat,lon)
{
    loading.style.display = "grid";
    container.style.overflowY = "hidden";
    container.classList.remove("fade-in");
    errorContent.style.display = "none";

    const currentWeatherSection = document.querySelector("[data-current-weather]");
    const highlightSection = document.querySelector("[data-highlights]");
    const hourlySection = document.querySelector("[data-hourly-forecast]");
    const forecastSection = document.querySelector("[data-5-day-forecast]");
  
    currentWeatherSection.innerHTML = "";
    highlightSection.innerHTML = "";
    hourlySection.innerHTML = "";
    forecastSection.innerHTML = "";

    /*if current-location is already in the hash we disable the button*/
    if (window.location.hash === "#/current-location") 
    {
        currentLocationBtn.setAttribute("disabled", "");
    } else {
        currentLocationBtn.removeAttribute("disabled");
    }

    
    /**
     * CURRENT WEATHER SECTION
     */
    fetchData(url.currentWeather(lat, lon), function (currentWeather) 
    {
      console.log(currentWeather);

        /*destructure the currentweather data into individual elements*/
        const 
        {
            weather,
            dt: dateUnix,
            /*sys.sunrise: assigned to a variable named sunriseUnixUTC.*/
            sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
            main: { temp, feels_like, pressure, humidity, sea_level, grnd_level},
            visibility,
            timezone
        } = currentWeather
        /*destrucutre weather*/
        const [{ main, description, icon }] = weather;

        const card = document.createElement("div");
        card.classList.add("card", "card-lg", "current-weather-card");
        card.innerHTML = `
            <h2 class = "title-2">Currently</h2>

            <div class = "wrapper">
              <p class = "heading">${parseInt(temp)}&deg;<sup>c</sup></p>

              <img class = "weather-icon" src = "assets/images/weather icons/${icon}.png" alt="${description} width = "64" height = "64">

            </div>

            <p>${main}: ${description}</p>

            <ul class = "meta-list">
              <li class = "meta-item">
                <span class="m-icon">calendar_today</span>

                <p>${module.getDate(dateUnix,timezone)}</p>
              </li>

              <li class = "meta-item">
                <span class = "m-icon">location_on</span>

                <p class ="title-3" data-location></p>
              </li>

            </ul>
        
        `;
        fetchData(url.reverseGeo(lat, lon), function ([{ name, country }]) {
            card.querySelector("[data-location]").innerHTML = `${name}, ${country}`
          });

        currentWeatherSection.appendChild(card);

         /**
         * TODAY'S HIGHLIGHTS
         */

         fetchData(url.airPollution(lat,lon),function(airPollution)
         {
            const [{
                main: { aqi },
                components: { nh3 ,no2, o3, so2, pm2_5, co }
              }] = airPollution.list;

            const card = document.createElement("div");
            card.classList.add("card", "card-lg");

            card.innerHTML = `

            <h2 class = "title-2" id = "highlights-label">Other current info</h2>
                
            <div class = "highlights-list">

               <div class = "card card-sm highlight-card one">
                  <h3 class = "title-3">Air Quality index</h3>

                  <div class = "wrapper">
                      <span class = "m-icon">air</span>

                      <ul class = "card-list">
                        <li class = "card-item">
                          <p class = "title-1">CO</p>
                          <p class = "label-1">${co.toPrecision(3)}</p>
                        </li>

                        <li class = "card-item">
                          <p class = "title-1">nh3</p>
                          <p class = "label-1">${nh3.toPrecision(3)}</p>
                        </li>

                        <li class = "card-item">
                          <p class = "title-1">no2</p>
                          <p class = "label-1">${no2.toPrecision(3)}</p>
                        </li>

                        <li class = "card-item">
                          <p class = "title-1">O3</p>
                          <p class = "label-1">${o3.toPrecision(3)}</p>
                        </li>

                        <li class = "card-item">
                          <p class = "title-1">SO2</p>
                          <p class = "label-1">${so2.toPrecision(3)}</p>
                        </li>

                        <li class = "card-item">
                          <p class = "title-1">pm2_5</p>
                          <p class = "label-1">${pm2_5.toPrecision(3)}</p>
                        </li>

                      </ul>
                  </div>

                  <span class = "badge aqi-${aqi} label-${aqi}" title="${module.aqiText[aqi].message}">
                  ${module.aqiText[aqi].level}
                  </span>

               </div>

               <div class = "card card-sm highlight-card two">
                   <h3 class = "title-3">Sunrise & Sunset</h3>
                    
                   <div class = "card-list">
                       <div class = "card-item">
                          <span class = "m-icon">clear_day</span>

                          <div>
                            <p class = "label-1">Sunrise</p>


                            <p class = "title-1">${module.getTime(sunriseUnixUTC, timezone)}</p>

                          </div>

                       </div>

                       <div class = "card-item">
                        <span class = "m-icon">clear_night</span>

                        <div>
                          <p class = "label-1">SunSet</p>

                          <p class = "title-1">${module.getTime(sunsetUnixUTC, timezone)}</p>

                        </div>

                     </div>
                   </div>

               </div>

               <div class = "card card-sm highlight-card ">

                <h3 class = "title-3">Humidity</h3>

                <div class = "wrapper">
                  <span class = "m-icon">humidity_percentage</span>
                  
                  <p class = "title-1">${humidity}<sup>%</sup></p>
                </div>
                
                </div>

                <div class = "card card-sm highlight-card ">

                  <h3 class = "title-3">Pressure</h3>

                  <div class = "wrapper">
                    <span class = "m-icon">compress</span>
                    
                    <p class = "title-1">${pressure} <sup>hPa</sup></p>
                  </div>
                  
                  </div>

                  <div class = "card card-sm highlight-card ">

                    <h3 class = "title-3">Visibility</h3>

                    <div class = "wrapper">
                      <span class = "m-icon">Visibility</span>
                      
                      <p class = "title-1">${visibility / 1000} <sub>km</sub></p>
                    </div>
                    
                  </div>

                  <div class = "card card-sm highlight-card ">

                    <h3 class = "title-3">Temperature feels like</h3>

                    <div class = "wrapper">
                      <span class = "m-icon">thermostat</span>
                      
                      <p class = "title-1">${parseInt(feels_like)}&deg; <sup>c</sup></p>
                    </div>
                    
                  </div>

                  <div class = "card card-sm highlight-card ">

                    <h3 class = "title-3">Sea_level</h3>

                    <div class = "wrapper">
                      <span class = "m-icon">waves</span>
                      
                      <p class = "title-1">${sea_level? sea_level : "NIL"}<sub>m</sub></p>
                    </div>
                    
                  </div>

                  <div class = "card card-sm highlight-card ">

                    <h3 class = "title-3">Ground_level</h3>

                    <div class = "wrapper">
                      <span class = "m-icon">landscape</span>
                      
                      <p class = "title-1">${grnd_level ? grnd_level : "NIL"} <sub>m</sub></p>
                    </div>
                    
                  </div>
            
            `;

            highlightSection.appendChild(card);
         });

         /**
         * 24H FORECAST SECTION
         */

         fetchData(url.forecast(lat, lon), function (forecast) 
         {

            const {
                list: forecastList,
                city: { timezone }
              } = forecast;

              hourlySection.innerHTML = `
                <h2 class="title-2">Today's 24 hour forecast</h2>

                <div class="slider-container">
                   <ul class="slider-list" data-temp></ul>
                </div>
            `;

            for (const [index, data] of forecastList.entries())
            {
                if (index > 7) break;

                const {
                    dt: dateTimeUnix,
                    main: { temp },
                    weather
                  } = data
                  const [{ icon, description }] = weather

                  const tempLi = document.createElement("li");
                  tempLi.classList.add("slider-item");

                  tempLi.innerHTML = `
                    <div class="card card-sm slider-card">

                        <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>

                        
                        <img src="./assets/images/weather icons/${icon}.png" width="48" height="48" loading="lazy" alt="${description}"
                        class="weather-icon" title="${description}">

                        <p class="body-3">${parseInt(temp)}&deg;<sup>C</sup></p>

                    </div>
                    `;

                hourlySection.querySelector("[data-temp]").appendChild(tempLi);
            }

            /**
             * 5 DAY FORECAST SECTION
             */
            forecastSection.innerHTML = `
                <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>

                <div class="card card-lg forecast-card">
                  <ul data-forecast-list></ul>
                </div>
            `;

            for (let i = 7, len = forecastList.length; i < len; i += 8)
            {
               const {
                   main: { temp_max },
                   weather,
                   dt_txt
                 } = forecastList[i];
                 const [{ icon, description }] = weather
                 const date = new Date(dt_txt);
   
                 const li = document.createElement("li");
                 li.classList.add("card-item");
   
                 li.innerHTML = `
                   <div class="icon-wrapper">
                   <img  class = "weather-icon" src = "assets/images/weather icons/${icon}.png" width = "36" height = "36"
                    title="${description}">
           
                       <span class="span">
                         <p class="title-2">${parseInt(temp_max)}&deg;</p>
                       </span>
                   </div>
                   
                   <p class = "label-1">${description}</p>
   
                   <p class="label-1">${date.getDate()} ${module.monthNames[date.getUTCMonth()]}</p>
           
                   <p class="label-1">${module.weekDayNames[date.getUTCDay()]}</p>
                   `;
   
                   forecastSection.querySelector("[data-forecast-list]").appendChild(li);
            }
   
            loading.style.display = "none";
            container.style.overflowY = "overlay";
            container.classList.add("fade-in");

         });


         

       




    });

}

export const error404 = () => errorContent.style.display = "flex";
