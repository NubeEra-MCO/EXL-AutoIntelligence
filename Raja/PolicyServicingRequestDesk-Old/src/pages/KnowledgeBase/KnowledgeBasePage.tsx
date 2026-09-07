import React, { useState } from 'react';
import { Text, tokens, Input, Badge, makeStyles } from '@fluentui/react-components';
import { Search24Regular } from '@fluentui/react-icons';
import { designTokens } from '../../theme/tokens';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  article: { padding: '20px', border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: designTokens.borderRadius.lg, cursor: 'pointer', ':hover': { boxShadow: designTokens.shadows.cardHover, border: `1px solid ${tokens.colorBrandBackground}` } },
});

const MOCK_ARTICLES = [
  { id: '1', title: 'How to Change Your Address', category: 'Address Change', tags: ['address', 'documents'], viewCount: 1247, summary: 'Step-by-step guide for updating your address on policy.' },
  { id: '2', title: 'Nominee Change Process & Requirements', category: 'Nominee', tags: ['nominee', 'documents'], viewCount: 892, summary: 'Complete guide for changing nominee details including documents required.' },
  { id: '3', title: 'Premium Mode Change Guidelines', category: 'Premium', tags: ['premium', 'mode'], viewCount: 654, summary: 'How to change your premium payment frequency and when it takes effect.' },
  { id: '4', title: 'Policy Reinstatement Eligibility', category: 'Reinstatement', tags: ['lapsed', 'reinstate'], viewCount: 432, summary: 'Conditions, process and documents needed for reinstating a lapsed policy.' },
  { id: '5', title: 'Bank Account Update Guide', category: 'Financial', tags: ['bank', 'account'], viewCount: 321, summary: 'How to update your bank account for premium auto-debit and claims.' },
  { id: '6', title: 'KYC Verification Process', category: 'KYC', tags: ['kyc', 'documents'], viewCount: 567, summary: 'Understanding KYC requirements and how to complete verification.' },
];

export const KnowledgeBasePage: React.FC = () => {
  const styles = useStyles();
  const [search, setSearch] = useState('');
  const filtered = MOCK_ARTICLES.filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase()) ||
    a.tags.some((t) => t.includes(search.toLowerCase()))
  );
  return (
    <div className={styles.page}>
      <div>
        <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1 }}>Knowledge Base</Text>
        <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>Servicing guides, FAQs and process documentation</Text>
      </div>
      <Input placeholder="Search articles..." value={search} onChange={(_, d) => setSearch(d.value)} contentBefore={<Search24Regular style={{ width: 16, height: 16 }} />} style={{ maxWidth: 400 }} aria-label="Search knowledge base" />
      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{filtered.length} articles</Text>
      <div className={styles.grid}>
        {filtered.map((a) => (
          <div key={a.id} className={styles.article}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Badge appearance="tint" color="informative" size="small">{a.category}</Badge>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>👁 {a.viewCount.toLocaleString()}</Text>
            </div>
            <Text size={400} weight="semibold" style={{ display: 'block', marginBottom: 8 }}>{a.title}</Text>
            <Text size={300} style={{ color: tokens.colorNeutralForeground2, display: 'block', marginBottom: 12 }}>{a.summary}</Text>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {a.tags.map((t) => (
                <span key={t} style={{ padding: '2px 8px', borderRadius: 100, backgroundColor: tokens.colorNeutralBackground3, fontSize: 11, color: tokens.colorNeutralForeground3 }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
