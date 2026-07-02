import { DownloadOutlined } from '@ant-design/icons';
import { Button, Dropdown, message } from 'antd';
import React, { useState } from 'react';
import { exportExamPdf } from '../service';

type Props = {
  examId: number;
  /** 'link' cho cột Thao tác trong bảng, 'button' cho footer drawer. */
  mode?: 'link' | 'button';
};

/** Nút "Xuất PDF" với 2 lựa chọn: Đề thi (không đáp án) / Đề + đáp án. */
const ExportPdfDropdown: React.FC<Props> = ({ examId, mode = 'link' }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async (variant: 'DE' | 'DAP_AN') => {
    setLoading(true);
    try {
      await exportExamPdf(examId, variant);
      message.success('Đã xuất file PDF');
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Xuất PDF thất bại');
    } finally {
      setLoading(false);
    }
  };

  const menu = {
    items: [
      { key: 'DE', label: 'Đề thi (không đáp án)' },
      { key: 'DAP_AN', label: 'Đề + đáp án' },
    ],
    onClick: ({ key }: { key: string }) => handleExport(key as 'DE' | 'DAP_AN'),
  };

  if (mode === 'button') {
    return (
      <Dropdown menu={menu} trigger={['click']}>
        <Button icon={<DownloadOutlined />} loading={loading}>
          Xuất PDF
        </Button>
      </Dropdown>
    );
  }

  return (
    <Dropdown menu={menu} trigger={['click']}>
      <a>{loading ? 'Đang xuất…' : 'Xuất PDF'}</a>
    </Dropdown>
  );
};

export default ExportPdfDropdown;
