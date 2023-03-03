import { Box, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { getConversationByUsers } from "~/api/rooms";
import BrowserOnly from "~/global-components/BrowserOnly";
import { User } from "~/models/user";

type UserDrawerProps = {
  currentUser: User;
  user: User;
};

export const UserDrawer = ({ currentUser, user }: UserDrawerProps) => {
  const params = new URL(window.location.href).searchParams;
  const navigate = useNavigate();

  const getConversation = async (userIdClicked: string) => {
    const usersId = `${userIdClicked},${currentUser.id}`;

    const room = await getConversationByUsers(usersId);
    if (room && room.id) {
      params.set("conversation", `${room.id}`);
      navigate(`?${params}`);
    } else {
      // create new conversation with userclicked id
    }
  };

  return (
    <BrowserOnly>
      <Box
        sx={{
          background: "#228be6",
          borderRadius: "20px",
          width: "fit-content",
          padding: "10px 20px",
        }}
      >
        <Text
          sx={{
            textAlign: "center",
            color: "white",
            cursor: "pointer",
          }}
          onClick={() => getConversation(user.id)}
        >
          {user.email}
        </Text>
      </Box>
    </BrowserOnly>
  );
};
