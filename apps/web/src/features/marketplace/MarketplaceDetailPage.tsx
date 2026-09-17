import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Share2,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Clock,
} from 'lucide-react';
import { mockMarketplaceListings } from '../../services/mockData';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const MarketplaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const item = mockMarketplaceListings.find((m) => m.id === id) || mockMarketplaceListings[0];

  const [showContactModal, setShowContactModal] = useState(false);
  const [status, setStatus] = useState(item.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/marketplace" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#005da7] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại sàn Marketplace
      </Link>

      {/* Detail Container (Figma 46:1584) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Product Images & Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="h-80 w-full bg-slate-100 overflow-hidden relative">
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="success" size="md">{item.condition}</Badge>
                <Badge variant="neutral" size="md" className="bg-black/60 text-white backdrop-blur-xs">
                  Campus {item.campus}
                </Badge>
              </div>
            </div>

            <CardBody className="p-6 space-y-4">
              <div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {item.price.toLocaleString()} {item.currency}
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {item.title}
                </h1>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {item.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Đăng 2 ngày trước</span>
                  <span>• {item.viewsCount} lượt xem</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Mô tả chi tiết sản phẩm
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: Seller & Safety Tips */}
        <div className="space-y-4">
          <Card>
            <CardBody className="p-5 space-y-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                Thông tin người bán
              </h3>

              <div className="flex items-center gap-3">
                <img src={item.seller.avatarUrl} alt={item.seller.fullName} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.seller.fullName}</h4>
                  <span className="text-xs text-slate-400 block font-mono">MSSV: {item.seller.studentId}</span>
                  <Badge variant="success" size="sm" className="mt-1" icon={<ShieldCheck className="w-3 h-3" />}>
                    Đã xác minh KYC
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowContactModal(true)}
                  leftIcon={<Phone className="w-4 h-4" />}
                >
                  Liên hệ người bán
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStatus(status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE')}
                >
                  {status === 'AVAILABLE' ? 'Đánh dấu Đã bán (Closed)' : 'Mở lại tin rao'}
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900">
            <CardBody className="p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <h5 className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#005da7]" /> Mẹo giao dịch an toàn
              </h5>
              <p className="text-[11px] leading-relaxed">
                Nên hẹn gặp trực tiếp tại sảnh hoặc thư viện Campus để kiểm tra hàng trước khi thanh toán. FHub không giữ tiền trung gian.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Thông tin liên hệ người bán"
        footer={<Button variant="primary" onClick={() => setShowContactModal(false)}>Đóng</Button>}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">Số điện thoại / Zalo:</span>
            </div>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.seller.contactPhone}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-600" />
              <span className="font-bold">Email trường FPT:</span>
            </div>
            <span className="font-mono text-slate-800 dark:text-slate-200">{item.seller.contactEmail}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
