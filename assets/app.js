const version = 1;
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
var dispatchCustomEvent = function dispatchCustomEvent(eventName) {
  var data =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var detail = {
    detail: data,
  };
  var event = new CustomEvent(eventName, data ? detail : null);
  document.dispatchEvent(event);
};
window.recentlyViewedIds = [];

/**
 *  @class
 *  @function Quantity
 */
if (!customElements.get("quantity-selector")) {
  class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector(".qty");
      this.step = this.input.getAttribute("step");
      this.changeEvent = new Event("change", {
        bubbles: true,
      });
      // Create buttons
      this.subtract = this.querySelector(".minus");
      this.add = this.querySelector(".plus");

      // Add functionality to buttons
      this.subtract.addEventListener("click", () =>
        this.change_quantity(-1 * this.step)
      );
      this.add.addEventListener("click", () =>
        this.change_quantity(1 * this.step)
      );
    }
    connectedCallback() {
      this.classList.add("buttons_added");
      this.validateQtyRules();
    }
    change_quantity(change) {
      // Get current value
      let quantity = Number(this.input.value);

      // Ensure quantity is a valid number
      if (isNaN(quantity)) quantity = 1;

      // Check for min & max
      if (this.input.getAttribute("min") > quantity + change) {
        return;
      }
      if (this.input.getAttribute("max")) {
        if (this.input.getAttribute("max") < quantity + change) {
          return;
        }
      }
      // Change quantity
      quantity += change;

      // Ensure quantity is always a number
      quantity = Math.max(quantity, 1);

      // Output number
      this.input.value = quantity;

      this.input.dispatchEvent(this.changeEvent);

      this.validateQtyRules();
    }
    validateQtyRules() {
      const value = parseInt(this.input.value);
      if (this.input.min) {
        const min = parseInt(this.input.min);
        this.subtract.classList.toggle("disabled", value <= min);
      }
      if (this.input.max) {
        const max = parseInt(this.input.max);
        this.add.classList.toggle("disabled", value >= max);
      }
    }
  }
  customElements.define("quantity-selector", QuantityInput);
}

/**
 *  @class
 *  @function ArrowSubMenu
 */
class ArrowSubMenu {
  constructor(self) {
    this.submenu = self.parentNode.querySelector(".sub-menu");
    this.arrow = self;
    // Add functionality to buttons
    self.addEventListener("click", (e) => this.toggle_submenu(e));
  }

  toggle_submenu(e) {
    e.preventDefault();
    let submenu = this.submenu;

    if (!submenu.classList.contains("active")) {
      submenu.classList.add("active");
    } else {
      submenu.classList.remove("active");
      this.arrow.blur();
    }
  }
}
let arrows = document.querySelectorAll(".thb-arrow");
arrows.forEach((arrow) => {
  new ArrowSubMenu(arrow);
});

/**
 *  @class
 *  @function ProductCard
 */
