"""
Parental Verification Service - DPDP Act 2023 Section 9.1 Compliance
Implements verifiable consent mechanism for processing children's personal data
"""
import random
import string
from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone


class ParentalVerificationService:
    """Handles verification that consent provider is indeed parent/guardian"""

    @staticmethod
    def generate_otp(length=6):
        """Generate numeric OTP for verification"""
        return ''.join(random.choices(string.digits, k=length))

    @staticmethod
    def send_email_otp(parent_user, student):
        """
        Send OTP via email for parental consent verification

        Args:
            parent_user: User object (parent/guardian)
            student: Student object

        Returns:
            bool: True if OTP sent successfully
        """
        otp = ParentalVerificationService.generate_otp()

        # Store OTP with 5-minute expiry in cache
        cache_key = f"consent_otp_email_{parent_user.id}_{student.id}"
        cache.set(cache_key, otp, timeout=300)  # 5 minutes

        # Email content
        subject = f"Parental Consent Verification - {student.full_name}"
        message = f"""
Dear Parent/Guardian,

You are granting consent for processing personal data of {student.full_name}
(Admission No: {student.admission_number}).

Your verification code is: {otp}

This code will expire in 5 minutes.

If you did not request this verification, please contact the school immediately.

This is an automated message required for DPDP Act 2023 compliance.

Regards,
School Administration
{student.tenant.name if hasattr(student, 'tenant') else ''}
        """

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[parent_user.email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            # Log error but don't expose to user
            print(f"[ERROR] Failed to send consent verification email: {str(e)}")
            return False

    @staticmethod
    def send_sms_otp(parent_user, student):
        """
        Send OTP via SMS for parental consent verification

        Args:
            parent_user: User object (parent/guardian)
            student: Student object

        Returns:
            bool: True if OTP sent successfully
        """
        otp = ParentalVerificationService.generate_otp()

        # Store OTP with 5-minute expiry
        cache_key = f"consent_otp_sms_{parent_user.id}_{student.id}"
        cache.set(cache_key, otp, timeout=300)

        # SMS message
        message = f"Parental consent verification OTP for {student.first_name}: {otp}. Valid for 5 minutes. - {student.tenant.name if hasattr(student, 'tenant') else 'School'}"

        try:
            # Import SMS service (created in Phase 7 of main implementation)
            from apps.communication.sms_service import send_sms

            send_sms(parent_user.phone, message)
            return True
        except ImportError:
            # SMS service not yet implemented - fallback to email
            print("[WARNING] SMS service not available, falling back to email OTP")
            return ParentalVerificationService.send_email_otp(parent_user, student)
        except Exception as e:
            print(f"[ERROR] Failed to send consent verification SMS: {str(e)}")
            return False

    @staticmethod
    def verify_otp(parent_user, student, otp, method='email'):
        """
        Verify OTP provided by parent

        Args:
            parent_user: User object
            student: Student object
            otp: OTP string provided by parent
            method: 'email' or 'sms'

        Returns:
            tuple: (success: bool, message: str)
        """
        cache_key = f"consent_otp_{method}_{parent_user.id}_{student.id}"
        stored_otp = cache.get(cache_key)

        if not stored_otp:
            return False, "OTP expired or not found. Please request a new code."

        if stored_otp != otp:
            return False, "Invalid OTP. Please check and try again."

        # Clear OTP after successful verification
        cache.delete(cache_key)
        return True, "Verification successful"

    @staticmethod
    def verify_using_existing_identity(parent_user):
        """
        Verify parent using identity details already on file
        This method can be used if parent has previously verified email/phone

        Args:
            parent_user: User object

        Returns:
            tuple: (success: bool, message: str)
        """
        # Check if parent has verified email
        if not hasattr(parent_user, 'email_verified'):
            return False, "Parent email verification status not found in system"

        if not parent_user.email_verified:
            return False, "Parent email not verified. Please use OTP verification."

        # Check if parent has verified phone (if available)
        if hasattr(parent_user, 'phone_verified') and parent_user.phone:
            if not parent_user.phone_verified:
                return False, "Parent phone not verified. Please use OTP verification."

        return True, "Verified using existing identity on file"

    @staticmethod
    def verify_using_aadhaar_virtual_token(parent_user, virtual_token):
        """
        Verify parent using Aadhaar Virtual Token (future implementation)

        This is a placeholder for integration with UIDAI's Aadhaar authentication
        when the API becomes available for educational institutions.

        Args:
            parent_user: User object
            virtual_token: Aadhaar Virtual ID token

        Returns:
            tuple: (success: bool, message: str)
        """
        # TODO: Integrate with UIDAI Aadhaar authentication API
        # For now, return not implemented
        return False, "Aadhaar Virtual Token verification not yet implemented. Please use OTP verification."

    @staticmethod
    def manual_verification_by_school(parent_user, student, verified_by_user, verification_notes):
        """
        Manual verification by school staff when parent is physically present

        Args:
            parent_user: User object (parent)
            student: Student object
            verified_by_user: User object (staff member verifying)
            verification_notes: str (notes about verification process)

        Returns:
            tuple: (success: bool, message: str, verification_data: dict)
        """
        verification_data = {
            'verified_by': verified_by_user.get_full_name(),
            'verified_by_id': verified_by_user.id,
            'verification_notes': verification_notes,
            'verification_timestamp': str(timezone.now()),
            'verification_type': 'MANUAL_IN_PERSON',
        }

        return True, "Manual verification completed", verification_data
