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
import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useForm } from "@mantine/form";

export function AuthenticationTitle() {
  const [onLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
    },

    validateInputOnChange: true,
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        toast.success(result.message);
        navigate("/dashboard");
      } else {
        toast.error(result.message);
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Error logging in", error);
      toast.error("Something went wrong");
      setErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="pt-24">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Container size={420} my={40}>
          <Title ta="center" className={classes.title}>
            Welcome back!
          </Title>

          <Text className={classes.subtitle}>
            Do not have an account yet?{" "}
            <Link to={"/auth/register"}>
              <Anchor>Create account</Anchor>
            </Link>
          </Text>

          <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
            {errorMessage && (
              <div className="flex items-center justify-center text-sm">
                <p className="text-red-500 italic">{errorMessage}</p>
              </div>
            )}
            <TextInput
              label="Email"
              placeholder="you@matchmake.com"
              required
              radius="md"
              ta={"left"}
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              radius="md"
              ta={"left"}
              {...form.getInputProps("password")}
            />
            <Group justify="space-between" mt="lg">
              <Checkbox label="Remember me" />
              <Anchor component="button" size="sm">
                Forgot password?
              </Anchor>
            </Group>
            <Button type="submit" fullWidth mt="xl" radius="md">
              {onLoading ? "Signing in..." : "Sign In"}
            </Button>
          </Paper>
        </Container>
      </form>
    </div>
  );
}
