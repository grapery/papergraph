package model

import "time"

// 支付记录
// pay_method: stripe, alipay
// status: success, failed

type PaymentRecord struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	ProductID uint      `json:"product_id"`
	Amount    float64   `json:"amount"`
	PayMethod string    `json:"pay_method"`
	PayTime   time.Time `json:"pay_time"`
	Status    string    `json:"status"`
	TradeNo   string    `json:"trade_no"`
}
