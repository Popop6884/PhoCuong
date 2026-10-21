package main

import (
	"log"
	"net/http"
	"os"

	"phocuong/config"
	"phocuong/handlers"
	"phocuong/middleware"
	"phocuong/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	godotenv.Load()

	config.ConnectDatabase()
	autoMigrate()
	seedData()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Public routes
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		api.GET("/menu", handlers.GetMenuItems)
		api.GET("/menu/:id", handlers.GetMenuItem)
		api.GET("/gallery", handlers.GetGallery)
		api.GET("/reviews", handlers.GetReviews)
		api.GET("/settings", handlers.GetSettings)
	}

	// Auth required routes
	protected := api.Group("/")
	protected.Use(middleware.AuthRequired())
	{
		protected.GET("/auth/me", handlers.Me)
		protected.PUT("/auth/profile", handlers.UpdateProfile)
		protected.PUT("/auth/password", handlers.ChangePassword)

		// Customer routes
		protected.POST("/reservations", handlers.CreateReservation)
		protected.GET("/reservations/my", handlers.GetMyReservations)
		protected.DELETE("/reservations/:id", handlers.CancelReservation)

		protected.POST("/orders", handlers.CreateOrder)
		protected.GET("/orders/my", handlers.GetMyOrders)

		protected.POST("/reviews", handlers.CreateReview)
	}

	// Staff + Admin routes
	staffAdmin := api.Group("/")
	staffAdmin.Use(middleware.AuthRequired(), middleware.RequireRole(models.RoleStaff, models.RoleAdmin))
	{
		staffAdmin.GET("/reservations", handlers.GetAllReservations)
		staffAdmin.PUT("/reservations/:id/status", handlers.UpdateReservationStatus)
		staffAdmin.GET("/orders", handlers.GetAllOrders)
		staffAdmin.PUT("/orders/:id/status", handlers.UpdateOrderStatus)
	}

	// Admin only routes
	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired(), middleware.RequireRole(models.RoleAdmin))
	{
		admin.GET("/dashboard", handlers.GetDashboardStats)
		admin.GET("/users", handlers.GetAllUsers)
		admin.PUT("/users/:id/role", handlers.UpdateUserRole)
		admin.PUT("/users/:id/toggle", handlers.ToggleUserActive)

		admin.POST("/menu", handlers.CreateMenuItem)
		admin.PUT("/menu/:id", handlers.UpdateMenuItem)
		admin.DELETE("/menu/:id", handlers.DeleteMenuItem)

		admin.POST("/gallery", handlers.CreateGalleryItem)
		admin.PUT("/gallery/:id", handlers.UpdateGalleryItem)
		admin.DELETE("/gallery/:id", handlers.DeleteGalleryItem)

		admin.GET("/reviews", handlers.GetAllReviews)
		admin.PUT("/reviews/:id/approve", handlers.ApproveReview)
		admin.PUT("/settings/:key", handlers.UpdateSetting)
	}

	// Serve React build in production
	if _, err := os.Stat("./static"); err == nil {
		r.NoRoute(func(c *gin.Context) {
			c.File("./static/index.html")
		})
		r.Static("/assets", "./static/assets")
	}

	// Phục vụ thư mục dữ liệu ngoài PhoCuongData
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		dataDir = "D:/PhoCuongData" // Mặc định tìm thư mục ngang hàng
	}
	r.Static("/uploads", dataDir)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "Phở Cường API"})
	})

	log.Printf("Server running on port %s", port)
	r.Run(":" + port)
}

func autoMigrate() {
	config.DB.AutoMigrate(
		&models.User{},
		&models.MenuItem{},
		&models.Reservation{},
		&models.Order{},
		&models.OrderItem{},
		&models.Gallery{},
		&models.Review{},
		&models.Setting{},
	)
}

