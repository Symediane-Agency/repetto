/**
 *  @class
 *  @function Mask
 */
class Mask {
  constructor() {
    this.items = document.querySelectorAll(".menu-item-has-children")
    this.mask = document.querySelectorAll(".mask")
    this.megaMenuContainer = document.querySelectorAll(".mega-menu-container")

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.items.forEach((item, i) => {
      item.addEventListener("mouseover", (event) => {
        event.preventDefault();
        if (event.target.className === 'mask') return false
        // document.body.style.overflow = "hidden";
        item.querySelector('.mega-menu-container').style.opacity = 1
        item.querySelector('.mega-menu-container').style.visibility = "visible"
        return false;
      });

       item.addEventListener("mouseleave", (event) => {
        event.preventDefault();
        document.body.style.overflow = "";
        item.querySelector('.mega-menu-container').style.opacity = 0
        item.querySelector('.mega-menu-container').style.visibility = "hidden"
        return false;
       });
     });

    this.mask.forEach((item, i) => {
      item.addEventListener("mouseover", (event) => {
        event.preventDefault();
        event.stopPropagation()
        item.parentNode.style.opacity = 0
        item.parentNode.style.visibility = "hidden"
        return false;
      });
    })

  } 
}

window.addEventListener("load", () => {
  if (typeof Mask !== "undefined") {
    new Mask();
  }
});
