import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Scale, FileText } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";

export const metadata: Metadata = {
  title: "Privacy Policy | Kutchmitra Home & Decor Awards 2026",
  description:
    "Official Privacy Policy explaining how Kutchmitra Home & Decor Awards 2026 collects, uses, stores and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-ivory text-navy-900 font-sans">
      {/* ========================================================================= */}
      {/* HERO BANNER */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial max-w-4xl space-y-5">
          <SectionMarker number="01" label="Data Governance & Privacy" theme="light" />
          <div className="space-y-2">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-gold-700 font-semibold block">
              Kutchmitra Home &amp; Decor Awards 2026
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-navy-900 font-medium leading-[1.18] tracking-tight">
              Privacy Policy
            </h1>
          </div>
          <p className="text-base sm:text-lg text-[#4A4F5C] leading-relaxed">
            This Privacy Policy explains how Kutchmitra Home &amp; Decor Awards 2026 collects, uses, stores and protects personal information when you visit or use the Awards website and Applicant Portal (&quot;Platform&quot;).
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PRIVACY CONTENT BODY */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10 bg-ivory">
        <div className="container-editorial max-w-4xl space-y-12">
          {/* Quick Notice Header */}
          <div className="p-5 sm:p-6 bg-[#FBFAF7] border-l-4 border-gold-500 border-y border-r border-navy-900/10 shadow-sm space-y-1.5 text-xs sm:text-sm text-[#4A4F5C] leading-relaxed">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-navy-900 font-bold">
              <ShieldCheck size={16} className="text-gold-700" />
              <span>Applicant Data Protection Notice</span>
            </div>
            <p>
              By using the Platform, creating an account, submitting a nomination or providing information to us, you acknowledge this Privacy Policy. Where consent is required under applicable law, consent will be obtained in the manner required by law.
            </p>
          </div>

          <div className="space-y-12 divide-y divide-navy-900/10">
            {/* 1. Introduction */}
            <article className="pt-8 first:pt-0 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 01
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  1. Introduction
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                This Privacy Policy explains how Kutchmitra Home &amp; Decor Awards 2026 (&quot;Awards&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;) collects, uses, stores and protects personal information when you visit or use the Awards website and Applicant Portal (&quot;Platform&quot;).
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                By using the Platform, creating an account, submitting a nomination or providing information to us, you acknowledge this Privacy Policy. Where consent is required under applicable law, consent will be obtained in the manner required by law.
              </p>
            </article>

            {/* 2. Information We Collect */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 02
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  2. Information We Collect
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Depending on how you use the Platform, we may collect:
              </p>
              <ul className="space-y-2.5 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>Name and contact information, including email address and mobile number.</li>
                <li>Account and authentication information required to create and access an Applicant account.</li>
                <li>Organisation, company, brand, professional role or designation information.</li>
                <li>Award category and nomination information.</li>
                <li>Project name, project details, descriptions, questionnaire responses and declarations.</li>
                <li>Photographs, images, drawings, PDFs, certificates and other supporting files uploaded with a nomination.</li>
                <li>Information provided through enquiries, support requests and other communications with Kutchmitra.</li>
                <li>Information relating to eligibility verification, clarifications, evaluation, scoring, shortlisting and award results.</li>
                <li>Basic technical information such as IP address, browser/device information, timestamps and security or access logs required to operate and protect the Platform.</li>
              </ul>
            </article>

            {/* 3. How We Use Your Information */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 03
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  3. How We Use Your Information
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                We use personal information for purposes including:
              </p>
              <ul className="space-y-2.5 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>Creating and managing Applicant accounts.</li>
                <li>Authenticating users and maintaining account security.</li>
                <li>Receiving and administering Award nominations.</li>
                <li>Checking nomination completeness and eligibility.</li>
                <li>Communicating with Applicants about their accounts, nominations and Award-related matters.</li>
                <li>Requesting or responding to clarifications where required.</li>
                <li>Providing eligible nomination information to authorised Jury members and personnel involved in Award evaluation.</li>
                <li>Supporting evaluation, scoring, shortlisting and winner-selection processes.</li>
                <li>Maintaining Award records and relevant administrative or audit information.</li>
                <li>Publishing or promoting shortlisted entries, winners and approved project information in accordance with the Terms &amp; Conditions.</li>
                <li>Responding to enquiries and providing support.</li>
                <li>Preventing fraud, misuse, unauthorised access and activities that may compromise the security or integrity of the Awards.</li>
                <li>Maintaining, troubleshooting and improving the Platform.</li>
                <li>Complying with applicable laws and responding to lawful requests.</li>
              </ul>
            </article>

            {/* 4. Nomination Information and Uploaded Materials */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 04
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  4. Nomination Information and Uploaded Materials
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Applicants may submit project information and supporting materials such as photographs, architectural or interior-design images, drawings, documents, certificates and other files required for an Award category.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                These materials may be accessed by authorised Kutchmitra personnel and, where required for the Awards process, authorised Jury members and service providers supporting the Awards.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Participants retain ownership of their intellectual property. Any editorial, promotional, marketing or publicity use of submitted material is governed by the Kutchmitra Home &amp; Decor Awards 2026 Terms &amp; Conditions.
              </p>
            </article>

            {/* 5. Jury and Award Evaluation */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 05
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  5. Jury and Award Evaluation
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Information from eligible nominations may be shared with designated Jury members and authorised personnel for eligibility review, evaluation, scoring, shortlisting and winner selection.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Access to nomination information is intended to be limited to persons who require it for the relevant Awards process.
              </p>
            </article>

            {/* 6. Publication and Publicity */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 06
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  6. Publication and Publicity
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Shortlisted entries, winners and approved project information may be featured or published on Kutchmitra platforms and associated partner networks in accordance with the Awards Terms &amp; Conditions.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Applicants should review the Terms &amp; Conditions before submitting a nomination, particularly the provisions relating to publicity, editorial use, promotional use, marketing use and intellectual property.
              </p>
            </article>

            {/* 7. Cookies and Similar Technologies */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 07
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  7. Cookies and Similar Technologies
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                The Platform may use essential cookies, session technologies or similar mechanisms required for authentication, security, session management and necessary website functionality.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                If non-essential analytics, performance measurement or other tracking technologies are introduced, the relevant information and consent mechanisms will be provided as required.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                You may manage cookies through your browser settings. Disabling essential cookies or storage mechanisms may affect certain Platform functions, including login or account access.
              </p>
            </article>

            {/* 8. Sharing of Information */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 08
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  8. Sharing of Information
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                We may share personal information where reasonably necessary to operate and administer the Awards, provide the Platform, comply with applicable law or protect the security and rights of the Awards.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Information may be shared with:
              </p>
              <ul className="space-y-2.5 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>Authorised Kutchmitra/Awards Management personnel.</li>
                <li>Designated Jury members and authorised evaluation personnel.</li>
                <li>Technology, hosting, database, authentication, storage, security and communications service providers.</li>
                <li>Professional advisers or service providers engaged for Award administration.</li>
                <li>Government, regulatory or law-enforcement authorities where disclosure is required or permitted by law.</li>
                <li>Other parties where necessary to protect the security, rights or integrity of the Awards or Platform.</li>
              </ul>
              <p className="text-sm sm:text-base text-navy-900 font-medium pt-1">
                We do not intend to sell Applicants&apos; personal information as a commercial product.
              </p>
            </article>

            {/* 9. Third-Party Service Providers */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 09
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  9. Third-Party Service Providers
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                The Platform may use third-party providers for services such as authentication, database and file storage, hosting, security and transactional communications.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                These providers may process information on behalf of the Awards to provide their services. Access to personal information is intended to be limited according to the requirements of the relevant service.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                The service providers used by the Platform may change as the Awards technology evolves.
              </p>
            </article>

            {/* 10. Data Security */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 10
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  10. Data Security
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                We take reasonable technical and organisational measures designed to protect personal information against unauthorised access, alteration, disclosure, loss, misuse or destruction.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Security measures may include authenticated access, role-based permissions, database access controls, private file storage, access restrictions, secure transmission, logging and other security controls.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                No internet-based system can be guaranteed to be completely secure. Applicants should keep their account credentials confidential and notify Kutchmitra if they suspect unauthorised access to their account.
              </p>
            </article>

            {/* 11. Data Retention */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 11
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  11. Data Retention
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                We retain personal information for as long as reasonably necessary for the purposes for which it was collected, including account administration, Award processing, evaluation, publication, record-keeping, security, legal compliance and dispute resolution.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Different types of information may be retained for different periods depending on operational and legal requirements.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                When information is no longer required for a legitimate purpose or applicable legal requirement, reasonable steps may be taken to delete, anonymise or otherwise dispose of it in accordance with applicable law.
              </p>
            </article>

            {/* 12. Your Privacy Rights */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 12
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  12. Your Privacy Rights
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Subject to applicable law, you may have rights relating to your personal information, including the right to request information about its processing, correction of inaccurate information, deletion where applicable, withdrawal of consent where processing is based on consent, and the ability to raise a grievance.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Requests may be submitted using the contact details provided below. We may need to verify your identity before processing a request.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Some requests may be subject to legal, security, contractual or legitimate operational limitations.
              </p>
            </article>

            {/* 13. Withdrawal of Consent and Account Requests */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 13
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  13. Withdrawal of Consent and Account Requests
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Where processing is based on consent, you may request withdrawal of consent through the method provided by the Platform or by contacting Kutchmitra.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Withdrawal of consent does not affect processing that was lawfully carried out before withdrawal. It may also affect the availability of Platform functions where the relevant information is necessary to provide those functions.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Requests to close or delete an Applicant account may be subject to ongoing nominations, Award records, legal requirements, security requirements and other legitimate retention requirements.
              </p>
            </article>

            {/* 14. Children's Privacy */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 14
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  14. Children&apos;s Privacy
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                The Awards Platform is intended for entrants and participants involved in professional architecture, interior design, residential, product and related Award activities.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                The Platform is not intended to knowingly collect personal information from children. If Kutchmitra becomes aware of information submitted by a child in circumstances where such collection is not permitted, appropriate steps will be taken in accordance with applicable law.
              </p>
            </article>

            {/* 15. Third-Party Links */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 15
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  15. Third-Party Links
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                The Platform may contain links to external websites, social-media platforms or other third-party services.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Those services may have their own privacy policies and terms. Kutchmitra is not responsible for the privacy practices or security of third-party websites and services that it does not control.
              </p>
            </article>

            {/* 16. Changes to This Privacy Policy */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 16
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  16. Changes to This Privacy Policy
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Kutchmitra may update this Privacy Policy from time to time to reflect changes to the Awards, Platform functionality, service providers, legal requirements or information-processing practices.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                The latest version will be published on the Platform with an updated date. Where applicable law requires additional notice or consent for a material change, the required process will be followed.
              </p>
            </article>

            {/* 17. Contact Us */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 17
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  17. Contact Us
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                For privacy-related questions, requests or grievances, please contact:
              </p>
              <div className="p-6 bg-[#FBFAF7] border border-navy-900/10 space-y-3 shadow-sm max-w-xl">
                <p className="text-xs font-mono uppercase tracking-wider text-navy-900 font-bold">
                  Kutchmitra
                </p>
                <div className="space-y-2 text-sm font-sans">
                  <div className="flex items-center gap-2">
                    <Mail size={15} className="text-gold-700 flex-shrink-0" />
                    <span className="font-mono text-slate-500 text-xs uppercase">Email:</span>
                    <a
                      href="mailto:Kutchmitraweb@gmail.com"
                      className="font-medium text-navy-900 hover:text-gold-700 transition-colors"
                    >
                      Kutchmitraweb@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-gold-700 flex-shrink-0" />
                    <span className="font-mono text-slate-500 text-xs uppercase">Helpline:</span>
                    <a
                      href="tel:+917211189211"
                      className="font-medium text-navy-900 hover:text-gold-700 transition-colors font-mono"
                    >
                      +91 7211189211
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-gold-700 flex-shrink-0 mt-0.5" />
                    <span className="font-mono text-slate-500 text-xs uppercase">Office:</span>
                    <span className="text-[#4A4F5C]">
                      Nr. Indirabai Park, Bhuj, Kutch – 370001
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* 18. Effective Date */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 18
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  18. Effective Date
                </h2>
              </div>
              <div className="p-4 bg-[#FBFAF7] border border-navy-900/10 space-y-1 font-mono text-xs text-slate-600">
                <p>Effective Date: [TO BE CONFIRMED]</p>
                <p>Last Updated: [TO BE CONFIRMED]</p>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed pt-2">
                This Privacy Policy should be read together with the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-navy-900 hover:text-gold-700 underline underline-offset-4 transition-colors"
                >
                  Kutchmitra Home &amp; Decor Awards 2026 Terms &amp; Conditions
                </Link>
                .
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