func seedData() {
	var count int64
	config.DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}

	adminPass, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	staffPass, _ := bcrypt.GenerateFromPassword([]byte("staff123"), bcrypt.DefaultCost)
	customerPass, _ := bcrypt.GenerateFromPassword([]byte("customer123"), bcrypt.DefaultCost)

	users := []models.User{
		{Name: "Admin Phở Cường", Email: "admin@phocuong.vn", Password: string(adminPass), Role: models.RoleAdmin, Phone: "0912345678"},
		{Name: "Nhân viên Hùng", Email: "staff@phocuong.vn", Password: string(staffPass), Role: models.RoleStaff, Phone: "0923456789"},
		{Name: "Nguyễn Văn An", Email: "customer@phocuong.vn", Password: string(customerPass), Role: models.RoleCustomer, Phone: "0934567890"},
	}
	config.DB.Create(&users)

	menuItems := []models.MenuItem{
		{Name: "Phở Bò Tái", Description: "Phở bò tái thơm ngon, nước dùng ngọt từ xương hầm 8 tiếng", Price: 65000, Category: models.CategoryPho, Featured: true, Available: true, Image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400"},
		{Name: "Phở Bò Chín", Description: "Phở bò chín mềm tan, đậm đà hương vị truyền thống", Price: 65000, Category: models.CategoryPho, Featured: true, Available: true, Image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400"},
		{Name: "Phở Bò Tái Chín", Description: "Kết hợp tuyệt vời của bò tái và bò chín", Price: 70000, Category: models.CategoryPho, Featured: true, Available: true, Image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400"},
		{Name: "Phở Gà", Description: "Phở gà ta ngọt thanh, thơm mùi gừng nướng", Price: 60000, Category: models.CategoryPho, Available: true, Image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400"},
		{Name: "Phở Đặc Biệt", Description: "Phở đặc biệt với đầy đủ topping: tái, chín, gầu, gân, sách", Price: 90000, Category: models.CategoryPho, Featured: true, Available: true, Image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400"},
		{Name: "Cơm Tấm Sườn Bì Chả", Description: "Cơm tấm thơm dẻo, sườn nướng đậm đà, bì giòn, chả trứng", Price: 55000, Category: models.CategoryComTam, Available: true, Image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400"},
		{Name: "Trà Đá", Description: "Trà đá mát lạnh thanh nhiệt", Price: 10000, Category: models.CategoryDrink, Available: true},
		{Name: "Nước Ngọt", Description: "Coca Cola, Pepsi, Sprite", Price: 15000, Category: models.CategoryDrink, Available: true},
		{Name: "Trứng Thêm", Description: "Trứng gà thêm vào phở", Price: 10000, Category: models.CategoryTopping, Available: true},
		{Name: "Thịt Thêm", Description: "Thêm thịt bò vào phở", Price: 25000, Category: models.CategoryTopping, Available: true},
	}
	config.DB.Create(&menuItems)

	galleries := []models.Gallery{
		{Title: "Không gian nhà hàng", ImageURL: "gallery/khong-gian-nha-hang.jpg", Category: models.GalleryRestaurant, Featured: true, SortOrder: 1},
		{Title: "Phở Bò Tái đặc trưng", ImageURL: "gallery/pho-bo-tai-dac-trung.jpg", Category: models.GalleryFood, Featured: true, SortOrder: 2},
		{Title: "Bếp mở hiện đại", ImageURL: "gallery/bep-mo-hien-dai.jpg", Category: models.GalleryRestaurant, Featured: false, SortOrder: 3},
		{Title: "Tô phở đặc biệt", ImageURL: "gallery/to-pho-dac-biet.jpg", Category: models.GalleryFood, Featured: true, SortOrder: 4},
		{Title: "Sự kiện khai trương", ImageURL: "gallery/su-kien-khai-truong.jpg", Category: models.GalleryEvent, Featured: false, SortOrder: 5},
		{Title: "Góc chụp ảnh", ImageURL: "gallery/goc-chup-anh.jpg", Category: models.GalleryRestaurant, Featured: false, SortOrder: 6},
	}
	config.DB.Create(&galleries)

	settings := []models.Setting{
		{Key: "restaurant_name", Value: "Phở Cường"},
		{Key: "address", Value: "55 Nguyễn Trung Ngạn, Xã Ân Thi, Hưng Yên"},
		{Key: "phone", Value: "0915 177 568"},
		{Key: "open_time_morning", Value: "06:00"},
		{Key: "close_time_morning", Value: "14:00"},
		{Key: "open_time_evening", Value: "17:00"},
		{Key: "close_time_evening", Value: "21:00"},
		{Key: "facebook", Value: "https://facebook.com/phocuong"},
		{Key: "zalo", Value: "0915 177 568"},
	}
	config.DB.Create(&settings)

	log.Println("Seed data created successfully")
}