if (!customElements.get("product-card")) {
  class ProductCard extends HTMLElement {
    constructor() {
      super();
      this.swatches = this.querySelector(".product-card-swatches");
      this.image = this.querySelector(
        ".product-featured-image-link .product-primary-image"
      );
      this.additional_images = this.querySelectorAll(
        ".product-secondary-image"
      );
      this.additional_images_nav = this.querySelectorAll(
        ".product-secondary-images-nav li"
      );
      this.quick_add = this.querySelector(
        ".product-card--add-to-cart-button-simple"
      );
    }
    connectedCallback() {
      if (this.swatches) {
        this.enableSwatches(this.swatches, this.image);
      }
      if (this.additional_images) {
        if(document.body.clientWidth > 768){
          this.changeImagesOnMobile();
          this.enableAdditionalImages();
        }
        // this.enableAdditionalImages();
        this.changeImagesOnMobile();
      }
      if (this.quick_add) {
        this.enableQuickAdd();
      }
    }
    enableAdditionalImages() {
      let image_length = this.additional_images.length;
      let images = this.additional_images;
      let nav = this.additional_images_nav;
      let image_container = this.querySelector(".product-featured-image");
      const mousemove = function (e) {
        let mobile_swipe =
          e.target.parentNode.parentNode.parentNode.getAttribute(
            "data-mobile_swipe"
          ) || true;
        let screenWidth = document.body.clientWidth;
        
        let l = e.offsetX;
        let w = this.getBoundingClientRect().width;
        let prc = l / w;
        let sel = Math.floor(prc * image_length);
        let selimg = images[sel];

        images.forEach((image, index) => {
          if (image.classList.contains("hover")) {
            image.classList.remove("hover");
            if (nav.length) {
              nav[index].classList.remove("active");
            }
          }
        });
        if (selimg) {
          if (!selimg.classList.contains("hover")) {
            selimg.classList.add("hover");
            if (nav.length) {
              nav[sel].classList.add("active");
            }
          }
        }
      };
      const mouseleave = function (e) {
        images.forEach((image, index) => {
          image.classList.remove("hover");
          if (nav.length) {
            nav[index].classList.remove("active");
          }
        });
      };

      if (image_container) {
        // image_container.addEventListener("touchstart", mousemove, {
        //   passive: true,
        // });
        // image_container.addEventListener("touchmove", mousemove, {
        //   passive: true,
        // });
        // image_container.addEventListener("touchend", mouseleave, {
        //   passive: true,
        // });
        if (document.body.clientWidth > 768) {
          image_container.addEventListener("mouseenter", mousemove, {
            passive: true,
          });
          image_container.addEventListener("mousemove", mousemove, {
            passive: true,
          });
          image_container.addEventListener("mouseleave", mouseleave, {
            passive: true,
          });
        }
      }
    }

    enableSwatches(swatches, image) {
      let swatch_list = swatches.querySelectorAll(".product-card-swatch"),
        org_srcset = image ? image.dataset.srcset : "",
        active = swatches.querySelector(".product-card-swatch.active");

      swatch_list.forEach((swatch, index) => {
        swatch.addEventListener("mouseover", function () {
          [].forEach.call(swatch_list, function (el) {
            el.classList.remove("active");
          });
          if (image) {
            if (swatch.dataset.srcset) {
              image.setAttribute("srcset", swatch.dataset.srcset);
            } else {
              image.setAttribute("srcset", org_srcset);
            }
          }

          swatch.classList.add("active");
        });
        swatch.addEventListener("click", function (evt) {
          window.location.href = this.dataset.href;
          evt.preventDefault();
        });
      });
    }
    enableQuickAdd() {
      this.quick_add.addEventListener("click", this.quickAdd.bind(this));
    }

    quickAdd(evt) {
      evt.preventDefault();
      if (this.quick_add.disabled) {
        return;
      }
      this.quick_add.classList.add("loading");
      this.quick_add.setAttribute("aria-disabled", true);

      const config = {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/javascript",
        },
      };

      let formData = new FormData(this.form);

      formData.append("id", this.quick_add.dataset.productId);
      formData.append("quantity", 1);
      formData.append(
        "sections",
        this.getSectionsToRender().map((section) => section.section)
      );
      formData.append("sections_url", window.location.pathname);

      config.body = formData;

      fetch(`${theme.routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            return;
          }
          this.renderContents(response);

          dispatchCustomEvent("cart:item-added", {
            product: response.hasOwnProperty("items")
              ? response.items[0]
              : response,
          });
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.quick_add.classList.remove("loading");
          this.quick_add.removeAttribute("aria-disabled");
        });

      return false;
    }
    getSectionsToRender() {
      return [
        {
          id: "Cart",
          section: "main-cart",
          selector: ".thb-cart-form",
        },
        {
          id: "Cart-Drawer",
          section: "cart-drawer",
          selector: ".cart-drawer",
        },
        {
          id: "cart-drawer-toggle",
          section: "cart-bubble",
          selector: ".thb-item-count",
        },
      ];
    }
    renderContents(parsedState) {
      this.getSectionsToRender().forEach((section) => {
        if (!document.getElementById(section.id)) {
          return;
        }
        const elementToReplace =
          document.getElementById(section.id).querySelector(section.selector) ||
          document.getElementById(section.id);
        elementToReplace.innerHTML = this.getSectionInnerHTML(
          parsedState.sections[section.section],
          section.selector
        );
        if (typeof CartDrawer !== "undefined") {
          new CartDrawer();
        }
        if (typeof Cart !== "undefined") {
          new Cart().renderContents(parsedState);
        }
      });

      if (document.getElementById("Cart-Drawer")) {
        document.getElementById("Cart-Drawer").classList.add("active");
        document.body.classList.add("open-cart");
        document.body.classList.add("open-cc");
        if (
          document
            .getElementById("Cart-Drawer")
            .querySelector(".product-recommendations--full")
        ) {
          document
            .getElementById("Cart-Drawer")
            .querySelector(".product-recommendations--full")
            .classList.add("active");
        }
        dispatchCustomEvent("cart-drawer:open");

      }
    }
    getSectionInnerHTML(html, selector = ".shopify-section") {
      return new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(selector).innerHTML;
    }
    changeImagesOnMobile() {
        const screenWidth = document.body.clientWidth;
        if (screenWidth > 768) return;
      }
      getDirection(startX, startY, endX, endY) {
        let dy = startY - endY;
        let dx = endX - startX;
        let result = 0;

        //如果滑动距离太短
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
          return result;
        }

        let angle = this.getAngle(dx, dy);
        if (angle >= -45 && angle < 45) {
          result = 4; //向右
        } else if (angle >= 45 && angle < 135) {
          result = 1; //向上
        } else if (angle >= -135 && angle < -45) {
          result = 2; //向下
        } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
          result = 3; //向左
        }

        return result;
      }
      //根据坐标差值计算角度
      getAngle(dx, dy) {
        return Math.atan2(dy, dx) * 180 / Math.PI;
      }
  }
  customElements.define("product-card", ProductCard);
}

let lastScrollTop = 0; // to track scroll position 
let hasScrolledPastThreshold = false;

/**
 *  @class
 *  @function Header
 */
class Header {
  constructor() {
    const header = document.querySelector(".header-section"),
      header_main = document.getElementById("header"),
      menu = document.getElementById("mobile-menu"),
      toggle = document.querySelector(".mobile-toggle-wrapper"),
      fullMenu = document.querySelector(".full-menu"),
      setHeaderOffset = this.setHeaderOffset,
      setAnnouncementHeight = this.setAnnouncementHeight,
      setHeaderHeight = this.setHeaderHeight,
      showOrHideHeaderMenu = this.showOrHideHeaderMenu;
      document.querySelector(".mobile-menu-drawer").style.height = document.documentElement.clientHeight - 110 + "px";
      window.addEventListener("resize", function () {
        document.querySelector(".thb-secondary-area").style.bottom = "0px";
        document.querySelector(".mobile-menu-drawer").style.height = document.documentElement.clientHeight - 110 + "px";
      });
      document
      .querySelector(".mobile-menu-drawer")
      .addEventListener("touchmove", function (e) {
        e.preventDefault();
      });
      document
        .querySelector(".mobile-menu-drawer ul")
        .addEventListener("touchmove", function (e) {
          e.stopPropagation();
        });
      if (!header_main) {
        return;
      }
    document.addEventListener("keyup", (e) => {
      if (e.code) {
        if (e.code.toUpperCase() === "ESCAPE") {
          toggle.removeAttribute("open");
          toggle.classList.remove("active");
        }
      }
    });
    toggle.querySelector(".mobile-toggle").addEventListener("click", (e) => {
      setAnnouncementHeight(header);
      if (toggle.classList.contains("active")) {
        e.preventDefault();
        document.body.classList.remove("overflow-hidden");
        toggle.classList.remove("active");
        this.closeAnimation(toggle);
      } else {
        document.body.classList.add("overflow-hidden");
        setTimeout(() => {
          toggle.classList.add("active");
        });
      }
      window.dispatchEvent(new Event("resize.resize-select"));
    });

    // let cart_drawer = document.getElementById("Cart-Drawer");
    // let screen_blurrer = document.getElementById("screen_blurrer");

    // Mobile Menu offset
    window.addEventListener(
      "scroll",
      function () {
        setHeaderOffset(header);
        setHeaderHeight(header_main);

        // if (header_main.classList.contains("is-sticky")) {
        //   if (document.getElementById("thb-currency-code").value !== 'FR') {
        //     screen_blurrer.style.top = "80px";
        //     cart_drawer.style.top = "80px";
        //   } else {
        //     screen_blurrer.style.top = "70px";
        //     cart_drawer.style.top = "70px";
        //   }
        // } else {
        //   if (document.getElementById("thb-currency-code").value !== 'FR') {
        //     screen_blurrer.style.top = "100px";
        //     cart_drawer.style.top = "100px";
        //   } else {
        //     screen_blurrer.style.top = "70px";
        //     cart_drawer.style.top = "70px";
        //   }
        // }

        // Sticky Header Class
        if (header_main.classList.contains("header-sticky--active")) {
          let offset =
            parseInt(header_main.getBoundingClientRect().top, 10) +
            document.documentElement.scrollTop;

          header_main.classList.toggle(
            "is-sticky",
            window.scrollY >= offset && window.scrollY > 0
          );
        }
        showOrHideHeaderMenu(fullMenu);
      },
      {
        passive: true,
      }
    );
    window.dispatchEvent(new Event("scroll"));

    if (document.getElementById("shopify-section-announcement-bar")) {
      const a_bar = document.getElementById("shopify-section-announcement-bar");
      window.addEventListener(
        "resize",
        function () {
          setAnnouncementHeight(a_bar);
        },
        {
          passive: true,
        }
      );
      window.dispatchEvent(new Event("resize"));
    }
    // Buttons.
    menu
      .querySelectorAll("summary")
      .forEach((summary) =>
        summary.addEventListener("click", this.onSummaryClick.bind(this))
      );
    menu
      .querySelectorAll("button")
      .forEach((button) =>
        button.addEventListener("click", this.onCloseButtonClick.bind(this))
      );
      this.showOrHideHeaderMenu = this.showOrHideHeaderMenu.bind(this); 

      window.addEventListener('scroll', () => {
        this.showOrHideHeaderMenu(fullMenu); 
      }, { passive: true });
  
      window.dispatchEvent(new Event('scroll'));
  }
  setAnnouncementHeight(a_bar) {
    let h = a_bar.clientHeight;
    document.documentElement.style.setProperty(
      "--announcement-height",
      h + "px"
    );
  }
  setHeaderOffset(header) {
    let h = header.getBoundingClientRect().top;
    document.documentElement.style.setProperty("--header-offset", h + "px");
  }
  setHeaderHeight(header) {
    let h = header.clientHeight;
    document.documentElement.style.setProperty("--header-height", h + "px");
  }
  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest(".link-container");
    const isOpen = detailsElement.hasAttribute("open");

    setTimeout(() => {
      detailsElement.classList.add("menu-opening");
      parentMenuElement && parentMenuElement.classList.add("submenu-open");
    }, 100);
  }
  onCloseButtonClick(event) {
    event.preventDefault();
    const detailsElement = event.currentTarget.closest("details");
    this.closeSubmenu(detailsElement);
  }
  closeSubmenu(detailsElement) {
    detailsElement.classList.remove("menu-opening");
    this.closeAnimation(detailsElement);
  }
  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute("open");
        detailsElement.querySelectorAll("details").forEach((details) => {
          details.removeAttribute("open");
          details.classList.remove("menu-opening");
          details.classList.remove("submenu-open");
        });
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
  showOrHideHeaderMenu(allMenu) {
    const currentScrollTop = document.documentElement.scrollTop;
    const scrollThreshold = 50;

    if (Math.abs(currentScrollTop - lastScrollTop) > scrollThreshold) {
      if (currentScrollTop < lastScrollTop) {
        allMenu.classList.remove("hide-all-menu");
      } else {
        allMenu.classList.add("hide-all-menu");
      }
      lastScrollTop = currentScrollTop;
    }
  }
}
/**
 *  @class
 *  @function FullMenu
 */
if (!customElements.get("full-menu")) {
  class FullMenu extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.submenus = this.querySelectorAll(
        ".thb-full-menu>.menu-item-has-children:not(.menu-item-has-megamenu)>.sub-menu"
      );

      if (!this.submenus.length) {
        return;
      }
      const _this = this;
      // resize on initial load
      window.addEventListener(
        "resize",
        debounce(function () {
          _this.resizeSubMenus();
        }, 100)
      );

      window.dispatchEvent(new Event("resize"));

      document.fonts.ready.then(function () {
        _this.resizeSubMenus();
      });
    }
    resizeSubMenus() {
      this.submenus.forEach((submenu) => {
        let sub_submenus = submenu.querySelectorAll(
          ":scope >.menu-item-has-children>.sub-menu"
        );

        sub_submenus.forEach((sub_submenu) => {
          let w = sub_submenu.offsetWidth,
            l =
              sub_submenu.parentElement.parentElement.getBoundingClientRect()
                .left +
              sub_submenu.parentElement.parentElement.clientWidth +
              10,
            total = w + l;
          if (total > document.body.clientWidth) {
            sub_submenu.parentElement.classList.add("left-submenu");
          } else if (
            sub_submenu.parentElement.classList.contains("left-submenu")
          ) {
            sub_submenu.parentElement.classList.remove("left-submenu");
          }
        });
      });
    }
  }
  customElements.define("full-menu", FullMenu);
}
/**
 *  @class
 *  @function PanelClose
 */
if (!customElements.get("side-panel-close")) {
  class PanelClose extends HTMLElement {
    constructor() {
      super();
      let cc = document.querySelector(".click-capture");

      // Add functionality to buttons
      this.addEventListener("click", (e) => this.close_panel(e));
      document.addEventListener("panel:close", (e) => {
        let panel = document.querySelectorAll(".side-panel.active");
        if (panel) {
          this.close_panel(e, panel[0]);
        }
      });
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
    close_quick_view(panel) {
      panel = panel ? panel : document.getElementById("Product-Drawer");

      if (panel.querySelector(".product-quick-images--container")) {
        panel
          .querySelector(".product-quick-images--container")
          .classList.remove("active");
      }
      if (window.innerWidth < 1069) {
        panel.classList.remove("active");
        if (!document.body.classList.contains("open-cart")) {
          document.body.classList.remove("open-cc");
        }
        document.body.classList.remove("open-quick-view");
      } else {
        if (panel.querySelector(".product-quick-images--container")) {
          setTimeout(() => {
            panel.classList.remove("active");
            if (!document.body.classList.contains("open-cart")) {
              document.body.classList.remove("open-cc");
            }
            document.body.classList.remove("open-quick-view");
            panel.querySelector("#Product-Drawer-Content").innerHTML = "";
          }, 500);
        }
      }
    }
  }
  customElements.define("side-panel-close", PanelClose);

  document.addEventListener("keyup", (e) => {
    if (e.code) {
      if (e.code.toUpperCase() === "ESCAPE") {
        dispatchCustomEvent("panel:close");
      }
    }
  });
}
/**
 *  @class
 *  @function CartDrawer
 */
class CartDrawer {
  constructor() {
    this.container = document.getElementById("Cart-Drawer");

    if (!this.container) {
      return;
    }
    let _this = this,
      button = document.getElementById("cart-drawer-toggle"),
      quantities = this.container.querySelectorAll(".quantity input");

    // Add functionality to buttons
    button.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.add("open-cc");
      document.body.classList.add("open-cart");
      this.container.classList.add("active");
      this.container.focus();
      setTimeout(() => {
        if (this.container.querySelector(".product-recommendations--full")) {
          this.container
            .querySelector(".product-recommendations--full")
            .classList.add("active");
        }
      });
      dispatchCustomEvent("cart-drawer:open");
    });

    button.addEventListener("mouseover", (e) => {
      e.preventDefault();
      document.body.classList.add("open-cc");
      document.body.classList.add("open-cart");
      this.container.classList.add("active");
      this.container.focus();
      setTimeout(() => {
        if (this.container.querySelector(".product-recommendations--full")) {
          this.container
            .querySelector(".product-recommendations--full")
            .classList.add("active");
        }
      });
      dispatchCustomEvent("cart-drawer:open");
      // button.removeEventListener("mouseover");
    });

    this.container.addEventListener("mouseleave", (e) => {
      e.preventDefault();
      document.body.classList.remove("open-cc");
      document.body.classList.remove("open-cart");
      this.container.classList.remove("active");
      this.container.focus();
      setTimeout(() => {
        if (this.container.querySelector(".product-recommendations--full")) {
          this.container
            .querySelector(".product-recommendations--full")
            .classList.remove("active");
        }
      });
      dispatchCustomEvent("cart-drawer:close");
    })

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.container.addEventListener(
      "change",
      this.debouncedOnChange.bind(this)
    );

    this.notesToggle();
    this.removeProductEvent();
    this.updateFreeShipping();
    // Terms checkbox
    this.termsCheckbox();
  }
  onChange(event) {
    if (event.target.classList.contains("qty")) {
      this.updateQuantity(event.target.dataset.index, event.target.value);
    }
  }
  removeProductEvent() {
    let removes = this.container.querySelectorAll(".remove");

    removes.forEach((remove) => {
      remove.addEventListener("click", (event) => {
        this.updateQuantity(event.target.dataset.index, "0");

        event.preventDefault();
      });
    });
  }
  getSectionsToRender() {
    return [
      {
        id: "Cart-Drawer",
        section: "cart-drawer",
        selector: ".cart-drawer",
      },
      {
        id: "cart-drawer-toggle",
        section: "cart-bubble",
        selector: ".thb-item-count",
      },
    ];
  }
  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }
  termsCheckbox() {
    let terms_checkbox = this.container.querySelector("#CartDrawerTerms"),
      checkout_button = this.container.querySelector(".button.checkout");

    if (terms_checkbox && checkout_button) {
      terms_checkbox.setCustomValidity(theme.strings.requiresTerms);
      checkout_button.addEventListener("click", function (e) {
        if (!terms_checkbox.checked) {
          terms_checkbox.reportValidity();
          terms_checkbox.focus();
          e.preventDefault();
        }
      });
    }
  }
  notesToggle() {
    let notes_toggle = document.getElementById("order-note-toggle");
    let cart_drawer_footer = document.getElementById("cart-drawer-footer");

    if (!notes_toggle) {
      return;
    }

    notes_toggle.addEventListener("click", (event) => {
      notes_toggle.nextElementSibling.classList.add("active");
      cart_drawer_footer.classList.add("grayer");
    });

    notes_toggle.nextElementSibling
      .querySelectorAll(".button, .order-note-toggle__content-overlay")
      .forEach((el) => {
        el.addEventListener("click", (event) => {
          notes_toggle.nextElementSibling.classList.remove("active");
          cart_drawer_footer.classList.remove("grayer");
          this.saveNotes();
        });
      });
  }
  saveNotes() {
    fetch(`${theme.routes.cart_update_url}.js`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json`,
      },
      body: JSON.stringify({
        note: document.getElementById("mini-cart__notes").value,
      }),
    });
  }
  updateFreeShipping() {
    const free_shipping = this.container.querySelector(".free-shipping");

    if (free_shipping) {
      let amount_text = free_shipping.querySelector(
        ".free-shipping--text span"
      );
      let total = parseInt(free_shipping.dataset.cartTotal, 10);
      let minimum = Math.round(
        parseInt(free_shipping.dataset.minimum, 10) *
          (Shopify.currency.rate || 1)
      );
      let percentage = 1;

      if (total < minimum) {
        percentage = total / minimum;

        if (amount_text) {
          let remaining = minimum - total,
            format =
              window.theme.settings.money_with_currency_format || "${{amount}}";
          amount_text.innerHTML = formatMoney(remaining, format);
        }
      }

      free_shipping.style.setProperty("--percentage", percentage);
    }
  }
  updateQuantity(line, quantity) {
    this.container
      .querySelector(`#CartDrawerItem-${line}`)
      .classList.add("thb-loading");
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    dispatchCustomEvent("line-item:change:start", {
      quantity: quantity,
    });
    if (this.container.querySelector(".product-recommendations--full")) {
      this.container
        .querySelector(".product-recommendations--full")
        .classList.remove("active");
    }
    fetch(`${theme.routes.cart_change_url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json`,
      },
      ...{
        body,
      },
    })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document
              .getElementById(section.id)
              .querySelector(section.selector) ||
            document.getElementById(section.id);

          if (parsedState.sections) {
            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              section.selector
            );
          }
        });

        this.removeProductEvent();
        this.notesToggle();
        this.termsCheckbox();
        this.updateFreeShipping();
        dispatchCustomEvent("line-item:change:end", {
          quantity: quantity,
          cart: parsedState,
        });

        if (this.container.querySelector(`#CartDrawerItem-${line}`)) {
          this.container
            .querySelector(`#CartDrawerItem-${line}`)
            .classList.remove("thb-loading");
        }
      });
  }
}

