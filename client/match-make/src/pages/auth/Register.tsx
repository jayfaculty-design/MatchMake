import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import classes from "../auth/AuthenticationTitle.module.css";
import { Link, useNavigate } from "react-router";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useForm } from "@mantine/form";
import { AuthContext } from "../../contexts/AuthContext";

export function Register() {
  const navigate = useNavigate();
  const { register, loading } = useContext(AuthContext);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },

    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value)
          ? null
          : !value
          ? "This field cannot be empty"
          : "Invalid email",
      password: (value) =>
        value.length < 6
          ? "Password must have at least 6 characters"
          : !value
          ? "This field cannot be empty"
          : null,
      confirmPassword: (value, values) =>
        value !== values.password
          ? "Passwords do not match"
          : !value
          ? "Confirm password"
          : null,
      terms: (value) => (!value ? "You must accept terms" : null),
    },
    validateInputOnChange: true,
  });
  const handleSubmit = async (values: typeof form.values) => {
    try {
      const result = await register(values.email, values.password);
      if (result.success) {
        toast.success(result.message);
        navigate("/create-team-profile");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating account", error);
      toast.error("Error, something went wrong");
    }
  };
  return (
    <form action="" onSubmit={form.onSubmit(handleSubmit)}>
      <Container size={420} pt={100}>
        <Title ta="center" className={classes.title}>
          Create account!
        </Title>

        <Text className={classes.subtitle}>
          Already have an account?{" "}
          <Link to={"/auth/login"}>
            <Anchor>Sign in</Anchor>
          </Link>
        </Text>

        <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
          <TextInput
            label="Email"
            withAsterisk
            placeholder="you@matchmake.com"
            radius="md"
            ta={"left"}
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            withAsterisk
            placeholder="Your password"
            mt="md"
            radius="md"
            ta={"left"}
            key={form.key("password")}
            {...form.getInputProps("password")}
          />
          <PasswordInput
            withAsterisk
            label="Confirm password"
            placeholder="Your password"
            mt="md"
            radius="md"
            ta={"left"}
            key={form.key("confirmPassword")}
            {...form.getInputProps("confirmPassword")}
          />
          <Group justify="space-between" mt="lg">
            <Checkbox
              label="Agree to terms"
              {...form.getInputProps("terms", { type: "checkbox" })}
            />
            <Anchor>Read Terms</Anchor>
          </Group>
          <Button type="submit" fullWidth mt="xl" radius="md">
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin" />
            ) : (
              "Sign Up"
            )}
          </Button>
        </Paper>
      </Container>
    </form>
  );
}
