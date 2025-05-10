import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

interface SmsHistory {
  id: number;
  recipient: string;
  message: string;
  status: "sent" | "failed" | "pending";
  cost: number;
  created_at: string;
}

export default function MonthlySalesChart() {
  const [smsHistory, setSmsHistory] = useState<SmsHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSmsHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://luco-sms-api.onrender.com/api/v1/sms_history?user_id=1&skip=0&limit=1000`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch SMS history");
        const data: SmsHistory[] = await response.json();
        setSmsHistory(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSmsHistory();
  }, []);

  const getChartData = () => {
    if (period === "monthly") {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const data = new Array(12).fill(0);
      smsHistory.forEach((sms) => {
        const date = new Date(sms.created_at);
        const month = date.getMonth();
        data[month]++;
      });
      return {
        categories: months,
        series: [{ name: "SMS Sent", data }],
      };
    } else {
      // Weekly: Assume 4 weeks per month, adjust based on your needs
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const data = new Array(4).fill(1);
      smsHistory.forEach((sms) => {
        const date = new Date(sms.created_at);
        const week = Math.floor(date.getDate() / 7); // Approximate week
        if (week < 4) data[week]++;
      });
      return {
        categories: weeks,
        series: [{ name: "SMS Sent", data }],
      };
    }
  };

  const { categories, series } = getChartData();

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      fontSize: "14px",
      markers: {
        // width: 12,
        // height: 12,
        // radius: 12,
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val.toLocaleString()} SMS`,
      },
    },
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handlePeriodChange = (newPeriod: "monthly" | "weekly") => {
    setPeriod(newPeriod);
    closeDropdown();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Message Outbox Status
        </h3>
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
              onItemClick={() => handlePeriodChange("monthly")}
              className="flex w-full px-3 py-2 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Monthly
            </DropdownItem>
            <DropdownItem
              onItemClick={() => handlePeriodChange("weekly")}
              className="flex w-full px-3 py-2 text-sm text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Weekly
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Loading chart...
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500 dark:text-red-400">
          {error}
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <Chart options={options} series={series} type="bar" height={180} />
          </div>
        </div>
      )}
    </div>
  );
}