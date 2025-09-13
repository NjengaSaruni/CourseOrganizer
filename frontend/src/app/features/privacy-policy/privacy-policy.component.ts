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
        <div class="max-w-6xl mx-auto px-6">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <div class="flex-shrink-0 flex items-center space-x-3">
                <img src="/courseorganizerlogo.png" 
                     alt="Course Organizer Logo" 
                     class="h-10 w-auto">
                <h1 class="text-xl font-semibold text-gray-900">Course Organizer</h1>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <a routerLink="/" 
                 class="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Home
              </a>
              <a routerLink="/login" 
                 class="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
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
            <p class="text-lg text-gray-700">
              This privacy policy describes how RiverLearn Inc. ("we," "our," or "us") collects, uses, and protects your information when you use the Course Organizer platform.
            </p>
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

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
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

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
          <p class="text-gray-700 mb-4">
            You have the following rights regarding your personal information:
          </p>
          <ul class="list-disc pl-6 text-gray-700 mb-4">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal and operational requirements)</li>
            <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
            <li><strong>Objection:</strong> Object to certain processing of your personal information</li>
          </ul>
          <p class="text-gray-700 mb-4">
            To exercise these rights, please contact us at the information provided below.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Technology Integration in Legal Education</h2>
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

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Council of Legal Education (CLE) Compliance</h2>
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

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Data Retention</h2>
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

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Cookies and Tracking</h2>
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

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Third-Party Services</h2>
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

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. International Data Transfers</h2>
          <p class="text-gray-700 mb-4">
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Children's Privacy</h2>
          <p class="text-gray-700 mb-4">
            Course Organizer is designed for university students and is not intended for children under 16. We do not knowingly collect personal information from children under 16.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Changes to This Privacy Policy</h2>
          <p class="text-gray-700 mb-4">
            We may update this privacy policy from time to time. We will notify you of any material changes by posting the new privacy policy on this page and updating the "Last updated" date. Your continued use of the platform after such changes constitutes acceptance of the updated policy.
          </p>

          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Contact Information</h2>
          <div class="bg-gray-50 rounded-2xl p-8">
            <p class="text-gray-700 mb-4">
              If you have any questions about this privacy policy or our data practices, please contact us:
            </p>
            <div class="space-y-2 text-gray-700">
              <p><strong>Company:</strong> RiverLearn Inc.</p>
              <p><strong>Email:</strong> privacy@riverlearn.com</p>
              <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/company/18902293/" target="_blank" class="text-gray-900 hover:text-gray-700 underline">RiverLearn Inc. on LinkedIn</a></p>
              <p><strong>Address:</strong> Nairobi, Kenya</p>
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
