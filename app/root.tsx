import { ChakraProvider } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import { createEmotionCache, MantineProvider } from "@mantine/core";
import { StylesPlaceholder } from "@mantine/remix";
import { json, LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { useContext, useEffect } from "react";
import { getUserByToken, getUserByTokenByAxios } from "./api/auth";
import { ClientStyleContext, ServerStyleContext } from "./context";
import { ErrorBoundaryComponent } from "./design-components/errors-catch";
import NavigationToast from "./design-components/navigation-toast";
import BrowserOnly from "./global-components/BrowserOnly";
import GeneralLayout from "./layout/GeneralLayout";
import { parseJwt } from "./utils/auth/jwt";
import { getCookieByName, getUserSession } from "./utils/cookie";

createEmotionCache({ key: "mantine" });

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getUserSession(request);

  const userToken = session.get("accessToken") as string;

  const env = {
    STUPID_REMIX: process.env.STUPID_REMIX,
    API_URL: process.env.API_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,
    VITE_GOOGLE_CLIENT_SECRET: process.env.VITE_GOOGLE_CLIENT_SECRET,
  };

  if (!userToken) return json({ user: null, ENV: env });

  const user = await getUserByToken(userToken);

  if ((user as any)?.statusCode === 401) return json({ user: null, ENV: env });

  return json({
    user,
    ENV: env,
  });
};

export default function App() {
  return (
    <Document>
      <ChakraProvider>
        <GeneralLayout>
          <Outlet />
        </GeneralLayout>
      </ChakraProvider>
    </Document>
  );
}
interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const data = useLoaderData<typeof loader>();
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
    }, []);

    return (
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <html lang="en">
          <head>
            <StylesPlaceholder />
            <Meta />
            <Links />
            {serverStyleData?.map(({ key, ids, css }) => (
              <style
                key={key}
                data-emotion={`${key} ${ids.join(" ")}`}
                dangerouslySetInnerHTML={{ __html: css }}
              />
            ))}
          </head>
          <body>
            {children}
            <BrowserOnly>
              <NavigationToast />
            </BrowserOnly>
            <ScrollRestoration />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.ENV = ${JSON.stringify((data as any).ENV)}`,
              }}
            />
            <Scripts />
            <LiveReload />
          </body>
        </html>
      </MantineProvider>
    );
  }
);

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export let links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
    },
  ];
};

export const ErrorBoundary = ErrorBoundaryComponent;
