document.addEventListener("DOMContentLoaded", function () {
  destinationList();
  generateCards();

  const destinationDropDown = document.getElementById("destination");
  const userMinPrice = document.getElementById("minPrice");
  const userMaxPrice = document.getElementById("maxPrice");
  const activityLevel = document.getElementById("activity");
  const sortResults = document.getElementById("sort");
  const durationSlider = document.getElementById("duration");
  const output = document.getElementById("days");
  const searchInput = document.getElementById("search");
  const searchBtn = document.getElementById("searchBtn");

  output.innerHTML = `${durationSlider.value} day(s)`;

  durationSlider.oninput = function () {
    output.innerHTML = `${this.value} day(s)`;
    applyFilters();
  };

  searchBtn.addEventListener("click", function () {
    const query = searchInput.value.toLowerCase().trim();
    searchQuery(query);
  });

  // Apply filters when any filter option is changed
  destinationDropDown.addEventListener("change", () => applyFilters());
  userMinPrice.addEventListener("change", () => applyFilters());
  userMaxPrice.addEventListener("change", () => applyFilters());
  activityLevel.addEventListener("change", () => applyFilters());
  sortResults.addEventListener("change", () => applyFilters());

  function applyFilters() {
    const selectedCountry = destinationDropDown.value;
    const minPrice = parseInt(userMinPrice.value, 10) || 0; // Default to 0 if empty
    const maxPrice = parseInt(userMaxPrice.value, 10) || Infinity; // Default to Infinity if empty
    const selectedActivity = activityLevel.value;
    const selectedDuration = parseInt(durationSlider.value, 10);
    const selectedSort = sortResults.value;

    filterDestinations(
      selectedCountry,
      minPrice,
      maxPrice,
      selectedActivity,
      selectedDuration,
      selectedSort
    );
  }
});

function searchQuery(query) {
  fetch("travel_recommendation_api.json")
    .then((response) => response.json())
    .then((data) => {
      const destinationContainer = document.getElementById(
        "destination-container"
      );
      destinationContainer.innerHTML = ""; // Clear previous results

      let matches = [];

      // Search through all destination categories
      function searchDestinations(destinations) {
        destinations.forEach((item) => {
          if (
            item.name.toLowerCase().includes(query) ||
            item.activity.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.location?.toLowerCase().includes(query) // Check for location if exists
          ) {
            matches.push(item);
          }
        });
      }

      searchDestinations(data.countries.flatMap((country) => country.cities));
      searchDestinations(data.temples);
      searchDestinations(data.beaches);

      // Display results or no results message
      if (matches.length > 0) {
        matches.forEach((destination) => {
          const cardElement = createCard(
            destination.name,
            destination.activity,
            destination.days,
            destination.imageUrl,
            destination.description,
            destination.price
          );
          destinationContainer.appendChild(cardElement);
        });
      } else {
        destinationContainer.innerHTML =
          "<p style='background:white; padding:1rem; border-radius: 8px;'>Sorry, no search results...</p>";
      }
    })
    .catch((error) => {
      console.log("Error fetching data for search query:", error);
    });
}

function generateCards() {
  fetch("travel_recommendation_api.json")
    .then((response) => response.json())
    .then((data) => {
      const destinationContainer = document.getElementById(
        "destination-container"
      );
      destinationContainer.innerHTML = "";

      // Loop through each type of destination data (countries, temples, beaches)
      if (data.countries) {
        data.countries.forEach((country) => {
          country.cities.forEach((city) => {
            const cardElement = createCard(
              city.name,
              city.activity,
              city.days,
              city.imageUrl,
              city.description,
              city.price
            );
            destinationContainer.appendChild(cardElement);
          });
        });
      }

      if (data.temples) {
        data.temples.forEach((temple) => {
          const cardElement = createCard(
            temple.name,
            temple.activity,
            temple.days,
            temple.imageUrl,
            temple.description,
            temple.price
          );
          destinationContainer.appendChild(cardElement);
        });
      }

      if (data.beaches) {
        data.beaches.forEach((beach) => {
          const cardElement = createCard(
            beach.name,
            beach.activity,
            beach.days,
            beach.imageUrl,
            beach.description,
            beach.price
          );
          destinationContainer.appendChild(cardElement);
        });
      }
    })
    .catch((error) => {
      console.log("Error fetching JSON data: ", error);
    });
}

