/**
 *  @class
 *  @function LoginDrawer
 */
class LoginDrawer {

    constructor() {
        this.container = document.getElementById('Login-Drawer');

        if (!this.container) {
            return;
        }

        let _this = this,
            buttons = document.getElementsByClassName('login-drawer-toggle');


        // Add functionality to buttons
        for (let index = 0; index < buttons.length; index++) {
            const button = buttons[index];

            button.addEventListener('click', (e) => {

                if (!document.body.classList.contains('customer-logged-in')) {
                    e.preventDefault();

                    document.querySelectorAll('.side-panel').forEach((item) => {
                        item.classList.remove('active')
                    })

                    document.body.classList.add('open-cc');
                    document.body.classList.add('open-cart');
                    this.container.classList.add('active');
                    this.container.focus();

                    dispatchCustomEvent('login-drawer:open');
                }
            });
        }

    }
}

/**
 *  @class
 *  @function RegisterDrawer
 */
class RegisterDrawer {

    constructor() {
        this.container = document.getElementById('Register-Drawer');

        if (!this.container) {
            return;
        }
        let _this = this,
            buttons = document.getElementsByClassName('register-drawer-toggle');


        // Add functionality to buttons
        for (let index = 0; index < buttons.length; index++) {
            const button = buttons[index];

            button.addEventListener('click', (e) => {

                if (!document.body.classList.contains('customer-logged-in')) {
                    e.preventDefault();

                    document.querySelectorAll('.side-panel').forEach((item) => {
                        item.classList.remove('active')
                    })

                    document.body.classList.add('open-cc');
                    document.body.classList.add('open-cart');
                    this.container.classList.add('active');
                    this.container.focus();

                    dispatchCustomEvent('register-drawer:open');
                }
            });
        }

    }
}
/**
 *  @class
 *  @function PersonalDrawer
 */
class PersonalDrawer {

    constructor() {
        this.container = document.getElementById('Personal-Drawer');
        if (!this.container) return;

        const translations = {}

        if(Shopify.locale == "fr"){
            translations.errorMessage = "Erreur lors de la mise à jour de votre compte. Veuillez réessayer ou nous contacter."
            translations.successMessage = "Les données de votre compte ont été mise à jour. Vous allez être redirigé dans quelques instants."
            translations.successMessageBtn = "Compte mis à jour <span style='color: #749f59;font-size: 18px;margin-left: 10px;'>&#10004;</span>"
            translations.loading = "Chargment ..."
        }
        else{
            translations.errorMessage = "Error updating your account. Please try again or contact us."
            translations.successMessage = "Your account information has been updated. You will be redirected in a few moments."
            translations.successMessageBtn = "Account updated <span style='color: #749f59;font-size: 18px;margin-left: 10px;'>&#10004;</span>"
            translations.loading = "Loading ..."
        }

        $("#Personal-Drawer form").submit(function(e) {

            e.preventDefault(); // avoid to execute the actual submit of the form.
        
            var form = $(this);
            var actionUrl = form.attr('action');

            $('#AddressAddress1NewFake').val(JSON.stringify({
                first_name: form.find('input[name="customer[first_name]"]').val(),
                last_name: form.find('input[name="customer[last_name]"]').val(),
                email: form.find('input[name="customer[email]"]').val(),
                dancer_profile: form.find('select[name="customer[note][dancer_profile]"]').val(),
                birthdate: form.find('input[name="customer[note][birthdate]"]').val(),
                gender: form.find('input[name="customer[note][gender]"]:checked').val(),
            }))

            
            const data = form.serialize();

            form.find('button').data('text', form.find('button').text()).prop('disabled', true).text(translations.loading)
            
            $.ajax({
                type: "POST",
                url: actionUrl,
                data: data, // serializes the form's elements.
                success: function(data)
                {
                    setTimeout(function(){
                        alert(translations.successMessage);
                        window.location.href = "/account"
                    }, 5000)
                },
                error: function(){
                    form.find('button').prop('disabled', false).text(form.find('button').data('text'))
                }
            });
            
        });

        let buttons = document.getElementsByClassName('personal-drawer-toggle');
        for (let index = 0; index < buttons.length; index++) {
            const button = buttons[index];
            button.addEventListener('click', (e) => {
                if (document.body.classList.contains('customer-logged-in')) {
                    e.preventDefault();
                    document.querySelectorAll('.side-panel').forEach((item) => {
                        item.classList.remove('active')
                    })
                    document.body.classList.add('open-cc');
                    document.body.classList.add('open-cart');
                    this.container.classList.add('active');
                    dispatchCustomEvent('personal-drawer:open');
                }
            });
        }

    }
}

