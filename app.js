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
        /*destructure the currentweather data into individual elements*/
        const 
        {
            weather,
            dt: dateUnix,
            /*sys.sunrise: assigned to a variable named sunriseUnixUTC.*/
            sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
            main: { temp, feels_like, pressure, humidity },
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

            <p>C${main}: ${description}</p>

            <ul class = "meta-list">
            <li class = "meta-item">
                <span class="m-icon">calendar_today</span>

                <p>${module.getDate(dateUnix,timezone)}</p>
            </li>

            <li class = "meta-item">
                <span class = "m-icon">location_on</span>

                <p class="title-3 data-location></p>
            </li>

            </ul>
        
        `;
        fetchData(url.reverseGeo(lat,lon),function([{name,country}]){
             card.querySelector["data-location"].innerHTML = `
             ${name}, ${country}
             `;
        })

        currentWeatherSection.appendChild(card);

         /**
         * TODAY'S HIGHLIGHTS
         */


    });

}

