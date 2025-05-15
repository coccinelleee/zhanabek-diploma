'use client';

import { Button, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { signIn } from "next-auth/react";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthFormContainer from "./AuthFormContainer";

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const response = await fetch('/api/auth/register', {
      method: "POST",
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(res => res.json());

    if (response.error) {
      console.error(response.error);
      notifications.show({
        title: "Қате",
        message: response.error,
        color: "red"
      });
    } else {
      // Тіркелу сәтті болған жағдайда автоматты түрде жүйеге кіру
      const result = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false
      });

      if (result?.ok) {
        notifications.show({
          title: "Сәтті",
          message: "Тіркеліп, жүйеге сәтті кірдіңіз!",
          color: "green"
        });
        router.push('/');
      } else {
        notifications.show({
          title: "Қате",
          message: "Жүйеге кіру кезінде қате. Қайта кіріп көріңіз.",
          color: "red"
        });
      }
    }
  };

  return (
    <AuthFormContainer handleSubmit={handleSignup}>
      <TextInput
        label="Аты"
        name="name"
        placeholder="Пайдаланушы аты"
        type="text"
        required
      />
      <TextInput
        label="Электрондық пошта"
        name="email"
        placeholder="Электрондық пошта"
        type="email"
        required
      />
      <TextInput
        label="Құпиясөз"
        name="password"
        placeholder="Құпиясөз"
        type="password"
        required
      />
      <Button type="submit">Тіркелу</Button>
    </AuthFormContainer>
  );
}
