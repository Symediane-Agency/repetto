document.addEventListener('DOMContentLoaded', function () {


    // Form submit
    let formSubmitUrl = "https://xnkosumdt5.execute-api.eu-west-3.amazonaws.com/prod/jobApply" // prod stage
    formSubmitUrl = "https://f94megnko2.execute-api.eu-west-3.amazonaws.com/mailing/jobApply" // mailing stage (temporary)
    // if (window.location.hostname == "127.0.0.1") {
    //     formSubmitUrl = "http://localhost:3000/dev/customizationContact"
    // }

    const translations = {}

    if (Shopify.locale == "fr") {
        translations.fileTooBig = "Fichier trop lourd"
        translations.errorMessage = "Une erreur est survenue Veuillez réessayer ou nous contacter."
        translations.successMessage = "Candidature envoyée"
        translations.successMessageBtn = "Candidature envoyée <span style='color: #749f59;font-size: 18px;margin-left: 10px;'>&#10004;</span>"
    }
    else {
        translations.fileTooBig = "File too big"
        translations.errorMessage = "An error occured. Please try again or contact us."
        translations.successMessage = "Job apply request sent."
        translations.successMessageBtn = "Request sent <span style='color: #749f59;font-size: 18px;margin-left: 10px;'>&#10004;</span>"
    }

    $('.job-apply-file').on('change', function (e) {
        console.log($(this)[0])
        if ($(this)[0].files[0] != undefined && $(this)[0].files[0] != null) {
            if ($(this)[0].files[0].size > 2097152) {
                $(this).val('')
                $(this).next('.file-name').text("")
                alert(translations.fileTooBig)
                e.preventDefault();
                return false;
            }

            $(this).next('.file-name').text($(this)[0].files[0].name)
        }
        else {
            $(this).next('.file-name').text("")
        }
    })

    $('#jobApplyForm').on('submit', async (e) => {
        e.preventDefault();

        $('#jobApplyFormSubmit').prop('disabled', true)

        const file1 = document.querySelector('#jobApplyFile1').files[0];
        let file1Content = await toBase64(file1);
        let file1Data = {
            name: file1.name,
            content_type: file1.type,
            content: file1Content,
        }

        const file2 = document.querySelector('#jobApplyFile2').files[0];
        let file2Data = null;

        if(file2 != undefined && file2){
            let file2Content = await toBase64(file2);
            file2Data = {
                name: file2.name,
                content_type: file2.type,
                content: file2Content,
            }
        }

        $.ajax({
            method: "POST",
            dataType: "json",
            url: formSubmitUrl,
            data: JSON.stringify({
                email: $('#jobApplyEmail').val(),
                firstname: $('#jobApplyFirstname').val(),
                lastname: $('#jobApplyLastname').val(),
                phone: $('#jobApplyPhone').val(),
                job_offer: window.location.href,
                locale: Shopify.locale,
                file_1: file1Data,
                file_2: file2Data,
            }),
            contentType: "application/json; charset=utf-8",
            error: () => {
                $('#jobApplyFormSubmit').prop('disabled', false)
                alert(translations.errorMessage)
            },
            success: (response) => {
                $('#jobApplyFormSubmit').html(translations.successMessageBtn)
                alert(translations.successMessage)
            }
        })

        return false;
    })

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
})