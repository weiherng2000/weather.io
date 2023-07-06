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
