import React, { useMemo, useState } from 'react';
import { Mail, Plus } from 'lucide-react';
import { useHarvestIQ } from '../context/HarvestIQContext';
import {
  CompatibilityStatus,
  ConnectionMethod,
  PartnerCategory,
  PartnerProduct,
} from '../types/domain';
import {
  DemoNotice,
  EmptyState,
  Modal,
  PageHeader,
  SafeImage,
  StatusLabel,
} from '../components/common/UIPrimitives';

export const PartnersPage: React.FC = () => {
  const {
    partners,
    partnerProducts,
    enquiries,
    submitPartnerEnquiry,
    addPartnerProduct,
  } = useHarvestIQ();

  const [categoryTab, setCategoryTab] = useState<'ALL' | PartnerCategory>('ALL');
  const [partnerFilter, setPartnerFilter] = useState<string>('ALL');
  const [compatFilter, setCompatFilter] = useState<string>('ALL');

  const [enquiryProduct, setEnquiryProduct] = useState<PartnerProduct | null>(null);
  const [enquiryForm, setEnquiryForm] = useState({
    senderName: 'Subham Mohanty',
    senderEmail: '',
    farmName: 'Mahanadi HydroGreens Facility',
    message: '',
  });
  const [enquirySent, setEnquirySent] = useState(false);

  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    partnerId: partners[0]?.id ?? 'PRT-001',
    name: '',
    category: 'Sensor & IoT' as PartnerCategory,
    subCategory: 'pH & EC Sensors',
    description: '',
    measurementUnit: 'pH',
    connectivityMethod: 'REST API' as ConnectionMethod,
  });

  const filteredProducts = useMemo(() => {
    return partnerProducts.filter((p) => {
      if (categoryTab !== 'ALL' && p.category !== categoryTab) return false;
      if (partnerFilter !== 'ALL' && p.partnerId !== partnerFilter) return false;
      if (compatFilter !== 'ALL' && p.compatibilityStatus !== compatFilter) return false;
      return true;
    });
  }, [partnerProducts, categoryTab, partnerFilter, compatFilter]);

  const compatSemantic = (status: CompatibilityStatus) => {
    if (status === 'Compatible and verified') return 'healthy';
    if (status === 'Integration available') return 'info';
    if (status === 'Integration under review') return 'warning';
    return 'critical';
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryProduct || !enquiryForm.senderEmail.includes('@')) return;
    submitPartnerEnquiry({
      productId: enquiryProduct.id,
      productName: enquiryProduct.name,
      partnerName: enquiryProduct.partnerName,
      senderName: enquiryForm.senderName.trim(),
      senderEmail: enquiryForm.senderEmail.trim(),
      farmName: enquiryForm.farmName.trim(),
      message: enquiryForm.message.trim(),
    });
    setEnquirySent(true);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const partner = partners.find((p) => p.id === newProduct.partnerId);
    if (!partner || !newProduct.name.trim()) return;
    addPartnerProduct({
      partnerId: partner.id,
      partnerName: partner.name,
      name: newProduct.name.trim(),
      category: newProduct.category,
      subCategory: newProduct.subCategory.trim(),
      imageUrl:
        newProduct.category === 'Infrastructure'
          ? '/src/assets/images/product_nft_rack_1795755918115.jpg'
          : '/src/assets/images/product_sensor_node_1795755918158.jpg',
      description: newProduct.description.trim(),
      specs: {
        Protocol: newProduct.connectivityMethod,
        Listing: 'Submitted in Stage 1 Demo',
      },
      measurementUnit:
        newProduct.category === 'Sensor & IoT' ? newProduct.measurementUnit : undefined,
      connectivityMethods: [newProduct.connectivityMethod],
      compatibilityStatus: 'Integration under review',
      compatibilityNote:
        'Listed products require separate technical verification before receiving Compatible status.',
    });
    setListingModalOpen(false);
    setNewProduct((p) => ({ ...p, name: '', description: '' }));
  };

  return (
    <div>
      <PageHeader
        title="Partner & Product Ecosystem"
        subtitle="Discover vertical farming infrastructure and third-party IoT sensors. Listing a product is separate from technical compatibility verification."
        actions={
          <button
            type="button"
            onClick={() => setListingModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2E24] whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Submit Demo Product Listing</span>
          </button>
        }
      />

      <DemoNotice
        title="Demonstration Partner Profiles & Listings"
        description="All manufacturer names and products below are clearly labelled Stage 1 demonstration listings. No real commercial partnerships or hardware certifications are claimed."
        className="mb-6"
      />

      {/* Category & Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE3DB] bg-white p-3.5">
        <div className="flex items-center gap-1 rounded-lg bg-[#F0F4EF] p-1">
          {(['ALL', 'Infrastructure', 'Sensor & IoT'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setCategoryTab(tab)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                categoryTab === tab
                  ? 'bg-white text-[#153F32] shadow-sm'
                  : 'text-[#606C65] hover:text-[#202923]'
              }`}
            >
              {tab === 'ALL' ? 'All Categories' : tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter by manufacturer"
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#202923]"
          >
            <option value="ALL">All Manufacturers (Demo)</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by compatibility status"
            value={compatFilter}
            onChange={(e) => setCompatFilter(e.target.value)}
            className="rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-1.5 text-xs font-medium text-[#202923]"
          >
            <option value="ALL">All Compatibility States</option>
            <option value="Compatible and verified">Compatible and verified</option>
            <option value="Integration available">Integration available</option>
            <option value="Integration under review">Integration under review</option>
            <option value="Not currently supported">Not currently supported</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No demonstration products match your filters"
          description="Clear category or compatibility filters to view all infrastructure and sensor products."
          actionLabel="Reset Filters"
          onAction={() => {
            setCategoryTab('ALL');
            setPartnerFilter('ALL');
            setCompatFilter('ALL');
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-xl border border-[#DCE3DB] bg-white"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#F0F4EF]">
                <SafeImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  fallbackTitle={product.name}
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-xs text-[#606C65]">
                    {product.partnerName} · {product.subCategory}
                  </p>
                  <h2 className="mt-1 font-display text-base font-semibold text-[#202923]">
                    {product.name}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#525E57]">
                    {product.description}
                  </p>

                  <dl className="mt-4 space-y-1.5 border-t border-[#EAEFEA] pt-3 text-xs">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2">
                        <dt className="text-[#78847D]">{k}</dt>
                        <dd className="text-right font-mono text-[11px] text-[#202923]">{v}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#78847D]">Connectivity</dt>
                      <dd className="text-right font-mono text-[11px] text-[#153F32]">
                        {product.connectivityMethods.join(', ')}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4 border-t border-[#EAEFEA] pt-3">
                  <StatusLabel
                    state={compatSemantic(product.compatibilityStatus)}
                    label={product.compatibilityStatus}
                  />
                  <p className="mt-1 text-[11px] text-[#606C65]">{product.compatibilityNote}</p>

                  <button
                    type="button"
                    onClick={() => {
                      setEnquirySent(false);
                      setEnquiryProduct(product);
                    }}
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#D4DDD3] bg-[#F7F9F5] px-3 py-2 text-xs font-medium text-[#153F32] hover:bg-[#E8F0E8]"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Send Partner Enquiry (Demo)</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {enquiries.length > 0 && (
        <div className="mt-8 rounded-xl border border-[#DCE3DB] bg-white p-5">
          <h2 className="font-display text-base font-semibold text-[#202923]">
            Submitted Demo Enquiries ({enquiries.length})
          </h2>
          <div className="mt-3 divide-y divide-[#EEF2ED] text-xs">
            {enquiries.map((enq) => (
              <div key={enq.id} className="py-2.5 flex flex-wrap justify-between gap-2">
                <div>
                  <span className="font-semibold text-[#153F32]">{enq.productName}</span> ·{' '}
                  <span className="text-[#606C65]">{enq.partnerName}</span>
                  <p className="mt-0.5 text-[#525E57]">{enq.message}</p>
                </div>
                <span className="text-[#78847D]">{enq.farmName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partner Enquiry Modal */}
      <Modal
        open={Boolean(enquiryProduct)}
        onClose={() => setEnquiryProduct(null)}
        title={`Enquiry · ${enquiryProduct?.name ?? ''}`}
        subtitle={enquiryProduct?.partnerName}
      >
        {enquirySent ? (
          <div>
            <p className="text-sm font-semibold text-[#153F32]">
              Demonstration enquiry saved locally.
            </p>
            <p className="mt-2 text-xs text-[#525E57]">
              In Stage 2, enquiries route directly to the verified partner contact inbox.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setEnquiryProduct(null)}
                className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEnquirySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Your Name</label>
              <input
                required
                type="text"
                value={enquiryForm.senderName}
                onChange={(e) => setEnquiryForm((f) => ({ ...f, senderName: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Your Email</label>
              <input
                required
                type="email"
                value={enquiryForm.senderEmail}
                onChange={(e) => setEnquiryForm((f) => ({ ...f, senderEmail: e.target.value }))}
                placeholder="operator@farm-example.org"
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Message / Rack Specs</label>
              <textarea
                required
                rows={3}
                value={enquiryForm.message}
                onChange={(e) => setEnquiryForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Requesting datasheet or API documentation for Odisha pilot..."
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEnquiryProduct(null)}
                className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white"
              >
                Send Demo Enquiry
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Partner Product Submission Modal */}
      <Modal
        open={listingModalOpen}
        onClose={() => setListingModalOpen(false)}
        title="Submit Demonstration Product Listing"
        subtitle="New listings enter 'Integration under review' until technically verified."
      >
        <form onSubmit={handleCreateListing} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#202923]">Manufacturer Profile</label>
            <select
              value={newProduct.partnerId}
              onChange={(e) => setNewProduct((p) => ({ ...p, partnerId: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#202923]">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct((p) => ({ ...p, category: e.target.value as PartnerCategory }))
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              >
                <option value="Sensor & IoT">Sensor &amp; IoT</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#202923]">Connectivity</label>
              <select
                value={newProduct.connectivityMethod}
                onChange={(e) =>
                  setNewProduct((p) => ({
                    ...p,
                    connectivityMethod: e.target.value as ConnectionMethod,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
              >
                <option value="REST API">REST API</option>
                <option value="MQTT">MQTT</option>
                <option value="HTTPS Webhook">HTTPS Webhook</option>
                <option value="LoRaWAN Gateway">LoRaWAN Gateway</option>
                <option value="Modbus TCP">Modbus TCP</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">Product Name</label>
            <input
              required
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. SF-WaterLevel Ultrasonic Node"
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#202923]">Description</label>
            <textarea
              required
              rows={2}
              value={newProduct.description}
              onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-[#D4DDD3] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setListingModalOpen(false)}
              className="rounded-lg border border-[#D4DDD3] px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#153F32] px-4 py-2 text-sm font-medium text-white"
            >
              Add Listing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
