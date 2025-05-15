"use client";

import {
  Image,
  Container,
  Title,
  Text,
  Button,
  SimpleGrid,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import classes from "./NotFoundPage.module.css";
import { motion } from "framer-motion";

export default function AboutPage() {
  const router = useRouter();

  return (
    <Container className={classes.root}>
      <SimpleGrid
        spacing={{ base: 40, sm: 80 }}
        cols={{ base: 1, sm: 1 }}
        style={{ maxWidth: 900, margin: "0 auto" }}
      >
        <motion.div
          style={{ textAlign: "justify" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title className={classes.title} ta="center">
            🌐 Сайт туралы | Inventory Logistics
          </Title>

          <Text c="dimmed" size="lg" mt="md">
            <strong>Inventory Logistics</strong> — бұл заманауи қойма және инвентаризация
            жүйесі, әртүрлі электронды компоненттерді, техникалық жабдықтарды және өндірістік материалдарды тіркеу,
            сақтау, іздеу және басқару үшін жасалған.
          </Text>

          <Text mt="lg" size="lg">
            ⚙️ <strong>Сіз не қоса аласыз?</strong>
            <br />
            Жүйе арқылы сіз барлық электроника компоненттерін (резисторлар, конденсаторлар, микросхемалар,
            реле, дроссельдер, диодтар), сондай-ақ лабораториялық құрылғылар, өндірістік жабдықтар,
            құрал-саймандар мен техниканы тіркей аласыз.
          </Text>

          <Text mt="lg" size="lg">
            🎯 <strong>Кімдер үшін?</strong>
            <br />
            – Студенттер және зертхана меңгерушілері <br />
            – Инженерлер және техникалық мамандар <br />
            – Колледждер мен университеттер <br />
            – Кәсіпорындар, шағын зауыттар <br />
            – Ғылыми орталықтар және инновациялық зертханалар
          </Text>

          <Text mt="lg" size="lg">
            📦 <strong>Нені автоматтандырады?</strong>
            <br />
            – Қоймада компонентті қосу немесе алып тастау <br />
            – Баға сатыларын басқару <br />
            – Сканермен жедел тіркеу <br />
            – Сүзгілер арқылы терең іздеу <br />
            – Нақты уақыт режимінде инвентаризация жүргізу
          </Text>

          <Text mt="lg" size="lg">
            📈 <strong>Қандай артықшылықтары бар?</strong>
            <br />
            – Оңай және түсінікті интерфейс <br />
            – Барлық маңызды техникалық параметрлер: кернеу, қуат, ток, жиілік, индуктивтілік және т.б. <br />
            – Автоқолдау: скан арқылы толтыру <br />
            – Жеке санаттар, PDF және өнім сілтемелері
          </Text>

          <Text mt="lg" size="lg">
            🧠 <strong>Не үшін жасалды?</strong>
            <br />
            Бұл веб-қосымша дипломдық жұмыс ретінде әзірленіп, қойма есебінің заманауи цифрлық моделін
            ұсынуға бағытталған. Жобаның мақсаты — логистиканы, материалдық қорларды және оқу процесін
            жеңілдететін нақты шешім жасау.
          </Text>

          <Text mt="lg" size="lg">
            ✅ <strong>Нақты қолдану сценарийлері:</strong>
            <br />
            – Электроника лабораториясы<br />
            – Оқу мекемесіндегі тәжірибе жұмыстары<br />
            – Студенттерге арналған жеке жоба бақылауы<br />
            – Кәсіпорын қоймасындағы жабдық тіркеу<br />
            – Компоненттерді кодпен автоматты енгізу
          </Text>

          <Text mt="lg" size="lg">
            🔐 <strong>Сенімділік пен қауіпсіздік</strong>
            <br />
            Деректер <strong>Prisma + PostgreSQL</strong> негізінде сақталады, ал UI <strong>Mantine</strong> және
            <strong> Next.js</strong> арқылы толық жауап беретін жүйе ретінде жасалған.
          </Text>

          <Button
            variant="outline"
            size="md"
            mt="xl"
            className={classes.control}
            onClick={() => router.push("/")}
          >
            🔙 Басты бетке оралу
          </Button>
        </motion.div>
      </SimpleGrid>
    </Container>
  );
}
