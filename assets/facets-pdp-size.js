/**
 *  @class
 *  @function FacetsToggleSize
 */
class FacetsToggleSize {
  constructor() {
    this.container = document.getElementById("Facet-Drawer-size");
    let button = document.getElementById("Facets-Toggle-size");
    let cc = document.querySelector(".hide-panel-size");
    if (button) {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementsByTagName("body")[0].classList.toggle("open-cc");
        this.container.classList.toggle("active");
      });
    }
    setTimeout(function () {
      window.dispatchEvent(new Event("resize.resize-select"));
    }, 10);
  
    cc.addEventListener("click", (e) => {
      let panel = document.querySelectorAll(".side-panel.active");
      if (panel) {
        this.close_panel(e, panel[0]);
      }
    });
  }

  close_panel(e, panel) {
    if (e) {
      e.preventDefault();
    }
    if (!panel) {
      panel = e.target.closest(".side-panel");

      if (!panel) {
        return;
      }
    }
    if (panel.classList.contains("product-drawer")) {
      this.close_quick_view(panel);
    } else if (panel.classList.contains("cart-drawer")) {
      if (panel.querySelector(".product-recommendations--full")) {
        if (!document.body.classList.contains("open-quick-view")) {
          panel
            .querySelector(".product-recommendations--full")
            .classList.remove("active");
        }
      }
      if (window.innerWidth < 1069) {
        if (!document.body.classList.contains("open-quick-view")) {
          panel.classList.remove("active");
          document.body.classList.remove("open-cc");
          document.body.classList.remove("open-cart");
        } else {
          this.close_quick_view();
        }
      } else {
        if (panel.querySelector(".product-recommendations--full")) {
          if (!document.body.classList.contains("open-quick-view")) {
            setTimeout(() => {
              panel.classList.remove("active");
              document.body.classList.remove("open-cc");
              document.body.classList.remove("open-cart");
            }, 500);
          } else {
            this.close_quick_view();
          }
        } else {
          panel.classList.remove("active");
          document.body.classList.remove("open-cc");
          document.body.classList.remove("open-cart");
        }
      }
    } else {
      panel.classList.remove("active");
      document.body.classList.remove("open-cc");
    }
  }
}

window.addEventListener("load", () => {
  new FacetsToggleSize();
});