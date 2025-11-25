import React from 'react';
import Analytics from '../../components/Analytics';

const Layout = (props) => {
  // Pastikan props memiliki default values sebelum di-pass ke Analytics
  const safeProps = {
    entries: props.entries || [],
    stats: props.stats || {},
    ...props
  };

  return <Analytics {...safeProps} />;
};

export default Layout;