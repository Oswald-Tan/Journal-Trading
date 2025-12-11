import { useDashboardData } from '../../hooks/useDashboardData';
import Dashboard from '../../components/Dashboard';

const Layout = (props) => {
  const dashboardData = useDashboardData();

  const safeProps = {
    entries: props.entries || [],
    stats: dashboardData.stats,
    target: dashboardData.target || {},
    targetProgress: dashboardData.targetProgress || null,
    currentPlan: props.currentPlan || { name: "Free" },
    initialBalance: dashboardData.initialBalance,
    currentBalance: dashboardData.currentBalance,
    onShowBalanceModal: props.onShowBalanceModal || (() => {}),
    onShowTargetModal: props.onShowTargetModal || (() => {}),
    onShowUpgradeModal: props.onShowUpgradeModal || (() => {}),
  };

  return <Dashboard {...safeProps} />;
};

export default Layout;