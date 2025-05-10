import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import CountryMap from "./CountryMap";

interface SmsHistory {
  id: number;
  recipient: string;
  message: string;
  status: "sent" | "failed" | "pending";
  cost: number;
  created_at: string;
  network?: string; // Optional, if API provides it
}

interface DeliveryReport {
  status: "sent" | "failed" | "pending";
}

interface NetworkData {
  name: string;
  logo: string;
  customers: number;
  deliveryRate: number;
}

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [country, setCountry] = useState<"Uganda" | "Kenya">("Uganda");
  const [smsHistory, setSmsHistory] = useState<SmsHistory[]>([]);
  const [deliveryReports, setDeliveryReports] = useState<DeliveryReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch SMS history
        const smsResponse = await fetch(
          `https://luco-sms-api.onrender.com/api/v1/sms_history?user_id=1&skip=0&limit=1000`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        if (!smsResponse.ok) throw new Error("Failed to fetch SMS history");
        const smsData: SmsHistory[] = await smsResponse.json();
        setSmsHistory(smsData);

        // Fetch delivery reports
        const deliveryPromises = smsData.map((sms) =>
          fetch(
            `https://luco-sms-api.onrender.com/api/v1/delivery_report?user_id=1&sms_id=${sms.id}`,
            {
              method: "GET",
              headers: { Accept: "application/json" },
            }
          ).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch delivery report for SMS ${sms.id}`);
            return res.json();
          })
        );
        const deliveryData: DeliveryReport[] = await Promise.all(deliveryPromises);
        setDeliveryReports(deliveryData);

        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getNetworkData = (): NetworkData[] => {
    // Filter SMS by country (based on recipient prefix)
    const countryPrefixes = {
      Uganda: "+256",
      Kenya: "+254",
    };
    const filteredSms = smsHistory.filter((sms) =>
      sms.recipient.startsWith(countryPrefixes[country])
    );
    const filteredDelivery = deliveryReports.slice(0, filteredSms.length);

    // Define networks based on country
    const networks = country === "Uganda" ? ["Airtel UG", "MTN UG"] : ["Safaricom KE", "Airtel KE"];

    // Infer network from recipient prefix if no network field
    const getNetwork = (recipient: string): string => {
      if (country === "Uganda") {
        if (/^\+256(70|75)/.test(recipient)) return "Airtel UG";
        if (/^\+256(77|78)/.test(recipient)) return "MTN UG";
      } else {
        if (/^\+254(7[0-2]|10)/.test(recipient)) return "Safaricom KE";
        if (/^\+254(7[3-9]|11)/.test(recipient)) return "Airtel KE";
      }
      return networks[0]; // Fallback
    };

    // Calculate network data
    const networkData: { [key: string]: { customers: Set<string>; sent: number; total: number } } = {};
    networks.forEach((network) => {
      networkData[network] = { customers: new Set(), sent: 0, total: 0 };
    });

    filteredSms.forEach((sms, i) => {
      const network = sms.network || getNetwork(sms.recipient);
      if (networkData[network]) {
        networkData[network].customers.add(sms.recipient);
        networkData[network].total++;
        if (filteredDelivery[i]?.status === "sent") {
          networkData[network].sent++;
        }
      }
    });

    return networks.map((network) => ({
      name: network,
      logo:
        network === "Airtel UG"
          ? "./images/country/airtel_logo1.png"
          : network === "MTN UG"
          ? "./images/country/mtn_logo.svg"
          : network === "Safaricom KE"
          ? "./images/country/mtn_logo.svg" // Add actual path
          : "./images/country/airtel_logo1.png", // Add actual path
      customers: networkData[network].customers.size,
      deliveryRate: networkData[network].total > 0 ? (networkData[network].sent / networkData[network].total) * 100 : 0,
    }));
  };

  const networkData = getNetworkData();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleCountryChange = (newCountry: "Uganda" | "Kenya") => {
    setCountry(newCountry);
    closeDropdown();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Available Networks
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View the available {country} networks
          </p>
        </div>
        <div className="relative inline-block">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleDropdown}
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <DropdownItem
              onItemClick={() => handleCountryChange("Uganda")}
              className="flex w-full px-3 py-2 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Uganda
            </DropdownItem>
            <DropdownItem
              onItemClick={() => handleCountryChange("Kenya")}
              className="flex w-full px-3 py-2 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-가지400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Kenya
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Loading network data...
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500 dark:text-red-400">
          {error}
        </div>
      ) : (
        <>
          <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800 sm:px-6">
            <div
              id="mapOne"
              className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
            >
              <CountryMap country={country} />
            </div>
          </div>

          <div className="space-y-5">
            {networkData.map((network) => (
              <div key={network.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="items-center w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={network.logo}
                      className="w-full h-full object-cover"
                      alt={network.name}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm dark:text-white/90">
                      {network.name}
                    </p>
                    <span className="block text-gray-500 text-xs dark:text-gray-400">
                      {network.customers.toLocaleString()} Customers
                    </span>
                  </div>
                </div>
                <div className="flex w-full max-w-[140px] items-center gap-3">
                  <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                    <div
                      className="absolute left-0 top-0 h-full rounded-sm bg-brand-500"
                      style={{ width: `${network.deliveryRate}%` }}
                    ></div>
                  </div>
                  <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                    {network.deliveryRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}