/**
 *  @class
 *  @function ModalDialog
 */
class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      "click",
      this.hide.bind(this)
    );
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ESCAPE") {
        this.hide();
      }
    });
    if (this.classList.contains("media-modal")) {
      this.addEventListener("pointerup", (event) => {
        if (
          event.pointerType === "mouse" &&
          !event.target.closest("product-model")
        )
          this.hide();
      });
    } else {
      this.addEventListener("click", (event) => {
        if (event.target.nodeName === "MODAL-DIALOG") this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    document.body.classList.add("overflow-hidden");
    this.setAttribute("open", "");
  }

  hide() {
    document.body.classList.remove("overflow-hidden");
    this.removeAttribute("open");
    this.querySelectorAll(".js-youtube").forEach((video) => {
      video.contentWindow.postMessage(
        '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
        "*"
      );
    });
    this.querySelectorAll(".js-vimeo").forEach((video) => {
      video.contentWindow.postMessage('{"method":"pause"}', "*");
    });
    this.querySelectorAll("video").forEach((video) => video.pause());
  }
}
customElements.define("modal-dialog", ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const modal = document.querySelector(this.getAttribute("data-modal"));
      if (modal) modal.show(button);
    });
  }
}
customElements.define("modal-opener", ModalOpener);

/**
 *  @class
 *  @function Localization
 */
