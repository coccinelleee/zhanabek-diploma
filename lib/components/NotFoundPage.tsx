import {
  Image,
  Container,
  Title,
  Text,
  Button,
  SimpleGrid,
} from "@mantine/core";
import classes from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
        <Image
          src="/images/404.svg"
          className={classes.mobileImage}
          alt="404 Image"
        />
        <div>
          <Title className={classes.title}>Бірдеңе дұрыс емес...</Title>
          <Text c="dimmed" size="lg">Сіз ашуға тырысқан бет табылмады. Мекенжайды қате терген болуыңыз мүмкін немесе бет басқа URL мекенжайына көшірілген. Егер бұл қате деп ойласаңыз, қолдау қызметіне хабарласыңыз.</Text>
          <Button
            variant="outline"
            size="md"
            mt="xl"
            className={classes.control}
          >
            Негізгі бетке оралу
          </Button>
        </div>
        <Image
          src={"/images/404.svg"}
          className={classes.desktopImage}
          alt="404 Image"
        />
      </SimpleGrid>
    </Container>
  );
}