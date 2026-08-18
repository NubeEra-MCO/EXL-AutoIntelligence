// ============================================================
// REQUEST CREATION - Module 4 (Dynamic Form + Wizard)
// ============================================================
import React, { useState } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Radio,
  RadioGroup,
  Checkbox,
  Field,
  Spinner,
  Badge,
  Divider,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  Circle24Regular,
  ArrowLeft20Regular,
  ArrowRight20Regular,
  DocumentAdd24Regular,
  CloudArrowUp20Regular,
  Dismiss20Regular,
  Document20Regular,
} from '@fluentui/react-icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestService } from '../../services/request.service';
import { policyService } from '../../services/policy.service';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QUERY_KEYS, ROUTES, INDIC_STATES, RELATIONSHIP_OPTIONS } from '../../utils/constants';
import { designTokens } from '../../theme/tokens';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { RequestTypeCode, FormField } from '../../types/request.types';
import { useAppStore } from '../../store/appStore';
import { useDropzone } from 'react-dropzone';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '880px',
    margin: '0 auto',
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    padding: '20px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: designTokens.borderRadius.lg,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    position: 'relative',
  },
  stepConnector: {
    position: 'absolute',
    top: '14px',
    left: 'calc(50% + 14px)',
    right: 'calc(-50% + 14px)',
    height: '2px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  stepConnectorActive: {
    backgroundColor: tokens.colorBrandBackground,
  },
  stepIcon: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepLabel: {
    fontSize: '11px',
    fontWeight: 500,
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
  stepLabelActive: {
    color: tokens.colorBrandForeground1,
    fontWeight: 600,
  },
  card: {
    padding: '24px',
    borderRadius: designTokens.borderRadius.lg,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  policyCard: {
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: tokens.colorBrandBackground2,
    border: `1px solid ${tokens.colorBrandBackground}`,
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '20px',
  },
  policyInfo: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
  },
  policyField: {
    display: 'flex',
    flexDirection: 'column',
  },
  policyFieldLabel: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: tokens.colorNeutralForeground3,
  },
  policyFieldValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  eligibilityResult: {
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  eligibilityPass: {
    backgroundColor: '#E6F4EA',
    border: '1px solid #34A853',
  },
  eligibilityFail: {
    backgroundColor: '#FEECEC',
    border: '1px solid #EF4444',
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGridFull: {
    gridColumn: '1 / -1',
  },
  dropzone: {
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    ':hover': {
      border: `2px dashed ${tokens.colorBrandBackground}`,
      backgroundColor: tokens.colorBrandBackground2,
    },
  },
  dropzoneActive: {
    border: `2px dashed ${tokens.colorBrandBackground}`,
    backgroundColor: tokens.colorBrandBackground2,
  },
  uploadedFile: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: tokens.colorNeutralBackground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    marginTop: '8px',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    marginTop: '8px',
  },
  successScreen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '40px',
    textAlign: 'center',
  },
  requestNumberDisplay: {
    padding: '12px 24px',
    backgroundColor: tokens.colorBrandBackground2,
    borderRadius: '8px',
    border: `1px solid ${tokens.colorBrandBackground}`,
    fontFamily: 'monospace',
    fontSize: '18px',
    fontWeight: 700,
    color: tokens.colorBrandForeground1,
    letterSpacing: '1px',
  },
});

const STEPS = ['Policy', 'Eligibility', 'Form', 'Documents', 'Review', 'Done'];

