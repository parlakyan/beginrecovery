# Analytics & Tracking Documentation

## Overview
The Recovery Directory platform implements comprehensive analytics to track user behavior, facility performance, and system metrics. This document details the analytics implementation and available metrics.

## Analytics Implementation

### Firebase Analytics
```typescript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics(app);

// Track events
logEvent(analytics, 'page_view', {
  page_title: 'Home',
  page_location: window.location.href
});
```

### Custom Events
```typescript
// Facility view
logEvent(analytics, 'facility_view', {
  facility_id: facility.id,
  is_verified: facility.isVerified,
  source: source
});

// Search events
logEvent(analytics, 'search', {
  search_term: query,
  filters: activeFilters,
  results_count: results.length
});
```

## Tracked Metrics

### User Metrics
1. Page Views
   - By page
   - By user type
   - By device
   - By source

2. User Behavior
   - Session duration
   - Navigation paths
   - Feature usage
   - Interaction rates

3. Conversion Metrics
   - Signup rate
   - Upgrade rate
   - Contact rate
   - Retention rate

### Facility Metrics
1. View Statistics
   - Total views
   - Unique visitors
   - View duration
   - Return visits

2. Engagement
   - Contact clicks
   - Photo views
   - Share actions
   - Save actions

3. Performance
   - Search appearances
   - Click-through rate
   - Contact rate
   - Conversion rate

## Dashboard Views

### Admin Dashboard
```typescript
interface AdminMetrics {
  totalFacilities: number;
  verifiedCount: number;
  activeUsers: number;
  dailyViews: number;
  conversionRate: number;
}
```

### Owner Dashboard
```typescript
interface OwnerMetrics {
  facilityViews: number;
  contactClicks: number;
  searchAppearances: number;
  averagePosition: number;
}
```

## Event Tracking

### User Events
1. Authentication
   - Sign up
   - Login
   - Password reset
   - Profile update

2. Navigation
   - Page views
   - Search actions
   - Filter usage
   - Sort selections

3. Interactions
   - Facility views
   - Contact actions
   - Save facility
   - Share facility

### Facility Events
1. Listing Actions
   - Create listing
   - Edit listing
   - Upload photos
   - Update status

2. Verification
   - Start upgrade
   - Complete payment
   - Cancel upgrade
   - Renewal

## Performance Tracking

### Page Performance
```typescript
interface PageMetrics {
  loadTime: number;
  firstPaint: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
}
```

### API Performance
```typescript
interface APIMetrics {
  endpoint: string;
  responseTime: number;
  successRate: number;
  errorRate: number;
}
```

## Reporting

### Standard Reports
1. Daily Overview
   - Key metrics
   - Trend analysis
   - User activity
   - System health

2. Weekly Summary
   - Performance trends
   - User growth
   - Facility stats
   - Revenue data

3. Monthly Analysis
   - Detailed metrics
   - Growth analysis
   - User behavior
   - Market trends

### Custom Reports
```typescript
interface ReportConfig {
  metrics: string[];
  dateRange: DateRange;
  filters: Filter[];
  groupBy: string[];
}
```

## Data Collection

### User Data
```typescript
interface UserAnalytics {
  userId: string;
  sessionId: string;
  deviceInfo: DeviceInfo;
  location: GeoLocation;
  behaviors: UserBehavior[];
}
```

### Facility Data
```typescript
interface FacilityAnalytics {
  facilityId: string;
  views: ViewData[];
  contacts: ContactData[];
  searches: SearchData[];
  performance: PerformanceData;
}
```

## Privacy & Compliance

### Data Handling
1. User consent
2. Data anonymization
3. Retention policies
4. Access controls

### GDPR Compliance
1. Data collection notice
2. User consent
3. Data access
4. Data deletion

## Best Practices

### Implementation
1. Consistent tracking
2. Error handling
3. Performance impact
4. Data validation

### Analysis
1. Regular review
2. Trend analysis
3. Action items
4. Performance optimization

### Reporting
1. Clear metrics
2. Actionable insights
3. Regular updates
4. Data visualization

## Troubleshooting

### Common Issues
1. Missing events
2. Data discrepancies
3. Tracking errors
4. Performance impact

### Solutions
1. Verify implementation
2. Check configurations
3. Validate data
4. Optimize code

## Future Improvements
1. Enhanced tracking
2. Better visualization
3. Predictive analytics
4. A/B testing
5. User flow analysis
6. Custom dashboards
7. Automated reports
8. Performance alerts
9. Integration options
10. Machine learning
