import { Box, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form } from "@remix-run/react";
import { InputWithButton } from "./InputButton";
import type { Socket } from "socket.io-client";

type Props = {
  activeRoom: number | null;
  socket: Socket;
  setActiveRoom: (room: number) => void;
};

type FormValue = {
  text: string;
};

const validation = yup.object({
  text: yup.string().required("Please input something"),
});

export const ChatMessages = ({ activeRoom, socket, setActiveRoom }: Props) => {
  const [messages, setMessages] = useState<string[]>([]);
  const params = useMemo(
    () => new URL(window.location.href).searchParams.get("conversation"),
    []
  );

  const formMethods = useForm<FormValue>({
    defaultValues: {
      text: "",
    },
    mode: "onBlur",
    resolver: yupResolver(validation),
  });

  const { handleSubmit, setValue } = formMethods;

  useEffect(() => {
    socket.emit("joinRoom", activeRoom);
    socket.on("getMessage", ({ text }: { text: string }) => {
      setMessages([...messages, text]);
    });
  }, [messages, socket, activeRoom]);

  useEffect(() => {
    if (params && parseInt(params)) {
      setActiveRoom(parseInt(params));
    }
  }, [params, setActiveRoom]);

  const handleEmit = (values: FormValue) => {
    const { text } = values;
    const payload = {
      text,
      roomId: activeRoom,
    };
    socket.emit("sendMessage", payload);
    setValue("text", "");
  };

  return (
    <>
      {activeRoom ? (
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
            {messages.map((item, idx) => (
              <Message text={item} key={idx} />
            ))}
          </Box>
          <FormProvider {...formMethods}>
            <Form onSubmit={handleSubmit(handleEmit)} id="chatForm">
              <InputWithButton name="text" />
            </Form>
          </FormProvider>
        </Box>
      ) : (
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
            {" "}
          </Box>
        </Box>
      )}
    </>
  );
};

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