class Localization {
  constructor() {
    let _this = this;
    // resize on initial load
    document
      .querySelectorAll(".thb-localization-forms")
      .forEach((localization) => {
        localization.addEventListener("change", (e) => {
          if (e.target.value == "CN") {
            window.open("https://www.repetto.com.cn/", '_blank').focus();
          } else if (e.target.value == "JP") {
            window.open("https://www.repetto.jp/", '_blank').focus();
          } else if (e.target.value == "KR") {
            window.open("https://www.repetto.kr/", '_blank').focus();
          } else {
            localization.querySelector("form").submit();
          }
        });
      });
  }
}

/**
 *  @class
 *  @function SelectWidth
 */
class SelectWidth {
  constructor() {
    let _this = this;
    // resize on initial load
    window.addEventListener("load", () => {
      document.querySelectorAll(".resize-select").forEach(_this.resizeSelect);
    });

    // delegated listener on change
    document.body.addEventListener("change", (e) => {
      if (
        e.target.matches(".resize-select") &&
        e.target.offsetParent !== null
      ) {
        _this.resizeSelect(e.target);
      }
    });
    window.addEventListener("resize.resize-select", function () {
      document.querySelectorAll(".resize-select").forEach(_this.resizeSelect);
    });
  }

  resizeSelect(sel) {
    let tempOption = document.createElement("option");
    tempOption.textContent = sel.selectedOptions[0].textContent;

    let tempSelect = document.createElement("select"),
      offset = 13;
    tempSelect.style.visibility = "hidden";
    tempSelect.style.position = "fixed";
    tempSelect.appendChild(tempOption);
    if (
      sel.classList.contains("thb-language-code") ||
      sel.classList.contains("thb-currency-code") ||
      sel.classList.contains("facet-filters__sort")
    ) {
      offset = 2;
    }
    sel.after(tempSelect);
    if (tempSelect.clientWidth > 0) {
      sel.style.width = `${+tempSelect.clientWidth + offset}px`;
    }
    tempSelect.remove();
  }
}

