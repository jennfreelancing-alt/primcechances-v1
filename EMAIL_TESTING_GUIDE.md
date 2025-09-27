# Email Testing Guide

## 🧪 Mock Email Testing

The email system is currently configured to use **MOCK MODE** for testing purposes. This simulates email sending without actual API calls, avoiding CORS issues during development.

### How Mock Mode Works

1. **Simulated Sending**: Emails are simulated without actual API calls
2. **Console Logging**: Email details are logged to browser console
3. **Test Mode Indicator**: All emails are prefixed with `[TEST MODE]` in the subject
4. **Visual Indicators**: Mock mode status is shown in the admin dashboard
5. **No CORS Issues**: Avoids browser CORS restrictions during development

### Email Types Available for Testing

1. **Welcome Email** - Sent to new users upon registration
2. **Password Reset Email** - Sent when users request password reset  
3. **Opportunity Notification** - Sent when new job opportunities match user profile
4. **Application Confirmation** - Sent when user submits job application
5. **Admin Notification** - Sent to admins for system alerts
6. **Bulk Emails** - Mass communication to users

### How to Test Emails

#### Option 1: Use the Email Test Suite
1. Go to Admin Dashboard → Email Manager → Test Suite tab
2. Click "Run All Email Tests" to send all email types
3. Or test individual email types using the individual test buttons

#### Option 2: Test Individual Email Types
1. Go to Admin Dashboard → Email Manager → Test Email tab
2. Fill in the test data and send individual emails

#### Option 3: Test Through Normal App Flow
1. **Welcome Email**: Sign up a new user account
2. **Password Reset**: Use the "Forgot Password" feature
3. **Application Confirmation**: Submit a job application
4. **Opportunity Notification**: Create a new opportunity (if you have admin access)

### Test Mode Configuration

The test mode is controlled by `src/utils/emailTestConfig.ts`:

```typescript
export const TEST_EMAIL_CONFIG = {
  enabled: true, // Set to false to disable test mode
  testEmail: 'jenn.freelancing@gmail.com',
  originalEmailField: 'original_email'
};
```

### Disabling Test Mode

To disable test mode and send emails to actual recipients:

1. Open `src/utils/emailTestConfig.ts`
2. Set `enabled: false`
3. All emails will then be sent to their intended recipients

### Email Templates

All email templates are professionally designed with:
- ✅ Mobile responsive design
- ✅ PrimeChances branding
- ✅ Professional HTML layout
- ✅ Clear call-to-action buttons
- ✅ Proper email headers and footers

### Monitoring Email Delivery

- **Browser Console**: Check the browser console for email simulation logs
- **Mock Message IDs**: Each simulated email gets a unique mock message ID
- **Test Mode Indicators**: All emails show `[TEST MODE]` in console logs
- **Email Templates**: Full HTML templates are generated and logged

### Troubleshooting

If emails are not being simulated:

1. **Check Browser Console**: Look for email simulation logs
2. **Check Test Mode**: Verify test mode is enabled in `emailTestConfig.ts`
3. **Check Mock Service**: Ensure mock email service is working
4. **Check Network Tab**: Verify no CORS errors in browser dev tools

### Production Deployment

Before deploying to production:

1. **Replace Mock Service**: Update `resendService.ts` to use real Resend API calls
2. **Set Up Backend**: Implement proper backend email service to avoid CORS
3. **Test Real Emails**: Verify all email templates work with actual Resend API
4. **Monitor Delivery**: Set up email delivery monitoring in Resend dashboard

### Switching to Real Emails

To switch from mock mode to real email sending:

1. **Update Email Service**: Modify `src/services/resendService.ts` to use real Resend API
2. **Set Up Backend**: Create a backend service to handle Resend API calls
3. **Configure CORS**: Ensure proper CORS headers for production
4. **Test Thoroughly**: Verify all email types work in production environment

---

**Note**: This mock configuration allows you to test all email functionality without CORS issues or API costs during development. Real emails will be sent from your verified domain: **noreply@mail.primechances.com**.
