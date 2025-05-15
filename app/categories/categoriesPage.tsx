"use client";

import {
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Title,
  Text,
  Card,
  Image,
  Space,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import classes from "./page.module.css";
import { PartState } from "@/lib/helper/part_state";
import { useRouter } from "next/navigation";
import { IconChevronLeft } from "@tabler/icons-react";

export default function CategoriesPage({
  catalogItems,
}: {
  catalogItems: PartState[];
}) {
  const router = useRouter();
  return (
    <Paper>
      <Tooltip label="Артқа">
        <ActionIcon
          variant="light"
          pos={"absolute"}
          style={{ zIndex: 3, top: 15, left: 5 }}
          onClick={() => {
            router.push("/");
          }}
        >
          <IconChevronLeft />
        </ActionIcon>
      </Tooltip>
      <Stack p={"lg"}>
        <Group justify="center">
          <Badge variant="filled" size="lg">
            Санаттар
          </Badge>
        </Group>
        <Title order={2} className={classes.title} ta="center" mt="sm">
          Санат бойынша тікелей сұрыптау
        </Title>

        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Санаттағы барлық өнімдерді көру үшін санатты басыңыз
        </Text>
        <Space h="sm" />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} p={"lg"}>
          {catalogItems.map((item) => (
            <Card
              key={item.parentCatalogName}
              shadow="md"
              radius="md"
              className={classes.card}
              padding="xl"
              onClick={() => {
                const catalog = item.parentCatalogName;
                if (catalog) {
                  router.push(`/?catalog=${encodeURIComponent(catalog)}`);
                }
              }}
            >
              <Card.Section>
                <Image
                  src={typeof item.productImages?.[0] === "string" ? item.productImages[0]! : "/images/image-bg.svg"}
                  height={160}
                  fit="cover"
                />
              </Card.Section>
              <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                {item.parentCatalogName}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
