export type Product = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  sizes: number[] | null;
  colors: string[] | null;
  image_url: string | null;
  brand: string | null;
  gender: string | null;
  category: string | null;
  badge: string | null;
  is_featured: boolean | null;
  gallery_urls: string[] | null;
};

export type ProductMutationInput = {
  name: string;
  price: number;
  description: string | null;
  sizes: number[];
  colors: string[];
  image_url: string | null;
  brand: string | null;
  gender: string | null;
  category: string | null;
  badge: string | null;
  is_featured: boolean;
  gallery_urls: string[];
};

export type CatalogFilters = {
  q?: string;
  brand?: string;
  gender?: string;
  category?: string;
  size?: string;
  price?: string;
  sort?: string;
};

export type CatalogFilterOptions = {
  brands: string[];
  genders: string[];
  categories: string[];
  sizes: number[];
};

export type CartItem = {
  id: string;
  productId: number;
  name: string;
  price: number;
  size: number;
  color: string;
  image_url: string | null;
  quantity: number;
  brand?: string | null;
  badge?: string | null;
};

export type OrderItem = {
  id?: number;
  order_id?: number;
  product_name: string;
  product_image: string | null;
  size: number;
  color: string;
  price: number;
  quantity: number;
};

export const profileRoles = ['customer', 'admin', 'delivery_partner'] as const;
export type ProfileRole = (typeof profileRoles)[number];

export const approvalStatuses = ['pending', 'approved', 'rejected', 'suspended'] as const;
export type ApprovalStatus = (typeof approvalStatuses)[number];

export const orderStatuses = [
  'pending',
  'paid',
  'ready_to_dispatch',
  'assigned',
  'accepted',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'returned',
  'cancelled',
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const deliveryJobStatuses = [
  'ready_to_dispatch',
  'assigned',
  'accepted',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'returned',
  'cancelled',
] as const;
export type DeliveryJobStatus = (typeof deliveryJobStatuses)[number];

export const deliveryEventTypes = [
  'job_created',
  'job_claimed',
  'job_assigned',
  'job_accepted',
  'picked_up',
  'out_for_delivery',
  'otp_sent',
  'otp_verified',
  'delivery_completed',
  'delivery_failed',
  'job_returned',
  'job_cancelled',
  'location_ping',
  'payout_batched',
  'payout_paid',
] as const;
export type DeliveryEventType = (typeof deliveryEventTypes)[number];

export const payoutBatchStatuses = ['draft', 'queued', 'paid'] as const;
export type PayoutBatchStatus = (typeof payoutBatchStatuses)[number];

export const payoutStatuses = ['unpaid', 'batched', 'paid'] as const;
export type PayoutStatus = (typeof payoutStatuses)[number];

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: ProfileRole;
  approval_status: ApprovalStatus;
  is_admin: boolean;
  phone: string | null;
  vehicle_type: string | null;
  service_zones: string[] | null;
  created_at?: string;
  updated_at?: string;
};

export type DeliveryApplication = {
  id: number;
  user_id: string;
  full_name: string;
  phone: string;
  city: string;
  state: string;
  postal_code: string;
  vehicle_type: string;
  service_zones: string[];
  document_path: string | null;
  status: ApprovalStatus;
  admin_notes: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DeliveryZoneRate = {
  id: number;
  zone_name: string;
  postal_codes: string[];
  rate_amount: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type DeliveryJobEvent = {
  id: number;
  job_id: number;
  order_id: number;
  actor_user_id: string | null;
  event_type: DeliveryEventType;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type DeliveryLocationPing = {
  id: number;
  job_id: number;
  rider_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  created_at: string;
};

export type DeliveryJob = {
  id: number;
  order_id: number;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  zone_name: string | null;
  rate_amount: number;
  assignment_mode: string | null;
  status: DeliveryJobStatus;
  assigned_partner_id: string | null;
  assigned_partner?: UserProfile | null;
  otp_expires_at: string | null;
  otp_last_sent_at: string | null;
  payout_status: PayoutStatus;
  payout_amount: number;
  last_known_lat: number | null;
  last_known_lng: number | null;
  last_location_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
  accepted_at?: string | null;
  picked_up_at?: string | null;
  out_for_delivery_at?: string | null;
  delivered_at?: string | null;
  failed_at?: string | null;
  cancelled_at?: string | null;
  events?: DeliveryJobEvent[];
  location_pings?: DeliveryLocationPing[];
  order_items?: OrderItem[];
};

export type DeliveryPayoutBatch = {
  id: number;
  batch_label: string;
  status: PayoutBatchStatus;
  period_start: string | null;
  period_end: string | null;
  total_amount: number;
  partner_count: number;
  payout_count: number;
  notes: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DeliveryPayoutItem = {
  id: number;
  payout_batch_id: number;
  job_id: number;
  partner_id: string;
  amount: number;
  status: PayoutStatus;
  paid_at: string | null;
  created_at: string;
};

export type DeliveryEarningSummary = {
  deliveredCount: number;
  totalEarned: number;
  unpaidAmount: number;
  batchedAmount: number;
  paidAmount: number;
};

export type OrderRecord = {
  id: number;
  user_id?: string | null;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  payment_id: string | null;
  razorpay_order_id: string | null;
  shipping_address: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  created_at: string;
  order_items?: OrderItem[];
  delivery_job?: DeliveryJob | null;
};

export type CheckoutFormValues = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

export type UpcomingDrop = {
  id: string;
  brand: string;
  model: string;
  releaseAt: string;
  colorway: string;
  tagline: string;
  href: string;
};

export type DeliveryApplicationStatusResponse = {
  application: DeliveryApplication | null;
  profile: UserProfile | null;
  canAccessDashboard: boolean;
};

export type DeliveryJobsResponse = {
  availableJobs: DeliveryJob[];
  myJobs: DeliveryJob[];
  activeJob: DeliveryJob | null;
  earnings: DeliveryEarningSummary;
  payoutBatches: DeliveryPayoutBatch[];
  profile: UserProfile;
  application: DeliveryApplication | null;
};

export type AdminDeliveryApplicationsResponse = {
  applications: (DeliveryApplication & { profile: UserProfile | null })[];
};

export type AdminDeliveryJobsResponse = {
  jobs: DeliveryJob[];
  partners: UserProfile[];
};

export type AdminDeliveryZoneRatesResponse = {
  zoneRates: DeliveryZoneRate[];
};

export type AdminDeliveryPayoutsResponse = {
  batches: DeliveryPayoutBatch[];
  pendingJobs: DeliveryJob[];
};

export type OrderTrackingResponse = {
  order: OrderRecord;
  deliveryJob: DeliveryJob | null;
  customerOtp: string | null;
};
