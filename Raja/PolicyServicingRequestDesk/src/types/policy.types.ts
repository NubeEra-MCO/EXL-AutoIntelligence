// ============================================================
// POLICY TYPES
// ============================================================

export type PolicyStatus = 'Active' | 'Lapsed' | 'Surrendered' | 'Matured' | 'PaidUp' | 'Cancelled';
export type PremiumMode = 'Monthly' | 'Quarterly' | 'HalfYearly' | 'Yearly' | 'SinglePremium';
export type PolicyType = 'Life' | 'Health' | 'Motor' | 'Home' | 'Travel' | 'Endowment' | 'ULIP' | 'Term';
export type KYCStatus = 'Verified' | 'Pending' | 'Rejected' | 'Expired';

export interface PolicyHolder {
  id: string;
  customerId: string;
  salutation: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  pan: string;
  aadhaar?: string;
  email: string;
  mobile: string;
  alternatePhone?: string;
  kycStatus: KYCStatus;
  kycVerifiedOn?: string;
  address: Address;
  communicationPreference: CommunicationPreference;
  bankAccount?: BankAccount;
  createdOn: string;
  modifiedOn: string;
}

export interface Address {
  id?: string;
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: 'Permanent' | 'Correspondence' | 'Office';
  isVerified?: boolean;
}

export interface CommunicationPreference {
  email: boolean;
  sms: boolean;
  whatsApp: boolean;
  post: boolean;
  language: string;
}

export interface BankAccount {
  id?: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  accountType: 'Savings' | 'Current';
  isVerified: boolean;
  verifiedOn?: string;
  isPrimary: boolean;
}

export interface Nominee {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  sharePercentage: number;
  isPrimary: boolean;
  guardianName?: string;
  guardianRelationship?: string;
  isMinor: boolean;
  pan?: string;
  mobile?: string;
  email?: string;
  address?: Address;
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  sharePercentage: number;
  isPrimary: boolean;
  mobile?: string;
  email?: string;
}

export interface PremiumDetails {
  annualPremium: number;
  premiumMode: PremiumMode;
  modalPremium: number;
  nextPremiumDueDate: string;
  lastPremiumPaidDate?: string;
  totalPremiumPaid: number;
  premiumPayingTerm: number;
  premiumPayingTermUnit: 'Years' | 'Age';
  autoDebit: boolean;
  autoDebitBankAccount?: BankAccount;
}

export interface PolicyCoverage {
  sumAssured: number;
  deathBenefit: number;
  maturityBenefit?: number;
  criticalIllnessCover?: number;
  accidentalDeathBenefit?: number;
  permanentDisabilityBenefit?: number;
}

export interface Policy {
  id: string;
  policyNumber: string;
  productCode: string;
  productName: string;
  policyType: PolicyType;
  status: PolicyStatus;
  issueDate: string;
  commencementDate: string;
  maturityDate: string;
  policyTerm: number;
  policyTermUnit: 'Years' | 'Age';
  policyHolder: PolicyHolder;
  nominees: Nominee[];
  beneficiaries?: Beneficiary[];
  premiumDetails: PremiumDetails;
  coverage: PolicyCoverage;
  assignmentDetails?: AssignmentDetails;
  riders?: Rider[];
  endorsements?: Endorsement[];
  totalRequests: number;
  openRequests: number;
  createdOn: string;
  modifiedOn: string;
  branchCode: string;
  agentCode?: string;
  channelType: string;
}

export interface AssignmentDetails {
  isAssigned: boolean;
  assigneeName?: string;
  assigneeType?: 'Absolute' | 'Conditional';
  assignmentDate?: string;
  assignmentRemarks?: string;
}

export interface Rider {
  riderCode: string;
  riderName: string;
  sumAssured: number;
  premiumAmount: number;
  riderTerm: number;
  status: 'Active' | 'Lapsed' | 'Surrendered';
}

export interface Endorsement {
  endorsementNumber: string;
  endorsementType: string;
  effectiveDate: string;
  description: string;
  approvedBy: string;
  approvedOn: string;
}

export interface PolicySearchParams {
  policyNumber?: string;
  customerId?: string;
  mobile?: string;
  email?: string;
  pan?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: PolicyStatus[];
  policyType?: PolicyType[];
}

export interface PolicySearchResult {
  policies: Policy[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
