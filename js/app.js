(function () {
  "use strict";

  const DDRAGON = "https://ddragon.leagueoflegends.com";

  let LATEST_VERSION = null;
  let championListCache = null;
  let itemCache = null;

  async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Request failed (" + response.status + ") for " + url);
    }
    return await response.json();
  }

  async function getLatestVersion() {
    if (LATEST_VERSION) return LATEST_VERSION;

    const cached = sessionStorage.getItem("lol:version");
    if (cached) {
      LATEST_VERSION = cached;
      return LATEST_VERSION;
    }

    const versions = await fetchJSON(DDRAGON + "/api/versions.json");
    if (!Array.isArray(versions) || versions.length === 0) {
      throw new Error("versions.json was empty");
    }
    LATEST_VERSION = versions[0];
    try {
      sessionStorage.setItem("lol:version", LATEST_VERSION);
    } catch (e) {}
    return LATEST_VERSION;
  }

  async function getChampionList() {
    if (championListCache) return championListCache;
    const version = await getLatestVersion();
    const json = await fetchJSON(
      DDRAGON + "/cdn/" + version + "/data/en_US/champion.json"
    );
    championListCache = Object.values(json.data);
    return championListCache;
  }

  async function getChampion(id) {
    const version = await getLatestVersion();
    const json = await fetchJSON(
      DDRAGON + "/cdn/" + version + "/data/en_US/champion/" + id + ".json"
    );
    return json.data[id];
  }

  async function getItems() {
    if (itemCache) return itemCache;
    const version = await getLatestVersion();
    const json = await fetchJSON(
      DDRAGON + "/cdn/" + version + "/data/en_US/item.json"
    );
    itemCache = json.data;
    return itemCache;
  }

  function championIcon(version, imageFull) {
    return DDRAGON + "/cdn/" + version + "/img/champion/" + imageFull;
  }
  function championSplash(id, skinNum) {
    return DDRAGON + "/cdn/img/champion/splash/" + id + "_" + skinNum + ".jpg";
  }
  function championLoading(id, skinNum) {
    return DDRAGON + "/cdn/img/champion/loading/" + id + "_" + skinNum + ".jpg";
  }
  function spellIcon(version, imageFull) {
    return DDRAGON + "/cdn/" + version + "/img/spell/" + imageFull;
  }
  function passiveIcon(version, imageFull) {
    return DDRAGON + "/cdn/" + version + "/img/passive/" + imageFull;
  }
  function itemIcon(version, itemId) {
    return DDRAGON + "/cdn/" + version + "/img/item/" + itemId + ".png";
  }

  const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
        '<rect width="100%" height="100%" fill="#1e2330"/>' +
        '<text x="50%" y="50%" fill="#5a6680" font-size="14" ' +
        'text-anchor="middle" dominant-baseline="middle">no image</text></svg>'
    );

  function imageFallback(imgEl) {
    imgEl.onerror = null;
    imgEl.src = PLACEHOLDER;
  }

  const Storage = {
    read: function (key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    write: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    getFavorites: function () {
      return Storage.read("lol:favorites", []);
    },
    isFavorite: function (id) {
      return Storage.getFavorites().indexOf(id) !== -1;
    },
    toggleFavorite: function (id) {
      const list = Storage.getFavorites();
      const at = list.indexOf(id);
      if (at === -1) {
        list.push(id);
      } else {
        list.splice(at, 1);
      }
      Storage.write("lol:favorites", list);
      return list.indexOf(id) !== -1;
    },
    getBuilds: function () {
      return Storage.read("lol:builds", []);
    },
    saveBuild: function (build) {
      const list = Storage.getBuilds();
      list.push(build);
      Storage.write("lol:builds", list);
    },
    deleteBuild: function (id) {
      const list = Storage.getBuilds().filter(function (b) {
        return b.id !== id;
      });
      Storage.write("lol:builds", list);
    },
  };

  window.App = {
    getLatestVersion: getLatestVersion,
    getChampionList: getChampionList,
    getChampion: getChampion,
    getItems: getItems,
    championIcon: championIcon,
    championSplash: championSplash,
    championLoading: championLoading,
    spellIcon: spellIcon,
    passiveIcon: passiveIcon,
    itemIcon: itemIcon,
    imageFallback: imageFallback,
    PLACEHOLDER: PLACEHOLDER,
    Storage: Storage,
  };
})();
