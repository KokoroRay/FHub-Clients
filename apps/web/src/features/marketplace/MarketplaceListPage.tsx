import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Plus,
  Tag,
  MapPin,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { mockMarketplaceListings } from '../../services/mockData';
import { MarketplaceListing } from '../../types';
import { Card, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CreateListingModal } from './CreateListingModal';

export const MarketplaceListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const shouldOpenCreate = searchParams.get('action') === 'create';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(shouldOpenCreate);
  const [listings, setListings] = useState<MarketplaceListing[]>(mockMarketplaceListings);

  const categories = ['ALL', 'Electronics', 'Books', 'Study Materials', 'Accessories'];

  const filteredListings = listings.filter((item) => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header (Figma 46:2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>FHub Student Marketplace</span>
            <Badge variant="purple" size="md">{filteredListings.length} Đang bán</Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Trao đổi, pass lại giáo trình, đồ án, thiết bị công nghệ uy tín giữa sinh viên các Campus.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Đăng tin mới
        </Button>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#005da7] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bàn phím, sách, tai nghe..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#005da7]"
          />
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {filteredListings.map((item) => (
          <Card key={item.id} hoverable className="overflow-hidden flex flex-col justify-between">
            <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
              <img
                src={item.images[0] || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80'}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <Badge variant="success" size="sm">
                  {item.condition}
                </Badge>
                <Badge variant="neutral" size="sm" className="bg-black/50 text-white backdrop-blur-xs">
                  {item.campus}
                </Badge>
              </div>
            </div>

            <CardBody className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-base font-black text-rose-600 dark:text-rose-400">
                  {item.price.toLocaleString()} {item.currency}
                </div>
                <Link
                  to={`/marketplace/${item.id}`}
                  className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-[#005da7] transition-colors line-clamp-2 mt-1 block leading-snug"
                >
                  {item.title}
                </Link>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <img src={item.seller.avatarUrl} alt={item.seller.fullName} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[100px]">{item.seller.fullName}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {item.viewsCount}
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <CreateListingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newItem) => {
          setListings([newItem, ...listings]);
          setIsCreateOpen(false);
        }}
      />
    </div>
  );
};
