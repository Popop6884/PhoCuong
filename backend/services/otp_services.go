package services

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func GenerateOTPCode() string {
	n, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return "123456"
	}
	return fmt.Sprintf("%06d", 100000+int(n.Int64()))
}

func HashOTP(code string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(code), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func VerifyOTPHash(inputCode string, hashedCode string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedCode), []byte(inputCode))
	return err == nil
}

func OTPExpiryInMinutes(mins int) time.Time {
	return time.Now().Add(time.Duration(mins) * time.Minute)
}
