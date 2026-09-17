import React, { useState } from 'react';
import { ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MarketplaceListing } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input, Textarea, Select } from '../../components/common/Input';

export interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (item: MarketplaceListing) => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { currentUser, currentCampus } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('200000');
  const [category, setCategory] = useState<'Study Materials' | 'Books' | 'Electronics' | 'Accessories' | 'Other'>('Electronics');
  const [condition, setCondition] = useState<'NEW' | 'LIKE NEW' | 'GOOD' | 'FAIR'>('LIKE NEW');
  const [phone, setPhone] = useState('0912345678');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const newItem: MarketplaceListing = {
      id: `m-${Date.now()}`,
      title,
      description,
      price: Number(price) || 0,
      currency: 'VND',
      category,
      condition,
      status: 'AVAILABLE',
      images: [imageUrl],
      campus: currentCampus,
      seller: {
        id: currentUser?.id || 'usr-1',
        fullName: currentUser?.fullName || 'Sinh viên FHub',
        avatarUrl: currentUser?.avatarUrl,
        studentId: currentUser?.studentId || 'HE163421',
        contactPhone: phone,
        contactEmail: currentUser?.email || 'student@fpt.edu.vn',
      },
      viewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    onCreated(newItem);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đăng tin rao bán / trao đổi đồ dùng"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit}>Đăng tin ngay</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Tên sản phẩm / Giáo trình"
          placeholder="Ví dụ: Bàn phím cơ Akko 3087 mới 98%"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Giá mong muốn (VND)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <Select
            label="Danh mục"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { value: 'Electronics', label: 'Thiết bị điện tử (Bàn phím, Chuột, Tai nghe)' },
              { value: 'Books', label: 'Sách & Giáo trình in' },
              { value: 'Study Materials', label: 'Tài liệu & Đồ án mẫu' },
              { value: 'Accessories', label: 'Phụ kiện & Đồ dùng cá nhân' },
              { value: 'Other', label: 'Khác' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Tình trạng"
            value={condition}
            onChange={(e) => setCondition(e.target.value as any)}
            options={[
              { value: 'NEW', label: 'Mới 100% nguyên seal' },
              { value: 'LIKE NEW', label: 'Như mới 99%' },
              { value: 'GOOD', label: 'Tốt (Dùng ít)' },
              { value: 'FAIR', label: 'Chấp nhận được' },
            ]}
          />

          <Input
            label="Số điện thoại / Zalo liên hệ"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <Input
          label="Link ảnh sản phẩm"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          leftIcon={<ImageIcon className="w-4 h-4" />}
        />

        <Textarea
          label="Mô tả chi tiết sản phẩm & địa điểm nhận hàng tại Campus"
          placeholder="Tình trạng sản phẩm, thời gian bảo hành, nhận hàng ở tòa nào..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
