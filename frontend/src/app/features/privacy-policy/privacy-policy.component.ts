import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <div class="flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
                <img src="/courseorganizerlogo.png" 
                     alt="Course Organizer Logo" 
                     class="h-8 sm:h-10 w-auto">
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900">Course Organizer</h1>
              </div>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-3">
              <a routerLink="/" 
                 class="text-gray-600 hover:text-gray-900 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors">
                Home
              </a>
              <a routerLink="/login" 
                 class="bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="prose prose-lg max-w-none">
          <h1 class="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div class="bg-gray-50 rounded-2xl p-8 mb-8">
            <p class="text-lg text-gray-700 mb-4">
              <strong>Last updated:</strong> January 2025
            </p>
            <p class="text-lg text-gray-700 mb-4">
              This privacy policy describes how RiverLearn Inc. ("we," "our," or "us") collects, uses, and protects your information when you use the Course Organizer platform.
            </p>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-blue-900 mb-3">🇰🇪 Kenya Data Protection Act Compliance</h3>
              <p class="text-blue-800 text-sm">
                RiverLearn Inc. is committed to full compliance with the Kenya Data Protection Act, 2019. This privacy policy is designed to ensure transparency and protection of your personal data in accordance with Kenyan data protection laws. We process your personal data lawfully, fairly, and transparently, respecting your fundamental rights and freedoms.
              </p>
              <p class="text-blue-700 text-xs mt-2">
                Reference: <a href="https://www.kentrade.go.ke/wp-content/uploads/2022/09/Data-Protection-Act-1.pdf" target="_blank" class="underline hover:text-blue-900">Kenya Data Protection Act, 2019</a>
              </p>
            </div>
          </div>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          
          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">1.1 Personal Information</h3>
          <p class="text-gray-700 mb-4">
            When you register for Course Organizer, we collect:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number (for SMS notifications)</li>
            <li>University of Nairobi registration number</li>
            <li>Academic year and program information</li>
          </ul>

          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">1.2 Academic and Educational Data</h3>
          <p class="text-gray-700 mb-4">
            In addition to personal information, we collect educational data necessary for legal education compliance:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Course enrollment and completion records</li>
            <li>Academic performance and assessment data</li>
            <li>Attendance records and participation metrics</li>
            <li>Research activities and academic projects</li>
            <li>Professional development and continuing education records</li>
          </ul>

          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">1.3 Usage Information</h3>
          <p class="text-gray-700 mb-4">
            We automatically collect information about how you use our platform, including:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Pages visited and time spent on each page</li>
            <li>Course materials accessed and downloaded</li>
            <li>Lecture recordings viewed</li>
            <li>Device information and browser type</li>
            <li>IP address and general location data</li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Kenya Data Protection Act Compliance</h2>
          
          <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <h3 class="text-lg font-semibold text-green-900 mb-4">Data Protection Principles</h3>
            <p class="text-green-800 text-sm mb-4">
              In accordance with the Kenya Data Protection Act, 2019, we adhere to the following data protection principles:
            </p>
            <ul class="list-disc pl-6 text-green-800 text-sm space-y-2">
              <li><strong>Lawfulness, Fairness, and Transparency:</strong> We process your data lawfully, fairly, and in a transparent manner</li>
              <li><strong>Purpose Limitation:</strong> We collect data for specified, explicit, and legitimate purposes</li>
              <li><strong>Data Minimisation:</strong> We collect only data that is adequate, relevant, and limited to what is necessary</li>
              <li><strong>Accuracy:</strong> We keep personal data accurate and up to date</li>
              <li><strong>Storage Limitation:</strong> We retain data only for as long as necessary for the purposes for which it was collected</li>
              <li><strong>Integrity and Confidentiality:</strong> We process data in a manner that ensures appropriate security</li>
            </ul>
          </div>

          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Legal Basis for Processing</h3>
          <p class="text-gray-700 mb-4">
            Under the Kenya Data Protection Act, we process your personal data based on the following legal grounds:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Consent:</strong> You have given clear consent for us to process your personal data for specific purposes</li>
            <li><strong>Contract Performance:</strong> Processing is necessary for the performance of a contract (providing educational services)</li>
            <li><strong>Legal Obligation:</strong> Processing is necessary for compliance with legal obligations (educational reporting requirements)</li>
            <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests in providing educational services (subject to your rights and freedoms)</li>
          </ul>

          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Data Protection Officer</h3>
          <p class="text-gray-700 mb-4">
            RiverLearn Inc. has appointed a Data Protection Officer (DPO) to ensure compliance with the Kenya Data Protection Act. You can contact our DPO at:
          </p>
          <div class="bg-gray-100 rounded-lg p-4 mb-4">
            <p class="text-gray-700"><strong>Email:</strong> dpo@riverlearn.co.ke</p>
            <p class="text-gray-700"><strong>Purpose:</strong> Data protection inquiries, complaints, and rights requests</p>
          </div>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
          <p class="text-gray-700 mb-4">
            We use the information we collect to:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Provide and maintain the Course Organizer platform</li>
            <li>Verify your University of Nairobi student status</li>
            <li>Send you important notifications about your courses</li>
            <li>Personalize your learning experience</li>
            <li>Improve our platform and develop new features</li>
            <li>Ensure platform security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
          <p class="text-gray-700 mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>With University of Nairobi:</strong> We may share your registration status and academic information with the university for verification purposes</li>
            <li><strong>Council of Legal Education (CLE):</strong> We may share academic records, course completion data, and educational progress information with the CLE for accreditation, quality assurance, and compliance with legal education standards as required by the Legal Education (Accreditation and Quality Assurance) Regulations</li>
            <li><strong>Legal Education Compliance:</strong> We may share information necessary for compliance with Kenya's legal education framework, including institutional reports and quality assurance documentation</li>
            <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who help us operate our platform (e.g., hosting, SMS services)</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred to the new entity</li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
          <p class="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication systems</li>
            <li>Secure hosting infrastructure</li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your Rights Under Kenya Data Protection Act</h2>
          
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 class="text-lg font-semibold text-blue-900 mb-4">Data Subject Rights</h3>
            <p class="text-blue-800 text-sm mb-4">
              Under the Kenya Data Protection Act, 2019, you have the following fundamental rights as a data subject:
            </p>
            <ul class="list-disc pl-6 text-blue-800 text-sm space-y-2">
              <li><strong>Right to be Informed:</strong> Right to know what personal data is being processed and why</li>
              <li><strong>Right of Access:</strong> Right to obtain confirmation and access to your personal data</li>
              <li><strong>Right to Rectification:</strong> Right to correct inaccurate or incomplete personal data</li>
              <li><strong>Right to Erasure:</strong> Right to request deletion of your personal data under certain circumstances</li>
              <li><strong>Right to Restrict Processing:</strong> Right to limit how your personal data is processed</li>
              <li><strong>Right to Data Portability:</strong> Right to receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Right to object to processing of your personal data</li>
              <li><strong>Rights Related to Automated Decision Making:</strong> Rights regarding automated processing and profiling</li>
            </ul>
          </div>

          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 How to Exercise Your Rights</h3>
          <p class="text-gray-700 mb-4">
            To exercise any of these rights, you can:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Contact our DPO:</strong> Email dpo@riverlearn.co.ke with your request</li>
            <li><strong>Use our platform:</strong> Access your account settings to update certain information</li>
            <li><strong>Write to us:</strong> Send a formal request to our registered address in Nairobi, Kenya</li>
          </ul>

          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Response Time and Verification</h3>
          <p class="text-gray-700 mb-4">
            In accordance with the Kenya Data Protection Act:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>We will respond to your requests within <strong>30 days</strong> of receipt</li>
            <li>We may require identity verification before processing your request</li>
            <li>We will provide reasons if we cannot fulfill your request</li>
            <li>You have the right to lodge a complaint with the Data Commissioner if unsatisfied</li>
          </ul>

          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Right to Lodge a Complaint</h3>
          <p class="text-gray-700 mb-4">
            If you believe we have not handled your personal data in accordance with the Kenya Data Protection Act, you have the right to lodge a complaint with:
          </p>
          <div class="bg-gray-100 rounded-lg p-4 mb-4">
            <p class="text-gray-700"><strong>Office of the Data Protection Commissioner</strong></p>
            <p class="text-gray-700">Kenya</p>
            <p class="text-gray-700">Website: <a href="https://www.odpc.go.ke" target="_blank" class="text-blue-600 hover:underline">www.odpc.go.ke</a></p>
          </div>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Processing in Kenya</h2>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 class="text-lg font-semibold text-yellow-900 mb-4">🇰🇪 Kenya-Based Data Processing</h3>
            <p class="text-yellow-800 text-sm mb-4">
              RiverLearn Inc. is incorporated in Kenya and processes personal data in accordance with Kenyan law:
            </p>
            <ul class="list-disc pl-6 text-yellow-800 text-sm space-y-2">
              <li><strong>Local Processing:</strong> Personal data is primarily processed within Kenya's jurisdiction</li>
              <li><strong>Data Localization:</strong> We maintain data processing facilities in Kenya where possible</li>
              <li><strong>Regulatory Compliance:</strong> All processing activities comply with Kenya Data Protection Act requirements</li>
              <li><strong>Cross-Border Transfers:</strong> Any international data transfers are subject to adequate protection measures</li>
              <li><strong>Local Oversight:</strong> Our operations are subject to oversight by the Office of the Data Protection Commissioner</li>
            </ul>
          </div>

          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 Sensitive Personal Data</h3>
          <p class="text-gray-700 mb-4">
            Under the Kenya Data Protection Act, we may process sensitive personal data (including academic records) only when:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>You have given explicit consent</li>
            <li>Processing is necessary for educational purposes</li>
            <li>Processing is required by law or for compliance with educational regulations</li>
            <li>Processing is necessary for the establishment, exercise, or defense of legal claims</li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Technology Integration in Legal Education</h2>
          <p class="text-gray-700 mb-4">
            Our platform supports the integration of technology in legal education as outlined in Kenya's evolving legal education framework:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Digital Learning Environment:</strong> We provide a secure digital platform for legal education delivery, supporting both traditional and technology-enhanced learning methods</li>
            <li><strong>Research and Technology Law:</strong> Our platform facilitates research in technology law and legal research methodologies, supporting the integration of technology law into Kenya's legal curriculum</li>
            <li><strong>Data-Driven Education:</strong> We collect and analyze educational data to improve learning outcomes while maintaining strict privacy protections</li>
            <li><strong>Accessibility and Inclusion:</strong> Our technology solutions ensure equitable access to legal education resources for all students</li>
            <li><strong>Future-Ready Legal Education:</strong> We support the preparation of law students for the digital transformation of the legal profession</li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Council of Legal Education (CLE) Compliance</h2>
          <p class="text-gray-700 mb-4">
            As a platform supporting legal education in Kenya, we comply with the Council of Legal Education requirements and the evolving landscape of legal education technology integration:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Accreditation Support:</strong> We assist in maintaining compliance with CLE accreditation standards by providing secure access to academic records and educational progress data</li>
            <li><strong>Quality Assurance:</strong> We support institutional quality assurance processes by enabling data collection and reporting required under the Legal Education (Accreditation and Quality Assurance) Regulations</li>
            <li><strong>Regulatory Compliance:</strong> Our platform ensures compliance with all applicable CLE regulations and guidelines for legal education delivery</li>
            <li><strong>Educational Standards:</strong> We maintain data practices that align with CLE standards for legal education delivery and assessment</li>
            <li><strong>Research and Development:</strong> We support legal education research initiatives while maintaining strict data protection standards</li>
            <li><strong>Institutional Reporting:</strong> We facilitate the submission of required institutional reports and documentation to the CLE</li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Data Retention</h2>
          <p class="text-gray-700 mb-4">
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy. Specifically:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Account information is retained while your account is active</li>
            <li>Usage data is typically retained for up to 2 years for analytics purposes</li>
            <li>Academic records are retained in accordance with CLE requirements and educational standards</li>
            <li>Legal education compliance data may be retained longer to meet regulatory requirements</li>
            <li>Some information may be retained longer if required by law or CLE regulations</li>
          </ul>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Cookies and Tracking</h2>
          <p class="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>Remember your login status and preferences</li>
            <li>Analyze platform usage and performance</li>
            <li>Provide personalized content and features</li>
          </ul>
          <p class="text-gray-700 mb-4">
            You can control cookie settings through your browser, but disabling cookies may affect platform functionality.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Third-Party Services</h2>
          <p class="text-gray-700 mb-4">
            Our platform may integrate with third-party services, including:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li>SMS providers for notifications</li>
            <li>Video hosting services for lecture recordings</li>
            <li>Analytics services for platform improvement</li>
          </ul>
          <p class="text-gray-700 mb-4">
            These services have their own privacy policies, and we encourage you to review them.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. International Data Transfers</h2>
          <p class="text-gray-700 mb-4">
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Children's Privacy</h2>
          <p class="text-gray-700 mb-4">
            Course Organizer is designed for university students and is not intended for children under 16. We do not knowingly collect personal information from children under 16.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Changes to This Privacy Policy</h2>
          <p class="text-gray-700 mb-4">
            We may update this privacy policy from time to time. We will notify you of any material changes by posting the new privacy policy on this page and updating the "Last updated" date. Your continued use of the platform after such changes constitutes acceptance of the updated policy.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Contact Information</h2>
          <div class="bg-gray-50 rounded-2xl p-8">
            <p class="text-gray-700 mb-4">
              If you have any questions about this privacy policy or our data practices, please contact us:
            </p>
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">General Inquiries</h3>
                <div class="space-y-2 text-gray-700">
                  <p><strong>Company:</strong> RiverLearn Inc.</p>
                  <p><strong>Email:</strong> privacy@riverlearn.co.ke</p>
                  <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/company/18902293/" target="_blank" class="text-gray-900 hover:text-gray-700 underline">RiverLearn Inc. on LinkedIn</a></p>
                  <p><strong>Address:</strong> Nairobi, Kenya</p>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Data Protection Inquiries</h3>
                <div class="space-y-2 text-gray-700">
                  <p><strong>Data Protection Officer:</strong></p>
                  <p><strong>Email:</strong> dpo@riverlearn.co.ke</p>
                  <p><strong>Purpose:</strong> Data protection rights, complaints, and compliance</p>
                  <p><strong>Response Time:</strong> Within 30 days as per Kenya Data Protection Act</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-900 text-white py-12">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <p class="text-gray-400">
            © 2025 RiverLearn Inc. - Course Organizer. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PrivacyPolicyComponent {}