export const RequestCreation: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const requestTypeCode = (searchParams.get('type') || 'ADDR_CHG') as RequestTypeCode;

  const [currentStep, setCurrentStep] = useState(0);
  const [policyNumber, setPolicyNumber] = useState('');
  const [policySearched, setPolicySearched] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [createdRequestNumber, setCreatedRequestNumber] = useState('');

  const { data: catalogItem } = useQuery({
    queryKey: [QUERY_KEYS.REQUEST_CATALOGUE, requestTypeCode],
    queryFn: () => requestService.getCatalogItemByCode(requestTypeCode),
    staleTime: 10 * 60 * 1000,
  });

  const { data: policy, isLoading: policyLoading } = useQuery({
    queryKey: [QUERY_KEYS.POLICY_DETAIL, policyNumber],
    queryFn: () => policyService.getPolicyByNumber(policyNumber),
    enabled: policySearched && policyNumber.length >= 5,
    retry: false,
  });

  const { data: eligibility, isLoading: eligibilityLoading } = useQuery({
    queryKey: [QUERY_KEYS.ELIGIBILITY, policy?.id, requestTypeCode],
    queryFn: () => requestService.checkEligibility(policy!.id, requestTypeCode),
    enabled: !!policy && currentStep >= 1,
    staleTime: 5 * 60 * 1000,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      requestService.createRequest({
        policyNumber,
        requestTypeCode,
        requestData: formData,
        attachments: uploadedFiles,
      }),
    onSuccess: (result) => {
      setCreatedRequestNumber(result.requestNumber);
      setCurrentStep(5);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REQUESTS] });
      addToast({
        type: 'success',
        title: 'Request Submitted',
        message: `Request ${result.requestNumber} submitted successfully.`,
      });
    },
    onError: () => {
      addToast({ type: 'error', title: 'Submission Failed', message: 'Please try again.' });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024,
    onDrop: (files) => setUploadedFiles((prev) => [...prev, ...files]),
  });

  const handleNext = () => {
    if (currentStep === 0 && !policy) {
      setPolicySearched(true);
      return;
    }
    if (currentStep < 4) setCurrentStep((s) => s + 1);
    else submitMutation.mutate();
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.fieldName] as string | undefined;
    const onChange = (val: unknown) => setFormData((d) => ({ ...d, [field.fieldName]: val }));

    const colSpan = field.columnSpan === 2 ? styles.formGridFull : undefined;

    switch (field.fieldType) {
      case 'select':
        return (
          <div key={field.id} className={colSpan}>
            <Field label={field.fieldLabel} required={field.isRequired} hint={field.helpText}>
              <Select
                value={value || ''}
                onChange={(_, d) => onChange(d.value)}
                disabled={field.isReadOnly}
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
                {field.fieldName === 'newState' &&
                  INDIC_STATES.map((s) => <option key={s} value={s}>{s}</option>)
                }
                {field.fieldName === 'nomineeRelationship' &&
                  RELATIONSHIP_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)
                }
              </Select>
            </Field>
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className={colSpan}>
            <Field label={field.fieldLabel} required={field.isRequired}>
              <RadioGroup
                value={value || ''}
                onChange={(_, d) => onChange(d.value)}
                layout="horizontal"
              >
                {field.options?.map((opt) => (
                  <Radio key={opt.value} value={opt.value} label={opt.label} />
                ))}
              </RadioGroup>
            </Field>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className={colSpan}>
            <Checkbox
              label={field.fieldLabel}
              checked={Boolean(value)}
              onChange={(_, d) => onChange(d.checked)}
              required={field.isRequired}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className={colSpan}>
            <Field label={field.fieldLabel} required={field.isRequired} hint={field.helpText}>
              <Textarea
                value={value || ''}
                onChange={(_, d) => onChange(d.value)}
                placeholder={field.placeholder}
                rows={4}
              />
            </Field>
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className={colSpan}>
            <Field label={field.fieldLabel} required={field.isRequired} hint={field.helpText}>
              <Input
                type="date"
                value={value || ''}
                onChange={(_, d) => onChange(d.value)}
                readOnly={field.isReadOnly}
              />
            </Field>
          </div>
        );

      default:
        return (
          <div key={field.id} className={colSpan}>
            <Field label={field.fieldLabel} required={field.isRequired} hint={field.helpText}>
              <Input
                type={field.fieldType === 'email' ? 'email' : field.fieldType === 'number' ? 'number' : 'text'}
                value={value || ''}
                onChange={(_, d) => onChange(d.value)}
                placeholder={field.placeholder}
                readOnly={field.isReadOnly}
              />
            </Field>
          </div>
        );
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return !!policy;
      case 1: return eligibility?.isEligible === true;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  if (!catalogItem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spinner label="Loading request type..." />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div>
        <Button
          appearance="subtle"
          icon={<ArrowLeft20Regular />}
          onClick={() => navigate(ROUTES.REQUEST_CATALOGUE)}
          style={{ marginBottom: 8 }}
        >
          Back to Catalogue
        </Button>
        <Text size={600} weight="bold" style={{ display: 'block' }}>
          {catalogItem.requestName}
        </Text>
        <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
          {catalogItem.description}
        </Text>
      </div>

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((step, index) => (
          <div key={step} className={styles.step}>
            <div className={styles.stepIcon}>
              {index < currentStep ? (
                <CheckmarkCircle24Filled style={{ color: tokens.colorBrandBackground }} />
              ) : index === currentStep ? (
                <CheckmarkCircle24Filled style={{ color: tokens.colorBrandBackground }} />
              ) : (
                <Circle24Regular style={{ color: tokens.colorNeutralForeground3 }} />
              )}
            </div>
            <Text
              className={
                index <= currentStep ? `${styles.stepLabel} ${styles.stepLabelActive}` : styles.stepLabel
              }
            >
              {step}
            </Text>
            {index < STEPS.length - 1 && (
              <div
                className={
                  index < currentStep
                    ? `${styles.stepConnector} ${styles.stepConnectorActive}`
                    : styles.stepConnector
                }
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className={styles.card}>
        {/* STEP 0: Policy Selection */}
        {currentStep === 0 && (
          <div>
            <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 16 }}>
              Select Policy
            </Text>
            <Field label="Policy Number" required>
              <Input
                placeholder="Enter policy number"
                value={policyNumber}
                onChange={(_, d) => {
                  setPolicyNumber(d.value);
                  setPolicySearched(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && setPolicySearched(true)}
              />
            </Field>
            <Button
              appearance="primary"
              style={{ marginTop: 12 }}
              disabled={policyNumber.length < 5 || policyLoading}
              onClick={() => setPolicySearched(true)}
            >
              {policyLoading ? <Spinner size="tiny" /> : 'Find Policy'}
            </Button>

            {policySearched && policy && (
              <div className={styles.policyCard} style={{ marginTop: 20 }}>
                <div className={styles.policyInfo}>
                  <div className={styles.policyField}>
                    <Text className={styles.policyFieldLabel}>Policy Number</Text>
                    <Text className={styles.policyFieldValue} style={{ fontFamily: 'monospace' }}>
                      {policy.policyNumber}
                    </Text>
                  </div>
                  <div className={styles.policyField}>
                    <Text className={styles.policyFieldLabel}>Holder Name</Text>
                    <Text className={styles.policyFieldValue}>{policy.policyHolder.fullName}</Text>
                  </div>
                  <div className={styles.policyField}>
                    <Text className={styles.policyFieldLabel}>Product</Text>
                    <Text className={styles.policyFieldValue}>{policy.productName}</Text>
                  </div>
                  <div className={styles.policyField}>
                    <Text className={styles.policyFieldLabel}>Status</Text>
                    <StatusBadge status={policy.status} size="small" />
                  </div>
                  <div className={styles.policyField}>
                    <Text className={styles.policyFieldLabel}>Sum Assured</Text>
                    <Text className={styles.policyFieldValue}>
                      {formatCurrency(policy.coverage.sumAssured)}
                    </Text>
                  </div>
                  <div className={styles.policyField}>
                    <Text className={styles.policyFieldLabel}>Next Premium</Text>
                    <Text className={styles.policyFieldValue}>
                      {formatDate(policy.premiumDetails.nextPremiumDueDate)}
                    </Text>
                  </div>
                </div>
              </div>
            )}

            {policySearched && !policyLoading && !policy && (
              <div style={{ marginTop: 16, padding: 12, backgroundColor: '#FEECEC', borderRadius: 8, border: '1px solid #EF4444' }}>
                <Text size={300} style={{ color: '#B91C1C' }}>Policy not found. Please check the policy number.</Text>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Eligibility Check */}
        {currentStep === 1 && (
          <div>
            <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 16 }}>
              Eligibility Validation
            </Text>

            {eligibilityLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 24 }}>
                <Spinner size="medium" />
                <Text>Checking eligibility...</Text>
              </div>
            ) : eligibility ? (
              <div
                className={eligibility.isEligible ? styles.eligibilityPass : styles.eligibilityFail}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <Text size={400} weight="semibold" style={{
                  color: eligibility.isEligible ? '#137333' : '#B91C1C'
                }}>
                  {eligibility.isEligible ? '✅ Policy is eligible for this request' : '❌ Policy is not eligible'}
                </Text>

                <Divider />

                {eligibility.results.map((result) => (
                  <div key={result.ruleCode} className={styles.ruleItem}>
                    <span>{result.isPassed ? '✅' : '❌'}</span>
                    <Text size={300} style={{
                      color: result.isPassed ? '#137333' : '#B91C1C'
                    }}>
                      {result.ruleName}: {result.message}
                    </Text>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* STEP 2: Dynamic Form */}
        {currentStep === 2 && catalogItem.formSchema && (
          <div>
            {catalogItem.formSchema.sections.map((section) => (
              <div key={section.id}>
                <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 16 }}>
                  {section.title}
                </Text>
                {section.description && (
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginBottom: 16 }}>
                    {section.description}
                  </Text>
                )}
                <div className={styles.formGrid}>
                  {section.fields
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map(renderFormField)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: Documents */}
        {currentStep === 3 && (
          <div>
            <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 16 }}>
              Upload Documents
            </Text>

            {catalogItem.requiredDocuments.length === 0 ? (
              <Text style={{ color: tokens.colorNeutralForeground3 }}>
                No documents required for this request type.
              </Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {catalogItem.requiredDocuments.map((doc) => (
                  <div key={doc.id} style={{ padding: '12px 16px', borderRadius: 8, border: `1px solid ${tokens.colorNeutralStroke2}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <Text size={300} weight="semibold">{doc.documentName}</Text>
                        {doc.isMandatory && (
                          <Badge appearance="tint" color="warning" size="small" style={{ marginLeft: 8 }}>Required</Badge>
                        )}
                      </div>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Max {doc.maxSizeInMB}MB</Text>
                    </div>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginBottom: 8 }}>
                      {doc.description}
                    </Text>
                    {doc.instructions && (
                      <Text size={200} style={{ color: tokens.colorBrandForeground1, display: 'block', marginBottom: 12 }}>
                        ℹ️ {doc.instructions}
                      </Text>
                    )}
                  </div>
                ))}

                {/* Dropzone */}
                <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}>
                  <input {...getInputProps()} />
                  <CloudArrowUp20Regular style={{ width: 32, height: 32, color: tokens.colorBrandForeground1, marginBottom: 8 }} />
                  <Text size={300} weight="semibold">
                    {isDragActive ? 'Drop files here...' : 'Drag & drop files or click to browse'}
                  </Text>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                    PDF, JPG, PNG • Max 10MB per file
                  </Text>
                </div>

                {uploadedFiles.map((file, index) => (
                  <div key={index} className={styles.uploadedFile}>
                    <Document20Regular />
                    <Text size={300} style={{ flex: 1 }}>{file.name}</Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Dismiss20Regular />}
                      onClick={() => setUploadedFiles((f) => f.filter((_, i) => i !== index))}
                      aria-label="Remove file"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Review */}
        {currentStep === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Text size={400} weight="semibold">Review & Submit</Text>

            <div style={{ padding: 16, backgroundColor: tokens.colorNeutralBackground2, borderRadius: 8 }}>
              <Text size={300} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>
                Request Summary
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Request Type</Text>
                  <Text size={300} weight="semibold" style={{ display: 'block' }}>{catalogItem.requestName}</Text>
                </div>
                <div>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Policy Number</Text>
                  <Text size={300} weight="semibold" style={{ display: 'block', fontFamily: 'monospace', color: tokens.colorBrandForeground1 }}>
                    {policyNumber}
                  </Text>
                </div>
                <div>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>SLA</Text>
                  <Text size={300} weight="semibold" style={{ display: 'block' }}>{catalogItem.slaDays} business days</Text>
                </div>
                <div>
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Approval Required</Text>
                  <Text size={300} weight="semibold" style={{ display: 'block' }}>
                    {catalogItem.requiresApproval ? `Yes (${catalogItem.approvalLevels} level)` : 'No - Auto-processed'}
                  </Text>
                </div>
              </div>
            </div>

            {Object.keys(formData).length > 0 && (
              <div style={{ padding: 16, backgroundColor: tokens.colorNeutralBackground2, borderRadius: 8 }}>
                <Text size={300} weight="semibold" style={{ display: 'block', marginBottom: 12 }}>
                  Request Details
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      <Text size={300} style={{ display: 'block' }}>{String(value)}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div style={{ padding: 16, backgroundColor: tokens.colorNeutralBackground2, borderRadius: 8 }}>
                <Text size={300} weight="semibold" style={{ display: 'block', marginBottom: 8 }}>
                  Attached Documents ({uploadedFiles.length})
                </Text>
                {uploadedFiles.map((f, i) => (
                  <Text key={i} size={200} style={{ display: 'block', color: tokens.colorNeutralForeground2 }}>
                    📄 {f.name}
                  </Text>
                ))}
              </div>
            )}

            <div style={{ padding: 12, backgroundColor: '#FFF8E7', borderRadius: 8, border: '1px solid #F59E0B' }}>
              <Text size={200}>
                ⚠️ By submitting this request, I confirm that the information provided is accurate and I authorize the requested changes to my policy.
              </Text>
            </div>
          </div>
        )}

        {/* STEP 5: Success */}
        {currentStep === 5 && (
          <div className={styles.successScreen}>
            <CheckmarkCircle24Filled style={{ width: 64, height: 64, color: '#22C55E' }} />
            <Text size={600} weight="bold">Request Submitted Successfully!</Text>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
              Your request has been submitted and is being processed
            </Text>
            <div className={styles.requestNumberDisplay}>{createdRequestNumber}</div>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
              You will receive notifications on status updates. Expected SLA: {catalogItem.slaDays} business days.
            </Text>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Button
                appearance="primary"
                onClick={() => navigate(ROUTES.REQUEST_TRACKING)}
              >
                Track This Request
              </Button>
              <Button
                appearance="outline"
                onClick={() => navigate(ROUTES.REQUEST_CATALOGUE)}
              >
                Submit Another
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentStep < 5 && (
          <div className={styles.formActions}>
            <Button
              appearance="outline"
              icon={<ArrowLeft20Regular />}
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => s - 1)}
            >
              Back
            </Button>

            <Button
              appearance="primary"
              icon={currentStep === 4 ? <DocumentAdd24Regular /> : <ArrowRight20Regular />}
              iconPosition="after"
              disabled={!canProceed() || submitMutation.isPending}
              onClick={handleNext}
            >
              {submitMutation.isPending ? (
                <Spinner size="tiny" />
              ) : currentStep === 4 ? (
                'Submit Request'
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
