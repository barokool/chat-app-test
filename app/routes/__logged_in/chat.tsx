import { Box, Text } from "@mantine/core";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { Form, useLoaderData } from "@remix-run/react";
import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import { requireUserValidToken } from "~/utils/cookie";
import { getAllActiveUsers } from "~/api/user";
import { useEffect, useMemo, useState } from "react";
import { User } from "~/models/user";
import io from "socket.io-client";
import { getUserByToken } from "~/api/auth";
import BrowserOnly from "~/global-components/BrowserOnly";
import { UserDrawer } from "~/pages/chat/components/UserDrawer";
import { InputWithButton } from "~/pages/chat/components/InputButton";

type FormValue = {
  text: string;
};

const validation = yup.object({
  text: yup.string().required("Please input something"),
});

const socket = io("http://localhost:8000");

export default function ChatRoute() {
  const loaderData = useLoaderData() as unknown as {
    allUser: User[];
    currentUser: User;
  };
  const [messages, setMessages] = useState<string[]>([]);

  const allUser = useMemo(() => {
    return loaderData?.allUser.filter(
      (user) => user.id !== loaderData.currentUser.id
    );
  }, [loaderData]);

  const formMethods = useForm<FormValue>({
    defaultValues: {
      text: "",
    },
    mode: "onBlur",
    resolver: yupResolver(validation),
  });

  const { handleSubmit, setValue } = formMethods;

  const handleEmit = (values: FormValue) => {
    socket.emit("sendMessage", values);
    setValue("text", "");
  };

  useEffect(() => {
    socket.on("getMessage", ({ text }) => {
      setMessages([...messages, text]);
    });
  }, [socket, messages]);

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
          {allUser &&
            allUser.map((user, idx) => (
              <UserDrawer
                key={idx}
                currentUser={loaderData.currentUser}
                user={user}
              />
            ))}
        </Box>
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              boxShadow: "rgba(255, 255, 255, 1)",
              height: "50vh",
              background: "white",
              padding: "20px",
              overflow: "auto",
            }}
          >
            <Text sx={{ textAlign: "center" }}>8/20/2020</Text>
            {messages.map((item) => (
              <Message text={item} />
            ))}
          </Box>
          <FormProvider {...formMethods}>
            <Form onSubmit={handleSubmit(handleEmit)} id="chatForm">
              <InputWithButton name="text" />
            </Form>
          </FormProvider>
        </Box>
      </Box>
    </BrowserOnly>
  );
}

const Message = ({ text }: { text: string }) => {
  return (
    <Box
      sx={{
        background: "#f2f2f7",
        width: "fit-content",
        padding: "10px",
        borderRadius: "12px",
      }}
    >
      <Text>Bao :</Text>
      <Text>{text || "Text"}</Text>
    </Box>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const userToken = (await requireUserValidToken(request)) as string;

  const currentUser = await getUserByToken(userToken);

  const allUsersActive = await getAllActiveUsers();

  return json({ allUser: allUsersActive, currentUser });
};

export const action = async ({ request }: ActionArgs) => {
  return null;
};
