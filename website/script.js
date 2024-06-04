const RECAPTCHA_PUB_KEY = "6LfwL_ApAAAAAFL1wGxWFzQy0HSbgqpZtBV7yldg";

window.addEventListener("load", () => {
const form = document.getElementById("survey-form");
const submitButton = document.getElementById("submit-button");

  form.addEventListener("submit", async (e) => {
    const formData = new FormData(form);

    // prevent the default form behavior of navigating to a new page
    // and disable new submissions while this one is pending
    e.preventDefault();
    submitButton.disabled = true;

    // when the reCAPTCHA library is ready to execute, fetch a token
    // by awaiting the `execute` method.
    grecaptcha.ready(async () => {
      // the `execute` method takes the reCAPTCHA public key and a
      // string key action that can be tracked in the console and
      // verified on the backend. It returns the token that is valid
      // for 2 minutes and a single use.
      const token = await grecaptcha.execute(
        RECAPTCHA_PUB_KEY, { action: 'survey' }
      );

      // Append a field to the form data with the token from the
      // `execute` method.
      formData.append("token", token);

      // Now we POST the form data (which now includes the reCAPTCHA
      // token) back to our server. We use `URLSearchParams` to encode
      // the form data as `application/x-www-form-urlencoded`, which
      // matches the browsers default behavior
      const res = await fetch("/survey", {
        method: "POST",
        body: new URLSearchParams(formData),
      }).then(res => res.json())

      // TODO: display coupon in UI
      console.log(res.coupon);

      submitButton.disabled = false;
    });
  });
});