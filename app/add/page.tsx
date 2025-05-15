"use client";
export const dynamic = "force-dynamic";
import {
  Paper,
  Group,
  Center,
  Tabs,
  Text,
  Stack,
  TextInput,
  Button,
  SimpleGrid,
  Grid,
  NumberInput,
  ActionIcon,
  Tooltip,
  Flex,
  Image,
  ThemeIcon,
  LoadingOverlay,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { scannerInputToType } from "../dashboardPage";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { IconChevronLeft, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Carousel } from "@mantine/carousel";
import UnitForm, { UnitFormRef } from "@/lib/components/unit/UnitForm";
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Html5Qrcode } from "html5-qrcode";
import { Html5QrcodeScannerState } from "html5-qrcode";

type FormValues = {
  productImages: string[];
};

export default function Add() {
  const [isLoading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      title: "",
      quantity: 1,
      productId: "",
      productCode: "",
      productModel: "",
      productImages: [] as string[],
      productDescription: "",
      parentCatalogName: "",
      catalogName: "",
      brandName: "",
      encapStandard: "",
      pdfLink: "",
      productLink: "",
      tolerance: "",
      voltage: "",
      resistance: "",
      power: "",
      current: "",
      frequency: "",
      capacitance: "",
      inductance: "",
      prices: [] as { ladder: string; price: number }[],
    },
    validate: {
      productCode: (value) =>
        value && value.length > 0 ? null : "Өнім коды қажет",
    },
  });

  const [scannerInput, setScannerInput] = useState("");
  const [productCode, setProductCode] = useState("");

  const [showScanner, setShowScanner] = useState(false);
const [scannedText, setScannedText] = useState("");
const scannerContainerRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (showScanner && scannerContainerRef.current) {
    const scanner = new Html5Qrcode("reader");

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          console.log("QR CODE:", decodedText);
          const parsed = scannerInputToType(decodedText);
          if (!parsed || !parsed.pc) return;

          setScannedText(decodedText);
          setScannerInput(decodedText);
          setProductCode(parsed.pc);

          await handleAutocomplete();

          try {
            const state = await scanner.getState?.();
            if (state === Html5QrcodeScannerState.SCANNING) {
              await scanner.stop();
            }
            setShowScanner(false);
          } catch (e) {
            console.warn("Error stopping scanner:", e);
          } finally {
            setShowScanner(false);
          }
        },
        (error) => {
          console.warn("QR Scan error:", error);
        }
      )
      .catch((err) => console.error("Камераны қосу қатесі:", err));

    return () => {
      scanner.stop().catch(() => {});
    };
  }
}, [showScanner]);

