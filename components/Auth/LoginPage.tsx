'use client';

import { Button, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { signIn } from "next-auth/react";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthFormContainer from "./AuthFormContainer";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });

    if (result?.ok) {
      notifications.show({
        title: "Сәтті",
        message: "Сіз сәтті жүйеге кірдіңіз!",
        color: "green"
      });
      router.push("/");
    } else {
      notifications.show({
        title: "Қате",
        message: "Қате email немесе құпиясөз енгіздіңіз.",
        color: "red"
      });
    }
  };

  return (
    <AuthFormContainer handleSubmit={handleLogin}>
      <TextInput
        label="Электрондық пошта"
        name="email"
        placeholder="Электрондық пошта"
        type="email"
        required
      />
      <TextInput
        name="password"
        label="Құпиясөз"
        placeholder="Құпиясөз"
        type="password"
        required
      />
      <Button type="submit">Кіру</Button>
    </AuthFormContainer>
  );
}
