'use client'

import { Avatar, Button, Menu, Stack, Tabs, TextInput } from "@mantine/core";
import classes from "./UserAvatar.module.css";
import { FormEvent } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";

type Props = {
  styles?: string;
};

export default function UserAvatar({ styles }: Props) {
  const session = useSession();

  const handleRegistration = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    }).then((res) => res.json());

    if (response.error) {
      console.error(response.error);
      notifications.show({
        title: "Error",
        message: response.error,
        color: "red",
      });
    } else {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.ok) {
        notifications.show({
          title: "Сәтті",
          message: "Тіркелді және сәтті кірді!",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Қате",
          message: "Жүйеге кіру кезінде бірдеңе дұрыс болмады. Жүйеге қайта кіріп көріңіз.",
          color: "red",
        });
      }
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.ok) {
      notifications.show({
        title: "Сәтті",
        message: "Жүйеге сәтті кірді!",
        color: "green",
      });
    } else {
      notifications.show({
        title: "Қате",
        message: "Жарамсыз электрондық пошта немесе құпия сөз енгіздіңіз.",
        color: "red",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const user = session.data?.user;
  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "";

  return (
    <Menu>
      <Menu.Target>
        <Stack className={styles}>
          {userEmail ? (
            <Avatar color="cyan" radius="xl" className={classes.avatar}>
              {userName.slice(0, 2)}
            </Avatar>
          ) : (
            <Avatar radius="xl" className={classes.avatar} />
          )}
        </Stack>
      </Menu.Target>
      <Menu.Dropdown className={classes.menu}>
        {userEmail ? (
          <div className={classes.form}>
            <Menu.Label>Пайдаланушы профилі</Menu.Label>
            <Menu.Item disabled>{userName}</Menu.Item>
            <Menu.Item disabled>{userEmail}</Menu.Item>
            <Button onClick={handleLogout}>Шығу</Button>
          </div>
        ) : (
          <Tabs defaultValue="login">
            <Tabs.List>
              <Tabs.Tab value="login">Жүйеге кіру</Tabs.Tab>
              <Tabs.Tab value="signup">Тіркелу</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="login">
              <form className={classes.form} onSubmit={handleLogin}>
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
                <Button type="submit">Жүйеге кіру</Button>
              </form>
            </Tabs.Panel>
            <Tabs.Panel value="signup">
              <form className={classes.form} onSubmit={handleRegistration}>
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
              </form>
            </Tabs.Panel>
          </Tabs>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
