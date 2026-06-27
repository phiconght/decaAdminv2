import { Flex, Modal, message, QRCode, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { getQrToken } from '../service';

type Props = {
  sessionId: number | null;
  open: boolean;
  onClose: () => void;
};

const QrModal: React.FC<Props> = ({ sessionId, open, onClose }) => {
  const [token, setToken] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const fetchToken = async (id: number) => {
    setLoading(true);
    try {
      const res = await getQrToken(id);
      setToken(res.token);
      setRemaining(res.ttlSeconds);
    } catch {
      message.error('Không lấy được mã QR');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal → lấy token + đếm ngược; hết hạn → lấy lại.
  useEffect(() => {
    if (!open || sessionId == null) {
      clearTick();
      setToken(null);
      return;
    }
    fetchToken(sessionId);
    tickRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          fetchToken(sessionId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTick;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId]);

  return (
    <Modal
      title="Mã QR điểm danh"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={360}
    >
      <Flex vertical align="center" gap={12} style={{ padding: '12px 0' }}>
        <QRCode
          value={token ?? '-'}
          size={220}
          status={loading ? 'loading' : token ? 'active' : 'expired'}
        />
        <Typography.Text type="secondary">
          Học viên quét để điểm danh · Tự làm mới sau {remaining}s
        </Typography.Text>
      </Flex>
    </Modal>
  );
};

export default QrModal;
