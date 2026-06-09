/** Доменные типы MVP торговой площадки — по модели данных §5 tz.md */

export type ParticipantRole =
  | "consumer"
  | "producer_wholesale"
  | "producer_retail"
  | "energy_sales"
  | "demand_aggregator"
  | "service_provider"
  | "operator"
  | "admin";

export type CommodityCategory = "energy" | "capacity" | "service";

export type Direction = "sell" | "buy";

export type OfferStatus =
  | "draft"
  | "active"
  | "in_negotiation"
  | "agreed"
  | "withdrawn"
  | "expired"
  | "negotiations_terminated";

export type ResponseStatus =
  | "sent"
  | "counter_received"
  | "agreed"
  | "rejected"
  | "withdrawn"
  | "terminated";

export type PriceType = "fixed" | "indexed" | "zonal";

export type GenerationType =
  | "tes_gas"
  | "tes_coal"
  | "hes"
  | "aes"
  | "vie_wind"
  | "vie_solar"
  | "other";

export type DeliveryProfile = "base" | "peak" | "offpeak" | "custom";

export type ServiceCategory =
  | "demand_response"
  | "energy_saving"
  | "energy_audit"
  | "green_attributes"
  | "capacity_redistribution"
  | "other";

export type PilotRegion =
  | "moscow_region"
  | "nizhny_novgorod"
  | "samara"
  | "sverdlovsk"
  | "krasnoyarsk"
  | "novosibirsk"
  | "primorsky";

export type OrganizationStatus =
  | "pending"
  | "active"
  | "blocked"
  | "info_requested";

export type UserAccountStatus = "active" | "blocked" | "pending";

export type PriceCategory = "3" | "4" | "5" | "6";

export type NegotiationAction =
  | "response"
  | "accept"
  | "counter"
  | "reject"
  | "withdraw"
  | "terminate";

export type NotificationType =
  | "N01"
  | "N02"
  | "N03"
  | "N04"
  | "N05"
  | "N06"
  | "N07"
  | "N08"
  | "N09"
  | "N10"
  | "N11"
  | "N12";

export type NotificationChannel = "system" | "email" | "system_email";

export type ReferencePriceType = "rsv" | "capacity";

export type AgreementStatus = "agreed" | "contract_pending";

export type RegistrationApplicationStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "info_requested";

export interface Organization {
  id: string;
  name: string;
  inn: string;
  ogrn: string;
  type: ParticipantRole;
  region: PilotRegion;
  price_category?: PriceCategory;
  generation_type?: GenerationType;
  installed_capacity?: number;
  max_power?: number;
  orem_contract_number?: string;
  status: OrganizationStatus;
  created_at: string;
  verified_at?: string;
  /** Публичный рейтинг — количество завершённых согласий */
  completed_agreements_count?: number;
  contact_email?: string;
  contact_phone?: string;
  contact_full_name?: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  phone: string;
  role: ParticipantRole;
  status: UserAccountStatus;
  created_at: string;
}

export interface Offer {
  id: string;
  author_id: string;
  organization_id: string;
  commodity_category: CommodityCategory;
  direction: Direction;
  status: OfferStatus;
  generation_type?: GenerationType;
  generation_object?: string;
  region: PilotRegion[];
  price?: number;
  price_type?: PriceType;
  price_peak?: number;
  price_semipeak?: number;
  price_offpeak?: number;
  volume_min?: number;
  volume_max?: number;
  period_start?: string;
  period_end?: string;
  delivery_profile?: DeliveryProfile;
  capacity_volume?: number;
  capacity_price?: number;
  capacity_price_type?: PriceType;
  installed_capacity?: number;
  min_contract_months?: number;
  service_category?: ServiceCategory;
  service_description?: string;
  service_price_text?: string;
  service_price_numeric?: number;
  service_unit?: string;
  has_green_attrs: boolean;
  description?: string;
  valid_until: string;
  published_at?: string;
  created_at: string;
  response_count?: number;
  hidden_by_operator?: boolean;
}

export interface OfferResponse {
  id: string;
  offer_id: string;
  respondent_id: string;
  respondent_organization_id: string;
  status: ResponseStatus;
  created_at: string;
  last_action_at?: string;
  last_action_type?: NegotiationAction;
}

export interface NegotiationIteration {
  id: string;
  response_id: string;
  author_id: string;
  action: NegotiationAction;
  price?: number;
  price_peak?: number;
  price_semipeak?: number;
  price_offpeak?: number;
  volume_energy?: number;
  price_capacity?: number;
  volume_capacity?: number;
  period_start?: string;
  period_end?: string;
  service_price_text?: string;
  service_terms?: string;
  comment?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  response_id: string;
  author_id: string;
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface Agreement {
  id: string;
  response_id: string;
  seller_id: string;
  buyer_id: string;
  commodity_category: CommodityCategory;
  final_price?: number;
  final_price_type?: PriceType;
  final_price_peak?: number;
  final_price_semipeak?: number;
  final_price_offpeak?: number;
  final_volume_energy?: number;
  final_period_start?: string;
  final_period_end?: string;
  generation_type?: GenerationType;
  generation_object?: string;
  delivery_profile?: DeliveryProfile;
  final_capacity_price?: number;
  final_capacity_price_type?: PriceType;
  final_capacity_volume?: number;
  final_cap_period_start?: string;
  final_cap_period_end?: string;
  installed_capacity?: number;
  service_category?: ServiceCategory;
  final_service_price?: string;
  final_service_terms?: string;
  final_service_price_numeric?: number;
  has_green_attrs?: boolean;
  status: AgreementStatus;
  agreed_at: string;
  created_at: string;
  iteration_count?: number;
  negotiation_days?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  channel: NotificationChannel;
  sent_at: string;
  category_filter?: "negotiations" | "offers" | "system";
}

export interface MarketPrice {
  id: string;
  price_type: ReferencePriceType;
  region: PilotRegion;
  period: string;
  price: number;
  source: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface RegistrationApplication {
  id: string;
  application_number: string;
  role: ParticipantRole;
  organization_name: string;
  inn: string;
  ogrn: string;
  region: PilotRegion;
  contact_full_name: string;
  email: string;
  phone: string;
  price_category?: PriceCategory;
  orem_contract_number?: string;
  generation_type?: GenerationType;
  installed_capacity?: number;
  max_power?: number;
  status: RegistrationApplicationStatus;
  operator_comment?: string;
  created_at: string;
}

export interface OperatorContacts {
  organization_name: string;
  phone: string;
  email: string;
  address?: string;
}
