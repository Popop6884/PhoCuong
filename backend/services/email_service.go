package services

import (
	"fmt"
)

func SendOTPEmail(email string, otp string) error {
	// Đây chỉ là demo. Production nên dùng Resend/SendGrid/Mailgun/SMTP thật.
	// Ví dụ:
	// fmt.Printf("Gửi email tới %s với OTP %s\n", email, otp)

	fmt.Println("=== OTP EMAIL DEMO ===")
	fmt.Printf("To: %s\n", email)
	fmt.Printf("OTP: %s\n", otp)
	fmt.Println("======================")

	return nil
}
