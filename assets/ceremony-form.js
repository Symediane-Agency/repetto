document.addEventListener('DOMContentLoaded', function () {

    const storesList = []
    let selectedStore = null

    // fetch stores list
    fetch("https://xnkosumdt5.execute-api.eu-west-3.amazonaws.com/prod/getStoreLocators")
        .then((response) => response.json())
        .then((json) => {
            var stores = []
            json.forEach(store => {
                if (store.customization_available_in_store == "true") {
                    stores.push(store)
                }
            });

            stores.sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });

            for (var store of stores) {
                storesList.push(store)
                var option = document.createElement("option");
                option.text = store.name + " - " + store.country;
                option.value = store.name;
                document.querySelector('#CeremonyFormStore').appendChild(option)

                if(!selectedStore){
                    selectedStore = store
                }
            }
        });

    // Form submit
    let contactUrl = "https://xnkosumdt5.execute-api.eu-west-3.amazonaws.com/prod/customizationContact" // prod stage
    contactUrl = "https://f94megnko2.execute-api.eu-west-3.amazonaws.com/mailing/customizationContact" // mailing stage (temporary)
    // if (window.location.hostname == "127.0.0.1") {
    //     contactUrl = "http://localhost:3000/dev/customizationContact"
    // }

    const translations = {}

    if (Shopify.locale == "fr") {
        translations.errorMessage = "Une erreur est survenue Veuillez réessayer ou nous contacter."
        translations.successMessage = "Demande de rendez-vous envoyée"
        translations.successMessageBtn = "Demande envoyée <span style='color: #749f59;font-size: 18px;margin-left: 10px;'>&#10004;</span>"
    }
    else {
        translations.errorMessage = "An error occured. Please try again or contact us."
        translations.successMessage = "Appointment request sent."
        translations.successMessageBtn = "Request sent <span style='color: #749f59;font-size: 18px;margin-left: 10px;'>&#10004;</span>"
    }

    $('#CeremonyFormStore').on('change', () => {
        for(const store of storesList){
            if(store.name == $('#CeremonyFormStore').val()){
                selectedStore = store
                break;
            }
        }
    })

    let timeFormat = 'hh:mm p';
    if(Shopify.locale == "fr"){
        timeFormat = 'HH:mm';
    }

    var CeremonyFormDesiredHour;
    $('#CeremonyFormDesiredHour').timepicker({
        timeFormat: timeFormat,
        interval: 60,
        minTime: '11',
        maxTime: '06:00pm',
        defaultTime: '11',
        startTime: '11:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: function(time) {
            let hours = time.getHours().toString();
            let minutes = time.getMinutes().toString();

            hours = hours.length == 1 ? "0"+ hours : hours;
            minutes = minutes.length == 1 ? "0"+ minutes : minutes;

            CeremonyFormDesiredHour = hours + ":" + minutes;
        }
    });

    $('#customizationContactForm').on('submit', (e) => {
        e.preventDefault();

        $('#CeremonyFormSubmit').prop('disabled', true)

        const storeName = selectedStore.name
        const storeAddress = selectedStore.address
        const storeZip = selectedStore.postcode
        const storeCity = selectedStore.city
        const storeCountry = selectedStore.country
        const storeEmail = selectedStore.email
        // const storeEmail = "arthur.vestris@sesame-digital.com"
        const storePhone = selectedStore.phone
        const storeLat = selectedStore.latitude
        const storeLng = selectedStore.longitude

        $.ajax({
            method: "POST",
            dataType: "json",
            url: contactUrl,
            data: JSON.stringify({
                email: $('#CeremonyFormEmail').val(),
                firstname: $('#CeremonyFormFirstName').val(),
                lastname: $('#CeremonyFormName').val(),
                phone: $('#CeremonyFormPhone').val(),
                country: $('#CeremonyFormCountry').val(),
                date: $('#CeremonyFormDesiredDate').val(),
                hour: CeremonyFormDesiredHour,
                storeName: storeName,
                storeAddress: storeAddress,
                storeZip: storeZip,
                storeCity: storeCity,
                storeCountry: storeCountry,
                storeEmail: storeEmail,
                storePhone: storePhone,
                storeLat: storeLat,
                storeLng: storeLng,
                locale: Shopify.locale,
            }),
	        contentType: "application/json; charset=utf-8",
            error: () => {
                $('#CeremonyFormSubmit').prop('disabled', false)
                alert(translations.errorMessage)
            },
            success: (response) => {
                $('#CeremonyFormSubmit').html(translations.successMessageBtn)
                alert(translations.successMessage)
            }
        })

        return false;
    })
})