// Helper function to create a card element
function createCard(name, activity, duration, imageUrl, description, price) {
  const cardElement = document.createElement("div");
  cardElement.classList.add("destination_card");

  const nameElement = document.createElement("h2");
  nameElement.classList.add("location_name");
  nameElement.textContent = name;

  const durationElement = document.createElement("p");
  durationElement.classList.add("duration");
  durationElement.textContent = `${duration} days`;

  const activityElement = document.createElement("p");
  activityElement.classList.add("activity_level");
  activityElement.textContent = `Activity level: ${activity}`;

  const imageElement = document.createElement("img");
  imageElement.classList.add("location_image");
  imageElement.src = imageUrl;
  imageElement.alt = `${name} image`;

  const descriptionElement = document.createElement("p");
  descriptionElement.classList.add("location_description");
  descriptionElement.textContent = description;

  const priceElement = document.createElement("h3");
  priceElement.classList.add("price");
  priceElement.textContent = `$${price}`;

  cardElement.appendChild(nameElement);
  cardElement.appendChild(activityElement);
  cardElement.appendChild(durationElement);
  cardElement.appendChild(imageElement);
  cardElement.appendChild(descriptionElement);
  cardElement.appendChild(priceElement);

  return cardElement;
}

function destinationList() {
  fetch("travel_recommendation_api.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched data:", data); // Log data for debugging
      const destinationDropDown = document.getElementById("destination");

      // Check if 'countries' array exists in data
      if (data.countries && Array.isArray(data.countries)) {
        for (var i = 0; i < data.countries.length; i++) {
          var option = document.createElement("option");
          option.setAttribute("id", "location");
          option.value = data.countries[i].name;
          option.text = data.countries[i].name;
          destinationDropDown.appendChild(option);
        }
        console.log("Dropdown populated with countries.");
      } else {
        console.log("No countries data found.");
      }
    })
    .catch((error) => {
      console.log("Error fetching countries: ", error);
    });
}

function filterDestinations(
  selectedCountry,
  minPrice,
  maxPrice,
  selectedActivity,
  selectedDuration,
  selectedSort
) {
  fetch("travel_recommendation_api.json")
    .then((response) => response.json())
    .then((data) => {
      const destinationContainer = document.getElementById(
        "destination-container"
      );
      destinationContainer.innerHTML = "";

      let matches = [];

      // Helper function to check if a destination matches the filters
      function matchesFilters(destination) {
        const matchesCountry =
          selectedCountry === "all" ||
          selectedCountry === "" ||
          destination.country === selectedCountry;
        const matchesActivity =
          selectedActivity === "all" ||
          selectedActivity === "" ||
          destination.activity === selectedActivity;
        const matchesPrice =
          destination.price >= minPrice && destination.price <= maxPrice;
        const matchesDuration = destination.days >= selectedDuration;

        return (
          matchesCountry && matchesActivity && matchesPrice && matchesDuration
        );
      }

      // Collect matching destinations
      data.countries.forEach((country) => {
        country.cities.forEach((city) => {
          if (
            matchesFilters({
              country: country.name,
              price: city.price,
              activity: city.activity,
              days: city.days,
            })
          ) {
            matches.push(city);
          }
        });
      });

      data.temples.forEach((temple) => {
        if (
          matchesFilters({
            country: "temples",
            price: temple.price,
            activity: temple.activity,
            days: temple.days,
          })
        ) {
          matches.push(temple);
        }
      });

      data.beaches.forEach((beach) => {
        if (
          matchesFilters({
            country: "beaches",
            price: beach.price,
            activity: beach.activity,
            days: beach.days,
          })
        ) {
          matches.push(beach);
        }
      });

      // Sort matches based on selectedSort criteria
      if (selectedSort === "Price: Low to High") {
        matches.sort((a, b) => a.price - b.price);
      } else if (selectedSort === "Price: High to Low") {
        matches.sort((a, b) => b.price - a.price);
      } else if (selectedSort === "Duration: Low to High") {
        matches.sort((a, b) => a.days - b.days);
      } else if (selectedSort === "Duration: High to Low") {
        matches.sort((a, b) => b.days - a.days);
      }

      // Display sorted matches
      if (matches.length > 0) {
        matches.forEach((destination) => {
          const cardElement = createCard(
            destination.name,
            destination.activity,
            destination.days,
            destination.imageUrl,
            destination.description,
            destination.price
          );
          destinationContainer.appendChild(cardElement);
        });
      } else {
        destinationContainer.innerHTML =
          "<p style='background:white; padding:1rem; border-radius: 8px;'>Sorry, we don't have destinations matching your criteria at this time...</p>";
      }
    })
    .catch((error) => {
      console.log("Error fetching data for combined filters:", error);
    });
}
