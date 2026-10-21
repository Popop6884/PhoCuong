package config

import (
	"github.com/joho/godotenv"
)

type Config struct {
	Port      string
	DBHost    string
	DBPort    string
	DBUser    string
	DBPass    string
	DBName    string
	JWTSecret string
	DataDir   string
}

// Biến toàn cục để toàn bộ project dùng chung
var AppConfig *Config

// LoadConfig đọc file .env và nạp các giá trị mặc định
func LoadConfig() {
	// Nạp file .env nếu có
	godotenv.Load()

	AppConfig = &Config{
		Port:      getEnv("PORT", "8080"),
		DBHost:    getEnv("DB_HOST", "localhost"),
		DBPort:    getEnv("DB_PORT", "3306"),
		DBUser:    getEnv("DB_USER", "root"),
		DBPass:    getEnv("DB_PASSWORD", ""),
		DBName:    getEnv("DB_NAME", "phocuong"),
		JWTSecret: getEnv("JWT_SECRET", "mysecretkey"),
		DataDir:   getEnv("DATA_DIR", "../PhoCuongData"), // Default nếu quên set trong .env
	}
}
