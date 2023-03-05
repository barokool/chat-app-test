import { Box, Container } from "@mantine/core";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getUserByToken } from "~/api/auth";
import { getUserSession, getUserToken } from "~/utils/cookie";

export const loader = async ({ request }: LoaderArgs) => {
  const userToken = await getUserToken(request);

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
