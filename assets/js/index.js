// selectors ------------------------------------------------------------------------------------------------------------------>
const searchBar = document.getElementById('searchInput');
const submitBtn = document.getElementById('searchBtn');
const headDiv = document.getElementById('headDiv')

// need to declare these variables to prevent scoping issues when trying to move centering of map.
var map = '';
var marker = '';




// events ---------------------------------------------------------------------------------------------------------------------->
document.addEventListener('DOMContentLoaded', getYourIP);

submitBtn.addEventListener('click', () => {

    // takes the input inside the search bar and passes into the getSearchedIP function
    getSearchedIP(searchBar.value);
});




// functions ------------------------------------------------------------------------------------------------------------------->


// map is created in this function.
// takes in lat and long to create marker on map.
function getMap(lat, long, ip){

    // loads map into map div
    map = L.map('map').setView([`${lat}`, `${long}`], 15);



    // map.on adds an event handler to the map. passes whatever is clicked as e into callback
    // passes lat and long from clicked area into map.panTo to move centering of map
    map.on('click', function(e){
        
        const clickedLat = e.latlng.lat;
        const clickedLong = e.latlng.lng;

        // pass lat/long into function to retrieve information which will be passed into the renderBox function
        // BASICALLY THIS ASYNC FUNCTION USES LAT&LONG TO FETCH FROM API RATHER THAN IP ADDRESS
        translateLatLong(clickedLat, clickedLong);



        // passes lat and long from clicked area into map.panTo to move centering of map
        map.panTo(new L.LatLng(clickedLat, clickedLong));

        // removes previous marker
        marker.remove();
        // adds new marker to map
        marker = L.marker([clickedLat, clickedLong]).bindPopup(`Your latitude is ${clickedLat} & longitude is ${clickedLong}`).addTo(map);
    });



    // copyright
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);


    // creates a marker using yourLat and yourLong
    marker = L.marker([`${lat}`, `${long}`]).bindPopup(`Your latitude is ${lat} & longitude is ${long}`).addTo(map);

    
};






// async function that gets passed IP ADDRESS from the search bar to fetch from API
// triggered by submitBTN
async function getSearchedIP(ip){
    
    try{
        // requests location information based on clients searched IP
        const promise = await fetch(`https://api.bigdatacloud.net/data/ip-geolocation?ip=${ip}&localityLanguage=en&key=bdc_1e9b85ad108a4d3fa21b085e00288885`);
        const res = await promise.json();
        
        
        // Your lat/long data
        let yourLat = res.location.latitude;
        let yourLong = res.location.longitude;
        let yourIP = res.ip;
        let yourCity = res.location.localityName;
        let yourZip = res.location.postcode;
        let YourTime = res.location.timeZone.displayName;
        let yourNet = res.network.organisation;
        
        // passes lat and long from fetch into map.panTo to move centering of map
        map.panTo(new L.LatLng(yourLat, yourLong));


        // map.on adds an event handler to the map. passes whatever is clicked as e into callback
        // passes lat and long from clicked area into map.panTo to move centering of map
        map.on('click', function(e){
            
            const clickedLat = e.latlng.lat;
            const clickedLong = e.latlng.lng;
            

            // pass lat/long into function to retrieve information which will be passed into the renderBox function
            // BASICALLY THIS ASYNC FUNCTION USES LAT&LONG TO FETCH FROM API RATHER THAN IP ADDRESS
            translateLatLong(clickedLat, clickedLong);


            // passes lat and long from clicked area into map.panTo to move centering of map
            map.panTo(new L.LatLng(clickedLat, clickedLong));
    
            // removes previous marker
            marker.remove();
            // adds new marker to map
            marker = L.marker([clickedLat, clickedLong]).bindPopup(`Your latitude is ${clickedLat} & longitude is ${clickedLong}`).addTo(map);
        });



        // removes previous marker
        marker.remove();
        // adds new marker to map
        marker = L.marker([yourLat, yourLong]).bindPopup(`Your latitude is ${yourLat} & longitude is ${yourLong}`).addTo(map);

        // removes div containing info before creating new one
        document.getElementById('infoEl').remove();

        // calls function to create white box containing information.
        renderBox(yourIP, yourCity, yourZip, YourTime, yourNet);

    } catch (error){
        alert('Please refresh!');
    };
    
};






