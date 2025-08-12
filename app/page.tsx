import { MainLayout } from "@/components/layout/main-layout"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ProcessChart } from "@/components/dashboard/process-chart"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema de análisis de licitaciones</p>
        </div>

        <DashboardStats />

        <div className="grid gap-6 lg:grid-cols-2">
          <ProcessChart />
          <RecentActivity />
        </div>
      </div>
    </MainLayout>
  )
}
