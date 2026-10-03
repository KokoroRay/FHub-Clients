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
      <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Quay lại sàn Marketplace
      </Link>

      {/* Detail Container */}
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
                  <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-blue-600" /> {item.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Đăng 2 ngày trước</span>
                  <span>• {item.viewsCount} lượt xem</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Mô tả chi tiết sản phẩm
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
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
                <img src={item.seller.avatarUrl} alt={item.seller.fullName} className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200" />
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
                  {status === 'AVAILABLE' ? 'Đánh dấu đã bán' : 'Kích hoạt lại tin'}
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <CardBody className="p-4 space-y-2 text-xs">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Mẹo giao dịch an toàn
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                Nên hẹn gặp trực tiếp tại khuôn viên trường (Campus Library, Canteen) để kiểm tra tình trạng hàng trước khi thanh toán.
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
        footer={<Button variant="outline" onClick={() => setShowContactModal(false)}>Đóng</Button>}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số điện thoại / Zalo:</span>
              <span className="font-bold text-sm text-blue-600">{item.seller.contactPhone || '0987.654.321'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email trường:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{item.seller.contactEmail || 'longlh@fpt.edu.vn'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Khuôn viên gặp mặt:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Campus {item.campus}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
