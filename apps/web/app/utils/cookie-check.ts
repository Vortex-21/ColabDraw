import Cookies from "js-cookie";
import { SetStateAction } from "react";
export function checkCookies(authenticator:React.Dispatch<SetStateAction<boolean>>) {
    const tokenValue = Cookies.get("token");
    console.log("value: ", tokenValue);
    if (!tokenValue) {
      authenticator(false);
    }
  }