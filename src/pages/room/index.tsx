import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import React, { useState } from 'react';
import BranchTab from './components/BranchTab';
import HolidayTab from './components/HolidayTab';
import RoomTab from './components/RoomTab';

// Màn Phòng học: 3 tab Cơ sở / Phòng / Ngày nghỉ.
const RoomPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState('rooms');

  return (
    <PageContainer>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        destroyOnHidden
        items={[
          { key: 'branches', label: 'Cơ sở', children: <BranchTab /> },
          { key: 'rooms', label: 'Phòng', children: <RoomTab /> },
          { key: 'holidays', label: 'Ngày nghỉ', children: <HolidayTab /> },
        ]}
      />
    </PageContainer>
  );
};

export default RoomPage;
