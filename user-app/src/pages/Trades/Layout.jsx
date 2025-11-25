import React from 'react';
import Trades from '../../components/Trades';

const Layout = (props) => {
  // Pastikan props memiliki default values sebelum di-pass ke Trades
  const safeProps = {
    stats: props.stats || {},
    currentPlan: props.currentPlan || { name: "Free", maxEntries: 30 },
    onShowUpgradeModal: props.onShowUpgradeModal || (() => console.log("Upgrade modal not available")),
    subscription: props.subscription || { plan: "free" },
    currentBalance: props.currentBalance || 0,
    ...props
  };

  return <Trades {...safeProps} />;
};

export default Layout;