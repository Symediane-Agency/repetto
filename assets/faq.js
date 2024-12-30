/**
 *  @class
 *  @function Faq
 */
class Faq {

  constructor(id) {
    this.container = document.getElementById('Faq-'+id)
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
    const cctm = document.querySelectorAll('.collapsible-content-title-mobile')
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