/**
 * SETUP
 * **********************************
 */

document.addEventListener('DOMContentLoaded', () => {

    if (typeof LoginDrawer !== 'undefined') {
        new LoginDrawer();
    }
    if (typeof RegisterDrawer !== 'undefined') {
        new RegisterDrawer();
    }
    if (typeof PersonalDrawer !== 'undefined') {
        new PersonalDrawer();
    }

});

window.addEventListener('load', () => {
    setupRecoverPassword();
})


/**
 * FUNCTIONS
 * **********************************
 */

function setupRecoverPassword() {

    window.forceFormSubmit = false;

    let url = "https://9862ze3ql0.execute-api.eu-west-3.amazonaws.com/sandbox/resetCustomerAccount"

    if (Shopify.shop == "3ee62d-3.myshopify.com") {
        url = "https://xnkosumdt5.execute-api.eu-west-3.amazonaws.com/prod/resetCustomerAccount"
    }

    const translations = {}

    if(Shopify.locale == "fr"){
        translations.errorMessage = "Erreur lors de la récupération de votre compte. Veuillez réessayer ou nous contacter."
        translations.successMessage = "Vous allez recevoir un mail contenant un lien pour réactiver votre compte."
        translations.successMessageBtn = "Mail envoyé <span style='color: #749f59;font-size: 18px;margin-left: 10px;'>&#10004;</span>"
    }
    else{
        translations.errorMessage = "Error retrieving your account. Please try again or contact us."
        translations.successMessage = "You will receive an e-mail containing a link to reactivate your account."
        translations.successMessageBtn = "Mail sent <span style='color: #749f59;font-size: 18px;margin-left: 10px;'>&#10004;</span>"
    }

    $('form[action="/account/recover"] input').on('change', disableOnsubmitCaptcha)
    $('form[action="/account/recover"] input').on('click', disableOnsubmitCaptcha)
    $('form[action="/account/recover"] input').on('focus', disableOnsubmitCaptcha)
    $('form[action="/account/recover"] button').on('change', disableOnsubmitCaptcha)
    $('form[action="/account/recover"] button').on('click', disableOnsubmitCaptcha)
    $('form[action="/account/recover"] button').on('focus', disableOnsubmitCaptcha)

    function disableOnsubmitCaptcha(){
        console.log('disableOnsubmitCaptcha')
        $('form[action="/account/recover"]').attr('onsubmit', '')
        $('form[action="/account/recover"]').prop('onsubmit', false)
    }

    $('form[action="/account/recover"]').on('submit', (event) => {
        if(window.forceFormSubmit){
            return true;
        }
        event.preventDefault();
        event.stopPropagation();

        const $form = $(event.target);

        $form.find('[type="submit"]').prop('disabled', true)

        $.ajax({
            url: url,
            method: "POST",
            data: JSON.stringify({ 
                email: $form.find('input[type="email"]').val()
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                if(data.classicRecover){
                    forceFormSubmit = true;
                    window.Shopify.recaptchaV3.addToken(event.target, "recover_customer_password"); return false;
                    // $form.submit()
                }
                else{
                    forceFormSubmit = false
                    // $form.find('[type="submit"]').prop('disabled', false)
                    $form.find('[type="submit"]').html(translations.successMessageBtn)
                    alert(translations.successMessage)
                    return false;
                }
            },
            error: function(errMsg) {
                $form.find('[type="submit"]').prop('disabled', false)
                forceFormSubmit = false
                alert(translations.errorMessage);
                return false;
            }
        });

        return false;
    })

    //$('form[action="/account/recover"]').attr('action', '') // prevent captcha trigger when activating account via AWS function

}

function loadGoogleMaps(key, initializeMap) {
    // Check if Google Maps is already loaded
    if (typeof google === 'object' && typeof google.maps === 'object') {
        console.log('Google maps already loaded')
    } else {
        // Load the Google Maps JavaScript API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=` + key + `&libraries=places,geometry`;
        script.defer = true;
        script.async = true;

        const scriptCluster = document.createElement('script');
        scriptCluster.src = `https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js`;
        scriptCluster.defer = true;
        scriptCluster.async = true;

        let scriptLoadedCount = 0;
        const totalScriptCount = 2;

        script.onload = function () {
            if (scriptLoadedCount == totalScriptCount - 1) {
                initializeMap()
            }
            scriptLoadedCount++
        };
        scriptCluster.onload = function () {
            if (scriptLoadedCount == totalScriptCount - 1) {
                initializeMap()
            }
            scriptLoadedCount++
        };


        // Append the script to the document
        document.head.appendChild(script);
        document.head.appendChild(scriptCluster);
    }
}