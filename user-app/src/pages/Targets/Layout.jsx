import React from 'react';
import Targets from '../../components/Targets';
import TargetModal from '../../components/modals/TargetModal';

const Layout = () => {
  const [showTargetModal, setShowTargetModal] = React.useState(false);
  
  return (
    <>
      <Targets
        onShowTargetModal={() => setShowTargetModal(true)}
        onShowBalanceModal={() => {}} // Akan di-handle oleh Layout
      />
      
      {showTargetModal && (
        <TargetModal
          setShowTargetModal={setShowTargetModal}
        />
      )}
    </>
  );
};

export default Layout;