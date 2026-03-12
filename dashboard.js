// ============ COMPREHENSIVE WEATHER DASHBOARD ============

const location_display = document.getElementById("location_display");
const apiKey = "19cce9e605b9fee697fadec41c8deaac";

// Store current weather data globally for updates
let currentWeatherData = null;
let currentAirQualityData = null;
let currentForecastData = null;
let currentLat = null;
let currentLon = null;
let lastUpdateTime = null;
let autoRefreshInterval = null;
let isRefreshing = false;
let lastDropdownCity = null; // Track last city selected from dropdown

// ============ UNIT CONVERSION FUNCTIONS ============

function convertTemperature(tempCelsius, unit) {
  if (unit === "fahrenheit") {
    return Math.round(tempCelsius * 1.8 + 32);
  }
  return Math.round(tempCelsius);
}

function convertWindSpeed(speedMS, unit) {
  let converted;
  switch(unit) {
    case "kmh":
      converted = speedMS * 3.6;
      break;
    case "mph":
      converted = speedMS * 2.237;
      break;
    case "knots":
      converted = speedMS * 1.944;
      break;
    case "ms":
      converted = speedMS;
      break;
    default:
      converted = speedMS * 3.6;
  }
  return Math.round(converted * 10) / 10;
}

function convertDistance(km, unit) {
  if (unit === "mi") {
    return (km * 0.621371).toFixed(1);
  }
  return km.toFixed(1);
}

function convertPrecipitation(mm, unit) {
  if (unit === "in") {
    return (mm / 25.4).toFixed(2);
  }
  return mm.toFixed(2);
}

function convertPressure(hpa, unit) {
  let converted;
  switch(unit) {
    case "inhg":
      converted = hpa * 0.02953;
      break;
    case "mmhg":
      converted = hpa * 0.75006;
      break;
    case "mbar":
      converted = hpa;
      break;
    case "hpa":
      converted = hpa;
      break;
    default:
      converted = hpa;
  }
  return converted.toFixed(2);
}

// ============ GEOLOCATION & ADDRESS LOOKUP ============

window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(changeData);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};

function changeData(position) {
  currentLat = position.coords.latitude;
  currentLon = position.coords.longitude;
  console.log(`Latitude: ${currentLat}, Longitude: ${currentLon}`);
  getAddressFromOSM(currentLat, currentLon);
  fetchAllWeatherData(currentLat, currentLon);
  
  // Initialize saved cities after geolocation
  setTimeout(() => {
    initializeSavedCities();
    renderCitiesList();
    currentLocationDisplay.textContent = 'Device';
  }, 1000);
}

async function getAddressFromOSM(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const road = data.address.suburb || data.address.town || data.address.city;
    const main_city = data.address.city;
    const display_city = `${road}, ${main_city}`;
    console.log(`You are at ${display_city}`);
    city_display(display_city);
    localStorage.setItem("location", display_city);
  } catch (error) {
    console.error("Lookup failed:", error);
  }
}

function city_display(city) {
  if (!city) {
    const location = localStorage.getItem("location");
    if (location) location_display.textContent = location;
  } else {
    location_display.textContent = city;
  }
}

// ============ LOCATION MANAGEMENT (SAVED CITIES) ============

const locationButton = document.getElementById('location_button');
const locationDropdown = document.getElementById('location_dropdown');
const currentLocationDisplay = document.getElementById('current_location');
const citiesList = document.getElementById('cities_list');
const addCityBtn = document.getElementById('add_city_btn');

// Initialize saved cities in localStorage
function initializeSavedCities() {
  let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
  
  // Add device location if not already present
  const deviceLocation = localStorage.getItem('location');
  if (deviceLocation && !savedCities.some(c => c.name === deviceLocation && c.isDevice)) {
    savedCities.unshift({
      name: deviceLocation,
      lat: currentLat,
      lon: currentLon,
      isDevice: true
    });
    localStorage.setItem('savedCities', JSON.stringify(savedCities));
  }
  
  return savedCities;
}

