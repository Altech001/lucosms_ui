import { useState, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { MessageSquareMore, PackageOpen } from 'lucide-react';

interface SmsHistory {
  id: number;
  recipient: string;
  message: string;
  status: "sent" | "failed" | "pending";
  cost: number;
  created_at: string;
}

interface DeliveryReport {
  status: "sent" | "failed" | "pending";
}

export default function EcommerceMetrics() {
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
          `https://luco-sms-api.onrender.com/api/v1/sms_history?user_id=1`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        if (!smsResponse.ok) throw new Error("Failed to fetch SMS history");
        const smsData: SmsHistory[] = await smsResponse.json();
        setSmsHistory(smsData);

        // Fetch delivery reports for each SMS
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

  // Calculate metrics
  const totalSms = smsHistory.length;
  const deliveredSms = deliveryReports.filter((report) => report.status === "sent").length;
  const deliveryRate = totalSms > 0 ? (deliveredSms / totalSms) * 100 : 0;

  // Simulate percentage changes (replace with actual historical data if available)
  const previousTotalSms = totalSms * 0.9; // Assume 10% fewer SMS last period
  const previousDeliveryRate = deliveryRate * 0.9; // Assume 10% lower rate last period
  const outboxChange = totalSms > 0 ? ((totalSms - previousTotalSms) / previousTotalSms) * 100 : 0;
  const deliveryRateChange = deliveryRate > 0 ? ((deliveryRate - previousDeliveryRate) / previousDeliveryRate) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {isLoading ? (
        <div className="col-span-2 p-4 text-center text-gray-500 dark:text-gray-400">
          Loading metrics...
        </div>
      ) : error ? (
        <div className="col-span-2 p-4 text-center text-red-500 dark:text-red-400">
          {error}
        </div>
      ) : (
        <>
          {/* Outbox Metric */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <MessageSquareMore className="text-gray-800 size-6 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Outbox
                </span>
                <h4 className="mt-2 font-semibold text-gray-800 text-xl dark:text-white/90">
                  {totalSms.toLocaleString()}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {" "}sms
                  </span>
                </h4>
              </div>
              <Badge color={outboxChange >= 0 ? "success" : "error"}>
                {outboxChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {Math.abs(outboxChange).toFixed(2)}%
              </Badge>
            </div>
          </div>

          {/* Delivery Rate Metric */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <PackageOpen className="text-gray-800 size-6 dark:text-white/90" />
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Delivery Rate
                </span>
                <h4 className="mt-2 font-semibold text-gray-800 text-xl dark:text-white/90">
                  {deliveryRate.toFixed(1)}%
                </h4>
              </div>
              <Badge color={deliveryRateChange >= 0 ? "success" : "error"}>
                {deliveryRateChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {Math.abs(deliveryRateChange).toFixed(2)}%
              </Badge>
            </div>
          </div>
        </>
      )}
    </div>
  );
}