if (typeof SelectWidth !== "undefined") {
  new SelectWidth();
}

/**
 *  @class
 *  @function FooterMenuToggle
 */
class FooterMenuToggle {
  constructor() {
    let _this = this;
    // resize on initial load
    document
      .querySelectorAll(".thb-widget-title.collapsible")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          button.children[0].classList.toggle("active");
          button.classList.toggle("active");
        });
      });
  }
}

/**
 *  @class
 *  @function QuickView
 */
if (!customElements.get("quick-view")) {
  class QuickView extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.cc = document.querySelector(".click-capture");
      this.drawer = document.getElementById("Product-Drawer");
      this.body = document.body;

      this.addEventListener("click", this.setupEventListener.bind(this));
    }
    setupEventListener(e) {
      e.preventDefault();
      let productHandle = this.dataset.productHandle,
        href = `${theme.routes.root_url}/products/${productHandle}?view=quick-view`;

      // remove double `/` in case shop might have /en or language in URL
      href = href.replace("//", "/");
      if (!href || !productHandle) {
        return;
      }
      if (this.classList.contains("loading")) {
        return;
      }
      this.classList.add("loading");
      fetch(href, {
        method: "GET",
      })
        .then((response) => {
          this.classList.remove("loading");
          return response.text();
        })
        .then((text) => {
          const sectionInnerHTML = new DOMParser()
            .parseFromString(text, "text/html")
            .querySelector("#Product-Drawer-Content").innerHTML;

          this.renderQuickview(sectionInnerHTML, href, productHandle);
        });
    }
    renderQuickview(sectionInnerHTML, href, productHandle) {
      if (sectionInnerHTML) {
        this.drawer.querySelector("#Product-Drawer-Content").innerHTML =
          sectionInnerHTML;

        let js_files = this.drawer
          .querySelector("#Product-Drawer-Content")
          .querySelectorAll("script");

        if (js_files.length > 0) {
          var head = document.getElementsByTagName("head")[0];
          js_files.forEach((js_file, i) => {
            let script = document.createElement("script");
            script.src = js_file.src;
            head.appendChild(script);
          });
        }

        setTimeout(() => {
          if (Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }
          if (window.ProductModel) {
            window.ProductModel.loadShopifyXR();
          }
        }, 300);

        this.body.classList.add("open-cc");
        this.body.classList.add("open-quick-view");
        this.drawer.classList.add("active");

        this.drawer.querySelector(".side-panel-close").focus();

        setTimeout(() => {
          this.drawer
            .querySelector(".product-quick-images--container")
            .classList.add("active");
        });
        dispatchCustomEvent("quick-view:open", {
          productUrl: href,
          productHandle: productHandle,
        });
        addIdToRecentlyViewed(productHandle);
      }
    }
  }
  customElements.define("quick-view", QuickView);
}

