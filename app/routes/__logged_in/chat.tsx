import { Box, Text } from "@mantine/core";

import { useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserValidToken } from "~/utils/cookie";
import { getAllActiveUsers } from "~/api/user";
import { useEffect, useMemo, useState } from "react";
import type { User } from "~/models/user";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import { getUserByToken } from "~/api/auth";
import BrowserOnly from "~/global-components/BrowserOnly";
import { UserDrawer } from "~/pages/chat/components/UserDrawer";
import { ChatMessages } from "~/pages/chat/components/ChatMessages";

export default function ChatRoute() {
  const loaderData = useLoaderData() as unknown as {
    allUser: User[];
    currentUser: User;
  };
  const [activeRoom, setActiveRoom] = useState<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const allUser = useMemo(() => {
    return loaderData?.allUser.filter(
      (user) => user.id !== loaderData.currentUser.id
    );
  }, [loaderData]);

  useEffect(() => {
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <BrowserOnly>
      <Box
        sx={{ padding: "40px", display: "flex", gap: "16px", width: "100%" }}
      >
        <Box
          sx={{
            boxShadow: "#242121 !important",
            height: "50vh",
            background: "#f2f2f7",
            padding: "20px",
            overflow: "auto",
            width: "50%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Text>List User</Text>
          {allUser &&
            allUser.map((user, idx) => (
              <UserDrawer
                onChangeRoom={setActiveRoom}
                key={idx}
                currentUser={loaderData.currentUser}
                user={user}
              />
            ))}
        </Box>
        {socket && (
          <ChatMessages
            activeRoom={activeRoom}
            setActiveRoom={setActiveRoom}
            socket={socket}
          />
        )}
      </Box>
    </BrowserOnly>
  );
}

export const loader = async ({ request }: LoaderArgs) => {
  const userToken = (await requireUserValidToken(request)) as string;

  const currentUser = await getUserByToken(userToken);

  const allUsersActive = await getAllActiveUsers();

  return json({ allUser: allUsersActive, currentUser });
};

export const action = async ({ request }: ActionArgs) => {
  return null;
};
