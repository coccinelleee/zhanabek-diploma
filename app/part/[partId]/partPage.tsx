"use client";

import { PartState } from "@/lib/helper/part_state";
import { Carousel } from "@mantine/carousel";
import {
  Paper,
  Group,
  Center,
  Stack,
  Text,
  Image,
  ActionIcon,
  Tooltip,
  Title,
  TextInput,
  NumberInput,
  Button,
  Grid,
  SimpleGrid,
  Flex,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconChevronLeft, IconEdit, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import classes from "./page.module.css";

const units = {
  voltage: "V",
  resistance: "Ω",
  power: "W",
  current: "A",
  frequency: "Hz",
  capacitance: "nF",
};

const fieldLabels: Record<string, string> = {
  title: "Атауы",
  quantity: "Саны",
  productId: "Өнім ID",
  productCode: "Өнім коды",
  productModel: "Үлгісі",
  productDescription: "Сипаттамасы",
  parentCatalogName: "Ата-аналық санат",
  catalogName: "Санат атауы",
  brandName: "Бренд атауы",
  encapStandard: "Қаптама стандарты",
  productImages: "Суреттер",
  pdfLink: "PDF сілтеме",
  productLink: "Өнім сілтемесі",
  tolerance: "Төзімділік",
  voltage: "Кернеу",
  resistance: "Кедергі",
  power: "Қуат",
  current: "Ток",
  frequency: "Жиілік",
  capacitance: "Сыйымдылық",
  prices: "Бағалар",
};

export default function PartPage({ part }: { part: PartState }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: part.title || "",
      quantity: part.quantity || 0,
      productId: part.productId || "",
      productCode: part.productCode || "",
      productModel: part.productModel || "",
      productDescription: part.productDescription || "",
      parentCatalogName: part.parentCatalogName || "",
      catalogName: part.catalogName || "",
      brandName: part.brandName || "",
      encapStandard: part.encapStandard || "",
      productImages: part.productImages || [],
      pdfLink: part.pdfLink || "",
      productLink: part.productLink || "",
      tolerance: part.tolerance || "",
      voltage: part.voltage || "",
      resistance: part.resistance || "",
      power: part.power || "",
      current: part.current || "",
      frequency: part.frequency || "",
      capacitance: part.capacitance || "",
      prices: part.prices || [],
    },
    validate: {
      productCode: (value) =>
        value.length > 0 ? null : "Өнім коды қажет",
    },
  });

  async function updatePart() {
    form.validate();
    if (form.isValid()) {
      setIsLoading(true);
      const response = await fetch("/api/parts/update", {
        method: "POST",
        body: JSON.stringify({ ...form.values, id: part.id }),
      }).then((response) =>
        response.json().then((data) => ({ status: response.status, body: data }))
      );

      if (response.status == 200) {
        notifications.show({
          title: "Бөлім сәтті жаңартылды",
          message: `Бөлім ${form.values.productCode} жаңартылды`,
        });
      } else {
        notifications.show({
          title: "Жаңарту қатесі",
          message: `Бөлім жаңартылмады. Қайталап көріңіз.`,
        });
      }
    } else {
      notifications.show({
        title: "Жаңарту сәтсіз аяқталды",
        message: `Барлық қажетті өрістерді толтырыңыз.`,
      });
    }
    setIsLoading(false);
  }

  return (
    <Paper>
      <Tooltip label="Артқа">
        <ActionIcon
          variant="light"
          pos="absolute"
          style={{ zIndex: 3, top: 15, left: 5 }}
          onClick={() => router.push("/")}
        >
          <IconChevronLeft />
        </ActionIcon>
      </Tooltip>

      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ blur: 5, opacity: 0.5 }}
      />

      <SimpleGrid cols={{ sm: 1, md: 2 }}>
        <Stack>
          <Carousel withIndicators height={300}>
            {form.values.productImages.length === 0 ? (
              <Carousel.Slide>
                <Image
                  p="lg"
                  src="/images/image-bg.svg"
                  alt="Сурет жоқ"
                  fit="contain"
                />
              </Carousel.Slide>
            ) : (
              form.values.productImages.map((image, index) => (
                <Carousel.Slide key={index}>
                  <Image
                  src={image}
                  alt="Өнім суреті"
                  fit="contain" // <-- сохраняет пропорции
                  height={300}
                  width="100%"
                  style={{ objectFit: "contain", backgroundColor: "#f9f9f9" }}
                  onClick={() => window.open(image, "_blank")}
                />
                </Carousel.Slide>
              ))
            )}
          </Carousel>

          <Dropzone
            onDrop={(files) => {
              const readers = files.map((file) => {
                return new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });
              });

              Promise.all(readers).then((images) => {
                form.setFieldValue("productImages", [
                  ...form.values.productImages,
                  ...images,
                ]);
              });
            }}
            accept={IMAGE_MIME_TYPE}
            multiple
          >
            <Center p={20}>
              <Text c="dimmed">Суреттерді осы жерге тастаңыз немесе таңдаңыз</Text>
            </Center>
          </Dropzone>
        </Stack>

        <Paper p="sm">
          <Stack p="sm">
            <form onSubmit={form.onSubmit(async () => await updatePart())}>
              <Grid gutter={4} className={classes.grid}>
                <Grid.Col span={12}>
                  <Paper shadow="sm" p="sm">
                    <Title>Бөлімді жаңарту</Title>
                  </Paper>
                </Grid.Col>

                {Object.keys(form.values).map((value) =>
                  value === "quantity" ? (
                    <Grid.Col span={6} key={value}>
                      <NumberInput
                        description={fieldLabels[value]}
                        placeholder={fieldLabels[value]}
                        min={0}
                        {...form.getInputProps(value)}
                      />
                    </Grid.Col>
                  ) : value === "prices" ? (
                    <Grid.Col span={12} key={value}>
                      <Paper withBorder>
                        <Text c="dimmed">Бағалар:</Text>
                        <Flex
                          justify="flex-start"
                          align="center"
                          direction="row"
                          style={{ overflowX: "scroll" }}
                          wrap="nowrap"
                          gap="sm"
                        >
                          {form.values.prices.map((price, index) => (
                            <Paper key={index} radius="xl" withBorder shadow="sm" w={200}>
                              <Group pl="sm" pr="sm" w="100%" gap={0}>
                                <Tooltip label="Саны">
                                  <TextInput
                                    value={price.ladder}
                                    variant="unstyled"
                                    w="50%"
                                    p={0}
                                    onChange={(e) => {
                                      const newPrices = [...form.values.prices];
                                      newPrices[index].ladder = e.currentTarget.value;
                                      form.setFieldValue("prices", newPrices);
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip label="Бағасы">
                                  <NumberInput
                                    value={price.price}
                                    min={0}
                                    p={0}
                                    w="50%"
                                    step={0.1}
                                    prefix="₸"
                                    variant="unstyled"
                                    onChange={(val) => {
                                      const newPrices = [...form.values.prices];
                                      newPrices[index].price = Math.round(Number(val) * 100) / 100;
                                      form.setFieldValue("prices", newPrices);
                                    }}
                                  />
                                </Tooltip>
                              </Group>
                            </Paper>
                          ))}
                          <ActionIcon
                            onClick={() =>
                              form.setFieldValue("prices", [
                                ...form.values.prices,
                                { ladder: "", price: 0 },
                              ])
                            }
                          >
                            <IconPlus />
                          </ActionIcon>
                        </Flex>
                      </Paper>
                    </Grid.Col>
                  ) : (
                    <Grid.Col span={6} key={value}>
                      <TextInput
                        description={fieldLabels[value] || value}
                        placeholder={fieldLabels[value] || value}
                        {...form.getInputProps(value)}
                        rightSection={
                          <Text c="dimmed">{units[value as keyof typeof units] || ""}</Text>
                        }
                      />
                    </Grid.Col>
                  )
                )}

                <Grid.Col span={12}>
                  <Button
                    type="submit"
                    w="100%"
                    leftSection={<IconEdit />}
                  >
                    Бөлімді жаңарту
                  </Button>
                </Grid.Col>
              </Grid>
            </form>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Paper>
  );
}
