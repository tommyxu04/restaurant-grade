const searchBox = document.getElementById("searchBox");
const resultsDiv = document.getElementById("results");

searchBox.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const query = searchBox.value.trim();
    if (!query) return;

    resultsDiv.innerHTML = "Searching...";

    try {
      const response = await fetch(`https://api.ratings.food.gov.uk/Establishments?name=${encodeURIComponent(query)}`, {
        headers: { "x-api-version": "2" }
      });
      const data = await response.json();

      if (data.establishments && data.establishments.length > 0) {
        resultsDiv.innerHTML = "";
        data.establishments.slice(0, 5).forEach(est => {
          const div = document.createElement("div");
          div.classList.add("result");
          div.innerHTML = `
            <strong>${est.BusinessName}</strong><br>
            ${est.AddressLine1 || ""}, ${est.AddressLine2 || ""}<br>
            ${est.PostCode || ""}<br>
            <span class="rating">Rating: ${est.RatingValue}</span>
          `;
          resultsDiv.appendChild(div);
        });
      } else {
        resultsDiv.innerHTML = "No results found.";
      }
    } catch (err) {
      console.error(err);
      resultsDiv.innerHTML = "Error fetching data. Please try again.";
    }
  }
});