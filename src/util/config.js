module.exports = {
  recaptchaToken: process.env.REACT_APP_RECAPTCHATOKEN,
  appName: "spagnet",
  urlApi:
    !process.env.NODE_ENV || process.env.NODE_ENV === "development"
      ? "https://dev.unimednatal.com.br/"
      : "https://api.unimednatal.com.br/",
};
