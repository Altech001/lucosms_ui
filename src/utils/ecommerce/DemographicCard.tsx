
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../../components/ui/skeleton";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import CountryMap from "./CountryMap";

interface NetworkData {
  name: string;
  logo: string;
  customers: number;
  deliveryRate: number;
}

async function fetchSmsHistory() {
  const response = await fetch(
    `https://luco-sms-api.onrender.com/api/v1/sms_history?user_id=1&skip=0&limit=1000`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch SMS history');
  }
  return response.json();
}

async function fetchDeliveryReports() {
  const response = await fetch(
    `https://luco-sms-api.onrender.com/api/v1/delivery_report?user_id=1`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch delivery reports');
  }
  return response.json();
}

export default function DemographicCard() {
  const [country, setCountry] = useState<"Uganda" | "Kenya">("Uganda");
  const [isOpen, setIsOpen] = useState(false);

  const { 
    data: smsHistory,
    isLoading: smsLoading,
    error: smsError
  } = useQuery({
    queryKey: ['smsHistory'],
    queryFn: fetchSmsHistory,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: deliveryReports,
    isLoading: reportsLoading,
    error: reportsError
  } = useQuery({
    queryKey: ['deliveryReports'],
    queryFn: fetchDeliveryReports,
    enabled: !!smsHistory?.length,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleCountryChange = (newCountry: "Uganda" | "Kenya") => {
    setCountry(newCountry);
    closeDropdown();
  };

  if (smsLoading || reportsLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
          <Skeleton className="h-[300px] w-full" variant="rectangular" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (smsError || reportsError) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <p className="text-red-600 text-center">
          {smsError?.message || reportsError?.message || 'Error loading data. Please try again later.'}
        </p>
      </div>
    );
  }

  const getNetworkData = (): NetworkData[] => {
    const countryPrefixes = {
      Uganda: "+256",
      Kenya: "+254",
    };

    const filteredSms = smsHistory?.filter((sms) =>
      sms.recipient.startsWith(countryPrefixes[country])
    ) || [];

    const networks = country === "Uganda" 
      ? [
          { name: "Airtel UG", logo: "/images/country/airtel_logo1.png" },
          { name: "MTN UG", logo: "/images/country/mtn_logo.svg" }
        ]
      : [
          { name: "Safaricom KE", logo: "/images/country/safaricom_logo.svg" },
          { name: "Airtel KE", logo: "/images/country/airtel_ke_logo.svg" }
        ];

    return networks.map(network => ({
      ...network,
      customers: filteredSms.length || 0,
      deliveryRate: (deliveryReports?.filter(r => r.status === "sent").length / (deliveryReports?.length || 1)) * 100 || 0
    }));
  };

  const networkData = getNetworkData();

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
              className="flex w-full px-3 py-2 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Kenya
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800 sm:px-6">
        <div className="mapOne -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]">
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
    </div>
  );
}