async function handleAutocomplete() {
  const partInfoFromScanner = scannerInputToType(scannerInput ?? "");
  const validScannerInput = partInfoFromScanner.pc;

  if (productCode !== "" || validScannerInput) {
  const productCodeInternal = partInfoFromScanner.pc || productCode;

    setLoading(true);

    try {
      const response = await fetch("/api/parts/autocomplete", {
        method: "POST",
        body: JSON.stringify({ productCode: productCodeInternal }),
      }).then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      );

      if (response.body.status === 200) {
        notifications.show({
          title: "Авто-толтыру сәтті өтті",
          message: `Өнім коды ${productCodeInternal} табылды.`,
        });

        if (response.body.body) {
          Object.keys(response.body.body).forEach((key) => {
            if (form.values.hasOwnProperty(key)) {
              if (key === "quantity") {
                if (partInfoFromScanner.qty) {
                  form.setFieldValue(key, partInfoFromScanner.qty);
                }
              } else if (refMapping.hasOwnProperty(key)) {
                if (key === "capacitance") {
                  refMapping[key].current?.setValue(response.body.body[key], "pF");
                } else if (key === "inductance") {
                  refMapping[key].current?.setValue(response.body.body[key], "mH");
                } else {
                  refMapping[key].current?.setValue(response.body.body[key]);
                }
              } else {
                form.setFieldValue(key, response.body.body[key]);
              }
            }
          });
        }
      } else {
        notifications.show({
          title: "Авто-толтыру сәтсіз аяқталды",
          message: `Өнім коды ${productCodeInternal} табылмады. Жарамды өнім кодын немесе сканер енгізуін енгізіңіз.`,
        });
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
      notifications.show({
        title: "Қате",
        message: "Қосылым немесе сервер қатесі орын алды.",
        color: "red",
      });
    }

    setLoading(false);
  } else {
    notifications.show({
      title: "Авто-толтыру сәтсіз аяқталды",
      message: `Жарамды сканер енгізуін немесе өнім кодын енгізіңіз.`,
    });
  }
}

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
    inductance: "Индуктивтік",
    prices: "Бағалар"
  };  

  const fieldTranslations: Record<string, string> = {
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
    productLink: "Өнім сілтемесі",
    pdfLink: "PDF сілтеме",
    tolerance: "Төзімділік",
    voltage: "Кернеу (V)",
    resistance: "Кедергі (Ω)",
    power: "Қуат (W)",
    current: "Ток (A)",
    frequency: "Жиілік (Hz)",
    capacitance: "Сыйымдылық (F)",
    inductance: "Индуктивтілік (H)",
    prices: "Бағалар",
  };  

  async function addPart() {
    form.validate();
    setLoading(true);
    if (form.isValid()) {
      let currentPartInfo = form.values || ({} as any);
  
      if (currentPartInfo) {
        currentPartInfo.voltage = String(voltageFormRef.current?.getSearchParameters().value ?? "");
        currentPartInfo.resistance = String(resistanceFormRef.current?.getSearchParameters().value ?? "");
        currentPartInfo.power = String(powerFormRef.current?.getSearchParameters().value ?? "");
        currentPartInfo.current = String(currentFormRef.current?.getSearchParameters().value ?? "");
        currentPartInfo.frequency = String(frequencyFormRef.current?.getSearchParameters().value ?? "");
        currentPartInfo.capacitance = String(capacitanceFormRef.current?.getSearchParameters().value ?? "");
        currentPartInfo.inductance = String(inductanceFormRef.current?.getSearchParameters().value ?? "");
      }
  
      const response = await fetch("/api/parts/create", {
        method: "POST",
        body: JSON.stringify({
          ...form.values,
          voltage: form.values.voltage ? parseFloat(form.values.voltage) : null,
          resistance: form.values.resistance ? parseFloat(form.values.resistance) : null,
          power: form.values.power ? parseFloat(form.values.power) : null,
          current: form.values.current ? parseFloat(form.values.current) : null,
          frequency: form.values.frequency ? parseFloat(form.values.frequency) : null,
          capacitance: form.values.capacitance ? parseFloat(form.values.capacitance) : null,
          inductance: form.values.inductance ? parseFloat(form.values.inductance) : null,
        }),
      }).then((response) =>
        response.json().then((data) => ({ status: response.status, body: data }))
      );
  
      if (response.status == 200) {
        notifications.show({
          title: "Бөлім сәтті қосылды",
          message: `Бөлім ${form.values.productCode} жүйеге қосылды!`,
          color: "green",
        });
        form.reset();
      } else {
        notifications.show({
          title: "Қосу қатесі",
          message:
            response.status == 409
              ? `Бөлім ${form.values.productCode} бұрыннан бар.`
              : `Бөлімді қосу мүмкін болмады. Қайталап көріңіз.`,
          color: "red",
        });
      }
    } else {
      notifications.show({
        title: "Қосу сәтсіз аяқталды",
        message: `Барлық қажетті өрістерді толтырыңыз.`,
      });
    }
    setLoading(false);
  }  

  const router = useRouter();
  const units = {
    voltage: "V",
    resistance: "Ω",
    power: "W",
    current: "A",
    frequency: "Hz",
    capacitance: "nF",
    inductance: "uH",
  };

  const voltageFormRef = useRef<UnitFormRef>(null);
  const resistanceFormRef = useRef<UnitFormRef>(null);
  const powerFormRef = useRef<UnitFormRef>(null);
  const currentFormRef = useRef<UnitFormRef>(null);
  const frequencyFormRef = useRef<UnitFormRef>(null);
  const capacitanceFormRef = useRef<UnitFormRef>(null);
  const inductanceFormRef = useRef<UnitFormRef>(null);
  const refMapping = {
    voltage: voltageFormRef,
    resistance: resistanceFormRef,
    power: powerFormRef,
    current: currentFormRef,
    frequency: frequencyFormRef,
    capacitance: capacitanceFormRef,
    inductance: inductanceFormRef,
  };

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
        <Carousel withIndicators height={"100%"}>
          {form.values.productImages.length === 0 ? (
            <Carousel.Slide>
              <Image
                p="lg"
                src="/images/image-add.svg"
                alt="Өнім суреттері"
                fit="contain"
              />
            </Carousel.Slide>
          ) : (
            form.values.productImages.map((image, index) => (
              <Carousel.Slide key={index}>
                <Image src={image} alt="Өнім суреті" fit="contain" />
              </Carousel.Slide>
            ))
          )}
        </Carousel>
  
        <Paper p="sm">
          <Stack p="sm">
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
                ...(form.values.productImages ?? []),
                ...images,
              ]);
            });
          }}
          accept={IMAGE_MIME_TYPE}
          multiple
        >
          <Center p={20}>
            <Text c="dimmed">
              Суреттерді осы жерге тастаңыз немесе таңдаңыз
            </Text>
          </Center>
        </Dropzone>;
            {/* Авто-толтыру */}
            <Paper p="sm" shadow="sm">
              <Group justify="space-between" pb={4}>
                <Text>Авто-толтыру:</Text>
                <Tooltip label="IL үшін автотолтыру және камерамен сканерлеу">
                  <ThemeIcon>
                    <IconInfoCircle />
                  </ThemeIcon>
                </Tooltip>
              </Group>
              <Grid>
              <Grid.Col span={6}>
                <Group gap="xs">
                  <TextInput
                    placeholder="Сканер кірісі"
                    value={scannerInput}
                    onChange={(e) => setScannerInput(e.currentTarget.value)}
                    w="100%"
                  />
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => setShowScanner(!showScanner)}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {showScanner ? "Жабу" : "Камераны қосу"}
                  </Button>
                </Group>
              </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    placeholder="Өнім коды"
                    value={productCode}
                    onChange={(e) => setProductCode(e.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Button w="100%" onClick={handleAutocomplete}>
                    Авто-сақтау
                  </Button>
                </Grid.Col>
                {showScanner && (
                  <Grid.Col span={12}>
                    <Paper withBorder p="xs">
                      <div id="reader" ref={scannerContainerRef} />
                    </Paper>
                  </Grid.Col>
                )}
              </Grid>
            </Paper>
  
            {/* Форм поля */}
            <form onSubmit={form.onSubmit(async (values) => await addPart())}>
              <Grid gutter={4}>
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
                  ) : value === "productId" ? (
                    <Grid.Col span={6} key={value}>
                      <NumberInput
                        description={fieldLabels[value]}
                        placeholder={fieldLabels[value]}
                        {...form.getInputProps(value)}
                        rightSection={<Text c="dimmed">{units[value] || ""}</Text>}
                      />
                    </Grid.Col>
                  ) : units[value as keyof typeof units] ? (
                    <Grid.Col span={6} key={value}>
                      <UnitForm
                        valueType={value as keyof typeof units}
                        ref={refMapping[value]}
                      />
                    </Grid.Col>
                  ) : (
                    value !== "productImages" && (
                      <Grid.Col span={6} key={value}>
                        <TextInput
                          description={fieldTranslations[value] || value}
                          placeholder={fieldTranslations[value] || value}
                          {...form.getInputProps(value)}
                          rightSection={<Text c="dimmed">{units[value] || ""}</Text>}
                        />
                      </Grid.Col>
                    )
                  )
                )}
  
                <Grid.Col span={12}>
                  <Button type="submit" w="100%">
                    Бөлім қосу
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
