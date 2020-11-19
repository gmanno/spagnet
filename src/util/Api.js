import axios from "axios";
import { urlApi, appName } from "./config";
import md5 from "md5";

const hoje = new Date()
  .toLocaleDateString()
  .slice(0, 10)
  .replace(/(\D)/g, "")
  .replace(/([0-9]{2})([0-9]{2})([0-9]{4})/g, "$3-$2-$1");

const result = md5("un1m3ds1s" + hoje);

const instance = axios.create({
  baseURL: urlApi + "consultas",
  headers: {
    Authorization: result,
    appName: appName,
    "Content-Type": "application/json",
  },
});

instance.CancelToken = axios.CancelToken;
instance.isCancel = axios.isCancel;

export default instance;
