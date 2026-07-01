(function () {
  "use strict";

  const grid = document.getElementById("champGrid");
  const resultCount = document.getElementById("resultCount");
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const patchLabel = document.getElementById("patchLabel");

  let allChampions = [];
  let version = "";

  async function init() {
    try {
      version = await App.getLatestVersion();
      patchLabel.textContent = version;
      allChampions = await App.getChampionList();
      loadingState.hidden = true;
      render(allChampions);
      resultCount.textContent = allChampions.length + " champions";
    } catch (err) {
      loadingState.hidden = true;
      errorState.hidden = false;
      errorState.textContent =
        "Could not load champions. Refresh to try again. (" + err.message + ")";
    }
  }

  function render(list) {
    grid.innerHTML = "";

    list.forEach(function (champ) {
      const card = document.createElement("article");
      card.className = "champ-card";

      const link = document.createElement("a");
      link.className = "champ-card__link";
      link.href = "champion.html?champ=" + encodeURIComponent(champ.id);

      const img = document.createElement("img");
      img.className = "champ-card__img";
      img.alt = champ.name;
      img.src = App.championIcon(version, champ.image.full);
      img.onerror = function () {
        App.imageFallback(img);
      };

      const name = document.createElement("h3");
      name.className = "champ-card__name";
      name.textContent = champ.name;

      const tags = document.createElement("p");
      tags.className = "champ-card__tags";
      tags.textContent = champ.tags.join(" · ");

      link.appendChild(img);
      link.appendChild(name);
      link.appendChild(tags);
      card.appendChild(link);
      grid.appendChild(card);
    });
  }

  init();
})();
