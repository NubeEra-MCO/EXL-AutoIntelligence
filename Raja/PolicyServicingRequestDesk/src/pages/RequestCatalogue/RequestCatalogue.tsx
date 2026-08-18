// ============================================================
// REQUEST CATALOGUE - Module 2
// ============================================================
import React, { useState, useMemo } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  Button,
  Input,
  mergeClasses,
} from '@fluentui/react-components';
import {
  Location24Regular,
  People24Regular,
  CalendarSettings24Regular,
  Phone24Regular,
  Mail24Regular,
  Heart24Regular,
  CreditCardPerson24Regular,
  ArrowCounterclockwise24Regular,
  Document24Regular,
  PersonEdit24Regular,
  ChevronRight20Regular,
  Clock20Regular,
  Checkmark20Regular,
  DocumentCheckmark20Regular,
  Search24Regular,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { requestService } from '../../services/request.service';
import { QUERY_KEYS, ROUTES } from '../../utils/constants';
import { designTokens } from '../../theme/tokens';
import type { RequestCatalogItem } from '../../types/request.types';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '1400px',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  searchRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  categoryTab: {
    padding: '6px 16px',
    borderRadius: designTokens.borderRadius.pill,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: tokens.colorNeutralForeground2,
    backgroundColor: tokens.colorNeutralBackground1,
    ':hover': {
      border: `1px solid ${tokens.colorBrandBackground}`,
      color: tokens.colorBrandForeground1,
    },
  },
  categoryTabActive: {
    backgroundColor: tokens.colorBrandBackground,
    border: `1px solid ${tokens.colorBrandBackground}`,
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
      color: tokens.colorNeutralForegroundOnBrand,
    },
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  catalogCard: {
    padding: '20px',
    borderRadius: designTokens.borderRadius.lg,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      boxShadow: designTokens.shadows.cardHover,
      border: `1px solid ${tokens.colorBrandBackground}`,
    },
  },
  catalogCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  catalogIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: tokens.colorBrandBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  catalogTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  catalogCategory: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  catalogDesc: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.5',
  },
  catalogMeta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  catalogFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    marginTop: 'auto',
  },
  requiresApproval: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  docsCount: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  startButton: {
    flexShrink: 0,
  },
  tags: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  tag: {
    padding: '2px 8px',
    borderRadius: designTokens.borderRadius.pill,
    backgroundColor: tokens.colorNeutralBackground3,
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px',
    gap: '12px',
    gridColumn: '1 / -1',
  },
});

const ICON_MAP: Record<string, React.ReactElement> = {
  Location: <Location24Regular />,
  People: <People24Regular />,
  CalendarSettings: <CalendarSettings24Regular />,
  Phone: <Phone24Regular />,
  Mail: <Mail24Regular />,
  Heart: <Heart24Regular />,
  CreditCardMagnifier: <CreditCardPerson24Regular />,
  ArrowCounterclockwise: <ArrowCounterclockwise24Regular />,
  Document: <Document24Regular />,
  PersonEdit: <PersonEdit24Regular />,
};

const CATEGORIES = ['All', 'Profile Update', 'Policy Modification', 'Premium Management', 'Financial', 'Policy Management'];

export const RequestCatalogue: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: catalogue, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REQUEST_CATALOGUE],
    queryFn: () => requestService.getRequestCatalogue(),
    staleTime: 10 * 60 * 1000,
  });

  const filteredCatalogue = useMemo(() => {
    if (!catalogue) return [];
    return catalogue.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.requestName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchText.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory && item.isActive;
    });
  }, [catalogue, searchText, activeCategory]);

  const handleInitiateRequest = (item: RequestCatalogItem) => {
    navigate(`${ROUTES.REQUEST_CREATE}?type=${item.requestCode}`);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1 }}>
            Request Catalogue
          </Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginTop: 4 }}>
            Select a service to initiate a policy servicing request
          </Text>
        </div>
      </div>

      {/* Search & Filter */}
      <div className={styles.searchRow}>
        <Input
          placeholder="Search services..."
          value={searchText}
          onChange={(_, d) => setSearchText(d.value)}
          contentBefore={<Search24Regular style={{ width: 16, height: 16 }} />}
          style={{ minWidth: 280 }}
          aria-label="Search request catalogue"
        />
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          {filteredCatalogue.length} services available
        </Text>
      </div>

      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        {CATEGORIES.map((cat) => (
          <div
            key={cat}
            className={mergeClasses(
              styles.categoryTab,
              activeCategory === cat && styles.categoryTabActive
            )}
            onClick={() => setActiveCategory(cat)}
            role="tab"
            tabIndex={0}
            aria-selected={activeCategory === cat}
            onKeyDown={(e) => e.key === 'Enter' && setActiveCategory(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Catalogue Grid */}
      <div className={styles.catalogGrid}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className={styles.catalogCard} style={{ opacity: 0.6 }}>
              <div style={{ height: 120, backgroundColor: tokens.colorNeutralBackground3, borderRadius: 8 }} />
            </Card>
          ))
        ) : filteredCatalogue.length === 0 ? (
          <div className={styles.emptyState}>
            <Search24Regular style={{ width: 48, height: 48, color: tokens.colorNeutralForeground3 }} />
            <Text size={400} weight="semibold">No services found</Text>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
              Try adjusting your search or filter
            </Text>
          </div>
        ) : (
          filteredCatalogue.map((item) => (
            <div
              key={item.id}
              className={styles.catalogCard}
              onClick={() => handleInitiateRequest(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleInitiateRequest(item)}
              aria-label={`Initiate ${item.requestName} request`}
            >
              {/* Card Header */}
              <div className={styles.catalogCardHeader}>
                <div className={styles.catalogIcon}>
                  {ICON_MAP[item.icon] || <Document24Regular />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <Text className={styles.catalogCategory}>{item.category}</Text>
                  <Text className={styles.catalogTitle}>{item.requestName}</Text>
                </div>
              </div>

              {/* Description */}
              <Text className={styles.catalogDesc}>{item.description}</Text>

              {/* Meta Info */}
              <div className={styles.catalogMeta}>
                <span className={styles.metaItem}>
                  <Clock20Regular style={{ width: 13, height: 13 }} />
                  SLA: {item.slaDays}d
                </span>
                <span className={styles.metaItem}>
                  <DocumentCheckmark20Regular style={{ width: 13, height: 13 }} />
                  {item.requiredDocuments.length} docs required
                </span>
                <span className={styles.metaItem}>
                  {item.requiresApproval ? (
                    <>
                      <Checkmark20Regular style={{ width: 13, height: 13, color: tokens.colorPaletteYellowForeground1 }} />
                      {item.approvalLevels}-level approval
                    </>
                  ) : (
                    <>
                      <Checkmark20Regular style={{ width: 13, height: 13, color: tokens.colorPaletteGreenForeground1 }} />
                      Auto-processed
                    </>
                  )}
                </span>
              </div>

              {/* Tags */}
              <div className={styles.tags}>
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>

              {/* Footer */}
              <div className={styles.catalogFooter}>
                <Text className={styles.metaItem} style={{ color: tokens.colorNeutralForeground3 }}>
                  ~{item.estimatedTime}
                </Text>
                <Button
                  className={styles.startButton}
                  appearance="primary"
                  size="small"
                  icon={<ChevronRight20Regular />}
                  iconPosition="after"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInitiateRequest(item);
                  }}
                >
                  Start Request
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
