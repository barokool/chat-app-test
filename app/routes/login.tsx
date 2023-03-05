import React, { useEffect, useState } from "react";
import { useToggle, upperFirst } from "@mantine/hooks";
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  Container,
  Box,
} from "@mantine/core";
import { GoogleButton } from "~/global-components/GoogleLogin";
import { GoogleResponse } from "~/models/user";
import { createUserSession, getUserToken } from "~/utils/cookie";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { googleAuthLoginAPI, login } from "~/api/auth";
import { Form, useCatch, useFetcher } from "@remix-run/react";
import BrowserOnly from "~/global-components/BrowserOnly";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";

type FormValues = {
  email: string;
  password: string;
  isLoggedInNormal: boolean;
};

// const validation = yup
//   .object({
//     email: yup
//       .string()
//       .required("This field is required")
//       .email("Email is invalid"),
//     password: yup
//       .string()
//       .required("This field is required")
//       .min(6, "Please enter more than 6 characters"),
//   })
//   .required();

export const loader = async ({ request }: LoaderArgs) => {
  const validToken = await getUserToken(request);
  if (validToken) return redirect("/");
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const isLogginNormal =
    (formData.get("isLoggedInNormal") as string)?.includes("true") || false;

  console.log(isLogginNormal);
  const accessToken = formData.get("accessToken") as string;

  if (isLogginNormal) {
    const body = {
      email,
      password,
    };

    const loginData = await login(body);

    if (!("accessToken" in loginData)) {
      throw json({
        message: "Error in logging in, Please try again",
        status: 404,
      });
    }

    const accessToken = loginData.accessToken;
    return await createUserSession(accessToken, "/");
  } else {
    if (!accessToken) {
      throw json({
        message: "Error in logging in, Please try again",
        status: 404,
      });
    }

    const response = await googleAuthLoginAPI(accessToken);

    if (!("accessToken" in response))
      throw json({
        message: "Error in logging in, Please try again",
        status: 404,
      });

    return await createUserSession(response.accessToken, "/chat");
  }
};

const LoginPage = () => {
  const [type, toggle] = useToggle(["login", "register"]);

  const formMethods = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      isLoggedInNormal: true,
    },
    mode: "onBlur",
    // resolver: yupResolver(validation),
  });
  const fetcher = useFetcher();

  const { watch, handleSubmit, getValues, register } = formMethods;

  const onSubmit = (values: FormValues) => {
    const { email, password } = getValues();
    fetcher.submit(
      {
        email,
        password,
        isLoggedInNormal: "true",
      },
      {
        method: "post",
      }
    );
  };

  return (
    <BrowserOnly>
      <Container sx={{ maxWidth: "720px" }}>
        <Paper radius="md" p="xl" withBorder>
          <Text size="lg" weight={500}>
            Welcome to Mantine, {type} with
          </Text>

          <Group grow mb="md" mt="md">
            <GoogleButton />
          </Group>

          <Divider
            label="Or continue with email"
            labelPosition="center"
            my="lg"
          />

          <FormProvider {...formMethods}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Stack>
                <TextInput
                  label="Email"
                  placeholder="hello@mantine.dev"
                  {...register("email")}
                  // value={form.values.email}
                  // onChange={(event) =>
                  //   form.setFieldValue("email", event.currentTarget.value)
                  // }
                  // error={form.errors.email && "Invalid email"}
                />

                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  {...register("password")}
                  // value={form.values.password}
                  // onChange={(event) =>
                  //   form.setFieldValue("password", event.currentTarget.value)
                  // }
                  // error={
                  //   form.errors.password &&
                  //   "Password should include at least 6 characters"
                  // }
                />
              </Stack>

              <Box sx={{ width: "100%", marginTop: "24px" }}>
                <Button
                  type="submit"
                  sx={{ width: "100%" }}
                  name="method"
                  value={"__form"}
                >
                  {upperFirst(type)}
                </Button>
              </Box>
            </Form>
          </FormProvider>
        </Paper>
      </Container>
    </BrowserOnly>
  );
};

export default LoginPage;

export function CatchBoundary() {
  const caught = useCatch();
  //  throw json({ message: "error", status: 404 }); will jump to this
  return (
    <div>
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: any }) {
  //throw new Error("error"); will jump this
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}
