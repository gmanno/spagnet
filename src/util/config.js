module.exports = {
  recaptchaToken: "6LcXz-QZAAAAAKr0k6oJsbAqTOCyLU4zY9jLv-4m",
  appName: "spagnet",
  urlApi:
    !process.env.NODE_ENV || process.env.NODE_ENV === "development"
      ? "https://dev.unimednatal.com.br/"
      : "https://api.unimednatal.com.br/",
};