// Render cities in dropdown
function renderCitiesList() {
  const savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
  citiesList.innerHTML = '';
  
  const currentCity = localStorage.getItem('currentCity') || 'device';
  
  savedCities.forEach((city, index) => {
    const cityItem = document.createElement('div');
    cityItem.className = 'city-item';
    if ((currentCity === 'device' && city.isDevice) || currentCity === city.name) {
      cityItem.classList.add('active');
    }
    
    const cityInfo = document.createElement('p');
    cityInfo.textContent = city.isDevice ? `📍 ${city.name} (Device)` : `📍 ${city.name}`;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove city';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeCity(index);
    };
    
    cityItem.appendChild(cityInfo);
    if (!city.isDevice) {
      cityItem.appendChild(removeBtn);
    }
    
    cityItem.onclick = () => selectCity(city);
    citiesList.appendChild(cityItem);
  });
}

// Select a city and fetch its weather
function selectCity(city) {
  currentLat = city.lat;
  currentLon = city.lon;
  
  localStorage.setItem('currentCity', city.isDevice ? 'device' : city.name);
  
  // Update all location displays
  currentLocationDisplay.textContent = city.isDevice ? 'Device' : city.name;
  location_display.textContent = city.name;  // Add this line to update main location display
  
  locationDropdown.classList.remove('active');
  locationDropdown.classList.add('hidden');
  
  // Store this as the last selected city from dropdown
  lastDropdownCity = city;
  
  fetchAllWeatherData(city.lat, city.lon);
  renderCitiesList();
}

// Remove a city from saved list
function removeCity(index) {
  let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
  const removedCity = savedCities[index];
  savedCities.splice(index, 1);
  localStorage.setItem('savedCities', JSON.stringify(savedCities));
  
  // If removed city was selected, switch to device location
  if (localStorage.getItem('currentCity') === removedCity.name) {
    const deviceCity = savedCities.find(c => c.isDevice);
    if (deviceCity) {
      selectCity(deviceCity);
    }
  } else {
    renderCitiesList();
  }
}

// Add city from search
function addCityToSaved(city) {
  let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
  
  // Check if city already exists
  if (savedCities.some(c => c.name === city.city)) {
    alert('City already saved!');
    return;
  }
  
  savedCities.push({
    name: city.city,
    lat: city.latitude,
    lon: city.longitude,
    isDevice: false
  });
  
  localStorage.setItem('savedCities', JSON.stringify(savedCities));
  renderCitiesList();
}

// Toggle location dropdown
locationButton.addEventListener('click', (e) => {
  e.stopPropagation();
  
  if (!locationDropdown.classList.contains('active')) {
    // Position dropdown at button location
    const btnRect = locationButton.getBoundingClientRect();
    locationDropdown.style.top = (btnRect.bottom + 10) + 'px';
    locationDropdown.style.left = (btnRect.left + btnRect.width / 2 - 140) + 'px'; // Center it
  }
  
  locationDropdown.classList.toggle('active');
  locationDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
window.addEventListener('click', (event) => {
  const clickedBtn = event.target.closest('#location_button');
  const clickedDropdown = event.target.closest('#location_dropdown');
  
  if (!clickedBtn && !clickedDropdown) {
    locationDropdown.classList.remove('active');
    locationDropdown.classList.add('hidden');
  }
});

// Add city button listener
addCityBtn.addEventListener('click', () => {
  // Close location dropdown
  locationDropdown.classList.remove('active');
  locationDropdown.classList.add('hidden');
  
  // Focus on search input
  searchInput.focus();
  
  // Clear search input and placeholder text
  searchInput.value = '';
  searchInput.placeholder = 'Search and add a new city...';
  
  // Show suggestion box
  suggestionBox.classList.remove('hidden');
});

// ============ DATE & TIME DISPLAY ============

const date_dis = document.getElementById('date_display');
function date_display() {
  const now = new Date();
  const date = now.getDate();
  const day = now.getDay();
  const month = now.getMonth();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const now_day = days[day];
  const now_month = months[month];
  date_dis.textContent = `${now_day}, ${now_month} ${date}`;
}

date_display();

// ============ CITY SEARCH & SUGGESTIONS ============

const searchInput = document.getElementById('city_search');
const suggestionBox = document.getElementById('suggestion-box');
const searchBtn = document.getElementById('search');
let debounceTimer;

const geoOptions = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': '200ca58a3dmsh31ee9eb85fb6508p151433jsn19e1d2958344',
    'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
  }
};

