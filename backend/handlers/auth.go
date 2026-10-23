package handlers

import (
	"net/http"
	"time"

	"phocuong/config"
	"phocuong/middleware"
	"phocuong/models"
	"phocuong/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone"`
	Password string `json:"password" binding:"required,min=6"`
	OTP      string `json:"otp" binding:"required,len=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RequestOTPInput struct {
	Email string `json:"email" binding:"required,email"`
}

type VerifyOTPInput struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required,len=6"`
}

func RequestOTP(c *gin.Context) {
	var input RequestOTPInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra email đã tồn tại chưa
	var existing models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email đã được sử dụng"})
		return
	}

	otpCode := services.GenerateOTPCode()
	otpHash, err := services.HashOTP(otpCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không tạo được OTP"})
		return
	}

	// Xóa OTP cũ liên quan tới email này
	config.DB.Where("email = ? AND purpose = ?", input.Email, "register").Delete(&models.EmailOTP{})

	otpRecord := models.EmailOTP{
		Email:     input.Email,
		CodeHash:  otpHash,
		Purpose:   "register",
		Used:      false,
		ExpiresAt: services.OTPExpiryInMinutes(5),
	}

	if err := config.DB.Create(&otpRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không lưu được OTP"})
		return
	}

	if err := services.SendOTPEmail(input.Email, otpCode); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không gửi được email OTP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "OTP đã được gửi đến email",
	})
}

func VerifyOTP(c *gin.Context) {
	var input VerifyOTPInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var otpRecord models.EmailOTP
	if err := config.DB.Where("email = ? AND purpose = ? AND used = false", input.Email, "register").
		Order("created_at DESC").
		First(&otpRecord).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OTP không hợp lệ hoặc đã hết hạn"})
		return
	}

	if time.Now().After(otpRecord.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OTP đã hết hạn"})
		return
	}

	if !services.VerifyOTPHash(input.Code, otpRecord.CodeHash) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OTP không đúng"})
		return
	}

	config.DB.Model(&otpRecord).Update("used", true)

	c.JSON(http.StatusOK, gin.H{
		"message": "OTP hợp lệ",
	})
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var otpRecord models.EmailOTP
	if err := config.DB.Where("email = ? AND purpose = ? AND used = true", input.Email, "register").
		Order("created_at DESC").
		First(&otpRecord).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bạn chưa xác thực email"})
		return
	}

	if !services.VerifyOTPHash(input.OTP, otpRecord.CodeHash) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OTP không hợp lệ"})
		return
	}

	var existing models.User
	if err := config.DB.Where("email = ?", input.Email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email đã được sử dụng"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi server"})
		return
	}

	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Phone:    input.Phone,
		Password: string(hashed),
		Role:     models.RoleCustomer,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo tài khoản"})
		return
	}

	token, err := generateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi tạo token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  user,
	})
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Email hoặc mật khẩu không đúng"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi server"})
		return
	}

	if !user.Active {
		c.JSON(http.StatusForbidden, gin.H{"error": "Tài khoản đã bị khóa"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email hoặc mật khẩu không đúng"})
		return
	}

	token, err := generateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi tạo token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})
}

func Me(c *gin.Context) {
	userID := c.GetUint("user_id")
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	var input struct {
		Name  string `json:"name"`
		Phone string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Model(&models.User{}).Where("id = ?", userID).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể cập nhật"})
		return
	}

	var user models.User
	config.DB.First(&user, userID)
	c.JSON(http.StatusOK, user)
}

func ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")
	var input struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.OldPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Mật khẩu cũ không đúng"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi server"})
		return
	}

	if err := config.DB.Model(&user).Update("password", string(hashed)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể đổi mật khẩu"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đổi mật khẩu thành công"})
}

func generateToken(user *models.User) (string, error) {
	claims := middleware.Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(middleware.GetJWTSecret())
}
