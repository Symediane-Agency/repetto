document.addEventListener("DOMContentLoaded", (event) => {

    /**
     * Hash nav handle
     * ***************************
     */

    if(window.location.hash){
        document.querySelector(window.location.hash.replace('-tab', '')).dispatchEvent((new Event('click')))
    }

    document.querySelectorAll('.tabbed-content--tabs button').forEach((item) => {
        item.addEventListener('click', (e) => {
            window.location.hash = item.getAttribute('id') + '-tab'
        })
    })
    document.getElementById('tabbed-content--tabs').addEventListener('change',function () {
       window.location.hash = this.value + '-tab'
    })
    window.addEventListener("hashchange", (event) => {
        document.querySelector(window.location.hash.replace('-tab', '')).dispatchEvent((new Event('click')))
    });

});