# VaultFill Monitoring & Alerting Procedures

This document outlines the monitoring and alerting configurations for the VaultFill application, along with the procedures for handling various types of incidents.

## 1. Vercel Monitoring Alerts

Vercel provides native monitoring and alerting capabilities for deployments. These alerts are crucial for catching issues related to the build and deployment process, as well as runtime errors in production.

### Configuration Steps:

1.  **Access Vercel Dashboard:** Log in to your Vercel account and navigate to the VaultFill project.
2.  **Go to "Monitoring" Tab:** In the project dashboard, click on the "Monitoring" tab in the left-hand sidebar.
3.  **Configure Alerts:**
    *   **Build Failures:** Vercel automatically sends notifications for build failures. Ensure that the relevant team members (e.g., developers, DevOps) are configured to receive these notifications via email or integrated third-party services (Slack, Discord).
        *   Navigate to **Settings > Integrations** to connect communication channels.
        *   Under **Notifications**, verify that "Build failed" is enabled for the desired channels.
    *   **Deployment Errors:** Similar to build failures, Vercel provides alerts for deployment errors (e.g., deployment failing after a successful build, or issues during environment setup).
        *   Under **Notifications**, verify that "Deployment failed" is enabled for the desired channels.
    *   **Critical Runtime Errors:** Vercel's Log Drains and Serverless Function Logs can be used to monitor for critical runtime errors.
        *   **Log Drains:** Set up a log drain to a service like Datadog, Logflare, or Sentry. This centralizes your logs for advanced filtering and alerting.
            *   Navigate to **Settings > Log Drains**.
            *   Add a new Log Drain and configure it to send logs to your preferred monitoring service.
        *   **Alerting in External Service:** Within the external logging service (e.g., Sentry), create alerts for specific error patterns (e.g., HTTP 500 errors, specific error messages) with a critical severity.
        *   **Vercel's "Functions" Tab:** Regularly check the "Functions" tab under "Monitoring" to review serverless function execution and identify errors.
        *   **Vercel Analytics (Pro/Enterprise):** Utilize Vercel Analytics for deeper insights into runtime performance and errors, setting up custom alerts based on error rates or latency.

## 2. Uptime Monitoring

External uptime monitoring ensures that `https://vaultfill.com` is accessible to users. This provides an independent verification of the site's availability.

### Setup for UptimeRobot (or similar service):

1.  **Choose an Uptime Monitoring Service:** Select a reliable service (e.g., UptimeRobot, Pingdom, Statuscake). This documentation will use UptimeRobot as an example.
2.  **Create an Account:** Sign up for an account with the chosen service.
3.  **Add a New Monitor:**
    *   **Monitor Type:** Select "HTTP(s)" or "Keyword" for robust checking. "HTTP(s)" is generally sufficient.
    *   **Friendly Name:** `VaultFill Website`
    *   **URL:** `https://vaultfill.com`
    *   **Monitoring Interval:** Set this to a frequent interval (e.g., every 1-5 minutes).
    *   **Alert Contacts:** Configure alert contacts to notify relevant personnel (e.g., email, SMS, push notifications, webhooks). Ensure these contacts include the on-call team.
    *   **Advanced Settings (Optional):**
        *   **Timeout:** Increase if the site is known to have occasional slow responses.
        *   **HTTP Method:** Keep as GET.
        *   **Custom HTTP Headers:** Not usually needed for basic uptime.
        *   **Maintenance Windows:** Define periods when planned downtime will not trigger alerts.
4.  **Integration with Telegram (if supported by service):** Some uptime monitoring services offer direct Telegram integration. If not, use webhooks to connect to a custom Telegram bot or an intermediate service.

## 3. Telegram Alerts for Critical Incidents

While Vercel and external services provide some notifications, direct Telegram alerts ensure immediate visibility for critical incidents, especially when OpenClaw is actively monitoring.

### Configuration for OpenClaw (as a notification recipient):

**Note:** OpenClaw itself can act as a notification channel for various services. The following outlines how external systems *would* send alerts to a Telegram group/channel that OpenClaw monitors, or how OpenClaw could trigger these directly based on its own checks.

1.  **Site Down (HTTP 5xx errors for >5 minutes):**
    *   **Source:** The external uptime monitoring service (e.g., UptimeRobot) should be configured to send a webhook notification to OpenClaw's Telegram integration when `https://vaultfill.com` returns HTTP 5xx errors for a sustained period.
    *   **Payload:** The webhook payload should contain clear information about the incident (e.g., "VaultFill is Down!", URL, status code, duration).
    *   **OpenClaw Action:** OpenClaw, upon receiving such a message in its monitored Telegram channel, can parse the alert and trigger internal procedures or escalate.
