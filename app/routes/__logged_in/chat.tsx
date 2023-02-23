import {
  ActionIcon,
  Box,
  Text,
  TextInput,
  TextInputProps,
  useMantineTheme,
} from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconSearch } from "@tabler/icons";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { getUserToken } from "~/utils/cookie";
import { getAllActiveUsers } from "~/api/user";
import { useEffect, useMemo } from "react";
import { User } from "~/models/user";

type FormValue = {
  text: string;
};

const validation = yup.object({
  text: yup.string().required("Please input something"),
});

export const loader = async ({ request }: LoaderArgs) => {
  const validToken = await getUserToken(request);

  if (!validToken) return redirect("/login");

  const allUsersActive = await getAllActiveUsers();

  return json({ allUser: allUsersActive });
};

export const action = async ({ request }: ActionArgs) => {
  return null;
};

export default function ChatRoute() {
  const loaderData = useLoaderData() as unknown as { allUser: User[] };

  const allUser = useMemo(() => {
    return loaderData?.allUser;
  }, [loaderData]);

  const formMethods = useForm<FormValue>({
    defaultValues: {
      text: "",
    },
    mode: "onBlur",
    resolver: yupResolver(validation),
  });

  const { handleSubmit } = formMethods;

  const handleEmit = (values: FormValue) => {
    console.log(values);
  };
  return (
    <Box sx={{ padding: "40px", display: "flex", gap: "16px", width: "100%" }}>
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
            <Box
              sx={{
                background: "#228be6",
                borderRadius: "20px",
                width: "fit-content",
                padding: "10px 20px",
              }}
              key={idx}
            >
              <Text sx={{ textAlign: "center", color: "white" }}>
                {user.email}
              </Text>
            </Box>
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <Message />
          </Box>
        </Box>
        <FormProvider {...formMethods}>
          <Form onSubmit={handleSubmit(handleEmit)} id="chatForm">
            <InputWithButton name="text" />
          </Form>
        </FormProvider>
      </Box>
    </Box>
  );
}

const Message = () => {
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
      <Text>Im a software engineer</Text>
    </Box>
  );
};

function InputWithButton({
  name,
  ...props
}: TextInputProps & { name: string }) {
  const theme = useMantineTheme();
  const { register } = useFormContext();

  return (
    <TextInput
      icon={<IconSearch size={18} stroke={1.5} />}
      radius="xl"
      size="md"
      rightSection={
        <ActionIcon
          size={32}
          radius="xl"
          color={theme.primaryColor}
          variant="filled"
          form="chatForm"
          type="submit"
        >
          {theme.dir === "ltr" ? (
            <IconArrowRight size={18} stroke={1.5} />
          ) : (
            <IconArrowLeft size={18} stroke={1.5} />
          )}
        </ActionIcon>
      }
      placeholder="Search questions"
      rightSectionWidth={42}
      {...register(name || "")}
      {...props}
    />
  );
}
