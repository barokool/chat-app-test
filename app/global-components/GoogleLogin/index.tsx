import React, { useEffect, useState } from "react";
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { useGoogleAuthentication } from "~/hooks/useGoogleAuthentication";
import BrowserOnly from "../BrowserOnly";
import { Loader } from "@mantine/core";
import { createUserSession, storage } from "~/utils/cookie";
import { GoogleResponse } from "~/models/user";
import {
  useFetcher,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import { loader } from "~/root";

export function GoogleButton() {
  const { handleSuccess } = useGoogleAuthentication();
  const fetcher = useFetcher();

  const VITE_GOOGLE_CLIENT_ID = ENV?.VITE_GOOGLE_CLIENT_ID;

  const handleLog = async (
    response: GoogleLoginResponse | GoogleLoginResponseOffline
  ) => {
    try {
      const accessToken = handleSuccess(response);
      if (accessToken) fetcher.submit({ accessToken }, { method: "post" });
    } catch (error) {
      console.log("errorr : ", error);
    }
  };

  const onError = (error: any) => {
    console.log(error);
  };

  useEffect(() => {
    const gapi = import("gapi-script").then((pack) => pack.gapi);
    const initClient = async () => {
      const gapiConstants = await gapi;
      gapiConstants.client.init({
        clientId: VITE_GOOGLE_CLIENT_ID,
        scope: "email",
      });
    };
    gapi.then((d) => d.load("client:auth2", initClient));
  }, []);

  return (
    <BrowserOnly>
      {fetcher.state === "idle" ? (
        <GoogleLogin
          clientId={VITE_GOOGLE_CLIENT_ID}
          buttonText="Log in"
          onSuccess={handleLog}
          onFailure={onError}
          cookiePolicy={"single_host_origin"}
        />
      ) : (
        <Loader />
      )}
    </BrowserOnly>
  );
}
