/**
 *  @class
 *  @function ImageTitleDescription
 */
class ImageTitleDescription {

    constructor() {
      this.compartments = document.querySelectorAll('.compartment')
      this.fixedDescription = document.querySelector('#fixedDescription')
      this.dynamicDescription = document.querySelector('#dynamicDescription')
      this.pcInit()
      this.mobileInit()
    }

    pcInit() {
        if (document.body.clientWidth < 768) return
        this.compartments.forEach(item => {
            item.addEventListener('click', e => {
                const { descTitle } = e.currentTarget.dataset
                this.dynamicDescription.innerHTML = `<div>${descTitle}</div><div style="font-style: italic">${item.querySelector('.description').innerHTML}</div>`
                this.dynamicDescription.className = 'dynamic-description'
              }, true)
        })
        this.fixedDescription.addEventListener('click', e => {
            this.dynamicDescription.innerHTML = ''
            this.dynamicDescription.className = 'dynamic-description dynamic-description-hide'
          }, true)
    }

    mobileInit() {
        if (document.body.clientWidth > 767) return
        this.compartments.forEach(item => {
            item.addEventListener('click', e => {
                const currentDescriptionDisplay = item.querySelector('.description').style.display
                if (currentDescriptionDisplay === 'none' || currentDescriptionDisplay === '') {
                    this.compartments.forEach(item => {
                        item.querySelector('.description').style.display = 'none'
                        item.querySelector('.item-name-icon').className = 'item-name-icon'
                    })
                    item.querySelector('.description').style.display = 'block'
                    item.querySelector('.item-name-icon').className = 'item-name-icon up'
                } else {
                    item.querySelector('.description').style.display = 'none'
                    item.querySelector('.item-name-icon').className = 'item-name-icon'
                }
              }, true)
        })
    }
  }

  window.addEventListener('load', () => {
    if (typeof ImageTitleDescription !== 'undefined') {
      new ImageTitleDescription()
    }
  })

  window.addEventListener('resize', () => {
    if (typeof ImageTitleDescription !== 'undefined') {
      new ImageTitleDescription()
    }
  })