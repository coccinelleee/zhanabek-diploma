"use client";
import {
  Text,
  Container,
  Image,
  Stack,
  Center,
  Divider,
  Box,
  Paper,
  Title,
  Grid,
} from "@mantine/core";
import classes from "./NavFooter.module.css";

export default function NavFooter() {
  return (
    <footer className={classes.footer}>
      <Container size="lg" className={classes.inner}>
        <Grid justify="center" align="center" gutter="xl">
          {/* Логотип */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Center>
              <Image
                src="/images/ZHANABEK.png"
                alt="Inventory Logistics логотипі"
                h={150}
                fit="contain"
                style={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Center>
          </Grid.Col>

          {/* Описание проекта */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="md" radius="md" p="lg" withBorder>
              <Stack style={{ gap: 'var(--mantine-spacing-xs)', alignItems: 'center' }}>
                <Title order={4}>📦 Жоба сипаттамасы</Title>
                <Text size="sm" ta="center">
                  <strong>Inventory Logistics</strong> — тауарлы-материалдық қорларды
                  есепке алудың және қойма логистикасын басқарудың заманауи цифрлық шешімі.
                </Text>
                <Text size="sm" ta="center">
                  Бұл жүйе электрондық компоненттер мен құрылғыларды тиімді тіркеу, сақтау,
                  санаттау және іздеу үшін арналған. Жүйе студенттерге, зертханаларға,
                  колледждерге және инженерлерге ыңғайлы. Сканерлеу арқылы компоненттерді
                  автоматты түрде қосуға және нақты уақыт режимінде қойма қорын бақылауға
                  мүмкіндік береді.
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Автор / жетекші */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Stack style={{ gap: 'var(--mantine-spacing-xs)', alignItems: 'center' }}>
              <Divider w="50%" />
              <Text fw={700} size="md">🎓 Жобаны жасаған студент:</Text>
              <Text size="sm">Сұлтанғали Жанабек</Text>

              <Text fw={700} size="md" mt="sm">👨‍🏫 Жетекшісі:</Text>
              <Text size="sm">Жұмашев Жансейіт Қарасайұлы</Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Нижняя подпись */}
      <Box mt={40} className={classes.afterFooter}>
        <Text c="dimmed" size="sm" ta="center">
          © 2025 Каспий көпсалалы жоғарғы колледжі | Ақпараттық-техникалық бөлім.
        </Text>
      </Box>
    </footer>
  );
}
