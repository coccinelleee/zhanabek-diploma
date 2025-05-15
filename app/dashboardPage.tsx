"use client";
import {
	Box,
	Button,
	Center,
	Group,
	HoverCard,
	Image,
	Loader,
	LoadingOverlay,
	MultiSelect,
	NavLink,
	NumberInput,
	NumberInputHandlers,
	Pagination,
	Paper,
	Select,
	SimpleGrid,
	Space,
	Stack,
	Table,
	Tabs,
	Text,
	TextInput,
	ThemeIcon,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import onScan from "onscan.js";
import { PartState } from "@/lib/helper/part_state";
import { format, round, unit } from "mathjs";
import {
	IconArrowLeftFromArc,
	IconLink,
	IconPdf,
	IconSearch,
	IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import ValueSearch, {
	ValueSearchRef,
} from "@/lib/components/search/ValueSearch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@mantine/form";
import { debounce } from "lodash";
import Link from "next/link";


export function scannerInputToType(partScannerInput: string): ScannerPartState {
	if (!partScannerInput || typeof partScannerInput !== "string") {
	  console.error("Invalid input to scannerInputToType:", partScannerInput);
	  return { pm: "", qty: 0, pc: "", error: true };
	}
  
	try {
	  const json: { [key: string]: string } = {};
	  const items = partScannerInput.split(",");
  
	  if (!Array.isArray(items) || items.length === 0) {
		throw new Error("Invalid format");
	  }
  
	  items.forEach((item) => {
		const [key, value] = item.split(":");
		if (key && value) {
		  json[key.trim()] = value.trim();
		}
	  });
  
	  return {
		pm: json.pm ?? "",
		qty: Number(json.qty ?? 0),
		pdi: json.pdi,
		pc: json.pc ?? "",
		on: json.on,
		pbn: json.pbn,
	  };
	} catch (e) {
	  console.error("Parsing error:", e);
	  return { pm: "", qty: 0, pc: "", error: true };
	}
  }  

export interface ScannerPartState {
	pbn?: string;
	on?: string;
	pc: string;	//LCSC Product Code
	pm: string;	//Manufacturer Product Number
	qty: number; //Quantity
	pdi?: string;
	error?: boolean;
}
type Operations = ">" | "<" | "=" | "<=" | ">=";

export interface FilterState {
	productCode?: string;
	productTitle?: string;
	productDescription?: string; //Deep search
	parentCatalogName?: string;
	encapStandard?: string;
	voltage?: { operation: Operations | string | null; value: number | null }; //operation referring to "<" ">" "="
	resistance?: {
		operation: Operations | string | null;
		value: number | null;
	};
	power?: { operation: Operations | string | null; value: number | null };
	current?: { operation: Operations | string | null; value: number | null };
	tolerance?: string; //Selector
	frequency?: { operation: Operations | string | null; value: number | null };
	capacitance?: {
		operation: Operations | string | null;
		value: number | null;
	}; //value is in pF
	inductance?: {
		operation: Operations | string | null;
		value: number | null;
	}; //value is in uH
}

export default function DashboardPage({
	loadedParts,
	itemCount,
	parentCatalogNames,
	searchCatalog,
}: {
	loadedParts: PartState[];
	itemCount: number;
	parentCatalogNames: string[];
	searchCatalog?: string;
}) {
	const itemsPerPage = 10;

	const [isLoading, setLoading] = useState(false);
	const [itemCountState, setItemCountState] = useState(itemCount);
	const router = useRouter();

	const [parts, setParts] = useState<PartState[]>(loadedParts);
	const [isSearchResult, setIsSearchResult] = useState(
		!!searchCatalog && searchCatalog.length > 0
	  );			
	const [activePage, setPage] = useState(1);

	const [parentCatalogNamesState, setParentCatalogNamesState] =
		useState<string[]>(parentCatalogNames);
	const voltageSearchRef = useRef<ValueSearchRef>(null);
	const resistanceSearchRef = useRef<ValueSearchRef>(null);
	const powerSearchRef = useRef<ValueSearchRef>(null);
	const currentSearchRef = useRef<ValueSearchRef>(null);
	const frequencySearchRef = useRef<ValueSearchRef>(null);
	const capacitanceSearchRef = useRef<ValueSearchRef>(null);
	const inductanceSearchRef = useRef<ValueSearchRef>(null);

	const searchForm = useForm<FilterState>({
		initialValues: {
			productTitle: undefined,
			productCode: undefined,
			productDescription: undefined,
			encapStandard: undefined,
			parentCatalogName: searchCatalog || undefined,
		},
	});	

	useEffect(() => {
		if (typeof document !== "undefined") {
			if (onScan.isAttachedTo(document) == false) {
				console.log("attaching onScan");
				onScan.attachTo(document, {
					suffixKeyCodes: [13], // enter-key expected at the end of a scan
					keyCodeMapper: function (oEvent) {
						if (oEvent.keyCode === 190) {
							return ":";
						}
						if (oEvent.keyCode === 188) {
							return ",";
						}
						return onScan.decodeKeyEvent(oEvent);
					},
					onScan: async function (sCode, iQty) {
						if (sCode) {
							let scanJson = JSON.parse(JSON.stringify(sCode));
							if (scanJson) {
								let partInfo = scannerInputToType(scanJson);
								setLoading(true);
								await getPartInfoFromLCSC(
									partInfo.pc,
									partInfo.qty
								);
								setLoading(false);
							}
						}
					},
				});
			} else {
				console.log("onScan құжатқа әлдеқашан тіркелген");
			}
		}
	}, []);

	const updatePartInState = (part: PartState) => {
		setParts((prevParts) => {
			const index = prevParts.findIndex((p) => p.id === part.id);
			if (index !== -1) {
				const updatedPart = { ...part };
				const newParts = [...prevParts];
				newParts[index] = updatedPart;
				return newParts;
			}
			return prevParts;
		});
	};

	async function searchParts(page: number) {
		setLoading(true);
		try {
			// let currentSearchFilter = searchFilter || {};
			let currentSearchFilter = searchForm.values || {};
			if (currentSearchFilter) {
				currentSearchFilter.voltage =
					voltageSearchRef.current?.getSearchParameters();
				currentSearchFilter.resistance =
					resistanceSearchRef.current?.getSearchParameters();
				currentSearchFilter.power =
					powerSearchRef.current?.getSearchParameters();
				currentSearchFilter.current =
					currentSearchRef.current?.getSearchParameters();
				currentSearchFilter.frequency =
					frequencySearchRef.current?.getSearchParameters();
				currentSearchFilter.capacitance =
					capacitanceSearchRef.current?.getSearchParameters();
				currentSearchFilter.inductance = inductanceSearchRef.current?.getSearchParameters();
			}
			console.log(currentSearchFilter);

			const res = await fetch("/api/parts/search", {
				method: "POST",
				body: JSON.stringify({
					filter: currentSearchFilter,
					page: page,
				}),
			}).then((response) =>
				response
					.json()
					.then((data) => ({ status: response.status, body: data }))
			);
			if (res.status !== 200) {
				throw new Error(res.body.error);
			}
			const response = res.body.parts as PartState[];
			if (response) {
				setParts(response);
				setItemCountState(response.length)
				if (!isSearchResult) {
					setIsSearchResult(true);
					setPage(page);
				}
			}
			// setParts(res.body);
		} catch (e: ErrorCallback | any) {
			console.error(e.message);
		}
		setLoading(false);
	}

	async function getParts(page: number) {
		setLoading(true);
		try {
			const res = await fetch("/api/parts?page=" + page).then(
				(response) =>
					response.json().then((data) => ({
						status: response.status,
						body: data,
					}))
			);
			if (res.status !== 200) {
				throw new Error(res.body.message);
			}
			const response = res.body.parts as PartState[];
			if (response) {
				setParts(response);
			}
			// setParts(res.body);
		} catch (e: ErrorCallback | any) {
			console.error(e.message);
		}
		setLoading(false);
	}

	async function clearSearch() {
		setIsSearchResult(false);
		voltageSearchRef?.current?.clear();
		resistanceSearchRef?.current?.clear();
		powerSearchRef?.current?.clear();
		currentSearchRef?.current?.clear();
		frequencySearchRef?.current?.clear();
		capacitanceSearchRef?.current?.clear();
		inductanceSearchRef?.current?.clear();
		router.replace("/", undefined);
		searchForm.reset();
		searchForm.setFieldValue("parentCatalogName", undefined);
		setPage(1);
		await getParts(1);
	}

	async function getPartInfoFromLCSC(pc: string, quantity: number) {
		// fetch part info from LCSC
		// return part info
		try {
			const res = await fetch("/api/parts", {
				method: "POST",
				body: JSON.stringify({ pc: pc, quantity }),
			}).then((response) =>
				response
					.json()
					.then((data) => ({ status: response.status, body: data }))
			);
			if (res.status !== 200) {
				throw new Error(res.body.message);
			}
			if (res.body.message == "Бөлім жаңартылды") {
				notifications.show({
					title: "Бөлім жаңартылды",
					message: `Бөлшектің саны (${res.body.body.productCode}) дейін сәтті жаңартылды ${res.body.body.quantity}!`,
				});
				updatePartInState(res.body.body);
			}
			if (res.body.message == "Бөлім құрылды") {
				notifications.show({
					title: "Бөлім қосылды",
					message: `Бөлім ${res.body.body.productCode} сәтті қосылды!`,
				});
				console.log("PART CREATED");
				// if(Math.ceil(itemCountState / itemsPerPage) > Math.ceil(res.body.itemCount)) {

				getParts(activePage);
				setParentCatalogNamesState(
					res.body.parentCatalogNames
						.filter((item) => item.parentCatalogName !== null)
						.map((item) => item.parentCatalogName)
				);
				setItemCountState(res.body.itemCount);
			}
			// console.log(res.body);
			// await getParts();
		} catch (e: ErrorCallback | any) {
			console.error(e.message);
		}
	}

	async function deletePart(partId: number) {
		// setLoading(true)
		try {
			const res = await fetch("/api/parts/delete", {
				method: "POST",
				body: JSON.stringify({ id: partId }),
			}).then((response) =>
				response
					.json()
					.then((data) => ({ status: response.status, body: data }))
			);
			if (res.status !== 200) {
				console.log(res.body.message);
			}
			if (res.status == 200) {
				if (
					Math.ceil(itemCountState / itemsPerPage) >
						Math.ceil(res.body.itemCount) &&
					activePage == Math.ceil(itemCountState / itemsPerPage)
				) {
					navigatePage(activePage - 1);
				} else {
					getParts(activePage);
				}
				setParentCatalogNamesState(
					res.body.parentCatalogNames
						.filter((item) => item.parentCatalogName !== null)
						.map((item) => item.parentCatalogName)
				);
				setItemCountState(res.body.itemCount);
				notifications.show({
					title: "Бөлім өшірілді",
					message: `Бөлім ${res.body.body.productCode} сәтті жойылды!`,
				});
			}
			console.log(res.body);
			// await getParts();
		} catch (e: ErrorCallback | any) {
			console.error(e.message);
		}
	}

	async function updatePartQuantity(partId: number, quantity: number) {
		setLoading(true);
		try {
			const res = await fetch("/api/parts/update", {
				method: "POST",
				body: JSON.stringify({ id: partId, quantity }),
			}).then((response) =>
				response
					.json()
					.then((data) => ({ status: response.status, body: data }))
			);
			if (res.status !== 200) {
				throw new Error(res.body.message);
			}
			console.log(res.body);
			if (res.status == 200) {
				notifications.show({
					title: "Көлемі жаңартылды",
					message: `Саны ${res.body.body.productCode} дейін сәтті жаңартылды ${quantity}!`,
				});
				updatePartInState(res.body.body);
			}
		} catch (e: ErrorCallback | any) {
			console.error(e.message);
		}
		setLoading(false);
	}

	async function navigatePage(page: number) {
		setPage(page);
		if (isSearchResult) {
			await searchParts(page);
		} else {
			await getParts(page);
		}
	}

	const debouncedSearch = useRef(
		debounce((value: string) => {
		  searchForm.setFieldValue("productTitle", value);
		  searchParts(1);
		}, 300)
	  ).current;

	return (
		<Stack gap={"sm"} style={{ overflowX: "hidden" }}>
			<Paper
				m={"sm"}
				withBorder
				shadow="md"
				style={{ position: "sticky", top: "10px", overflow: "hidden" }}
			>
				<Stack p={"sm"}>
					<form
						onSubmit={searchForm.onSubmit((values) => {
							searchParts(1);
						})}
					>
						<SimpleGrid
							cols={{ lg: 7, sm: 2, xl: 7, md: 4 }}
							spacing={2}
						>
							<ValueSearch
								valueType="Кернеу"
								ref={voltageSearchRef}
							/>
							<ValueSearch
								valueType="Кедергі"
								ref={resistanceSearchRef}
							/>
							<ValueSearch
								valueType="Қуат"
								ref={powerSearchRef}
							/>
							<ValueSearch
								valueType="Тоқ"
								ref={currentSearchRef}
							/>
							<ValueSearch
								valueType="Жиілік"
								ref={frequencySearchRef}
							/>
							<ValueSearch
								valueType="Сыйымдылық"
								ref={capacitanceSearchRef}
							/>
							<ValueSearch
								valueType="индуктивтілік"
								ref={inductanceSearchRef}
							/>
							<TextInput
							placeholder="Атауы"
							radius={0}
							value={searchForm.values.productTitle ?? ""}
							onChange={(event) => {
								debouncedSearch(event.currentTarget.value);
							}}
							/>
							<TextInput
								placeholder="Стандартты қаптама"
								radius={0}
								{...searchForm.getInputProps("encapStandard")}
							/>
							<TextInput
								placeholder="Өнім коды"
								value={searchForm.values.productCode ?? ""}
								radius={0}
								onChange={(event) => {
									const productCode =
										event.currentTarget.value.replace(
											/\s/g,
											""
										);
									searchForm.setFieldValue(
										"productCode",
										productCode
									);
								}}
							/>

							<TextInput
								placeholder="Сипаттамасы"
								{...searchForm.getInputProps(
									"productDescription"
								)}
								radius={0}
							/>
							<Select
							placeholder="Каталог"
							radius={0}
							data={parentCatalogNamesState ?? []}
							clearable
							searchable
							value={searchForm.values.parentCatalogName}
							onChange={(value) => {
								searchForm.setFieldValue("parentCatalogName", value ?? undefined);
								searchParts(1);
							  }}							  
							/>
							<Button
								type="submit"
								rightSection={<IconSearch />}
								radius={0}
							>
								Іздеу
							</Button>
							<Button
								onClick={() => {
									clearSearch();
								}}
								radius={0}
							>
								Өшіру
							</Button>
						</SimpleGrid>
					</form>
				</Stack>
			</Paper>

			<Paper p={"sm"}>
				<Stack>
					{parts != null && parts.length > 0 ? (
						<Table.ScrollContainer minWidth={500}>
							<Table>
								<Table.Thead>
									<LoadingOverlay
										visible={isLoading}
										zIndex={1000}
										overlayProps={{ blur: 5, opacity: 0.5 }}
									/>
									<Table.Tr>
										<Table.Th>Сурет</Table.Th>
										{/* <Table.Th>ID</Table.Th> */}
										<Table.Th>Атауы</Table.Th>
										<Table.Th>Өнім коды</Table.Th>
										<Table.Th>Саны</Table.Th>
										<Table.Th>Санына әрекеттер</Table.Th>
										<Table.Th>Өнім ID</Table.Th>
										<Table.Th>Моделі</Table.Th>
										<Table.Th>Сипаттамасы</Table.Th>
										<Table.Th>Ата-аналық санат</Table.Th>
										<Table.Th>Санат атауы</Table.Th>
										<Table.Th>Бренд атауы</Table.Th>
										<Table.Th>Қаптама стандарты</Table.Th>
										<Table.Th>PDF</Table.Th>
										<Table.Th>Сілтеме</Table.Th>
										<Table.Th>Бағасы</Table.Th>
										<Table.Th>Кернеу</Table.Th>
										<Table.Th>Кедергі</Table.Th>
										<Table.Th>Қуат</Table.Th>
										<Table.Th>Ток</Table.Th>
										<Table.Th>Төзімділік</Table.Th>
										<Table.Th>Жиілік</Table.Th>
										<Table.Th>Сыйымдылық</Table.Th>
										<Table.Th>Индуктивтік</Table.Th>
										<Table.Th>Жою</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{parts.map((element) => (
										<PartItem
											key={element.id}
											part={element}
											isLoading={isLoading}
											updatePartQuantity={
												updatePartQuantity
											}
											deletePart={deletePart}
										/>
									))}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>
					) : (
						<Paper w={"100%"} shadow="sm" withBorder>
							<Text p={"sm"}>Бөлшектер табылмады</Text>
						</Paper>
					)}
					<Group>
						<Pagination
							total={Math.ceil(itemCountState / itemsPerPage)}
							value={activePage}
							onChange={async (value: number) => {
								await navigatePage(value);
							}}
						/>
						<Text c="dimmed">({itemCountState})</Text>
					</Group>
				</Stack>
			</Paper>
		</Stack>
	);
}

function PartItem({
	part,
	isLoading,
	updatePartQuantity,
	deletePart,
}: {
	part: PartState;
	isLoading: boolean;
	updatePartQuantity: (partId: number, quantity: number) => Promise<void>;
	deletePart: (partId: number) => Promise<void>;
}) {
	const addQuantityRef = useRef<HTMLInputElement>(null);
	const removeQuantityRef = useRef<HTMLInputElement>(null);
	return (
		<Table.Tr key={part.id}>
			<Table.Td>
				<img
					src={part.productImages?.[0] ?? "/default.png"} alt="Логотип" width="100" height="100"
					// alt={part.title}
				/>
			</Table.Td>
			<Table.Td>
				<Stack gap={"sm"}>
					{part.title}
					<Link href={`/part/${part.id}`} passHref>
					<Button
						component="a" 
						variant="light"
						size="xs"
						leftSection={
						<ThemeIcon>
							<IconArrowLeftFromArc />
						</ThemeIcon>
						}
					>
						Мәліметтер
					</Button>
					</Link>
				</Stack>
				</Table.Td>
			<Table.Td>{part.productCode}</Table.Td>
			<Table.Td>{part.quantity}</Table.Td>
			<Table.Td>
				<Tabs variant="outline" defaultValue={"add"} w={200}>
					<Tabs.List justify="center">
						<Tabs.Tab value={"add"}>Қосу</Tabs.Tab>
						<Tabs.Tab value={"remove"}>Бас тарту</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value="add">
						<Stack gap={"sm"} pt={3}>
							<NumberInput
								placeholder="Саны"
								label="Саны"
								min={1}
								clampBehavior="strict"
								defaultValue={1}
								ref={addQuantityRef}
							/>
							<Button
								disabled={isLoading}
								onClick={async () => {
									console.log(addQuantityRef.current?.value);
									await updatePartQuantity(
										part.id,
										part.quantity +
											Number(
												addQuantityRef.current?.value
											)
									);
								}}
							>
								Қосу
							</Button>
						</Stack>
					</Tabs.Panel>
					<Tabs.Panel value="remove">
						<Stack gap={"sm"} pt={3}>
							<NumberInput
								placeholder="Саны"
								label="Саны"
								min={1}
								max={part.quantity}
								clampBehavior="strict"
								defaultValue={part.quantity ?? 1}
								ref={removeQuantityRef}
							/>
							<Button
								disabled={isLoading}
								onClick={async () => {
									console.log(
										removeQuantityRef.current?.value
									);
									await updatePartQuantity(
										part.id,
										part.quantity -
											Number(
												removeQuantityRef.current?.value
											)
									);
								}}
							>
								Бас тарту
							</Button>
						</Stack>
					</Tabs.Panel>
				</Tabs>
			</Table.Td>
			<Table.Td>{part.productId}</Table.Td>
			<Table.Td>{part.productModel}</Table.Td>
			<Table.Td>{part.productDescription}</Table.Td>
			<Table.Td>{part.parentCatalogName}</Table.Td>
			<Table.Td>{part.catalogName}</Table.Td>
			<Table.Td>{part.brandName}</Table.Td>
			<Table.Td>{part.encapStandard}</Table.Td>
			<Table.Td>
				{part.pdfLink ? (
					<NavLink
						href={part.pdfLink}
						target="_blank"
						label="Сілтеме"
						active
						leftSection={
							<ThemeIcon>
								<IconPdf />
							</ThemeIcon>
						}
					/>
				) : (
					<></>
				)}
			</Table.Td>
			<Table.Td>
				{part.productLink ? (
					<NavLink
						href={part.productLink}
						target="_blank"
						label="Тауар"
						active
						leftSection={
							<ThemeIcon>
								<IconLink />
							</ThemeIcon>
						}
					/>
				) : (
					<></>
				)}
			</Table.Td>
			<HoverCard position="left" withArrow>
				<HoverCard.Target>
				<Table.Td>
				{part.prices?.length
					? part.prices[0]?.price + "₸"
					: ""}
				</Table.Td>
				</HoverCard.Target>
				<HoverCard.Dropdown>
					<Table>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Саны</Table.Th>
								<Table.Th>Бағасы</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
						{part.prices?.map((price) => (
						<Table.Tr key={price.ladder}>
							<Table.Td>{price.ladder}</Table.Td>
							<Table.Td>{price.price + "₸"}</Table.Td>
						</Table.Tr>
						))}
						</Table.Tbody>
					</Table>
				</HoverCard.Dropdown>
			</HoverCard>
			<Table.Td>{formatVoltage(part.voltage)}</Table.Td>
			<Table.Td>{formatResistance(part.resistance)}</Table.Td>
			<Table.Td>{formatPower(part.power)}</Table.Td>
			<Table.Td>{formatCurrent(part.current)}</Table.Td>
			<Table.Td>{part.tolerance}</Table.Td>
			<Table.Td>{formatFrequency(part.frequency)}</Table.Td>
			<Table.Td>{formatCapacitance(part.capacitance)}</Table.Td>
			<Table.Td>{formatInductance(part.inductance)}</Table.Td>
			<Table.Td>
				<Button
					leftSection={
						<ThemeIcon color="red">
							<IconTrash />
						</ThemeIcon>
					}
					color="red"
					variant="light"
					onClick={async () => {
						deletePart(part.id);
					}}
				>
					Жою
				</Button>
			</Table.Td>
		</Table.Tr>
	);
}

const formatVoltage = (voltage: any) =>
	`${
		voltage < 1
			? round(unit(Number(voltage), "V").toNumeric("mV")) + " mV"
			: format(voltage, { lowerExp: -2, upperExp: 2 }) + " V"
	}`;
const formatResistance = (resistance: any) =>
	`${
		resistance < 1
			? round(unit(Number(resistance), "ohm").toNumeric("mohm")) + " mΩ"
			: resistance >= 1000
			? round(unit(Number(resistance), "ohm").toNumeric("kohm")) + " kΩ"
			: format(resistance, { lowerExp: -2, upperExp: 2 }) + " Ω"
	}`;
const formatPower = (power: any) =>
	`${
		power < 1
			? round(unit(Number(power), "W").toNumeric("mW")) + " mW"
			: format(power, { lowerExp: -2, upperExp: 2 }) + " W"
	}`;
const formatCurrent = (current: any) =>
	`${
		current < 1
			? round(unit(Number(current), "A").toNumeric("mA")) + " mA"
			: format(current, { lowerExp: -2, upperExp: 2 }) + " A"
	}`;
const formatFrequency = (frequency: any) =>
	`${
		frequency < 1
			? round(unit(Number(frequency), "Hz").toNumeric("mHz")) + " mHz"
			: frequency >= 1000000
			? round(unit(Number(frequency), "Hz").toNumeric("MHz")) + " MHz"
			: frequency >= 1000
			? round(unit(Number(frequency), "Hz").toNumeric("kHz")) + " kHz"
			: format(frequency, { lowerExp: -2, upperExp: 2 }) + " Hz"
	}`;
const formatCapacitance = (capacitance: any) => {
	return `${round(unit(Number(capacitance), "pF").toNumeric("nF"))} nF`;
};
const formatInductance = (inductance: any) => {
	return `${round(Number(inductance ?? null))} uH`;
};