// async function that fetches from api using clients IP ADDRESS
// onstart it centers on clients location and creates marker.
// TRIGGERED ON PAGE LOAD
async function getYourIP(){


    try{
        // requests location information based on clients IP
        const promise = await fetch('https://api.bigdatacloud.net/data/ip-geolocation?localityLanguage=en&key=bdc_1e9b85ad108a4d3fa21b085e00288885');
        const res = await promise.json();
       
        
        // Your lat/long data
        let yourLat = res.location.latitude;
        let yourLong = res.location.longitude;
        let yourIP = res.ip;
        let yourCity = res.location.localityName;
        let yourZip = res.location.postcode;
        let YourTime = res.location.timeZone.displayName;
        let yourNet = res.network.organisation;

        // passes lat and long from fetch into getMap function
        getMap(yourLat, yourLong, yourIP);

        // Shows clients IP in searchBar
        searchBar.value = yourIP;

        // calls function to create white box containing information.
        renderBox(yourIP, yourCity, yourZip, YourTime, yourNet);

    } catch (error){
        alert('Please refresh!');
    };
};




// async function uses LAT & LONG to fetch from api rather than IP ADDRESS
async function translateLatLong(lat, long){

    try{
        // fetchs city/zip based on lat/long
        const promise = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode?latitude=${lat}&longitude=${long}&localityLanguage=en&key=bdc_1e9b85ad108a4d3fa21b085e00288885`);
        const res = await promise.json();
        

        // fetchs timezone based on lat/long
        const timePromise = await fetch(`https://api.bigdatacloud.net/data/timezone-by-location?latitude=${lat}&longitude=${long}&key=bdc_1e9b85ad108a4d3fa21b085e00288885`);
        const data = await timePromise.json();
    

        // Your lat/long data
        let yourIP = '????';
        let yourCity = res.locality;
        let yourZip = res.postcode;
        let YourTime = data.displayName;
        let yourNet = '?????';


        // Shows clients IP in searchBar
        searchBar.value = yourIP;

        // removes div containing info before creating new one
        document.getElementById('infoEl').remove();

        // calls function to create white box containing information.
        renderBox(yourIP, yourCity, yourZip, YourTime, yourNet);

    } catch (error){
        alert('Please refresh!');
    };
};









// creates a box that contains users information.
function renderBox(ip, city, zip, zone, net){
    
    const newDiv = document.createElement('div');
    newDiv.classList.add('absolute', 'bg-white', 'top-28', 'left-1/4' , 'z-10', 'h-fit', 'rounded', 'p-3', 'shadow-2xl', 'text-sm', 'md:text-2xl', 'md:top-44', 'md:left-1/4', 'md:px-12', 'lg:text-lg', 'lg:w-2/4', 'lg:left-1/4', 'lg:top-32', 'xl:top-36', 'xl:text-xl', '2xl:top-40', '2xl:w-2/4', '2xl:left-1/4');
    newDiv.setAttribute("id", "infoEl");
    newDiv.innerHTML = `
        <div>
            <h4 class="opacity-50">IP ADDRESS</h4>
            <h1>${ip}</h1>
        </div>
        <br>
        <div>
            <h4 class="opacity-50">LOCATION</h4>
            <h1>${city}, ${zip}</h1>
        </div>
        <br>
        <div>
            <h4 class="opacity-50">TIMEZONE</h4>
            <h1>${zone}</h1>
        </div>
        <br>
        <div>
            <h4 class="opacity-50">ISP</h4>
            <h1>${net}</h1>
        </div>
    `;
    headDiv.append(newDiv);
};