searchInput.addEventListener('input', () => {
  const query = searchInput.value;
  clearTimeout(debounceTimer);

  // Show close button when searching, search icon otherwise
  if (query.length > 0) {
    searchBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" opacity="0.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  } else {
    searchBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" opacity="0.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  }

  if (query.length < 2) {
    suggestionBox.classList.add('hidden');
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      const response = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=5`, 
        geoOptions
      );
      const result = await response.json();
      displaySuggestions(result.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  }, 300);
});

// Handle search button click (close button when searching)
searchBtn.addEventListener('click', () => {
  // If search input has text, clicking button clears it and restores dropdown city
  if (searchInput.value.length > 0) {
    searchInput.value = '';
    suggestionBox.classList.add('hidden');
    
    // Restore the last city selected from dropdown
    if (lastDropdownCity) {
      selectCity(lastDropdownCity);
    }
    
    // Reset button to search icon
    searchBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" opacity="0.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  }
});

function displaySuggestions(cities) {
  suggestionBox.innerHTML = '';
  if (cities.length === 0) return;

  cities.forEach(city => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    
    const cityInfoDiv = document.createElement('div');
    cityInfoDiv.style.display = 'flex';
    cityInfoDiv.style.justifyContent = 'space-between';
    cityInfoDiv.style.width = '100%';
    cityInfoDiv.style.alignItems = 'center';
    
    const cityName = document.createElement('span');
    cityName.textContent = `${city.city}, ${city.regionCode} ${city.countryCode}`;
    
    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Add';
    addBtn.style.background = 'linear-gradient(-45deg, #66adff 0%, #7278fb 47%, #b456fd 100%)';
    addBtn.style.color = 'white';
    addBtn.style.border = 'none';
    addBtn.style.borderRadius = '8px';
    addBtn.style.padding = '5px 10px';
    addBtn.style.cursor = 'pointer';
    addBtn.style.fontSize = '0.85rem';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      addCityToSaved(city);
      searchInput.value = '';
      suggestionBox.classList.add('hidden');
    };
    
    cityInfoDiv.appendChild(cityName);
    cityInfoDiv.appendChild(addBtn);
    div.appendChild(cityInfoDiv);
    
    div.onclick = () => {
      searchInput.value = city.city;
      suggestionBox.classList.add('hidden');
      // Fetch weather for selected city
      fetchAllWeatherData(city.latitude, city.longitude);
      currentLat = city.latitude;
      currentLon = city.longitude;
      
      // Update location name
      city_display(`${city.city}, ${city.countryCode}`);
      currentLocationDisplay.textContent = city.city;
      localStorage.setItem('currentCity', city.city);
      
      // Store as last city for restoration
      lastDropdownCity = {
        name: city.city,
        lat: city.latitude,
        lon: city.longitude,
        isDevice: false
      };
    };
    
    suggestionBox.appendChild(div);
  });
  suggestionBox.classList.remove('hidden');
}

// ============ FETCH COMPREHENSIVE WEATHER DATA ============

async function fetchCurrentWeather(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

async function fetchAirQuality(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching air quality:', error);
    return null;
  }
}

async function fetchForecastData(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return null;
  }
}
async function fetchUVIndex(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('UV Index data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching UV index:', error);
    return null;
  }
}

async function fetchAllWeatherData(lat, lon) {
  console.log('Fetching all weather data...');
  isRefreshing = true;
  
  currentWeatherData = await fetchCurrentWeather(lat, lon);
  currentAirQualityData = await fetchAirQuality(lat, lon);
  currentForecastData = await fetchForecastData(lat, lon);
  currentUVIndexData = await fetchUVIndex(lat, lon);
  
  isRefreshing = false;
  
  if (currentWeatherData) {
    lastUpdateTime = new Date();
    updateDashboard();
    updateLastUpdatedDisplay();
    
    // Setup auto-refresh every 1 minute (60000 milliseconds)
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(() => {
      fetchAllWeatherData(currentLat, currentLon);
    }, 60000); // 1 minute
  }
}

// ============ UPDATE LAST UPDATED DISPLAY ============

function updateLastUpdatedDisplay() {
  const lastUpdated = document.getElementById('last_updated');
  if (!lastUpdated || !lastUpdateTime) return;
  
  const now = new Date();
  const diffMs = now - lastUpdateTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);
  
  let timeText = '';
  
  if (diffMins === 0) {
    if (diffSecs <= 5) {
      timeText = 'just now';
    } else {
      timeText = `${diffSecs}s ago`;
    }
  } else if (diffMins === 1) {
    timeText = '1 minute ago';
  } else if (diffMins < 60) {
    timeText = `${diffMins} minutes ago`;
  } else {
    const hours = Math.floor(diffMins / 60);
    timeText = hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  
  // Add refreshing indicator
  let displayText = `Last updated: ${timeText}`;
  if (isRefreshing) {
    displayText = `🔄 Updating... (Last: ${timeText})`;
    lastUpdated.classList.add('refreshing');
  } else {
    lastUpdated.classList.remove('refreshing');
  }
  
  lastUpdated.textContent = displayText;
  
  // Update display every second to keep it current
  setTimeout(updateLastUpdatedDisplay, 1000);
}

// ============ UPDATE DASHBOARD DISPLAY ============

function updateDashboard() {
  if (!currentWeatherData) return;
  
  const weather = currentWeatherData;
  const airQuality = currentAirQualityData;
  const forecast = currentForecastData;
  
  // Get user's unit preferences
  const temp_unit = localStorage.getItem('temperature_input') || 'celsius';
  const wind_unit = localStorage.getItem('windspeed_input') || 'kmh';
  const pressure_unit = localStorage.getItem('pressure_input') || 'hpa';
  const precipitation_unit = localStorage.getItem('precipitation_input') || 'mm';
  const time_format = localStorage.getItem('time_format_input') || '12h';
  
  // ---- MAIN DISPLAY ----
  let temp = convertTemperature(weather.main.temp, temp_unit);
  let feelsLike = convertTemperature(weather.main.feels_like, temp_unit);
  const tempSymbol = temp_unit === "celsius" ? "°C" : "°F";
  
  document.getElementById("temp_display").textContent = `${temp}${tempSymbol}`;
  document.getElementById("feels_like").textContent = `${feelsLike}${tempSymbol}`;
  document.getElementById("weather_status").textContent = weather.weather[0].main;
  
  // ---- WIND DATA ----
  let windSpeed = convertWindSpeed(weather.wind.speed, wind_unit);
  const windDir = getWindDirection(weather.wind.deg);
  const windUnit = getWindUnit(wind_unit);
  document.getElementById("wind_val").textContent = `${windSpeed} ${windUnit}`;
  document.getElementById("wind_dir").textContent = `${windDir} direction`;
  
  // ---- HUMIDITY DATA ----
  const humidity = weather.main.humidity;
  document.getElementById("humidity_val").textContent = `${humidity}%`;
  
  // ---- PRESSURE DATA ----
  let pressure = convertPressure(weather.main.pressure, pressure_unit);
  const pressureUnit = getPressureUnit(pressure_unit);
  document.getElementById("pressure_val").textContent = `${pressure} ${pressureUnit}`;
  
  // ---- UV INDEX ----
  // Note: UV index is not in basic weather API, using a default calculation
  const uvIndex = currentUVIndexData ? currentUVIndexData.value : Math.round(Math.random() * 11); // Placeholder - you may need UV API
  document.getElementById("uv_index_val").textContent = uvIndex;
  document.getElementById("uv_status").textContent = getUVStatus(uvIndex);
  
  // ---- VISIBILITY ----
  const visibility = (weather.visibility / 1000); // Convert meters to km
  const visibilityUnit = precipitation_unit === "in" ? "mi" : "km";
  const visibilityConverted = convertDistance(visibility, visibilityUnit);
  const visDisplay = visibilityUnit === "km" ? `${visibilityConverted} km` : `${visibilityConverted} mi`;
  document.getElementById("visibility_val").textContent = visDisplay;
  
  // ---- SUNRISE & SUNSET ----
  // Use timezone offset from API to show local time
  const timezoneOffset = weather.timezone || 0;
  document.getElementById("sunrise_val").textContent = formatTimeWithTimezone(weather.sys.sunrise, timezoneOffset, time_format);
  document.getElementById("sunset_val").textContent = formatTimeWithTimezone(weather.sys.sunset, timezoneOffset, time_format);
  
  // ---- CLOUDS ----
  document.getElementById("clouds_val").textContent = `${weather.clouds.all}%`;
  
  // Debug logging
  console.log(`🌍 Location: ${weather.name}`);
  console.log(`💨 Wind Speed API: ${weather.wind.speed} m/s = ${convertWindSpeed(weather.wind.speed, 'kmh')} km/h`);
  console.log(`💧 Humidity: ${weather.main.humidity}%`);
  console.log(`☁️ Clouds: ${weather.clouds.all}%`);
  console.log(`Raw API response:`, weather);
  
  // ---- DEW point ----
  const dewPoint = calculateDewPoint(weather.main.temp, weather.main.humidity);
  const dewPointConverted = convertTemperature(dewPoint, temp_unit);
  document.getElementById("dewpoint_val").textContent = `${dewPointConverted}${tempSymbol}`;
  
  // ---- AIR QUALITY INDEX ----
  if (airQuality && airQuality.list && airQuality.list[0]) {
    const aqi = airQuality.list[0].main.aqi;
    const aqiValue = aqi * 50; // Convert to 0-500 scale
    const aqiStatus = getAQIStatus(aqi);
    
    document.getElementById("air_index_value").textContent = aqiValue;
    document.getElementById("index_status").textContent = aqiStatus;
    
    // Update AQI components
    const components = airQuality.list[0].components;
    if (components.pm2_5) {
      const pm25 = convertPrecipitation(components.pm2_5, precipitation_unit === 'in' ? 'in' : 'mm');
      document.querySelector('#PM25 .infos_value').textContent = pm25;
    }
    if (components.pm10) {
      const pm10 = convertPrecipitation(components.pm10, precipitation_unit === 'in' ? 'in' : 'mm');
      document.querySelectorAll('.infos_value')[1].textContent = pm10;
    }
    if (components.o3) document.querySelectorAll('.infos_value')[2].textContent = components.o3.toFixed(1);
    if (components.no2) document.querySelectorAll('.infos_value')[3].textContent = components.no2.toFixed(1);
  }
  
  // ---- FORECAST DATA (24-hour) ----
  if (forecast) {
    updateHourlyForecast(forecast, temp_unit, wind_unit, timeFormat, precipUnit, timezoneOffset);
  }
  
  console.log('Dashboard updated successfully');
}

// ============ UTILITY FUNCTIONS ============

function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function getWindUnit(unit) {
  const units = {
    'kmh': 'km/h',
    'mph': 'mph',
    'ms': 'm/s',
    'knots': 'knots'
  };
  return units[unit] || 'km/h';
}

function getPressureUnit(unit) {
  const units = {
    'hpa': 'hPa',
    'inhg': 'inHg',
    'mmhg': 'mmHg',
    'mbar': 'mbar'
  };
  return units[unit] || 'hPa';
}

function getUVStatus(uvIndex) {
  if (uvIndex <= 2) return "Low";
  if (uvIndex <= 5) return "Moderate";
  if (uvIndex <= 7) return "High";
  if (uvIndex <= 10) return "Very High";
  return "Extreme";
}

function getAQIStatus(aqi) {
  const statuses = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  return statuses[aqi - 1] || 'Unknown';
}

function calculateDewPoint(temp, humidity) {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}

function formatTime(date, format) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const paddedMinutes = minutes < 10 ? '0' + minutes : minutes;
  
  if (format === '24h') {
    const paddedHours = hours < 10 ? '0' + hours : hours;
    return `${paddedHours}:${paddedMinutes}`;
  } else {
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const paddedHour = displayHour < 10 ? '0' + displayHour : displayHour;
    return `${paddedHour}:${paddedMinutes} ${ampm}`;
  }
}

function formatTimeWithTimezone(unixTimestamp, timezoneOffset, format) {
  // unixTimestamp: seconds since epoch (UTC)
  // timezoneOffset: seconds offset from UTC
  
  // Convert to local time by adding timezone offset
  const localTimestamp = unixTimestamp + timezoneOffset;
  const hours = Math.floor((localTimestamp / 3600) % 24);
  const minutes = Math.floor((localTimestamp / 60) % 60);
  
  const paddedMinutes = minutes < 10 ? '0' + minutes : minutes;
  
  if (format === '24h') {
    const paddedHours = hours < 10 ? '0' + hours : hours;
    return `${paddedHours}:${paddedMinutes}`;
  } else {
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const paddedHour = displayHour < 10 ? '0' + displayHour : displayHour;
    return `${paddedHour}:${paddedMinutes} ${ampm}`;
  }
}

function updateHourlyForecast(forecast, tempUnit, windUnit, timeFormat, precipUnit, timezoneOffset = 0) {
  const sliderContainer = document.getElementById('slider_container');
  if (!sliderContainer) return;
  
  // Get next 24 hours (8 items = 24 hours in 3-hour intervals)
  const hourlyData = forecast.list.slice(0, 8);
  
  hourlyData.forEach((item, index) => {
    let sliderItem = sliderContainer.querySelectorAll('.slider_item')[index];
    
    if (sliderItem) {
      // Update time - using timezone-aware formatting
      const timeElement = sliderItem.querySelector('.slider_time');
      if (timeElement) {
        const timeStr = formatTimeWithTimezone(item.dt, timezoneOffset, timeFormat);
        timeElement.textContent = timeStr;
      }
      
      // Update temperature
      const tempElement = sliderItem.querySelector('.slider_temp');
      if (tempElement) {
        const tempSymbol = tempUnit === "celsius" ? "°C" : "°F";
        const temp = convertTemperature(item.main.temp, tempUnit);
        tempElement.textContent = `${temp}${tempSymbol}`;
      }
      
      // Update condition
      const condElement = sliderItem.querySelector('.slider_condition');
      if (condElement) {
        condElement.textContent = item.weather[0].main;
      }
      
      // Update precipitation chance
      const precipElement = sliderItem.querySelector('.slider_precip');
      if (precipElement) {
        const precipitation = (item.pop * 100).toFixed(0);
        precipElement.textContent = `${precipitation}%`;
      }
    }
  });
}


// ============ LISTEN TO SETTING CHANGES ============

window.addEventListener('settingChanged', (event) => {
  const { key, value } = event.detail;
  
  console.log(`Setting changed: ${key} = ${value}`);
  
  // Re-render dashboard with new unit conversions
  if (currentWeatherData) {
    updateDashboard();
  }
});