/**
 *  @class
 *  @function SidePanelContentTabs
 */
if (!customElements.get("side-panel-content-tabs")) {
  class SidePanelContentTabs extends HTMLElement {
    constructor() {
      super();
      this.buttons = this.querySelectorAll("button");
      this.panels = this.parentElement.querySelectorAll(
        ".side-panel-content--tab-panel"
      );
    }

    // ADD HERE THE HOVER ?
    connectedCallback() {
      this.setupButtonObservers();
    }
    disconnectedCallback() {}
    setupButtonObservers() {
      this.buttons.forEach((item, i) => {
        item.addEventListener("click", (e) => {
          this.toggleActiveClass(i);
        });
      });
    }
    toggleActiveClass(i) {
      this.buttons.forEach((button) => {
        button.classList.remove("tab-active");
      });
      this.buttons[i].classList.add("tab-active");

      this.panels.forEach((panel) => {
        panel.classList.remove("tab-active");
      });
      this.panels[i].classList.add("tab-active");
    }
  }

  customElements.define("side-panel-content-tabs", SidePanelContentTabs);
}

/**
 *  @class
 *  @function CollapsibleRow
 */
if (!customElements.get("collapsible-row")) {
  class CollapsibleRow extends HTMLElement {
    constructor() {
      super();

      this.details = this.querySelector("details");
      this.summary = this.querySelector("summary");
      this.content = this.querySelector(".collapsible__content");
    }
    connectedCallback() {
      this.setListeners();
    }
    setListeners() {
      if (
        document.body.classList.contains("animations-true") &&
        typeof gsap !== "undefined"
      ) {
        setTimeout(() => {
          this.prepareAnimations();
          this.querySelector("summary").addEventListener("click", (e) =>
            this.onClick(e)
          );
        }, 400);
      }
    }
    prepareAnimations() {
      let _this = this,
        summary_height = this.querySelector("summary").offsetHeight,
        content_height = this.querySelector(
          ".collapsible__content"
        ).offsetHeight,
        initial_height = summary_height,
        final_height = summary_height + content_height;

      this.tl = false;
      this.tl = gsap.timeline({
        reversed: !_this.details.open,
        paused: true,
        inherit: false,
        ease: "sine.inOut",
        onStart: function () {
          _this.details.open = true;
          _this.details.style.overflow = "hidden";
        },
        onReverseComplete: function () {
          _this.details.open = false;
          _this.details.style.overflow = "";
        },
      });

      this.tl.fromTo(
        _this.details,
        {
          height: function () {
            let h = Math.max(Math.max(initial_height, 0), 24);
            return h;
          },
          clearProps: "height",
        },
        {
          duration: 0.6,
          height: final_height,
          clearProps: "height",
        }
      );

      if (this.details.open) {
        this.tl.progress(1);
      }
    }
    instantClose() {
      this.tl.timeScale(10).reverse();
    }
    animateClose() {
      this.tl.timeScale(3).reverse();
    }
    animateOpen() {
      this.tl.timeScale(1).play();
    }
    onClick(e) {
      e.preventDefault();
      if (this.tl.reversed()) {
        this.tl.timeScale(1).play();
      } else {
        this.tl.timeScale(3).reverse();
      }
    }
  }
  customElements.define("collapsible-row", CollapsibleRow);
}
/**
 *  @function addIdToRecentlyViewed
 */
