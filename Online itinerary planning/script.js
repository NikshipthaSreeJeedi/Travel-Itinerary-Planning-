// script.js

document.addEventListener("DOMContentLoaded", function () {
  const loadPlacesBtn = document.getElementById("load-places-btn");
  const placesSection = document.getElementById("places-section");
  const placesToAdd = document.getElementById("places-to-add");
  const itineraryContainer = document.getElementById("itinerary");
  const addDayBtn = document.getElementById("add-day-btn");
  const downloadBtn = document.getElementById("download-btn");

  let dayCount = 0;

  const fetchPopularPlaces = () => {
    const city = new URLSearchParams(window.location.search).get("city");
    const cityCoordinates = {
      hyderabad: { lat: 17.385044, lon: 78.486671 },
      bangalore: { lat: 12.9716, lon: 77.5946 },
      delhi: { lat: 28.6139, lon: 77.2090 },
      chennai: { lat: 13.0827, lon: 80.2707 },
      kolkata: { lat: 22.5726, lon: 88.3639 },
      mumbai: { lat: 19.0760, lon: 72.8777 },
      jaipur: { lat: 26.9124, lon: 75.7873 },
      pune: { lat: 18.5204, lon: 73.8567 },
      lucknow: { lat: 26.8467, lon: 80.9462 },
      ahmedabad: { lat: 23.0225, lon: 72.5714 },
      goa: { lat: 15.2993, lon: 74.1240 },
      cochin: { lat: 9.9312, lon: 76.2673 }
    };

    if (!cityCoordinates[city]) {
      alert("Invalid city selected!");
      return;
    }

    const { lat, lon } = cityCoordinates[city];
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"="attraction"](around:10000, ${lat}, ${lon});
        node["leisure"="park"](around:10000, ${lat}, ${lon});
      );
      out body 10;
    `;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    fetch(overpassUrl)
      .then(response => response.json())
      .then(data => {
        const places = data.elements.map(element => ({
          name: element.tags.name || "Unnamed place",
          link: `https://www.openstreetmap.org/?mlat=${element.lat}&mlon=${element.lon}#map=16/${element.lat}/${element.lon}`
        }));
        displayPlaces(places);
      })
      .catch(err => console.error("Error fetching places:", err));
  };

  const displayPlaces = (places) => {
    placesToAdd.innerHTML = "";
    places.forEach(place => {
      const li = document.createElement("li");
      li.innerHTML = `${place.name} - <a href="${place.link}" target="_blank">Map Link</a>`;

      const addBtn = document.createElement("button");
      addBtn.textContent = "+";
      addBtn.onclick = () => addToItinerary(place);

      li.appendChild(addBtn);
      placesToAdd.appendChild(li);
    });
    placesSection.style.display = "block";
  };

  const addToItinerary = (place) => {
    if (dayCount === 0) {
      alert("Please add a day to the itinerary first!");
      return;
    }

    const selectedDay = document.querySelector(".day.selected");
    if (!selectedDay) {
      alert("Please select a day to add this place!");
      return;
    }

    const dayList = selectedDay.querySelector("ul");
    const li = document.createElement("li");
    li.innerHTML = `${place.name} - <a href="${place.link}" target="_blank">Map Link</a>`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "-";
    removeBtn.onclick = () => li.remove();

    li.appendChild(removeBtn);
    dayList.appendChild(li);
  };

  addDayBtn.addEventListener("click", function () {
    if (dayCount < 6) {
      dayCount++;
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("day");
      dayDiv.innerHTML = `<h3>Day ${dayCount}</h3><ul></ul>`;
      itineraryContainer.appendChild(dayDiv);
      selectDay(dayDiv);
      dayDiv.addEventListener("click", () => selectDay(dayDiv));
    } else {
      alert("You can only add up to 6 days!");
    }
  });

  const selectDay = (dayDiv) => {
    document.querySelectorAll(".day").forEach(day => {
      day.classList.remove("selected");
    });
    dayDiv.classList.add("selected");
  };

  const downloadItinerary = () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Itinerary", 10, 10);
    let yPosition = 20;

    document.querySelectorAll(".day").forEach(dayDiv => {
      const dayTitle = dayDiv.querySelector("h3").textContent;
      pdf.setFontSize(14);
      pdf.text(dayTitle, 10, yPosition);
      yPosition += 10;

      const places = dayDiv.querySelectorAll("li");
      places.forEach(place => {
        const placeText = place.textContent.replace("Remove", "").trim();
        const linkElement = place.querySelector("a");
        const link = linkElement ? linkElement.href : "";
        pdf.setFontSize(12);
        pdf.textWithLink(placeText, 10, yPosition, { url: link });
        yPosition += 10;
      });
      yPosition += 5;
    });

    pdf.save("Itinerary.pdf");
  };

  downloadBtn.addEventListener("click", downloadItinerary);
  loadPlacesBtn.addEventListener("click", fetchPopularPlaces);
});
