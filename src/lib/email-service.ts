import nodemailer from "nodemailer";

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailData {
  to: string;
  studentName: string;
  courseTitle?: string;
  instructorName?: string;
  loginUrl?: string;
  courseUrl?: string;
  dashboardUrl?: string;
  unsubscribeUrl?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Welcome email for new users
  async sendWelcomeEmail(data: EmailData): Promise<void> {
    const template = this.getWelcomeTemplate(data);
    await this.sendEmail(data.to, template);
  }

  // Course enrollment confirmation
  async sendEnrollmentConfirmation(data: EmailData): Promise<void> {
    const template = this.getEnrollmentTemplate(data);
    await this.sendEmail(data.to, template);
  }

  // Course completion congratulations
  async sendCompletionCertificate(data: EmailData): Promise<void> {
    const template = this.getCompletionTemplate(data);
    await this.sendEmail(data.to, template);
  }

  // Progress reminder
  async sendProgressReminder(data: EmailData): Promise<void> {
    const template = this.getProgressReminderTemplate(data);
    await this.sendEmail(data.to, template);
  }

  // New lesson notification
  async sendNewLessonNotification(data: EmailData): Promise<void> {
    const template = this.getNewLessonTemplate(data);
    await this.sendEmail(data.to, template);
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Email service not configured. Skipping email send.");
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"The Academy" <${process.env.SMTP_USER}>`,
        to: to,
        subject: template.subject,
        text: template.textContent,
        html: template.htmlContent,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  private getWelcomeTemplate(data: EmailData): EmailTemplate {
    return {
      subject: "Welcome to The Academy! 🎓",
      textContent: `
Hi ${data.studentName},

Welcome to The Academy! We're thrilled to have you join our learning community.

Your account has been created successfully. You can now:
- Browse our course catalog
- Enroll in courses that interest you
- Track your learning progress
- Earn completion certificates

Get started: ${data.loginUrl}

If you have any questions, don't hesitate to reach out to our support team.

Happy learning!
The Academy Team
      `.trim(),
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to The Academy</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Welcome to The Academy!</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1e40af; margin-top: 0;">Hi ${data.studentName},</h2>
    
    <p>We're thrilled to have you join our learning community! Your account has been created successfully.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
      <h3 style="margin-top: 0; color: #1e40af;">What you can do now:</h3>
      <ul style="padding-left: 20px;">
        <li>📚 Browse our comprehensive course catalog</li>
        <li>✅ Enroll in courses that interest you</li>
        <li>📊 Track your learning progress in real-time</li>
        <li>🏆 Earn completion certificates</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.loginUrl}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Started</a>
    </div>
    
    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
      If you have any questions, don't hesitate to reach out to our support team. We're here to help!
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="text-align: center; color: #64748b; font-size: 12px;">
      Happy learning!<br>
      <strong>The Academy Team</strong>
    </p>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  private getEnrollmentTemplate(data: EmailData): EmailTemplate {
    return {
      subject: `Welcome to "${data.courseTitle}"! 🚀`,
      textContent: `
Hi ${data.studentName},

Congratulations! You've successfully enrolled in "${data.courseTitle}".

Course Details:
- Instructor: ${data.instructorName}
- Access: Immediate
- Certificate: Available upon completion

You can start learning right away by visiting your course dashboard.

Start Learning: ${data.courseUrl}

We're excited to see your progress!

Best regards,
The Academy Team
      `.trim(),
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Course Enrollment Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚀 Enrollment Confirmed!</h1>
  </div>
  
  <div style="background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #059669; margin-top: 0;">Hi ${data.studentName},</h2>
    
    <p>Congratulations! You've successfully enrolled in <strong>"${data.courseTitle}"</strong>.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <h3 style="margin-top: 0; color: #059669;">Course Details:</h3>
      <ul style="padding-left: 20px; list-style: none;">
        <li style="margin: 10px 0;">👨‍🏫 <strong>Instructor:</strong> ${data.instructorName}</li>
        <li style="margin: 10px 0;">⚡ <strong>Access:</strong> Immediate</li>
        <li style="margin: 10px 0;">🏆 <strong>Certificate:</strong> Available upon completion</li>
      </ul>
    </div>
    
    <p>You can start learning right away by visiting your course dashboard.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.courseUrl}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Learning</a>
    </div>
    
    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
      We're excited to see your progress! Remember, consistent learning leads to great results.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="text-align: center; color: #64748b; font-size: 12px;">
      Best regards,<br>
      <strong>The Academy Team</strong>
    </p>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  private getCompletionTemplate(data: EmailData): EmailTemplate {
    return {
      subject: `🎉 Congratulations! You've completed "${data.courseTitle}"`,
      textContent: `
Hi ${data.studentName},

Congratulations on completing "${data.courseTitle}"! 🎉

You've successfully finished all lessons and assessments. This is a significant achievement that demonstrates your dedication to learning.

Your completion certificate is now available for download in your student dashboard.

Download Certificate: ${data.dashboardUrl}/certificates

What's next?
- Share your achievement on social media
- Add the certificate to your professional profile
- Explore more courses to continue your learning journey

Keep up the fantastic work!

Best regards,
The Academy Team
      `.trim(),
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Course Completion Congratulations</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
    <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Course Completed Successfully</p>
  </div>
  
  <div style="background: #fffbeb; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #d97706; margin-top: 0;">Hi ${data.studentName},</h2>
    
    <p>Congratulations on completing <strong>"${data.courseTitle}"</strong>! 🎉</p>
    
    <p>You've successfully finished all lessons and assessments. This is a significant achievement that demonstrates your dedication to learning and personal growth.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <h3 style="margin-top: 0; color: #d97706;">🏆 Your Certificate is Ready!</h3>
      <p style="margin-bottom: 0;">Your completion certificate is now available for download in your student dashboard.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.dashboardUrl}/certificates" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Download Certificate</a>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #d97706;">What's next?</h3>
      <ul style="padding-left: 20px;">
        <li>📱 Share your achievement on social media</li>
        <li>💼 Add the certificate to your professional profile</li>
        <li>📚 Explore more courses to continue your learning journey</li>
      </ul>
    </div>
    
    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
      Keep up the fantastic work! Continuous learning is the key to success.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="text-align: center; color: #64748b; font-size: 12px;">
      Best regards,<br>
      <strong>The Academy Team</strong>
    </p>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  private getProgressReminderTemplate(data: EmailData): EmailTemplate {
    return {
      subject: `Continue your learning journey in "${data.courseTitle}" 📚`,
      textContent: `
Hi ${data.studentName},

We noticed you haven't continued your progress in "${data.courseTitle}" for a while. 

Don't lose momentum! Even 15 minutes of learning can make a big difference in achieving your goals.

Continue Learning: ${data.courseUrl}

Your progress is important to us, and we're here to support you every step of the way.

Best regards,
The Academy Team
      `.trim(),
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Continue Your Learning</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📚 Continue Learning</h1>
  </div>
  
  <div style="background: #faf5ff; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #7c3aed; margin-top: 0;">Hi ${data.studentName},</h2>
    
    <p>We noticed you haven't continued your progress in <strong>"${data.courseTitle}"</strong> for a while.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
      <p style="margin: 0; font-size: 16px;">💡 <strong>Tip:</strong> Even 15 minutes of learning can make a big difference in achieving your goals!</p>
    </div>
    
    <p>Don't lose momentum! We're here to support you every step of the way.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.courseUrl}" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Continue Learning</a>
    </div>
    
    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
      Your progress is important to us. Remember, every expert was once a beginner!
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="text-align: center; color: #64748b; font-size: 12px;">
      Best regards,<br>
      <strong>The Academy Team</strong>
    </p>
  </div>
</body>
</html>
      `.trim(),
    };
  }

  private getNewLessonTemplate(data: EmailData): EmailTemplate {
    return {
      subject: `New lesson available in "${data.courseTitle}" ✨`,
      textContent: `
Hi ${data.studentName},

Great news! A new lesson has been added to "${data.courseTitle}" by ${data.instructorName}.

This new content will help you dive deeper into the subject and gain more valuable insights.

Check it out: ${data.courseUrl}

Don't miss out on this opportunity to expand your knowledge!

Best regards,
The Academy Team
      `.trim(),
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>New Lesson Available</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✨ New Lesson Available!</h1>
  </div>
  
  <div style="background: #f0fdff; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #0891b2; margin-top: 0;">Hi ${data.studentName},</h2>
    
    <p>Great news! A new lesson has been added to <strong>"${data.courseTitle}"</strong> by ${data.instructorName}.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
      <p style="margin: 0;">This new content will help you dive deeper into the subject and gain more valuable insights.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.courseUrl}" style="background: #06b6d4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Check it out</a>
    </div>
    
    <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
      Don't miss out on this opportunity to expand your knowledge!
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="text-align: center; color: #64748b; font-size: 12px;">
      Best regards,<br>
      <strong>The Academy Team</strong>
    </p>
  </div>
</body>
</html>
      `.trim(),
    };
  }
}

// Singleton instance
export const emailService = new EmailService();
