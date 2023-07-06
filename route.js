'use strict';

import { updateWeather} from "./app.js";

const defaultLocation = "#/weather?lat=51.5073219&lon=-0.1276474" // London



const currentWeather = function()
{
    /*window.navigator object contains information about the visitor's browser.*/
    /*The Geolocation object allows the user to provide their location to web applications.*/
    /*The getCurrentPosition() method takes in a position object as a parameter and returns the current position of the device.*/
    window.navigator.geolocation.getCurrentPosition(res => {
        /*destructure the latitude and longtitude from the res.coords*/
        const { latitude, longitude } = res.coords;

        /*update the weather based on the latitude and longitude*/
        updateWeather(`lat=${latitude}`, `lon=${longitude}`);
      }, err => {
        
        /*window.location is a JavaScript object that represents the current URL (Uniform Resource Locator) of the window or frame in which the script is running. It provides access to various properties and methods related to the URL.*/
        /*sets the window hash portion of the URL to default location*/
        /*so we modify the URL based on the default location*/
        /*we modify the part after the ' # 'part*/
        window.location.hash = defaultLocation;
      });

}
/*create searchedLocation function and pass in query as a parameter*/
/*query is split into multiple substrings based on the & delimiter*/
/*we then pass in those substrings as arguments for the update weather function*/
/*... is used to spread the object/iterable into individual elements*/

const searchedlocation = query => updateWeather(...query.split('&'));


/*This means that when the URL "/" is accessed, 
the function referenced by currentWeather 
will be returned, but not executed.*/
const routes = new Map([
  ["/current-location", ()=>currentWeather],
  ["/weather",()=>searchedlocation]

]);

const checkHash = function()
{
   /*In summary, window.location.hash.slice(1) 
  returns the hash portion of the URL 
  without the # character at the beginning.*/
  const requestURL = window.location.hash.slice(1);

  /*destructure requestURL into route and query*/
  /* if requestURL contains ? we split the string into 2 substring*/
  /*then we put the first string into route and 2nd string into query*/
  /*else the first string will just be added in route and second string undefined*/

  const [route, query] = requestURL.includes ? requestURL.split("?") : [requestURL];

  /* we get the value and if value exists we invoke the function and pass in query as a parameter*/
  routes.get(route) ? routes.get(route)(query) : error404();

}

/*activate checkHash when hash is changed*/
window.addEventListener("hashchange",checkHash);

/*load event is when whole page has loaded,such as stylesheets,iframes and scripts*/
window.addEventListener("load",function()
{
  if(!window.location.hash)
  {
    window.location.hash = "#/current-location";
  }
  else
  {
     checkHash();
  }

});
