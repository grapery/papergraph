package model

import "time"

// 订阅产品
// duration 单位为月，1=月付，12=年付
// price 单位为元
// name 如：月度订阅、年度订阅
type Product struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	Duration  int       `json:"duration"`
	CreatedAt time.Time `json:"created_at"`
}
