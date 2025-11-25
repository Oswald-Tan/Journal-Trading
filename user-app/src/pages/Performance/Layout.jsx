import React from 'react';
import Performance from '../../components/Performance';

const Layout = (props) => {
  // Pastikan props memiliki default values sebelum di-pass ke Performance
  const safeProps = {
    entries: props.entries || [],
    stats: props.stats || {},
    ...props
  };

  return <Performance {...safeProps} />;
};

export default Layout;