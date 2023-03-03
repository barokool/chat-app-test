import {
  ActionIcon,
  TextInput,
  TextInputProps,
  useMantineTheme,
} from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconSearch } from "@tabler/icons";
import { useFormContext } from "react-hook-form";

export function InputWithButton({
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
