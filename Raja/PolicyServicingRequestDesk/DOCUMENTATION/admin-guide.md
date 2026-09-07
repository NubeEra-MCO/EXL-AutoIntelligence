# Admin Guide - Policy Servicing Request Desk

Complete guide for administrators and managers of the Policy Servicing Request Desk solution.

---

## Table of Contents

1. [Environment Setup & Configuration](#environment-setup)
2. [User & Security Management](#user-security)
3. [Operations & Monitoring](#operations)
4. [Troubleshooting & Maintenance](#troubleshooting)
5. [Backup & Disaster Recovery](#backup)
6. [Performance Tuning](#performance)

---

## Environment Setup & Configuration {#environment-setup}

### Initial Setup Checklist

- [ ] Power Platform environment created (InsuranceDemo)
- [ ] Dataverse database provisioned
- [ ] Solution (PolicyServicingRequestDesk) imported
- [ ] All 4 tables created with correct schema
- [ ] Power Apps canvas app published
- [ ] Power Automate flows enabled
- [ ] Copilot Studio agent configured
- [ ] Email notifications configured
- [ ] Sample data loaded for testing

### Configuration Steps

#### 1. Environment Variables
Set these in Power Platform Admin Center:

```
NotificationEmail: insurance-team@company.com
AdminEmail: admin@company.com
ApproverEmail: manager@company.com
SLAContactDays: 7
```

#### 2. Email Settings
Configure mailbox for Power Automate flows:

1. Go to Power Platform Admin Center → Environments → InsuranceDemo
2. Settings → Email → Mailbox
3. Configure sender email
4. Set "From" address for notifications
5. Test send to verify setup

#### 3. Security Roles (Optional for MVP)

For production, create these roles:

**Insurance Agent Role**
- Permissions:
  - Create Request: Own records
  - View Request: Own + assigned records
  - Update Status: Own assigned records
  - Create Policy: No
  - View Policy: All records

**Insurance Manager Role**
- Permissions:
  - Create Request: All records
  - View Request: All records
  - Approve Request: All records
  - Update Status: All records
  - View Audit Log: All records
  - Generate Reports: Yes

**Customer Role** (for future)
- Permissions:
  - Create Request: Own policy only
  - View Request: Own requests only
  - Update Request: Draft status only
  - View Status: Own requests
  - View Policy: Own policies

#### 4. Canvas App Sharing

To give users access to the app:

1. Go to make.powerapps.com → Apps
2. Select PolicyRequestDesk
3. Click Share
4. Add users/groups
5. Assign permissions (Can use, Can edit)
6. Click Share

Recommended:
- Insurance Team: Can edit
- All employees: Can use
- External users (future): Can use

---

## User & Security Management {#user-security}

### Adding New Users

#### Via Power Apps

1. Go to Power Platform Admin Center
2. Select InsuranceDemo environment
3. Access → Users
4. Add new users
5. Assign security roles
6. Enable access to solution

#### Via Teams

If using Teams:
1. Add to Teams group
2. Pin PolicyRequestDesk app
3. User gets automatic access

### Assigning Security Roles

For MVP (no security):
- All users: Default access to all records

For Production:
1. Access → Users
2. Select user
3. Click Manage roles
4. Assign appropriate role
5. Save and confirm

### Removing User Access

1. Access → Users
2. Find user
3. Click Manage roles
4. Remove all roles
5. User loses access immediately

**Note:** They can still view completed requests they worked on (audit trail)

### Managing Office 365 Groups

Create groups for easier access management:

```
Group: Insurance-Agents
Members: All insurance staff who create requests
Roles: Insurance Agent role

Group: Insurance-Managers
Members: Supervisors and leads
Roles: Insurance Manager role
```

---

## Operations & Monitoring {#operations}

### Daily Operations

**Morning Checklist**
- [ ] Verify all flows are enabled (Power Automate)
- [ ] Check for flow errors in last 24 hours
- [ ] Verify email deliveries succeeded
- [ ] Review audit log for any issues
- [ ] Check request dashboard for SLA approaching

**Throughout the Day**
- [ ] Monitor pending approvals
- [ ] Respond to On Hold requests
- [ ] Update stuck requests
- [ ] Answer support tickets

**End of Day Checklist**
- [ ] Approve all eligible requests
- [ ] Follow up on overdue requests
- [ ] Archive completed requests (optional)
- [ ] Review any errors or issues

### Monitoring Dashboards

#### Power Automate - Flow Dashboard
View at: https://make.powerautomate.com

**Monitor:**
- Cloud flows → Cloud flows
- Click each flow to see:
  - Last 28 days of runs
  - Success/failure rates
  - Average run duration
  - Any failed runs (click for details)

**Alert on:**
- Any flow with >5% failure rate
- Flows not run in 24 hours (if should be automated)
- Any manual approvals pending >24 hours

#### Power Apps - App Analytics
View at: https://make.powerapps.com → Apps → Analytics

**Metrics:**
- Daily active users
- Number of app launches
- Performance (load time)
- Error frequency
- Feature usage

**Alert on:**
- Sudden drop in usage (app issue?)
- High error rates (>5%)
- Slow load times (>10 seconds)

#### Dataverse - Data
View at: Power Platform Admin Center → Environments → InsuranceDemo → Dataverse

**Monitor:**
- Database size
- Storage usage
- Data volume by table
- Any growing tables

### Request Dashboard (Manual)

Create a quick dashboard to monitor:

**Key Metrics**
- Total requests: This month vs last month
- Requests by status (pie chart)
- Average processing time by type
- Overdue requests (>SLA)
- Approval pending count
- Request completion rate

**How to Build (Excel/Power BI)**
- Data source: Export from Dataverse
- Filter: Last 30 days
- Pivot: By status, type, handler
- Charts: Status distribution, timeline

### Performance Monitoring

**CPU/Memory:**
- Environment: Monitor in Power Platform Admin Center
- Flows: Check flow run duration (can optimize if >1 min)
- App: Check load time (<5 sec is good)

**Storage:**
- Database: Monitor available storage
- Alert if >80% used
- Archive old records to another table

**Concurrency:**
- Monitor if many users using app simultaneously
- Increase sync intervals if slow

---

## Troubleshooting & Maintenance {#troubleshooting}

### Common Issues & Solutions

#### Issue: Flow Not Running

**Diagnosis:**
1. Check if flow is enabled (Power Automate → Cloud flows)
2. Check run history for errors
3. Verify trigger conditions are met

**Solution:**
- If disabled: Click enable
- If error: Click run to see detailed error message
  - Common: Connection missing (e.g., Office 365 Mail)
  - Fix: Re-authenticate connection
- If not running: Check trigger (may need manual run to test)

#### Issue: Emails Not Sending

**Diagnosis:**
1. Check Power Automate flow run history
2. Look for "Send Email" action failures
3. Verify mailbox is configured

**Solutions:**
```
Problem: "Connection not authorized"
Fix: Remove and re-add Office 365 Mail connection
     Go to Power Automate → Connections → Reconnect

Problem: "Recipient email invalid"
Fix: Check email format in request/policy record
     Verify customer email exists and is correct

Problem: "Cannot access shared mailbox"
Fix: Verify Office 365 mailbox permissions
     May need IT to grant access to flow account
```

#### Issue: Eligibility Check Always Fails

**Diagnosis:**
1. Check Eligibility Validation Flow in Power Automate
2. Review flow logic for the request type
3. Verify policy data is complete

**Solutions:**
```
1. Review policy status field:
   - Must be one of: Active, Inactive, Suspended, Lapsed
   - Check spelling and case

2. For Nominee Change, verify:
   - Policy status = "Active"
   - Outstanding Claims = false
   
3. For Premium Mode, verify:
   - Policy status = "Active"
   - Premium Mode = "Annual"
   - Payment Defaults (12mo) < 1

4. Fix data issues, then retry request
```

#### Issue: Request Stuck in "Pending Approval"

**Diagnosis:**
1. Check assigned handler (is person on leave?)
2. Review approval history
3. Check email was sent

**Solutions:**
- Reassign to another manager
- Manually approve/reject via request details
- Add notes if stuck for business reason

#### Issue: Duplicate Requests Created

**Diagnosis:**
1. Check if user clicked submit twice quickly
2. Verify request IDs (may be same request)
3. Check audit log for duplicate creation entries

**Solutions:**
- Check if requests have same data
- If truly duplicate: Cancel one request
- If different: Both are valid
- User education: "Wait for confirmation after clicking Submit"

#### Issue: Dataverse Connectivity Problem

**Diagnosis:**
1. Try refreshing app
2. Check browser console for errors
3. Verify internet connection

**Solutions:**
```
If persists:
1. Clear browser cache
2. Close and reopen app
3. Check if Dataverse environment is up
   (Power Platform Admin Center)
4. Try from different device/browser
5. Contact Microsoft support if environment down
```

### Maintenance Tasks

#### Weekly
- Review flow run history for errors
- Check pending approvals
- Monitor SLA compliance
- Review audit log for anomalies

#### Monthly
- Archive completed requests >30 days old
- Review security role assignments
- Update sample/test data
- Run performance analysis

#### Quarterly
- Review and update eligibility rules if needed
- Analyze request trends and metrics
- Plan any enhancements
- Conduct security audit
- Update documentation if changed

#### Annually
- Disaster recovery drill
- Solution backup and archival
- Security training for team
- Full audit review
- Plan next year improvements

### Log Files

**Location:** Power Automate → Run history

**What to Check:**
- Failed runs: Click to see error details
- Long-running flows: May need optimization
- Unexpected runs: May indicate trigger issue

**Export Logs:**
1. Power Automate → Cloud flows
2. Select flow
3. Click "Analytics" (if available)
4. Download report

### Performance Optimization

**If App is Slow:**
1. Check network connection
2. Reduce data refresh frequency
3. Increase pagination (show fewer records per page)
4. Clear browser cache

**If Flows are Slow:**
1. Review flow logic for unnecessary steps
2. Check for long loops (should <100 iterations)
3. Optimize queries to reduce data transfer
4. Monitor for API throttling

**If Database is Slow:**
1. Archive old records to separate table
2. Create indexes on frequently queried fields
3. Clean up test data
4. Review for large attachments

---

## Backup & Disaster Recovery {#backup}

### Backup Strategy

**Daily Backups**
```powershell
# Run daily via scheduled task
cd C:\Users\vmuser\Desktop\PolicyServicingRequestDesk\DEPLOYMENT
.\04-solution-export.ps1
# Backup location: DEPLOYMENT\PolicyServicingRequestDesk_[date].zip
```

**Weekly Full Environment Backup**
- Power Platform Admin Center → Environments → Backups
- Click "New" → Full backup
- Retention: 3 backups (automatic)

**Monthly Archive**
```
Copy weekly backup to:
\\backup-server\InsuranceSolutions\[YYYY-MM]\
Keep for 1 year for audit trail
```

### Restore from Backup

**If Solution Components Corrupted:**

```powershell
# 1. Delete corrupted solution
# 2. Import from backup file
pac solution import `
  --path ".\PolicyServicingRequestDesk_[backup-date].zip" `
  --environment "InsuranceDemo"
# 3. Verify all components imported
# 4. Test app and flows
```

**If Entire Environment Lost:**

```powershell
# Use Power Platform Auto-Backup (auto-restored after 7 days)
# Or manually:

# 1. Create new environment
pac admin create --name "InsuranceDemo-Restore"

# 2. Import solution
pac solution import `
  --path ".\PolicyServicingRequestDesk.zip" `
  --environment "InsuranceDemo-Restore"

# 3. Verify
# 4. If OK, delete old environment
pac admin delete --name "InsuranceDemo"

# 5. Rename new environment back
# (Done via Power Platform Admin Center)
```

### Data Recovery

**If Request Data Lost:**

1. Check if in Recycle Bin
   - Power Platform Admin Center → Environments → Advanced → Recycle Bin
   - Click Request table → Restore

2. If not in Recycle Bin, restore from backup

3. Notify affected customers

**Retain Audit Trail:**
- Audit Log table keeps all history
- Even deleted requests have audit entries
- Never delete Audit Log entries

---

## Performance Tuning {#performance}

### Canvas App Performance

**Optimize:**
1. Load screens on demand (not all at once)
2. Paginate request lists (show 20, not 1000)
3. Filter early (let server do filtering)
4. Minimize animations
5. Cache frequently-used data

**Monitor Load Time:**
- Should be <5 seconds for initial load
- Each screen <2 seconds

**Measure:**
- Open app developer tools (F12)
- Check Network tab
- Look at request timing

### Power Automate Flow Performance

**Optimize:**
1. Minimize data transformations
2. Reduce number of steps
3. Remove unnecessary conditions
4. Optimize queries (fetch only needed fields)
5. Use apply-to-each loops sparingly

**Monitor:**
- Expected flow run time: <1 minute
- If >2 minutes: Review and optimize
- Check for loops iterating >100 times

**Example Optimization:**
```
BEFORE: Flow takes 45 seconds
- Step 1: Get all policies (1000 records) - 10 sec
- Step 2: Filter in flow - 35 sec
TOTAL: 45 seconds

AFTER: Flow takes 5 seconds  
- Step 1: Get policies (filtered at source, 50 records) - 5 sec
TOTAL: 5 seconds

Change: Use filter query in step 1 instead of filtering in flow
```

### Database Performance

**Monitor Dataverse Database:**

```
Storage Used: (in Power Platform Admin Center)
- Alert if >80% of allocation used

Database Size By Table:
- Check which tables are growing
- Archive old requests if needed

Query Performance:
- Avoid searching large text fields
- Use indexed fields for filtering
- Test queries before deployment
```

**Optimize:**

1. **Archive old records:**
   ```sql
   SELECT * FROM ins_request 
   WHERE createdon < DATEADD(YEAR, -1, GETDATE())
   -- Move these to archive table
   ```

2. **Add indexes:**
   - ins_policystatus (on Policy table)
   - ins_requeststatus (on Request table)
   - ins_requesteddate (on Request table)

3. **Limit view results:**
   - Max 500 records per view (not 5000)
   - Add date filters (last 30 days)

---

## Monitoring Dashboard (Excel)

Create monthly monitoring report:

```
POLICY SERVICING REQUEST DESK - MONTHLY REPORT

Period: [Month/Year]

VOLUME METRICS
- New requests: [#]
- Completed: [#]
- Pending: [#]
- Completion rate: [%]

TIMING METRICS
- Avg processing time: [days]
- SLA compliance: [%]
- Longest pending: [#] days

QUALITY METRICS
- Rejection rate: [%]
- Error rate: [%]
- Approval rate: [%]

SYSTEM HEALTH
- Flow success rate: [%]
- Email delivery rate: [%]
- App uptime: [%]
- Database size: [GB]

ISSUES & RESOLUTIONS
- [Issue] - [Resolution] - [Date]

RECOMMENDATIONS
- [For next month]
```

---

## Support Contacts

**For Power Platform Issues:**
- Microsoft Support: https://support.microsoft.com/en-us
- Community: https://powerusers.microsoft.com

**For Dataverse Issues:**
- Dataverse Docs: https://learn.microsoft.com/dataverse
- Data Loss Prevention: Contact Microsoft

**For Insurance App Specific Issues:**
- App Owner: [Your Name]
- Email: [Your Email]
- Phone: [Your Phone]

---

## Resources

- Power Platform Docs: https://learn.microsoft.com/power-platform
- Power Apps: https://learn.microsoft.com/power-apps
- Power Automate: https://learn.microsoft.com/power-automate
- Copilot Studio: https://learn.microsoft.com/copilot-studio
- Best Practices: https://powerapps.microsoft.com/blog

---

**Last Updated:** September 2024  
**Version:** 1.0