function addIdToRecentlyViewed(handle) {
  if (!handle) {
    let product = document.querySelector(".thb-product-detail");

    if (product) {
      handle = product.dataset.handle;

      if (!handle) {
        return;
      }
    }
  }
  if (window.localStorage) {
    let recentIds = window.localStorage.getItem("recently-viewed");
    if (recentIds && typeof recentIds !== undefined) {
      window.recentlyViewedIds = JSON.parse(recentIds);
    }
  }
  // Remove current product if already in recently viewed array
  var i = window.recentlyViewedIds.indexOf(handle);

  if (i > -1) {
    window.recentlyViewedIds.splice(i, 1);
  }

  // Add id to array
  window.recentlyViewedIds.unshift(handle);

  if (window.localStorage) {
    window.localStorage.setItem(
      "recently-viewed",
      JSON.stringify(window.recentlyViewedIds)
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof Localization !== "undefined") {
    new Localization();
  }
  if (typeof CartDrawer !== "undefined") {
    new CartDrawer();
  }
  if (typeof Header !== "undefined") {
    new Header();
  }
  if (typeof FooterMenuToggle !== "undefined") {
    new FooterMenuToggle();
  }
});

window.onload = function () {
  if (document.body.offsetWidth > 768) return;
  var slideBar = document.querySelector(".slide-bar-inner");
  var bodyHeight = document.querySelector("#main-content").offsetHeight;
  window.addEventListener("scroll", function () {
    var scrollTop =
      window.scrollTop ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    slideBar.style.width =
      Number((scrollTop / bodyHeight) * 100).toFixed(2) + "%";
  });
};

