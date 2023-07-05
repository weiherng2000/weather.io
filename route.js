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