2.  **API Errors (>10 errors/hour on `/api/chat`, `/api/leads`):**
    *   **Source:**
        *   **Vercel Log Drains:** If using an external logging/APM service (e.g., Sentry, Datadog) integrated with Vercel Log Drains, configure alerts in *that service* to trigger a webhook to OpenClaw's Telegram integration when the error threshold is met for specific API endpoints.
        *   **Custom Monitoring:** Implement custom monitoring within the VaultFill application or a separate service that tracks API error rates. This service would then send a Telegram message or webhook to OpenClaw.
    *   **Payload:** The alert message should include the affected API endpoint, error count, and time frame.
    *   **OpenClaw Action:** OpenClaw can acknowledge the alert, potentially query Vercel logs for more details, or notify the on-call team.
3.  **Database Connection Failures:**
    *   **Source:**
        *   **Database-as-a-Service (DBaaS) Monitoring:** If using a DBaaS (e.g., Neon, Supabase, AWS RDS), configure their native alerting to send notifications via webhook to OpenClaw's Telegram integration.
        *   **Application-Level Monitoring:** Implement health checks within the VaultFill application that specifically test database connectivity. If these checks fail, the application can log an error that's picked up by Vercel Log Drains, or directly send a Telegram message.
    *   **Payload:** The alert should specify the database instance, error type (e.g., connection refused, authentication failure), and timestamp.
    *   **OpenClaw Action:** OpenClaw can notify the database administrator, check database service status, or assist with initial troubleshooting steps.

## 4. Alert Procedures

Clear, concise alert procedures are essential for quick incident response.

### Document Path: `/home/mrelbdfa/.openclaw/workspace/vaultfill-app/docs/alert_procedures.md`

### General Alert Procedure:

1.  **Acknowledge Alert:** The on-call engineer/team member acknowledges the alert within 5 minutes.
2.  **Initial Assessment:** Quickly determine the scope and severity of the issue.
3.  **Initial Troubleshooting:** Follow the specific troubleshooting steps outlined below for each alert type.
4.  **Communication:** Update relevant stakeholders (internal team, users if public impact) on the incident status.
5.  **Escalation:** If the issue cannot be resolved within a defined timeframe or requires specialized expertise, escalate to the next tier of support or relevant team.
6.  **Resolution & Post-mortem:** Once resolved, document the resolution steps and conduct a post-mortem analysis to prevent recurrence.

### Specific Alert Procedures:

#### A. Vercel Build/Deployment Failures

*   **Responsibility:** Development Team, DevOps
*   **Initial Troubleshooting:**
    1.  Check Vercel deployment logs for specific error messages.
    2.  Review recent code changes in the VCS (Git) for potential breaking changes.
    3.  Attempt a manual redeploy from the Vercel dashboard.
    4.  Verify environment variables in Vercel.
*   **Escalation:** If the issue persists after initial checks, escalate to the lead developer or DevOps engineer.

#### B. External Uptime Monitoring (Site Down)

*   **Responsibility:** DevOps, On-Call Engineer
*   **Initial Troubleshooting:**
    1.  Verify the alert from multiple monitoring sources if available.
    2.  Check Vercel dashboard for any reported outages or status page updates.
    3.  Attempt to access `https://vaultfill.com` from different networks/devices.
    4.  Review Vercel logs for any sudden spikes in 5xx errors or application crashes.
    5.  Check DNS resolution for `vaultfill.com`.
*   **Escalation:** If the site remains down, escalate to the DevOps team lead and notify the development team.

#### C. Telegram Alert: API Errors (`/api/chat`, `/api/leads`)

*   **Responsibility:** Development Team, On-Call Engineer
*   **Initial Troubleshooting:**
    1.  Check Vercel logs for specific error messages related to the affected API endpoints.
    2.  Review recent code deployments affecting `api/chat` or `api/leads`.
    3.  Verify external service dependencies (e.g., third-party APIs) if those endpoints rely on them.
    4.  Check database connection status (as high API errors might stem from DB issues).
*   **Escalation:** If the error rate persists, escalate to the relevant feature team lead or backend developer.

#### D. Telegram Alert: Database Connection Failures

*   **Responsibility:** DevOps, Database Administrator (DBA)
*   **Initial Troubleshooting:**
    1.  Check the status of the database instance via its provider's dashboard (e.g., Neon, Supabase, AWS RDS).
    2.  Verify database credentials and network connectivity from the Vercel application environment.
    3.  Review database logs for any errors, resource saturation (CPU, memory), or connection limits being hit.
    4.  Restart the database instance if appropriate and within operational guidelines.
*   **Escalation:** Immediately escalate to the DBA or lead DevOps engineer if the connection issue is not quickly resolved.
