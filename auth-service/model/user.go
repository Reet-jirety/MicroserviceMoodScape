package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	FullName  string         `gorm:"column:full_name" json:"fullName"`
	ImageURL  string         `gorm:"column:image_url" json:"imageUrl"`
	ClerkID   string         `gorm:"column:clerk_id;uniqueIndex" json:"clerkId"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

var DB *gorm.DB

func (User) TableName() string {
	return "users"
}