/**
 *  @class
 *  @function Faq
 */
class Faq {

  constructor(id) {
    this.id = id
    this.container = document.getElementById('Faq-' + id)
    this.pcInit()
    this.mobileInit()
  }

  pcInit() {
    const menuItem = this.container.querySelector('.menu-items')
    menuItem.addEventListener('click', e => {
      [...menuItem.querySelectorAll('.menu-item-a')].forEach(item => {
        item.classList.remove('active')
      })
      const { target } = e
      if (target.nodeName === 'SPAN' || target.nodeName === 'IMG') {
        target.parentElement.classList.add('active')
      }
    }, true)
  }

  mobileInit() {
    const cctm = document.querySelectorAll(`.mobile-container-${this.id} .collapsible-content-title-mobile`)
    Array.prototype.forEach.call(cctm, item => {
      item.addEventListener('click', e => {
        item.classList.toggle('active')
        const cctmId = item.dataset.id
        const accordions = document.querySelectorAll('.accordion-mobile')
        Array.prototype.forEach.call(accordions, accordion => {
          if (cctmId === accordion.dataset.textId) {
            if (item.classList.contains('active')) {
              accordion.classList.add('show')
            } else {
              accordion.classList.remove('show')
            }
          }
        })
      })
    })
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const screen = window.screen.width
  if (screen > 765) {
    const faqTitle = document.querySelectorAll('.faq-container')
    if (faqTitle.length > 0) {
      let menuItems = ''
      faqTitle.forEach((faq, index) => {
        if (index !== 0) {
          faq.querySelector('.menu-title').style.display = 'none'
          menuItems += faq.querySelector('.menu-items').innerHTML
          faq.querySelector('.menu-items').style.display = 'none'
        }
      })
      const firstItem = document.querySelector('.faq-container')
      firstItem.querySelector('.menu-items').innerHTML += menuItems
    }
  } else {
    const faqTitle = document.querySelectorAll('.mobile-container')
    if (faqTitle.length > 0) {
      faqTitle.forEach((faq, index) => {
        const item = faq.querySelector('.title-accordion-wrap')
        if (index !== 0) {
          faq.querySelector('.menu-title').style.display = 'none'
          item.style.borderTop = '1px solid #000'
        }
        if (index !== faqTitle.length - 1) {
          item.style.borderBottom = 'none'
          item.style.marginBottom = 0
        
        } else {
          item.style.borderBottom = '1px solid #000'
        }
      })
    }
  }
})
