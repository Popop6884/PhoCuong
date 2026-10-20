package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleAdmin    Role = "admin"
	RoleStaff    Role = "staff"
	RoleCustomer Role = "customer"
)

type User struct {
	gorm.Model
	Name     string `gorm:"type:varchar(255);not null" json:"name"`
	Email    string `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Phone    string `gorm:"type:varchar(20)" json:"phone"`
	Password string `gorm:"type:varchar(255);not null" json:"-"`
	Role     Role   `gorm:"type:varchar(20);default:customer" json:"role"`
	Avatar   string `gorm:"type:varchar(500)" json:"avatar"`
	Active   bool   `gorm:"default:true" json:"active"`
}

type MenuCategory string

const (
	CategoryPho     MenuCategory = "pho"
	CategoryComTam  MenuCategory = "com_tam"
	CategoryDrink   MenuCategory = "drink"
	CategoryTopping MenuCategory = "topping"
)

type MenuItem struct {
	gorm.Model
	Name        string       `gorm:"not null" json:"name"`
	Description string       `json:"description"`
	Price       float64      `gorm:"not null" json:"price"`
	Category    MenuCategory `gorm:"not null" json:"category"`
	Image       string       `json:"image"`
	Available   bool         `gorm:"default:true" json:"available"`
	Featured    bool         `gorm:"default:false" json:"featured"`
	SortOrder   int          `gorm:"default:0" json:"sort_order"`
}

type ReservationStatus string

const (
	ReservationPending   ReservationStatus = "pending"
	ReservationConfirmed ReservationStatus = "confirmed"
	ReservationSeated    ReservationStatus = "seated"
	ReservationCompleted ReservationStatus = "completed"
	ReservationCancelled ReservationStatus = "cancelled"
)

type Reservation struct {
	gorm.Model
	CustomerID uint              `json:"customer_id"`
	Customer   User              `gorm:"foreignKey:CustomerID" json:"customer"`
	Date       time.Time         `gorm:"not null" json:"date"`
	TimeSlot   string            `gorm:"not null" json:"time_slot"`
	Guests     int               `gorm:"not null" json:"guests"`
	Status     ReservationStatus `gorm:"default:pending" json:"status"`
	Note       string            `json:"note"`
	StaffNote  string            `json:"staff_note"`
	HandledBy  *uint             `json:"handled_by"`
	Staff      *User             `gorm:"foreignKey:HandledBy" json:"staff,omitempty"`
}

type OrderStatus string

const (
	OrderPending   OrderStatus = "pending"
	OrderPreparing OrderStatus = "preparing"
	OrderReady     OrderStatus = "ready"
	OrderDelivered OrderStatus = "delivered"
	OrderCancelled OrderStatus = "cancelled"
)

type Order struct {
	gorm.Model
	CustomerID  uint        `json:"customer_id"`
	Customer    User        `gorm:"foreignKey:CustomerID" json:"customer"`
	Items       []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
	TotalAmount float64     `json:"total_amount"`
	Status      OrderStatus `gorm:"default:pending" json:"status"`
	Note        string      `json:"note"`
	TableNumber string      `json:"table_number"`
	HandledBy   *uint       `json:"handled_by"`
	Staff       *User       `gorm:"foreignKey:HandledBy" json:"staff,omitempty"`
}

type OrderItem struct {
	gorm.Model
	OrderID    uint     `json:"order_id"`
	MenuItemID uint     `json:"menu_item_id"`
	MenuItem   MenuItem `gorm:"foreignKey:MenuItemID" json:"menu_item"`
	Quantity   int      `gorm:"not null" json:"quantity"`
	Price      float64  `gorm:"not null" json:"price"`
	Note       string   `json:"note"`
}

type GalleryCategory string

const (
	GalleryRestaurant GalleryCategory = "restaurant"
	GalleryFood       GalleryCategory = "food"
	GalleryEvent      GalleryCategory = "event"
)

type Gallery struct {
	gorm.Model
	Title     string          `json:"title"`
	ImageURL  string          `gorm:"not null" json:"image_url"`
	Category  GalleryCategory `gorm:"default:food" json:"category"`
	Featured  bool            `gorm:"default:false" json:"featured"`
	SortOrder int             `gorm:"default:0" json:"sort_order"`
}

type Review struct {
	gorm.Model
	CustomerID uint   `json:"customer_id"`
	Customer   User   `gorm:"foreignKey:CustomerID" json:"customer"`
	OrderID    *uint  `json:"order_id"`
	Rating     int    `gorm:"not null" json:"rating"`
	Comment    string `json:"comment"`
	Approved   bool   `gorm:"default:false" json:"approved"`
}

type Setting struct {
	gorm.Model
	Key   string `gorm:"type:varchar(191);uniqueIndex;not null" json:"key"`
	Value string `json:"value"`
}
