/**
 *  @class
 *  @function PredictiveSearch
 */
class PredictiveSearch {
  constructor() {
    this.container = document.getElementById("Search-Drawer");
    this.form = this.container.querySelector("form.searchform");
    this.button = document.querySelectorAll(".thb-quick-search");
    this.input = this.container.querySelector('input[type="search"]');
    this.defaultTab = this.container.querySelector(
      ".side-panel-content--initial"
    );
    this.predictiveSearchResults = this.container.querySelector(
      ".side-panel-content--has-tabs"
    );

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.form.addEventListener("submit", this.onFormSubmit.bind(this));

    this.input.addEventListener(
      "input",
      debounce((event) => {
        this.onChange(event);
      }, 300).bind(this)
    );

    this.button.forEach((item, i) => {
      item.addEventListener("click", (event) => {
        var _this = this;
        event.preventDefault();
        document.getElementsByTagName("body")[0].classList.toggle("open-cc");
        this.container.classList.toggle("active");
        if (this.container.classList.contains("active")) {
          setTimeout(function () {
            _this.input.focus({
              preventScroll: true,
            });
          }, 100);
          dispatchCustomEvent("search:open");
        }

        return false;
      });
    });
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      this.predictiveSearchResults.classList.remove("active");
      return;
    }
    this.predictiveSearchResults.classList.add("active");
    this.getSearchResults(searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length) {
      event.preventDefault();
    }
  }

  onFocus() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      return;
    }

    this.getSearchResults(searchTerm);
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();

    this.predictiveSearchResults.classList.add("loading");

    fetch(
      `${theme.routes.predictive_search_url}?q=${encodeURIComponent(
        searchTerm
      )}&${encodeURIComponent(
        "resources[type]"
      )}=product,article,query&${encodeURIComponent(
        "resources[limit]"
      )}=10&section_id=predictive-search`
    )
      .then((response) => {
        this.predictiveSearchResults.classList.remove("loading");
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, "text/html")
          .querySelector("#shopify-section-predictive-search").innerHTML;

        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        throw error;
      });
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;

    let _this = this,
      submitButton = this.container.querySelector("#search-results-submit");

    submitButton.addEventListener("click", () => {
      _this.form.submit();
    });
  }

  close() {
    this.container.classList.remove("active");
  }
}

/**
 *  @class
 *  @function PredictiveSearch
 */
class HeaderPredictiveSearch {
  constructor() {
    this.container = document.getElementById("custom-header-search");
    this.form = this.container.querySelector("form.searchform");
    this.button = document.querySelector(".header-search-drawer-btn");
    this.input = this.container.querySelector('input[type="search"]');
    this.defaultTab = this.container.querySelector(
      ".side-panel-content--initial"
    );
    this.predictiveSearchResults = this.container.querySelector(
      ".side-panel-content--has-tabs"
    );

    this.setupEventListeners();
  }

  setupEventListeners() {
    var headerHeight =
      document.querySelector("#header").offsetHeight -
      document.querySelector(".full-menu").offsetHeight;
    var mask = document.querySelector(".search-drawer-mask");
    this.form.addEventListener("submit", this.onFormSubmit.bind(this));
    this.input.addEventListener(
      "input",
      debounce((event) => {
        this.onChange(event);
      }, 300).bind(this)
    );
    let _this = this;
    mask.addEventListener("click", function () {
      document.querySelector(".custom-header-search").style.height = "0";
      document.body.style.overflow = "auto";
      mask.style.opacity = 0;
      setTimeout(() => {
        mask.classList.toggle("open");
        _this.container.classList.toggle("open");
      }, 500);
    });
    this.button.addEventListener("click", (event) => {
      event.preventDefault();
      if (mask.classList.toString().indexOf("open") != -1) {
        // 开启状态时-关闭
        document.body.style.overflow = "auto";
        document.querySelector(".custom-header-search").style.height = "0";

        mask.style.opacity = 0;
        setTimeout(() => {
          mask.classList.toggle("open");
          _this.container.classList.toggle("open");
          document.getElementById('side-panel-search-input-header').focus()
        }, 500);
      } else {
        // 关闭状态-开启
        mask.classList.toggle("open");
        mask.style.top = headerHeight + "px";
        this.container.classList.toggle("open");
        if(document.documentElement.scrollTop>0){
          document.querySelector('#Search-Drawer-header').style.top = headerHeight + "px"
        }
        setTimeout(function () {
          document.querySelector(".custom-header-search.open").style.height =
            "468px";
          mask.style.opacity = 1;
        }, 100);
        document.body.style.overflow = "hidden";
        mask.style.opacity = 1;
      }
    });
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      this.predictiveSearchResults.classList.remove("active");
      return;
    }
    this.predictiveSearchResults.classList.add("active");
    this.getSearchResults(searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length) {
      event.preventDefault();
    }
  }

  onFocus() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      return;
    }

    this.getSearchResults(searchTerm);
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();

    this.predictiveSearchResults.classList.add("loading");

    fetch(
      `${theme.routes.predictive_search_url}?q=${encodeURIComponent(
        searchTerm
      )}&${encodeURIComponent(
        "resources[type]"
      )}=product,article,query&${encodeURIComponent(
        "resources[limit]"
      )}=10&section_id=predictive-search`
    )
      .then((response) => {
        this.predictiveSearchResults.classList.remove("loading");
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, "text/html")
          .querySelector("#shopify-section-predictive-search").innerHTML;

        this.renderSearchResults(resultsMarkup);
      })
      .catch((error) => {
        throw error;
      });
  }

  renderSearchResults(resultsMarkup) {
    this.predictiveSearchResults.innerHTML = resultsMarkup;

    let _this = this,
      submitButton = this.container.querySelector("#search-results-submit");

    submitButton.addEventListener("click", () => {
      _this.form.submit();
    });
  }

  close() {
    this.container.classList.remove("active");
  }
}
window.addEventListener("load", () => {
  if (typeof PredictiveSearch !== "undefined") {
    new PredictiveSearch();
    new HeaderPredictiveSearch();
  }
});
