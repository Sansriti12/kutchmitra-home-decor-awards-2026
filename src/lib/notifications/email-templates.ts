/**
 * Phase F: Kutchmitra Home & Decor Awards 2026
 * Responsive Transactional Email Templates & Formatting
 * 
 * NOTE: All wording represents proposed Kutchmitra notification templates 
 * and requires official client content approval.
 */

import type { NotificationEventType } from "@/types/notification.types";

const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://awards.kutchmitra.com";

interface TemplateContext {
  recipientName?: string;
  nominationId?: string;
  projectName?: string;
  categoryName?: string;
  categoryCode?: string;
  clarificationMessage?: string;
  awardTitle?: string;
  statusLabel?: string;
  portalUrl?: string;
  actorName?: string;
  reason?: string;
  meta?: Record<string, any>;
}

/**
 * Base email layout wrapper providing responsive architectural styling,
 * brand colors (Navy #0A192F, Gold #C5A059, Ivory #FBF9F5), and official footer.
 */
function wrapEmailLayout(title: string, preheader: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F4F2EC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1A202C;
      -webkit-font-smoothing: antialiased;
    }
    table { border-collapse: collapse; }
    .container {
      max-width: 620px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border: 1px solid #E2D9C8;
      box-shadow: 0 4px 12px rgba(10, 25, 47, 0.05);
    }
    .header {
      background-color: #0A192F;
      padding: 32px 36px;
      text-align: center;
      border-bottom: 3px solid #C5A059;
    }
    .header-sub {
      color: #C5A059;
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 6px;
      font-family: ui-monospace, Menlo, Consolas, monospace;
    }
    .header-title {
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 500;
      letter-spacing: -0.01em;
      margin: 0;
    }
    .header-edition {
      color: #C5A059;
      font-size: 13px;
      font-weight: 600;
    }
    .body {
      padding: 36px;
      line-height: 1.65;
      font-size: 14px;
      color: #2D3748;
    }
    .lead {
      font-size: 16px;
      font-weight: 600;
      color: #0A192F;
      margin-bottom: 16px;
    }
    .data-card {
      background-color: #FBF9F5;
      border: 1px solid #EAE3D2;
      border-left: 4px solid #C5A059;
      padding: 16px 20px;
      margin: 24px 0;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed #E2D9C8;
      font-size: 13px;
    }
    .data-row:last-child {
      border-bottom: none;
    }
    .data-label {
      color: #718096;
      font-weight: 500;
    }
    .data-value {
      color: #0A192F;
      font-weight: 600;
      font-family: ui-monospace, Menlo, Consolas, monospace;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .btn {
      display: inline-block;
      background-color: #C5A059;
      color: #0A192F !important;
      text-decoration: none;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 14px 28px;
      border-radius: 0;
      font-family: ui-monospace, Menlo, Consolas, monospace;
    }
    .alert-box {
      background-color: #FFFDF0;
      border: 1px solid #E9D29A;
      padding: 14px 18px;
      margin: 20px 0;
      font-size: 13px;
      color: #744210;
    }
    .footer {
      background-color: #0A192F;
      color: #A0AEC0;
      padding: 24px 36px;
      text-align: center;
      font-size: 11px;
      line-height: 1.6;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .footer a {
      color: #C5A059;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <!-- Preheader text hidden in inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">
    ${preheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="header-sub">Official Awards Communication</div>
            <h1 class="header-title">Kutchmitra Home &amp; Decor Awards <span class="header-edition">2026</span></h1>
          </div>

          <!-- Body -->
          <div class="body">
            ${contentHtml}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 8px 0; color: #FFFFFF; font-weight: 600;">Kutchmitra Home &amp; Decor Awards 2026</p>
            <p style="margin: 0 0 12px 0;">
              Celebrating architectural, interior, and craftsmanship excellence across Kutch District.<br>
              Bhuj, Kutch, Gujarat &bull; <a href="${APP_URL}">kutchmitra.com</a>
            </p>
            <p style="margin: 0; font-size: 10px; color: #718096;">
              This is an official transactional message. Please do not reply directly to this automated email. 
              For support, reach out to <a href="mailto:awards@kutchmitra.com">awards@kutchmitra.com</a>.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Returns subject, plain-text, and responsive HTML email for a given event.
 */
export function renderEmailTemplate(
  eventType: NotificationEventType,
  ctx: TemplateContext
): { subject: string; text: string; html: string } {
  const name = ctx.recipientName || "Respected Entrant";
  const portalUrl = ctx.portalUrl || `${APP_URL}/dashboard`;

  switch (eventType) {
    // --------------------------------------------------------------------------
    // 1. APPLICANT: WELCOME REGISTRATION
    // --------------------------------------------------------------------------
    case "applicant_registered": {
      const subject = "Welcome to Kutchmitra Home & Decor Awards 2026";
      const preheader = "Your entrant account is activated. Begin your nomination dossier.";
      const htmlContent = `
        <div class="lead">Welcome, ${name}.</div>
        <p>Thank you for registering for the <strong>Kutchmitra Home &amp; Decor Awards 2026</strong> — the premier benchmark of architectural, design, and craftsmanship excellence across Kutch District.</p>
        
        <p>Your entrant credentials are ready. You may now access the nomination wizard to prepare and submit projects across the 13 official award disciplines.</p>

        <div class="data-card">
          <div style="font-size: 11px; font-weight: 700; color: #C5A059; text-transform: uppercase; margin-bottom: 8px;">Key Entry Reminders</div>
          <div style="font-size: 13px; color: #2D3748; line-height: 1.5;">
            &bull; Eligible projects must be physically situated in <strong>Kutch District</strong>.<br>
            &bull; Project completion must fall between <strong>January 1, 2023, and December 31, 2025</strong>.<br>
            &bull; Entries are evaluated on qualitative architectural merit under strict Grand Jury governance.
          </div>
        </div>

        <div class="btn-container">
          <a href="${portalUrl}" class="btn">Enter Applicant Portal</a>
        </div>

        <p style="font-size: 12px; color: #718096; margin-top: 24px;">
          For assistance with your nomination, documentation guidelines, or upload specifications, consult the 
          <a href="${APP_URL}/how-to-nominate" style="color: #C5A059;">How to Nominate Guide</a> or contact our secretariat.
        </p>
      `;

      const text = `Welcome to Kutchmitra Home & Decor Awards 2026

Dear ${name},

Thank you for registering for the Kutchmitra Home & Decor Awards 2026. Your entrant account is activated.

You can now sign in to your Applicant Portal and begin your nomination dossier:
${portalUrl}

Eligible projects must be located in Kutch District and completed between January 1, 2023, and December 31, 2025.

Secretariat Contact: awards@kutchmitra.com | ${APP_URL}`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }

    // --------------------------------------------------------------------------
    // 2. APPLICANT: NOMINATION SUBMITTED
    // --------------------------------------------------------------------------
    case "nomination_submitted": {
      const nomId = ctx.nominationId || "KHA26-XX-XXXX";
      const subject = `Nomination Submitted — ${nomId}`;
      const preheader = `Your nomination for ${ctx.projectName || "your project"} has been officially received.`;
      const htmlContent = `
        <div class="lead">Nomination Received Successfully</div>
        <p>Dear ${name},</p>
        <p>We confirm that your formal nomination dossier for the <strong>Kutchmitra Home &amp; Decor Awards 2026</strong> has been recorded and submitted for verification.</p>

        <div class="data-card">
          <table width="100%" style="font-size: 13px;">
            <tr>
              <td class="data-label" style="padding: 4px 0;">Nomination ID:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${nomId}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Project Name:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${ctx.projectName || "N/A"}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Category:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${ctx.categoryName || "Official Category"}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Current Status:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right; color: #2B6CB0;">SUBMITTED</td>
            </tr>
          </table>
        </div>

        <p><strong>Next Steps:</strong> Your entry will now undergo preliminary technical and regional eligibility verification by the Awards Committee. If further documentation or spatial clarifications are required, you will receive an alert in your dashboard.</p>

        <div class="btn-container">
          <a href="${portalUrl}/nominations/${ctx.meta?.applicationId || ""}" class="btn">View Dossier in Portal</a>
        </div>
      `;

      const text = `Nomination Submitted — ${nomId}

Dear ${name},

Your nomination dossier has been successfully submitted for the Kutchmitra Home & Decor Awards 2026.

Nomination ID: ${nomId}
Project: ${ctx.projectName || "N/A"}
Category: ${ctx.categoryName || "Official Category"}
Status: SUBMITTED

Your entry is now proceeding to preliminary verification. You may review your submitted dossier at:
${portalUrl}`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }

    // --------------------------------------------------------------------------
    // 3. APPLICANT: CLARIFICATION REQUIRED (HIGH PRIORITY)
    // --------------------------------------------------------------------------
    case "clarification_requested": {
      const nomId = ctx.nominationId || "KHA26-XX-XXXX";
      const subject = `Action Required: Clarification Requested for Nomination ${nomId}`;
      const preheader = `Clarification requested regarding project details or uploads for ${nomId}.`;
      const htmlContent = `
        <div class="lead" style="color: #975A16;">Action Required: Verification Clarification</div>
        <p>Dear ${name},</p>
        <p>During the preliminary technical verification of your nomination <strong>${nomId}</strong> (${ctx.projectName || "Project"}), the Awards Verification Team identified an item requiring your clarification or revised documentation.</p>

        <div class="alert-box">
          <div style="font-weight: 700; margin-bottom: 6px; text-transform: uppercase; font-size: 11px;">Verification Desk Note:</div>
          <div style="font-style: italic; line-height: 1.5;">"${ctx.clarificationMessage || "Please review your uploaded drawings and category question responses."}"</div>
        </div>

        <p>Your nomination has been temporarily unlocked in the portal to allow you to update the relevant responses or replace drawings. Once updated, please submit your clarification response directly in the portal.</p>

        <div class="btn-container">
          <a href="${portalUrl}/nominations/${ctx.meta?.applicationId || ""}" class="btn" style="background-color: #D69E2E;">Respond to Clarification</a>
        </div>
      `;

      const text = `Action Required: Clarification Requested — ${nomId}

Dear ${name},

During technical verification of your nomination ${nomId} (${ctx.projectName || "Project"}), the Verification Team requested the following clarification:

"${ctx.clarificationMessage || "Please review your uploaded files and responses."}"

Please log in to your applicant portal to provide the requested information and resubmit:
${portalUrl}`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }

    // --------------------------------------------------------------------------
    // 4. APPLICANT: NOMINATION ELIGIBLE
    // --------------------------------------------------------------------------
    case "nomination_eligible": {
      const nomId = ctx.nominationId || "KHA26-XX-XXXX";
      const subject = `Nomination Verified as Eligible — ${nomId}`;
      const preheader = `Your entry ${nomId} has cleared preliminary verification and advances to Grand Jury review.`;
      const htmlContent = `
        <div class="lead" style="color: #22543D;">Preliminary Verification Complete</div>
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your nomination <strong>${nomId}</strong> (<em>${ctx.projectName || "Project"}</em>) has successfully satisfied all geographic, temporal, and technical criteria and is verified as <strong>ELIGIBLE</strong>.</p>

        <div class="data-card">
          <div style="font-size: 11px; font-weight: 700; color: #22543D; text-transform: uppercase; margin-bottom: 6px;">Status Notice</div>
          <p style="margin: 0; font-size: 13px; color: #2D3748;">
            Your dossier is now queued for evaluation by our distinguished Grand Jury panel. 
            Evaluations will be conducted in accordance with approved qualitative criteria.
          </p>
        </div>

        <p style="font-size: 12px; color: #718096; font-style: italic;">
          *Please note: Eligibility clearance indicates adherence to foundational entry standards and does not imply shortlist or winner designation.
        </p>

        <div class="btn-container">
          <a href="${portalUrl}" class="btn">View Nomination Status</a>
        </div>
      `;

      const text = `Nomination Verified as Eligible — ${nomId}

Dear ${name},

Your nomination ${nomId} (${ctx.projectName || "Project"}) has successfully cleared preliminary verification and is verified as ELIGIBLE.

It is now advancing to Grand Jury evaluation.

View status: ${portalUrl}`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }

    // --------------------------------------------------------------------------
    // 5. APPLICANT: SHORTLISTED FINALIST
    // --------------------------------------------------------------------------
    case "nomination_shortlisted": {
      const nomId = ctx.nominationId || "KHA26-XX-XXXX";
      const subject = `Official Shortlist Announcement — Nomination ${nomId}`;
      const preheader = `Congratulations: Your project ${ctx.projectName || ""} is an Official Shortlisted Finalist.`;
      const htmlContent = `
        <div class="lead" style="color: #C5A059;">Official Finalist Shortlist Confirmation</div>
        <p>Dear ${name},</p>
        <p>Following comprehensive Grand Jury deliberations and qualitative scoring across five approved evaluation criteria, the Awards Secretariat is delighted to announce that your project has been selected as an <strong>OFFICIAL SHORTLISTED FINALIST</strong> for the Kutchmitra Home &amp; Decor Awards 2026.</p>

        <div class="data-card">
          <table width="100%" style="font-size: 13px;">
            <tr>
              <td class="data-label" style="padding: 4px 0;">Nomination ID:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${nomId}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Project:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${ctx.projectName || "N/A"}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Category:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${ctx.categoryName || "Official Category"}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Shortlist Distinction:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right; color: #C5A059;">OFFICIAL FINALIST</td>
            </tr>
          </table>
        </div>

        <p><strong>Distinction Note:</strong> Selection to the Official Shortlist represents an extraordinary accomplishment, placing your work among the pinnacle of architectural and craftsmanship achievement in Kutch. Final Grand Finale honorees will be announced during the gala ceremony.</p>

        <div class="btn-container">
          <a href="${portalUrl}" class="btn">View Finalist Dossier</a>
        </div>
      `;

      const text = `Official Shortlist Announcement — ${nomId}

Dear ${name},

Congratulations! Following Grand Jury evaluation, your project ${ctx.projectName || "N/A"} (Nomination ID: ${nomId}) has been selected as an OFFICIAL SHORTLISTED FINALIST for the Kutchmitra Home & Decor Awards 2026.

Category: ${ctx.categoryName || "Official Category"}
Distinction: OFFICIAL FINALIST

Selection to the shortlist signifies architectural excellence. Final honorees will be revealed during the official ceremony.

Portal: ${portalUrl}`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }

    // --------------------------------------------------------------------------
    // 6. APPLICANT: WINNER HONOREE
    // --------------------------------------------------------------------------
    case "winner_designated":
    case "winner_published": {
      const nomId = ctx.nominationId || "KHA26-XX-XXXX";
      const award = ctx.awardTitle || "Winner";
      const subject = `Award Honoree Announcement — ${award}: ${ctx.projectName || nomId}`;
      const preheader = `Distinction Conferred: Official ${award} in ${ctx.categoryName || "Awards 2026"}.`;
      const htmlContent = `
        <div class="lead" style="color: #0A192F;">Grand Finale Honoree Announcement</div>
        <p>Dear ${name},</p>
        <p>On behalf of the Kutchmitra Editorial Board and the Grand Jury Panel, it is our distinct privilege to formally congratulate you on being conferred the title of:</p>

        <div style="text-align: center; margin: 28px 0; padding: 24px; background: #0A192F; border: 2px solid #C5A059;">
          <div style="font-size: 11px; font-family: ui-monospace, monospace; color: #C5A059; letter-spacing: 0.2em; text-transform: uppercase;">Official Distinction</div>
          <div style="font-size: 26px; font-weight: 700; color: #FFFFFF; margin: 8px 0;">${award}</div>
          <div style="font-size: 14px; color: #E2E8F0;">${ctx.categoryName || "Award Discipline"}</div>
          <div style="font-size: 13px; color: #C5A059; margin-top: 6px;">Project: ${ctx.projectName || "Awarded Project"}</div>
        </div>

        <p>Your exemplary contribution to architectural innovation, context sensitivity, and execution excellence has earned this prestigious recognition. Details regarding the Grand Finale showcase and trophy presentation will be communicated by our events team.</p>

        <div class="btn-container">
          <a href="${APP_URL}/winners" class="btn">View Live Winners Showcase</a>
        </div>
      `;

      const text = `Award Honoree Announcement — ${award}

Dear ${name},

Congratulations! You have been officially awarded the distinction of ${award} in the ${ctx.categoryName || "Awards"} for project "${ctx.projectName || "N/A"}" (Nomination ${nomId}).

Live showcase: ${APP_URL}/winners`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }

    // --------------------------------------------------------------------------
    // 7. JURY: ASSIGNMENT NOTIFICATION
    // --------------------------------------------------------------------------
    case "jury_assigned": {
      const nomId = ctx.nominationId || "KHA26-XX-XXXX";
      const subject = `New Nomination Assigned for Evaluation — ${nomId}`;
      const preheader = `A new entry has been assigned to your confidential jury evaluation queue.`;
      const htmlContent = `
        <div class="lead">Confidential Jury Evaluation Assignment</div>
        <p>Dear ${name},</p>
        <p>A new candidate nomination has been assigned to you for qualitative evaluation in the <strong>Kutchmitra Home &amp; Decor Awards 2026</strong> Grand Jury Portal.</p>

        <div class="data-card">
          <table width="100%" style="font-size: 13px;">
            <tr>
              <td class="data-label" style="padding: 4px 0;">Nomination ID:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${nomId}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Project Name:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${ctx.projectName || "Confidential Project"}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Discipline:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${ctx.categoryName || "Official Category"}</td>
            </tr>
          </table>
        </div>

        <p><strong>Evaluation Protocol:</strong> Please examine the architectural drawings, site context, and category responses. Rate the entry qualitatively against the five approved evaluation criteria. If you have any personal or professional conflict of interest with this project or entrant, please declare a conflict directly in the portal.</p>

        <div class="btn-container">
          <a href="${APP_URL}/jury/portal" class="btn">Open Jury Evaluation Portal</a>
        </div>
      `;

      const text = `New Nomination Assigned for Evaluation — ${nomId}

Dear ${name},

A new nomination (${nomId} // ${ctx.projectName || "Project"}) has been assigned to your jury queue.

Please access your confidential portal to review the dossier and submit qualitative feedback:
${APP_URL}/jury/portal`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }

    // --------------------------------------------------------------------------
    // 8. JURY: EVALUATION REOPENED
    // --------------------------------------------------------------------------
    case "jury_evaluation_reopened": {
      const nomId = ctx.nominationId || "KHA26-XX-XXXX";
      const subject = `Evaluation Reopened for Review — ${nomId}`;
      const preheader = `Your evaluation for nomination ${nomId} has been reopened by Administration.`;
      const htmlContent = `
        <div class="lead" style="color: #975A16;">Evaluation Reopened by Administration</div>
        <p>Dear ${name},</p>
        <p>Your previously submitted evaluation for nomination <strong>${nomId}</strong> (<em>${ctx.projectName || "Project"}</em>) has been reopened by the Awards Administrator to permit adjustment or review.</p>

        ${ctx.reason ? `
        <div class="alert-box">
          <strong>Administrative Note:</strong><br>
          "${ctx.reason}"
        </div>` : ""}

        <div class="btn-container">
          <a href="${APP_URL}/jury/portal" class="btn">Access Jury Dossier</a>
        </div>
      `;

      const text = `Evaluation Reopened for Review — ${nomId}

Dear ${name},

Your evaluation for nomination ${nomId} has been reopened by Administration.
Reason: ${ctx.reason || "Administrative review"}

Please log in to the Jury Portal: ${APP_URL}/jury/portal`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }

    // --------------------------------------------------------------------------
    // 9. ADMIN OPERATIONAL ALERTS
    // --------------------------------------------------------------------------
    case "admin_new_submission":
    case "admin_clarification_responded":
    case "admin_jury_conflict": {
      const nomId = ctx.nominationId || "KHA26-XX-XXXX";
      const eventLabel =
        eventType === "admin_new_submission"
          ? "New Nomination Submitted"
          : eventType === "admin_clarification_responded"
          ? "Clarification Resubmitted by Applicant"
          : "Jury Conflict of Interest Declared";

      const subject = `[Admin Alert] ${eventLabel}: ${nomId}`;
      const preheader = `Operational Alert: ${eventLabel} for ${nomId}.`;
      const htmlContent = `
        <div class="lead">[Admin Alert] ${eventLabel}</div>
        <p>An operational event requiring administrative attention has occurred:</p>

        <div class="data-card">
          <table width="100%" style="font-size: 13px;">
            <tr>
              <td class="data-label" style="padding: 4px 0;">Event:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${eventLabel}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Nomination ID:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${nomId}</td>
            </tr>
            <tr>
              <td class="data-label" style="padding: 4px 0;">Project:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${ctx.projectName || "N/A"}</td>
            </tr>
            ${ctx.actorName ? `
            <tr>
              <td class="data-label" style="padding: 4px 0;">Actor:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${ctx.actorName}</td>
            </tr>` : ""}
            ${ctx.reason ? `
            <tr>
              <td class="data-label" style="padding: 4px 0;">Notes / Reason:</td>
              <td class="data-value" style="padding: 4px 0; text-align: right;">${ctx.reason}</td>
            </tr>` : ""}
          </table>
        </div>

        <div class="btn-container">
          <a href="${APP_URL}/admin/applications" class="btn">Open Admin Desk</a>
        </div>
      `;

      const text = `[Admin Alert] ${eventLabel} — ${nomId}
Project: ${ctx.projectName || "N/A"}
Actor: ${ctx.actorName || "N/A"}
Notes: ${ctx.reason || "N/A"}
Admin Portal: ${APP_URL}/admin/applications`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }

    // --------------------------------------------------------------------------
    // 10. DEFAULT / STATUS CHANGED
    // --------------------------------------------------------------------------
    default: {
      const nomId = ctx.nominationId || "KHA26-XX-XXXX";
      const statusText = ctx.statusLabel || "Updated";
      const subject = `Nomination Status Update — ${nomId}`;
      const preheader = `The status of nomination ${nomId} has transitioned to ${statusText}.`;
      const htmlContent = `
        <div class="lead">Nomination Status Update</div>
        <p>Dear ${name},</p>
        <p>The status of your nomination <strong>${nomId}</strong> (<em>${ctx.projectName || "Project"}</em>) has been updated in the portal.</p>

        <div class="data-card">
          <div class="data-row">
            <span class="data-label">Nomination ID:</span>
            <span class="data-value">${nomId}</span>
          </div>
          <div class="data-row">
            <span class="data-label">New Status:</span>
            <span class="data-value" style="color: #C5A059;">${statusText}</span>
          </div>
        </div>

        <div class="btn-container">
          <a href="${portalUrl}" class="btn">View in Portal</a>
        </div>
      `;

      const text = `Nomination Status Update — ${nomId}

Dear ${name},

The status of nomination ${nomId} (${ctx.projectName || "Project"}) has updated to: ${statusText}.

Log in to view details: ${portalUrl}`;

      return {
        subject,
        text,
        html: wrapEmailLayout(subject, preheader, htmlContent),
      };
    }
  }
}
