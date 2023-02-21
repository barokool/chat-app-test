import { Box, Container } from "@mantine/core";
import { json, LoaderArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getUserByToken } from "~/api/auth";
import { getUserSession } from "~/utils/cookie";

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getUserSession(request);

  const userToken = session.get("accessToken") as string;

  if (!userToken) return redirect("/login");

  const user = await getUserByToken(userToken);
  return json({ ...user });
};

export default function LoggedInIndex() {
  return (
    <Box sx={{ background: "#f2f2f7" }}>
      <Container sx={{ width: "1200px", margin: "0 auto" }}>
        <Outlet />
      </Container>
    </Box>
  );
}
