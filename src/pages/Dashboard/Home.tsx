import EcommerceMetrics from "../../utils/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../utils/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
// import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../utils/ecommerce/RecentOrders";
import DemographicCard from "../../utils/ecommerce/DemographicCard";
import PageMeta from "../../utils/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Luco SMS - Bulk SMS Sender"
        description="The lucosms is a simple to use dashboard for sending bulky sms."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
          
        </div>

        <div className="col-span-12 xl:col-span-5">
          
          <DemographicCard />
        </div>

        <div className="hidden md:grid col-span-12  ">
         
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
