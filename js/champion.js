(function () {
  "use strict";

  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const detail = document.getElementById("champDetail");

  let version = "";

  async function init() {
    const params = new URLSearchParams(location.search);
    const champId = params.get("champ");

    if (!champId) {
      return showError("No champion was specified. Go back and pick one.");
    }

    try {
      version = await App.getLatestVersion();
      const champ = await App.getChampion(champId);
      if (!champ) {
        return showError("Champion \"" + champId + "\" was not found.");
      }
      loadingState.hidden = true;
      detail.hidden = false;
      document.title = "LoL Explorer — " + champ.name;
      renderChampion(champ);
    } catch (err) {
      showError("Could not load this champion. (" + err.message + ")");
    }
  }

  function showError(message) {
    loadingState.hidden = true;
    errorState.hidden = false;
    errorState.textContent = message;
  }

  function renderChampion(champ) {
    const banner = document.getElementById("banner");
    banner.style.backgroundImage =
      "url('" + App.championSplash(champ.id, 0) + "')";

    document.getElementById("champName").textContent = champ.name;
    document.getElementById("champTitle").textContent = champ.title;

    const tagRow = document.getElementById("champTags");
    champ.tags.forEach(function (tag) {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      tagRow.appendChild(span);
    });

    const favBtn = document.getElementById("favBtn");
    function paintFav() {
      const fav = App.Storage.isFavorite(champ.id);
      favBtn.textContent = fav ? "★ Favorited" : "☆ Add to favorites";
      favBtn.classList.toggle("is-fav", fav);
    }
    paintFav();
    favBtn.addEventListener("click", function () {
      App.Storage.toggleFavorite(champ.id);
      paintFav();
    });

    document.getElementById("buildBtn").addEventListener("click", function () {
      location.href = "builds.html?champ=" + encodeURIComponent(champ.id);
    });

    const statsGrid = document.getElementById("statsGrid");
    const statRows = [
      ["Health", champ.stats.hp],
      ["Health / level", champ.stats.hpperlevel],
      ["Attack damage", champ.stats.attackdamage],
      ["Attack speed", champ.stats.attackspeed],
      ["Armor", champ.stats.armor],
      ["Magic resist", champ.stats.spellblock],
      ["Move speed", champ.stats.movespeed],
      ["Attack range", champ.stats.attackrange],
      ["Resource", champ.partype],
      ["Difficulty", champ.info.difficulty + " / 10"],
    ];
    statRows.forEach(function (row) {
      const li = document.createElement("li");
      li.className = "stats-grid__item";
      li.innerHTML =
        '<span class="stats-grid__label"></span>' +
        '<span class="stats-grid__value"></span>';
      li.querySelector(".stats-grid__label").textContent = row[0];
      li.querySelector(".stats-grid__value").textContent = row[1];
      statsGrid.appendChild(li);
    });

    const abilitiesRow = document.getElementById("abilitiesRow");
    const abilityDetail = document.getElementById("abilityDetail");
    const keys = ["P", "Q", "W", "E", "R"];

    const abilities = [
      {
        name: champ.passive.name,
        description: champ.passive.description,
        icon: App.passiveIcon(version, champ.passive.image.full),
      },
    ].concat(
      champ.spells.map(function (spell) {
        return {
          name: spell.name,
          description: spell.description,
          icon: App.spellIcon(version, spell.image.full),
        };
      })
    );

    abilities.forEach(function (ability, i) {
      const btn = document.createElement("button");
      btn.className = "ability";
      btn.setAttribute("aria-label", ability.name);

      const img = document.createElement("img");
      img.className = "ability__img";
      img.src = ability.icon;
      img.alt = ability.name;
      img.onerror = function () {
        App.imageFallback(img);
      };

      const key = document.createElement("span");
      key.className = "ability__key";
      key.textContent = keys[i];

      btn.appendChild(img);
      btn.appendChild(key);
      btn.addEventListener("click", function () {
        showAbility(ability, abilityDetail);
        Array.prototype.forEach.call(abilitiesRow.children, function (c) {
          c.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
      abilitiesRow.appendChild(btn);
    });

    document.getElementById("loreText").textContent = champ.lore;

    const skinsGallery = document.getElementById("skinsGallery");
    champ.skins.forEach(function (skin) {
      const fig = document.createElement("figure");
      fig.className = "skin";

      const img = document.createElement("img");
      img.className = "skin__img";
      img.loading = "lazy";
      img.alt =
        skin.name === "default" ? champ.name + " (default skin)" : skin.name;
      img.src = App.championLoading(champ.id, skin.num);
      img.onerror = function () {
        App.imageFallback(img);
      };

      const cap = document.createElement("figcaption");
      cap.className = "skin__name";
      cap.textContent = skin.name === "default" ? "Default" : skin.name;

      fig.appendChild(img);
      fig.appendChild(cap);
      skinsGallery.appendChild(fig);
    });
  }

  function showAbility(ability, container) {
    const plain = ability.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
    container.innerHTML =
      '<h3 class="ability-detail__name"></h3>' +
      '<p class="ability-detail__desc"></p>';
    container.querySelector(".ability-detail__name").textContent = ability.name;
    container.querySelector(".ability-detail__desc").textContent = plain.trim();
  }

  init();
})();
